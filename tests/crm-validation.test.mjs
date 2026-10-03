import test from "node:test";
import assert from "node:assert/strict";
import {numberField,dateField,textField,record,enumField} from "../lib/crm-validation.ts";
test("CRM rejects malformed money, dates and payloads",()=>{
  for(const v of [null,"",true,[],{},"NaN",Infinity,-1,10000001])assert.throws(()=>numberField(v));
  assert.equal(numberField("4800"),4800);
  for(const v of ["2026-02-31","2026-13-01","not-date"])assert.throws(()=>dateField(v));
  assert.equal(dateField("2026-10-03"),"2026-10-03");assert.equal(dateField(""),null);
  for(const v of [null,[],1,"x"])assert.throws(()=>record(v));
  assert.throws(()=>textField("a".repeat(101),100));assert.throws(()=>textField("",100,true));
  assert.throws(()=>enumField("owner",["new","closed"]));
});
