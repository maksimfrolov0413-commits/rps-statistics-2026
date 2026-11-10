'use strict';

const RPS = (() => {
  const choices = Object.freeze(['rock', 'scissors', 'paper']);
  const labels = Object.freeze({ rock: 'Камень', scissors: 'Ножницы', paper: 'Бумага' });
  const results = Object.freeze({ win: 'Победа пользователя', loss: 'Победа компьютера', draw: 'Ничья' });
  const beats = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

  function determineResult(player, computer) {
    if (!choices.includes(player) || !choices.includes(computer)) {
      throw new RangeError('Недопустимый ход');
    }
    if (player === computer) return 'draw';
    return beats[player] === computer ? 'win' : 'loss';
  }

  function computerChoice(random = Math.random) {
    return choices[Math.floor(random() * choices.length)];
  }

  function createGame(random = Math.random) {
    let lastRound = null;
    const statistics = { wins: 0, losses: 0, draws: 0, rounds: 0 };
    return {
      play(player) {
        if (!choices.includes(player)) throw new RangeError('Недопустимый ход');
        const computer = computerChoice(random);
        lastRound = { player, computer, result: determineResult(player, computer), date: new Date().toISOString() };
        statistics.rounds += 1;
        const counter = { win: 'wins', loss: 'losses', draw: 'draws' }[lastRound.result];
        statistics[counter] += 1;
        return { ...lastRound };
      },
      getLastRound() { return lastRound ? { ...lastRound } : null; },
      getStatistics() {
        return { ...statistics, winRate: statistics.rounds === 0 ? 0 : statistics.wins / statistics.rounds * 100 };
      }
    };
  }

  return { choices, labels, results, determineResult, computerChoice, createGame };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = RPS;

if (typeof document !== 'undefined') {
  const game = RPS.createGame();
  function render() {
    const round = game.getLastRound();
    document.getElementById('player-choice').textContent = round ? RPS.labels[round.player] : 'Не выбран';
    document.getElementById('computer-choice').textContent = round ? RPS.labels[round.computer] : 'Не выбран';
    document.getElementById('round-result').textContent = round ? RPS.results[round.result] : 'Сделайте первый ход.';
    const statistics = game.getStatistics();
    for (const key of ['wins', 'losses', 'draws', 'rounds']) {
      document.getElementById(key).textContent = statistics[key];
    }
    document.getElementById('win-rate').textContent = `${Number(statistics.winRate.toFixed(1))}%`;
  }
  document.querySelectorAll('[data-choice]').forEach(button => {
    button.addEventListener('click', () => {
      game.play(button.dataset.choice);
      render();
    });
  });
  render();
}
