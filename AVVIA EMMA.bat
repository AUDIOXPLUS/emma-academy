@echo off
cd /d "%~dp0"
title EMMA Academy

:: ── Find a free port (tries 8080, 3000, 3001, 8000, 8888, 9000) ────
echo Ricerca porta disponibile...
for /f "delims=" %%p in ('powershell -NoProfile -Command "foreach ($port in @(8080,3000,3001,8000,8888,9000)) { try { $l=[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,$port); $l.Start(); $l.Stop(); Write-Output $port; break } catch {} }"') do set "PORT=%%p"

if not defined PORT (
  echo.
  echo ERRORE: Nessuna porta disponibile trovata.
  echo Tutte le porte testate (8080, 3000, 3001, 8000, 8888, 9000) sono bloccate o occupate.
  echo Chiudi altre applicazioni e riprova.
  pause
  exit /b 1
)

echo [OK] Uso porta %PORT%
echo.

:: ── Avvio server ────────────────────────────────────────────────────
echo Avvio server EMMA Academy sulla porta %PORT%...
start "" "http://localhost:%PORT%/emma_academy.html"
node -e "var h=require('http'),fs=require('fs'),p=require('path'),port=%PORT%;h.createServer(function(req,res){var f=p.join('.',decodeURIComponent(req.url.split('?')[0]));fs.readFile(f,function(e,d){if(e){res.writeHead(404);res.end();}else{var ext=p.extname(f).slice(1);var t={html:'text/html',json:'application/json',wav:'audio/wav',mp3:'audio/mpeg',js:'text/javascript',css:'text/css'}[ext]||'application/octet-stream';res.writeHead(200,{'Content-Type':t,'Access-Control-Allow-Origin':'*'});res.end(d);}});}).listen(port,function(){console.log('Server attivo su http://localhost:'+port+'/emma_academy.html');console.log('Chiudi questa finestra per fermare il server.');});"
pause
