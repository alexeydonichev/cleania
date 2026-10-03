import test from "node:test";
import assert from "node:assert/strict";
import {matchesCrmSearch,overdueOrder} from "../lib/crm-display.ts";
test("CRM search matches Russian names and differently formatted phones",()=>{
  assert.equal(matchesCrmSearch("Алёна +7 (983) 321-62-24","алена"),true);
  assert.equal(matchesCrmSearch("Алёна +7 (983) 321-62-24","89833216224"),true);
  assert.equal(matchesCrmSearch("Иван 89833216224","+7 (983) 321-62-24"),true);
  assert.equal(matchesCrmSearch("Иван 89833216224","3216224"),true);
  assert.equal(matchesCrmSearch("Иван 89833216224","Анна"),false);
  assert.equal(matchesCrmSearch("Иван 89833216224",""),true);
});
test("Schedule preserves overdue unfinished work without flagging completed or future work",()=>{
  const check=(date,status="scheduled")=>overdueOrder({preferred_date:date,status},"2026-10-03");
  assert.equal(check("2026-10-02"),true);
  for(const status of ["completed","cancelled"])assert.equal(check("2026-10-02",status),false);
  for(const date of [null,"2026-10-03","2026-10-04"])assert.equal(check(date),false);
});
