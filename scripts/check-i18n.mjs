import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const i18n = require(path.join(root, 'src', 'i18n.js'));
const { SUPPORTED, DICT, PACK_LABELS, MISSION_TITLES } = i18n;

assert.deepEqual(SUPPORTED, ['uk', 'en', 'pl', 'ru'], 'Supported locales must be uk, en, pl, ru');

// 1. 100% key parity across uk, en, pl, ru in DICT
const ukKeys = Object.keys(DICT.uk).sort();
assert.ok(ukKeys.length > 0, 'uk dictionary must not be empty');

for (const lang of SUPPORTED) {
  assert.ok(DICT[lang] && typeof DICT[lang] === 'object', `Missing DICT.${lang}`);
  const keys = Object.keys(DICT[lang]).sort();
  const missing = ukKeys.filter((k) => !Object.prototype.hasOwnProperty.call(DICT[lang], k));
  const extra = keys.filter((k) => !Object.prototype.hasOwnProperty.call(DICT.uk, k));
  assert.deepEqual(missing, [], `Missing keys in DICT.${lang}: ${missing.join(', ')}`);
  assert.deepEqual(extra, [], `Extra keys in DICT.${lang}: ${extra.join(', ')}`);
  for (const k of keys) {
    assert.equal(typeof DICT[lang][k], 'string', `DICT.${lang}["${k}"] must be a string`);
    assert.ok(DICT[lang][k].length > 0, `DICT.${lang}["${k}"] must not be empty`);
  }
}

// 1b. Key parity across en, pl, ru in PACK_LABELS and MISSION_TITLES
const packEnKeys = Object.keys(PACK_LABELS.en).sort();
for (const lang of ['pl', 'ru']) {
  const keys = Object.keys(PACK_LABELS[lang]).sort();
  assert.deepEqual(keys, packEnKeys, `PACK_LABELS.${lang} keys must match PACK_LABELS.en`);
}

const missionEnKeys = Object.keys(MISSION_TITLES.en).sort();
for (const lang of ['pl', 'ru']) {
  const keys = Object.keys(MISSION_TITLES[lang]).sort();
  assert.deepEqual(keys, missionEnKeys, `MISSION_TITLES.${lang} keys must match MISSION_TITLES.en`);
}

// 2. Every data-i18n, data-i18n-html, data-i18n-title, data-i18n-aria, data-i18n-placeholder in index.html exists in all 4 locales
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const attrPattern = /\bdata-i18n(?:-(?:html|title|aria|placeholder))?="([^"]+)"/g;
const htmlKeys = new Set();
for (const match of html.matchAll(attrPattern)) {
  htmlKeys.add(match[1]);
}
assert.ok(htmlKeys.size > 0, 'index.html must contain data-i18n* attributes');

for (const key of htmlKeys) {
  for (const lang of SUPPORTED) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(DICT[lang], key),
      `index.html i18n key "${key}" is missing in DICT.${lang}`
    );
  }
}

// 3. No Ukrainian Cyrillic leaks (є, ї, і, ґ) in en, pl, ru values
const UK_LEAK_RE = /[єїіґЄЇІҐ]/;
for (const lang of ['en', 'pl', 'ru']) {
  for (const [k, v] of Object.entries(DICT[lang])) {
    assert.ok(!UK_LEAK_RE.test(v), `Ukrainian character leak in DICT.${lang}["${k}"]: ${v}`);
  }
  for (const [k, v] of Object.entries(PACK_LABELS[lang])) {
    assert.ok(!UK_LEAK_RE.test(v), `Ukrainian character leak in PACK_LABELS.${lang}["${k}"]: ${v}`);
  }
  for (const [k, v] of Object.entries(MISSION_TITLES[lang])) {
    assert.ok(!UK_LEAK_RE.test(v), `Ukrainian character leak in MISSION_TITLES.${lang}["${k}"]: ${v}`);
  }
}

console.log(`PASS check-i18n: ${ukKeys.length} UI keys, ${htmlKeys.size} HTML attributes, ${packEnKeys.length} pack labels, ${missionEnKeys.length} mission titles verified across 4 locales (uk, en, pl, ru).`);
