# Руководство по участию в разработке

Спасибо за интерес к проекту DevRelSurvey! Мы рады вкладу сообщества в развитие платформы.

## 📋 Содержание

- [Кодекс поведения](#кодекс-поведения)
- [Как я могу помочь?](#как-я-могу-помочь)
- [Процесс разработки](#процесс-разработки)
- [Стандарты кода](#стандарты-кода)
- [Тестирование](#тестирование)
- [Коммиты](#коммиты)
- [Pull Requests](#pull-requests)

## Кодекс поведения

Участвуя в проекте, вы соглашаетесь поддерживать дружелюбную и уважительную атмосферу. Мы ожидаем от всех участников:

- Использования приветливого и инклюзивного языка
- Уважения к различным точкам зрения и опыту
- Конструктивной критики
- Фокуса на том, что лучше для сообщества

## Как я могу помочь?

### 🐛 Сообщение об ошибках

Перед созданием issue убедитесь, что:
- Проблема еще не была описана в существующих issues
- Вы используете последнюю версию из ветки `master`

При создании issue укажите:
- Описание проблемы
- Шаги для воспроизведения
- Ожидаемое поведение
- Фактическое поведение
- Версии используемых компонентов

### 💡 Предложение новых функций

Мы открыты для новых идей! При предложении функции опишите:
- Проблему, которую решает функция
- Предлагаемое решение
- Альтернативные варианты, которые вы рассматривали

### 🔧 Внесение изменений в код

1. **Fork репозитория** и создайте свою ветку от `master`
2. **Настройте окружение** согласно инструкциям в README
3. **Внесите изменения** в своей ветке
4. **Добавьте тесты** для новой функциональности
5. **Убедитесь**, что все тесты проходят
6. **Создайте Pull Request**

## Процесс разработки

### Настройка окружения

```bash
# Клонирование форка
git clone https://github.com/YOUR_USERNAME/DevRelSurvey.git
cd DevRelSurvey

# Добавление upstream репозитория
git remote add upstream https://github.com/RndTechCommunity/DevRelSurvey.git

# Установка зависимостей
dotnet restore
cd src/RndTech.DevRel.App/ClientApp
npm ci
```

### Создание feature branch

```bash
git checkout -b feature/your-feature-name
```

### Синхронизация с upstream

```bash
git fetch upstream
git checkout master
git merge upstream/master
```

## Стандарты кода

### Backend (.NET)

- Следуйте [C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Используйте осмысленные имена переменных и методов
- Добавляйте XML-документацию для публичных API
- Соблюдайте принципы SOLID

Пример:
```csharp
/// <summary>
/// Получает данные о компаниях с учетом фильтров
/// </summary>
/// <param name="query">Параметры запроса с фильтрами</param>
/// <param name="ct">Токен отмены</param>
/// <returns>Массив моделей компаний</returns>
public async ValueTask<CompanyModel[]> Handle(
    GetCompanyModelsQuery query,
    CancellationToken ct)
{
    // Реализация
}
```

### Frontend (React/TypeScript)

- Используйте функциональные компоненты и хуки
- Типизируйте props и state
- Следуйте конфигурации ESLint проекта
- Используйте семантические имена компонентов
- Типы и расчёты держите в модулях без React, RSuite и Recharts; правила архитектуры фронтенда — в [AGENTS.md](AGENTS.md)

Пример:
```typescript
type Props = {
    filter: RespondentFilter,
    onChange: (filter: RespondentFilter) => void,
}

export default function FilterPanel({ filter, onChange }: Props) {
    // Значение приходит из props, компонент не хранит его копию
}
```

### Стилизация

- Используйте RSuite компоненты где возможно
- Для собственных стилей используйте CSS Modules (`*.module.css` рядом с компонентом)
- Следуйте принципам mobile-first

## Тестирование

Проверки фронтенда и `docker build` автоматически запускает `.github/workflows/verify.yml` на каждом pull request; этот workflow ничего не деплоит. Перед созданием PR выполните их локально.

### Backend

```bash
dotnet build RndTech.DevRel.sln -c Release
```

Тестового проекта в solution нет: `dotnet test` завершается без найденных тестов и корректность вычислений не проверяет. Изменения API проверяйте на smoke-стенде (ниже).

### Frontend

```bash
cd src/RndTech.DevRel.App/ClientApp
npm ci
npm run typecheck   # tsc --noEmit, включая e2e/ и конфиги
npm run lint        # ESLint, предупреждения тоже считаются ошибкой
npm test            # unit-тесты Vitest (*.test.ts рядом с модулями)
npm run build       # typecheck и сборка Vite в build/
npm run test:e2e    # браузерные сценарии Playwright
```

`npm run test:e2e` требует установленного Google Chrome. Playwright сам собирает приложение, запускает `vite preview` на порту 4173 (он должен быть свободен) и подменяет `/api/**` синтетическими ответами: БД и production не нужны.

Упаковку проверяет `dotnet publish src/RndTech.DevRel.App -c Release`: он выполняет `npm ci` и `npm run build` и копирует сборку в `wwwroot`. `dotnet build` её не проверяет.

### Smoke-стенд с MariaDB

`tests/smoke/seed.sql` создаёт схему и синтетические данные только для локальной одноразовой MariaDB. Не применяйте его к production.

```bash
# Из корня репозитория
# БД (если порт 3306 занят, замените порт хоста — первое число в -p — и порт в строке подключения)
docker run -d --name devrel-smoke-db -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD=smoke -e MARIADB_DATABASE=devrel mariadb:10.11
until docker exec devrel-smoke-db healthcheck.sh --connect --innodb_initialized; do sleep 2; done
docker exec -i devrel-smoke-db mariadb -uroot -psmoke devrel < tests/smoke/seed.sql

# Backend
DEVRELAPP_CONFIG_DATABASE="Server=localhost;Port=3306;Database=devrel;User Id=root;Password=smoke" \
  ASPNETCORE_ENVIRONMENT=Development \
  dotnet run --no-launch-profile --project src/RndTech.DevRel.App
```

Ожидаемый результат: `curl http://localhost:29500/api/filters/cities` возвращает `["Ростов-на-Дону","Таганрог"]`. После `npm start` в `ClientApp` интерфейс `http://localhost:44422` с исходным фильтром показывает сводку «2022 · Ростов-на-Дону, 20–44 года · Выборка: 100 из 116», а для 2021 года — «Выборка: 60 из 71».

Удаление стенда: `docker rm -f devrel-smoke-db`.

## Коммиты

Мы следуем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы коммитов

- `feat`: Новая функциональность
- `fix`: Исправление ошибки
- `docs`: Изменения в документации
- `style`: Форматирование, отсутствующие точки с запятой и т.д.
- `refactor`: Рефакторинг кода
- `perf`: Улучшение производительности
- `test`: Добавление тестов
- `chore`: Обслуживание кода

### Примеры

```bash
feat(filter): добавлен фильтр по годам опыта

fix(chart): исправлено отображение компаний с нулевой узнаваемостью

docs(readme): обновлена инструкция по развёртыванию
```

## Pull Requests

### Перед созданием PR

- [ ] Код соответствует стандартам проекта
- [ ] Все тесты проходят успешно
- [ ] Добавлены новые тесты для новой функциональности
- [ ] Документация обновлена (если необходимо)
- [ ] Коммиты следуют конвенции

### Описание PR

Используйте шаблон:

```markdown
## Описание
Краткое описание изменений

## Тип изменений
- [ ] Исправление ошибки
- [ ] Новая функциональность
- [ ] Критическое изменение
- [ ] Требует обновления документации

## Проверка
- [ ] Локально протестировано
- [ ] Тесты добавлены/обновлены
- [ ] Документация обновлена

## Скриншоты (если применимо)
```

### Процесс ревью

1. PR будет проверен мейнтейнерами
2. Может потребоваться внести изменения
3. После одобрения PR будет смержен в `master`

Merge в `master` — это релиз: push-webhook CapRover запускает production-сборку при любом push в `master` основного репозитория. Поэтому не пушьте в `master` напрямую, изменения попадают туда только через pull request. Механизмы деплоя описаны в README, раздел «Развёртывание».

## 🤝 Вопросы?

Если у вас есть вопросы, создайте issue или свяжитесь с нами в [Telegram](https://t.me/rndtechchat).

Спасибо за ваш вклад в развитие DevRelSurvey! 🎉