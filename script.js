(function () {
  'use strict';
  const { LABELS, RESULTS, createRound } = window.RPS;
  let roundNumber = 0;
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
  }

  for (const button of choices) button.addEventListener('click', () => play(button.dataset.choice));
})();
