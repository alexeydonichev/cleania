import assert from "node:assert/strict";

const base = process.argv[2] || "http://127.0.0.1:3001";
const paths = ["/", "/contacts", "/business", "/privacy", "/crm", "/services/regular-cleaning", "/services/deep-cleaning", "/services/after-renovation", "/services/window-cleaning"];
for (const path of paths) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /<title>[^<]*БлескПРО/, `${path}: page title`);
  assert.match(html, /src="\/brand\/bleskpro-logo-blue.webp"/, `${path}: blue logo`);
  const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visibleText, /cleania/i, `${path}: old visible brand`);
  assert.match(html, /name="robots" content="noindex/, `${path}: preview guard`);
  if (path !== "/crm") {
    assert.match(html, /href="https:\/\/t.me\/\+79833216224"/, `${path}: Telegram`);
    assert.ok(html.includes('href="https://max.ru/u/f9LHodD0cOL_ChoX1ycy6SEeFgN0oJbvuJ9aBBIPjgGjX6vBrkJjUBuKpd0"'), `${path}: supplied MAX profile`);
    assert.match(html, /href="tel:\+79833216224"/, `${path}: phone`);
    assert.match(html, /rel="canonical" href="https:\/\/xn--90aipcrfhf.xn--p1ai/, `${path}: IDN canonical`);
  }
  console.log(`Verified ${path}: brand, metadata, preview guard${path === "/crm" ? "" : ", contact links"}`);
}
for (const path of ["/brand/bleskpro-logo-blue.webp", "/brand/favicon-32-blue.png", "/brand/favicon-64-blue.png", "/brand/apple-touch-icon-blue.png", "/brand/social-preview-blue.png"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type") || "", /^image\//, path);
  console.log(`Verified asset ${path}`);
}
const sitemap = await fetch(new URL("/sitemap.xml", base)).then(r => r.text());
assert.match(sitemap, /https:\/\/xn--90aipcrfhf.xn--p1ai/);
assert.doesNotMatch(sitemap, /cleania|vercel\.app|chatgpt\.site/i);
const robots = await fetch(new URL("/robots.txt", base)).then(r => r.text());
assert.match(robots, /Disallow: \//);
console.log("Verified canonical sitemap and preview robots policy");
