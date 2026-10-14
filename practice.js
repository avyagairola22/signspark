// Practice: smart review, the fingerspelling reader, a lightning round,
// sentence building, the culture quiz, and "fingerspell anything".

import { store } from '../core/store.js';
import { learnedIds, awardXp, lessonStatus, checkAchievements } from '../core/progress.js';
import {
  buildSmartReview, buildSentencePractice, buildCultureQuiz, shuffle, distractors, toLetters,
} from '../engine/lesson.js';
import { SPELL_WORDS } from '../data/spelling.js';
import { LETTERS, NUMBERS, WORDS, BY_ID, glossOf } from '../data/signs.js';
import { UNITS, XP } from '../data/curriculum.js';
import { playSession } from './player.js';
import { icon } from '../ui/icons.js';
import { esc, toast, vibrate, finePointer, setBackgroundInert } from '../ui/dom.js';
import { handStage, signPicture, spellStrip, speller, charHand } from '../ui/visuals.js';

const SPEEDS = [
  { label: 'Very slow', ms: 1150 },
  { label: 'Slow', ms: 880 },
  { label: 'Medium', ms: 650 },
  { label: 'Fast', ms: 450 },
  { label: 'Very fast', ms: 300 },
];

let activeSpeller = null; // stopped when the page changes
export function stopPractice() {
  activeSpeller?.stop();
  activeSpeller = null;
}

function practiceSession(title, exercises, refresh) {
  playSession({
    title,
    exercises,
    doneTitle: 'Practice complete!',
    onComplete: ({ perfect }) => {
      const xp = XP.practice + (perfect ? XP.perfect : 0);
      awardXp(xp);
      return { xp };
    },
    onExit: refresh,
  });
}

function modeCard(id, title, text, iconName, enabled, tone) {
  return `<button type="button" class="mode mode-${tone}" data-mode="${id}" ${enabled ? '' : 'disabled'}>
    <span class="mode-icon">${icon(iconName, 26)}</span>
    <span class="mode-copy"><strong>${title}</strong><span>${text}</span></span>
    <span class="mode-go" aria-hidden="true">${icon('arrow', 20)}</span>
  </button>`;
}

export function renderPractice(page, ctx) {
  const s = store.state;
  const learned = learnedIds();
  const sentenceUnits = UNITS
    .filter((u) => u.lessons.some((l) => l.kind === 'sentences' && lessonStatus(l.id) !== 'locked'))
    .map((u) => u.id);
  const sample = (s.profile.name || 'HELLO').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 24) || 'HELLO';

  page.innerHTML = `
    <header class="page-head">
      <h1>Practice</h1>
      <p>Short sessions that keep your signs fresh. Each one earns XP.</p>
    </header>
    <div class="modes">
      ${modeCard('review', 'Smart review', learned.length >= 4 ? `Drills the signs you miss most, out of the ${learned.length} you have learned.` : 'Finish a lesson first. Smart review drills the signs you miss most.', 'replay', learned.length >= 4, 'a')}
      ${modeCard('reader', 'Fingerspelling reader', 'Watch words spelled at speed, then type what you saw.', 'eye', true, 'b')}
      ${modeCard('lightning', 'Lightning round', 'Sixty seconds. Name as many signs as you can.', 'timer', true, 'c')}
      ${modeCard('sentences', 'Sentence builder', sentenceUnits.length ? 'Put signs in ASL word order.' : 'Opens when you reach the first sentences lesson.', 'chat', sentenceUnits.length > 0, 'd')}
      ${modeCard('culture', 'Deaf culture quiz', 'True or false: Deaf history, language and etiquette.', 'heart', true, 'e')}
    </div>

    <section class="card spell-any" aria-labelledby="fs-h">
      <h2 id="fs-h">Fingerspell anything</h2>
      <p class="muted">Type a name or word to see it fingerspelled. Try your own name.</p>
      <div class="spell-controls">
        <label class="sr-only" for="fs-text">Word or name to fingerspell</label>
        <input id="fs-text" type="text" maxlength="24" autocomplete="off" spellcheck="false" value="${esc(sample)}">
        <button type="button" class="btn" id="fs-play">${icon('play', 18)}Play</button>
      </div>
      <div class="spell-speed">
        <label for="fs-speed">Speed</label>
        <input id="fs-speed" type="range" min="0" max="4" step="1" value="2">
        <output id="fs-speed-out" for="fs-speed">Medium</output>
      </div>
      <div class="spell-big"></div>
      <div class="spell-strip"></div>
    </section>`;

  page.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mode]');
    if (!m || m.disabled) return;
    const mode = m.dataset.mode;
    if (mode === 'review') practiceSession('Smart review', buildSmartReview(store.state), ctx.refresh);
    if (mode === 'sentences') practiceSession('Sentence builder', buildSentencePractice(sentenceUnits), ctx.refresh);
    if (mode === 'culture') practiceSession('Deaf culture quiz', buildCultureQuiz(), ctx.refresh);
    if (mode === 'reader') openReader(ctx.refresh);
    if (mode === 'lightning') openLightning(ctx.refresh);
  });

  // ---- Fingerspell anything ----
  const input = page.querySelector('#fs-text');
  const big = page.querySelector('.spell-big');
  const strip = page.querySelector('.spell-strip');
  const speed = page.querySelector('#fs-speed');
  const speedOut = page.querySelector('#fs-speed-out');
  const clean = () => input.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').slice(0, 24);
  const paint = () => {
    stopPractice();
    const text = clean();
    const first = [...text].find((ch) => charHand(ch));
    strip.innerHTML = first ? spellStrip(text) : '<p class="muted">Type letters or numbers above.</p>';
    big.innerHTML = first ? handStage(charHand(first), { size: 'lg' }) : '';
    return text;
  };
  const play = () => {
    const text = paint();
    if (!text.trim()) return;
    activeSpeller = speller(big, text, {
      ms: SPEEDS[+speed.value].ms,
      onStep: (i) => strip.querySelectorAll('.strip-cell').forEach((c) => c.classList.toggle('on', +c.dataset.i === i)),
      onDone: () => strip.querySelectorAll('.strip-cell').forEach((c) => c.classList.remove('on')),
    });
    activeSpeller.play();
  };
  input.addEventListener('input', paint);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') play(); });
  page.querySelector('#fs-play').addEventListener('click', play);
  speed.addEventListener('input', () => { speedOut.textContent = SPEEDS[+speed.value].label; });
  paint();
}

// ---- Shared full-screen frame for the two games ----------------------------

function overlay(title, onClose) {
  const root = document.createElement('div');
  root.className = 'player tool';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', title);
  root.tabIndex = -1;
  root.innerHTML = `<div class="pl-top">
      <button type="button" class="icon-btn pl-quit" aria-label="Close">${icon('x', 26)}</button>
      <h2 class="tool-title">${esc(title)}</h2>
      <div class="tool-side" aria-live="polite"></div>
    </div>
    <div class="pl-body"><div class="pl-stage tool-stage"></div></div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add('player-open');
  setBackgroundInert(true);
  root.focus({ preventScroll: true });
  const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.sheet-wrap')) close(); };
  function close() {
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.documentElement.classList.remove('player-open');
    setBackgroundInert(false);
    onClose?.();
  }
  document.addEventListener('keydown', onKey);
  root.querySelector('.pl-quit').addEventListener('click', close);
  return { root, stage: root.querySelector('.tool-stage'), side: root.querySelector('.tool-side'), close };
}

// ---- Fingerspelling reader ---------------------------------------------------

const LENGTHS = [
  { id: 'short', label: 'Short', test: (w) => w.length <= 3 },
  { id: 'medium', label: 'Medium', test: (w) => w.length === 4 },
  { id: 'long', label: 'Long', test: (w) => w.length >= 5 },
];

function openReader(refresh) {
  let earned = 0;
  let score = 0;
  let streak = 0;
  let word = '';
  let phase = 'guess';
  let sp = null;
  const { stage, side, close } = overlay('Fingerspelling reader', () => {
    sp?.stop();
    if (earned) {
      awardXp(earned);
      toast(`Fingerspelling reader: +${earned} XP`, { icon: 'eye' });
    }
    refresh();
  });

  stage.innerHTML = `<div class="rd">
    <div class="rd-settings">
      <fieldset class="seg seg-sm"><legend>Speed</legend>
        ${SPEEDS.slice(1).map((s, i) => `<input type="radio" name="rd-speed" id="rd-speed-${i + 1}" value="${i + 1}" ${i + 1 === 2 ? 'checked' : ''}><label for="rd-speed-${i + 1}">${s.label}</label>`).join('')}
      </fieldset>
      <fieldset class="seg seg-sm"><legend>Word length</legend>
        ${LENGTHS.map((l, i) => `<input type="radio" name="rd-len" id="rd-len-${l.id}" value="${l.id}" ${i === 0 ? 'checked' : ''}><label for="rd-len-${l.id}">${l.label}</label>`).join('')}
      </fieldset>
    </div>
    <div class="reader">
      <div class="reader-stage"></div>
      <div class="reader-dots" aria-hidden="true"></div>
    </div>
    <form class="rd-form" autocomplete="off">
      <label class="sr-only" for="rd-input">The word you saw</label>
      <input id="rd-input" type="text" maxlength="14" autocapitalize="characters" spellcheck="false" placeholder="Type the word">
      <button type="submit" class="btn" id="rd-submit">Check</button>
    </form>
    <div class="rd-result" aria-live="polite"></div>
    <div class="rd-actions">
      <button type="button" class="btn btn-quiet btn-sm" data-replay>${icon('replay', 18)}Replay</button>
      <button type="button" class="btn btn-quiet btn-sm" data-skip>Skip word</button>
    </div>
  </div>`;

  const input = stage.querySelector('#rd-input');
  const submit = stage.querySelector('#rd-submit');
  const result = stage.querySelector('.rd-result');
  const dotsBox = stage.querySelector('.reader-dots');
  const readerStage = stage.querySelector('.reader-stage');
  const speedMs = () => SPEEDS[+stage.querySelector('[name="rd-speed"]:checked').value].ms;
  const lengthTest = () => LENGTHS.find((l) => l.id === stage.querySelector('[name="rd-len"]:checked').value).test;
  const showScore = () => { side.innerHTML = `<span class="tool-score">${icon('check', 18)}${score}</span>${streak >= 2 ? `<span class="tool-score lit">${icon('flame', 18)}${streak}</span>` : ''}`; };

  function nextWord() {
    const choices = SPELL_WORDS.filter(lengthTest()).filter((w) => w !== word);
    word = choices[Math.floor(Math.random() * choices.length)];
    phase = 'guess';
    input.value = '';
    input.disabled = false;
    submit.textContent = 'Check';
    result.innerHTML = '';
    result.className = 'rd-result';
    dotsBox.innerHTML = [...word].map(() => '<i></i>').join('');
    sp?.stop();
    sp = speller(readerStage, word, {
      ms: speedMs(),
      dots: [...dotsBox.children],
      onDone: () => { if (finePointer()) input.focus({ preventScroll: true }); },
    });
    sp.play();
  }

  stage.querySelector('.rd-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (phase === 'shown') return nextWord();
    if (!input.value.trim()) return input.focus();
    const correct = toLetters(input.value) === word;
    phase = 'shown';
    input.disabled = true;
    if (correct) {
      score++;
      streak++;
      earned += XP.trainerWord;
      store.update((s) => { s.stats.readerWords += 1; });
      checkAchievements();
      vibrate(15);
    } else {
      streak = 0;
      vibrate([30, 60, 30]);
    }
    result.className = `rd-result ${correct ? 'good' : 'bad'}`;
    result.innerHTML = `<p class="fb-title">${icon(correct ? 'check' : 'x', 22)}${correct ? 'Correct!' : `It was <span class="gloss">${word}</span>`}</p>${spellStrip(word)}`;
    submit.textContent = 'Next word';
    submit.focus({ preventScroll: true });
    showScore();
  });
  stage.querySelector('[data-replay]').addEventListener('click', () => sp?.play(speedMs()));
  stage.querySelector('[data-skip]').addEventListener('click', () => { streak = 0; showScore(); nextWord(); });
  stage.querySelectorAll('[name="rd-speed"], [name="rd-len"]').forEach((r) => r.addEventListener('change', nextWord));
  showScore();
  nextWord();
  return close;
}

// ---- Lightning round ---------------------------------------------------------

const ROUND_MS = 60000;

function openLightning(refresh) {
  const s = store.state;
  const learned = new Set(learnedIds());
  const words = WORDS.filter((w) => learned.has(w.id) || s.settings.unlockAll).map((w) => w.id);
  const pool = [...LETTERS.map((x) => x.id), ...NUMBERS.map((x) => x.id), ...words];
  const poolSet = new Set(pool);
  let timer = null;
  let score = 0;
  let endsAt = 0;
  let last = null;
  let busy = false;
  const { stage, side, close } = overlay('Lightning round', () => {
    clearInterval(timer);
    document.removeEventListener('keydown', onKey);
    refresh();
  });

  function intro() {
    clearInterval(timer);
    side.innerHTML = '';
    stage.innerHTML = `<div class="lt-intro">
      <div class="lt-icon">${icon('timer', 44)}</div>
      <h2>Sixty seconds</h2>
      <p>Name as many signs as you can. Wrong answers do not cost points, only time.</p>
      <p class="muted">${words.length ? `Includes letters, numbers and ${words.length} word sign${words.length === 1 ? '' : 's'} you have learned.` : 'Includes letters and numbers. Word signs join once you learn them.'}</p>
      <p class="lt-best">Best score: <strong>${store.state.stats.lightningBest}</strong></p>
      <button type="button" class="btn" data-go>Start</button>
    </div>`;
    stage.querySelector('[data-go]').addEventListener('click', start);
    stage.querySelector('[data-go]').focus();
  }

  function start() {
    score = 0;
    endsAt = Date.now() + ROUND_MS;
    stage.innerHTML = `<div class="lt">
      <div class="lt-clock" role="timer" aria-label="Time left"><span></span></div>
      <div class="lt-q"></div>
    </div>`;
    const clock = stage.querySelector('.lt-clock span');
    timer = setInterval(() => {
      const left = endsAt - Date.now();
      clock.style.width = `${Math.max(0, (left / ROUND_MS) * 100)}%`;
      if (left <= 0) finish();
    }, 100);
    question();
  }

  function question() {
    busy = false;
    let id;
    do id = pool[Math.floor(Math.random() * pool.length)]; while (id === last && pool.length > 1);
    last = id;
    const sign = BY_ID[id];
    const options = shuffle([id, ...distractors(id, 3, Math.random, poolSet)]);
    side.innerHTML = `<span class="tool-score">${icon('bolt', 18)}${score}</span>`;
    const name = (x) => (x.type === 'word' ? glossOf(x) : x.label);
    stage.querySelector('.lt-q').innerHTML = `
      ${signPicture(sign, { size: sign.type === 'word' ? 'sm' : 'md', hideName: true })}
      ${sign.type === 'word' ? `<p class="cue-line">${esc(sign.cue)}</p>` : ''}
      <div class="opts opts-grid" role="group" aria-label="Answers">
        ${options.map((o, i) => `<button type="button" class="opt" data-id="${o}"><kbd>${i + 1}</kbd><span>${esc(name(BY_ID[o]))}</span></button>`).join('')}
      </div>`;
    const opts = [...stage.querySelectorAll('.lt-q .opt')];
    const answer = (btn) => {
      if (busy) return;
      busy = true;
      const right = btn.dataset.id === id;
      if (right) score++;
      btn.classList.add(right ? 'is-right' : 'is-wrong');
      if (!right) opts.find((o) => o.dataset.id === id)?.classList.add('is-right');
      vibrate(right ? 10 : [20, 40, 20]);
      setTimeout(() => { if (Date.now() < endsAt) question(); }, right ? 260 : 700);
    };
    opts.forEach((o) => o.addEventListener('click', () => answer(o)));
    keyHandler = (n) => opts[n - 1] && answer(opts[n - 1]);
  }

  let keyHandler = null;
  const onKey = (e) => { if (/^[1-4]$/.test(e.key) && keyHandler && Date.now() < endsAt) keyHandler(Number(e.key)); };
  document.addEventListener('keydown', onKey);

  function finish() {
    clearInterval(timer);
    keyHandler = null;
    const best = store.state.stats.lightningBest;
    const record = score > best;
    const xp = Math.min(score, 20);
    store.update((st) => { st.stats.lightningBest = Math.max(best, score); });
    if (xp) awardXp(xp);
    else checkAchievements();
    side.innerHTML = '';
    stage.innerHTML = `<div class="lt-intro">
      <div class="lt-icon">${icon(record ? 'trophy' : 'bolt', 44)}</div>
      <h2>${score} correct</h2>
      <p>${record ? 'A new best score!' : `Best score: ${Math.max(best, score)}`}</p>
      <p class="lt-best">+${xp} XP</p>
      <div class="row-center">
        <button type="button" class="btn" data-again>Play again</button>
        <button type="button" class="btn btn-quiet" data-done>Done</button>
      </div>
    </div>`;
    stage.querySelector('[data-again]').addEventListener('click', start);
    stage.querySelector('[data-done]').addEventListener('click', close);
    stage.querySelector('[data-again]').focus();
  }

  intro();
}
