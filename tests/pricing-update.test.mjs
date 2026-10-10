import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { pricingUpdateStatement, validatePricingUpdates } from "../lib/pricing-update.ts";

test("pricing update is atomic and rejects a stale version without changing any rate", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("CREATE TABLE pricing_rules(key TEXT PRIMARY KEY, rate INTEGER, minimum INTEGER, updated_at TEXT); INSERT INTO pricing_rules VALUES ('regular',95,2490,'v1'),('deep',160,4490,'v1')");
    const rules = [{key:"regular",rate:100,minimum:2500,version:"v1"},{key:"deep",rate:170,minimum:4500,version:"v1"}];
    const apply = (rules, version) => {const s=pricingUpdateStatement(validatePricingUpdates(rules),version);return db.prepare(s.sql).run(...s.values).changes;};
    assert.equal(apply(rules,"v2"),2);
    assert.equal(apply(rules,"v3"),0);
    assert.equal(apply(rules.map((r,i)=>({...r,rate:999,version:i?"v1":"v2"})),"v4"),0);
    assert.deepEqual(db.prepare("SELECT rate FROM pricing_rules ORDER BY key").all().map(r=>r.rate),[170,100]);
    assert.equal(apply(rules.map(r=>({...r,version:"v2"})),"v5"),2);
  } finally {db.close();}
});
test("pricing requires bounded integer amounts, unique known keys and versions", () => {
  const rule={key:"regular",rate:95,minimum:2490,version:"v1"};
  for(const input of [[],[rule,rule],[{...rule,version:undefined}],[{...rule,rate:1.5}],[{...rule,minimum:"2490"}],[{...rule,key:"other"}]]) assert.throws(()=>validatePricingUpdates(input));
});
