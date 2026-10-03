// LOCAL ONLY: normal development sign-in; only the synthetic seedy role is
// temporarily changed and always restored. Invalid payloads cannot write data.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const base="http://localhost:3004";
const db=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite";
const sql=q=>execFileSync("sqlite3",[db,q],{encoding:"utf8"}).trim();
const original=sql("SELECT role FROM crm_users WHERE email='seedy@sites.test'");
assert.equal(original,"owner","requires the standard synthetic local owner");
const login=await fetch(base+"/signin-with-chatgpt?return_to=%2Fcrm",{redirect:"manual"});
const cookie=login.headers.get("set-cookie")?.split(";")[0];assert.ok(cookie);
const mutations=[
  ["/api/crm/leads","POST"],["/api/crm/leads/local-access-test","PATCH"],
  ["/api/crm/leads/local-access-test","POST"],["/api/crm/orders/local-access-test","PATCH"],
  ["/api/crm/crews","POST"],["/api/crm/crews/local-access-test","PATCH"],
  ["/api/crm/pricing","PATCH"],["/api/crm/content","POST"],
];
const failures=[];let checks=0;
async function check(path,method,expected,{auth=true,origin=base}={}) {
  const r=await fetch(base+path,{method,headers:{...(auth?{cookie}:{}),...(method!=="GET"?{"content-type":"application/json",...(origin?{origin}:{})}:{})},...(method!=="GET"?{body:"{}"}:{})});
  checks++;if(r.status!==expected)failures.push(`${method} ${path}: expected ${expected}, got ${r.status}`);
  await r.text();
}
try {
  for(const [path,method] of mutations) {
    await check(path,method,403,{auth:false});
    await check(path,method,403,{origin:"https://example.org"});
    await check(path,method,403,{origin:null});
    const missingRecord=(path==="/api/crm/leads/local-access-test"&&method==="POST")||path==="/api/crm/orders/local-access-test";
    await check(path,method,missingRecord?404:400);
  }
  sql("UPDATE crm_users SET role='manager' WHERE email='seedy@sites.test'");
  await check("/api/crm/workspace","GET",200);
  await check("/api/crm/content","GET",403);
  await check("/api/crm/content","POST",403);
  await check("/api/crm/pricing","PATCH",403);
  await check("/api/crm/leads","POST",400);
  await check("/api/crm/crews","POST",400);
  const managerPage=await(await fetch(base+"/crm",{headers:{cookie}})).text();
  assert.equal(/<button[^>]*>Тарифы<\/button>/.test(managerPage),false,"manager must not see tariff editor");
  sql("UPDATE crm_users SET role='disabled-test' WHERE email='seedy@sites.test'");
  await check("/api/crm/workspace","GET",403);
  await check("/api/crm/content","GET",403);
  for(const [path,method] of mutations)await check(path,method,403);
} finally {
  sql("UPDATE crm_users SET role='owner' WHERE email='seedy@sites.test'");
}
assert.equal(sql("SELECT role FROM crm_users WHERE email='seedy@sites.test'"),original);
const ownerPage=await(await fetch(base+"/crm",{headers:{cookie}})).text();
assert.ok(/<button[^>]*>Тарифы<\/button>/.test(ownerPage),"owner keeps tariff editor");
console.log(JSON.stringify({checks,failures,roleRestored:true}));
assert.deepEqual(failures,[]);
