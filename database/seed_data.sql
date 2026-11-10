-- Учебные данные, а не реальные раунды пользователя.
-- Выполнить один раз после schema.sql в новой БД.
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

INSERT INTO Choices (choice_id, name) VALUES
    ('rock', 'Камень'),
    ('scissors', 'Ножницы'),
    ('paper', 'Бумага');

-- Девять сочетаний ходов: три ничьи, три победы, три поражения.
INSERT INTO Rounds (round_id, played_at) VALUES
    (1, '2026-11-10T12:00:00.000Z'),
    (2, '2026-11-10T12:01:00.000Z'),
    (3, '2026-11-10T12:02:00.000Z'),
    (4, '2026-11-10T12:03:00.000Z'),
    (5, '2026-11-10T12:04:00.000Z'),
    (6, '2026-11-10T12:05:00.000Z'),
    (7, '2026-11-10T12:06:00.000Z'),
    (8, '2026-11-10T12:07:00.000Z'),
    (9, '2026-11-10T12:08:00.000Z');

INSERT INTO Round_Choices (round_id, participant, choice_id) VALUES
    (1, 'player', 'rock'),     (1, 'computer', 'rock'),
    (2, 'player', 'rock'),     (2, 'computer', 'scissors'),
    (3, 'player', 'rock'),     (3, 'computer', 'paper'),
    (4, 'player', 'scissors'), (4, 'computer', 'rock'),
    (5, 'player', 'scissors'), (5, 'computer', 'scissors'),
    (6, 'player', 'scissors'), (6, 'computer', 'paper'),
    (7, 'player', 'paper'),    (7, 'computer', 'rock'),
    (8, 'player', 'paper'),    (8, 'computer', 'scissors'),
    (9, 'player', 'paper'),    (9, 'computer', 'paper');

COMMIT;

-- Проверка после загрузки:
-- SELECT * FROM Statistics;
-- Ожидается: wins=3, losses=3, draws=3, total_rounds=9,
-- win_rate приблизительно 33.3333333333333.
-- SELECT * FROM Game_History ORDER BY played_at DESC, round_id DESC;
-- PRAGMA foreign_key_check; -- 0 строк при отсутствии нарушений FK.
