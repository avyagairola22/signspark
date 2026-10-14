// Dictionary: browse and search every sign.

import { SIGNS, CATEGORIES, BY_ID, glossOf, videoUrl } from '../data/signs.js';
import { store } from '../core/store.js';
import { markLearned } from '../core/progress.js';
import { handStage, signPicture, paramList, exampleBlock } from '../ui/visuals.js';
import { icon } from '../ui/icons.js';
import { esc, openSheet, toast } from '../ui/dom.js';

const filter = { q: '', cat: 'all' };
const catOf = (s) => (s.type === 'letter' ? 'letters' : s.type === 'number' ? 'numbers' : s.cat);

function matches(s) {
  if (filter.cat !== 'all' && catOf(s) !== filter.cat) return false;
  const q = filter.q.trim().toLowerCase();
  if (!q) return true;
  if (s.type !== 'word') return s.label.toLowerCase() === q || `${s.type} ${s.label}`.toLowerCase().includes(q);
  return [s.label, s.cue, s.how].some((t) => t.toLowerCase().includes(q));
}

function detail(s) {
  const learned = Boolean(store.state.learned[s.id]);
  return `<div class="detail">
    ${s.type === 'word' ? `<p class="gloss gloss-sub">${esc(glossOf(s))}</p>` : ''}
    ${signPicture(s, { size: 'lg' })}
    <p class="how">${esc(s.how)}</p>
    ${paramList(s)}
    ${s.tip ? `<p class="tip">${icon('info', 18)}<span>${esc(s.tip)}</span></p>` : ''}
    ${exampleBlock(s.example)}
    <div class="detail-actions">
      <button type="button" class="btn btn-sm" data-add="${s.id}" ${learned ? 'disabled' : ''}>${learned ? `${icon('check', 18)}In your flashcards` : `${icon('plus', 18)}Add to flashcards`}</button>
      <a class="btn btn-quiet btn-sm" href="${videoUrl(s)}" target="_blank" rel="noopener noreferrer">${icon('external', 18)}Watch signers</a>
    </div>
    <p class="fine">Signs can vary by region and community. The video link searches for real signers so you can see the movement.</p>
  </div>`;
}

export function openSignDetail(id, onChange) {
  const s = BY_ID[id];
  const { el } = openSheet({ title: s.type === 'word' ? s.label : `${s.type === 'letter' ? 'Letter' : 'Number'} ${s.label}`, body: detail(s), className: 'sheet-wide' });
  el.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (!add) return;
    markLearned([id]);
    add.disabled = true;
    add.innerHTML = `${icon('check', 18)}In your flashcards`;
    toast('Added to My signs');
    onChange?.();
  });
}

export function renderDictionary(page) {
  const cats = [{ id: 'all', label: 'All' }, ...CATEGORIES];
  page.innerHTML = `
    <header class="page-head">
      <h1>Dictionary</h1>
      <p>Every sign in SignSpark, with how to make it.</p>
    </header>
    <div class="dict-tools">
      <div class="search">
        ${icon('search', 20)}
        <label class="sr-only" for="dict-q">Search signs</label>
        <input id="dict-q" type="search" placeholder="Search, like “family” or “chin”" value="${esc(filter.q)}" autocomplete="off" spellcheck="false">
      </div>
      <div class="chips" role="group" aria-label="Category">
        ${cats.map((c) => `<button type="button" class="chip ${filter.cat === c.id ? 'on' : ''}" aria-pressed="${filter.cat === c.id}" data-cat="${c.id}">${c.label}</button>`).join('')}
      </div>
    </div>
    <p class="dict-count" aria-live="polite"></p>
    <div class="dict-grid"></div>`;

  const grid = page.querySelector('.dict-grid');
  const count = page.querySelector('.dict-count');
  const paint = () => {
    // Best matches first: the exact name, then names that start with the
    // search, then names that contain it, then matches in the description.
    const q = filter.q.trim().toLowerCase();
    const rank = (s) => {
      const name = s.label.toLowerCase();
      return !q || name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3;
    };
    const list = SIGNS.filter(matches).sort((a, b) => rank(a) - rank(b));
    const learned = store.state.learned;
    count.textContent = `${list.length} sign${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.length
      ? list.map((s) => `<button type="button" class="dict-card" data-sign="${s.id}">
          ${handStage(s.hand, { size: 'sm' })}
          <span class="dc-label">${esc(s.label)}</span>
          <span class="dc-cue">${esc(s.type === 'word' ? s.cue : s.type === 'letter' ? 'Letter' : 'Number')}</span>
          ${learned[s.id] ? `<span class="dc-badge" title="In your flashcards">${icon('check', 14)}<span class="sr-only">Learned</span></span>` : ''}
        </button>`).join('')
      : `<div class="empty">No signs match “${esc(filter.q)}”. Try another word, or fingerspell it on the Practice tab.</div>`;
  };
  paint();

  page.querySelector('#dict-q').addEventListener('input', (e) => {
    filter.q = e.target.value;
    paint();
  });
  page.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]');
    if (c) {
      filter.cat = c.dataset.cat;
      page.querySelectorAll('[data-cat]').forEach((b) => {
        b.classList.toggle('on', b === c);
        b.setAttribute('aria-pressed', String(b === c));
      });
      return paint();
    }
    const card = e.target.closest('[data-sign]');
    if (card) openSignDetail(card.dataset.sign, paint);
  });
}
