// Amazone Online — сервер обновлений игры
// Запускается на Render.com (бесплатно)
// Раздаёт manifest.json и файлы сборки игры

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// Папка с файлами игры (кладёшь сюда game.exe, pak-файлы и т.д.)
const FILES_DIR = path.join(__dirname, 'files');

// Создаём папку files если её нет
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// ---- Корень — просто проверка что сервер жив ----
app.get('/', (_req, res) => {
  res.json({
    name:   'Amazone Online Update Server',
    status: 'running',
    time:   new Date().toISOString()
  });
});

// ---- GET /api/manifest — отдаём манифест обновлений ----
app.get('/api/manifest', (_req, res) => {
  const manifestPath = path.join(__dirname, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: 'manifest.json не найден на сервере' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка чтения manifest.json: ' + e.message });
  }
});

// ---- GET /files/:filename — скачать файл игры ----
// Поддерживает вложенные пути: /files/data/textures.pak
app.get('/files/*', (req, res) => {
  // Вырезаем префикс /files/
  const relative = req.params[0];

  // Защита от path traversal (выход за пределы FILES_DIR)
  const absolute = path.resolve(FILES_DIR, relative);
  if (!absolute.startsWith(FILES_DIR + path.sep) && absolute !== FILES_DIR) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  if (!fs.existsSync(absolute)) {
    return res.status(404).json({ error: `Файл не найден: ${relative}` });
  }

  res.download(absolute, path.basename(absolute), (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Ошибка отправки файла' });
    }
  });
});

// ---- Запуск ----
app.listen(PORT, () => {
  console.log(`[update-server] Запущен на порту ${PORT}`);
  console.log(`[update-server] Манифест: http://localhost:${PORT}/api/manifest`);
  console.log(`[update-server] Файлы:    http://localhost:${PORT}/files/<имя_файла>`);
});
