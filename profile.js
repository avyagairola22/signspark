// Profile: stats, weekly chart, activity calendar, badges, settings, backup.

import { store, defaultState, parseState } from '../core/store.js';
import { today, streakNow, lessonsDone, accuracy, learnedIds, checkAchievements } from '../core/progress.js';
import { ACHIEVEMENTS, progressOf } from '../core/achievements.js';
import { addDays, fromKey, niceDate } from '../core/date.js';
import { SIGNS } from '../data/signs.js';
import { LESSONS } from '../data/curriculum.js';
import { handSVG } from '../render/hands.js';
import { SKINS } from '../ui/theme.js';
import { icon } from '../ui/icons.js';
import { esc, openSheet, toast, copyText, fmtNumber } from '../ui/dom.js';

const GOALS = [[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']];

function weekChart(state) {
  const day = today();
  const days = Array.from({ length: 7 }, (_, i) => addDays(day, i - 6));
  const values = days.map((d) => state.xpByDate[d] || 0);
  const goal = state.settings.goal;
  const max = Math.max(goal, ...values) * 1.18;
  const top = 18;
  const bottom = 118;
  const y = (v) => bottom - (v / max) * (bottom - top);
  const step = 284 / 7;
  const bars = days.map((d, i) => {
    const v = values[i];
    const x = 30 + i * step + step / 2;
    const h = Math.max(v ? 3 : 0, bottom - y(v));
    const met = v >= goal;
    const name = fromKey(d).toLocaleDateString(undefined, { weekday: 'short' });
    return `<g>
      <rect class="wk-bar ${met ? 'met' : ''} ${d === day ? 'today' : ''}" x="${(x - 13).toFixed(1)}" y="${(bottom - h).toFixed(1)}" width="26" height="${h.toFixed(1)}" rx="6"/>
      ${v ? `<text class="wk-val" x="${x.toFixed(1)}" y="${(bottom - h - 5).toFixed(1)}" text-anchor="middle">${v}</text>` : ''}
      <text class="wk-day ${d === day ? 'today' : ''}" x="${x.toFixed(1)}" y="138" text-anchor="middle">${esc(name)}</text>
    </g>`;
  }).join('');
  const gy = y(goal).toFixed(1);
  const total = values.reduce((a, b) => a + b, 0);
  return `<figure class="week">
    <svg viewBox="0 0 320 146" role="img" aria-label="XP earned each day this week, ${total} in total, daily goal ${goal}">
      <line class="wk-axis" x1="30" y1="${bottom}" x2="314" y2="${bottom}"/>
      <line class="wk-goal" x1="30" y1="${gy}" x2="314" y2="${gy}"/>
      <text class="wk-goal-l" x="2" y="${(Number(gy) + 4).toFixed(1)}">${goal}</text>
      ${bars}
    </svg>
    <figcaption><span class="key key-bar"></span>XP per day <span class="key key-goal"></span>Daily goal · <strong>${total} XP</strong> this week</figcaption>
  </figure>`;
}

function calendar(state) {
  const day = today();
  const start = addDays(day, -27);
  const goal = state.settings.goal;
  const cells = Array.from({ length: 28 }, (_, i) => {
    const d = addDays(start, i);
    const v = state.xpByDate[d] || 0;
    const lvl = !v ? 0 : v < goal / 2 ? 1 : v < goal ? 2 : 3;
    const label = `${niceDate(d, { weekday: 'short', month: 'short', day: 'numeric' })}: ${v} XP`;
    return `<span class="cal-cell lvl-${lvl}${d === day ? ' today' : ''}" title="${esc(label)}" role="img" aria-label="${esc(label)}"></span>`;
  }).join('');
  const heads = Array.from({ length: 7 }, (_, i) => `<span class="cal-head">${esc(fromKey(addDays(start, i)).toLocaleDateString(undefined, { weekday: 'narrow' }))}</span>`).join('');
  return `<div class="cal">${heads}${cells}</div>
    <p class="cal-key"><span>Less</span>${[0, 1, 2, 3].map((l) => `<span class="cal-cell lvl-${l}"></span>`).join('')}<span>Goal met</span></p>`;
}

function badge(a, state) {
  const [cur, goal] = progressOf(a, state);
  const earned = state.achievements[a.id];
  return `<div class="badge ${earned ? 'earned' : ''}">
    <span class="badge-icon">${icon(a.icon === 'abc' ? 'abc' : a.icon, 24)}</span>
    <div class="badge-copy">
      <strong>${esc(a.title)}</strong>
      <span>${esc(a.desc)}</span>
      ${earned
        ? `<span class="badge-date">${icon('check', 14)}Earned ${esc(niceDate(earned))}</span>`
        : `<span class="meter" role="progressbar" aria-label="${esc(a.title)} progress" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${cur}"><span style="width:${Math.round((cur / goal) * 100)}%"></span></span><span class="badge-num">${fmtNumber(cur)} / ${fmtNumber(goal)}</span>`}
    </div>
  </div>`;
}

function settingsForm(st) {
  const radio = (name, value, label, checked, extra = '') =>
    `<input type="radio" name="${name}" id="${name}-${value}" value="${value}" ${checked ? 'checked' : ''}><label for="${name}-${value}" ${extra}>${label}</label>`;
  const check = (id, on, title, text) =>
    `<div class="set-check"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><label for="${id}"><strong>${title}</strong><span>${text}</span></label></div>`;
  return `<form class="settings-form" novalidate>
    <div class="set-row"><label for="set-name">Your name</label><input id="set-name" type="text" maxlength="24" autocomplete="nickname" value="${esc(store.state.profile.name)}" placeholder="Optional"></div>
    <div class="set-row"><label for="set-goal">Daily goal</label><select id="set-goal">${GOALS.map(([g, n]) => `<option value="${g}" ${st.goal === g ? 'selected' : ''}>${n}: ${g} XP a day</option>`).join('')}</select></div>
    <fieldset class="set-row"><legend>I sign with my</legend><div class="seg seg-sm">${radio('set-hand', 'right', 'Right hand', st.hand === 'right')}${radio('set-hand', 'left', 'Left hand', st.hand === 'left')}</div></fieldset>
    ${check('set-mirror', st.mirror, 'Mirror the drawings', 'Show each hand as if it were your own, instead of a signer facing you.')}
    <fieldset class="set-row"><legend>Hand color</legend><div class="swatches">${Object.entries(SKINS).map(([id, s]) => radio('set-skin', id, `<span class="sr-only">${s.label}</span>`, st.skin === id, `class="swatch" style="--sw:${s.hand};--sw-line:${s.line}" title="${s.label}"`)).join('')}</div></fieldset>
    <fieldset class="set-row"><legend>Theme</legend><div class="seg seg-sm">${radio('set-theme', 'system', 'System', st.theme === 'system')}${radio('set-theme', 'light', 'Light', st.theme === 'light')}${radio('set-theme', 'dark', 'Dark', st.theme === 'dark')}</div></fieldset>
    ${check('set-motion', st.reduceMotion, 'Reduce motion', 'Turn off confetti and animations.')}
    ${check('set-haptics', st.haptics, 'Vibration', 'Buzz on right and wrong answers, on phones that support it.')}
    ${check('set-unlock', st.unlockAll, 'Open every lesson', 'Skip ahead on the path without finishing earlier lessons.')}
  </form>`;
}

export function renderProfile(page, ctx) {
  const s = store.state;
  const st = s.settings;
  const name = s.profile.name.trim();
  const first = name.toUpperCase().match(/[A-Z]/)?.[0];
  const streak = streakNow();
  page.innerHTML = `
    <header class="profile-head">
      <div class="avatar" aria-hidden="true">${handSVG(first || 'ILY')}</div>
      <div>
        <h1>${esc(name || 'Your profile')}</h1>
        <p class="muted">${s.profile.since ? `Learning ASL since ${esc(niceDate(s.profile.since, { month: 'long', day: 'numeric', year: 'numeric' }))}` : 'Your stats start with your first lesson.'}</p>
        ${first ? `<p class="fine">Your avatar is the letter ${first} in fingerspelling.</p>` : ''}
      </div>
    </header>

    <section class="stats" aria-label="Your stats">
      <div class="stat stat-flame">${icon('flame', 22)}<strong>${streak}</strong><span>Day streak</span><small>Best ${s.streak.best}</small></div>
      <div class="stat stat-xp">${icon('bolt', 22)}<strong>${fmtNumber(s.xp)}</strong><span>Total XP</span><small>${fmtNumber(s.xpByDate[today()] || 0)} today</small></div>
      <div class="stat stat-signs">${icon('book', 22)}<strong>${learnedIds().length}</strong><span>Signs learned</span><small>of ${SIGNS.length}</small></div>
      <div class="stat stat-lessons">${icon('star', 22)}<strong>${lessonsDone()}</strong><span>Lessons done</span><small>of ${LESSONS.length}</small></div>
      <div class="stat stat-acc">${icon('target', 22)}<strong>${accuracy()}%</strong><span>Accuracy</span><small>${fmtNumber(s.stats.answered)} answers</small></div>
    </section>

    <div class="profile-grid">
      <section class="card"><h2>This week</h2>${weekChart(s)}</section>
      <section class="card"><h2>Last four weeks</h2>${calendar(s)}</section>
    </div>

    <section class="badges-wrap" aria-labelledby="badges-h">
      <h2 id="badges-h">Badges <span class="muted">${Object.keys(s.achievements).length} of ${ACHIEVEMENTS.length}</span></h2>
      <div class="badges">${ACHIEVEMENTS.map((a) => badge(a, s)).join('')}</div>
    </section>

    <section class="card" aria-labelledby="settings-h">
      <h2 id="settings-h">${icon('sliders', 20)} Settings</h2>
      ${settingsForm(st)}
    </section>

    <section class="card" aria-labelledby="backup-h">
      <h2 id="backup-h">Backup and reset</h2>
      <p class="muted">Your progress is saved in this browser only. Copy a backup code to move it to another device.</p>
      ${store.canSave ? '' : '<p class="warn">This browser is blocking saved data, so progress resets when you close the page. Copy a backup code to keep it.</p>'}
      <div class="row">
        <button type="button" class="btn btn-quiet btn-sm" data-backup>${icon('copy', 18)}Show backup code</button>
        <button type="button" class="btn btn-quiet btn-sm" data-restore>${icon('replay', 18)}Restore from a code</button>
        <button type="button" class="btn btn-bad btn-sm" data-reset>Reset progress</button>
      </div>
      <div class="backup-box" hidden>
        <label for="backup-text">Backup code</label>
        <textarea id="backup-text" rows="4" readonly></textarea>
        <button type="button" class="btn btn-sm" data-copy>${icon('copy', 18)}Copy code</button>
      </div>
      <div class="restore-box" hidden>
        <label for="restore-text">Paste a backup code</label>
        <textarea id="restore-text" rows="4" spellcheck="false"></textarea>
        <button type="button" class="btn btn-sm" data-restore-go>Restore progress</button>
        <p class="restore-msg" aria-live="polite"></p>
      </div>
    </section>

    <section class="card about" aria-labelledby="about-h">
      <h2 id="about-h">About SignSpark</h2>
      <p>SignSpark teaches beginner American Sign Language: the alphabet, numbers 0 to 10, and ${SIGNS.length - 37} everyday signs, with lessons on word order and Deaf culture. Every hand drawing is generated by code from a small recipe, so the app has no image files.</p>
      <p>Signs vary by region and community, and nothing replaces learning from Deaf signers. Support Deaf-led organizations like the <a href="https://www.nad.org/" target="_blank" rel="noopener noreferrer">National Association of the Deaf</a>.</p>
    </section>`;

  // ---- settings ----
  const form = page.querySelector('.settings-form');
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', (e) => {
    const t = e.target;
    store.update((state) => {
      const set = state.settings;
      if (t.id === 'set-name') state.profile.name = t.value.trim().slice(0, 24);
      if (t.id === 'set-goal') set.goal = Number(t.value);
      if (t.name === 'set-hand') set.hand = t.value;
      if (t.id === 'set-mirror') set.mirror = t.checked;
      if (t.name === 'set-skin') set.skin = t.value;
      if (t.name === 'set-theme') set.theme = t.value;
      if (t.id === 'set-motion') set.reduceMotion = t.checked;
      if (t.id === 'set-haptics') set.haptics = t.checked;
      if (t.id === 'set-unlock') set.unlockAll = t.checked;
    });
    if (t.id === 'set-name') {
      ctx.refresh();
      toast('Name saved');
    }
  });

  // ---- backup, restore, reset ----
  const backupBox = page.querySelector('.backup-box');
  const restoreBox = page.querySelector('.restore-box');
  page.addEventListener('click', async (e) => {
    if (e.target.closest('[data-backup]')) {
      backupBox.hidden = false;
      restoreBox.hidden = true;
      const ta = page.querySelector('#backup-text');
      ta.value = JSON.stringify(store.state);
      ta.focus();
      ta.select();
    }
    if (e.target.closest('[data-copy]')) {
      const ok = await copyText(page.querySelector('#backup-text').value, page.querySelector('#backup-text'));
      toast(ok ? 'Backup code copied' : 'Code selected. Copy it with Ctrl+C or Cmd+C.');
    }
    if (e.target.closest('[data-restore]')) {
      restoreBox.hidden = false;
      backupBox.hidden = true;
      page.querySelector('#restore-text').focus();
    }
    if (e.target.closest('[data-restore-go]')) {
      const msg = page.querySelector('.restore-msg');
      try {
        const next = parseState(page.querySelector('#restore-text').value.trim());
        store.replace(next);
        checkAchievements();
        toast('Progress restored', { icon: 'check' });
        ctx.refresh();
      } catch (err) {
        msg.textContent = `That code did not work. ${err.message.includes('SignSpark') ? err.message : 'Paste the whole backup code and try again.'}`;
      }
    }
    if (e.target.closest('[data-reset]')) {
      openSheet({
        title: 'Reset all progress?',
        body: '<p>This erases your XP, streak, lessons, flashcards and badges on this device. Your settings stay. This cannot be undone unless you have a backup code.</p>',
        actions: [
          { label: 'Cancel', kind: 'btn-quiet' },
          {
            label: 'Reset progress',
            kind: 'btn-bad',
            onClick: () => {
              const fresh = defaultState();
              fresh.settings = { ...store.state.settings };
              fresh.profile = { ...fresh.profile, name: store.state.profile.name, welcomed: true };
              store.replace(fresh);
              toast('Progress reset');
              ctx.refresh();
            },
          },
        ],
      });
    }
  });
}
