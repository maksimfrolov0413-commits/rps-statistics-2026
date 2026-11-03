(function () {
  'use strict';
  const { LABELS, RESULTS, createRound, createStatistics, addResult } = window.RPS;
  let roundNumber = 0;
  let statistics = createStatistics();
  const choices = document.querySelectorAll('[data-choice]');

  function play(player) {
    const round = createRound(player, ++roundNumber);
    for (const button of choices) {
      button.setAttribute('aria-pressed', String(button.dataset.choice === player));
    }
    document.getElementById('player-choice').textContent = LABELS[round.player];
    document.getElementById('computer-choice').textContent = LABELS[round.computer];
    const result = document.getElementById('result');
    result.textContent = RESULTS[round.result];
    result.dataset.result = round.result;
    document.getElementById('result-hint').textContent = `Раунд ${round.id} завершён. Выберите следующий ход.`;
    statistics = addResult(statistics, round.result);
    renderStatistics();
  }

  function renderStatistics() {
    document.getElementById('wins').textContent = statistics.wins;
    document.getElementById('losses').textContent = statistics.losses;
    document.getElementById('draws').textContent = statistics.draws;
    document.getElementById('rounds').textContent = statistics.rounds;
    document.getElementById('win-rate').textContent = `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(statistics.winRate)}%`;
  }

  for (const button of choices) button.addEventListener('click', () => play(button.dataset.choice));
})();
