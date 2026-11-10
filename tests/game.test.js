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
  assert.deepEqual({ ...statistics, winRate: 0 }, { wins: 1, losses: 1, draws: 1, rounds: 3, winRate: 0 });
  assert.ok(Math.abs(statistics.winRate - 100 / 3) < 1e-10);
  assert.equal(statistics.rounds, statistics.wins + statistics.losses + statistics.draws);
  statistics.wins = 999;
  assert.equal(game.getStatistics().wins, 1);
});
test('history retains every round and exposes copies', () => {
  const game = createGame(() => 0);
  const first = game.play('paper');
  const second = game.play('rock');
  assert.deepEqual(game.getHistory(), [first, second]);
  assert.equal(first.id, 1);
  assert.equal(second.id, 2);
  const history = game.getHistory();
  history[0].result = 'loss';
  history.pop();
  first.player = 'scissors';
  assert.equal(game.getHistory()[0].result, 'win');
  assert.equal(game.getHistory()[0].player, 'paper');
  assert.equal(game.getHistory().length, 2);
});
test('clearing history preserves statistics and permits further rounds', () => {
  const game = createGame(() => 0);
  game.play('paper');
  const statistics = game.getStatistics();
  game.clearHistory();
  game.clearHistory();
  assert.deepEqual(game.getHistory(), []);
  assert.deepEqual(game.getStatistics(), statistics);
  assert.equal(game.play('rock').id, 2);
  assert.equal(game.getHistory().length, 1);
  assert.equal(game.getStatistics().rounds, 2);
});
test('resetting statistics preserves history and restarts counters', () => {
  const game = createGame(() => 0);
  game.play('paper');
  const history = game.getHistory();
  game.resetStatistics();
  game.resetStatistics();
  assert.deepEqual(game.getStatistics(), { wins: 0, losses: 0, draws: 0, rounds: 0, winRate: 0 });
  assert.deepEqual(game.getHistory(), history);
  game.play('scissors');
  assert.deepEqual(game.getStatistics(), { wins: 0, losses: 1, draws: 0, rounds: 1, winRate: 0 });
});
test('new game returns every state to its initial value', () => {
  const game = createGame(() => 0);
  game.play('paper');
  game.newGame();
  game.newGame();
  assert.deepEqual(game.getHistory(), []);
  assert.equal(game.getLastRound(), null);
  assert.deepEqual(game.getStatistics(), { wins: 0, losses: 0, draws: 0, rounds: 0, winRate: 0 });
  assert.equal(game.play('rock').id, 1);
});
test('1000 repeated choices create exactly 1000 rounds without errors', () => {
  const game = createGame(() => 0);
  for (let i = 0; i < 1000; i += 1) game.play('rock');
  assert.equal(game.getHistory().length, 1000);
  assert.deepEqual(game.getStatistics(), { wins: 0, losses: 0, draws: 1000, rounds: 1000, winRate: 0 });
});
