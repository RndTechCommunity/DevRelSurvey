# DevRelSurvey

[![.NET 8](https://img.shields.io/badge/.NET-8.0-purple)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![MariaDB/MySQL](https://img.shields.io/badge/MariaDB%2FMySQL-blue)](https://mariadb.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://www.typescriptlang.org/)

Веб-приложение для визуализации результатов ежегодного опроса узнаваемости и привлекательности ИТ-компаний в Ростове-на-Дону и Ростовской области от сообщества [RndTech](https://rndtech.pro/).

## 📊 О проекте

DevRelSurvey — это платформа для анализа данных о восприятии ИТ-компаний на рынке труда Ростова-на-Дону на основе ежегодных опросов ИТ-сообщества.

### Ключевые возможности

- 📈 **Интерактивная визуализация данных** — графики узнаваемости и привлекательности компаний
- 🔍 **Гибкая фильтрация** — по городам, специальностям, опыту, языкам программирования и другим параметрам
- 📅 **Сравнение по годам** — отслеживание динамики показателей компаний
- 📱 **Адаптивный дизайн** — поддержка мобильных устройств
- ⚡ **Высокая производительность** — предзагрузка данных в память для мгновенного отклика

## 🏗️ Архитектура

### Технологический стек

**Backend:**
- .NET 8 с ASP.NET Core Minimal API
- Entity Framework Core 8.0
- MariaDB/MySQL (через Pomelo.EntityFrameworkCore.MySql)
- Кэш результатов в памяти процесса

**Frontend:**
- React 18
- TypeScript
- RSuite UI Components
- Recharts для визуализации
- Axios для HTTP-запросов
- Vite (сборка и dev-сервер), Vitest и Playwright (тесты)

### Структура проекта

```
DevRelSurvey/
├── src/
│   ├── RndTech.DevRel.App/           # Основное веб-приложение
│   │   ├── ClientApp/                # React frontend
│   │   ├── Configuration/            # Конфигурация ASP.NET
│   │   ├── Implementation/           # Бизнес-логика
│   │   │   └── QueryHandlers/        # CQRS обработчики
│   │   ├── Mapping/                  # Маппинг данных
│   │   └── Model/                    # Модели данных
│   ├── RndTech.DevRel.Database/      # Слой работы с БД
│   │   ├── Models/                   # Entity модели
│   │   └── ModelConfiguration/       # EF конфигурации
│   └── RndTech.DevRel.Importer/      # Утилита импорта данных
│       └── 2022/                     # Импортёр для формата 2022
├── tests/smoke/seed.sql              # Синтетическая БД MariaDB для локального стенда
├── Dockerfile                         # Docker образ для деплоя
└── RndTech.DevRel.sln                # Solution файл
```

### Компоненты системы

#### 1. RndTech.DevRel.Database
Слой доступа к данным на базе Entity Framework Core:
- **Модели сущностей**: Company, Interviewee, CompanyAnswer, Language, CommunitySource
- **Конфигурации EF**: типизированные конфигурации для каждой сущности
- **DbContext**: SurveyDbContext для работы с MySQL через Pomelo.EntityFrameworkCore.MySql

#### 2. RndTech.DevRel.App
Основное веб-приложение с архитектурой на базе минималистичного CQRS:

**Backend компоненты:**
- **Query Handlers**: обработчики запросов для получения данных
- **Data Provider**: `IntervieweesPreloadedDataProvider` для предзагрузки данных в память
- **Filters**: маппинг и обработка фильтров от клиента

**Frontend компоненты:**
- **CompaniesPage**: главная страница с картой и таблицей компаний за выбранный год
- **SamplePage**: состав выборки по годам
- **FilterPanel**: панель фильтров с пресетами
- **MobileSummary**: мобильная версия интерфейса (ширина меньше 1224 px)

#### 3. RndTech.DevRel.Importer
Консольная утилита для импорта очищенных данных опроса в БД. Сейчас поддерживает только CSV 2022 года; имя файла `2022.csv` и пустая строка подключения заданы в коде (`2022/Importer.cs`), аргументов командной строки нет.

## 🚀 Быстрый старт

### Требования

- .NET 8 SDK
- Node.js 24 (`.nvmrc`)
- MariaDB или MySQL со схемой и данными; для локальной работы подойдёт синтетический `tests/smoke/seed.sql` (только MariaDB, см. [CONTRIBUTING.md](CONTRIBUTING.md#smoke-стенд-с-mariadb))

### Локальная разработка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/RndTechCommunity/DevRelSurvey.git
cd DevRelSurvey
```

2. **Настройте переменные окружения:**
```bash
# Для локальной разработки
export DEVRELAPP_CONFIG_DATABASE="Server=localhost;Database=devrel;User Id=user;Password=password"
```

3. **Восстановите зависимости:**
```bash
dotnet restore
cd src/RndTech.DevRel.App/ClientApp
npm ci
cd ../../..
```

4. **Запустите backend и frontend в двух терминалах:**
```bash
# Backend (API на http://localhost:29500), корень репозитория
ASPNETCORE_ENVIRONMENT=Development dotnet run --no-launch-profile --project src/RndTech.DevRel.App

# Frontend, src/RndTech.DevRel.App/ClientApp
npm start
```

Интерфейс будет доступен по адресу `http://localhost:44422`: dev-сервер Vite проксирует `/api` на backend `http://localhost:29500`. Собранный фронтенд backend отдаёт на 29500 только из результата `dotnet publish` или в Docker-образе.

### Docker

**Сборка образа:**
```bash
docker build -t devrel-survey .
```

**Запуск контейнера:**
```bash
docker run -p 29500:29500 \
  -e DEVRELAPP_CONFIG_DATABASE="connection_string" \
  devrel-survey
```

## 📝 Конфигурация

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `DEVRELAPP_CONFIG_DATABASE` | Строка подключения к MySQL | ✅ |
| `PORT` | Порт для веб-сервера (по умолчанию: 29500) | ❌ |

Кэш результатов хранится в памяти процесса: лимит `AppSettings.CacheSizeLimitBytes` (32 МиБ по байтам JSON записей), срок — скользящие 24 часа; отдельной настройки нет.

## 🔧 Разработка

### Структура frontend

```
ClientApp/
├── src/
│   ├── api/                  # HTTP-клиент (axios) и типы ответов API
│   ├── app/                  # Корень, состояние исследования и адрес страницы, загрузка данных
│   ├── pages/                # Компании, состав выборки, мобильная версия
│   ├── features/             # Фильтры, карта и таблица компаний, расчёт показателей, таблица состава
│   ├── shared/               # Форматирование, сортировка, общие компоненты
│   └── test/fixtures.ts      # Синтетические ответы API для тестов
├── e2e/                      # Браузерные сценарии Playwright
├── public/                   # Статические файлы, копируются в сборку как есть
├── index.html                # Точка входа Vite
├── vite.config.ts            # Сборка в build/, dev-сервер, Vitest
└── package.json              # Зависимости и скрипты npm
```

### Добавление нового фильтра

1. Создайте модель запроса в `Model/Queries/`
2. Реализуйте обработчик в `Implementation/QueryHandlers/Filters/`
3. Зарегистрируйте обработчик в `Program.cs`
4. Добавьте endpoint в `IEndpointRouteBuilderExtensions.cs`
5. На фронтенде добавьте справочник в `FilterOptions` и `getFilterOptions` (`ClientApp/src/api/`), поле — в `features/filters/model.ts` (тип, исходный фильтр, разбор ссылки, сравнение в `sameFilter`: массивы перечислены в `FILTER_ARRAY_KEYS`) и `features/filters/FilterPanel.tsx`

### Импорт данных нового года

1. Создайте папку с годом в `src/RndTech.DevRel.Importer/`
2. Реализуйте классы для чтения формата данных
3. Создайте маппинг в Entity модели
4. Укажите в коде путь к файлу и строку подключения: аргументов командной строки импортёр не принимает

## 📊 API Endpoints

### Получение данных компаний
```
POST /api/results/known-and-wanted
Content-Type: application/json

Body: UserFilter (фильтры для выборки)
```
Возвращает информацию об узнаваемости и привлекательности компаний.

### Получение метаданных
```
POST /api/results/meta
Content-Type: application/json

Body: UserFilter (фильтры для выборки)
```
Возвращает информацию о составе выборки.

### Endpoints фильтров
```
GET /api/filters/cities
GET /api/filters/professions
GET /api/filters/programmingLanguages
GET /api/filters/experienceLevels
GET /api/filters/educations
GET /api/filters/communitySources
```

## 🚢 Развёртывание

### CapRover

Production обновляется двумя независимыми механизмами:

- **Push-webhook CapRover на ветку `master`.** Любой push в `master`, включая merge pull request, запускает production-сборку на сервере. Поэтому не пушьте в `master` напрямую: изменения попадают туда только через pull request, а merge — это релиз.
- **`.github/workflows/deploy.yml`** запускается только вручную (`workflow_dispatch`): собирает образ, публикует его в GHCR и отправляет в CapRover.

`.github/workflows/verify.yml` проверяет каждый pull request (фронтенд и `docker build`) и ничего не деплоит.

**Настройки CapRover:**
- Container HTTP Port: `29500`
- Environmental Variables:
  - `DEVRELAPP_CONFIG_DATABASE`

## 🤝 Участие в разработке

Мы приветствуем вклад в развитие проекта! Порядок работы, проверки и локальный стенд описаны в [CONTRIBUTING.md](CONTRIBUTING.md).

### Как помочь

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Стиль кода

- Backend: следуйте C# coding conventions
- Frontend: используйте ESLint конфигурацию проекта
- Коммиты: придерживайтесь Conventional Commits

## 📞 Контакты

- **GitHub**: [github.com/RndTechCommunity](https://github.com/RndTechCommunity)
- **Telegram**: [@RndTechChat](https://t.me/RndTechChat)

---

*Сделано с ❤️ сообществом RndTech*