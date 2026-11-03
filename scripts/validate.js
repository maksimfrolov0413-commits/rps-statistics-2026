'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
for (const file of ['index.html', 'style.css', 'script.js', 'game-core.js']) {
  assert.ok(fs.statSync(path.join(root, file)).size > 0, `${file} не должен быть пустым`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /<!doctype html>/i);
assert.match(html, /<html lang="ru">/);
assert.match(html, /name="viewport"/);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Идентификаторы HTML должны быть уникальны');
for (const match of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)) {
  assert.ok(fs.existsSync(path.join(root, match[1])), `Не найден ресурс ${match[1]}`);
}
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
for (const match of script.matchAll(/getElementById\('([^']+)'\)/g)) {
  assert.ok(ids.includes(match[1]), `В HTML отсутствует #${match[1]}`);
}
console.log('Файлы, ресурсы, язык, viewport и связи JavaScript с HTML проверены.');
