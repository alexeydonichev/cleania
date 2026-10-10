import test from "node:test";
import assert from "node:assert/strict";
import { readRecovery, recoveryKey } from "../lib/cms-recovery.ts";
test("CMS recovery is account scoped and validates a recoverable article",()=>{
  assert.notEqual(recoveryKey("owner-a","article:x"),recoveryKey("owner-b","article:x"));
  const draft={id:"article:x",version:2,savedAt:new Date().toISOString(),content:{title:"Незаконченный текст",sections:[{heading:"",paragraphs:["Текст"],bullets:[]}]}};
  assert.deepEqual(readRecovery(JSON.stringify(draft),draft.id),draft);
  assert.equal(readRecovery(JSON.stringify(draft),"article:y"),null);
  assert.equal(readRecovery("broken",draft.id),null);
  assert.equal(readRecovery(JSON.stringify({...draft,savedAt:"2000-01-01"}),draft.id),null);
  assert.equal(readRecovery(JSON.stringify({...draft,content:{sections:[{heading:"x",paragraphs:"broken"}]}}),draft.id),null);
});
