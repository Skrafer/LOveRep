# Love backend

Этот backend нужен, чтобы сайт был не только статичной страницей: он раздает сайт, принимает событие открытия второй страницы и сохраняет его в `backend/data/events.jsonl`.

Запуск локально:

```powershell
python backend/server.py
```

После запуска:

- сайт: `http://127.0.0.1:8080/`
- health API: `http://127.0.0.1:8080/api/health`
- последние события: `http://127.0.0.1:8080/api/events`

GitHub Pages запускает только статические файлы, поэтому для настоящего постоянного backend этот сервер нужно отдельно разместить на Render, VPS, Railway или похожем хостинге. Если backend будет на другом домене, на странице можно задать:

```html
<script>
  window.LOVE_API_BASE = "https://your-backend.example.com";
</script>
```

и подключить этот скрипт перед `script.js`.
