import test from "node:test";
import assert from "node:assert/strict";
import { submissionPayload } from "../lib/submission-client.ts";

test("Retries keep their key, changed or completed submissions get a new key",()=>{
  const ref={current:null};
  const original={name:"Тест",phone:"+79990000000",consent:true};
  const first=submissionPayload(ref,original);
  assert.equal(submissionPayload(ref,{...original}).requestId,first.requestId);
  assert.notEqual(submissionPayload(ref,{...original,name:"Другой"}).requestId,first.requestId);
  ref.current=null;
  assert.notEqual(submissionPayload(ref,original).requestId,first.requestId);
  assert.equal(original.requestId,undefined);
});
