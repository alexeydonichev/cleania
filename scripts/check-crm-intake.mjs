// LOCAL ONLY. Uses the normal local sign-in, synthetic records, and local SQLite.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const base="http://localhost:3004";
const db=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite";
const sql=q=>execFileSync("sqlite3",[db,q],{encoding:"utf8"}).trim();
const login=await fetch(base+"/signin-with-chatgpt?return_to=%2Fcrm",{redirect:"manual"});
const cookie=login.headers.get("set-cookie")?.split(";")[0];assert.ok(cookie);
const id=crypto.randomUUID();
const payload={id,name:"Тест повторов CRM",phone:"+79990000000",city:"Новосибирск",source:"direct",notes:"Локальная проверка",consent:true};
async function send(body,authenticated=true) {
  const r=await fetch(base+"/api/crm/leads",{method:"POST",headers:{origin:base,"content-type":"application/json",...(authenticated?{cookie}:{})},body:JSON.stringify(body)});
  return {status:r.status,body:await r.json()};
}
assert.equal((await send(payload,false)).status,403);
assert.equal((await send({...payload,id:"------------------------------------"})).status,400);
const invalidPhone=await send({...payload,phone:"123"});
assert.equal(invalidPhone.status,400);
assert.equal(invalidPhone.body.error,"Введите полный российский номер: +7 (999) 123-45-67.");
const missingConsent=await send({...payload,consent:false});
assert.equal(missingConsent.status,400);
assert.equal(missingConsent.body.error,"Подтвердите согласие клиента на обработку контактов");
assert.equal(sql(`SELECT count(*) FROM leads WHERE id='${id}'`),"0","invalid intake cannot save a lead");
const attempts=await Promise.all([send(payload),send(payload),send(payload)]);
assert.deepEqual(attempts.map(a=>a.status).sort(),[200,200,201]);
for(const attempt of attempts) assert.deepEqual(attempt.body,{ok:true,id});
assert.equal(sql(`SELECT count(*) FROM leads WHERE id='${id}'`),"1");
assert.equal(sql(`SELECT count(*) FROM activities WHERE lead_id='${id}'`),"1");
assert.equal((await send({...payload,name:"Не должно сохраниться"})).status,409);
assert.equal(sql(`SELECT name FROM leads WHERE id='${id}'`),payload.name);
sql(`UPDATE leads SET notes='Изменено позже менеджером' WHERE id='${id}'`);
assert.equal((await send(payload)).status,200,"receipt remains valid after edits");
assert.equal(sql(`SELECT notes FROM leads WHERE id='${id}'`),"Изменено позже менеджером","retry cannot overwrite later edits");
const rollback=crypto.randomUUID();
const trigger="test_intake_"+rollback.replaceAll("-","");
sql(`CREATE TRIGGER ${trigger} BEFORE INSERT ON activities WHEN NEW.lead_id='${rollback}' BEGIN SELECT RAISE(ABORT,'local test failure'); END;`);
try {
  assert.equal((await send({...payload,id:rollback})).status,500);
  assert.equal(sql(`SELECT count(*) FROM leads WHERE id='${rollback}'`),"0");
  assert.equal(sql(`SELECT count(*) FROM public_submissions WHERE request_key='crm-lead:${rollback}'`),"0");
} finally { sql(`DROP TRIGGER ${trigger}`); }
assert.equal((await send({...payload,id:rollback})).status,201,"failed transaction can be retried");
const legacy=crypto.randomUUID();
sql(`INSERT INTO leads(id,name,phone,consent_at,created_at,updated_at) VALUES('${legacy}','Тест старой записи','+79990000000',datetime('now'),datetime('now'),datetime('now'))`);
assert.equal((await send({...payload,id:legacy})).status,409,"old rows must not give false success");
console.log(JSON.stringify({result:"PASS",id,checks:["authorization","UUID validation","three concurrent saves","one activity","changed retry conflict","receipt survives later edits","transaction rollback","retry after failure","legacy conflict"]}));
