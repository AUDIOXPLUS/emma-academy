EMMA ACADEMY 2026 — Deployment Instructions
============================================

OVERVIEW
--------
This is a static web application (HTML + JSON + audio files).
No backend, no database, no PHP or server-side processing required.
Any standard web server will work (Apache, Nginx, IIS, etc.).


FILE STRUCTURE
--------------
The folder must be uploaded exactly as provided:

  EMMA_ACADEMY_DEPLOY/
  ├── emma_academy.html          (main application, ~800 KB)
  ├── emma_data_scorer.json      (scoring data, tracks 02–06)
  ├── emma_data_focus.json       (focus data, tracks 07–11)
  ├── emma_data_stage.json       (stage data, track 12)
  └── audio/
      ├── 02 Position Left Overlay - EMMA 2026.wav
      ├── 03 Position Right Overlay - EMMA 2026.wav
      ├── 04 Position Center Overlay - EMMA 2026.wav
      ├── 05 Position Left-Center Overlay - EMMA 2026.wav
      ├── 06 Position Right-Center Overlay - EMMA 2026.wav
      ├── 07 Position Left Single - EMMA 2026.wav
      ├── 08 Position Right Single - EMMA 2026.wav
      ├── 09 Position Center Single - EMMA 2026.wav
      ├── 10 Position Left-Center Single - EMMA 2026.wav
      ├── 11 Position Right-Center Single - EMMA 2026.wav
      └── 12 Moving Track - EMMA 2026.wav


LOCAL TESTING (before publishing)
----------------------------------
IMPORTANT: The application cannot be tested by simply double-clicking
emma_academy.html. It must be served through a local web server.

THE EASIEST WAY — Windows (double-click, no setup needed)
  1. Double-click "Start EMMA Academy.bat" in this folder.
  2. If Node.js is not installed, the script will install it
     automatically (requires internet connection, takes ~2 minutes).
  3. Your browser will open automatically with the application running.
  4. To stop the server: close the black terminal window.

  Note: If Node.js installation requires a system restart, restart
  your computer and double-click the bat file again.

ALTERNATIVE — Python (Mac / Linux / Windows)
  1. Open a terminal and navigate to this folder:
       cd path/to/EMMA_ACADEMY_DEPLOY
  2. Run:
       python -m http.server 8080
  3. Open your browser at: http://localhost:8080/emma_academy.html
  4. To stop: press Ctrl+C in the terminal.

WHAT TO TEST
  - Click "Position Score Simulator" → tracks load and audio plays
  - Click "Focus Score"             → tracks load and audio plays
  - Click "Stage Score"             → track loads and audio plays
  - If any section is empty or audio does not play, the "audio/"
    folder or a JSON file may be missing or placed in the wrong location.


DEPLOYMENT STEPS (publishing to the website)
---------------------------------------------
1. Upload the entire contents of this folder to a web-accessible
   directory on the server.
   Example paths: /public_html/emma/  or  /var/www/html/emma/

2. Make sure the "audio" subfolder and all 11 WAV files are included.
   The application will not play audio if these files are missing.

3. The application will be accessible at the URL of the folder:
   https://yoursite.com/emma/emma_academy.html


CRITICAL REQUIREMENT
--------------------
The three JSON files and the "audio" folder MUST be in the same
directory as emma_academy.html.

Do NOT move emma_academy.html to a different folder without also
moving the JSON files and the audio folder alongside it.


SERVER NOTES
------------
- No special server configuration is needed.
- The audio WAV files range from ~4 MB to ~19 MB each (~67 MB total).
  Please ensure the server does not have a restrictive file size limit
  for static file serving (most servers have no such limit by default).
- If the server supports gzip or brotli compression for static files,
  enabling it will slightly speed up delivery of the JSON files
  (optional, not required).
- The application uses the Web Audio API and requires a modern browser
  (Chrome, Edge, Firefox, or Safari — latest versions recommended).


CONTACT
-------
If you have any questions about the files or the application,
please contact Francesco Richichi.
