import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {workspaceWhere,workspaceQuery,crmPageSize} from "../lib/crm-query.ts";
test("server search reaches records beyond 500 and normalizes Russian and phone queries",()=>{
  const db=new DatabaseSync(":memory:");
  try{
    db.exec("CREATE TABLE leads(id TEXT,name TEXT,phone TEXT);CREATE TABLE orders(id TEXT,lead_id TEXT,status TEXT,order_number TEXT,address TEXT);");
    const insert=db.prepare("INSERT INTO leads VALUES(?,?,?)");
    for(let i=0;i<550;i++)insert.run(String(i),i===0?"Алёна":"Клиент "+i,i===0?"+7 (983) 321-62-24":"+79990000000");
    db.exec("INSERT INTO orders SELECT id,id,'new','CL-'||id,'Бердск' FROM leads");
    for(const query of ["АЛЕНА","алёна","89833216224","+7 (983) 321-62-24"]){
      const w=workspaceWhere({query},true);
      const rows=db.prepare("SELECT o.id FROM orders o JOIN leads l ON l.id=o.lead_id WHERE "+w.sql).all(...w.values);
      assert.deepEqual(rows.map(r=>r.id),["0"]);
    }
    const w=workspaceWhere({query:"' OR 1=1 --"},true);
    assert.equal(db.prepare("SELECT o.id FROM orders o JOIN leads l ON l.id=o.lead_id WHERE "+w.sql).all(...w.values).length,0);
    assert.equal(Math.ceil(550/crmPageSize),14);
  }finally{db.close();}
});
test("workspace query bounds input and only uses known filters",()=>{
  assert.deepEqual(workspaceQuery({view:"bad",filter:"bad",page:-5,query:"  x  "}),{view:"orders",filter:"all",page:1,query:"x"});
  assert.equal(workspaceQuery({query:"a".repeat(200)}).query.length,120);
  assert.match(workspaceWhere({view:"schedule"},true).sql,/NOT IN/);
  assert.match(workspaceWhere({view:"finance"},true).sql,/payment_status/);
});
