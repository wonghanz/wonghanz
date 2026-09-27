// Bakes the third-party stat cards into static, animation-free SVG assets.
//
// Both renderers gate their text behind CSS animations: github-readme-stats puts
// `opacity: 0` on `.stagger`, and streak-stats writes `style="opacity: 0;
// animation: fadein ..."` on eleven separate groups. A README loads these as an
// <img>, so the whole card depends on the host honouring a CSS animation inside a
// rasterised SVG — and on the host being up at all (github-readme-stats.vercel.app
// already returns 503, and the working fork ignores `animations=false`).
//
// Stripping the animations makes the numbers render identically everywhere, and
// serving them from the repo removes the third-party dependency entirely.
//
// Usage: node tools/bake-stats.mjs [outDir]      default outDir = assets

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import https from 'node:https';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, process.argv[2] || 'assets');

const USER = 'wonghanz';

const CARDS = [
  {
    file: 'stats.svg',
    url: `https://github-readme-stats-anuraghazra1.vercel.app/api?username=${USER}`
      + '&bg_color=060a1a&border_color=3a2e12&title_color=FBBF24&text_color=FDE68A'
      + '&icon_color=F59E0B&hide=issues,contribs&hide_border=true&border_radius=22'
      + '&show_icons=true&count_private=true&card_width=430',
  },
  {
    file: 'streak.svg',
    url: `https://streak-stats.demolab.com?user=${USER}`
      + '&background=060a1a&border=3a2e12&ring=FBBF24&stroke=78350f&fire=F59E0B'
      + '&currStreakNum=FDE047&sideNums=FEF9C3&currStreakLabel=FDE68A'
      + '&sideLabels=FDE68A&dates=B08C3A&hide_border=true&border_radius=22&card_width=430',
  },
];

const STAGGER_RULE = /\.stagger\s*\{[^}]*\}/g;
const STYLE_BLOCK = /(<style[^>]*>)([\s\S]*?)(<\/style>)/g;

// An animation that never runs leaves the element at its declared start state, so
// every gate has to be resolved to the state the animation would have ended in.
// The opacity match is anchored so it cannot catch stroke-opacity / fill-opacity.
function deanimateDecls(decls) {
  return decls
    .replace(/animation(-delay)?\s*:[^;]*/gi, '')
    .replace(/(^|[^-\w])opacity\s*:\s*0(\.0+)?\s*;/gi, '$1opacity: 1;')
    .replace(/;\s*;/g, ';')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+(?=['"])/, '');
}

// Brace-matched, because `@keyframes x { from { } to { } }` defeats a lazy regex
// and the keyframe names themselves contain the substring we are scanning for.
function dropKeyframes(css) {
  let out = '';
  for (let i = 0; i < css.length;) {
    const at = css.indexOf('@keyframes', i);
    if (at < 0) { out += css.slice(i); break; }
    const open = css.indexOf('{', at);
    if (open < 0) { out += css.slice(i); break; }
    let depth = 0, j = open;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) { j++; break; }
    }
    out += css.slice(i, at);
    i = j;
  }
  return out;
}

function get(url, hops = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'bake-stats' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (hops > 3) return reject(new Error('too many redirects'));
        return resolve(get(new URL(res.headers.location, url).toString(), hops + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`${res.statusCode} for ${url}`));
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (d) => (body += d));
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function bake(svg, name) {
  if (!/<svg[\s>]/i.test(svg)) throw new Error(`${name}: response is not an SVG`);

  let out = svg;

  // The rank ring draws itself with rankAnimation; keep its final arc as a static
  // stroke-dashoffset so the ring still reads as a partial circle.
  const to = out.match(/@keyframes\s+rankAnimation\s*\{[\s\S]*?to\s*\{([^}]*)\}/i);
  const offset = to && to[1].match(/stroke-dashoffset\s*:\s*([-\d.]+)/);
  if (offset) {
    out = out.replace(/(\.rank-circle\s*\{[^}]*?)(\})/gi, `$1 stroke-dashoffset: ${offset[1]};$2`);
  }

  // Inline gates: style="opacity: 0; animation: fadein ..." (both quote styles).
  out = out.replace(/style=(['"])([^'"]*animation[^'"]*)\1/gi,
    (_, q, body) => `style=${q}${deanimateDecls(body)}${q}`);

  // Stylesheet gates: .stagger { opacity: 0; animation: ... }. The keyframes go too —
  // nothing references them once every declaration is static.
  out = out.replace(STYLE_BLOCK, (_, open, css, close) => {
    css = dropKeyframes(css);
    css = css.replace(STAGGER_RULE, (rule) => deanimateDecls(rule));
    return open + deanimateDecls(css) + close;
  });

  if (/animation(-delay)?\s*:/i.test(out)) {
    throw new Error(`${name}: an animation declaration survived the bake`);
  }
  if (!/xmlns=/.test(out)) {
    out = out.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return out;
}

mkdirSync(OUT, { recursive: true });

for (const card of CARDS) {
  const svg = bake(await get(card.url), card.file);
  writeFileSync(join(OUT, card.file), svg);
  console.log(`baked ${card.file} (${svg.length} bytes)`);
}
