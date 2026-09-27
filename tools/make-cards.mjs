// Generates the glass project cards used by profile/README.md
// Usage: node tools/make-cards.mjs   -> writes assets/project-*.svg
// GitHub strips JS from READMEs, so these are committed as static SVG files.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

// Each card: href = null means the work is not open source, so the SVG renders
// no "OPEN" affordance and the README leaves it unlinked.
const cards = [
  {
    file: 'project-eloquent',
    title: 'Eloquent Lab',
    sub: 'Native iOS + Android exam-prep SaaS',
    href: 'https://github.com/wonghanz/Eloquent-Lab',
    repo: 'wonghanz/Eloquent-Lab',
    cta: 'OPEN SOURCE',
    accent: ['#22d3ee', '#3b82f6'],
    metrics: ['100+ MAU', '-90% grading latency', 'RM0 ad spend'],
    tags: ['SwiftUI', 'Jetpack Compose', 'RevenueCat', 'DeepSeek'],
  },
  {
    file: 'project-nodiguard',
    title: 'NodiGuard',
    sub: 'Zero-trust local AI proxy for coding agents',
    href: 'https://github.com/wonghanz/NodiGuard',
    repo: 'wonghanz/NodiGuard',
    cta: 'OPEN SOURCE',
    accent: ['#a3e635', '#22d3ee'],
    metrics: ['Leaked-key DLP', 'Local tokenisation', '16 GB VRAM purge'],
    tags: ['Python', 'TLS', 'Ollama', 'Linux'],
  },
  {
    file: 'project-plantx',
    title: 'PlantX / RHISS',
    sub: 'Agricultural telemetry + redundant power control',
    href: null,
    repo: 'EcoRise SEA Champion 2026',
    cta: 'PROPRIETARY',
    accent: ['#4ade80', '#a3e635'],
    metrics: ['-30% water', '+50% growth', 'Petrosains partner'],
    tags: ['ESP32', 'MicroPython', 'Sensor fusion', 'Solar/Wind'],
  },
  {
    file: 'project-capriguard',
    title: 'CapriGuard',
    sub: 'Livestock AIoT platform on a 300-head farm',
    href: null,
    repo: 'IoT Services Sdn. Bhd.',
    cta: 'PROPRIETARY',
    accent: ['#f472b6', '#8b5cf6'],
    metrics: ['300 goats', 'RFID edge units', 'Auto health triage'],
    tags: ['PHP', 'ESP32', 'REST', 'Gemini API'],
  },
  {
    file: 'project-transit',
    title: 'Transit Booking',
    sub: 'Seat selection + payment for a live intercity terminal',
    href: null,
    repo: 'Terminal Shahab Perdana',
    cta: 'PROPRIETARY',
    accent: ['#8b5cf6', '#22d3ee'],
    metrics: ['300+ DAU', 'Fiuu + FPX', 'QR boarding pass'],
    tags: ['Kotlin', 'Swift', 'Offline-first', 'On-site UX'],
  },
  {
    file: 'project-liquidglass',
    title: 'Liquid Glass on iOS',
    sub: 'Where this profile design came from',
    href: 'https://github.com/wonghanz/Telegram-iOS-Contest-2025',
    repo: 'wonghanz/Telegram-iOS-Contest-2025',
    cta: 'OPEN SOURCE',
    accent: ['#38bdf8', '#f0abfc'],
    metrics: ['Refraction shaders', 'iOS 13-18 backport', 'Telegram fork'],
    tags: ['Swift', 'Metal', 'Core Animation'],
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const chipW = (t) => Math.round(t.length * 6.9 + 22);
const FONT = "'Segoe UI',Inter,'Helvetica Neue',Arial,sans-serif";

function card(c, i) {
  const W = 560, H = 232;
  const id = (s) => `${s}${i}`;
  let x = 24;
  const chips = c.metrics.map((m) => {
    const w = chipW(m);
    const el = `<rect x="${x}" y="118" width="${w}" height="26" rx="13" fill="url(#${id('chip')})" stroke="${c.accent[0]}" stroke-opacity="0.34"/>
      <text x="${x + w / 2}" y="135" text-anchor="middle" font-family="${FONT}" font-size="11.5" font-weight="700" fill="#e6f2ff">${esc(m)}</text>`;
    x += w + 8;
    return el;
  }).join('\n      ');

  let tx = 24;
  const tags = c.tags.map((t, k) => {
    let el = '';
    if (k) {
      el += `<text x="${tx}" y="176" font-family="${FONT}" font-size="10.5" fill="#3d4d66">/</text>`;
      tx += 11;
    }
    el += `<text x="${tx}" y="176" font-family="${FONT}" font-size="10.5" letter-spacing="0.4" fill="#7f93b0">${esc(t)}</text>`;
    tx += Math.round(t.length * 5.9) + 11;
    return el;
  }).join('\n    ');

  const orbA = `<circle cx="118" cy="34" r="150" fill="url(#${id('a')})"><animate attributeName="cx" values="118;190;118" dur="${16 + i * 2}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" keyTimes="0;0.5;1"/></circle>`;
  const orbB = `<circle cx="510" cy="252" r="140" fill="url(#${id('b')})"><animate attributeName="cy" values="252;190;252" dur="${19 + i * 2}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" keyTimes="0;0.5;1"/></circle>`;
  // static copies inside the frosted layer: an animated feGaussianBlur re-filters every frame
  const frostA = `<circle cx="118" cy="34" r="150" fill="url(#${id('a')})"/>`;
  const frostB = `<circle cx="510" cy="252" r="140" fill="url(#${id('b')})"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)} - ${esc(c.sub)}">
  <defs>
    <linearGradient id="${id('bg')}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05070f"/><stop offset="0.5" stop-color="#0a1030"/><stop offset="1" stop-color="#05070f"/>
    </linearGradient>
    <radialGradient id="${id('a')}"><stop offset="0" stop-color="${c.accent[0]}" stop-opacity="0.5"/><stop offset="0.6" stop-color="${c.accent[0]}" stop-opacity="0.09"/><stop offset="1" stop-color="${c.accent[0]}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id('b')}"><stop offset="0" stop-color="${c.accent[1]}" stop-opacity="0.45"/><stop offset="0.6" stop-color="${c.accent[1]}" stop-opacity="0.08"/><stop offset="1" stop-color="${c.accent[1]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id('glass')}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.13"/><stop offset="0.55" stop-color="#ffffff" stop-opacity="0.04"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="${id('chip')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.15"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <linearGradient id="${id('shine')}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.14"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id('title')}" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="#f6fbff"/><stop offset="1" stop-color="${c.accent[0]}"/>
    </linearGradient>
    <filter id="${id('blur')}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
    <clipPath id="${id('clip')}"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22"/></clipPath>
  </defs>

  <g clip-path="url(#${id('clip')})">
    <rect width="${W}" height="${H}" fill="url(#${id('bg')})"/>
    ${orbA}
    ${orbB}
    <g clip-path="url(#${id('clip')})">
      <g filter="url(#${id('blur')})">${frostA}${frostB}<rect width="${W}" height="${H}" fill="#060a1a" opacity="0.66"/></g>
      <rect width="${W}" height="${H}" fill="url(#${id('glass')})"/>
      <rect x="-220" y="0" width="150" height="${H}" fill="url(#${id('shine')})" transform="skewX(-18)">
        <animate attributeName="x" values="-240;620" dur="8s" begin="${(i * 0.9).toFixed(1)}s" repeatCount="indefinite" calcMode="spline" keySplines="0.2 0 0.3 1" keyTimes="0;1"/>
      </rect>
    </g>
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.3"/>
    <rect x="70" y="1.6" width="420" height="1.2" fill="#ffffff" opacity="0.4"/>

    <!-- droplet mark -->
    <g transform="translate(24,24)">
      <circle cx="15" cy="15" r="14" fill="url(#${id('a')})"/>
      <circle cx="15" cy="15" r="11" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.55"/>
      <ellipse cx="11" cy="10.5" rx="3.6" ry="2.3" fill="#ffffff" fill-opacity="0.85" transform="rotate(-28 11 10.5)"/>
      <circle cx="15" cy="15" r="14" fill="none" stroke="${c.accent[0]}" stroke-opacity="0.6">
        <animate attributeName="r" values="14;24" dur="3s" begin="${(i * 0.5).toFixed(1)}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.6;0" dur="3s" begin="${(i * 0.5).toFixed(1)}s" repeatCount="indefinite"/>
      </circle>
    </g>

    <text x="62" y="44" font-family="${FONT}" font-size="21" font-weight="800" letter-spacing="0.2" fill="url(#${id('title')})">${esc(c.title)}</text>
    <text x="62" y="66" font-family="${FONT}" font-size="12.5" fill="#9fb3cf">${esc(c.sub)}</text>
    <line x1="24" y1="90" x2="536" y2="90" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="24" y="108" font-family="${FONT}" font-size="9.5" font-weight="700" letter-spacing="2" fill="#8399b8">SHIPPED IMPACT</text>
    ${chips}
    <text x="24" y="200" font-family="ui-monospace,'SFMono-Regular',Consolas,monospace" font-size="11" fill="#7f93b0">${esc(c.repo)}</text>
    ${tags}
    <g>
      <text x="506" y="205" text-anchor="end" font-family="${FONT}" font-size="11" font-weight="700" letter-spacing="1.2" fill="${c.href ? c.accent[0] : '#5d7093'}">${esc(c.cta)}</text>
${c.href ? `      <path d="M514 200 h20 m-6 -6 l6 6 l-6 6" fill="none" stroke="${c.accent[0]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <animate attributeName="stroke-opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite"/>
      </path>` : ''}
    </g>
  </g>
</svg>
`;
}

cards.forEach((c, i) => {
  writeFileSync(join(out, `${c.file}.svg`), card(c, i));
  console.log('wrote assets/' + c.file + '.svg');
});
