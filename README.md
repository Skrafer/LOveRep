# LOveRep

Private Constellation static QR landing page for GitHub Pages.

It also includes a small real backend in `backend/server.py`. GitHub Pages can host the frontend, while the backend can be deployed separately to Render/VPS/Railway or run locally.

## GitHub Pages

The site is prepared for:

```text
https://skrafer.github.io/LOveRep/
```

The included `qr-code.png` already points to that URL.

If you need to regenerate the QR:

```powershell
python make_qr.py "https://skrafer.github.io/LOveRep/"
```

## Publishing

Open repository settings:

```text
Settings -> Pages -> Build and deployment -> Source: Deploy from a branch
Branch: main
Folder: /root
```

GitHub will publish the site at `https://skrafer.github.io/LOveRep/`.

## Backend

Run the dynamic version locally:

```powershell
python backend/server.py
```

Then open:

```text
http://127.0.0.1:8080/
```

The API stores open events in `backend/data/events.jsonl`.
