# Script de instalación de dependencias para Windows PowerShell
Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
Set-Location frontend

if (Test-Path "package-lock.json") {
    Write-Host "Eliminando package-lock.json anterior..." -ForegroundColor Yellow
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "Ejecutando npm install..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n¡Dependencias instaladas correctamente!" -ForegroundColor Green
    Write-Host "Los errores de TypeScript deberían desaparecer ahora." -ForegroundColor Green
} else {
    Write-Host "`nError al instalar dependencias. Intenta ejecutar 'npm install' manualmente." -ForegroundColor Red
}

Set-Location ..

