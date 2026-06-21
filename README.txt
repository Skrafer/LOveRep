Как пользоваться
================

Постоянная ссылка после публикации на GitHub Pages:

https://skrafer.github.io/LOveRep/

QR-код qr-code.png уже ведет на эту ссылку.

Если GitHub Pages еще не включился:
1. Открой репозиторий GitHub.
2. Перейди в Settings -> Pages.
3. Выбери Deploy from a branch или GitHub Actions, если workflow уже запущен.
4. Подожди 1-3 минуты, пока GitHub опубликует сайт.

Где менять текст
================

- Главная фраза: index.html, блок <h1>
- Текст под фразой: index.html, класс message__text
- Текст после кнопки: index.html, блок id="secret"
- Нижние сменяющиеся фразы: script.js, массив phrases

QR
==

Чтобы пересобрать QR под другую ссылку:

python make_qr.py "https://твоя-публичная-ссылка"
