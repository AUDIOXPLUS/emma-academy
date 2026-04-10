/**
 * extract_emma_data.js
 * Estrae i JSON embedded dall'HTML e li salva come file separati.
 * Eseguire: node extract_emma_data.js
 *
 * Risultato:
 *   emma_data_stage.json   — dati Track 12 senza audioData
 *   emma_data_scorer.json  — dati Tracks 02-06 senza audioData
 *   emma_data_focus.json   — dati Tracks 07-11 senza audioData
 *   emma_academy.html      — riscritto con EMMA_EMBED_* = null
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'emma_academy.html');

console.log('Lettura emma_academy.html...');
const html = fs.readFileSync(htmlPath, 'utf8');
console.log(`File letto: ${(html.length / 1024 / 1024).toFixed(1)} MB`);

const startMarker = '/* EMMA_EMBED_START */';
const endMarker   = '/* EMMA_EMBED_END */';
const blockStart  = html.indexOf(startMarker);
const blockEnd    = html.indexOf(endMarker) + endMarker.length;

if (blockStart === -1 || blockEnd === -1) {
  console.error('Blocco EMMA_EMBED_START/END non trovato!');
  process.exit(1);
}

const block = html.slice(blockStart, blockEnd);
const lines  = block.split('\n');

// Estrai le variabili
const vars = {};
for (const line of lines) {
  const m = line.match(/^var (EMMA_EMBED_\w+) = (.+)$/);
  if (!m) continue;
  const varName = m[1];
  const rawVal  = m[2].trim().replace(/;$/, '');
  if (rawVal === 'null') continue;
  try {
    console.log(`Parsing ${varName} (${(rawVal.length / 1024 / 1024).toFixed(1)} MB)...`);
    vars[varName] = JSON.parse(rawVal);
    console.log(`  OK`);
  } catch(e) {
    console.error(`  Errore parsing ${varName}: ${e.message}`);
  }
}

// Rimuove audioData ricorsivamente mantenendo audioFile
function stripAudio(data) {
  if (Array.isArray(data)) return data.map(stripAudio);
  if (data && typeof data === 'object') {
    const slim = Object.assign({}, data);
    delete slim.audioData;
    // Ricorsione per oggetti annidati (es. instruments)
    for (const key of Object.keys(slim)) {
      if (slim[key] && typeof slim[key] === 'object') {
        slim[key] = stripAudio(slim[key]);
      }
    }
    return slim;
  }
  return data;
}

// Mappa variabile → nome file
const fileMap = {
  EMMA_EMBED_STAGE:  'emma_data_stage.json',
  EMMA_EMBED_SCORER: 'emma_data_scorer.json',
  EMMA_EMBED_FOCUS:  'emma_data_focus.json',
};

for (const [varName, filename] of Object.entries(fileMap)) {
  if (!vars[varName]) {
    console.log(`${varName}: nessun dato, skip.`);
    continue;
  }
  const slim = stripAudio(vars[varName]);
  const outPath = path.join(__dirname, filename);
  const json = JSON.stringify(slim);
  fs.writeFileSync(outPath, json);
  console.log(`Scritto ${filename} (${(json.length / 1024).toFixed(1)} KB)`);
}

// Riscrivi il blocco EMBED nell'HTML con dichiarazioni null
const newBlock =
  '/* EMMA_EMBED_START */\n' +
  'var EMMA_EMBED_STAGE = null;\n' +
  'var EMMA_EMBED_SCORER = null;\n' +
  'var EMMA_EMBED_FOCUS = null;\n' +
  'var EMMA_EMBED_BUILDER = null;\n' +
  '/* EMMA_EMBED_END */';

const newHtml = html.slice(0, blockStart) + newBlock + html.slice(blockEnd);
fs.writeFileSync(htmlPath, newHtml);
console.log(`\nHTML riscritto. Dimensione: ${(newHtml.length / 1024 / 1024).toFixed(1)} MB`);
console.log('\nFatto! Copia i file WAV in EMMA ACADEMY/audio/ con gli stessi nomi originali.');
