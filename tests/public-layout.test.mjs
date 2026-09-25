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
