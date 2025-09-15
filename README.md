# DevRelSurvey

[![.NET 8](https://img.shields.io/badge/.NET-8.0-purple)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)](https://www.postgresql.org/)
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
- PostgreSQL (через Pomelo.EntityFrameworkCore.MySql)
- Redis для кэширования (production)
- Prometheus для метрик

**Frontend:**
- React 18
- TypeScript
- RSuite UI Components
- Recharts для визуализации
- Axios для HTTP-запросов

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
- **Metrics**: интеграция с Prometheus для мониторинга

**Frontend компоненты:**
- **KnownAndWantedPage**: главная страница с графиком компаний
- **DataMetaPage**: статистика по демографии выборки
- **FiltersSidePage**: панель фильтров с пресетами
- **ResultsMobile**: мобильная версия интерфейса

#### 3. RndTech.DevRel.Importer
Консольная утилита для импорта очищенных данных опроса в БД. Поддерживает различные форматы данных для разных годов проведения опроса.

## 🚀 Быстрый старт

### Требования

- .NET 8 SDK
- Node.js 18+
- Postgresql/MySql/MariaDb
- Redis (для production)

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
npm install
cd ../../..
```

4. **Запустите приложение:**
```bash
dotnet run --project src/RndTech.DevRel.App
```

Приложение будет доступно по адресу: `http://localhost:29500`

### Docker

**Сборка образа:**
```bash
docker build -t devrel-survey .
```

**Запуск контейнера:**
```bash
docker run -p 29500:29500 \
  -e DEVRELAPP_CONFIG_DATABASE="connection_string" \
  -e DEVRELAPP_CONFIG_REDIS="redis_connection" \
  devrel-survey
```

## 📝 Конфигурация

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `DEVRELAPP_CONFIG_DATABASE` | Строка подключения к MySQL | ✅ |
| `DEVRELAPP_CONFIG_REDIS` | Строка подключения к Redis | ❌ (только production) |
| `PORT` | Порт для веб-сервера (по умолчанию: 29500) | ❌ |

## 🔧 Разработка

### Структура frontend

```
ClientApp/
├── src/
│   ├── components/
│   │   ├── filters/          # Компоненты фильтров
│   │   └── pages/            # Страницы приложения
│   ├── api.ts                # API клиент
│   ├── config.ts             # Конфигурация
│   └── format.ts             # Утилиты форматирования
├── public/                   # Статические файлы
└── package.json              # Зависимости npm
```

### Добавление нового фильтра

1. Создайте модель запроса в `Model/Queries/`
2. Реализуйте обработчик в `Implementation/QueryHandlers/Filters/`
3. Зарегистрируйте обработчик в `Program.cs`
4. Добавьте endpoint в `IEndpointRouteBuilderExtensions.cs`
5. Обновите компонент фильтра в React

### Импорт данных нового года

1. Создайте папку с годом в `src/RndTech.DevRel.Importer/`
2. Реализуйте классы для чтения формата данных
3. Создайте маппинг в Entity модели
4. Запустите импортёр с параметрами

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

Приложение автоматически деплоится на CapRover при push в ветку `master`.

**Настройки CapRover:**
- Container HTTP Port: `29500`
- Environmental Variables:
  - `DEVRELAPP_CONFIG_DATABASE`
  - `DEVRELAPP_CONFIG_REDIS`

## 📈 Мониторинг

### Prometheus метрики

Метрики доступны по адресу: `/metrics`

Собираемые метрики:
- HTTP запросы (количество, длительность)
- Использование памяти
- Производительность GC

## 🤝 Участие в разработке

Мы приветствуем вклад в развитие проекта!

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