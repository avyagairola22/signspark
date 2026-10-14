// Procedural hand renderer.
//
// Turns a handshape recipe (src/data/handshapes.js) into an SVG drawing.
// The hand is drawn as a right hand seen palm-out, the way you see a
// right-handed signer facing you. Mirroring for left-handed learners is done
// with one CSS class on <html>, so drawings never have to be re-rendered.
//
// Every finger and the thumb is a thick stroked path drawn twice: a wider
// dark stroke (the outline) and a narrower skin stroke on top. Drawing the
// pieces in the right order is what makes fingers look folded in front of
// the palm or tucked behind other fingers.

import { HANDSHAPES } from '../data/handshapes.js';

const FINGERS = {
  p: { x: 40, w: 10.5, len: 27 },
  r: { x: 53.5, w: 12, len: 34 },
  m: { x: 67, w: 12.5, len: 37 },
  i: { x: 80.5, w: 12, len: 34 },
};
const ORDER = ['p', 'r', 'm', 'i']; // left to right as the viewer sees them
const PIVOT_Y = 65; // the big knuckles
const ROOT_Y = 86; // limbs start inside the palm so the joint has no seam
const THUMB_W = 13.5;
const EDGE = 3.6; // outline width added around every limb
const GAPS = { im: 73.8, mr: 60.2, rp: 46.8 }; // where a tucked thumb peeks out
const PALM = { x: 31, y: 62, w: 60, h: 58, rx: 17 };
const WRIST = { x: 41, y: 106, w: 40, h: 60, rx: 9 };
const SIDE_PALM = { x: 37, y: 62, w: 36, h: 60, rx: 16 };
const SIDE_WRIST = { x: 42, y: 106, w: 28, h: 60, rx: 9 };
const CENTER = [60, 78];

// Side-view shapes: one curved stroke for the fingers, one for the thumb.
const SIDE_PATHS = {
  C: { fingers: 'M52 76C49 40 95 31 101 61', thumb: 'M63 113C78 126 99 119 103 100' },
  O: { fingers: 'M52 76C48 37 105 32 104 72', thumb: 'M63 113C84 128 107 109 104 81' },
  flatO: { fingers: 'M54 74C58 51 88 45 104 62', thumb: 'M63 106C79 101 94 84 103 68' },
};

// Traced movements, with arrowheads given as [x, y, directionX, directionY].
const MOTIONS = {
  J: { d: 'M22 30L22 64Q22 82 38 78', heads: [[38, 78, 0.97, -0.24]] },
  Z: { d: 'M100 6L72 6L100 25L72 25', heads: [[72, 25, -1, 0]] },
  shake: { d: 'M78 50Q91 39 104 50', heads: [[78, 50, -0.78, 0.63], [104, 50, 0.78, 0.63]] },
};

// Colors used when a drawing must stand alone (outside the app's CSS).
export const DEFAULT_COLORS = {
  hand: '#FFCF5A', hand2: '#F2B93B', line: '#8A5A0E', nail: '#FFF0C2', motion: '#E0461F',
};

const rnd = (n) => Math.round(n * 10) / 10;
const rad = (deg) => (deg * Math.PI) / 180;
const line = (pts) => 'M' + pts.map(([x, y]) => `${rnd(x)} ${rnd(y)}`).join('L');

// Point `len` away from (x, y), leaning `deg` degrees from straight up.
function polar(x, y, len, deg) {
  return [x + len * Math.sin(rad(deg)), y - len * Math.cos(rad(deg))];
}

// Move every coordinate pair of an absolute path (M/L/Q/C only).
function shift(d, dx, dy) {
  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => String(rnd(Number(n) + (i++ % 2 ? dy : dx))));
}

function normFinger(v) {
  if (typeof v === 'number') return { s: 'ext', a: v };
  if (typeof v === 'string') return { s: v, a: 0 };
  return { s: 'ext', a: 0, ...v };
}

function buildFinger(key, { s, a }, back) {
  const g = FINGERS[key];
  const dir = [Math.sin(rad(a)), -Math.cos(rad(a))];

  if (s === 'ext' || s === 'bent') {
    const len = s === 'bent' ? g.len * 0.46 : g.len;
    const tip = polar(g.x, PIVOT_Y, len, a);
    const el = { d: line([[g.x, ROOT_Y], [g.x, PIVOT_Y], tip]), w: s === 'bent' ? g.w + 1 : g.w, x: g.x };
    if (s === 'bent') {
      // Bent toward the viewer: we see the fingertip pad.
      if (!back) el.pad = { cx: rnd(tip[0]), cy: rnd(tip[1] + 1), rx: rnd(g.w * 0.3), ry: rnd(g.w * 0.26) };
    } else if (back) {
      // Back of the hand: show the fingernail near the tip.
      el.nail = line([
        [tip[0] - dir[0] * 5.5, tip[1] - dir[1] * 5.5],
        [tip[0] + dir[0] * 0.8, tip[1] + dir[1] * 0.8],
      ]);
      el.nailW = g.w * 0.52;
    } else {
      // Palm side: a joint crease halfway up the finger.
      const mid = polar(g.x, PIVOT_Y, len * 0.52, a);
      const px = Math.cos(rad(a)) * g.w * 0.3;
      const py = Math.sin(rad(a)) * g.w * 0.3;
      el.crease = line([[mid[0] - px, mid[1] - py], [mid[0] + px, mid[1] + py]]);
    }
    return el;
  }

  if (s === 'hook') {
    const m = polar(g.x, PIVOT_Y, g.len * 0.6, a);
    return {
      d: `M${g.x} ${ROOT_Y}L${g.x} ${PIVOT_Y}L${rnd(m[0])} ${rnd(m[1])}Q${rnd(m[0])} ${rnd(m[1] - 10)} ${rnd(m[0] + 7)} ${rnd(m[1] - 7)}L${rnd(m[0] + 8.5)} ${rnd(m[1] + 1)}`,
      w: g.w,
      x: g.x,
    };
  }

  // 'curl' and 'tight' fold over the palm, so they sit in front of it.
  if (back) return { front: true, d: line([[g.x, 58.5], [g.x, 64]]), w: g.w + 0.8, x: g.x };
  const end = s === 'tight' ? 81 : 87;
  return {
    front: true,
    d: line([[g.x, 58.5], [g.x, end]]),
    w: g.w + 0.8,
    x: g.x,
    nail: line([[g.x, end - 5.5], [g.x, end - 1]]),
    nailW: g.w * 0.5,
  };
}

function buildThumb(spec, fingers) {
  const th = typeof spec === 'string' ? { t: spec } : spec;
  const W = THUMB_W;
  switch (th.t) {
    case 'out': return { d: 'M76 112L90 101L104 86', w: W };
    case 'outWide': return { d: 'M76 112L92 103L109 94', w: W };
    case 'out90': return { d: 'M76 110L93 101L110 99', w: W };
    case 'parallel': return { d: 'M80 112L92 98L97 42', w: W - 1 };
    case 'side': return { front: true, d: 'M88 112L91.5 93L92 71', w: W };
    case 'across': return { front: true, d: 'M90 107L74 93L50 87', w: W };
    case 'tuck': return { front: true, d: 'M90 111L78 101L62 99', w: W };
    case 'low': return { front: true, first: true, d: 'M91 105L72 95L47 93', w: W };
    case 'hold': {
      // Thumb holds down whichever fingers are curled.
      const curled = ORDER.filter((k) => fingers[k].s === 'curl');
      const x = curled.length ? FINGERS[curled[0]].x + 3 : 52;
      return { front: true, d: `M90 107L74 95L${x} 89`, w: W };
    }
    case 'under': {
      const gx = GAPS[th.gap];
      return { front: true, gap: gx, d: `M90 109L82 95L${gx} 74`, w: W - 1 };
    }
    case 'touch': {
      const g = FINGERS[th.to];
      const tip = fingers[th.to].s === 'curl' ? [g.x + 2, 84] : [g.x + 2, 72];
      return { front: true, d: line([[90, 109], [(90 + tip[0]) / 2 + 4, 100], tip]), w: W };
    }
    case 'k': return { front: true, d: 'M90 111L81 93L74 72', w: W - 1 };
    default: return null;
  }
}

function frontView(spec) {
  const back = spec.view === 'back';
  const fingers = Object.fromEntries(ORDER.map((k) => [k, normFinger(spec.f[k])]));
  const under = []; // drawn before the palm cover (attached to the palm edge)
  const over = []; // drawn in front of the palm
  for (const k of ORDER) {
    const el = buildFinger(k, fingers[k], back);
    (el.front ? over : under).push(el);
  }
  const th = spec.thumb ? buildThumb(spec.thumb, fingers) : null;
  if (th && !th.front) under.unshift(th);
  else if (th && !back) {
    // From the back you can't see a thumb tucked on the palm side.
    if (th.first) over.unshift(th);
    else if (th.gap) {
      // Tucked under some fingers: draw it before the fingers that cover it.
      const i = over.findIndex((el) => el.x > th.gap);
      over.splice(i < 0 ? over.length : i, 0, th);
    } else over.push(th);
  }
  return { palm: PALM, wrist: WRIST, under, over, crease: !back };
}

function sideView(kind) {
  const p = SIDE_PATHS[kind];
  return {
    palm: SIDE_PALM,
    wrist: SIDE_WRIST,
    under: [
      { d: shift(p.fingers, 6, -8), w: 10.5, shade: true },
      { d: shift(p.fingers, 3, -4), w: 11, shade: true },
      { d: p.fingers, w: 12 },
      { d: p.thumb, w: THUMB_W },
    ],
    over: [],
    crease: false,
  };
}

function drawLimb(el) {
  let s = `<path class="hd-o" d="${el.d}" stroke-width="${rnd(el.w + EDGE)}"/>`;
  s += `<path class="${el.shade ? 'hd-s2' : 'hd-s'}" d="${el.d}" stroke-width="${rnd(el.w)}"/>`;
  if (el.crease) s += `<path class="hd-c" d="${el.crease}" stroke-width="1.3"/>`;
  if (el.nail) s += `<path class="hd-n" d="${el.nail}" stroke-width="${rnd(el.nailW)}"/>`;
  if (el.pad) s += `<ellipse class="hd-nf" cx="${el.pad.cx}" cy="${el.pad.cy}" rx="${el.pad.rx}" ry="${el.pad.ry}"/>`;
  return s;
}

const rect = (r, cls) => `<rect class="${cls}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.rx}" stroke-width="1.8"/>`;

function arrowHead([x, y, ux, uy], size = 6) {
  const bx = x - ux * size;
  const by = y - uy * size;
  const px = -uy * size * 0.62;
  const py = ux * size * 0.62;
  return `<path class="hd-mof" d="M${rnd(x + ux * 1.5)} ${rnd(y + uy * 1.5)}L${rnd(bx + px)} ${rnd(by + py)}L${rnd(bx - px)} ${rnd(by - py)}Z"/>`;
}

function drawMotion(kind) {
  const m = MOTIONS[kind];
  return `<path class="hd-mo" d="${m.d}" stroke-width="3" stroke-dasharray="1 6.5"/>` + m.heads.map((h) => arrowHead(h)).join('');
}

export function styleFor(c = DEFAULT_COLORS) {
  return `<style>.hd-o{stroke:${c.line}}.hd-s{stroke:${c.hand}}.hd-s2{stroke:${c.hand2}}.hd-n{stroke:${c.nail}}.hd-nf{fill:${c.nail}}.hd-c{stroke:${c.line};opacity:.45}.hd-pf{fill:${c.hand};stroke:${c.line}}.hd-cv{fill:${c.hand}}.hd-mo{stroke:${c.motion}}.hd-mof{fill:${c.motion}}</style>`;
}

/**
 * Draw a handshape as an SVG string.
 * @param {string} key  a key of HANDSHAPES, e.g. 'A', 'N7', 'OPEN5'
 * @param {object} [opts]
 * @param {string} [opts.label]      accessible name; omit to hide from screen readers
 * @param {string} [opts.className]  extra classes for the <svg>
 * @param {object} [opts.colors]     embed colors (for drawings used outside the app)
 */
export function handSVG(key, { label = '', className = '', colors = null } = {}) {
  const spec = HANDSHAPES[key];
  if (!spec) throw new Error(`Unknown handshape "${key}"`);
  const shape = spec.custom ? sideView(spec.custom) : frontView(spec);

  const mirror = spec.view === 'back';
  const rot = spec.rotate || 0;
  let transform = '';
  if (mirror || rot) {
    const [cx, cy] = CENTER;
    transform = ` transform="translate(${cx} ${cy})${mirror ? ' scale(-1 1)' : ''}${rot ? ` rotate(${rot})` : ''} translate(${-cx} ${-cy})"`;
  }

  const parts = [rect(shape.wrist, 'hd-pf'), rect(shape.palm, 'hd-pf')];
  for (const el of shape.under) parts.push(drawLimb(el));
  // Cover the limb roots inside the palm so fingers look attached.
  const p = shape.palm;
  parts.push(`<rect class="hd-cv" x="${p.x + 1.8}" y="${p.y + 1.8}" width="${p.w - 3.6}" height="${p.h - 3.6}" rx="${p.rx - 1.8}"/>`);
  if (shape.crease) parts.push('<path class="hd-c" d="M42 98Q57 92 74 95" stroke-width="1.4"/>');
  for (const el of shape.over) parts.push(drawLimb(el));
  if (spec.motion) parts.push(drawMotion(spec.motion));

  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="hand ${className}" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" ${a11y}>${colors ? styleFor(colors) : ''}<g fill="none" stroke-linecap="round" stroke-linejoin="round"${transform}>${parts.join('')}</g></svg>`;
}

export const HANDSHAPE_KEYS = Object.keys(HANDSHAPES);
