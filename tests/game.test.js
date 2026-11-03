'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getResult, getComputerChoice, createRound } = require('../game-core');
const cases = [
  ['rock', 'rock', 'draw'], ['rock', 'scissors', 'win'], ['rock', 'paper', 'loss'],
  ['scissors', 'rock', 'loss'], ['scissors', 'scissors', 'draw'], ['scissors', 'paper', 'win'],
  ['paper', 'rock', 'win'], ['paper', 'scissors', 'loss'], ['paper', 'paper', 'draw']
];
for (const [player, computer, result] of cases) {
  test(`${player} против ${computer}: ${result}`, () => assert.equal(getResult(player, computer), result));
}
test('Случайный выбор охватывает все три равных интервала', () => {
  for (const [value, choice] of [[0, 'rock'], [1 / 3, 'scissors'], [2 / 3, 'paper'], [0.999999, 'paper']]) assert.equal(getComputerChoice(() => value), choice);
});
test('Некорректный ввод отклоняется', () => {
  assert.throws(() => getResult('unknown', 'rock'), RangeError);
  assert.throws(() => getResult('rock', 'unknown'), RangeError);
  for (const value of [-1, 1, NaN, Infinity]) assert.throws(() => getComputerChoice(() => value), RangeError);
});
test('Раунд содержит оба хода, результат, номер и дату', () => {
  assert.deepEqual(createRound('paper', 1, () => 0, new Date('2026-11-03T12:00:00Z')), {
    id: 1, player: 'paper', computer: 'rock', result: 'win', date: '2026-11-03T12:00:00.000Z'
  });
});
test('Повторный выбор одного варианта не вызывает ошибок', () => {
  for (let id = 1; id <= 1000; id++) assert.equal(createRound('rock', id, () => 0).result, 'draw');
});
