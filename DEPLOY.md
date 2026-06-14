# Деплой Nova на Render + Supabase (бесплатно, без карты)

## Итог: что нужно

| Сервис | Роль | Карта? |
|--------|------|--------|
| **Supabase** | PostgreSQL база данных | ❌ Нет |
| **Render** | Хостинг Node.js сервера | ❌ Нет |
| **cron-job.org** | Пинг чтобы Render не засыпал | ❌ Нет |

> TURN-сервер для звонков встроен (openrelay) и работает **без регистрации**.
> Для более надёжной связи можно позже добавить TURN_URL/TURN_USER/TURN_CRED.

---

## Шаг 1. База данных — Supabase

1. Зайди на [supabase.com](https://supabase.com) → **Start your project** (GitHub / email, без карты)
2. **New project** → задай имя, придумай пароль, выбери регион **Frankfurt**
3. Подожди ~2 минуты пока проект запустится
4. Слева → **Settings → Database → Connection string**
5. Переключись на вкладку **Transaction** (важно!) → скопируй строку вида:
   ```
   postgresql://postgres.xxxx:ВАШ_ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
   Это и есть `DATABASE_URL`.

---

## Шаг 2. Деплой на Render

1. Загрузи проект на GitHub (если ещё нет)
2. Зайди на [render.com](https://render.com) → **Sign Up** (GitHub, без карты)

### Создать сервис

**New → Blueprint** (Render автоматически найдёт `render.yaml` в репозитории):
- Подключи GitHub репозиторий
- Render создаст сервис `nova-messenger` сам

**Или вручную — New → Web Service:**

| Поле | Значение |
|------|----------|
| Repository | Твой GitHub репо |
| Runtime | **Node** |
| Build Command | `npm install -g pnpm@10 && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build && BASE_PATH=/ pnpm --filter @workspace/pulse run build` |
| Start Command | `node --enable-source-maps ./artifacts/api-server/dist/index.mjs` |
| Instance Type | **Free** |

---

## Шаг 3. Переменные окружения

В Render → твой сервис → **Environment** → добавь:

| Ключ | Значение |
|------|----------|
| `DATABASE_URL` | Строка из Supabase (шаг 1) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Нажми «Generate» или вставь случайную строку (если Render не сгенерировал сам) |

Остальные переменные (`VAPID_*`, `TURN_*`) — опциональны, добавляй позже.

После сохранения нажми **Manual Deploy → Deploy latest commit**.

---

## Шаг 4. Не давать Render засыпать — cron-job.org

Бесплатный Render засыпает через 15 минут без запросов.

1. [cron-job.org](https://cron-job.org) → **Sign Up** → **Create cronjob**
2. URL: `https://nova-messenger.onrender.com/api/healthz`  
   *(замени `nova-messenger` на имя своего сервиса)*
3. Schedule: **Every 14 minutes** → Сохранить

---

## Частые ошибки

### `DATABASE_URL must be set`
Не добавлена переменная в Render → **Environment**.
Добавь `DATABASE_URL` со строкой из Supabase → Save Changes → Manual Deploy.

### `SSL connection required`
Supabase требует SSL. Это уже настроено в коде для production.
Если всё равно ошибка — добавь `?sslmode=require` в конец DATABASE_URL.

### `Cannot find module` или ошибки сборки
Сборка большого монорепо занимает 5–8 минут. Render Free может прервать по таймауту.
Решение: подожди, нажми **Retry** или используй вместо этого Docker (Blueprint).

### Звонки не работают
TURN-сервер встроен (openrelay, без регистрации). Если звук есть но плохое качество:
- Зарегистрируйся на [expressturn.com](https://expressturn.com) (бесплатно, только email) и добавь:
  - `TURN_URL` = `turn:relay.expressturn.com:3480`
  - `TURN_USER` = *(из дашборда)*
  - `TURN_CRED` = *(из дашборда)*

---

## Итог

После деплоя Nova будет доступна по адресу:
```
https://nova-messenger.onrender.com
```

Первый запуск после сна занимает ~20–30 секунд (cron-job.org предотвращает это).
