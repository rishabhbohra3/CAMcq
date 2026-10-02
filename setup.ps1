# CAMcq - Windows Setup & Launcher
# Right-click this file and choose "Run with PowerShell"
# Or run from a PowerShell window:
#   powershell -ExecutionPolicy Bypass -File .\setup.ps1

Write-Host ""
Write-Host "  ===============================" -ForegroundColor Cyan
Write-Host "       CAMcq - MCQ Learner"      -ForegroundColor Cyan
Write-Host "  ===============================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

function Test-Node {
  try { Get-Command node -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

function Refresh-Path {
  $machine = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
  $user    = [System.Environment]::GetEnvironmentVariable("PATH", "User")
  $env:PATH = "$machine;$user;$env:ProgramFiles\nodejs;${env:ProgramFiles(x86)}\nodejs"
}

# --- 1. Ensure Node.js is available -----------------------------------------
if (-not (Test-Node)) {
  Write-Host "  Node.js not found. Installing via winget..." -ForegroundColor Yellow

  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: winget is not available on this system." -ForegroundColor Red
    Write-Host "  Please install Node.js manually from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
  }

  # Run winget. We deliberately do NOT rely on its exit code:
  # - exits 0 on fresh install
  # - exits non-zero with "No available upgrade found" if already installed
  # We re-check node availability afterwards instead.
  winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements | Out-Host
  Refresh-Path

  if (-not (Test-Node)) {
    Write-Host ""
    Write-Host "  Node.js was installed, but PATH has not refreshed in this session." -ForegroundColor Yellow
    Write-Host "  Please close this window and run setup.ps1 again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
  }
  Write-Host "  [OK] Node.js installed" -ForegroundColor Green
}
else {
  $nodeVer = node --version
  Write-Host "  [OK] Node.js $nodeVer found" -ForegroundColor Green
}

# --- 2. Ensure dependencies are fully installed -----------------------------
# We check for specific binaries instead of just node_modules/ because a
# partially-copied or interrupted install can leave node_modules in a bad
# state (this is what the "concurrently is not recognized" error was).
$depsOk = (Test-Path "node_modules\.bin\vite.cmd") -and
          (Test-Path "node_modules\.bin\concurrently.cmd") -and
          (Test-Path "node_modules\express")

if (-not $depsOk) {
  Write-Host "  Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed (exit code $LASTEXITCODE)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
  }
  Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
}
else {
  Write-Host "  [OK] Dependencies already installed" -ForegroundColor Green
}

# --- 3. Launch ---------------------------------------------------------------
Write-Host ""
Write-Host "  Starting CAMcq..." -ForegroundColor Cyan
Write-Host "  Drop your question JSON files into: data\questions\" -ForegroundColor Gray
Write-Host "  Browser will open at http://localhost:5173" -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

Start-Job -ScriptBlock {
  Start-Sleep -Seconds 4
  Start-Process "http://localhost:5173"
} | Out-Null

npm run dev
