'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { determineResult, computerChoice, createGame } = require('../script.js');

const cases = [
  ['rock', 'rock', 'draw'], ['rock', 'scissors', 'win'], ['rock', 'paper', 'loss'],
  ['scissors', 'rock', 'loss'], ['scissors', 'scissors', 'draw'], ['scissors', 'paper', 'win'],
  ['paper', 'rock', 'win'], ['paper', 'scissors', 'loss'], ['paper', 'paper', 'draw']
];
for (const [player, computer, expected] of cases) {
  test(`${player} / ${computer}: ${expected}`, () => {
    assert.equal(determineResult(player, computer), expected);
  });
}
test('computer maps the random range to all three choices', () => {
  for (const [value, choice] of [[0, 'rock'], [1 / 3, 'scissors'], [2 / 3, 'paper'], [0.999999, 'paper']]) {
    assert.equal(computerChoice(() => value), choice);
  }
});
test('each round requests a fresh computer choice and replaces the last round', () => {
  const values = [0, 0.5, 0.9];
  const game = createGame(() => values.shift());
  assert.equal(game.getLastRound(), null);
  assert.equal(game.play('rock').result, 'draw');
  assert.equal(game.play('rock').result, 'win');
  assert.equal(game.play('rock').result, 'loss');
  assert.equal(values.length, 0);
  assert.equal(game.getLastRound().computer, 'paper');
  assert.ok(Number.isFinite(Date.parse(game.getLastRound().date)));
});
test('invalid input does not change the completed round', () => {
  const game = createGame(() => 0);
  const round = game.play('paper');
  assert.throws(() => game.play('invalid'), RangeError);
  assert.deepEqual(game.getLastRound(), round);
});
test('zero rounds have zero counters and a finite zero win rate', () => {
  assert.deepEqual(createGame().getStatistics(), { wins: 0, losses: 0, draws: 0, rounds: 0, winRate: 0 });
});
test('statistics count each outcome once and calculate wins / all rounds', () => {
  const values = [0.5, 0.9, 0];
  const game = createGame(() => values.shift());
  game.play('rock');
  assert.deepEqual(game.getStatistics(), { wins: 1, losses: 0, draws: 0, rounds: 1, winRate: 100 });
  game.play('rock');
  assert.deepEqual(game.getStatistics(), { wins: 1, losses: 1, draws: 0, rounds: 2, winRate: 50 });
  game.play('rock');
  const statistics = game.getStatistics();
  assert.deepEqual(statistics, { wins: 1, losses: 1, draws: 1, rounds: 3, winRate: 100 / 3 });
  assert.equal(statistics.rounds, statistics.wins + statistics.losses + statistics.draws);
  statistics.wins = 999;
  assert.equal(game.getStatistics().wins, 1);
});
