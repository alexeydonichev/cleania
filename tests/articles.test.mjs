import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { articles } from "../lib/articles.ts";

const serviceSlugs = new Set([
  "regular-cleaning",
  "deep-cleaning",
  "after-renovation",
  "window-cleaning",
]);

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the editorial catalogue has substantive, unique local guides", () => {
  assert.ok(articles.length >= 7);
  assert.equal(new Set(articles.map((article) => article.slug)).size, articles.length);

  for (const article of articles) {
    assert.match(article.slug, /^[a-z0-9-]+$/);
    assert.ok(article.title.length >= 25, article.slug);
    assert.ok(article.description.length >= 90, article.slug);
    assert.ok(article.sections.length >= 4, article.slug);
    assert.ok(article.sections.every((section) => section.paragraphs.length > 0), article.slug);
    assert.ok(article.relatedServices.every((service) => serviceSlugs.has(service)), article.slug);
  }
});

test("articles are linked from navigation, home, and the sitemap", () => {
  const chrome = read("app/components/SiteChrome.tsx");
  const home = read("app/page.tsx");
  const sitemap = read("app/sitemap.ts");

  assert.match(chrome, /href="\/articles"/);
  assert.match(home, /article-grid article-grid-home/);
  assert.match(sitemap, /url: `\$\{siteUrl\}\/articles`/);
  assert.match(sitemap, /articles\.map/);
});

test("the article detail route publishes canonical metadata and readable schema", () => {
  const source = read("app/articles/[slug]/page.tsx");
  assert.match(source, /alternates: \{ canonical: path \}/);
  assert.match(source, /"@type": "BlogPosting"/);
  assert.match(source, /"@type": "BreadcrumbList"/);
  assert.match(source, /inLanguage: "ru-RU"/);
});

test("home FAQ has the original questions plus seven useful answers", () => {
  const source = read("app/page.tsx");
  for (const question of [
    "Что входит в поддерживающую уборку?",
    "Чем генеральная уборка отличается от поддерживающей?",
    "Что входит в уборку после ремонта?",
    "Сколько времени занимает уборка квартиры?",
    "Можно ли заказать уборку в день обращения?",
    "Можно ли заказать уборку дома или коттеджа?",
    "Какие средства и инвентарь привозит команда?",
  ]) {
    assert.match(source, new RegExp(question.replace(/[?]/g, "\\?")));
  }
});
