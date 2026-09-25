import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('public sections and cards do not reintroduce decorative numbering', () => {
  for (const path of ['app/page.tsx', 'app/components/HeroShowcase.tsx',
    'app/components/CleaningDetails.tsx', 'app/components/CleaningProcess.tsx',
    'app/components/BeforeAfter.tsx', 'app/business/page.tsx', 'app/contacts/page.tsx']) {
    assert.doesNotMatch(read(path), />0\d\s*\/|<(?:b|span)>0\d<\/|>0\{\w+\s*\+\s*1\}|className="process-number"/, path);
  }
});

test('calculator keeps named accessible steps without numeric badges', () => {
  const source = read('app/components/OrderCalculator.tsx');
  assert.doesNotMatch(source, /Шаг \d из \d|<span>\{i < step/);
  assert.match(source, /aria-current=\{step === i \? "step" : undefined\}/);
  assert.match(source, /<b>\{label\}<\/b>/);
  assert.match(source, /id="area-number" type="number"/);
  assert.match(source, /success\.order/);
});

test('all five requested section headlines omit forced line breaks', () => {
  const source = ['app/page.tsx', 'app/components/CleaningProcess.tsx', 'app/components/BeforeAfter.tsx'].map(read).join('\n');
  for (const phrase of ['Чистота бывает разной.', 'Ваша уборка.', 'Что именно', 'Хорошая уборка.', 'До уборки.']) {
    assert.ok(source.includes(`${phrase} <span>`), phrase);
  }
  assert.doesNotMatch(read('app/components/BeforeAfter.tsx'), /className="compare-demo"|className="case-disclosure"/);
  assert.match(source, /Демонстрационные примеры/);
});

test('quote dropdowns use a shared accessible portalled select', () => {
  for (const file of ['app/components/HeroShowcase.tsx', 'app/components/OrderCalculator.tsx']) {
    assert.doesNotMatch(read(file), /<select[\s>]/, file);
    assert.match(read(file), /<SoftSelect/);
  }
  const select = read('app/components/SoftSelect.tsx');
  assert.match(select, /@radix-ui\/react-select/);
  assert.match(select, /Select\.Portal/);
  assert.match(select, /collisionPadding=\{12\}/);
  assert.match(select, /aria-label=\{label\}/);
  assert.match(select, /disabled=\{disabled\}/);
});

test('messenger colors are retained inside the monochrome calculator', () => {
  for (const file of ['app/brand.css', 'app/calculator-theme.css']) {
    assert.match(read(file), /\.contact-telegram \{ background: #229ed9;/);
    assert.match(read(file), /\.contact-max \{ background: #471aff;/);
  }
});

test('process photographs have no overlaid AI badges', () => {
  assert.doesNotMatch(read('app/components/CleaningProcess.tsx'), /<span>Иллюстрация|Иллюстрация · ИИ/);
  assert.doesNotMatch(read('app/cases.css'), /\.process-photo > span/);
});

test('demo quote can be copied without enabling order submission', () => {
  const source = read('app/components/OrderCalculator.tsx');
  assert.match(source, /if \(isPreviewDeployment\) return;/);
  assert.match(source, /navigator.clipboard.writeText\(quoteText\)/);
  assert.match(source, /Скопировать расчёт/);
  assert.match(source, /textarea id="quote-message" readOnly/);
  assert.match(source, /pricingStatus === "loading"/);
  assert.match(source, /quote-share-card/);
  assert.match(source, /messageFallback/);
  assert.match(source, /ContactLinks showPhone=\{false\} message=\{quoteText\}/);
  assert.match(source, /Тарифы сейчас не загрузились/);
});

test('native public links avoid the known Vinext client-link crash', () => {
  for (const path of [
    'app/page.tsx', 'app/not-found.tsx', 'app/components/SiteChrome.tsx',
    'app/components/ArticleCard.tsx', 'app/components/CleaningDetails.tsx',
    'app/components/OrderCalculator.tsx', 'app/components/BusinessBrief.tsx',
    'app/articles/[slug]/page.tsx', 'app/services/[slug]/page.tsx',
    'app/contacts/page.tsx', 'app/crm/page.tsx', 'app/components/CrmDashboard.tsx',
  ]) assert.doesNotMatch(read(path), /next\/link|<Link\b/, path);
});

test('the home is static and applies an optional calculator service after hydration', () => {
  assert.doesNotMatch(read('app/page.tsx'), /searchParams/);
  const booking = read('app/components/BookingProvider.tsx');
  assert.match(booking, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(booking, /input\.service !== requestedService/);
  assert.match(booking, /const serviceFromUrlApplied = useRef\(false\)/);
  assert.match(booking, /if \(serviceFromUrlApplied\.current\) return;/);
  assert.match(booking, /serviceFromUrlApplied\.current = true;/);
  assert.match(booking, /window\.setTimeout\(\(\) => \{ serviceFromUrlApplied\.current = true; \}, 0\)/);
  assert.match(booking, /next\.propertyType === "commercial" \|\| next\.propertyType === "industrial"/);
  assert.match(booking, /next\.service = "office"/);
});

test('direct-messenger fallbacks preserve a completed business brief and accessible errors', () => {
  const business = read('app/components/BusinessBrief.tsx');
  assert.match(business, /response\.status === 503/);
  assert.match(business, /Контакт: \$\{String\(payload\.name/);
  assert.match(business, /ContactLinks showPhone=\{false\} message=\{messengerFallback\}/);
  assert.match(business, /role=\{state === "error" \? "alert" : "status"\}/);
});

test('404 pages suppress indexing and preserve a compact recovery path', () => {
  const source = read('app/not-found.tsx');
  assert.match(source, /canonical: null/);
  assert.match(source, /index: false, follow: false/);
  assert.match(source, /className="not-found-actions"/);
  assert.match(read('app/cleania.css'), /\.not-found-actions/);
});

test('the sitemap only lists indexable public pages and CRM can expose its noindex directive', () => {
  const sitemap = read('app/sitemap.ts');
  const robots = read('app/robots.ts');
  assert.doesNotMatch(sitemap, /\$\{siteUrl\}\/privacy/);
  assert.doesNotMatch(robots, /disallow: \["\/crm"/);
  assert.match(read('app/crm/page.tsx'), /index: false, follow: false/);
});

test('CRM stores the selected object type alongside the service', () => {
  const api = read('app/api/orders/route.ts');
  assert.match(api, /requestedPropertyType/);
  assert.match(api, /Объект: \$\{propertyTypes\[propertyType\]\.label\}/);
  assert.match(api, /propertyType: propertyTypes\[propertyType\]\.label/);
  const dashboard = read('app/components/CrmDashboard.tsx');
  assert.match(dashboard, /function objectTypeLabel/);
  assert.match(dashboard, /<b>Тип объекта:<\/b>/);
});

test('the order API cannot bypass a required survey or fall back to stale display prices', () => {
  const api = read('app/api/orders/route.ts');
  assert.match(api, /area > maxQuoteArea\(quoteInput\)/);
  assert.match(api, /needsSiteSurvey\(quoteInput\)/);
  assert.match(api, /status: 422/);
  assert.match(api, /if \(!storedRule\)/);
  assert.match(api, /isServiceCompatibleWithProperty/);
  assert.doesNotMatch(api, /storedRule \|\| defaultPricing/);
});

test('window-cleaning keeps its quoted starting price out of the residential calculator', () => {
  const servicePage = read('app/services/[slug]/page.tsx');
  assert.match(servicePage, /const isWindowCleaning = slug === "window-cleaning"/);
  assert.match(servicePage, /isWindowCleaning \? "\/contacts"/);
  assert.doesNotMatch(servicePage, /"window-cleaning": "regular"/);
});

test('the www hostname permanently redirects to the canonical IDN hostname', () => {
  const proxy = read('proxy.ts');
  assert.match(proxy, /request\.nextUrl\.hostname === "www\.xn--90aipcrfhf\.xn--p1ai"/);
  assert.match(proxy, /url\.hostname = "xn--90aipcrfhf\.xn--p1ai"/);
  assert.match(proxy, /NextResponse\.redirect\(url, 308\)/);
  assert.match(proxy, /matcher: "\/:path\*"/);
  assert.match(proxy, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(proxy, /!isPreviewDeployment \|\| !apiRequest/);
});

test('CRM fails closed with a helpful page when its durable store is unavailable', () => {
  const source = read('app/crm/page.tsx');
  assert.match(source, /isPreviewDeployment \|\| !env\.DB/);
  assert.match(source, /База заявок пока не подключена к этому окружению/);
});

test('mobile navigation announces the available open or close action', () => {
  assert.match(read('app/components/MotionDesign.tsx'), /open \? "Закрыть меню" : "Открыть меню"/);
});
