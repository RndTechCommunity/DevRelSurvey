-- Синтетическая БД для локального smoke-стенда. Только MariaDB (таблицы seq_1_to_N движка Sequence).
-- Данные выдуманы и не связаны с ответами реальных респондентов. Не применять к production.
-- Пример: docker exec -i <контейнер> mariadb -uroot -p<пароль> <база> < tests/smoke/seed.sql

-- Схема семи таблиц SurveyDbContext.
CREATE TABLE Companies (Id char(36) NOT NULL PRIMARY KEY, Name longtext NOT NULL);
CREATE TABLE Languages (Id char(36) NOT NULL PRIMARY KEY, Name longtext NOT NULL);
CREATE TABLE CommunitySources (Id char(36) NOT NULL PRIMARY KEY, Name longtext NOT NULL);
CREATE TABLE Interviewees (
    Id char(36) NOT NULL PRIMARY KEY,
    Age int NOT NULL,
    Education longtext NOT NULL,
    Profession longtext NOT NULL,
    ProfessionLevel longtext NULL,
    City longtext NOT NULL,
    VisitMeetups tinyint(1) NOT NULL,
    Year int NOT NULL,
    IsCommunity tinyint(1) NOT NULL
);
CREATE TABLE CompanyAnswers (
    Id char(36) NOT NULL PRIMARY KEY,
    IsKnown tinyint(1) NOT NULL,
    IsGood tinyint(1) NOT NULL,
    IsWanted tinyint(1) NOT NULL,
    IntervieweeId char(36) NOT NULL,
    CompanyId char(36) NOT NULL
);
CREATE TABLE IntervieweeLanguages (
    IntervieweeId char(36) NOT NULL,
    LanguageId char(36) NOT NULL,
    PRIMARY KEY (IntervieweeId, LanguageId)
);
CREATE TABLE IntervieweeCommunitySources (
    IntervieweeId char(36) NOT NULL,
    CommunitySourceId char(36) NOT NULL,
    PRIMARY KEY (IntervieweeId, CommunitySourceId)
);

INSERT INTO Companies (Id, Name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Пример'),
    ('00000000-0000-0000-0000-000000000002', 'Тинькофф'),
    ('00000000-0000-0000-0000-000000000003', 'Zero Corp'),
    ('00000000-0000-0000-0000-000000000004', 'Контур'),
    ('00000000-0000-0000-0000-000000000005', 'IBS Dunice'),
    ('00000000-0000-0000-0000-000000000006', 'Gamma%');

INSERT INTO Languages (Id, Name) VALUES
    ('00000000-0000-0000-0001-000000000001', 'JavaScript'),
    ('00000000-0000-0000-0001-000000000002', 'TypeScript'),
    ('00000000-0000-0000-0001-000000000003', 'C#'),
    ('00000000-0000-0000-0001-000000000004', 'JavaScript / TypeScript');

INSERT INTO CommunitySources (Id, Name) VALUES
    ('00000000-0000-0000-0002-000000000001', 'Telegram'),
    ('00000000-0000-0000-0002-000000000002', 'Митапы');

-- Респонденты года: n = 1…Base — Ростов-на-Дону 20–44 (база года), затем Older — Ростов-на-Дону 50 лет,
-- затем Taganrog — Таганрог 20–44, затем Tbilisi — Тбилиси. Id = 00000000-0000-0000-<год>-<n>.
INSERT INTO Interviewees (Id, Year, Age, Education, Profession, ProfessionLevel, City, VisitMeetups, IsCommunity)
SELECT CONCAT('00000000-0000-0000-', g.Year, '-', LPAD(s.seq, 12, '0')),
       g.Year,
       CASE WHEN s.seq > g.Base AND s.seq <= g.Base + g.Older THEN 50 ELSE 20 + (s.seq - 1) % 25 END,
       IF(s.seq % 4 = 0, 'Высшее, в процессе получения', 'Высшее'),
       CASE
           WHEN s.seq > g.Base + g.Older AND s.seq % 2 = 0 THEN 'QA'
           WHEN s.seq % 3 = 0 THEN 'Frontend-разработчик'
           ELSE 'Backend-разработчик'
       END,
       ELT(1 + s.seq % 3, 'Junior/начинающий', 'Middle/опытный', 'Senior/ведущий'),
       CASE
           WHEN s.seq <= g.Base + g.Older THEN 'Ростов-на-Дону'
           WHEN s.seq <= g.Base + g.Older + g.Taganrog THEN 'Таганрог'
           ELSE 'Тбилиси'
       END,
       s.seq % 2,
       s.seq % 5 = 0
FROM (SELECT 2019 AS Year, 30 AS Base, 0 AS Older, 5 AS Taganrog, 0 AS Tbilisi
      UNION ALL SELECT 2020, 40, 0, 6, 0
      UNION ALL SELECT 2021, 60, 3, 8, 0
      UNION ALL SELECT 2022, 100, 5, 10, 1) g
JOIN seq_1_to_116 s ON s.seq <= g.Base + g.Older + g.Taganrog + g.Tbilisi;

-- «Пример»: ровно база 2022 — 25 знают, 10 знают и рекомендуют, 5 знают и хотят, 60 без отметок.
INSERT INTO CompanyAnswers (Id, IntervieweeId, CompanyId, IsKnown, IsGood, IsWanted)
SELECT UUID(), CONCAT('00000000-0000-0000-2022-', LPAD(seq, 12, '0')), '00000000-0000-0000-0000-000000000001',
       seq <= 40, seq BETWEEN 26 AND 35, seq BETWEEN 36 AND 40
FROM seq_1_to_100;

-- «Тинькофф»: 2022 — 4 ответа базы со всеми отметками (знаменатель «Рейтинга бренда» −4);
-- 2021 — 30 респондентов базы, не ответивших про «IBS Dunice».
INSERT INTO CompanyAnswers (Id, IntervieweeId, CompanyId, IsKnown, IsGood, IsWanted)
SELECT UUID(), CONCAT('00000000-0000-0000-2022-', LPAD(seq, 12, '0')), '00000000-0000-0000-0000-000000000002', 1, 1, 1
FROM seq_1_to_4
UNION ALL
SELECT UUID(), CONCAT('00000000-0000-0000-2021-', LPAD(seq, 12, '0')), '00000000-0000-0000-0000-000000000002',
       seq % 2 = 0, seq % 6 = 0, 0
FROM seq_31_to_60;

-- «Zero Corp»: 2021 — 10 ответов базы без отметок (знаменатель «Рейтинга бренда» 0).
INSERT INTO CompanyAnswers (Id, IntervieweeId, CompanyId, IsKnown, IsGood, IsWanted)
SELECT UUID(), CONCAT('00000000-0000-0000-2021-', LPAD(seq, 12, '0')), '00000000-0000-0000-0000-000000000003', 0, 0, 0
FROM seq_1_to_10;

-- «Контур»: ответы базы 2019, 2020 и 2022; в 2021 ответов нет.
INSERT INTO CompanyAnswers (Id, IntervieweeId, CompanyId, IsKnown, IsGood, IsWanted)
SELECT UUID(), Id, '00000000-0000-0000-0000-000000000004',
       RIGHT(Id, 12) % 3 <> 0, RIGHT(Id, 12) % 7 = 0, RIGHT(Id, 12) % 9 = 0
FROM Interviewees
WHERE Year <> 2021 AND RIGHT(Id, 12) <= 15;

-- «IBS Dunice»: все респонденты, кроме n = 31…60 базы 2021; в 2019 часть ответов отмечает и «рекомендую», и «хочу».
INSERT INTO CompanyAnswers (Id, IntervieweeId, CompanyId, IsKnown, IsGood, IsWanted)
SELECT UUID(), Id, '00000000-0000-0000-0000-000000000005',
       RIGHT(Id, 12) % 2 = 0 OR RIGHT(Id, 12) % 3 = 0, RIGHT(Id, 12) % 3 = 0, RIGHT(Id, 12) % 5 = 0
FROM Interviewees
WHERE NOT (Year = 2021 AND RIGHT(Id, 12) BETWEEN 31 AND 60);

-- «Gamma%»: только 2022.
INSERT INTO CompanyAnswers (Id, IntervieweeId, CompanyId, IsKnown, IsGood, IsWanted)
SELECT UUID(), Id, '00000000-0000-0000-0000-000000000006', RIGHT(Id, 12) % 4 = 0, 0, RIGHT(Id, 12) % 8 = 0
FROM Interviewees
WHERE Year = 2022 AND RIGHT(Id, 12) <= 50;

-- Языки: в 2019 — историческое «JavaScript / TypeScript» и C#, в 2020–2022 — JavaScript, TypeScript и C#;
-- часть респондентов указывает два языка.
INSERT INTO IntervieweeLanguages (IntervieweeId, LanguageId)
SELECT Id, IF(Year = 2019, '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0001-000000000001')
FROM Interviewees WHERE RIGHT(Id, 12) % 3 = 0
UNION ALL
SELECT Id, '00000000-0000-0000-0001-000000000002'
FROM Interviewees WHERE Year <> 2019 AND RIGHT(Id, 12) % 4 = 0
UNION ALL
SELECT Id, '00000000-0000-0000-0001-000000000003'
FROM Interviewees WHERE RIGHT(Id, 12) % 2 = 1;

INSERT INTO IntervieweeCommunitySources (IntervieweeId, CommunitySourceId)
SELECT Id, '00000000-0000-0000-0002-000000000001' FROM Interviewees WHERE RIGHT(Id, 12) % 2 = 0
UNION ALL
SELECT Id, '00000000-0000-0000-0002-000000000002' FROM Interviewees WHERE RIGHT(Id, 12) % 3 = 0;
