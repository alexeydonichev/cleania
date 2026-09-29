import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAttribution, attributionNote } from "../lib/attribution.ts";
test("attribution accepts campaign labels but excludes contact data and arbitrary keys", () => {
  assert.deepEqual(sanitizeAttribution({ utm_source: "yandex", utm_campaign: "berdsk-cleaning", phone: "+79833216224", token: "secret", utm_term: "a@example.com", utm_content: "https://x.test/?secret=yes" }), { utm_source: "yandex", utm_campaign: "berdsk-cleaning" });
  assert.deepEqual(sanitizeAttribution(null), {});
  assert.deepEqual(sanitizeAttribution(["yandex"]), {});
  assert.deepEqual(sanitizeAttribution({ utm_source: "x".repeat(101) }), {});
  assert.equal(attributionNote({ phone: "private" }), "");
  assert.match(attributionNote({ utm_source: "2gis" }), /2gis/);
});
