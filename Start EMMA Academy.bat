@echo off
cd /d "%~dp0"
title EMMA Academy

:: ── Check if Node.js is already installed ──────────────────────────
node --version >nul 2>&1
if %errorlevel% == 0 goto :start_server

echo Node.js not found. Installing...
echo.

:: ── Try winget (built into Windows 10/11) ──────────────────────────
winget --version >nul 2>&1
if %errorlevel% == 0 (
  echo Installing via Windows Package Manager...
  winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
  if %errorlevel% == 0 goto :refresh_path
  echo winget install failed, trying alternative method...
)

:: ── Fallback: download installer via PowerShell ────────────────────
echo Downloading Node.js installer from nodejs.org...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$lts = (Invoke-WebRequest 'https://nodejs.org/dist/index.json' | ConvertFrom-Json | Where-Object {$_.lts} | Select-Object -First 1);" ^
  "$ver = $lts.version;" ^
  "$url = \"https://nodejs.org/dist/$ver/node-$ver-x64.msi\";" ^
  "$out = \"$env:TEMP\node_lts.msi\";" ^
  "Write-Host \"Downloading Node.js $ver...\";" ^
  "Invoke-WebRequest -Uri $url -OutFile $out;" ^
  "Write-Host 'Installing...';" ^
  "Start-Process msiexec.exe -ArgumentList '/i', $out, '/quiet', '/norestart' -Wait;" ^
  "Remove-Item $out;" ^
  "Write-Host 'Done.'"

if %errorlevel% neq 0 (
  echo.
  echo ERROR: Could not install Node.js automatically.
  echo Please install it manually from https://nodejs.org
  echo Then run this file again.
  pause
  exit /b 1
)

:: ── Refresh PATH so node is found in this session ──────────────────
:refresh_path
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "MACHINE_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%b"
set "PATH=%MACHINE_PATH%;%USER_PATH%;%PATH%"

:: Verify installation succeeded
node --version >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo Node.js was installed but requires a system restart to take effect.
  echo Please restart your computer and run this file again.
  pause
  exit /b 1
)

echo Node.js installed successfully.
echo.

:: ── Find a free port (tries 8080, 3000, 3001, 8000, 8888, 9000) ────
:find_port
echo Searching for an available port...
for /f "delims=" %%p in ('powershell -NoProfile -Command "foreach ($port in @(8080,3000,3001,8000,8888,9000)) { try { $l=[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,$port); $l.Start(); $l.Stop(); Write-Output $port; break } catch {} }"') do set "PORT=%%p"

if not defined PORT (
  echo.
  echo ERROR: No available port found.
  echo All ports tested (8080, 3000, 3001, 8000, 8888, 9000) are blocked or in use.
  echo Please close other applications and try again.
  pause
  exit /b 1
)

echo [OK] Using port %PORT%
echo.

:: ── Start the local server ─────────────────────────────────────────
:start_server
echo Starting EMMA Academy local server on port %PORT%...
start "" "http://localhost:%PORT%/emma_academy.html"
node -e "var h=require('http'),fs=require('fs'),p=require('path'),port=%PORT%;h.createServer(function(req,res){var f=p.join('.',decodeURIComponent(req.url.split('?')[0]));fs.readFile(f,function(e,d){if(e){res.writeHead(404);res.end();}else{var ext=p.extname(f).slice(1);var t={html:'text/html',json:'application/json',wav:'audio/wav',mp3:'audio/mpeg',js:'text/javascript',css:'text/css'}[ext]||'application/octet-stream';res.writeHead(200,{'Content-Type':t,'Access-Control-Allow-Origin':'*'});res.end(d);}});}).listen(port,function(){console.log('Server running at http://localhost:'+port+'/emma_academy.html');console.log('');console.log('Close this window to stop the server.');});"
pause
