# LOveRep

Private Constellation static QR landing page for GitHub Pages.

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
