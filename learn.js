// Learn: the lesson path, unit by unit.

import { UNITS, LESSON_BY_ID, UNIT_BY_ID, XP } from '../data/curriculum.js';
import { BY_ID } from '../data/signs.js';
import { store } from '../core/store.js';
import { lessonStatus, nextLesson, completeLesson } from '../core/progress.js';
import { buildLesson } from '../engine/lesson.js';
import { handSVG } from '../render/hands.js';
import { playSession } from './player.js';
import { todayPanel, bindToday } from './today.js';
import { icon } from '../ui/icons.js';
import { esc, openSheet } from '../ui/dom.js';

const OFFSETS = [0, 44, 66, 44, 0, -44, -66, -44]; // the path zig-zags
const KIND_ICON = { learn: 'star', review: 'trophy', sentences: 'chat', culture: 'heart' };
const KIND_LABEL = { learn: 'Lesson', review: 'Review', sentences: 'Sentences', culture: 'Culture quiz' };
const KIND_BLURB = {
  review: 'A mix of everything in this unit, plus fingerspelled words.',
  sentences: 'Put signs in ASL word order and practice the facial grammar.',
  culture: 'True or false: Deaf history, language and etiquette.',
};

export function startLesson(lessonId, refresh) {
  const lesson = LESSON_BY_ID[lessonId];
  store.update((s) => { s.profile.welcomed = true; });
  playSession({
    title: lesson.title,
    exercises: buildLesson(lessonId),
    onComplete: ({ accuracy, perfect }) => ({ xp: completeLesson(lessonId, { accuracy, perfect }) }),
    onExit: refresh,
  });
}

function welcome(s) {
  const goals = [[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']];
  return `<section class="welcome card" aria-labelledby="welcome-h">
    <div class="welcome-art" aria-hidden="true">${handSVG('ILY')}</div>
    <div class="welcome-copy">
      <h1 id="welcome-h">Learn American Sign Language, a few signs a day</h1>
      <p>Short lessons, flashcards that remember what you forget, and a new sign every day. Made for hearing learners starting from zero.</p>
      <div class="welcome-setup">
        <fieldset class="seg">
          <legend>I sign with my</legend>
          ${['right', 'left'].map((h) => `<input type="radio" name="wel-hand" id="wel-hand-${h}" value="${h}" ${s.settings.hand === h ? 'checked' : ''}><label for="wel-hand-${h}">${h === 'right' ? 'Right hand' : 'Left hand'}</label>`).join('')}
        </fieldset>
        <fieldset class="seg">
          <legend>Daily goal</legend>
          ${goals.map(([g, name]) => `<input type="radio" name="wel-goal" id="wel-goal-${g}" value="${g}" ${s.settings.goal === g ? 'checked' : ''}><label for="wel-goal-${g}">${name}<small>${g} XP</small></label>`).join('')}
        </fieldset>
      </div>
      <p class="welcome-note">${icon('heart', 16)} ASL is the language of the Deaf community. Use SignSpark as a starting point, and learn from Deaf signers whenever you can.</p>
      <div class="welcome-actions">
        <button type="button" class="btn" data-start="u1-1">Start lesson 1</button>
        <button type="button" class="btn btn-quiet" data-dismiss-welcome>Look around first</button>
      </div>
    </div>
  </section>`;
}

function nodeItem(lesson, i, next) {
  const status = lessonStatus(lesson.id);
  const isNext = next?.id === lesson.id;
  const kind = lesson.kind || 'learn';
  const stateText = status === 'done' ? 'completed' : status === 'open' ? 'ready to start' : 'locked';
  return `<li class="node-row" style="--off:${OFFSETS[i % OFFSETS.length]}px">
    ${isNext ? '<span class="node-start" aria-hidden="true">Start</span>' : ''}
    <button type="button" class="node is-${status}${isNext ? ' is-next' : ''}" data-lesson="${lesson.id}" aria-expanded="false"
      aria-label="${esc(`${KIND_LABEL[kind]}: ${lesson.title}, ${stateText}`)}">
      ${icon(status === 'locked' ? 'lock' : KIND_ICON[kind], 30)}
      ${status === 'done' ? `<span class="node-check">${icon('check', 14)}</span>` : ''}
    </button>
  </li>`;
}

function unitBlock(unit, index, next) {
  const done = unit.lessons.filter((l) => store.state.lessons[l.id]?.done).length;
  return `<section class="unit" style="--u:${unit.color}" aria-labelledby="unit-${unit.id}">
    <header class="unit-head">
      <div class="unit-copy">
        <p class="unit-kicker">Unit ${index + 1} · ${done} of ${unit.lessons.length} done</p>
        <h2 id="unit-${unit.id}">${esc(unit.title)}</h2>
        <p>${esc(unit.blurb)}</p>
      </div>
      <button type="button" class="unit-guide" data-guide="${unit.id}">${icon('book', 20)}<span>Guide</span></button>
    </header>
    <ol class="nodes">${unit.lessons.map((l, i) => nodeItem(l, i, next)).join('')}</ol>
  </section>`;
}

function lessonCard(lesson) {
  const status = lessonStatus(lesson.id);
  const kind = lesson.kind || 'learn';
  const preview = lesson.signs
    ? `<div class="pop-signs">${lesson.signs.map((id) => `<span class="chip chip-static">${esc(BY_ID[id].label)}</span>`).join('')}</div>`
    : `<p class="muted">${KIND_BLURB[kind]}</p>`;
  const action = status === 'locked'
    ? `<p class="pop-lock">${icon('lock', 16)} Finish the lesson before this one to unlock it.</p>`
    : `<button type="button" class="btn btn-block" data-start="${lesson.id}">${status === 'done' ? `Practice again · +${XP.replay} XP` : `Start · +${XP.lesson} XP`}</button>`;
  return `<p class="pop-kicker">${KIND_LABEL[kind]}${status === 'done' ? ` · best ${store.state.lessons[lesson.id].best}%` : ''}</p><h3>${esc(lesson.title)}</h3>${preview}${action}`;
}

function closePops(root) {
  root.querySelectorAll('.node-pop').forEach((p) => {
    p.parentElement.classList.remove('open');
    p.remove();
  });
  root.querySelectorAll('.node[aria-expanded="true"]').forEach((n) => n.setAttribute('aria-expanded', 'false'));
}

export function renderLearn(page, ctx) {
  const s = store.state;
  const next = nextLesson(s);
  page.innerHTML = `
    ${s.profile.welcomed ? '' : welcome(s)}
    <div class="today-inline">${todayPanel()}</div>
    <div class="path">
      ${UNITS.map((u, i) => unitBlock(u, i, next)).join('')}
      <p class="path-end">${icon('trophy', 22)}<span>You reached the end of the path. New units will keep coming.</span></p>
    </div>`;

  bindToday(page, ctx.refresh);

  page.addEventListener('click', (e) => {
    const start = e.target.closest('[data-start]');
    if (start) return startLesson(start.dataset.start, ctx.refresh);

    const node = e.target.closest('.node');
    if (node) {
      const open = node.getAttribute('aria-expanded') === 'true';
      closePops(page);
      if (open) return;
      const pop = document.createElement('div');
      pop.className = 'node-pop';
      pop.setAttribute('role', 'group');
      pop.setAttribute('aria-label', LESSON_BY_ID[node.dataset.lesson].title);
      pop.innerHTML = lessonCard(LESSON_BY_ID[node.dataset.lesson]);
      node.parentElement.appendChild(pop);
      node.parentElement.classList.add('open'); // lift this row above the rows below it
      node.setAttribute('aria-expanded', 'true');
      (pop.querySelector('[data-start]') || node).focus({ preventScroll: true });
      pop.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }

    const guide = e.target.closest('[data-guide]');
    if (guide) {
      const unit = UNIT_BY_ID[guide.dataset.guide];
      openSheet({
        title: `${unit.title}: guide`,
        body: `<ul class="guide-list">${unit.guide.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>`,
      });
      return;
    }

    if (e.target.closest('[data-dismiss-welcome]')) {
      store.update((st) => { st.profile.welcomed = true; });
      ctx.refresh();
      return;
    }

    if (!e.target.closest('.node-pop')) closePops(page);
  });

  page.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && page.querySelector('.node-pop')) {
      const node = page.querySelector('.node[aria-expanded="true"]');
      closePops(page);
      node?.focus();
    }
  });

  page.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'wel-hand') store.update((st) => { st.settings.hand = t.value; });
    if (t.name === 'wel-goal') store.update((st) => { st.settings.goal = Number(t.value); });
  });

  // Bring the next lesson into view when returning to the path.
  if (ctx.firstVisit && next && s.profile.welcomed) {
    requestAnimationFrame(() => page.querySelector('.node.is-next')?.scrollIntoView({ block: 'center' }));
  }
}
