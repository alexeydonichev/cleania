// LOCAL ONLY: start dev on :3004 with EMAIL_WEBHOOK_URL=http://127.0.0.1:3014.
// No external notification provider is contacted by this fixture.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
const base = "http://localhost:3004";
const db = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite";
const run = crypto.randomUUID();
const sql = query => execFileSync("sqlite3",[db,query],{encoding:"utf8"}).trim();
let notificationCalls = 0;
const server = createServer((req,res)=>{notificationCalls++;req.resume();res.writeHead(503);res.end("simulated outage");});
await new Promise(resolve=>server.listen(3014,"127.0.0.1",resolve));
async function send(path,body){const r=await fetch(base+path,{method:"POST",headers:{"content-type":"application/json","user-agent":`local-reliability-${run}`,origin:base},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};}
try {
  const cases = [
    ["callback","/api/callback-requests",{name:`Тест callback ${run}`,phone:"+79990000000",consent:true}],
    ["business","/api/business-leads",{name:`Тест business ${run}`,phone:"+79990000000",consent:"on",objectType:"Офис",area:100,schedule:"Разовая уборка"}],
    ["order","/api/orders",{name:`Тест order ${run}`,phone:"+79990000000",consent:true,service:"regular",propertyType:"apartment",condition:"normal",frequency:"once",area:50,bathrooms:1,extras:[]}],
  ];
  for(const [kind,path,payload] of cases){
    assert.equal((await send(path,null)).status,400,"malformed input");
    const body={...payload,requestId:crypto.randomUUID()};
    const responses=await Promise.all([send(path,body),send(path,body)]);
    assert.deepEqual(responses.map(r=>r.status).sort(),[200,201],`${kind} accepts one concurrent creation`);
    assert.deepEqual(responses[0].body,responses[1].body,`${kind} identical receipt`);
    const retry=await send(path,body);assert.equal(retry.status,200);assert.deepEqual(retry.body,responses[0].body);
    assert.equal((await send(path,{...body,name:"Changed payload"})).status,409,"key cannot be reused for different data");
    assert.equal(sql(`SELECT count(*) FROM public_submissions WHERE request_key='${kind}:${body.requestId}'`),"1");
    assert.equal(sql(`SELECT count(*) FROM leads WHERE name='${payload.name}'`),"1");
    const predicate=kind==="order"?`order_id IN (SELECT id FROM orders WHERE lead_id IN (SELECT id FROM leads WHERE name='${payload.name}'))`:`lead_id IN (SELECT id FROM leads WHERE name='${payload.name}')`;
    assert.equal(sql(`SELECT count(*) FROM integration_events WHERE ${predicate}`),"3");
    assert.equal(sql(`SELECT count(*) FROM integration_events WHERE ${predicate} AND channel='email' AND status='failed' AND attempts=1`),"1","failed delivery is durable and not retried by duplicate submission");
    assert.equal(sql(`SELECT count(*) FROM activities WHERE lead_id IN (SELECT id FROM leads WHERE name='${payload.name}')`),"1");
  }
  assert.equal(notificationCalls,3,"exactly one attempted notification per accepted submission");
  const rollbackKey=crypto.randomUUID();
  const trigger=`test_submission_${run.replaceAll("-","")}`;
  sql(`CREATE TRIGGER ${trigger} BEFORE INSERT ON leads WHEN NEW.name='Тест rollback ${run}' BEGIN SELECT RAISE(ABORT,'local test failure'); END;`);
  try {
    const failed=await send("/api/callback-requests",{requestId:rollbackKey,name:`Тест rollback ${run}`,phone:"+79990000000",consent:true});
    assert.equal(failed.status,500);
    assert.equal(sql(`SELECT count(*) FROM public_submissions WHERE request_key='callback:${rollbackKey}'`),"0","receipt rolls back with lead on storage failure");
  } finally { sql(`DROP TRIGGER ${trigger}`); }
  const login=await fetch(base+"/signin-with-chatgpt?return_to=%2Fcrm",{redirect:"manual"});
  const cookie=login.headers.get("set-cookie")?.split(";")[0];assert.ok(cookie);
  const workspace=await(await fetch(base+"/api/crm/workspace",{headers:{cookie}})).json();
  assert.ok(workspace.deliveries.some(item=>item.status==="failed"));
  assert.equal(JSON.stringify(workspace).includes("upload_token"),false);
  console.log(JSON.stringify({result:"PASS",run,checks:["three forms","simultaneous repeats","identical receipts","payload conflict","one lead and activity","one notification attempt","delivery failure visible","atomic rollback","CRM access"]}));
} finally { await new Promise(resolve=>server.close(resolve)); }
