// SignSpark: app shell, navigation and start-up.

import { store } from './core/store.js';
import { onProgress, streakNow, xpToday } from './core/progress.js';
import { renderLearn } from './views/learn.js';
import { renderPractice, stopPractice } from './views/practice.js';
import { renderCards, cardsKey } from './views/cards.js';
import { renderDictionary } from './views/dictionary.js';
import { renderProfile } from './views/profile.js';
import { todayPanel, bindToday, goalRing } from './views/today.js';
import { applySettings } from './ui/theme.js';
import { handSVG } from './render/hands.js';
import { icon } from './ui/icons.js';
import { toast, syncLayers } from './ui/dom.js';

const ROUTES = {
  learn: { label: 'Learn', icon: 'learn', render: renderLearn },
  practice: { label: 'Practice', icon: 'practice', render: renderPractice },
  cards: { label: 'Flashcards', icon: 'cards', render: renderCards },
  dictionary: { label: 'Dictionary', icon: 'book', render: renderDictionary },
  profile: { label: 'Profile', icon: 'user', render: renderProfile },
};

let current = null;
let visits = 0;

const routeFromHash = () => {
  const h = (location.hash || '').replace(/^#/, '');
  return ROUTES[h] ? h : null;
};

function navLinks(kind) {
  return Object.entries(ROUTES)
    .map(([id, r]) => `<a class="${kind}-link" href="#${id}" data-route="${id}">${icon(r.icon, kind === 'tab' ? 24 : 26)}<span>${r.label}</span></a>`)
    .join('');
}

function shell(app) {
  app.innerHTML = `
    <button type="button" class="skip" data-skip>Skip to content</button>
    <div class="app">
      <aside class="sidebar">
        <a class="brand" href="#learn" data-route="learn" aria-label="SignSpark home"><span class="brand-mark">${handSVG('ILY')}</span><span class="brand-name">SignSpark</span></a>
        <nav class="side-nav" aria-label="Main">${navLinks('side')}</nav>
      </aside>
      <header class="topbar">
        <a class="brand" href="#learn" data-route="learn" aria-label="SignSpark home"><span class="brand-mark">${handSVG('ILY')}</span><span class="brand-name">SignSpark</span></a>
        <div class="top-stats"></div>
      </header>
      <main id="view" class="view" tabindex="-1"></main>
      <aside class="rail" aria-label="Today"></aside>
    </div>
    <nav class="tabbar" aria-label="Main">${navLinks('tab')}</nav>`;

  app.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      go(link.dataset.route);
    }
    if (e.target.closest('[data-skip]')) document.getElementById('view').focus();
  });
  bindToday(app.querySelector('.rail'), () => refresh());
}

function topStats() {
  const streak = streakNow();
  const xp = xpToday();
  const goal = store.state.settings.goal;
  return `
    <span class="pill pill-flame ${streak ? 'lit' : ''}" title="Day streak">${icon('flame', 20)}<strong>${streak}</strong><span class="sr-only">day streak</span></span>
    <span class="pill pill-xp" title="Total XP">${icon('bolt', 20)}<strong>${store.state.xp}</strong><span class="sr-only">total XP</span></span>
    <span class="pill pill-goal" title="Daily goal: ${xp} of ${goal} XP">${goalRing(xp, goal, 30)}<span class="sr-only">Daily goal ${xp} of ${goal} XP</span></span>`;
}

function paintChrome() {
  document.querySelector('.top-stats').innerHTML = topStats();
  document.querySelector('.rail').innerHTML = todayPanel();
  document.querySelectorAll('[data-route]').forEach((a) => {
    if (a.classList.contains('brand')) return;
    if (a.dataset.route === current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function render(name, { keepScroll = false } = {}) {
  stopPractice();
  const y = window.scrollY;
  current = name;
  visits++;
  const view = document.getElementById('view');
  const page = document.createElement('div');
  page.className = `page page-${name}`;
  view.replaceChildren(page);
  ROUTES[name].render(page, { refresh, go, firstVisit: visits === 1 });
  paintChrome();
  syncLayers(); // safety net: the page is only locked while a lesson or dialog is open
  document.title = name === 'learn' ? 'SignSpark' : `${ROUTES[name].label} · SignSpark`;
  if (keepScroll) window.scrollTo(0, y);
  else if (visits > 1) window.scrollTo(0, 0);
}

function go(name) {
  if (!ROUTES[name]) name = 'learn';
  try {
    if (location.hash !== `#${name}`) history.pushState(null, '', `#${name}`);
  } catch {
    /* some embedded frames do not allow history changes */
  }
  render(name);
  document.getElementById('view').focus({ preventScroll: true });
}

function refresh() {
  render(current, { keepScroll: true });
}

function start() {
  const app = document.getElementById('app');
  shell(app);
  applySettings(store.state.settings);

  store.subscribe((state) => {
    applySettings(state.settings);
    if (current) paintChrome();
  });

  onProgress((type, data) => {
    if (type === 'achievement') toast(`Badge earned: ${data.title}`, { icon: 'trophy', tone: 'win', ms: 4200 });
    if (type === 'goal') toast(`Daily goal reached: ${data.goal} XP!`, { icon: 'target', tone: 'win', ms: 4200 });
  });

  window.addEventListener('popstate', () => {
    const r = routeFromHash() || 'learn';
    if (r !== current) render(r);
  });
  document.addEventListener('keydown', (e) => {
    if (current === 'cards' && !document.querySelector('.player, .sheet-wrap')) cardsKey(e);
  });

  render(routeFromHash() || 'learn');
}

start();
