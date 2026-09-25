import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { brandName, brandDomain, brandUrl, brandLogo, contactPhone, telegramUrl, validMaxProfileUrl, maxProfileUrl } from "../lib/brand.ts";

test("the public brand and IDN canonical refer to БлескПРО", () => {
  assert.equal(brandName, "БлескПРО");
  assert.equal(new URL(`https://${brandDomain}`).origin, brandUrl);
  assert.equal(brandUrl, "https://xn--90aipcrfhf.xn--p1ai");
});

test("Telegram resolves the supplied E.164 phone without sharing or sending a message", () => {
  assert.equal(contactPhone, "+79833216224");
  assert.equal(telegramUrl, "https://t.me/+79833216224");
  assert.equal(new URL(telegramUrl).search, "");
});

test("MAX only accepts an explicit HTTPS profile share link", () => {
  assert.equal(maxProfileUrl, "https://max.ru/u/f9LHodD0cOL_ChoX1ycy6SEeFgN0oJbvuJ9aBBIPjgGjX6vBrkJjUBuKpd0");
  assert.equal(validMaxProfileUrl("https://max.ru/u/example"), "https://max.ru/u/example");
  assert.equal(validMaxProfileUrl("https://max.me/example"), "https://max.me/example");
  for (const input of [undefined, "", "+79833216224", "https://max.ru", "javascript:alert(1)", "http://max.ru/u/example", "https://max.ru.evil.test/u/example", "https://user:secret@max.ru/u/example", "https://max.ru:8443/u/example"]) assert.equal(validMaxProfileUrl(input), null);
});

test("brand delivery variants have the advertised dimensions", async () => {
  const root = new URL("../public/", import.meta.url);
  for (const [path, width, height] of [[brandLogo.src.slice(1), brandLogo.width, brandLogo.height], ["brand/favicon-32.png", 32, 32], ["brand/favicon-64.png", 64, 64], ["brand/apple-touch-icon.png", 180, 180], ["brand/social-preview.png", 1200, 630]]) {
    const metadata = await sharp(new URL(path, root).pathname).metadata();
    assert.equal(metadata.width, width, path);
    assert.equal(metadata.height, height, path);
  }
});

test("the logo keeps the approved source pixels with only its outer margins removed", async () => {
  const source = new URL("../public/brand/bleskpro-approved.png", import.meta.url).pathname;
  const output = new URL(`../public${brandLogo.src}`, import.meta.url).pathname;
  const expected = await sharp(source).extract({ left: 168, top: 159, width: 1786, height: 406 }).raw().toBuffer();
  const actual = await sharp(output).raw().toBuffer();
  assert.deepEqual(actual, expected);
});
