/*
 * Build emma_academy_standalone.html — a single self-contained file
 * with JSON data, WAV audio, TAP presets and the logo embedded as
 * data: URIs. The result opens with file:// (no server needed) and
 * is OS-independent.
 *
 * Run from this folder:   node build_standalone.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC_HTML = path.join(ROOT, 'emma_academy.html');
const OUT_HTML = path.join(ROOT, 'emma_academy_standalone.html');

const t0 = Date.now();
function log(msg) { console.log('[' + ((Date.now() - t0) / 1000).toFixed(1) + 's] ' + msg); }

function b64(p) { return fs.readFileSync(p).toString('base64'); }
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

log('Reading HTML...');
let html = fs.readFileSync(SRC_HTML, 'utf8');
const origLen = html.length;

log('Reading JSON data...');
const stage    = readJson(path.join(ROOT, 'emma_data_stage.json'));
const position = readJson(path.join(ROOT, 'emma_data_position.json'));
const focus    = readJson(path.join(ROOT, 'emma_data_focus.json'));

log('Encoding audio (' + 11 + ' WAV files)...');
const audioDir = path.join(ROOT, 'audio');
const audioMap = {};
for (const f of fs.readdirSync(audioDir).filter(n => /\.wav$/i.test(n))) {
  audioMap[f] = 'data:audio/wav;base64,' + b64(path.join(audioDir, f));
}
log('  ' + Object.keys(audioMap).length + ' files embedded');

log('Encoding TAP presets...');
const tapNames = [
  '13_Ocean_Drive.tap',
  '14_One_Fine_Day.tap',
  '15_Coming_Back_to_You.tap',
  '16_Should_Have_Done_it_Like_This.tap',
];
const tapPresets = tapNames.map(n =>
  'data:application/json;base64,' + b64(path.join(ROOT, 'tap-presets', n))
);

log('Encoding logo...');
const logoDataUri = 'data:image/webp;base64,' + b64(path.join(ROOT, 'emma_logo.webp'));

log('Patching HTML...');

// 1. Populate the EMMA_EMBED_* stub + add the audio map alongside it.
//    Use a CRLF/LF-tolerant regex rather than literal string match.
const embedRe = /\/\* EMMA_EMBED_START \*\/[\s\S]*?\/\* EMMA_EMBED_END \*\//;
if (!embedRe.test(html)) throw new Error('EMMA_EMBED stub not found');

const embedFilled = '/* EMMA_EMBED_START */\n' +
  'var EMMA_EMBED_STAGE = ' + JSON.stringify(stage) + ';\n' +
  'var EMMA_EMBED_POSITION = ' + JSON.stringify(position) + ';\n' +
  'var EMMA_EMBED_FOCUS = ' + JSON.stringify(focus) + ';\n' +
  'var EMMA_EMBED_BUILDER = null;\n' +
  'var EMMA_AUDIO_DATA_URIS = ' + JSON.stringify(audioMap) + ';\n' +
  '/* EMMA_EMBED_END */';

html = html.replace(embedRe, embedFilled);

// 2. Replace audio fetches (3 occurrences with identical shape).
const audioFetchRe = /fetch\('audio\/'\s*\+\s*encodeURIComponent\(([^)]+)\)\)/g;
const audioMatches = (html.match(audioFetchRe) || []).length;
if (audioMatches !== 3) throw new Error('Expected 3 audio fetches, found ' + audioMatches);
html = html.replace(audioFetchRe, "fetch(EMMA_AUDIO_DATA_URIS[$1] || ('audio/' + encodeURIComponent($1)))");
log('  patched ' + audioMatches + ' audio fetch sites');

// 3. Replace TA_PRESETS array with embedded data: URIs.
const tapArrRe = /const TA_PRESETS = \[\s*'tap-presets\/13_Ocean_Drive\.tap',\s*'tap-presets\/14_One_Fine_Day\.tap',\s*'tap-presets\/15_Coming_Back_to_You\.tap',\s*'tap-presets\/16_Should_Have_Done_it_Like_This\.tap'\s*\];/;
if (!tapArrRe.test(html)) throw new Error('TA_PRESETS array not found');
html = html.replace(tapArrRe, 'const TA_PRESETS = ' + JSON.stringify(tapPresets) + ';');
log('  patched TA_PRESETS (' + tapPresets.length + ' entries)');

// 4. Replace logo references.
const logoRe = /src="emma_logo\.webp"/g;
const logoMatches = (html.match(logoRe) || []).length;
if (logoMatches < 1) throw new Error('emma_logo.webp src reference not found');
html = html.replace(logoRe, 'src="' + logoDataUri + '"');
log('  patched ' + logoMatches + ' logo references');

log('Writing output...');
fs.writeFileSync(OUT_HTML, html);

const outMB = (html.length / 1024 / 1024).toFixed(1);
const inKB  = (origLen / 1024).toFixed(1);
log('Done: ' + path.basename(OUT_HTML) + '  ' + outMB + ' MB  (from ' + inKB + ' KB original)');
