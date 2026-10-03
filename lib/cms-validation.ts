import { record, textField, dateField } from "./crm-validation";
import type { Article } from "./articles";
import { serviceCatalog } from "./site";
export type CmsKind = "article" | "service";
export function validateContent(kind: CmsKind, slug: string, value: unknown) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) throw new Error("Адрес: только латинские буквы, цифры и дефис");
  const b = record(value);
  const image = textField(b.image, 300);
  if (image && !/^\/(?:images|brand)\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(image)) throw new Error("Выберите изображение из библиотеки сайта");
  const list = (v: unknown, max = 30) => {
    if (!Array.isArray(v) || v.length > max) throw new Error("Слишком длинный список");
    return v.map(x => textField(x, 4000, true));
  };
  if (kind === "service") {
    if (!image) throw new Error("Выберите изображение услуги");
    if (!Object.hasOwn(serviceCatalog, slug)) throw new Error("Услуга не найдена");
    return { name: textField(b.name, 180, true), eyebrow: textField(b.eyebrow, 100, true), description: textField(b.description, 2000, true), price: textField(b.price, 100, true), duration: textField(b.duration, 100, true), image, includes: list(b.includes), notIncluded: list(b.notIncluded) };
  }
  if (kind !== "article" || !Array.isArray(b.sections) || b.sections.length < 1 || b.sections.length > 30) throw new Error("Добавьте хотя бы один раздел статьи");
  const sections = b.sections.map(section => { const s = record(section); return { heading: textField(s.heading, 200, true), paragraphs: list(s.paragraphs), bullets: list(s.bullets || []) }; });
  const date = textField(b.publishedAt, 10, true);
  dateField(date);
  return { slug, title: textField(b.title, 180, true), seoTitle: textField(b.seoTitle, 200, true), description: textField(b.description, 400, true), excerpt: textField(b.excerpt, 800, true), category: textField(b.category, 100, true), publishedAt: date, modifiedAt: new Date().toISOString().slice(0,10), readTime: textField(b.readTime, 40, true), image, sections, relatedServices: list(b.relatedServices || [], 4).filter(x => Object.hasOwn(serviceCatalog, x)) } as Article;
}
export function safeJson(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
