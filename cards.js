// Flashcards with spaced repetition (see src/core/srs.js).

import { store } from '../core/store.js';
import { schedule, isDue, previewIntervals, formatInterval } from '../core/srs.js';
import { today, awardXp, learnedIds, markLearned } from '../core/progress.js';
import { niceDate } from '../core/date.js';
import { BY_ID, LETTERS, NUMBERS, WORDS, glossOf } from '../data/signs.js';
import { XP } from '../data/curriculum.js';
import { shuffle } from '../engine/lesson.js';
import { handSVG } from '../render/hands.js';
import { signPicture, paramList } from '../ui/visuals.js';
import { icon } from '../ui/icons.js';
import { esc, reducedMotion } from '../ui/dom.js';

const NEW_PER_ROUND = 10;
const DECKS = [
  { id: 'mine', label: 'My signs', ids: () => learnedIds().filter((id) => BY_ID[id]) },
  { id: 'letters', label: 'Alphabet', ids: () => LETTERS.map((s) => s.id) },
  { id: 'numbers', label: 'Numbers', ids: () => NUMBERS.map((s) => s.id) },
  { id: 'words', label: 'Word signs', ids: () => WORDS.map((s) => s.id) },
];
const GRADE_LABELS = { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' };

// The current study round survives switching tabs.
let round = null;

function deck() {
  return DECKS.find((d) => d.id === round.deck);
}

function counts(ids) {
  const s = store.state;
  const day = today();
  const due = ids.filter((id) => s.srs[id] && isDue(s.srs[id], day)).length;
  const fresh = ids.filter((id) => !s.srs[id]).length;
  return { due, fresh, total: ids.length };
}

function buildQueue() {
  const s = store.state;
  const ids = deck().ids();
  const day = today();
  const due = shuffle(ids.filter((id) => s.srs[id] && isDue(s.srs[id], day)));
  const fresh = ids.filter((id) => !s.srs[id]).slice(0, NEW_PER_ROUND);
  round.queue = [...due, ...fresh];
  round.flipped = false;
}

function face(sign, side) {
  const showSign = (round.dir === 'sign') === (side === 'front');
  if (showSign) {
    return `<div class="fc-face">
      ${signPicture(sign, { size: 'md', hideName: side === 'front' })}
      ${side === 'front'
        ? (sign.type === 'word' ? `<p class="cue-line">${esc(sign.moveText)}</p>` : '')
        : `<p class="how">${esc(sign.how)}</p>${paramList(sign)}`}
    </div>`;
  }
  return `<div class="fc-face fc-word">
    <span class="fc-type">${sign.type === 'word' ? 'Sign' : sign.type === 'letter' ? 'Letter' : 'Number'}</span>
    <p class="fc-label">${esc(sign.label)}</p>
    ${sign.type === 'word' ? `<p class="gloss">${esc(glossOf(sign))}</p>` : ''}
    ${side === 'front' ? `<p class="muted">${sign.type === 'word' ? 'How do you sign it?' : 'What does the handshape look like?'}</p>` : ''}
  </div>`;
}

function cardArea() {
  const ids = deck().ids();
  if (!ids.length) {
    return `<div class="fc-empty card">
      <div class="done-hand">${handSVG('B')}</div>
      <h2>Your deck is empty</h2>
      <p>Signs join "My signs" after you finish a lesson or learn a word of the day. You can study the alphabet now.</p>
      <button type="button" class="btn" data-deck="letters">Study the alphabet</button>
    </div>`;
  }
  if (!round.queue.length) {
    const s = store.state;
    const next = ids.map((id) => s.srs[id]?.due).filter((d) => d && d > today()).sort()[0];
    const { fresh } = counts(ids);
    return `<div class="fc-empty card">
      <div class="done-hand">${handSVG('OPEN5')}</div>
      <h2>All caught up!</h2>
      <p>${round.reviewed ? `You reviewed ${round.reviewed} card${round.reviewed === 1 ? '' : 's'} and earned ${round.reviewed * XP.card} XP.` : 'Nothing is due in this deck right now.'}
      ${next ? ` Your next review is ${esc(niceDate(next, { weekday: 'long', month: 'short', day: 'numeric' }))}.` : ''}</p>
      ${fresh ? `<button type="button" class="btn" data-more>Study ${Math.min(fresh, NEW_PER_ROUND)} new cards</button>` : ''}
    </div>`;
  }
  const sign = BY_ID[round.queue[0]];
  const iv = previewIntervals(store.state.srs[sign.id], today());
  return `<div class="fc ${round.flipped ? 'is-flipped' : ''}">
      <div class="fc-card" role="button" tabindex="0" aria-label="${round.flipped ? 'Answer side' : 'Flip the card'}">${face(sign, round.flipped ? 'back' : 'front')}</div>
    </div>
    <p class="fc-hint">${round.flipped ? 'How well did you know it?' : 'Think of the answer, then flip the card.'}</p>
    <div class="fc-grades">
      ${round.flipped
        ? Object.entries(GRADE_LABELS).map(([g, label], i) => `<button type="button" class="grade grade-${g}" data-grade="${g}"><strong>${label}</strong><span>${formatInterval(iv[g])}</span><kbd>${i + 1}</kbd></button>`).join('')
        : '<button type="button" class="btn btn-wide" data-flip>Show answer</button>'}
    </div>
    <p class="fc-left">${round.queue.length} card${round.queue.length === 1 ? '' : 's'} left in this round</p>`;
}

export function renderCards(page, ctx) {
  if (!round) round = { deck: learnedIds().length >= 4 ? 'mine' : 'letters', dir: 'sign', queue: null, flipped: false, reviewed: 0 };
  if (!round.queue) buildQueue();

  const paint = () => {
    const c = counts(deck().ids());
    page.querySelector('.fc-counts').innerHTML = `<span><strong>${c.due}</strong> due</span><span><strong>${c.fresh}</strong> new</span><span><strong>${c.total}</strong> in deck</span>`;
    page.querySelector('.fc-area').innerHTML = cardArea();
  };

  page.innerHTML = `
    <header class="page-head">
      <h1>Flashcards</h1>
      <p>Spaced repetition brings each sign back right before you would forget it.</p>
    </header>
    <div class="fc-controls">
      <div class="chips" role="group" aria-label="Deck">
        ${DECKS.map((d) => `<button type="button" class="chip ${round.deck === d.id ? 'on' : ''}" aria-pressed="${round.deck === d.id}" data-deck="${d.id}">${d.label}<span class="chip-n">${d.ids().length}</span></button>`).join('')}
      </div>
      <fieldset class="seg seg-sm">
        <legend class="sr-only">Card direction</legend>
        <input type="radio" name="fc-dir" id="fc-dir-sign" value="sign" ${round.dir === 'sign' ? 'checked' : ''}><label for="fc-dir-sign">Sign to English</label>
        <input type="radio" name="fc-dir" id="fc-dir-word" value="word" ${round.dir === 'word' ? 'checked' : ''}><label for="fc-dir-word">English to sign</label>
      </fieldset>
    </div>
    <p class="fc-counts"></p>
    <div class="fc-area" aria-live="polite"></div>`;
  paint();

  const flip = () => {
    if (round.flipped || !round.queue.length) return;
    const card = page.querySelector('.fc');
    const done = () => {
      round.flipped = true;
      paint();
      page.querySelector('.grade-good')?.focus({ preventScroll: true });
    };
    if (reducedMotion() || !card) return done();
    card.classList.add('turning');
    setTimeout(done, 160);
  };

  const grade = (g) => {
    if (!round.flipped || !round.queue.length) return;
    const id = round.queue.shift();
    store.update((s) => {
      s.srs[id] = schedule(s.srs[id], g, today());
      s.stats.cards += 1;
    });
    if (g === 'again') round.queue.splice(Math.min(3, round.queue.length), 0, id);
    else markLearned([id]);
    round.reviewed++;
    round.flipped = false;
    awardXp(XP.card);
    paint();
    page.querySelector('.fc-card')?.focus({ preventScroll: true });
  };

  page.addEventListener('click', (e) => {
    const d = e.target.closest('[data-deck]');
    if (d) {
      round = { ...round, deck: d.dataset.deck, reviewed: 0 };
      buildQueue();
      return ctx.refresh();
    }
    if (e.target.closest('[data-more]')) {
      round.reviewed = 0;
      buildQueue();
      return paint();
    }
    if (e.target.closest('[data-flip]') || e.target.closest('.fc-card')) return flip();
    const g = e.target.closest('[data-grade]');
    if (g) grade(g.dataset.grade);
  });

  page.addEventListener('change', (e) => {
    if (e.target.name === 'fc-dir') {
      round.dir = e.target.value;
      round.flipped = false;
      paint();
    }
  });

  page.addEventListener('keydown', (e) => {
    if (e.target.matches('input')) return;
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('.fc-card')) {
      e.preventDefault();
      flip();
    } else if (/^[1-4]$/.test(e.key) && round.flipped) {
      grade(Object.keys(GRADE_LABELS)[Number(e.key) - 1]);
    }
  });
}

/** Keyboard shortcut from anywhere on the page: Space flips. */
export function cardsKey(e) {
  if (e.key === ' ' && round && !round.flipped && document.querySelector('.fc-card') && !e.target.matches('input, textarea, button, [role="button"]')) {
    e.preventDefault();
    document.querySelector('.fc-card').click();
  }
}
