/**
 * Generator for Om Thakur's GitHub profile ("Engineering Monograph", Vol. I)
 * Emits pure self-contained SVGs that render through GitHub's camo proxy.
 *
 * Theme: warm editorial paper (#FAF6F1 / #FDFCFA), ink (#1A1816), and terracotta (#9E3D2B).
 *
 * Run: node build.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

const USER = "MonsterFlick";

// Monograph palette (matches omthakur.in design tokens)
const C = {
  paper: "#FAF6F1",
  card: "#FDFCFA",
  ivory: "#F4EDE2",
  sand: "#EDE4D9",
  parchment: "#E2D5C6",
  rule: "#D4C3AF",
  borderDark: "#C4AF98",
  ink: "#1A1816",
  charcoal: "#2C2825",
  body: "#3A342E",
  muted: "#5A524A",
  terracotta: "#9E3D2B",
  ember: "#E07A5F",
  burgundy: "#7A2E20",
  olive: "#566449",
  oliveDark: "#3E4935",
  mist: "#A89F91",
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Standard typographic stylesheet injected into every SVG
const BASE_CSS = `
text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-rendering: geometricPrecision; -webkit-font-smoothing: antialiased; }
.serif { font-family: "Playfair Display", "Georgia", "Iowan Old Style", "Apple Garamond", "Times New Roman", serif; }
.mono { font-family: "Geist Mono", "JetBrains Mono", "SF Mono", Menlo, Consolas, "Courier New", monospace; }
.sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

.draw { animation: draw 1.6s cubic-bezier(.22, 1, .36, 1) forwards; }
.fade { animation: fade 1.1s cubic-bezier(.22, 1, .36, 1) both; }
.rise { animation: rise 1.1s cubic-bezier(.22, 1, .36, 1) both; }
.pulse { animation: pulse 2.6s ease-in-out infinite; }

@keyframes draw { from { stroke-dashoffset: var(--len, 600); } to { stroke-dashoffset: 0; } }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .55; transform: scale(.93); } }
`;

const svg = (w, h, desc, body, extraCss = "") =>
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>${esc(desc)}</title>
  <defs>
    <style>${BASE_CSS}${extraCss}</style>
  </defs>
  ${body}
</svg>`;

const delay = (d) => `animation-delay: ${d.toFixed(2)}s;`;

// Text builder helper
const t = (x, y, text, { cls = "", size = 14, weight = 400, fill = C.ink, ls = 0, anchor = "start", italic = false, style = "" } = {}) => {
  const styles = [
    size ? `font-size:${size}px` : "",
    weight ? `font-weight:${weight}` : "",
    fill ? `fill:${fill}` : "",
    ls ? `letter-spacing:${ls}px` : "",
    anchor !== "start" ? `text-anchor:${anchor}` : "",
    italic ? "font-style:italic" : "",
    style,
  ]
    .filter(Boolean)
    .join(";");
  return `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ""}${styles ? ` style="${styles}"` : ""}>${esc(text)}</text>`;
};

// Line helper
const line = (x1, y1, x2, y2, stroke = C.rule, { width = 1, dash = "", cap = "round", drawDelay = null } = {}) => {
  const len = Math.hypot(x2 - x1, y2 - y1).toFixed(1);
  const anim =
    drawDelay === null ? "" : ` class="draw" stroke-dasharray="${len}" style="--len:${len};${delay(drawDelay)}"`;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${
    dash ? ` stroke-dasharray="${dash}"` : ""
  }${anim}/>`;
};

// Pulsing "live" dot with expanding wave
const ping = (cx, cy, color, r = 4, begin = "0s") =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1.8">` +
  `<animate attributeName="r" values="${r};${(r * 3.2).toFixed(1)}" dur="2.2s" begin="${begin}" repeatCount="indefinite"/>` +
  `<animate attributeName="opacity" values=".75;0" dur="2.2s" begin="${begin}" repeatCount="indefinite"/></circle>`;

const diamond = (cx, cy, s, fill, cls = "") =>
  `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" fill="${fill}" transform="rotate(45 ${cx} ${cy})"${
    cls ? ` class="${cls}"` : ""
  }/>`;

// Paper card container with stitched border
const frame = (w, h, { fill = C.paper, stroke = C.parchment, stitch = C.rule } = {}) =>
  `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
  `<rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="8" fill="none" stroke="${stitch}" stroke-opacity=".55" stroke-dasharray="1 5" stroke-linecap="round"/>`;

const wrap = (s, max) => {
  const out = [];
  let cur = "";
  for (const word of s.split(" ")) {
    if ((cur + " " + word).trim().length > max) {
      out.push(cur.trim());
      cur = word;
    } else cur += " " + word;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

const monoW = (s, size, ls = 0) => s.length * (size * 0.6 + ls);

const write = (name, content) => {
  writeFileSync(join(OUT, name), content, "utf8");
  console.log("  ✓ assets/" + name);
};

// ─────────────────────────────────────────────────────────────
//  1. HEADER — Monograph masthead with animated book
// ─────────────────────────────────────────────────────────────
function buildHeader() {
  const W = 1200;
  const H = 484;

  const typed = "$ whoami → Founding Software Engineer @ Krishora Technologies";
  const charW = 9;
  const n = typed.length;
  const steps = Array.from({ length: n + 1 }, (_, i) => (i * charW).toFixed(1)).join(";");
  const caretSteps = Array.from({ length: n + 1 }, (_, i) => (52 + i * charW).toFixed(1)).join(";");
  const typeDur = (n * 0.045).toFixed(2);

  const chips = [
    { big: "15m → 4s", small: "queue sync" },
    { big: "~700 ms", small: "voice pipeline" },
    { big: "SoWeBuild", small: "agency studio" },
  ];
  let cx = 52;
  const chipSvg = chips
    .map((c, i) => {
      const bigW = c.big.length * 17 * 0.56;
      const smallW = monoW(c.small, 11, 0.6);
      const w = 14 + bigW + 10 + smallW + 16;
      const g =
        `<g class="rise" style="${delay(1.6 + i * 0.15)}">` +
        `<rect x="${cx}" y="398" width="${w.toFixed(0)}" height="36" rx="7" fill="${C.card}" stroke="${C.parchment}" stroke-width="1.2"/>` +
        t(cx + 14, 422, c.big, { cls: "serif", size: 17, weight: 800, fill: C.terracotta }) +
        t(cx + 14 + bigW + 10, 421, c.small.toUpperCase(), { cls: "mono", size: 11, fill: C.muted, weight: 600, ls: 0.6 }) +
        `</g>`;
      cx += w + 12;
      return g;
    })
    .join("");

  const pageW = 216;
  const pageH = 264;
  const spine = 928;
  const top = 108;

  const lines = (x0, ys, ws) =>
    ys
      .map(
        (y, i) =>
          `<rect x="${x0}" y="${y}" width="${ws[i % ws.length]}" height="5" rx="2.5" fill="${C.parchment}" opacity=".85"/>`
      )
      .join("");

  const bars = [0.92, 0.68, 0.84, 0.45, 0.76]
    .map((pct, i) => {
      const y = 188 + i * 14;
      const bw = (pageW - 48) * pct;
      return (
        `<rect x="948" y="${y}" width="${pageW - 48}" height="7" rx="3.5" fill="${C.ivory}"/>` +
        `<rect x="948" y="${y}" width="${bw.toFixed(0)}" height="7" rx="3.5" fill="${
          i % 2 ? C.terracotta : C.olive
        }"/>`
      );
    })
    .join("");

  const css = `
.leaf { transform-origin: ${spine}px ${top}px; transform-box: fill-box; animation: turn 7.5s cubic-bezier(.45, 0, .25, 1) infinite; }
.leafShade { animation: shade 7.5s cubic-bezier(.45, 0, .25, 1) infinite; }
.ribbon { transform-origin: 1112px ${top}px; animation: flutter 5s ease-in-out infinite; }
@keyframes turn {
  0%, 18%   { transform: rotateY(0deg) skewY(0deg); }
  42%, 68%  { transform: rotateY(-172deg) skewY(-2deg); }
  92%, 100% { transform: rotateY(0deg) skewY(0deg); }
}
@keyframes shade {
  0%, 18%   { opacity: 0; }
  30%, 55%  { opacity: .28; }
  72%, 100% { opacity: 0; }
}
@keyframes flutter {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(2.8deg); }
}
`;

  const body =
    frame(W, H) +
    `<defs>
      <linearGradient id="spineL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#2C2318" stop-opacity=".25"/><stop offset="1" stop-color="#2C2318" stop-opacity="0"/></linearGradient>
      <linearGradient id="spineR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2C2318" stop-opacity=".3"/><stop offset="1" stop-color="#2C2318" stop-opacity="0"/></linearGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
      <clipPath id="typeClip"><rect x="52" y="318" width="${charW * n}" height="26"/></clipPath>
    </defs>` +
    // Top banner
    t(36, 42, "OM THAKUR", { cls: "serif rise", size: 14, weight: 800, ls: 3, fill: C.ink }) +
    t(168, 42, "ENGINEERING MONOGRAPH", { cls: "mono rise", size: 11, weight: 700, ls: 2.2, fill: C.terracotta, style: delay(0.1) }) +
    diamond(356, 38, 6, C.terracotta, "pulse") +
    t(374, 42, "VOLUME I · MMXXVI", { cls: "mono rise", size: 11, weight: 600, ls: 2, fill: C.muted, style: delay(0.2) }) +
    ping(1088, 38, C.olive, 4) +
    t(1104, 42, "LIVE MONOGRAPH", { cls: "mono", size: 10.5, weight: 700, ls: 1.6, fill: C.olive }) +
    line(36, 56, 1164, 56, C.parchment, { drawDelay: 0.25 }) +
    // Title block
    t(52, 132, "BACKEND ENGINEER · DISTRIBUTED SYSTEMS · SCALABLE APIS", {
      cls: "mono rise",
      size: 13,
      weight: 700,
      ls: 2.6,
      fill: C.terracotta,
      style: delay(0.35),
    }) +
    `<text x="50" y="218" class="serif rise" font-size="88" font-weight="900" fill="${C.ink}" letter-spacing="-1.5" style="${delay(
      0.5
    )}">Om Thakur<tspan fill="${C.terracotta}">.</tspan></text>` +
    line(56, 240, 452, 240, C.terracotta, { width: 2.5, drawDelay: 1.05 }) +
    t(52, 286, "Scalable Backends & Distributed Systems", {
      cls: "serif rise",
      size: 30,
      italic: true,
      fill: C.terracotta,
      style: delay(0.8),
    }) +
    // Typed line
    `<g clip-path="url(#typeClip)">` +
    `<text x="52" y="334" class="mono" font-size="15" fill="${C.body}"><tspan fill="${C.terracotta}" font-weight="700">$</tspan>${esc(
      typed.slice(1)
    )}</text></g>` +
    `<rect x="52" y="320" width="8.5" height="18" rx="1" fill="${C.terracotta}">` +
    `<animate attributeName="x" values="${caretSteps}" dur="${typeDur}s" begin="1.4s" fill="freeze" calcMode="discrete"/>` +
    `<animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/></rect>` +
    // Location / availability
    `<g class="rise" style="${delay(1.25)}">` +
    ping(58, 375, C.olive, 3.5, "0.6s") +
    t(72, 380, "MUMBAI, IN  ·  IST (UTC+5:30)  ·  OPEN TO BACKEND & FOUNDING ENGINEER ROLES", {
      cls: "mono",
      size: 11.5,
      weight: 600,
      ls: 1.3,
      fill: C.muted,
    }) +
    `</g>` +
    chipSvg +
    // ── Open book ──
    `<g class="fade" style="${delay(0.4)}">` +
    `<ellipse cx="${spine}" cy="386" rx="232" ry="14" fill="#3A2C1A" opacity=".16" filter="url(#soft)"/>` +
    `<rect x="700" y="98" width="456" height="284" rx="7" fill="${C.sand}" stroke="${C.rule}" stroke-width="1.2"/>` +
    `<rect x="704" y="${top + 4}" width="${pageW + 4}" height="${pageH}" rx="3" fill="${C.ivory}"/>` +
    `<rect x="${spine}" y="${top + 4}" width="${pageW + 4}" height="${pageH}" rx="3" fill="${C.ivory}"/>` +
    // Left page
    `<rect x="708" y="${top}" width="${pageW}" height="${pageH}" rx="3" fill="${C.card}" stroke="${C.sand}"/>` +
    t(728, 136, "CHAPTER 03", { cls: "mono", size: 10, weight: 700, ls: 2, fill: C.terracotta }) +
    t(728, 164, "Selected Work", { cls: "serif", size: 22, weight: 800 }) +
    lines(728, [182, 194, 206, 218], [176, 160, 170, 120]) +
    `<rect x="728" y="236" width="180" height="66" rx="6" fill="${C.ivory}" stroke="${C.parchment}"/>` +
    t(742, 271, "15m → 4s", { cls: "serif", size: 25, weight: 800, fill: C.terracotta }) +
    t(742, 290, "ASYNC QUEUE SYNC · −99.5%", { cls: "mono", size: 9.5, weight: 600, ls: 0.4, fill: C.muted }) +
    lines(728, [318, 330, 342], [170, 150, 96]) +
    t(818, 364, "— 14 —", { cls: "mono", size: 9, fill: C.muted, anchor: "middle" }) +
    `<rect x="${spine - 46}" y="${top}" width="46" height="${pageH}" fill="url(#spineL)"/>` +
    // Right page
    `<rect x="${spine}" y="${top}" width="${pageW}" height="${pageH}" rx="3" fill="${C.card}" stroke="${C.sand}"/>` +
    t(948, 136, "CHAPTER 04", { cls: "mono", size: 10, weight: 700, ls: 2, fill: C.terracotta }) +
    t(948, 164, "Telemetry", { cls: "serif", size: 22, weight: 800 }) +
    line(948, 262, 1128, 262, C.rule, { width: 1 }) +
    bars +
    lines(948, [282, 294, 306, 318, 330], [176, 150, 168, 130, 90]) +
    t(1038, 364, "— 15 —", { cls: "mono", size: 9, fill: C.muted, anchor: "middle" }) +
    `<rect x="${spine}" y="${top}" width="46" height="${pageH}" fill="url(#spineR)"/>` +
    line(spine, top, spine, top + pageH, C.rule, { width: 1 }) +
    // Bookmark ribbon
    `<path class="ribbon" d="M1106 ${top - 4} h14 v74 l-7 -8 l-7 8 z" fill="${C.terracotta}"/>` +
    // Turning leaf
    `<g class="leaf">` +
    `<rect x="${spine}" y="${top}" width="${pageW}" height="${pageH}" rx="3" fill="${C.card}" stroke="${C.sand}"/>` +
    lines(948, [136, 160, 182, 194, 206, 218, 240, 252, 264, 286, 298, 310, 330], [150, 176, 160, 170, 120, 176]) +
    `<rect class="leafShade" x="${spine}" y="${top}" width="${pageW}" height="${pageH}" rx="3" fill="#3A2B14"/>` +
    `</g>` +
    `</g>` +
    // Footer
    line(36, 448, 1164, 448, C.parchment, { drawDelay: 0.4 }) +
    t(36, 468, "CHAPTER 01  ·  PAGE 01", { cls: "mono fade", size: 11, weight: 600, ls: 2, fill: C.muted, style: delay(1) }) +
    t(600, 468, "TYPESCRIPT · PYTHON · KOTLIN · POSTGRESQL · SOWEBUILD.IN · REDIS", {
      cls: "mono fade",
      size: 11,
      weight: 600,
      ls: 1.6,
      fill: C.muted,
      anchor: "middle",
      style: delay(1.1),
    }) +
    t(1164, 468, "OMTHAKUR.IN  ↗", { cls: "mono fade", size: 11, weight: 700, ls: 2, fill: C.terracotta, anchor: "end", style: delay(1.2) });

  write("header.svg", svg(W, H, "Om Thakur — Backend & Distributed Systems Engineer", body, css));
}

// ─────────────────────────────────────────────────────────────
//  2. CHAPTER HEADINGS
// ─────────────────────────────────────────────────────────────
const CHAPTERS = [
  { num: "01", title: "Preface", sub: "Who is writing this volume", page: "03" },
  { num: "02", title: "Production Benchmarks", sub: "Measured in production, not in slides", page: "07" },
  { num: "03", title: "Selected Work", sub: "Systems, studio & open source", page: "14" },
  { num: "04", title: "Technical Specimen", sub: "Tools tested under real workloads", page: "22" },
  { num: "05", title: "Career Chronology", sub: "Appointments & verified deliverables", page: "28" },
  { num: "06", title: "Live Telemetry", sub: "Signals pulled from GitHub", page: "34" },
  { num: "07", title: "Correspondence", sub: "Letters are always answered", page: "40" },
];

function buildChapter({ num, title, sub, page }) {
  const W = 1200;
  const H = 108;
  const kicker = `CHAPTER ${num}`;
  const kW = monoW(kicker, 12, 3);
  const body =
    frame(W, H) +
    t(36, 42, kicker, { cls: "mono rise", size: 12, weight: 700, ls: 3, fill: C.terracotta }) +
    diamond(36 + kW + 10, 38, 6, C.terracotta, "pulse") +
    t(1164, 42, `PAGE ${page}`, { cls: "mono fade", size: 11, weight: 600, ls: 2.4, fill: C.muted, anchor: "end", style: delay(0.3) }) +
    t(34, 82, title, { cls: "serif rise", size: 34, weight: 800, ls: -0.4, style: delay(0.12) }) +
    t(1164, 82, sub, { cls: "serif fade", size: 18, italic: true, fill: C.muted, anchor: "end", style: delay(0.45) }) +
    line(36, 95, 1164, 95, C.parchment, { drawDelay: 0.15 }) +
    line(36, 95, 128, 95, C.terracotta, { width: 2.5, drawDelay: 0.35 });
  write(`chapter-${num}.svg`, svg(W, H, `Chapter ${num} — ${title}`, body));
}

// ─────────────────────────────────────────────────────────────
//  3. PRODUCTION BENCHMARKS LEDGER (High-legibility, larger fonts)
// ─────────────────────────────────────────────────────────────
function buildMetrics() {
  const TRACK_X = 520;
  const TRACK_W = 400;
  const rows = [
    {
      label: "Async message-queue sync",
      ctx: "SUMERU · FLEXBASE QUEUES · POLLING CRONS ELIMINATED",
      cap: "BEFORE 15 MIN  →  AFTER 4 S",
      from: TRACK_W,
      to: 4,
      color: C.terracotta,
      result: "−99.5%",
      sub: "15 MIN → 4 S SYNC",
    },
    {
      label: "Real-time voice pipeline",
      ctx: "KRISHORA · PYTHON · PIPECAT · EXOTEL · CUDA",
      cap: "END-TO-END TURNAROUND  ·  0 — 1 S",
      from: 0,
      to: TRACK_W * 0.7,
      color: C.olive,
      result: "~700 ms",
      sub: "SPEECH → GPU → SPEECH",
    },
    {
      label: "Stateless SVG Edge API",
      ctx: "DEVPIC · NEXT.JS EDGE RUNTIME · ZERO DATABASE",
      cap: "TIME TO FIRST BYTE  ·  0 — 100 MS",
      from: 0,
      to: TRACK_W * 0.1,
      color: C.terracotta,
      result: "< 10 ms",
      sub: "TTFB · EDGE API",
    },
    {
      label: "Edge publication engine",
      ctx: "GITFOOL · GITHUB WEBHOOKS → MDX AT THE EDGE",
      cap: "TIME TO FIRST BYTE  ·  0 — 100 MS",
      from: 0,
      to: TRACK_W * 0.3,
      color: C.olive,
      result: "< 30 ms",
      sub: "TTFB · 100 LIGHTHOUSE",
    },
    {
      label: "Academic distinction",
      ctx: "B.SC. INFORMATION TECHNOLOGY · UNIVERSITY OF MUMBAI",
      cap: "ACADEMIC CGPA  ·  0 — 10",
      from: 0,
      to: TRACK_W * 0.855,
      color: C.burgundy,
      result: "1st Rank",
      sub: "CGPA 8.55 / 10",
    },
  ];

  const W = 1200;
  const ROW = 112;
  const Y0 = 80;
  const H = Y0 + rows.length * ROW + 16;

  const rowSvg = rows
    .map((r, i) => {
      const y = Y0 + i * ROW;
      const d = 0.3 + i * 0.18;
      const anim = (attr, a, b) =>
        `<animate attributeName="${attr}" values="${a};${b}" keyTimes="0;1" calcMode="spline" keySplines=".22 1 .36 1" dur="1.8s" begin="${d}s" fill="freeze"/>`;
      return (
        `<g class="rise" style="${delay(d - 0.15)}">` +
        // Left: Label + Context (large & readable)
        t(36, y + 36, r.label, { cls: "serif", size: 24, weight: 800, fill: C.ink }) +
        t(36, y + 68, r.ctx, { cls: "mono", size: 13, weight: 700, ls: 0.8, fill: "#4A4541" }) +
        // Middle: Signal Bar + Caption
        t(TRACK_X, y + 26, r.cap, { cls: "mono", size: 13, weight: 700, ls: 1.2, fill: C.ink }) +
        `<rect x="${TRACK_X}" y="${y + 38}" width="${TRACK_W}" height="18" rx="9" fill="#E8DEC8" stroke="${C.rule}" stroke-width="1"/>` +
        `<rect x="${TRACK_X}" y="${y + 38}" width="${r.from}" height="18" rx="9" fill="${r.color}">${anim("width", r.from, r.to)}</rect>` +
        `<circle cx="${TRACK_X + r.from}" cy="${y + 47}" r="9" fill="${r.color}" stroke="${C.card}" stroke-width="3">${anim(
          "cx",
          TRACK_X + r.from,
          TRACK_X + r.to
        )}</circle>` +
        // Right: Result + Subtitle
        t(1164, y + 44, r.result, { cls: "serif", size: 38, weight: 900, fill: r.color, anchor: "end" }) +
        t(1164, y + 72, r.sub, { cls: "mono", size: 13.5, weight: 700, ls: 1.0, fill: "#2C2825", anchor: "end" }) +
        `</g>` +
        (i < rows.length - 1 ? line(36, y + ROW - 6, 1164, y + ROW - 6, C.parchment, { width: 1.2, dash: "2 6" }) : "")
      );
    })
    .join("");

  const body =
    frame(W, H) +
    t(36, 48, "SYSTEM / ARCHITECTURE", { cls: "mono fade", size: 13, weight: 700, ls: 2.2, fill: C.terracotta }) +
    t(TRACK_X, 48, "PRODUCTION SIGNAL & BENCHMARK", { cls: "mono fade", size: 13, weight: 700, ls: 2.2, fill: C.terracotta }) +
    t(1164, 48, "VERIFIED RESULT", { cls: "mono fade", size: 13, weight: 700, ls: 2.2, fill: C.terracotta, anchor: "end" }) +
    line(36, 64, 1164, 64, C.rule, { width: 1.5, drawDelay: 0.1 }) +
    rowSvg;

  write("metrics.svg", svg(W, H, "Production benchmarks — 15 min to 4 s, ~700 ms, under 10 ms, under 30 ms, First Rank", body));
}

// ─────────────────────────────────────────────────────────────
//  4. PROJECT CARDS (Includes SoWeBuild.in agency card)
// ─────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    file: "project-sowebuild",
    num: "01",
    category: "Agency & Digital Studio",
    title: "SoWeBuild.in",
    metric: "BUILD · LAUNCH · SCALE",
    desc: "Digital engineering agency building high-performance websites, bespoke software, AI systems, and business automation from design to cloud deployment.",
    chips: ["Next.js", "Full-Stack", "AI Solutions", "Automation"],
    status: "STUDIO & AGENCY",
    host: "sowebuild.in",
    href: "https://sowebuild.in",
  },
  {
    file: "project-commerce",
    num: "02",
    category: "Distributed Web",
    title: "Digital Commerce Platform",
    metric: "HMAC · AES-256",
    desc: "Dual-verification checkout — a synchronous API check plus a timing-safe HMAC-SHA256 webhook — with AES-256-GCM entitlements encrypted at rest using randomized IVs.",
    chips: ["Next.js 15", "TypeScript", "Supabase", "Razorpay"],
    status: "LIVE IN PRODUCTION",
    host: "store.sowebuild.in",
    href: "https://store.sowebuild.in",
  },
  {
    file: "project-devpic",
    num: "03",
    category: "Low-Level Tools",
    title: "devpic",
    metric: "< 10 MS TTFB",
    desc: "Open-source, stateless REST API that generates deterministic mathematical SVG meshes on the Next.js Edge Runtime — zero database, zero dependencies, sub-10 ms responses.",
    chips: ["TypeScript", "Edge Runtime", "REST API", "SVG"],
    status: "OPEN SOURCE",
    host: "github.com/MonsterFlick/devpic",
    href: "https://github.com/MonsterFlick/devpic",
  },
  {
    file: "project-agni",
    num: "04",
    category: "Autonomous AI",
    title: "Agni",
    metric: "100% OFFLINE",
    desc: "Local Windows automation agent powered by Ollama models, with regex command blacklisting, destructive-operation safeguards and a self-repairing, error-driven execution loop.",
    chips: ["Python", "Ollama", "PowerShell", "Windows APIs"],
    status: "OPEN SOURCE",
    host: "github.com/MonsterFlick/Agni",
    href: "https://github.com/MonsterFlick/Agni",
  },
  {
    file: "project-finread",
    num: "05",
    category: "Mobile Systems",
    title: "Fin Read",
    metric: "OFFLINE-FIRST",
    desc: "Android finance tracker in Kotlin that extracts SMS transactions into a Room database and syncs idempotently to Supabase — fully usable without a network.",
    chips: ["Kotlin", "Room DB", "Supabase", "Material 3"],
    status: "OPEN SOURCE",
    host: "github.com/MonsterFlick/Fin-Read",
    href: "https://github.com/MonsterFlick/Fin-Read",
  },
  {
    file: "project-gitfool",
    num: "06",
    category: "Distributed Web",
    title: "GitFool",
    metric: "< 30 MS TTFB",
    desc: "Edge-rendered publication engine that compiles markdown straight from GitHub repositories via webhooks — sub-30 ms TTFB and 100/100 Lighthouse scores.",
    chips: ["Next.js", "Edge Runtime", "MDX", "Tailwind CSS"],
    status: "LIVE IN PRODUCTION",
    host: "blogs.omthakur.in",
    href: "https://blogs.omthakur.in",
  },
];

function buildProjectCard(p) {
  const W = 580;
  const H = 272;
  const badgeW = monoW(p.metric, 11, 0.6) + 24;
  const descLines = wrap(p.desc, 64).slice(0, 3);

  let chipX = 28;
  const chipSvg = p.chips
    .map((c, i) => {
      const w = monoW(c, 11, 0.2) + 20;
      const g =
        `<g class="fade" style="${delay(0.5 + i * 0.1)}">` +
        `<rect x="${chipX}" y="186" width="${w.toFixed(0)}" height="26" rx="5" fill="${C.ivory}" stroke="${C.rule}"/>` +
        t(chipX + 10, 203, c, { cls: "mono", size: 11, weight: 600, ls: 0.2, fill: C.ink }) +
        `</g>`;
      chipX += w + 8;
      return g;
    })
    .join("");

  const body =
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${C.card}" stroke="${C.parchment}" stroke-width="1.5"/>` +
    line(28, 2, 132, 2, C.terracotta, { width: 3, drawDelay: 0.1 }) +
    `<g class="rise">` +
    t(28, 44, `CH. ${p.num}  ·  ${p.category.toUpperCase()}`, { cls: "mono", size: 11, weight: 700, ls: 2.2, fill: C.terracotta }) +
    `<rect x="${(552 - badgeW).toFixed(0)}" y="26" width="${badgeW.toFixed(0)}" height="26" rx="13" fill="${C.terracotta}" fill-opacity=".1"/>` +
    t((552 - badgeW / 2).toFixed(0), 43, p.metric, { cls: "mono", size: 11, weight: 700, ls: 0.6, fill: C.terracotta, anchor: "middle" }) +
    t(28, 88, p.title, { cls: "serif", size: 27, weight: 800, ls: -0.3 }) +
    descLines.map((l, i) => t(28, 118 + i * 22, l, { size: 14.5, fill: C.charcoal })).join("") +
    `</g>` +
    chipSvg +
    line(28, 230, 552, 230, C.parchment, { width: 1, drawDelay: 0.3 }) +
    `<g class="fade" style="${delay(0.6)}">` +
    ping(34, 251, C.olive, 3.5) +
    t(46, 255, p.status, { cls: "mono", size: 10.5, weight: 700, ls: 1.6, fill: C.olive }) +
    t(552, 255, `↗ ${p.host}`, { cls: "mono", size: 11, weight: 600, fill: C.muted, anchor: "end" }) +
    `</g>`;

  write(`${p.file}.svg`, svg(W, H, `${p.title} — ${p.desc}`, body));
}

// Full-width callout for the 3D book monograph
function buildMonographCard() {
  const W = 1200;
  const H = 210;
  const css = `
.shine { animation: shine 3.6s ease-in-out 1.2s infinite; }
@keyframes shine { 0% { transform: translateX(-140px); } 60%, 100% { transform: translateX(360px); } }
`;
  const body =
    `<defs>
      <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="btn"><rect x="910" y="74" width="254" height="48" rx="8"/></clipPath>
    </defs>` +
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${C.ink}" stroke="${C.ink}"/>` +
    `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="8" fill="none" stroke="${C.muted}" stroke-dasharray="1 5" stroke-linecap="round"/>` +
    `<g class="rise">` +
    ping(42, 42, C.ember, 4) +
    t(58, 46, "CONTINUE READING · ARCHITECTURE MONOGRAPH", { cls: "mono", size: 12, weight: 700, ls: 2.2, fill: C.ember }) +
    t(1160, 46, "VOL. I  ·  INTERACTIVE 3D BOOK", { cls: "mono", size: 12, weight: 700, ls: 2.2, fill: C.mist, anchor: "end" }) +
    t(40, 96, "The Engineering Monograph at omthakur.in", { cls: "serif", size: 32, weight: 900, fill: C.paper }) +
    t(40, 126, "Ten chapters, live device telemetry, architecture blueprints, code specimens, OKF knowledge bundle and engineering FAQ.", {
      size: 15.5,
      fill: C.mist,
    }) +
    `</g>` +
    `<g class="fade" style="${delay(0.5)}">` +
    `<rect x="910" y="74" width="254" height="48" rx="8" fill="${C.terracotta}"/>` +
    `<g clip-path="url(#btn)"><rect class="shine" x="910" y="74" width="100" height="48" fill="url(#g)"/></g>` +
    t(1037, 104, "Open omthakur.in  →", { cls: "mono", size: 14.5, weight: 700, fill: C.paper, anchor: "middle" }) +
    `</g>` +
    line(40, 156, 1160, 156, C.muted, { width: 1, drawDelay: 0.3 }) +
    t(40, 182, "RESUME  ·  LLMS.TXT  ·  OKF KNOWLEDGE BUNDLE  ·  POST-MORTEMS", {
      cls: "mono fade",
      size: 11.5,
      weight: 700,
      ls: 1.6,
      fill: C.mist,
      style: delay(0.7),
    }) +
    t(1160, 182, "↗ HTTPS://OMTHAKUR.IN", { cls: "mono fade", size: 12, weight: 700, ls: 1.4, fill: C.ember, anchor: "end", style: delay(0.7) });

  write("project-monograph.svg", svg(W, H, "Read the full interactive monograph at omthakur.in", body, css));
}

// ─────────────────────────────────────────────────────────────
//  5. TECHNICAL SPECIMEN (stack)
// ─────────────────────────────────────────────────────────────
function buildStack() {
  const W = 1200;
  const H = 404;
  const cols = [
    {
      kicker: "LANGUAGES",
      title: "Languages & Protocols",
      note: "CORE STACK",
      items: ["TypeScript · JavaScript", "Python", "Kotlin", "SQL", "Bash · PowerShell", "WebSockets · REST"],
    },
    {
      kicker: "CONCURRENCY",
      title: "Backend & Concurrency",
      note: "15 MIN → 4 S SYNC",
      items: ["Node.js · Deno", "Pipecat · CUDA streams", "Flexbase message queues", "Webhooks · HMAC-SHA256", "RBAC · AES-256-GCM", "Matrix real-time"],
    },
    {
      kicker: "STORAGE",
      title: "Databases & Storage",
      note: "PRIMARY DATA LAYER",
      items: ["PostgreSQL", "Supabase · RLS", "Drizzle ORM", "Qdrant · RAG", "Redis", "SQLite · Room"],
    },
    {
      kicker: "INFRASTRUCTURE",
      title: "Infrastructure & Cloud",
      note: "SELF-HOSTED INFRA",
      items: ["Docker", "Linux · Nginx · PM2", "Next.js Edge Runtime", "Deno Edge Functions", "Cloudflare", "Ollama · local LLMs"],
    },
  ];

  const X0 = 276;
  const CW = 228;
  const colSvg = cols
    .map((c, ci) => {
      const x = X0 + ci * CW;
      const base = 0.25 + ci * 0.15;
      return (
        (ci > 0 ? line(x - 16, 44, x - 16, 372, C.parchment, { width: 1, dash: "2 5" }) : "") +
        `<g class="rise" style="${delay(base)}">` +
        t(x, 60, c.kicker, { cls: "mono", size: 10.5, weight: 700, ls: 2, fill: C.terracotta }) +
        t(x, 88, c.title, { cls: "serif", size: 19, weight: 800 }) +
        `</g>` +
        line(x, 104, x + 196, 104, C.parchment, { width: 1.2, drawDelay: base }) +
        line(x, 104, x + 30, 104, C.terracotta, { width: 2.5, drawDelay: base + 0.2 }) +
        c.items
          .map(
            (it, i) =>
              `<g class="rise" style="${delay(base + 0.25 + i * 0.08)}">` +
              diamond(x + 4, 136 + i * 38 - 5, 6, i % 2 ? C.olive : C.terracotta) +
              t(x + 18, 136 + i * 38, it, { size: 15, fill: C.charcoal }) +
              `</g>`
          )
          .join("") +
        t(x, 368, c.note, { cls: "mono fade", size: 10, weight: 700, ls: 1.6, fill: C.muted, style: delay(base + 0.8) })
      );
    })
    .join("");

  const body =
    frame(W, H) +
    `<rect x="24" y="24" width="222" height="356" rx="8" fill="${C.ivory}" stroke="${C.parchment}"/>` +
    t(44, 56, "TYPE SPECIMEN", { cls: "mono fade", size: 10.5, weight: 700, ls: 2, fill: C.terracotta }) +
    t(40, 198, "Aa", { cls: "serif rise", size: 128, weight: 900, ls: -3, style: delay(0.1) }) +
    t(44, 238, "Backend & Systems", { cls: "serif rise", size: 20, italic: true, fill: C.terracotta, style: delay(0.25) }) +
    line(44, 256, 226, 256, C.rule, { width: 1, drawDelay: 0.3 }) +
    t(44, 282, "ABCDEFGHIJKLM", { cls: "mono fade", size: 12, weight: 600, ls: 2.2, fill: C.ink, style: delay(0.4) }) +
    t(44, 302, "nopqrstuvwxyz", { cls: "mono fade", size: 12, weight: 600, ls: 2.2, fill: C.ink, style: delay(0.5) }) +
    t(44, 322, "0123456789 {} → λ", { cls: "mono fade", size: 12, weight: 600, ls: 1.2, fill: C.terracotta, style: delay(0.6) }) +
    t(44, 362, "SPECIMEN Nº 08", { cls: "mono fade", size: 10, weight: 700, ls: 2, fill: C.muted, style: delay(0.7) }) +
    colSvg;

  write("stack.svg", svg(W, H, "Technical specimen — languages, backend, databases and infrastructure", body));
}

// ─────────────────────────────────────────────────────────────
//  6. CAREER CHRONOLOGY (Corrected April dates, NO month counts)
// ─────────────────────────────────────────────────────────────
function buildExperience() {
  const entries = [
    {
      date: "APR 2026 — PRESENT",
      company: "Krishora Technologies",
      role: "Founding Software Engineer",
      note: "~700 ms Python/CUDA voice pipelines · Qdrant retrieval router for Sevak AI · self-hosted Linux, Nginx & Mailcow infrastructure",
      tag: "PRESENT",
      current: true,
    },
    {
      date: "AUG 2025 — APR 2026",
      company: "Cyber Intelligence & Research Lab (CIARL)",
      role: "Software Developer",
      note: "Encrypted offline Kotlin queues · React/PostgreSQL RBAC portals · citation-backed legal RAG · Matrix chat, voice & video",
      tag: null,
    },
    {
      date: "AUG 2024 — FEB 2025",
      company: "Sumeru Technology Solutions",
      role: "Software Development Engineer Intern",
      note: "Flexbase message queues (15 min → 4 s sync) · production database crash RCA · PHP → TypeScript/Deno Edge migration",
      tag: null,
    },
    {
      date: "JUN 2024 — AUG 2024",
      company: "Bhimrao Pradhan College, University of Mumbai",
      role: "Assistant Professor (Volunteer)",
      note: "Taught B.Sc. IT database systems and software architecture",
      tag: null,
    },
  ];

  const W = 1200;
  const STEP = 126;
  const Y0 = 56;
  const H = Y0 + entries.length * STEP + 14;
  const spineEnd = Y0 + (entries.length - 1) * STEP + 14;

  const entrySvg = entries
    .map((e, i) => {
      const y = Y0 + i * STEP;
      const d = 0.3 + i * 0.2;
      const dot = e.current
        ? ping(64, y + 8, C.olive, 6.5)
        : `<circle cx="64" cy="${y + 8}" r="7" fill="${C.card}" stroke="${C.terracotta}" stroke-width="2.5"/><circle cx="64" cy="${y + 8}" r="2.8" fill="${C.terracotta}"/>`;

      let badgeMarkup = "";
      if (e.current && e.tag) {
        const tagW = monoW(e.tag, 11, 1.4) + 36;
        badgeMarkup =
          `<rect x="${(1164 - tagW).toFixed(0)}" y="${y - 6}" width="${tagW.toFixed(0)}" height="26" rx="13" fill="${C.olive}" fill-opacity=".12"/>` +
          `<circle cx="${(1164 - tagW + 15).toFixed(0)}" cy="${y + 7}" r="3.5" fill="${C.olive}" class="pulse"/>` +
          t(1164 - 14, y + 11, e.tag, {
            cls: "mono",
            size: 11,
            weight: 700,
            ls: 1.4,
            fill: C.olive,
            anchor: "end",
          });
      }

      return (
        `<g class="fade" style="${delay(d)}">${dot}</g>` +
        `<g class="rise" style="${delay(d)}">` +
        t(96, y + 13, e.date, { cls: "mono", size: 12.5, weight: 700, ls: 2, fill: C.terracotta }) +
        badgeMarkup +
        t(96, y + 48, e.company, { cls: "serif", size: 26, weight: 800 }) +
        t(96, y + 74, e.role, { cls: "serif", size: 18, italic: true, fill: C.muted }) +
        `<text x="96" y="${y + 100}" class="sans" font-size="15" fill="${C.charcoal}"><tspan fill="${C.terracotta}" font-weight="700">→ </tspan>${esc(
          e.note
        )}</text>` +
        `</g>` +
        (i < entries.length - 1 ? line(96, y + STEP - 8, 1164, y + STEP - 8, C.parchment, { width: 1, dash: "2 5" }) : "")
      );
    })
    .join("");

  const body =
    frame(W, H) +
    line(64, Y0, 64, spineEnd, C.parchment, { width: 2.5 }) +
    line(64, Y0, 64, spineEnd, C.terracotta, { width: 2.5, drawDelay: 0.2 }) +
    entrySvg;

  write("experience.svg", svg(W, H, "Career chronology — Krishora Technologies, CIARL, Sumeru Technology Solutions, University of Mumbai", body, ".draw{animation-duration:2.6s}"));
}

// ─────────────────────────────────────────────────────────────
//  7. LIVE TELEMETRY & REPOSITORY SPECIMEN (100% self-contained SVG)
//  Replaces brittle third-party services that return 402/503.
// ─────────────────────────────────────────────────────────────
function buildTelemetry() {
  const W = 1200;
  const H = 380;

  const anim = (attr, a, b, d = "0.4s") =>
    `<animate attributeName="${attr}" values="${a};${b}" keyTimes="0;1" calcMode="spline" keySplines=".22 1 .36 1" dur="1.8s" begin="${d}" fill="freeze"/>`;

  const body =
    frame(W, H) +
    // Top banner
    t(36, 42, "CHAPTER 06 · LIVE TELEMETRY", { cls: "mono rise", size: 12, weight: 700, ls: 3, fill: C.terracotta }) +
    diamond(266, 38, 6, C.terracotta, "pulse") +
    t(282, 42, "CODEBASE SIGNALS & REPOSITORY SPECIMEN", { cls: "mono rise", size: 11, weight: 600, ls: 2, fill: C.muted }) +
    ping(1088, 38, C.olive, 4) +
    t(1104, 42, "LIVE REPOS: 51", { cls: "mono", size: 10.5, weight: 700, ls: 1.6, fill: C.olive }) +
    line(36, 56, 1164, 56, C.parchment, { drawDelay: 0.25 }) +

    // ── Left Column: Repository Telemetry ──
    `<rect x="36" y="74" width="536" height="276" rx="8" fill="${C.card}" stroke="${C.parchment}" stroke-width="1.2"/>` +
    line(36, 74, 150, 74, C.terracotta, { width: 3 }) +
    t(56, 106, "REPOSITORY METRICS", { cls: "mono", size: 11.5, weight: 700, ls: 2, fill: C.terracotta }) +
    t(548, 106, "GITHUB.COM/MONSTERFLICK", { cls: "mono", size: 11, weight: 600, ls: 1, fill: C.muted, anchor: "end" }) +
    line(56, 120, 548, 120, C.rule, { width: 1, dash: "2 5" }) +

    // Stat 1: 51+ Repositories
    `<g class="rise" style="${delay(0.25)}">` +
    t(56, 172, "51+", { cls: "serif", size: 48, weight: 900, fill: C.terracotta }) +
    t(176, 154, "Public Repositories", { cls: "serif", size: 21, weight: 800, fill: C.ink }) +
    t(176, 176, "Distributed systems, edge APIs, mobile engines & AI automation", { cls: "sans", size: 13.5, fill: C.charcoal }) +
    `</g>` +

    // Stat 2: 5+ Years
    `<g class="rise" style="${delay(0.4)}">` +
    t(56, 242, "5+ Yrs", { cls: "serif", size: 40, weight: 900, fill: C.ink }) +
    t(194, 226, "Continuous Engineering", { cls: "serif", size: 21, weight: 800, fill: C.ink }) +
    t(194, 248, "Active commit chronology and deployments since April 2021", { cls: "sans", size: 13.5, fill: C.charcoal }) +
    `</g>` +

    // Stat 3: Production philosophy
    line(56, 276, 548, 276, C.rule, { width: 1, dash: "2 5" }) +
    `<g class="fade" style="${delay(0.6)}">` +
    ping(68, 308, C.olive, 4) +
    t(86, 312, "ZERO DATABASE CRASH PHILOSOPHY · STATELESS EDGE APIS", { cls: "mono", size: 10.5, weight: 700, ls: 1.2, fill: C.olive }) +
    `</g>` +

    // ── Right Column: Language Distribution ──
    `<rect x="592" y="74" width="572" height="276" rx="8" fill="${C.card}" stroke="${C.parchment}" stroke-width="1.2"/>` +
    line(592, 74, 706, 74, C.terracotta, { width: 3 }) +
    t(612, 106, "LANGUAGE SPECIMEN DISTRIBUTION", { cls: "mono", size: 11.5, weight: 700, ls: 2, fill: C.terracotta }) +
    t(1144, 106, "BY REPOSITORY VOLUME", { cls: "mono", size: 11, weight: 600, ls: 1, fill: C.muted, anchor: "end" }) +
    line(612, 120, 1144, 120, C.rule, { width: 1, dash: "2 5" }) +

    // Lang 1: TypeScript (54%)
    `<g class="rise" style="${delay(0.3)}">` +
    t(612, 146, "TypeScript", { cls: "serif", size: 17, weight: 800, fill: C.ink }) +
    t(880, 146, "21 Repositories", { cls: "mono", size: 12.5, weight: 600, fill: C.muted }) +
    t(1144, 146, "54%", { cls: "mono", size: 14, weight: 800, fill: C.terracotta, anchor: "end" }) +
    `<rect x="612" y="156" width="532" height="12" rx="6" fill="#E8DEC8"/>` +
    `<rect x="612" y="156" width="287" height="12" rx="6" fill="${C.terracotta}">${anim("width", 0, 287, "0.3s")}</rect>` +
    `</g>` +

    // Lang 2: JavaScript / Node (24%)
    `<g class="rise" style="${delay(0.45)}">` +
    t(612, 196, "JavaScript / Node.js", { cls: "serif", size: 17, weight: 800, fill: C.ink }) +
    t(880, 196, "10 Repositories", { cls: "mono", size: 12.5, weight: 600, fill: C.muted }) +
    t(1144, 196, "24%", { cls: "mono", size: 14, weight: 800, fill: C.olive, anchor: "end" }) +
    `<rect x="612" y="206" width="532" height="12" rx="6" fill="#E8DEC8"/>` +
    `<rect x="612" y="206" width="128" height="12" rx="6" fill="${C.olive}">${anim("width", 0, 128, "0.45s")}</rect>` +
    `</g>` +

    // Lang 3: Python & CUDA (12%)
    `<g class="rise" style="${delay(0.6)}">` +
    t(612, 246, "Python & CUDA AI", { cls: "serif", size: 17, weight: 800, fill: C.ink }) +
    t(880, 246, "Real-Time Pipelines", { cls: "mono", size: 12.5, weight: 600, fill: C.muted }) +
    t(1144, 246, "12%", { cls: "mono", size: 14, weight: 800, fill: C.ember, anchor: "end" }) +
    `<rect x="612" y="256" width="532" height="12" rx="6" fill="#E8DEC8"/>` +
    `<rect x="612" y="256" width="64" height="12" rx="6" fill="${C.ember}">${anim("width", 0, 64, "0.6s")}</rect>` +
    `</g>` +

    // Lang 4: Kotlin & Android (10%)
    `<g class="rise" style="${delay(0.75)}">` +
    t(612, 296, "Kotlin & Android", { cls: "serif", size: 17, weight: 800, fill: C.ink }) +
    t(880, 296, "Offline-First Systems", { cls: "mono", size: 12.5, weight: 600, fill: C.muted }) +
    t(1144, 296, "10%", { cls: "mono", size: 14, weight: 800, fill: C.burgundy, anchor: "end" }) +
    `<rect x="612" y="306" width="532" height="12" rx="6" fill="#E8DEC8"/>` +
    `<rect x="612" y="306" width="53" height="12" rx="6" fill="${C.burgundy}">${anim("width", 0, 53, "0.75s")}</rect>` +
    `</g>`;

  write("telemetry.svg", svg(W, H, "Live telemetry — repository metrics and language specimen distribution", body));
}

// ─────────────────────────────────────────────────────────────
//  8. COLOPHON
// ─────────────────────────────────────────────────────────────
function buildColophon() {
  const W = 1200;
  const H = 252;
  const css = `
.sig{stroke-dasharray:1400;animation:sig 3.2s cubic-bezier(.65,0,.35,1) .3s both,sigfill 1s ease 2.7s both}
@keyframes sig{from{stroke-dashoffset:1400}to{stroke-dashoffset:0}}
@keyframes sigfill{from{fill-opacity:0}to{fill-opacity:1}}
`;
  const body =
    frame(W, H) +
    line(462, 48, 584, 48, C.rule, { width: 1.2, drawDelay: 0.1 }) +
    diamond(600, 48, 8, C.terracotta, "pulse") +
    line(616, 48, 738, 48, C.rule, { width: 1.2, drawDelay: 0.1 }) +
    t(600, 86, "COLOPHON", { cls: "mono fade", size: 11, weight: 700, ls: 4, fill: C.terracotta, anchor: "middle" }) +
    `<text x="600" y="158" class="serif sig" font-size="58" font-weight="700" font-style="italic" text-anchor="middle" fill="${C.terracotta}" stroke="${C.terracotta}" stroke-width="1.1">Om Thakur</text>` +
    t(600, 198, "Set in Playfair Display & Geist Mono  ·  Composed in Mumbai  ·  Edition MMXXVI", {
      cls: "mono fade",
      size: 11,
      weight: 600,
      ls: 1.2,
      fill: C.muted,
      anchor: "middle",
      style: delay(1.2),
    }) +
    t(600, 224, "Thank you for reading this volume.", {
      cls: "serif fade",
      size: 15,
      italic: true,
      fill: C.charcoal,
      anchor: "middle",
      style: delay(1.4),
    });

  write("colophon.svg", svg(W, H, "Colophon — signed, Om Thakur", body, css));
}

// ─────────────────────────────────────────────────────────────
//  9. README GENERATOR (Uses Founder, self-contained telemetry)
// ─────────────────────────────────────────────────────────────
function buildReadme() {
  const hex = (c) => c.replace("#", "");
  const typingLines = [
    "Designing low-latency backends that stay up",
    "Founder of SoWeBuild.in · Web & AI Systems",
    "15 min → 4 s · async message queues",
    "~700 ms · real-time GPU voice pipelines",
    "< 10 ms · stateless Edge APIs",
    "Open to Backend & Founding Engineer roles",
  ];
  const typing =
    "https://readme-typing-svg.demolab.com/?font=JetBrains+Mono&weight=600&size=17&duration=3000&pause=1100" +
    `&color=${hex(C.terracotta)}&center=true&vCenter=true&width=720&height=34&lines=` +
    typingLines.map(encodeURIComponent).join(";");

  const streak =
    `https://streak-stats.demolab.com/?user=${USER}&background=${hex(C.paper)}&border=${hex(C.rule)}&stroke=${hex(C.parchment)}` +
    `&ring=${hex(C.terracotta)}&fire=${hex(C.terracotta)}&currStreakNum=${hex(C.ink)}&sideNums=${hex(C.ink)}` +
    `&currStreakLabel=${hex(C.terracotta)}&sideLabels=${hex(C.muted)}&dates=${hex(C.muted)}&border_radius=10`;
  const snake = `https://raw.githubusercontent.com/${USER}/${USER}/output/github-snake.svg`;
  const readers = `https://komarev.com/ghpvc/?username=${USER}&label=READERS%20OF%20THIS%20VOLUME&color=${hex(C.terracotta)}&style=flat-square`;

  const badge = (label, bg, logo, logoColor, href, alt) =>
    `<a href="${href}"><img src="https://img.shields.io/badge/${label}-${bg}?style=for-the-badge&logo=${logo}&logoColor=${logoColor}" alt="${alt}" /></a>`;

  const projectRow = (a, b) =>
    `  <tr>\n` +
    `    <td width="50%"><a href="${a.href}"><img src="./assets/${a.file}.svg" width="100%" alt="${esc(a.title)} — ${esc(a.desc)}" /></a></td>\n` +
    `    <td width="50%"><a href="${b.href}"><img src="./assets/${b.file}.svg" width="100%" alt="${esc(b.title)} — ${esc(b.desc)}" /></a></td>\n` +
    `  </tr>\n`;

  const md = `<!--
  Om Thakur · GitHub profile — "Engineering Monograph", Vol. I
  Paper, ink & terracotta — the same theme as https://omthakur.in
  Generated by build.mjs → edit the data there and run \`node build.mjs\`.
-->

<a href="https://omthakur.in">
  <img src="./assets/header.svg" width="100%" alt="Om Thakur — Backend & Distributed Systems Engineer. Founding Software Engineer at Krishora Technologies, Mumbai." />
</a>

<p align="center">
  <a href="https://omthakur.in"><img src="${typing}" alt="Designing low-latency backends that stay up · Founder of SoWeBuild.in · 15 min → 4 s async message queues · ~700 ms GPU voice pipelines · under 10 ms Edge APIs" /></a>
</p>

<p align="center">
  ${badge("omthakur.in", hex(C.ink), "googlechrome", hex(C.ember), "https://omthakur.in", "Portfolio")}
  ${badge("SoWeBuild.in", hex(C.terracotta), "rocket", hex(C.paper), "https://sowebuild.in", "SoWeBuild Agency")}
  ${badge("Resume", hex(C.ink), "readthedocs", hex(C.paper), "https://omthakur.in/resume", "Resume")}
  ${badge("GitFool_Blog", hex(C.olive), "rss", hex(C.paper), "https://blogs.omthakur.in", "Blog")}
  ${badge("LinkedIn", hex(C.paper), "linkedin", "0A66C2", "https://linkedin.com/in/omthakur2366", "LinkedIn")}
  ${badge("@omthakur2366", hex(C.parchment), "x", hex(C.ink), "https://twitter.com/omthakur2366", "X / Twitter")}
</p>

<br />

<img src="./assets/chapter-01.svg" width="100%" alt="Chapter 01 — Preface" />

**Backend engineer** focused on distributed, database-backed architectures, production reliability, and custom digital systems. I build the parts of an architecture nobody notices until they break — message queues, real-time streaming pipelines, offline-first sync, and the auth & encryption layers in between.

- **Now** — Founding Software Engineer at **Krishora Technologies** (joined Apr 2026), shipping ~700 ms Python/CUDA voice pipelines and Qdrant-backed retrieval for Sevak AI.
- **Agency** — Founder of [**SoWeBuild.in**](https://sowebuild.in) — building high-performance websites, bespoke software, AI systems, and business automation from zero to scale.
- **Before** — Encrypted offline queues & legal RAG at **CIARL** (Aug 2025 – Apr 2026); replaced polling crons with Flexbase queues at **Sumeru** (15 min → 4 s).
- **Writing** — Architecture deep dives on [**GitFool**](https://blogs.omthakur.in), my edge-rendered blog engine.
- **Open to** — Backend, Distributed Systems & Founding Engineer roles, agency collaborations, and architecture consulting.

\`\`\`ts
// whoami.ts — Chapter 01, Page 03
const om = {
  role:     "Founding Software Engineer @ Krishora Technologies",
  agency:   "Founder @ SoWeBuild.in (Websites, Software & AI Automation)",
  focus:    ["distributed systems", "real-time pipelines", "message queues", "applied RAG"],
  stack:    ["TypeScript", "Python", "Kotlin", "PostgreSQL", "Qdrant", "Redis"],
  based:    "Mumbai, IN · IST (UTC+5:30)",
  honours:  "First Rank · B.Sc. IT · University of Mumbai (CGPA 8.55/10)",
  reach:    "omthakur2366@gmail.com",
} as const;
\`\`\`

<br />

<img src="./assets/chapter-02.svg" width="100%" alt="Chapter 02 — Production Benchmarks" />

<img src="./assets/metrics.svg" width="100%" alt="Production benchmarks: async queue sync 15 min to 4 s (−99.5%); real-time voice pipeline ~700 ms; devpic Edge API under 10 ms TTFB; GitFool under 30 ms TTFB; First Rank, CGPA 8.55/10." />

<br />

<img src="./assets/chapter-03.svg" width="100%" alt="Chapter 03 — Selected Work" />

<table>
${projectRow(PROJECTS[0], PROJECTS[1])}${projectRow(PROJECTS[2], PROJECTS[3])}${projectRow(PROJECTS[4], PROJECTS[5])}</table>

<br />

<a href="https://omthakur.in">
  <img src="./assets/project-monograph.svg" width="100%" alt="The full monograph — Read the interactive engineering monograph at omthakur.in" />
</a>

<br />

<img src="./assets/chapter-04.svg" width="100%" alt="Chapter 04 — Technical Specimen" />

<img src="./assets/stack.svg" width="100%" alt="Stack — Languages: TypeScript, Python, Kotlin, SQL. Backend: Node.js, Deno, Pipecat, Flexbase queues. Databases: PostgreSQL, Supabase, Qdrant, Redis. Infrastructure: Docker, Linux, Nginx, Edge runtimes, Cloudflare." />

<br />

<img src="./assets/chapter-05.svg" width="100%" alt="Chapter 05 — Career Chronology" />

<a href="https://omthakur.in/resume">
  <img src="./assets/experience.svg" width="100%" alt="Krishora Technologies (Apr 2026 – present), CIARL (Aug 2025 – Apr 2026), Sumeru Technology Solutions (Aug 2024 – Feb 2025), Bhimrao Pradhan College (Jun – Aug 2024)." />
</a>

<br />

<img src="./assets/chapter-06.svg" width="100%" alt="Chapter 06 — Live Telemetry" />

<img src="./assets/telemetry.svg" width="100%" alt="Repository Telemetry & Language Specimen — 51+ Public Repositories, 5+ Years on GitHub, TypeScript, JavaScript, Python, Kotlin" />

<br /><br />

<p align="center">
  <img src="${streak}" width="490" alt="Contribution streak" />
</p>

<p align="center">
  <img src="${snake}" width="100%" alt="Contribution grid being read by a terracotta snake" />
</p>

<br />

<img src="./assets/chapter-07.svg" width="100%" alt="Chapter 07 — Correspondence" />

<p align="center">
  Have a distributed-systems problem, an agency project for SoWeBuild, a founding role, or just a good queue story?<br />
  <b>Write to me — letters are always answered.</b>
</p>

<p align="center">
  ${badge("omthakur2366@gmail.com", hex(C.paper), "gmail", hex(C.terracotta), "mailto:omthakur2366@gmail.com", "Email")}
  ${badge("SoWeBuild.in", hex(C.terracotta), "rocket", hex(C.paper), "https://sowebuild.in", "Agency")}
  ${badge("Read_the_Monograph", hex(C.ink), "bookstack", hex(C.ember), "https://omthakur.in", "Portfolio")}
  ${badge("Instagram", hex(C.paper), "instagram", "A81745", "https://www.instagram.com/omthakur.op", "Instagram")}
</p>

<img src="./assets/colophon.svg" width="100%" alt="Colophon — signed, Om Thakur" />

<p align="center">
  <img src="${readers}" alt="Readers of this volume" />
</p>
`;

  writeFileSync(join(ROOT, "README.md"), md, "utf8");
  console.log("  ✓ README.md");
}

// ─────────────────────────────────────────────────────────────
console.log("Building Om Thakur's GitHub profile monograph…");
buildHeader();
CHAPTERS.forEach(buildChapter);
buildMetrics();
PROJECTS.forEach(buildProjectCard);
buildMonographCard();
buildStack();
buildExperience();
buildTelemetry();
buildColophon();
buildReadme();
