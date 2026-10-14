// Body map: a simple signer figure that marks WHERE a sign happens,
// HOW it moves (arrows) and WHAT the face does (eyebrows and mouth).
// Like the hands, it is drawn from the viewer's side of a right-handed
// signer, so the signer's dominant side is on the viewer's left.

export const LOCATIONS = {
  forehead: { x: 80, y: 31, label: 'forehead' },
  temple: { x: 60, y: 37, label: 'side of the forehead' },
  ear: { x: 55, y: 51, label: 'near the ear' },
  cheek: { x: 65, y: 61, label: 'cheek' },
  face: { x: 80, y: 54, label: 'in front of the face' },
  mouth: { x: 80, y: 66, label: 'mouth' },
  chin: { x: 80, y: 76, label: 'chin' },
  jaw: { x: 64, y: 70, label: 'jaw' },
  shoulder: { x: 40, y: 104, label: 'raised near the shoulder' },
  chest: { x: 80, y: 120, label: 'chest' },
  neutral: { x: 80, y: 140, label: 'in front of your body' },
};

const BROWS = {
  neutral: 'M64 41Q69 39 74 41M86 41Q91 39 96 41',
  up: 'M63 35Q69 31 75 35M85 35Q91 31 97 35',
  down: 'M64 38L75 43M85 43L96 38',
  sad: 'M64 42L74 37.5M86 37.5L96 42',
  angry: 'M63 37L75 43M85 43L97 37',
};
const MOUTHS = {
  neutral: 'M74 67Q80 69 86 67',
  smile: 'M71 63Q80 74 89 63',
  frown: 'M72 70Q80 63 88 70',
  tight: 'M73 68L87 68',
};
const FACES = {
  neutral: { brows: 'neutral', mouth: 'neutral' },
  'q-wh': { brows: 'down', mouth: 'neutral' },
  'q-yn': { brows: 'up', mouth: 'neutral' },
  happy: { brows: 'neutral', mouth: 'smile' },
  excited: { brows: 'up', mouth: 'smile' },
  sad: { brows: 'sad', mouth: 'frown' },
  angry: { brows: 'angry', mouth: 'tight' },
  scared: { brows: 'up', mouth: 'open' },
  tired: { brows: 'neutral', mouth: 'neutral', eyes: 'sleepy' },
};

const rnd = (n) => Math.round(n * 10) / 10;

function head(x, y, dx, dy, size = 6) {
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const bx = x - ux * size;
  const by = y - uy * size;
  const px = -uy * size * 0.6;
  const py = ux * size * 0.6;
  return `<path class="bd-mh" d="M${rnd(x + ux)} ${rnd(y + uy)}L${rnd(bx + px)} ${rnd(by + py)}L${rnd(bx - px)} ${rnd(by - py)}Z"/>`;
}

// A curved arrow from (x1, y1) to (x2, y2); `bend` bows it sideways.
function arrow(x1, y1, x2, y2, { bend = 0, both = false } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (x1 + x2) / 2 - (dy / len) * bend;
  const cy = (y1 + y2) / 2 + (dx / len) * bend;
  let s = `<path class="bd-mv" d="M${rnd(x1)} ${rnd(y1)}Q${rnd(cx)} ${rnd(cy)} ${rnd(x2)} ${rnd(y2)}"/>`;
  s += head(x2, y2, x2 - cx, y2 - cy);
  if (both) s += head(x1, y1, x1 - cx, y1 - cy);
  return s;
}

const unit = (dir) => [Math.sin((dir * Math.PI) / 180), -Math.cos((dir * Math.PI) / 180)];

function movementGlyph(move, { x, y }) {
  const m = typeof move === 'string' ? { type: move } : move || { type: 'hold' };
  switch (m.type) {
    case 'tap':
      return `<path class="bd-mv" d="M${x + 8} ${y - 8}L${x + 13} ${y - 13}M${x + 10} ${y}L${x + 17} ${y}M${x + 8} ${y + 8}L${x + 13} ${y + 13}"/>`;
    case 'circle': {
      const r = 13;
      const p = (deg) => [x + r * Math.cos((deg * Math.PI) / 180), y + r * Math.sin((deg * Math.PI) / 180)];
      const [sx, sy] = p(-60);
      const [ex, ey] = p(210);
      return `<path class="bd-mv" d="M${rnd(sx)} ${rnd(sy)}A${r} ${r} 0 1 1 ${rnd(ex)} ${rnd(ey)}"/>` + head(ex, ey, 0.5, -0.866);
    }
    case 'out':
    case 'arc': {
      const [u, v] = unit(m.dir ?? 180);
      return arrow(x + u * 8, y + v * 8, x + u * 34, y + v * 34, { bend: m.type === 'arc' ? 9 : 0 });
    }
    case 'up':
      return arrow(x, y - 8, x, y - 32);
    case 'down':
      return arrow(x, y + 8, x, y + 30);
    case 'to': {
      const t = LOCATIONS[m.to];
      const dx = t.x - x;
      const dy = t.y - y;
      const l = Math.hypot(dx, dy) || 1;
      return arrow(x + (dx / l) * 8, y + (dy / l) * 8, t.x - (dx / l) * 7, t.y - (dy / l) * 7, { bend: 10 }) +
        `<circle class="bd-dot2" cx="${t.x}" cy="${t.y}" r="3.5"/>`;
    }
    case 'shake':
      return arrow(x - 17, y + 15, x + 17, y + 15, { both: true });
    case 'nod':
      return arrow(x + 16, y - 11, x + 16, y + 11, { both: true });
    case 'twist':
      return arrow(x - 15, y - 11, x + 15, y - 11, { bend: -9, both: true });
    case 'wave':
      return arrow(x - 11, y - 12, x + 11, y - 12, { bend: -6, both: true });
    case 'rock':
      return arrow(x - 24, y + 12, x + 24, y + 12, { bend: 10, both: true });
    case 'together':
      return arrow(x - 32, y, x - 10, y) + arrow(x + 32, y, x + 10, y);
    case 'wiggle':
      return `<path class="bd-mv" d="M${x + 8} ${y - 10}l5 -6l5 6l5 -6"/>`;
    case 'brushUp':
      return arrow(x - 8, y + 12, x - 8, y - 16) + arrow(x + 8, y + 12, x + 8, y - 16);
    case 'cross':
      return arrow(x - 16, y - 14, x + 14, y + 12) + arrow(x + 16, y - 14, x - 14, y + 12);
    case 'pullIn':
      return arrow(x, y + 4, x, y - 22);
    case 'slide':
      return arrow(x - 18, y - 9, x + 20, y - 9);
    case 'flick':
      return arrow(x + 4, y - 7, x + 14, y - 26);
    default: // hold
      return `<path class="bd-mv" d="M${x} ${y - 10}V${y - 16}M${x} ${y + 10}V${y + 16}M${x - 10} ${y}H${x - 16}M${x + 10} ${y}H${x + 16}"/>`;
  }
}

function faceMarkup(faceKey) {
  const f = FACES[faceKey] || FACES.neutral;
  const eyes = f.eyes === 'sleepy'
    ? '<path class="bd-ln" d="M66 50Q70 52.5 74 50M86 50Q90 52.5 94 50"/>'
    : '<circle class="bd-eye" cx="70" cy="49" r="2.6"/><circle class="bd-eye" cx="90" cy="49" r="2.6"/>';
  const mouth = f.mouth === 'open'
    ? '<ellipse class="bd-eye" cx="80" cy="68" rx="3.6" ry="4.6"/>'
    : `<path class="bd-ln" d="${MOUTHS[f.mouth]}"/>`;
  return `<path class="bd-ln" d="${BROWS[f.brows]}"/>${eyes}${mouth}`;
}

/**
 * Draw the body map for a word sign as an SVG string.
 * @param {object} sign  a word sign from src/data/signs.js
 */
export function bodySVG(sign, { label = '' } = {}) {
  const loc = LOCATIONS[sign.loc] || LOCATIONS.neutral;
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  const space = sign.loc === 'neutral'
    ? `<ellipse class="bd-space" cx="${loc.x}" cy="${loc.y}" rx="36" ry="12"/>`
    : '';
  return `<svg class="body-map" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" ${a11y}>
<path class="bd-fig" d="M12 160C14 128 22 110 44 102L70 94Q80 99 90 94L116 102C138 110 146 128 148 160Z"/>
<path class="bd-fig" d="M71 74L71 95Q80 100 89 95L89 74Z"/>
<ellipse class="bd-fig" cx="55" cy="52" rx="4.5" ry="7.5"/><ellipse class="bd-fig" cx="105" cy="52" rx="4.5" ry="7.5"/>
<ellipse class="bd-fig" cx="80" cy="50" rx="25" ry="30"/>
<path class="bd-hair" d="M55 47C54 25 68 18 80 18C93 18 106 25 105 47C99 35 90 30 80 31C70 30 61 35 55 47Z"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${faceMarkup(sign.face)}</g>
${space}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${movementGlyph(sign.move, loc)}</g>
<circle class="bd-ring" cx="${loc.x}" cy="${loc.y}" r="9"/><circle class="bd-dot" cx="${loc.x}" cy="${loc.y}" r="4.5"/>
</svg>`;
}
