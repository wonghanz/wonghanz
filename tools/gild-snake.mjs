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

const PALETTE = `:root{--cb:#ffffff14;--cs:#fbbf24;--ce:#131d3a;--c0:#2b3d63;--c1:#8a6516;--c2:#c8901c;--c3:#f0b429;--c4:#ffe066}`;

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
  <radialGradient id="crystal" cx="0.34" cy="0.28" r="0.85">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset="0.5" stop-color="#d8ecff"/>
    <stop offset="1" stop-color="#5f83b5"/>
  </radialGradient>
  <filter id="lift" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000000" flood-opacity="0.65"/>
    <feDropShadow dx="0" dy="0" stdDeviation="2.6" flood-color="#f59e0b" flood-opacity="0.55"/>
  </filter>
</defs>
<style>
  .s{fill:url(#goldBody);stroke:#7c4a0d;stroke-width:0.7;filter:url(#lift)}
  .c4{fill:url(#goldDot)}
  .face{fill:none;stroke:none;filter:none}
  svg{background:transparent}
</style>
<!-- The head is segment s0, so the face group borrows its class and rides the exact
     same keyframed translate. Blink uses ry on ellipses: animating transform here
     would fight the CSS keyframes that move the snake. -->
<g class="s s0 face">
  <ellipse cx="4.6" cy="10.6" rx="2" ry="1.1" fill="#f472b6" opacity="0.4"/>
  <ellipse cx="11.4" cy="10.6" rx="2" ry="1.1" fill="#f472b6" opacity="0.4"/>
  <ellipse cx="5.5" cy="6" rx="2.5" ry="2.5" fill="url(#crystal)" stroke="#fff6cf" stroke-opacity="0.7" stroke-width="0.5">
    <animate attributeName="ry" values="2.5;2.5;0.25;2.5;2.5" keyTimes="0;0.86;0.9;0.94;1" dur="5.4s" repeatCount="indefinite"/>
  </ellipse>
  <ellipse cx="10.5" cy="6" rx="2.5" ry="2.5" fill="url(#crystal)" stroke="#fff6cf" stroke-opacity="0.7" stroke-width="0.5">
    <animate attributeName="ry" values="2.5;2.5;0.25;2.5;2.5" keyTimes="0;0.86;0.9;0.94;1" dur="5.4s" repeatCount="indefinite"/>
  </ellipse>
  <ellipse cx="6.1" cy="6.2" rx="1.15" ry="1.15" fill="#0b1220">
    <animate attributeName="ry" values="1.15;1.15;0.12;1.15;1.15" keyTimes="0;0.86;0.9;0.94;1" dur="5.4s" repeatCount="indefinite"/>
  </ellipse>
  <ellipse cx="11.1" cy="6.2" rx="1.15" ry="1.15" fill="#0b1220">
    <animate attributeName="ry" values="1.15;1.15;0.12;1.15;1.15" keyTimes="0;0.86;0.9;0.94;1" dur="5.4s" repeatCount="indefinite"/>
  </ellipse>
  <circle cx="4.8" cy="5.1" r="0.7" fill="#ffffff" opacity="0.95">
    <animate attributeName="opacity" values="0.95;0.95;0;0.95;0.95" keyTimes="0;0.86;0.9;0.94;1" dur="5.4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="9.8" cy="5.1" r="0.7" fill="#ffffff" opacity="0.95">
    <animate attributeName="opacity" values="0.95;0.95;0;0.95;0.95" keyTimes="0;0.86;0.9;0.94;1" dur="5.4s" repeatCount="indefinite"/>
  </circle>
</g>`;

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
