// Gobble's Great Escape — a turkey escape game for make.fun.
// Entry program (Node 22, standard library only): it hands the game in by
// copying this repository's game/ and screenshots/ into the output
// directory and writing /output/dossier.json with buildDossier from the
// vendored make.fun library. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');

mkdirSync(outputDir, { recursive: true });

// Start from a clean output so a stale file can never leak into the entry.
rmSync(join(outputDir, 'game'), { recursive: true, force: true });
rmSync(join(outputDir, 'screenshots'), { recursive: true, force: true });
rmSync(join(outputDir, 'dossier.json'), { force: true });

cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: game/ at most 993 files and 48 MiB, index.html at
// most 1 MiB, screenshots at most 4 files of 256 KiB each, dossier at most
// 1.5 MiB of text (text_max_bytes). Both runs write the same bytes.
const dossierPath = join(outputDir, 'dossier.json');
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(dossierPath, dossier);

// Read the dossier back so a truncated or failed write is caught here,
// not by the scorer, and report what was handed in. The dossier is JSON
// with the screenshots embedded as base64 and the game text under "text".
const writtenBack = JSON.parse(readFileSync(dossierPath, 'utf8'));
if (
  writtenBack.cover !== 0 ||
  !Array.isArray(writtenBack.images) ||
  writtenBack.images.length !== 4 ||
  typeof writtenBack.text !== 'string' ||
  !writtenBack.text.startsWith('## Game')
) {
  throw new Error('dossier.json read-back mismatch after write');
}
console.log(
  `Gobble's Great Escape -> ${outputDir}: dossier ${dossier.length} bytes, ` +
  `${writtenBack.images.length} screenshots, ${writtenBack.text.length} text chars`,
);
