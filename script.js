let wins = 0;
let losses = 0;
let draws = 0;
let roundNumber = 0;

function getResult(player, computer) {
    if (player === computer) return 'Ничья';
    if ((player === 'Камень' && computer === 'Ножницы') ||
        (player === 'Ножницы' && computer === 'Бумага') ||
        (player === 'Бумага' && computer === 'Камень')) {
        return 'Победа пользователя';
    }
    return 'Победа компьютера';
}

function play(player) {
    const choices = ['Камень', 'Ножницы', 'Бумага'];
    const computer = choices[Math.floor(Math.random() * choices.length)];
    const result = getResult(player, computer);
    roundNumber++;

    document.getElementById('playerChoice').textContent = player;
    document.getElementById('computerChoice').textContent = computer;
    document.getElementById('result').textContent = result;

    if (result === 'Победа пользователя') wins++;
    else if (result === 'Победа компьютера') losses++;
    else draws++;
    updateStatistics();

}

function updateStatistics() {
    const rounds = wins + losses + draws;
    const percent = rounds === 0 ? 0 : Math.round(wins / rounds * 100);
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('draws').textContent = draws;
    document.getElementById('rounds').textContent = rounds;
    document.getElementById('winRate').textContent = percent + '%';
}
