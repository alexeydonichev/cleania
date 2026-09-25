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
