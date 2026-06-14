# Деплой Nova на Render + Supabase (бесплатно, без карты)

## Что получится

| Сервис | Роль | Карта? | Ограничение |
|--------|------|--------|-------------|
| **Supabase** | PostgreSQL | ❌ Нет | 500 MB, 2 проекта |
| **Render** | Node.js сервер | ❌ Нет | Засыпает после 15 мин |
| **cron-job.org** | Пинг каждые 14 мин | ❌ Нет | Предотвращает сон |
| **metered.ca** | TURN-сервер для звонков | ❌ Нет | 50 GB/мес, нужна регистрация |

---

## Шаг 1. База данных — Supabase

1. Перейди на [supabase.com](https://supabase.com) → **Start your project** (GitHub или email, без карты)
2. **New project** → придумай имя, установи пароль для БД, регион **Frankfurt** (ближе к СНГ)
3. Дождись запуска (≈2 минуты)
4. Слева → **Settings → Database → Connection string → URI**
5. Скопируй строку вида:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
6. Замени `[YOUR-PASSWORD]` на свой пароль — это и есть `DATABASE_URL`

---

## Шаг 2. TURN-сервер для звонков — metered.ca

> Без этого звонки будут работать только если оба пользователя в одной сети.
> С metered.ca — работает везде, через любые файрволы.

1. Перейди на [metered.ca](https://metered.ca) → **Sign Up** (email, без карты)
2. **Dashboard → TURN Server credentials**
3. Запиши три значения:
   - **Host** → `turn:relay.metered.ca:80`
   - **Username** → (будет показан)
   - **Credential** → (будет показан)

---

## Шаг 3. Деплой на Render

1. Перейди на [render.com](https://render.com) → **Get Started for Free** (GitHub или email, без карты)
2. **New → Web Service**
3. Подключи GitHub/GitLab репозиторий с проектом
   (или используй **Public Git repository** и вставь URL)

### Настройки Web Service

| Поле | Значение |
|------|----------|
| **Name** | `nova-messenger` |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | `Free` |

### Environment Variables

Нажми **Add Environment Variable** для каждой:

| Ключ | Значение |
|------|----------|
| `DATABASE_URL` | Строка из Supabase (шаг 1) |
| `JWT_SECRET` | Любая длинная случайная строка (≥64 символа) |
| `NODE_ENV` | `production` |
| `VAPID_PUBLIC_KEY` | `BMYTPQMepM0IUhvdnCp9EEZCX787iklvM032FY1m7vq6PheB6OUr-ZxocSlQE2tdmUBNULyvc_vfA5kyu9vVf7I` |
| `VAPID_EMAIL` | `mailto:admin@nova.app` |
| `VITE_TURN_URL` | `turn:relay.metered.ca:80` |
| `VITE_TURN_USER` | Username из metered.ca (шаг 2) |
| `VITE_TURN_CRED` | Credential из metered.ca (шаг 2) |

> **VAPID_PUBLIC_KEY** можно оставить как есть (это для push-уведомлений браузера).
> **JWT_SECRET** должен быть секретным и не меняться — иначе все сессии сбросятся.

4. Нажми **Create Web Service** → Render начнёт сборку (~5-7 минут)

---

## Шаг 4. Миграция базы данных

После первого деплоя нужно создать таблицы. Render запускает это автоматически через `build` команду в Dockerfile. Если что-то пошло не так:

1. **Render Dashboard → Shell** (вкладка рядом с Logs)
2. Выполни:
   ```bash
   node -e "
   const { drizzle } = require('drizzle-orm/node-postgres');
   const { Pool } = require('pg');
   " 
   ```
   Или проще — через Supabase SQL Editor:
   - Supabase → **SQL Editor → New query**
   - Вставь содержимое схемы и выполни

---

## Шаг 5. Не давать Render засыпать — cron-job.org

Бесплатный Render засыпает если 15 минут нет запросов. Чтобы этого не было:

1. Перейди на [cron-job.org](https://cron-job.org) → **Sign up** (без карты)
2. **Cronjobs → Create cronjob**:
   - **URL**: `https://nova-messenger.onrender.com/api/health`
     (замени `nova-messenger` на своё имя сервиса в Render)
   - **Execution schedule**: `Every 14 minutes`
3. Сохрани

> API `/api/health` всегда возвращает `{"ok":true}`. Пинг держит сервер живым.

---

## Итог

После всех шагов твой Nova будет доступен по адресу:
```
https://nova-messenger.onrender.com
```

Холодный старт (если всё же уснул) — 20-30 секунд. Потом работает мгновенно.

---

## Почему звонки не слышат друг друга

Если звонки соединяются но нет звука — скорее всего проблема с TURN-сервером:

- **Без TURN**: работает только если оба пользователя в одной Wi-Fi сети
- **С openrelay.metered.ca** (текущий): публичный сервер, иногда перегружен
- **С metered.ca free** (шаг 2): надёжный выделенный TURN, 50 GB/месяц бесплатно

Если после настройки metered.ca (переменные `VITE_TURN_*`) звонки всё равно не работают:
1. Открой DevTools → Console во время звонка
2. Найди `iceConnectionState` — если `failed` значит TURN не достучался
3. Проверь правильность логина/пароля из metered.ca dashboard
