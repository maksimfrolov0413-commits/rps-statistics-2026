-- Нормализованная схема (3NF) для SQLite.
-- Выполнить в новой БД. FK включаются до начала транзакции.
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

CREATE TABLE Choices (
    choice_id TEXT NOT NULL PRIMARY KEY
        CHECK (choice_id IN ('rock', 'scissors', 'paper')),
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0)
);

CREATE TABLE Rounds (
    round_id INTEGER PRIMARY KEY AUTOINCREMENT CHECK (round_id > 0),
    played_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        CHECK (julianday(played_at) IS NOT NULL),
    history_visible INTEGER NOT NULL DEFAULT 1
        CHECK (history_visible IN (0, 1)),
    statistics_included INTEGER NOT NULL DEFAULT 1
        CHECK (statistics_included IN (0, 1))
);

-- Одна строка на роль в раунде. Ничья допускает одинаковый choice_id
-- для player и computer. Оба хода записываются одной транзакцией.
CREATE TABLE Round_Choices (
    round_id INTEGER NOT NULL,
    participant TEXT NOT NULL CHECK (participant IN ('player', 'computer')),
    choice_id TEXT NOT NULL,
    PRIMARY KEY (round_id, participant),
    FOREIGN KEY (round_id) REFERENCES Rounds (round_id) ON DELETE CASCADE,
    FOREIGN KEY (choice_id) REFERENCES Choices (choice_id) ON DELETE RESTRICT
);

-- Индексы по условиям отбора истории/статистики и внешнему ключу выбора.
CREATE INDEX idx_rounds_history
    ON Rounds (history_visible, played_at DESC, round_id DESC);
CREATE INDEX idx_rounds_statistics ON Rounds (statistics_included);
CREATE INDEX idx_round_choices_choice_id ON Round_Choices (choice_id);

-- Только раунды с обоими ходами; исход не хранится повторно в таблицах.
CREATE VIEW Round_Results AS
SELECT
    r.round_id,
    r.played_at,
    p.choice_id AS player_choice_id,
    pc.name AS player_choice,
    c.choice_id AS computer_choice_id,
    cc.name AS computer_choice,
    CASE
        WHEN p.choice_id = c.choice_id THEN 'draw'
        WHEN (p.choice_id = 'rock' AND c.choice_id = 'scissors')
          OR (p.choice_id = 'scissors' AND c.choice_id = 'paper')
          OR (p.choice_id = 'paper' AND c.choice_id = 'rock') THEN 'win'
        ELSE 'loss'
    END AS result,
    r.history_visible,
    r.statistics_included
FROM Rounds AS r
JOIN Round_Choices AS p ON p.round_id = r.round_id AND p.participant = 'player'
JOIN Round_Choices AS c ON c.round_id = r.round_id AND c.participant = 'computer'
JOIN Choices AS pc ON pc.choice_id = p.choice_id
JOIN Choices AS cc ON cc.choice_id = c.choice_id;

CREATE VIEW Game_History AS
SELECT round_id, played_at, player_choice, computer_choice, result
FROM Round_Results
WHERE history_visible = 1;

-- Агрегат всегда возвращает одну строку, в том числе при 0 раундов.
CREATE VIEW Statistics AS
SELECT
    COALESCE(SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
    COALESCE(SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END), 0) AS losses,
    COALESCE(SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END), 0) AS draws,
    COUNT(*) AS total_rounds,
    CASE WHEN COUNT(*) = 0 THEN 0.0
         ELSE 100.0 * SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) / COUNT(*)
    END AS win_rate
FROM Round_Results
WHERE statistics_included = 1;

COMMIT;
