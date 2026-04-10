/**
 * create_slim_json.js
 * Legge i JSON dalle tracce originali, rimuove audioData, crea i 3 file slim.
 * Eseguire: node create_slim_json.js
 *
 * Input:  ../original tracks/*.json
 * Output: emma_data_scorer.json   (array tracks 02-06)
 *         emma_data_focus.json    (array tracks 07-11)
 *         emma_data_stage.json    (object track 12)
 */

const fs   = require('fs');
const path = require('path');

const tracksDir = path.join(__dirname, '..', 'original tracks');
const outDir    = __dirname;

// Rimuove audioData dall'oggetto (mantiene audioFile e tutto il resto)
function slim(obj) {
  const s = Object.assign({}, obj);
  delete s.audioData;
  return s;
}

// Mappa traccia → gruppo
const scorerTracks = ['02', '03', '04', '05', '06'];
const focusTracks  = ['07', '08', '09', '10', '11'];
const stageTracks  = ['12'];

const scorerData = [];
const focusData  = [];
let   stageData  = null;

const files = fs.readdirSync(tracksDir).filter(f => f.endsWith('.json'));

for (const filename of files) {
  const trackNum = filename.match(/^(\d+)/)?.[1];
  if (!trackNum) continue;

  const num2 = trackNum.padStart(2, '0');
  const filePath = path.join(tracksDir, filename);

  console.log(`Lettura ${filename} (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(1)} MB)...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const slimData = slim(data);

  if (scorerTracks.includes(num2)) {
    scorerData.push(slimData);
  } else if (focusTracks.includes(num2)) {
    focusData.push(slimData);
  } else if (stageTracks.includes(num2)) {
    stageData = slimData;
  }
}

// Ordina per numero traccia
scorerData.sort((a, b) => {
  const na = parseInt((a.title || '').match(/^(\d+)/)?.[1] || 99);
  const nb = parseInt((b.title || '').match(/^(\d+)/)?.[1] || 99);
  return na - nb;
});
focusData.sort((a, b) => {
  const na = parseInt((a.title || '').match(/^(\d+)/)?.[1] || 99);
  const nb = parseInt((b.title || '').match(/^(\d+)/)?.[1] || 99);
  return na - nb;
});

// Scrivi file output
function writeJson(filename, data) {
  const outPath = path.join(outDir, filename);
  const json = JSON.stringify(data);
  fs.writeFileSync(outPath, json);
  console.log(`Scritto ${filename} (${(json.length / 1024).toFixed(1)} KB)`);
}

if (scorerData.length) writeJson('emma_data_scorer.json', scorerData);
else console.log('AVVISO: nessuna traccia Scorer (02-06) trovata');

if (focusData.length) writeJson('emma_data_focus.json', focusData);
else console.log('AVVISO: nessuna traccia Focus (07-11) trovata');

if (stageData) writeJson('emma_data_stage.json', stageData);
else console.log('AVVISO: nessuna traccia Stage (12) trovata');

console.log('\nFatto!');
console.log('Prossimo passo: copia i file WAV in EMMA ACADEMY/audio/');
console.log('  (stessi nomi dei file WAV in "original tracks/")');
