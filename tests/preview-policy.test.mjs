import test from "node:test";
import assert from "node:assert/strict";
import { previewApiAllowed } from "../lib/preview-policy.ts";

test("presentation deployment permits only the public pricing GET", () => {
  assert.equal(previewApiAllowed("/api/pricing", "GET"), true);
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]) {
    assert.equal(previewApiAllowed("/api/pricing", method), false);
  }
});

test("orders, uploads and CRM endpoints fail closed in presentation mode", () => {
  for (const path of ["/api/orders", "/api/orders/CL-test/files", "/api/business-leads", "/api/crm/pricing", "/api/crm/crews", "/api/crm/files/test", "/api/pricing/", "/api/pricing/../orders"]) {
    for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
      assert.equal(previewApiAllowed(path, method), false, `${method} ${path}`);
    }
  }
});
