import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { brandName, brandDomain, brandUrl, brandLogo, contactPhone, telegramUrl, telegramDraftUrl, maxDraftUrl, validMaxProfileUrl, maxProfileUrl } from "../lib/brand.ts";

test("the public brand and IDN canonical refer to БлескПРО", () => {
  assert.equal(brandName, "БлескПРО");
  assert.equal(new URL(`https://${brandDomain}`).origin, brandUrl);
  assert.equal(brandUrl, "https://xn--90aipcrfhf.xn--p1ai");
});

test("Telegram resolves the supplied E.164 phone without sharing or sending a message", () => {
  assert.equal(contactPhone, "+79833216224");
  assert.equal(telegramUrl, "https://t.me/+79833216224");
  assert.equal(new URL(telegramUrl).search, "");
});

test("MAX only accepts an explicit HTTPS profile share link", () => {
  assert.equal(maxProfileUrl, "https://max.ru/u/f9LHodD0cOL_ChoX1ycy6SEeFgN0oJbvuJ9aBBIPjgGjX6vBrkJjUBuKpd0");
  assert.equal(validMaxProfileUrl("https://max.ru/u/example"), "https://max.ru/u/example");
  assert.equal(validMaxProfileUrl("https://max.me/example"), "https://max.me/example");
  for (const input of [undefined, "", "+79833216224", "https://max.ru", "javascript:alert(1)", "http://max.ru/u/example", "https://max.ru.evil.test/u/example", "https://user:secret@max.ru/u/example", "https://max.ru:8443/u/example"]) assert.equal(validMaxProfileUrl(input), null);
});

test("messenger draft links encode the entire receipt without losing Cyrillic or newlines", () => {
  const receipt = 'БлескПРО · Дом · 1150 м²\nДоплаты +18% & окна × 2\nИтого: 129 500 ₽';
  const telegram = new URL(telegramDraftUrl(receipt));
  const max = new URL(maxDraftUrl(receipt));
  assert.equal(telegram.origin + telegram.pathname, telegramUrl);
  assert.equal(max.origin + max.pathname, 'https://max.ru/:share');
  for (const url of [telegram,max]) {
    assert.equal(url.searchParams.get('text'), receipt);
    assert.equal([...url.searchParams.keys()].length, 1);
  }
});

test("brand delivery variants have the advertised dimensions", async () => {
  const root = new URL("../public/", import.meta.url);
  for (const [path, width, height] of [[brandLogo.src.slice(1), brandLogo.width, brandLogo.height], ["brand/favicon-32-blue.png", 32, 32], ["brand/favicon-64-blue.png", 64, 64], ["brand/apple-touch-icon-blue.png", 180, 180], ["brand/social-preview-blue.png", 1200, 630]]) {
    const metadata = await sharp(new URL(path, root).pathname).metadata();
    assert.equal(metadata.width, width, path);
    assert.equal(metadata.height, height, path);
  }
});

test("the delivered logo matches the generated blue source crop and resize", async () => {
  const source = new URL("../public/brand/bleskpro-blue-source.png", import.meta.url).pathname;
  const output = new URL(`../public${brandLogo.src}`, import.meta.url).pathname;
  const expected = await sharp(source).extract({ left: 0, top: 115, width: 2170, height: 493 }).resize(1786, 406, { fit: "contain", background: "white" }).raw().toBuffer();
  const actual = await sharp(output).raw().toBuffer();
  assert.deepEqual(actual, expected);
});

test("the ПРО accent is royal blue rather than the previous turquoise", async () => {
  const { data, info } = await sharp(new URL(`../public${brandLogo.src}`, import.meta.url).pathname).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let count = 0, green = 0, blue = 0;
  for (let y = 0; y < info.height; y++) for (let x = 1280; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    if (data[i] < 160 && data[i + 2] > data[i] + 60) {
      count++; green += data[i + 1]; blue += data[i + 2];
    }
  }
  assert.ok(count > 20000, "the accent contains substantial coloured lettering");
  assert.ok(blue > 2 * green, "blue, not cyan, dominates the accent");
});
