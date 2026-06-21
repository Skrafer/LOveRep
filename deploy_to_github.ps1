param(
  [Parameter(Mandatory = $true)]
  [string]$RemoteUrl
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

git remote remove origin 2>$null
git remote add origin $RemoteUrl
git add .
git commit -m "Update site" 2>$null
git push -u origin main

Write-Host ""
Write-Host "Now enable GitHub Pages:"
Write-Host "Settings -> Pages -> Deploy from a branch -> main -> /root"
Write-Host ""
Write-Host "After GitHub shows the Pages URL, regenerate QR:"
Write-Host 'python make_qr.py "https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/"'
