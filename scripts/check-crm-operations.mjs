// LOCAL ONLY. Exercises normal APIs with synthetic records. Restores pricing
// even on failure; never accepts a remote target or production credentials.
import assert from "node:assert/strict";
import { calculateQuote } from "../lib/quote.ts";
const base="http://localhost:3004";
const login=await fetch(base+"/signin-with-chatgpt?return_to=%2Fcrm",{redirect:"manual"});
const cookie=login.headers.get("set-cookie")?.split(";")[0];assert.ok(cookie);
async function call(route,method="GET",body){
  const response=await fetch(base+route,{method,headers:{cookie,...(body?{origin:base,"content-type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,data:await response.json()};
}
async function workspace(){const r=await call("/api/crm/workspace");assert.equal(r.status,200);return r.data;}
const initial=await workspace();
const originalRules=initial.pricing.map(({key,rate,minimum})=>({key,rate,minimum}));
assert.equal(originalRules.length,4);
const originalTotals=initial.orders.map(({id,estimate_total,final_total})=>({id,estimate_total,final_total}));
try {
  const rules=originalRules.map(r=>r.key==="regular"?{...r,rate:137,minimum:6100}:r);
  assert.equal((await call("/api/crm/pricing","PATCH",{rules})).status,200);
  const current=await workspace();
  assert.deepEqual(current.orders.map(({id,estimate_total,final_total})=>({id,estimate_total,final_total})),originalTotals,"tariff edit cannot recalculate saved orders");
  const publicPricing=await(await fetch(base+"/api/pricing",{cache:"no-store"})).json();
  assert.equal(publicPricing.mode,undefined,"must test live local DB, not preview constants");
  const rule=publicPricing.rules.find(r=>r.key==="regular");
  assert.equal(rule.rate,137);assert.equal(rule.minimum,6100);
  const quote=calculateQuote({propertyType:"apartment",service:"regular",area:50,bathrooms:1,condition:"normal",frequency:"once",extras:[]},rule);
  assert.equal(quote.total,6850);
  assert.equal((await call("/api/crm/pricing","PATCH",{rules:[{key:"regular",rate:0,minimum:6100}]})).status,400);
  assert.equal((await workspace()).pricing.find(r=>r.key==="regular").rate,137);
} finally {
  assert.equal((await call("/api/crm/pricing","PATCH",{rules:originalRules})).status,200,"restore local pricing");
}
const restored=(await workspace()).pricing.map(({key,rate,minimum})=>({key,rate,minimum}));
assert.deepEqual(restored,originalRules);

const crew=await call("/api/crm/crews","POST",{name:"Тест назначения исполнителя",phone:"+79990000000",capacityHours:8});
assert.equal(crew.status,201);const crewId=crew.data.crew.id;
const leadId=crypto.randomUUID();
assert.equal((await call("/api/crm/leads","POST",{id:leadId,name:"Тест расписания",phone:"+79990000000",city:"Бердск",notes:"Локальная проверка",source:"direct",consent:true})).status,201);
assert.equal((await call(`/api/crm/leads/${leadId}`,"POST",{service:"regular",area:50,total:4750,date:"2026-10-05",address:"Тестовый адрес"})).status,201);
let order=(await workspace()).orders.find(o=>o.lead_id===leadId);assert.ok(order);
const update={status:"scheduled",paymentStatus:"unpaid",date:"2026-10-05",slot:"10:00",address:"Тестовый адрес",crew:crewId,finalTotal:4750,cleanerCost:0,suppliesCost:0,acquisitionCost:0,otherCost:0,note:"Локальное назначение"};
assert.equal((await call(`/api/crm/orders/${order.id}`,"PATCH",{...update,crew:"",version:order.updated_at})).status,400,"assignment requires crew");
assert.equal((await call(`/api/crm/orders/${order.id}`,"PATCH",{...update,date:"",version:order.updated_at})).status,400,"assignment requires date");
assert.equal((await call(`/api/crm/orders/${order.id}`,"PATCH",{...update,version:order.updated_at})).status,200);
const deactivate={name:"Тест назначения исполнителя",phone:"+79990000000",status:"inactive",capacityHours:8};
assert.equal((await call(`/api/crm/crews/${crewId}`,"PATCH",deactivate)).status,409,"cannot disable assigned crew");
assert.equal((await workspace()).crews.find(c=>c.id===crewId).status,"active");
order=(await workspace()).orders.find(o=>o.id===order.id);
assert.equal((await call(`/api/crm/orders/${order.id}`,"PATCH",{...update,status:"completed",version:order.updated_at})).status,200);
assert.equal((await call(`/api/crm/crews/${crewId}`,"PATCH",deactivate)).status,200);
order=(await workspace()).orders.find(o=>o.id===order.id);
assert.equal((await call(`/api/crm/orders/${order.id}`,"PATCH",{...update,version:order.updated_at})).status,400,"cannot assign inactive crew");
console.log(JSON.stringify({result:"PASS",pricingRestored:true,leadId,orderId:order.id,crewId,checks:["public pricing reflects edits","quote uses live rule","saved totals unchanged","invalid pricing rejected","required assignment fields","assigned crew protected","completed work releases crew","inactive crew rejected"]}));
