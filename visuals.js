// Building blocks for showing signs: hand drawings, the hands + body map
// picture for word signs, the five-parameter list, and fingerspelling strips.

import { handSVG } from '../render/hands.js';
import { bodySVG, LOCATIONS } from '../render/body.js';
import { HANDSHAPES } from '../data/handshapes.js';
import { FACE_LABELS, glossOf, nameOf } from '../data/signs.js';
import { esc } from './dom.js';
import { icon } from './icons.js';

/** A hand drawing on its round stage. size: xs | sm | md | lg */
export function handStage(key, { size = 'md', label = '' } = {}) {
  return `<div class="stage stage-${size}">${handSVG(key, { label })}</div>`;
}

/** Map a character to its handshape key (letters and digits). */
export function charHand(ch) {
  if (/[A-Z]/.test(ch)) return ch;
  if (/[0-9]/.test(ch)) return `N${ch}`;
  return null;
}

/**
 * The picture for a sign. Letters and numbers are one handshape.
 * Word signs show the handshape(s) next to a body map with the location,
 * movement and facial expression.
 */
export function signPicture(sign, { size = 'lg', hideName = false } = {}) {
  const label = hideName ? 'Sign to identify' : `ASL sign for ${nameOf(sign)}`;
  if (sign.type !== 'word') return handStage(sign.hand, { size, label });
  const cell = (key, caption, extra = '') =>
    `<div class="sv-hand ${extra}">${handSVG(key)}<span>${caption}</span></div>`;
  const hands = [cell(sign.hand, sign.base ? 'Main hand' : 'Handshape')];
  if (sign.hand2) hands.push(`<span class="sv-to" aria-hidden="true">${icon('arrow', 16)}</span>`, cell(sign.hand2, 'Becomes'));
  if (sign.base) hands.push(cell(sign.base, 'Other hand', 'sv-base'));
  return `<figure class="sv sv-${size}" role="img" aria-label="${esc(label)}">
    <div class="sv-hands">${hands.join('')}</div>
    <div class="sv-body">${bodySVG(sign)}</div>
  </figure>`;
}

function handshapeText(sign) {
  let t = HANDSHAPES[sign.hand].name;
  if (sign.hand2) t += `, changing to ${HANDSHAPES[sign.hand2].name}`;
  if (sign.base) t += `. Other hand: ${HANDSHAPES[sign.base].name}`;
  return t;
}

/** The five parameters of a sign, as ASL teachers list them. */
export function paramList(sign) {
  if (sign.type !== 'word') return '';
  const rows = [
    ['Handshape', handshapeText(sign)],
    ['Location', LOCATIONS[sign.loc]?.label],
    ['Movement', sign.moveText],
    ['Palm', sign.palm],
    ['Face', FACE_LABELS[sign.face]],
  ].filter(([, v]) => v);
  return `<dl class="params">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

export function exampleBlock(example) {
  if (!example) return '';
  return `<div class="example"><span class="example-k">In a sentence</span><p class="gloss">${esc(example.gloss)}</p><p class="example-en">${esc(example.en)}</p></div>`;
}

/**
 * A row of handshapes spelling `text`. Double letters get a "bounce" tag,
 * since signers bounce or slide the hand for them.
 */
export function spellStrip(text, { labels = true, size = 'sm' } = {}) {
  const chars = [...text.toUpperCase()];
  return `<div class="strip">${chars.map((ch, i) => {
    const key = charHand(ch);
    if (!key) return '<div class="strip-gap" aria-hidden="true"></div>';
    const dbl = i > 0 && chars[i - 1] === ch;
    return `<div class="strip-cell${dbl ? ' dbl' : ''}" data-i="${i}">${handStage(key, { size, label: labels ? '' : 'handshape' })}${labels ? `<span class="strip-l">${esc(ch)}</span>` : ''}${dbl ? '<span class="dbl-tag">bounce</span>' : ''}</div>`;
  }).join('')}</div>`;
}

/**
 * Play a fingerspelled word one handshape at a time inside `stageEl`.
 * Returns { play, stop }.
 */
export function speller(stageEl, text, { ms = 800, dots = [], onDone, onStep } = {}) {
  const chars = [...text.toUpperCase()];
  let timer = null;
  let run = 0;
  const stop = () => {
    clearTimeout(timer);
    run++;
  };
  const play = (speed = ms) => {
    stop();
    const mine = run;
    let i = 0;
    const step = () => {
      if (mine !== run) return;
      dots.forEach((d, k) => d.classList.toggle('on', k <= i));
      const ch = chars[i];
      const key = charHand(ch);
      const dbl = i > 0 && chars[i - 1] === ch;
      stageEl.innerHTML = key ? handStage(key, { size: 'lg' }) : '<div class="stage stage-lg stage-blank"></div>';
      const stage = stageEl.firstElementChild;
      stage.classList.add(dbl ? 'bounce' : 'pop');
      onStep?.(i);
      i++;
      if (i < chars.length) timer = setTimeout(step, ch === ' ' ? speed * 0.8 : speed);
      else timer = setTimeout(() => mine === run && onDone?.(), speed);
    };
    step();
  };
  return { play, stop };
}

export { glossOf };
