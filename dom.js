// Small DOM helpers: escaping, toasts, dialogs, confetti, vibration.

import { icon } from './icons.js';
import { store } from '../core/store.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text before putting it into HTML. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const reducedMotion = () =>
  document.documentElement.classList.contains('reduce-motion') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A short vibration on phones that support it (if the learner allows it). */
export function vibrate(pattern) {
  try {
    if (store.state.settings.haptics) navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

let toastBox = null;
export function toast(message, { icon: name = 'sparkle', tone = 'info', ms = 3400 } = {}) {
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.className = 'toasts';
    toastBox.setAttribute('role', 'status');
    toastBox.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastBox);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${tone}`;
  t.innerHTML = `${icon(name, 20)}<span>${esc(message)}</span>`;
  toastBox.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 300);
  }, ms);
}

/**
 * A dialog built into the page (browser alert/confirm boxes are blocked in
 * some hosts, and these look better anyway).
 * actions: [{ label, kind, onClick }] - return false from onClick to keep it open.
 */
export function openSheet({ title, body, actions = [], onClose, className = '' }) {
  const before = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet ${className}" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
    <div class="sheet-head"><h2 id="sheet-title">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="sheet-body">${body}</div>
    ${actions.length ? `<div class="sheet-actions">${actions.map((a, i) => `<button type="button" class="btn ${a.kind || ''}" data-action="${i}">${esc(a.label)}</button>`).join('')}</div>` : ''}
  </div>`;
  document.body.appendChild(wrap);
  // Block everything behind the dialog (the page, or a lesson in progress).
  const behind = [...document.querySelectorAll('.app, .tabbar, .player')].map((el) => [el, el.inert]);
  behind.forEach(([el]) => { el.inert = true; });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    behind.forEach(([el, was]) => { el.inert = was; });
    wrap.remove();
    document.removeEventListener('keydown', onKey, true);
    before?.focus?.();
    onClose?.();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  };
  document.addEventListener('keydown', onKey, true);
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap || e.target.closest('[data-close]')) return close();
    const btn = e.target.closest('[data-action]');
    if (btn && actions[+btn.dataset.action].onClick?.() !== false) close();
  });
  (wrap.querySelector('[data-action]') || wrap.querySelector('[data-close]')).focus();
  return { el: wrap.querySelector('.sheet'), close };
}

/** A burst of confetti on a canvas that removes itself. */
export function confetti() {
  if (reducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.remove();
  const dpr = window.devicePixelRatio || 1;
  const W = (canvas.width = window.innerWidth * dpr);
  const H = (canvas.height = window.innerHeight * dpr);
  const colors = ['#2350E6', '#FFB21E', '#12A150', '#E2562B', '#C2306B', '#0B7F72'];
  const bits = Array.from({ length: 130 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.4,
    y: H * 0.38,
    vx: (Math.random() - 0.5) * 15 * dpr,
    vy: (-Math.random() * 15 - 6) * dpr,
    r: (4 + Math.random() * 5) * dpr,
    rot: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    for (const b of bits) {
      b.vy += 0.36 * dpr;
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.99;
      b.rot += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.r, -b.r / 2, b.r * 2, b.r);
      ctx.restore();
    }
    if (++frame < 160) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}

/** Copy text, falling back to selecting it if the clipboard is blocked. */
export async function copyText(text, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    fallbackEl?.focus();
    fallbackEl?.select?.();
    return false;
  }
}

export const fmtNumber = (n) => Number(n).toLocaleString();

export function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m}:${String(s).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}

/**
 * While a full-screen session is open, make the page behind it inert so
 * keyboard focus and clicks cannot reach it.
 */
export function setBackgroundInert(on) {
  document.querySelectorAll('.app, .tabbar').forEach((el) => {
    el.inert = on;
  });
}

/** True on devices with a precise pointer (so auto-focusing a text box will not pop up a phone keyboard). */
export const finePointer = () => window.matchMedia?.('(pointer: fine)').matches;
