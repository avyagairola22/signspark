// One renderer per exercise type. Each renderer draws into api.stage and
// returns how the footer should behave:
//   mode 'continue'  just a Continue button (new-sign cards)
//   mode 'check'     a Check button, enabled with api.ready(true)
//   mode 'custom'    the exercise sets its own buttons (matching, sign-it-yourself)
// and optionally check(), key(n) for number-key shortcuts, reveal() after
// checking, and cleanup() when moving on.

import { BY_ID, FACE_LABELS, glossOf } from '../data/signs.js';
import { SENTENCE_BY_ID } from '../data/sentences.js';
import { FACT_BY_ID } from '../data/facts.js';
import { LOCATIONS } from '../render/body.js';
import { handSVG } from '../render/hands.js';
import { checkGloss, shuffle, toLetters } from '../engine/lesson.js';
import { esc, vibrate, finePointer } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { handStage, signPicture, paramList, exampleBlock, spellStrip, speller } from '../ui/visuals.js';

const kicker = (text, name = 'sparkle') => `<p class="ex-kicker">${icon(name, 16)} ${esc(text)}</p>`;

/** Shared logic for multiple-choice questions. */
function choice(answer, api, answerHtml) {
  let selected = null;
  const opts = [...api.stage.querySelectorAll('.opt')];
  const select = (btn) => {
    if (api.locked()) return;
    opts.forEach((o) => o.setAttribute('aria-pressed', String(o === btn)));
    selected = btn.dataset.id;
    api.ready(true);
  };
  opts.forEach((o) => o.addEventListener('click', () => select(o)));
  return {
    mode: 'check',
    key: (n) => opts[n - 1] && select(opts[n - 1]),
    check: () => ({ correct: selected === answer, answer: answerHtml }),
    reveal: () => opts.forEach((o) => {
      o.disabled = true;
      if (o.dataset.id === answer) o.classList.add('is-right');
      else if (o.dataset.id === selected) o.classList.add('is-wrong');
    }),
  };
}

/** Shared logic for "tap tiles into order" exercises. Returns the chosen tile indexes. */
function tileBuilder(api, { line, bank, slots, renderTile, onChange }) {
  const chosen = [];
  const paint = () => {
    const filled = chosen.map((i, k) => `<button type="button" class="placed" data-k="${k}" aria-label="Remove ${k + 1}">${renderTile(i)}</button>`);
    const empty = slots ? Array.from({ length: Math.max(0, slots - chosen.length) }, () => '<span class="slot"></span>') : [];
    line.innerHTML = filled.join('') + empty.join('') || '<span class="line-hint">Tap the tiles below</span>';
    bank.querySelectorAll('[data-i]').forEach((b) => { b.disabled = chosen.includes(+b.dataset.i); });
    onChange(chosen);
  };
  bank.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b || b.disabled || api.locked() || (slots && chosen.length >= slots)) return;
    chosen.push(+b.dataset.i);
    paint();
  });
  line.addEventListener('click', (e) => {
    const b = e.target.closest('.placed');
    if (!b || api.locked()) return;
    chosen.splice(+b.dataset.k, 1);
    paint();
  });
  paint();
  return chosen;
}

const typeWord = (s) => (s.type === 'letter' ? 'letter' : s.type === 'number' ? 'number' : 'sign');

export const RENDERERS = {
  intro(ex, api) {
    const s = BY_ID[ex.sign];
    api.stage.innerHTML = `<div class="ex ex-intro">
      ${kicker(s.type === 'word' ? 'New sign' : `New ${typeWord(s)}`)}
      <h2 class="ex-big">${esc(s.label)}</h2>
      ${s.type === 'word' ? `<p class="gloss gloss-sub">${esc(glossOf(s))}</p>` : ''}
      ${signPicture(s, { size: 'lg' })}
      <p class="how">${esc(s.how)}</p>
      ${paramList(s)}
      ${s.tip ? `<p class="tip">${icon('info', 18)}<span>${esc(s.tip)}</span></p>` : ''}
      ${exampleBlock(s.example)}
    </div>`;
    return { mode: 'continue', graded: false };
  },

  pickLabel(ex, api) {
    const s = BY_ID[ex.sign];
    const q = s.type === 'letter' ? 'Which letter is this?' : s.type === 'number' ? 'Which number is this?' : 'What does this sign mean?';
    const cue = s.type === 'word'
      ? `<p class="cue-line">${esc(s.moveText)} · ${esc(LOCATIONS[s.loc].label)}</p>`
      : '';
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Recognize', 'eye')}
      <h2 class="ex-q">${q}</h2>
      ${signPicture(s, { size: 'md', hideName: true })}
      ${cue}
      <div class="opts ${s.type === 'word' ? '' : 'opts-grid'}" role="group" aria-label="Answers">
        ${ex.options.map((id, i) => `<button type="button" class="opt" data-id="${id}" aria-pressed="false"><kbd>${i + 1}</kbd><span>${esc(s.type === 'word' ? glossOf(BY_ID[id]) : BY_ID[id].label)}</span></button>`).join('')}
      </div>
    </div>`;
    return choice(ex.sign, api, `<span class="gloss">${esc(s.type === 'word' ? glossOf(s) : s.label)}</span>`);
  },

  pickVisual(ex, api) {
    const s = BY_ID[ex.sign];
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Find the handshape', 'search')}
      <h2 class="ex-q">Which one is the ${typeWord(s)} <span class="hl">${esc(s.label)}</span>?</h2>
      <div class="opts opts-pics" role="group" aria-label="Handshapes">
        ${ex.options.map((id, i) => `<button type="button" class="opt opt-pic" data-id="${id}" aria-pressed="false" aria-label="Handshape ${i + 1}"><kbd>${i + 1}</kbd>${handStage(BY_ID[id].hand, { size: 'sm' })}</button>`).join('')}
      </div>
    </div>`;
    return choice(ex.sign, api, `<span class="fb-hand">${handSVG(s.hand)}</span>`);
  },

  pickHow(ex, api) {
    const s = BY_ID[ex.sign];
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Choose the description', 'book')}
      <h2 class="ex-q">How do you sign <span class="hl gloss">${esc(glossOf(s))}</span>?</h2>
      <div class="opts" role="group" aria-label="Descriptions">
        ${ex.options.map((id, i) => `<button type="button" class="opt" data-id="${id}" aria-pressed="false"><kbd>${i + 1}</kbd><span>${esc(BY_ID[id].short)}</span></button>`).join('')}
      </div>
    </div>`;
    return choice(ex.sign, api, esc(s.short));
  },

  match(ex, api) {
    const ids = ex.pairs;
    const words = BY_ID[ids[0]].type === 'word';
    const left = shuffle(ids);
    const right = shuffle(ids);
    const leftCell = (id) => (words ? `<span class="gloss">${esc(glossOf(BY_ID[id]))}</span>` : handStage(BY_ID[id].hand, { size: 'xs' }));
    const rightCell = (id) => (words ? esc(BY_ID[id].cue) : `<span class="m-letter">${esc(BY_ID[id].label)}</span>`);
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Match', 'sparkle')}
      <h2 class="ex-q">Tap the matching pairs</h2>
      <div class="match ${words ? 'match-words' : ''}">
        <div class="match-col">${left.map((id) => `<button type="button" class="opt m-item ${words ? '' : 'm-pic'}" data-side="l" data-id="${id}" aria-pressed="false" ${words ? '' : 'aria-label="Handshape"'}>${leftCell(id)}</button>`).join('')}</div>
        <div class="match-col">${right.map((id) => `<button type="button" class="opt m-item" data-side="r" data-id="${id}" aria-pressed="false">${rightCell(id)}</button>`).join('')}</div>
      </div>
    </div>`;
    let held = null;
    let matched = 0;
    let slips = 0;
    api.stage.querySelector('.match').addEventListener('click', (e) => {
      const b = e.target.closest('.m-item');
      if (!b || b.disabled || api.locked()) return;
      if (!held || held.dataset.side === b.dataset.side) {
        held?.setAttribute('aria-pressed', 'false');
        held = b;
        b.setAttribute('aria-pressed', 'true');
        return;
      }
      const a = held;
      held = null;
      if (a.dataset.id === b.dataset.id) {
        for (const x of [a, b]) {
          x.disabled = true;
          x.classList.add('is-done');
          x.setAttribute('aria-pressed', 'false');
        }
        matched++;
        vibrate(10);
        if (matched === ids.length) {
          api.result(true, { note: slips ? `All matched, with ${slips} slip${slips > 1 ? 's' : ''}.` : 'Perfect match!' });
        }
      } else {
        slips++;
        vibrate([20, 40, 20]);
        for (const x of [a, b]) {
          x.setAttribute('aria-pressed', 'false');
          x.classList.add('is-wrong');
          setTimeout(() => x.classList.remove('is-wrong'), 450);
        }
      }
    });
    return { mode: 'custom', graded: false, buttons: [{ label: 'Match all pairs', disabled: true }] };
  },

  spellRead(ex, api) {
    const word = ex.word;
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Read fingerspelling', 'eye')}
      <h2 class="ex-q">What word is being spelled?</h2>
      <div class="reader">
        <div class="reader-stage"></div>
        <div class="reader-dots" aria-hidden="true">${[...word].map(() => '<i></i>').join('')}</div>
        <button type="button" class="btn btn-quiet btn-sm reader-replay">${icon('replay', 18)} Replay</button>
      </div>
      <label class="field" for="ex-word"><span class="sr-only">Your answer</span>
        <input id="ex-word" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="14" placeholder="Type the word">
      </label>
      <div class="after"></div>
    </div>`;
    const input = api.stage.querySelector('#ex-word');
    const sp = speller(api.stage.querySelector('.reader-stage'), word, {
      ms: 850,
      dots: [...api.stage.querySelectorAll('.reader-dots i')],
    });
    sp.play();
    api.stage.querySelector('.reader-replay').addEventListener('click', () => sp.play());
    input.addEventListener('input', () => api.ready(input.value.trim().length > 0));
    if (finePointer()) setTimeout(() => input.focus({ preventScroll: true }), 60);
    return {
      mode: 'check',
      check: () => ({ correct: toLetters(input.value) === word, answer: `<span class="gloss">${word}</span>` }),
      reveal: () => {
        input.disabled = true;
        api.stage.querySelector('.after').innerHTML = spellStrip(word);
      },
      cleanup: sp.stop,
    };
  },

  spellBuild(ex, api) {
    const word = ex.word;
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Fingerspell it', 'abc')}
      <h2 class="ex-q">Spell <span class="hl gloss">${esc(word)}</span> with handshapes</h2>
      <div class="build-line" aria-label="Your spelling"></div>
      <div class="bank" role="group" aria-label="Handshape tiles">
        ${ex.tiles.map((ch, i) => `<button type="button" class="tile-h" data-i="${i}" aria-label="Handshape tile">${handStage(ch, { size: 'xs' })}</button>`).join('')}
      </div>
      <div class="after"></div>
    </div>`;
    const chosen = tileBuilder(api, {
      line: api.stage.querySelector('.build-line'),
      bank: api.stage.querySelector('.bank'),
      slots: word.length,
      renderTile: (i) => handStage(ex.tiles[i], { size: 'xs' }),
      onChange: (c) => api.ready(c.length === word.length),
    });
    return {
      mode: 'check',
      check: () => ({ correct: chosen.map((i) => ex.tiles[i]).join('') === word, answer: `<span class="gloss">${word}</span>` }),
      reveal: () => {
        api.stage.querySelectorAll('.bank button').forEach((b) => { b.disabled = true; });
        api.stage.querySelector('.after').innerHTML = spellStrip(word);
      },
    };
  },

  gloss(ex, api) {
    const s = SENTENCE_BY_ID[ex.sentence];
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Sentence builder', 'chat')}
      <h2 class="ex-q">Put the signs in ASL order</h2>
      <p class="en-line">“${esc(s.en)}”</p>
      ${s.face ? `<p class="face-hint">${icon('eye', 16)} Face: ${esc(FACE_LABELS[s.face])}</p>` : ''}
      <div class="gloss-line" aria-label="Your sentence"></div>
      <div class="bank gloss-bank" role="group" aria-label="Sign tiles">
        ${ex.tiles.map((t, i) => `<button type="button" class="chip-t gloss" data-i="${i}">${esc(t)}</button>`).join('')}
      </div>
    </div>`;
    const chosen = tileBuilder(api, {
      line: api.stage.querySelector('.gloss-line'),
      bank: api.stage.querySelector('.gloss-bank'),
      renderTile: (i) => `<span class="chip-t gloss">${esc(ex.tiles[i])}</span>`,
      onChange: (c) => api.ready(c.length > 0),
    });
    return {
      mode: 'check',
      check: () => ({
        correct: checkGloss(s.id, chosen.map((i) => ex.tiles[i])),
        answer: s.answers.map((a) => `<span class="gloss">${a.join(' ')}</span>`).join(' or '),
        note: esc(s.note),
      }),
      reveal: () => api.stage.querySelectorAll('.gloss-bank button').forEach((b) => { b.disabled = true; }),
    };
  },

  selfCheck(ex, api) {
    const s = BY_ID[ex.sign];
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Sign it yourself', 'heart')}
      <h2 class="ex-q">Sign <span class="hl gloss">${esc(glossOf(s))}</span></h2>
      <p class="muted">Make the sign with your own hands, in the air or in front of a mirror. Then check yourself.</p>
      <div class="self-reveal" hidden>${signPicture(s, { size: 'md' })}<p class="how">${esc(s.how)}</p></div>
    </div>`;
    const box = api.stage.querySelector('.self-reveal');
    const show = () => {
      box.hidden = false;
      box.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      api.setButtons([
        { label: 'Not yet', kind: 'btn-quiet', onClick: () => api.result(false, { note: 'No problem. This sign will come back so you can try again.' }) },
        { label: 'I signed it', onClick: () => api.result(true, { note: 'Your hands are learning.' }) },
      ]);
    };
    return { mode: 'custom', buttons: [{ label: 'Show me the sign', onClick: show }] };
  },

  fact(ex, api) {
    const f = FACT_BY_ID[ex.fact];
    api.stage.innerHTML = `<div class="ex">
      ${kicker('Deaf culture', 'heart')}
      <h2 class="ex-q">True or false?</h2>
      <p class="fact-text">${esc(f.text)}</p>
      <div class="opts opts-tf" role="group" aria-label="True or false">
        <button type="button" class="opt" data-id="true" aria-pressed="false"><kbd>1</kbd><span>True</span></button>
        <button type="button" class="opt" data-id="false" aria-pressed="false"><kbd>2</kbd><span>False</span></button>
      </div>
    </div>`;
    const base = choice(String(f.answer), api, f.answer ? 'True' : 'False');
    return { ...base, check: () => ({ ...base.check(), note: esc(f.why) }) };
  },
};
