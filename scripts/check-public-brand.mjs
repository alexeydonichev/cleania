import assert from "node:assert/strict";

const base = process.argv[2] || "http://127.0.0.1:3001";
const expectPreview = process.env.EXPECT_PREVIEW === "1";
const alwaysNoindex = new Set(["/privacy", "/crm"]);
const paths = ["/", "/contacts", "/business", "/privacy", "/articles", "/articles/chto-vhodit-v-generalnuyu-uborku", "/services/regular-cleaning", "/services/deep-cleaning", "/services/after-renovation", "/services/window-cleaning", ...(process.env.CHECK_CRM === "1" ? ["/crm"] : [])];
for (const path of paths) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /<title>[^<]*БлескПРО/, `${path}: page title`);
  assert.match(html, /src="\/brand\/bleskpro-logo-blue-640.webp"/, `${path}: compact blue logo`);
  const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visibleText, /cleania/i, `${path}: old visible brand`);
  const shouldNoindex = expectPreview || alwaysNoindex.has(path);
  assert.match(
    html,
    shouldNoindex ? /name="robots" content="noindex/ : /name="robots" content="index, follow"/,
    `${path}: indexing mode`,
  );
  if (path !== "/crm") {
    assert.match(html, /href="https:\/\/t.me\/\+79833216224"/, `${path}: Telegram`);
    assert.ok(html.includes('href="https://max.ru/u/f9LHodD0cOL_ChoX1ycy6SEeFgN0oJbvuJ9aBBIPjgGjX6vBrkJjUBuKpd0"'), `${path}: supplied MAX profile`);
    assert.match(html, /href="tel:\+79833216224"/, `${path}: phone`);
    assert.match(html, /rel="canonical" href="https:\/\/xn--90aipcrfhf.xn--p1ai/, `${path}: IDN canonical`);
  }
  console.log(`Verified ${path}: brand, metadata, ${shouldNoindex ? "noindex" : "live indexing"}${path === "/crm" ? "" : ", contact links"}`);
}
for (const path of ["/brand/bleskpro-logo-blue-640.webp", "/brand/bleskpro-logo-blue.webp", "/brand/favicon-32-blue.png", "/brand/favicon-64-blue.png", "/brand/apple-touch-icon-blue.png", "/brand/social-preview-blue.png"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type") || "", /^image\//, path);
  console.log(`Verified asset ${path}`);
}
const missing = await fetch(new URL("/definitely-not-a-page", base));
assert.equal(missing.status, 404, "404 status");
const missingHtml = await missing.text();
assert.match(missingHtml, /name="robots" content="noindex, nofollow"/, "404 noindex");
assert.doesNotMatch(missingHtml, /rel="canonical"/, "404 has no canonical");
console.log("Verified 404 indexing guard");
const sitemap = await fetch(new URL("/sitemap.xml", base)).then(r => r.text());
assert.match(sitemap, /https:\/\/xn--90aipcrfhf.xn--p1ai/);
assert.doesNotMatch(sitemap, /cleania|vercel\.app|chatgpt\.site/i);
const robots = await fetch(new URL("/robots.txt", base)).then(r => r.text());
assert.match(robots, expectPreview ? /Disallow: \// : /Allow: \//);
console.log(`Verified canonical sitemap and ${expectPreview ? "preview" : "live"} robots policy`);
