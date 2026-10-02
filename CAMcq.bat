@echo off
setlocal EnableDelayedExpansion

REM ===============================================================
REM   CAMcq - MCQ Learner   (Windows launcher)
REM   Just double-click this file to start the app.
REM ===============================================================

title CAMcq - MCQ Learner
cd /d "%~dp0"

echo.
echo   ===============================
echo        CAMcq - MCQ Learner
echo   ===============================
echo.

REM ---- 1. Ensure Node.js is available --------------------------------------
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo   Node.js not found. Attempting to install via winget...
  echo.
  where winget >nul 2>&1
  if !ERRORLEVEL! NEQ 0 (
    echo   ERROR: winget is not available on this system.
    echo   Please install Node.js manually from:  https://nodejs.org
    pause
    exit /b 1
  )

  REM We intentionally ignore winget's exit code. It returns non-zero
  REM with "No available upgrade found" when Node is already installed,
  REM which is not a real error. We re-test "where node" afterwards.
  winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements

  REM Refresh PATH for this session by adding the standard Node install dir
  set "PATH=%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%PATH%"

  where node >nul 2>&1
  if !ERRORLEVEL! NEQ 0 (
    echo.
    echo   Node.js was installed, but its PATH is not picked up in this window.
    echo   Please CLOSE this window and double-click CAMcq.bat again.
    pause
    exit /b 0
  )
  echo   [OK] Node.js installed
) else (
  for /f "delims=" %%v in ('node --version') do set NODE_VER=%%v
  echo   [OK] Node.js !NODE_VER! found
)

REM ---- 2. Ensure dependencies are fully installed --------------------------
REM Check for specific binaries, not just node_modules folder. A partial
REM or copied node_modules can be missing key tools like concurrently/vite.
set DEPS_OK=1
if not exist "node_modules\.bin\vite.cmd" set DEPS_OK=0
if not exist "node_modules\.bin\concurrently.cmd" set DEPS_OK=0
if not exist "node_modules\express" set DEPS_OK=0

if !DEPS_OK! EQU 0 (
  echo   Installing dependencies ^(this may take a minute^)...
  echo.
  call npm install
  if !ERRORLEVEL! NEQ 0 (
    echo.
    echo   ERROR: npm install failed.
    pause
    exit /b 1
  )
  echo   [OK] Dependencies installed
) else (
  echo   [OK] Dependencies already installed
)

echo.
echo   Starting CAMcq...
echo   Drop your question JSON files into:  data\questions\
echo   App will open in your browser at http://localhost:5173
echo.
echo   Press Ctrl+C in this window to stop the app.
echo.

REM ---- 3. Open browser after a short delay, then start the dev server ------
start "" /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:5173"

call npm run dev

echo.
echo   CAMcq stopped.
pause
endlocal
