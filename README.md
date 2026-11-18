# Amazone Online — Сервер обновлений

Простой Node.js сервер для раздачи обновлений игры через Render.com (бесплатно).

---

## Структура папки

```
update-server/
  server.js       — сам сервер
  package.json    — зависимости
  manifest.json   — список версий и файлов
  .gitignore
  files/          — сюда кладёшь файлы игры
    game.exe
    data/
      textures.pak
```

---

## Как задеплоить на Render.com (один раз)

### 1. Загрузи update-server на GitHub

Создай отдельный репозиторий для сервера (например `amazone-update-server`).
Загрузи туда всё содержимое папки `update-server/` (не саму папку, а её содержимое).

Файлы игры (`files/`) тоже загружай туда — они будут раздаваться сервером.

### 2. Зарегистрируйся на Render.com

Зайди на https://render.com и войди через GitHub.

### 3. Создай новый Web Service

- Нажми **New → Web Service**
- Выбери репозиторий `amazone-update-server`
- Настройки:
  - **Runtime:** Node
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`
  - **Instance Type:** Free
- Нажми **Deploy**

Через 1-2 минуты сервер запустится. Render выдаст тебе URL вида:
```
https://amazone-update-server.onrender.com
```

### 4. Укажи этот URL в лаунчере

В настройках лаунчера (или в config.json) поставь:
```
Сервер обновлений: https://amazone-update-server.onrender.com
```

---

## Как обновить игру

### Шаг 1 — Добавь новые файлы игры

Положи обновлённые файлы в папку `files/` репозитория.
Можно заменить существующие или добавить новые.

### Шаг 2 — Обнови manifest.json

Подними `latestVersion` и добавь новый блок в `updates`:

```json
{
  "latestVersion": 2,
  "updates": [
    {
      "version": 1,
      "description": "Первая версия",
      "files": [
        { "targetPath": "game.exe",          "downloadUrl": "/files/game.exe" },
        { "targetPath": "data/textures.pak", "downloadUrl": "/files/data/textures.pak" }
      ]
    },
    {
      "version": 2,
      "description": "Патч 1.1 — исправления",
      "files": [
        { "targetPath": "game.exe", "downloadUrl": "/files/game.exe" }
      ]
    }
  ]
}
```

> Старые блоки не удаляй — они нужны игрокам у которых совсем старая версия.
> В новом блоке указывай только изменившиеся файлы.

### Шаг 3 — Запушь изменения в GitHub

```
git add .
git commit -m "Обновление v2"
git push
```

Render.com автоматически перезапустит сервер с новыми файлами через ~1 минуту.

---

## Правила именования

| `targetPath` в manifest.json | Путь к файлу в папке `files/` |
|---|---|
| `"game.exe"` | `files/game.exe` |
| `"data/textures.pak"` | `files/data/textures.pak` |
| `"maps/city.bin"` | `files/maps/city.bin` |

`targetPath` — куда файл ляжет в папке игры у игрока.
`downloadUrl` — путь для скачивания с сервера (начинается с `/files/`).

---

## Проверка что сервер работает

Открой в браузере:
- `https://ВАШ-СЕРВЕР.onrender.com/` — должен ответить JSON со статусом
- `https://ВАШ-СЕРВЕР.onrender.com/api/manifest` — должен вернуть manifest.json
