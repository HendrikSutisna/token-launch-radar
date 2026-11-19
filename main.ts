// The token launch radar: read a sealed DefiLlama snapshot, rank the
// pre-token protocols by the value a launch would be worth, and write the
// entry's files to /output (or MAKEFUN_OUTPUT_DIR).
//
// Run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
//
// The entry's files: board.json (the whole ranked board), data.js (the
// dashboard's dataset, written beside the page), dashboard/ (the static
// page, no network), screenshots/ (three captures of the page) and
// dossier.json (the file the judge reads, built by the kit's vendor code).
//
// Nothing is fetched and nothing is written outside the output directory:
// the model is the snapshot, and the numbers are the snapshot's own.

import { buildDossier } from './vendor/makefun-board.ts';
import {
  buildRadar,
  boardIssue,
  dataScript,
  MODEL_VERSION,
  parseSnapshot,
} from './lib/model.ts';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? join(here, 'out'));
const input = resolve(process.argv[2] === '--input' ? (process.argv[3] ?? '') : '/input/snapshot.json');

if (!existsSync(input)) {
  console.error(`snapshot not found: ${input}`);
  process.exit(1);
}

const snapshot = parseSnapshot(readFileSync(input, 'utf8'));
const { board, radar } = buildRadar(snapshot);

const issue = boardIssue(board, snapshot);
if (issue !== null) {
  console.error(`board refused: ${issue}`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
mkdirSync(join(out, 'dashboard'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });

writeFileSync(join(out, 'board.json'), `${JSON.stringify({ rows: board }, null, 2)}\n`);
writeFileSync(join(out, 'dashboard', 'data.js'), dataScript(radar));

// The page's own files, copied from dashboard/ next to this program.
for (const name of ['index.html', 'app.css', 'app.js']) {
  copyFileSync(join(here, 'dashboard', name), join(out, 'dashboard', name));
}

// The three captures of the page, made with a headless browser in this VM.
const shots = readdirSync(join(here, 'screenshots')).filter((n) => /\.(png|jpe?g)$/i.test(n)).sort();
if (shots.length < 3) {
  console.error(`screenshots: only ${shots.length} in screenshots/, need at least 3`);
  process.exit(1);
}
for (const name of shots) copyFileSync(join(here, 'screenshots', name), join(out, 'screenshots', name));

// The file the judge reads: the dashboard's source, then its screenshots.
writeFileSync(join(out, 'dossier.json'), buildDossier(out, {
  text_max_bytes: 65_536,
  screenshots: { max: 4, max_bytes: 524_288 },
  dashboard: { max_files: 400, max_bytes: 4_194_304 },
}));

const top = board[0]!;
const early = board.filter((r) => !r.on_watchlist).length;
console.log(`model ${MODEL_VERSION}: ${board.length} rows (${snapshot.watchlist.length} watchlist, ${early} early), ${shots.length} screenshots`);
console.log(`#1 ${top.name}: $${top.implied_value_usd.toLocaleString('en-US')} implied, TVL $${top.tvl_usd.toLocaleString('en-US')}, multiple ${top.model.multiple}`);
console.log(`dossier: ${(statSync(join(out, 'dossier.json')).size / 1024).toFixed(1)} KiB, board: ${(statSync(join(out, 'board.json')).size / 1024).toFixed(1)} KiB`);
