/* Чистая игровая логика: работает в браузере и в тестах Node.js. */
(function (root) {
  'use strict';
  const CHOICES = Object.freeze(['rock', 'scissors', 'paper']);
  const LABELS = Object.freeze({ rock: 'Камень', scissors: 'Ножницы', paper: 'Бумага' });
  const RESULTS = Object.freeze({ win: 'Вы победили!', loss: 'Победа компьютера', draw: 'Ничья' });
  const BEATS = Object.freeze({ rock: 'scissors', scissors: 'paper', paper: 'rock' });

  function assertChoice(choice) {
    if (!CHOICES.includes(choice)) throw new RangeError('Неизвестный вариант хода');
  }

  function getResult(player, computer) {
    assertChoice(player);
    assertChoice(computer);
    return player === computer ? 'draw' : BEATS[player] === computer ? 'win' : 'loss';
  }

  function getComputerChoice(random = Math.random) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('Случайное число должно быть в диапазоне [0, 1)');
    }
    return CHOICES[Math.floor(value * CHOICES.length)];
  }

  /** Round: { id, player, computer, result, date (ISO 8601) }. */
  function createRound(player, id, random = Math.random, date = new Date()) {
    assertChoice(player);
    const computer = getComputerChoice(random);
    return { id, player, computer, result: getResult(player, computer), date: date.toISOString() };
  }

  /** Statistics: wins, losses, draws, rounds и winRate (0..100). */
  function createStatistics() {
    return { wins: 0, losses: 0, draws: 0, rounds: 0, winRate: 0 };
  }

  function addResult(statistics, result) {
    if (!['win', 'loss', 'draw'].includes(result)) throw new RangeError('Неизвестный результат');
    const next = { ...statistics };
    const counter = { win: 'wins', loss: 'losses', draw: 'draws' }[result];
    next[counter]++;
    next.rounds = next.wins + next.losses + next.draws;
    next.winRate = next.rounds ? next.wins / next.rounds * 100 : 0;
    return next;
  }

  const api = { CHOICES, LABELS, RESULTS, getResult, getComputerChoice, createRound, createStatistics, addResult };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RPS = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
