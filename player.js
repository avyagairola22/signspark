// The lesson player: a full-screen session that shows one exercise at a
// time, checks answers, and brings missed exercises back at the end
// (you can't "fail" a lesson; you finish it once everything is right).

import { RENDERERS } from './exercises.js';
import { reshuffle } from '../engine/lesson.js';
import { recordAnswer, streakNow } from '../core/progress.js';
import { handSVG } from '../render/hands.js';
import { icon } from '../ui/icons.js';
import { esc, confetti, vibrate, openSheet, fmtTime, setBackgroundInert } from '../ui/dom.js';

const PRAISE = ['Nice!', 'Great job!', 'You got it!', 'Correct!', 'Well done!', 'Excellent!'];

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {Array}  opts.exercises
 * @param {string} [opts.doneTitle]   heading on the results screen
 * @param {(r: {accuracy:number, perfect:boolean, seconds:number}) => {xp:number}} opts.onComplete
 * @param {() => void} [opts.onExit]  called when the player closes
 */
export function playSession({ title, exercises, doneTitle = 'Lesson complete!', onComplete, onExit }) {
  const root = document.createElement('div');
  root.className = 'player';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', title);
  root.tabIndex = -1;
  root.innerHTML = `
    <div class="pl-top">
      <button type="button" class="icon-btn pl-quit" aria-label="Quit">${icon('x', 26)}</button>
      <div class="pl-bar" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
      <div class="pl-combo" aria-live="polite"></div>
    </div>
    <div class="pl-body"><div class="pl-stage"></div></div>
    <footer class="pl-foot"><div class="pl-foot-in"><div class="pl-msg" aria-live="assertive"></div><div class="pl-actions"></div></div></footer>`;
  document.body.appendChild(root);
  document.documentElement.classList.add('player-open');
  setBackgroundInert(true);

  const body = root.querySelector('.pl-body');
  const stage = root.querySelector('.pl-stage');
  const foot = root.querySelector('.pl-foot');
  const msg = root.querySelector('.pl-msg');
  const actions = root.querySelector('.pl-actions');
  const bar = root.querySelector('.pl-bar');
  const comboEl = root.querySelector('.pl-combo');

  const queue = exercises.map((e, i) => ({ ...e, _id: i }));
  const total = queue.length;
  const passed = new Set();
  const firstTry = new Map(); // exercise id -> right on the first try?
  const started = Date.now();
  let current = null;
  let handler = null;
  let phase = 'answer';
  let combo = 0;
  let buttons = [];

  function setButtons(list) {
    buttons = list;
    actions.innerHTML = list
      .map((b, i) => `<button type="button" class="btn ${b.kind || ''}" data-i="${i}" ${b.disabled ? 'disabled' : ''}>${esc(b.label)}</button>`)
      .join('');
  }
  actions.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b && !b.disabled) buttons[+b.dataset.i]?.onClick?.();
  });

  const api = {
    stage,
    locked: () => phase !== 'answer',
    ready(on) {
      if (phase !== 'answer' || handler?.mode !== 'check') return;
      const b = actions.querySelector('button');
      if (b) b.disabled = !on;
    },
    setButtons,
    result: (correct, opts) => resolve(correct, opts),
  };

  function setProgress() {
    const pct = Math.round((passed.size / total) * 100);
    bar.firstElementChild.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', String(pct));
  }

  function show() {
    handler?.cleanup?.();
    if (!queue.length) return finish();
    current = queue.shift();
    phase = 'answer';
    foot.className = 'pl-foot';
    msg.innerHTML = '';
    body.scrollTop = 0;
    handler = RENDERERS[current.type](current, api);
    if (handler.mode === 'continue') setButtons([{ label: 'Continue', onClick: advance }]);
    else if (handler.mode === 'check') setButtons([{ label: 'Check', disabled: true, onClick: check }]);
    else setButtons(handler.buttons || []);
  }

  // Cards that only teach (no question) move straight on.
  function advance() {
    passed.add(current._id);
    setProgress();
    show();
  }

  function check() {
    if (phase !== 'answer') return;
    const r = handler.check();
    resolve(r.correct, r);
  }

  function resolve(correct, { answer = '', note = '' } = {}) {
    if (phase !== 'answer') return;
    phase = 'feedback';
    if (!firstTry.has(current._id)) firstTry.set(current._id, correct);
    if (handler.graded !== false) recordAnswer(current.sign, correct);
    if (correct) {
      passed.add(current._id);
      combo++;
      vibrate(15);
    } else {
      combo = 0;
      queue.push(reshuffle(current)); // try it again before the end
      vibrate([30, 60, 30]);
    }
    setProgress();
    comboEl.innerHTML = combo >= 3 ? `${icon('flame', 18)}<span>${combo} in a row</span>` : '';
    foot.classList.add(correct ? 'good' : 'bad');
    const head = correct
      ? `<p class="fb-title">${icon('check', 24)}${PRAISE[Math.floor(Math.random() * PRAISE.length)]}</p>`
      : `<p class="fb-title">${icon('x', 24)}Not quite</p>${answer ? `<p class="fb-ans">Correct answer: ${answer}</p>` : ''}`;
    msg.innerHTML = head + (note ? `<p class="fb-note">${note}</p>` : '');
    handler.reveal?.(correct);
    setButtons([{ label: 'Continue', kind: correct ? 'btn-good' : 'btn-bad', onClick: show }]);
    actions.querySelector('button')?.focus({ preventScroll: true });
  }

  function finish() {
    phase = 'done';
    const results = [...firstTry.values()];
    const right = results.filter(Boolean).length;
    const accuracy = results.length ? Math.round((right / results.length) * 100) : 100;
    const perfect = results.length > 0 && right === results.length;
    const seconds = Math.round((Date.now() - started) / 1000);
    const { xp = 0 } = onComplete?.({ accuracy, perfect, seconds }) || {};
    const streak = streakNow();
    comboEl.innerHTML = '';
    bar.firstElementChild.style.width = '100%';
    stage.innerHTML = `<div class="done">
      <div class="done-hand">${handSVG('ILY', { label: 'I love you handshape' })}</div>
      <h2>${perfect ? 'Perfect!' : esc(doneTitle)}</h2>
      <p class="muted">${perfect ? 'No mistakes at all.' : 'Every exercise answered. Mistakes came back until you got them.'}</p>
      <div class="done-stats">
        <div class="done-tile t-xp"><span>XP earned</span><strong>+${xp}</strong></div>
        <div class="done-tile t-acc"><span>Accuracy</span><strong>${accuracy}%</strong></div>
        <div class="done-tile t-time"><span>Time</span><strong>${fmtTime(seconds)}</strong></div>
      </div>
      ${streak ? `<p class="done-streak">${icon('flame', 20)} ${streak}-day streak</p>` : ''}
    </div>`;
    foot.className = 'pl-foot';
    msg.innerHTML = '';
    setButtons([{ label: 'Continue', onClick: close }]);
    actions.querySelector('button')?.focus({ preventScroll: true });
    confetti();
  }

  function close() {
    handler?.cleanup?.();
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.documentElement.classList.remove('player-open');
    setBackgroundInert(false);
    onExit?.();
  }

  function askQuit() {
    if (phase === 'done') return close();
    openSheet({
      title: 'Quit this session?',
      body: '<p>Progress in this session will not be saved.</p>',
      actions: [
        { label: 'Keep going', kind: 'btn-quiet' },
        { label: 'Quit', kind: 'btn-bad', onClick: close },
      ],
    });
  }
  root.querySelector('.pl-quit').addEventListener('click', askQuit);

  function onKey(e) {
    if (document.querySelector('.sheet-wrap')) return; // a dialog is handling keys
    const typing = e.target.matches?.('input, textarea');
    if (e.key === 'Enter') {
      // A focused button in the exercise does its own job, unless it is the
      // answer already picked: then Enter means "check".
      const t = e.target;
      if (t.matches?.('button') && (t.closest('.pl-actions') || !t.matches('.opt[aria-pressed="true"]'))) return;
      const primary = [...actions.querySelectorAll('button:not([disabled])')].pop();
      if (primary) {
        e.preventDefault();
        primary.click();
      }
    } else if (e.key === 'Escape') {
      askQuit();
    } else if (!typing && /^[1-9]$/.test(e.key) && phase === 'answer') {
      handler?.key?.(Number(e.key));
    }
  }
  document.addEventListener('keydown', onKey);

  setProgress();
  show();
  root.focus({ preventScroll: true });
}
