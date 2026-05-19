# Script para iniciar backend e frontend em paralelo
Write-Host "Iniciando Dashboard Valcann..." -ForegroundColor Cyan

# Verificar se o .env do backend existe
if (-not (Test-Path "backend\.env")) {
    Write-Host "AVISO: backend\.env nao encontrado. Copie backend\.env.example para backend\.env e configure as credenciais." -ForegroundColor Yellow
    exit 1
}

Write-Host "Iniciando Backend (porta 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Iniciando Frontend (porta 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Dashboard disponivel em: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API disponivel em:       http://localhost:3001" -ForegroundColor Cyan
