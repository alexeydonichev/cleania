// LOCAL ONLY. Run with the dev server at localhost:3004. Creates a synthetic order.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const base="http://localhost:3004";
const db=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite";
const sql=q=>execFileSync("sqlite3",[db,q],{encoding:"utf8"}).trim();
const r2=".wrangler/state/v3/r2/miniflare-R2BucketObject/49e6826fd41b4990fd0dd7b3ba19a3021a358ffb618ea1ab8f4454a592996ae7.sqlite";
const objectCount=()=>execFileSync("sqlite3",[r2,`SELECT count(*) FROM _mf_objects WHERE key LIKE 'orders/${id}/%'`],{encoding:"utf8"}).trim();
const id=crypto.randomUUID(),token=crypto.randomUUID(),order="TEST-FILES-"+id;
sql(`INSERT INTO leads(id,name,phone,consent_at,created_at,updated_at) VALUES('${id}','Тест фотографий','+79990000000',datetime('now'),datetime('now'),datetime('now'));
INSERT INTO orders(id,order_number,lead_id,service_type,area,estimate_total,duration_hours,crew_size,upload_token,created_at,updated_at)
VALUES('${id}','${order}','${id}','regular',50,4750,3,1,'${token}',datetime('now'),datetime('now'));`);
const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=","base64");
async function upload(n,{bad=false,auth=token}={}) {
  const form=new FormData();
  for(let i=0;i<n;i++) form.append("files",new Blob([bad&&i===n-1?"not a photo":png],{type:"image/png"}),i===0?"photo.html":"photo.png");
  const response=await fetch(base+"/api/orders/"+order+"/files",{method:"POST",headers:auth?{"x-upload-token":auth}:{},body:form});
  return {status:response.status,body:await response.json()};
}
assert.equal((await upload(1,{auth:""})).status,401);
assert.equal((await upload(1,{auth:"wrong"})).status,404);
assert.equal((await upload(2,{bad:true})).status,400);
assert.equal(sql(`SELECT count(*) FROM uploaded_files WHERE order_id='${id}'`),"0","invalid last file must leave no metadata");
assert.equal(objectCount(),"0","invalid batch must write no objects");
const trigger="test_upload_"+id.replaceAll("-","");
sql(`CREATE TRIGGER ${trigger} BEFORE INSERT ON uploaded_files WHEN NEW.order_id='${id}' BEGIN SELECT RAISE(ABORT,'local test failure'); END;`);
try {
  assert.equal((await upload(2)).status,500);
  assert.equal(objectCount(),"0","database failure must clean up uploaded objects");
  assert.equal(sql(`SELECT count(*) FROM uploaded_files WHERE order_id='${id}'`),"0");
} finally { sql(`DROP TRIGGER ${trigger}`); }
const results=await Promise.all([upload(5),upload(5),upload(5)]);
assert.deepEqual(results.map(r=>r.status).sort(),[201,201,409],"concurrent quota");
assert.equal(sql(`SELECT count(*) FROM uploaded_files WHERE order_id='${id}'`),"10");
assert.equal(objectCount(),"10","quota rejection must leave no orphan objects");
assert.equal(sql(`SELECT count(*) FROM uploaded_files WHERE order_id='${id}' AND object_key LIKE '%.png'`),"10");
const fileId=results.find(r=>r.status===201).body.files[0];
assert.equal((await fetch(base+"/api/crm/files/"+fileId)).status,403);
const login=await fetch(base+"/signin-with-chatgpt?return_to=%2Fcrm",{redirect:"manual"});
const cookie=login.headers.get("set-cookie")?.split(";")[0];assert.ok(cookie);
const image=await fetch(base+"/api/crm/files/"+fileId,{headers:{cookie}});
assert.equal(image.status,200);assert.equal(image.headers.get("cache-control"),"private, no-store");
assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);
console.log(JSON.stringify({result:"PASS",order,checks:["token required","wrong token rejected","whole-batch validation","database failure cleanup","concurrent quota","quota cleanup","trusted extension","CRM authorization","no-store","original file bytes"]}));
