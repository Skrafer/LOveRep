# Private Constellation

Static QR landing page for GitHub Pages.

## Publish on GitHub Pages

1. Create an empty GitHub repository.
2. Push this folder to the repository.
3. In GitHub: Settings -> Pages -> Deploy from a branch -> `main` -> `/root`.
4. Open the Pages URL and regenerate `qr-code.png` with that URL:

```powershell
python make_qr.py "https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/"
```

