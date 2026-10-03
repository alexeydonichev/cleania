import test from "node:test";
import assert from "node:assert/strict";
import { photoExtension, readUploadForm, MAX_UPLOAD_BYTES } from "../lib/upload-validation.ts";
test("Image signatures must match declared format", () => {
  assert.equal(photoExtension(new Uint8Array([255,216,255]), "image/jpeg"), "jpg");
  assert.equal(photoExtension(Buffer.from("89504e470d0a1a0a", "hex"), "image/png"), "png");
  assert.equal(photoExtension(Buffer.from("RIFFxxxxWEBP"), "image/webp"), "webp");
  const heic = Buffer.from("000000186674797068656963000000006d69663168656963", "hex");
  assert.equal(photoExtension(heic,"image/heic"), "heic");
  assert.equal(photoExtension(Buffer.from("000000186674797061766966000000006d69663161766966","hex"),"image/heic"),null);
  for (const mime of ["image/png","image/jpeg","image/webp","image/heic","image/svg+xml"]) {
    assert.equal(photoExtension(Buffer.from("<html>not an image</html>"),mime),null);
    assert.equal(photoExtension(new Uint8Array(),mime),null);
  }
});
test("Multipart input is bounded even without Content-Length", async () => {
  let remaining=MAX_UPLOAD_BYTES+1;
  const stream = new ReadableStream({pull(c) { const n=Math.min(remaining,65536); if(!n){c.close();return;} remaining-=n;c.enqueue(new Uint8Array(n)); }});
  const request = new Request("http://localhost/upload",{method:"POST",headers:{"content-type":"multipart/form-data; boundary=test"},body:stream,duplex:"half"});
  await assert.rejects(readUploadForm(request), error=>error.status===413);
});
test("Malformed multipart and empty bodies are recoverable client errors", async () => {
  await assert.rejects(readUploadForm(new Request("http://localhost")),e=>e.status===400);
  await assert.rejects(readUploadForm(new Request("http://localhost",{method:"POST",body:"bad"})),e=>e.status===400);
});
