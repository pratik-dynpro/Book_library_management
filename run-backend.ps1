#requires -Version 5
<#
.SYNOPSIS
  Launch the FastAPI backend with auto-reload from any directory.

.DESCRIPTION
  Pins the working directory to the project root, activates the venv, then
  starts uvicorn on :8000. Safe to run from anywhere — it does not depend on
  your current PowerShell location.

  Stop with Ctrl+C.
#>

$ErrorActionPreference = 'Stop'

# Resolve project root from this script's own location, not from $PWD.
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

$Venv = Join-Path $ProjectRoot 'backend\.venv\Scripts\Activate.ps1'
if (-not (Test-Path $Venv)) {
    Write-Host "Virtual environment not found at $Venv" -ForegroundColor Red
    Write-Host "Recreate it with:" -ForegroundColor Yellow
    Write-Host "  cd `"$ProjectRoot\backend`""
    Write-Host "  python -m venv .venv"
    Write-Host "  .\.venv\Scripts\Activate.ps1"
    Write-Host "  pip install -r requirements.txt"
    Write-Host "  alembic -c alembic.ini upgrade head"
    exit 1
}

. $Venv

Write-Host ""
Write-Host "Project root : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "Python       : $((Get-Command python).Source)" -ForegroundColor DarkGray
Write-Host "Backend on   : http://localhost:8000   (docs: /docs   health: /healthz)" -ForegroundColor Cyan
Write-Host ""

python -m uvicorn backend.main:app --reload --port 8000
