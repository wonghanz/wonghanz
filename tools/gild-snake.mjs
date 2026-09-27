// Post-processes Platane/snk output into a gold, glossy snake on a navy pond.
// Usage: node tools/gild-snake.mjs <srcDir> <outDir>
//
// Writes to a new directory rather than editing in place: Platane/snk runs in a
// container and leaves dist/ owned by root, so the runner user cannot overwrite it.
//
// The generated SVG paints every cell from CSS custom properties and paints the
// snake body through the `.s` class, so the restyle is injected as a trailing
// <style> block (equal specificity, later wins) instead of rewriting markup.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const [srcDir, outDir] = process.argv.slice(2);
if (!srcDir || !outDir) {
  console.error('usage: node tools/gild-snake.mjs <srcDir> <outDir>');
  process.exit(1);
}

const PALETTE = `:root{--cb:#ffffff08;--cs:#fbbf24;--ce:#0a1024;--c0:#101a33;--c1:#4a3512;--c2:#8a5f14;--c3:#c9941f;--c4:#fcd34d}`;

const GILD = `
<defs>
  <linearGradient id="goldBody" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff6cf"/>
    <stop offset="0.42" stop-color="#fbbf24"/>
    <stop offset="1" stop-color="#9a5b0a"/>
  </linearGradient>
  <linearGradient id="goldDot" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fde68a" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#78350f" stop-opacity="0.5"/>
  </linearGradient>
  <filter id="lift" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000000" flood-opacity="0.65"/>
    <feDropShadow dx="0" dy="0" stdDeviation="2.6" flood-color="#f59e0b" flood-opacity="0.55"/>
  </filter>
</defs>
<style>
  .s{fill:url(#goldBody);stroke:#7c4a0d;stroke-width:0.7;filter:url(#lift)}
  .c4{fill:url(#goldDot)}
  svg{background:transparent}
</style>`;

mkdirSync(outDir, { recursive: true });
let gilded = 0;
for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const from = join(srcDir, entry.name);
  const to = join(outDir, basename(entry.name));
  let body = readFileSync(from, 'utf8');
  if (entry.name.endsWith('.svg') && body.includes('</svg>')) {
    body = body.replace(/:root\{[^}]*\}/, PALETTE).replace('</svg>', `${GILD}\n</svg>`);
    gilded += 1;
  } else if (entry.name.endsWith('.svg')) {
    console.error(`gild-snake: ${entry.name} has no closing </svg> — snk output changed?`);
    process.exit(1);
  }
  writeFileSync(to, body);
}
console.log(`gild-snake: wrote ${outDir} with ${gilded} gilded svg(s)`);
