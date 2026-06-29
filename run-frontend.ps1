#requires -Version 5
<#
.SYNOPSIS
  Launch the Vite dev server from any directory.

.DESCRIPTION
  Pins the working directory to frontend/ regardless of where you invoke it
  from, then starts npm run dev. Stop with Ctrl+C.
#>

$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ProjectRoot 'frontend'

if (-not (Test-Path (Join-Path $FrontendDir 'node_modules'))) {
    Write-Host "node_modules not found in $FrontendDir" -ForegroundColor Red
    Write-Host "Run once:" -ForegroundColor Yellow
    Write-Host "  cd `"$FrontendDir`""
    Write-Host "  npm install"
    exit 1
}

Set-Location $FrontendDir

Write-Host ""
Write-Host "Frontend dir : $FrontendDir" -ForegroundColor DarkGray
Write-Host "App on       : http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

npm run dev
