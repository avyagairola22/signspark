// "Today" panel: daily goal, streak, word of the day and a culture fact.
// Shown in the right-hand column on wide screens and at the top of Learn on phones.

import { store } from '../core/store.js';
import { today, streakNow, xpToday, awardXp, markLearned } from '../core/progress.js';
import { niceDate } from '../core/date.js';
import { wordOfDay, factOfDay, buildSignPractice } from '../engine/lesson.js';
import { XP } from '../data/curriculum.js';
import { glossOf } from '../data/signs.js';
import { signPicture, exampleBlock } from '../ui/visuals.js';
import { icon } from '../ui/icons.js';
import { esc, toast } from '../ui/dom.js';
import { playSession } from './player.js';

/** A progress ring for the daily XP goal. */
export function goalRing(value, goal, size = 56) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / goal));
  const mid = size / 2;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle class="ring-bg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="7" fill="none"/>
    <circle class="ring-fg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="7" fill="none" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(1)}" transform="rotate(-90 ${mid} ${mid})"/>
  </svg>`;
}

export function todayPanel() {
  const s = store.state;
  const day = today();
  const word = wordOfDay(day);
  const fact = factOfDay(day);
  const streak = streakNow();
  const xp = xpToday();
  const goal = s.settings.goal;
  const claimed = s.stats.wotdLast === day;
  return `
  <section class="card goal-card" aria-label="Today's progress">
    <div class="goal-ring">${goalRing(xp, goal)}<span>${Math.min(100, Math.round((xp / goal) * 100))}%</span></div>
    <div class="goal-text">
      <p class="goal-big">${xp} <span>/ ${goal} XP</span></p>
      <p class="muted">${xp >= goal ? 'Daily goal reached' : 'Daily goal'}</p>
    </div>
    <div class="goal-streak ${streak ? 'lit' : ''}" title="Day streak">${icon('flame', 26)}<strong>${streak}</strong><span>day${streak === 1 ? '' : 's'}</span></div>
  </section>
  <section class="card wotd" aria-label="Word of the day">
    <p class="eyebrow">${icon('sun', 16)} Word of the day · ${esc(niceDate(day))}</p>
    <div class="wotd-title"><h2>${esc(word.label)}</h2><span class="gloss">${esc(glossOf(word))}</span></div>
    ${signPicture(word, { size: 'sm' })}
    <p class="how">${esc(word.how)}</p>
    ${exampleBlock(word.example)}
    <div class="wotd-actions">
      <button type="button" class="btn btn-quiet btn-sm" data-wotd-practice="${word.id}">${icon('practice', 18)}Practice</button>
      <button type="button" class="btn btn-sm" data-wotd-claim="${word.id}" ${claimed ? 'disabled' : ''}>${claimed ? `${icon('check', 18)}Learned today` : `I learned it · +${XP.wotd} XP`}</button>
    </div>
  </section>
  <section class="card fact-card" aria-label="Did you know?">
    <p class="eyebrow">${icon('info', 16)} ${fact.answer ? 'Did you know?' : 'Myth or fact?'}</p>
    <p class="fact-q">${fact.answer ? '' : '<strong>Myth:</strong> '}${esc(fact.text)}</p>
    <p class="muted">${fact.answer ? '' : '<strong>Fact:</strong> '}${esc(fact.why)}</p>
  </section>`;
}

/** Wire up the word-of-the-day buttons inside `container`. */
export function bindToday(container, refresh) {
  container.addEventListener('click', (e) => {
    const practice = e.target.closest('[data-wotd-practice]');
    if (practice) {
      const id = practice.dataset.wotdPractice;
      playSession({
        title: 'Word of the day',
        exercises: buildSignPractice(id),
        doneTitle: 'Practice complete!',
        onComplete: ({ perfect }) => {
          markLearned([id]);
          const xp = XP.practice + (perfect ? XP.perfect : 0);
          awardXp(xp);
          return { xp };
        },
        onExit: refresh,
      });
      return;
    }
    const claim = e.target.closest('[data-wotd-claim]');
    if (claim && !claim.disabled) {
      const id = claim.dataset.wotdClaim;
      store.update((s) => {
        s.stats.wotd += 1;
        s.stats.wotdLast = today();
      });
      markLearned([id]);
      awardXp(XP.wotd);
      toast(`Added to your flashcards. +${XP.wotd} XP`, { icon: 'sun' });
      refresh();
    }
  });
}
