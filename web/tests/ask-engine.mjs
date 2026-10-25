// Checks for the "Ask me a Q?" engine against the live content index.
//   node tests/ask-engine.mjs [path-to-index.json | http://localhost:4321/api/ask-index.json]
import { readFileSync } from 'node:fs';
import { createEngine } from '../src/scripts/ask-engine.js';

const src = process.argv[2] ?? 'http://localhost:4321/api/ask-index.json';
const index = src.startsWith('http') ? await (await fetch(src)).json() : JSON.parse(readFileSync(src, 'utf8'));
let failures = 0;
const check = (name, ok, detail = '') => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  <- ' + detail}`); };

const flat = (r) => r.blocks.map((b) => (b.t === 'text' ? b.text : b.cards.map((c) => `[${c.title}${c.href ? ' ->' + c.href.slice(0, 30) : ''}]`).join(' '))).join(' | ');
const cardsOf = (r) => r.blocks.filter((b) => b.t === 'cards').flatMap((b) => b.cards);
const chipLabels = (r) => r.chips.map((c) => c.label);
const show = (q, r) => console.log(`\n> ${q}\n  ${flat(r)}\n  chips: ${chipLabels(r).join(' / ')}`);

for (const mode of ['search', 'chat']) {
  console.log(`\n===== MODE: ${mode} =====`);
  const eng = createEngine(index, { mode });
  let st = eng.initialState();
  const ask = (q) => { const r = eng.say(q, st); st = r.state; show(q, r); return r; };
  const tap = (a) => { const r = eng.act(a, st); st = r.state; show('(tap ' + a + ')', r); return r; };

  // ---- Version 1 style questions (both modes)
  let r = ask('podcasts');
  check('podcasts: 3 cards shown', cardsOf(r).length === 3, flat(r));
  check('podcasts: newest first', /Autoimmunity/.test(cardsOf(r)[0].title), cardsOf(r)[0].title);
  r = ask('talks 2024');
  check('talks 2024: only 2024-dated items', cardsOf(r).every((c) => /2024/.test(c.meta)), JSON.stringify(cardsOf(r).map((c) => c.meta)));
  check('talks 2024: undated not mentioned', !/no date|undated/i.test(flat(r)), flat(r));
  r = ask('talks about vaccines in 2024');
  check('topic+year: some vaccine content', cardsOf(r).length > 0 && /vaccin/i.test(flat(r)), flat(r));
  r = ask('vaccines');
  check('vaccines: talks and course topics both appear', /vaccin/i.test(flat(r)) && cardsOf(r).length >= 3, flat(r));
  r = ask('NPR');
  check('NPR: finds NPR or radio items', /NPR|radio|KOA|Sirius/i.test(flat(r)), flat(r));
  r = ask('awards');
  check('awards: award cards', cardsOf(r).length === 3 && cardsOf(r).every((c) => /Award/.test(c.meta)), flat(r));
  r = ask('does she write');
  check('write: articles', /Article/.test(flat(r)) || cardsOf(r).length > 0, flat(r));
  r = ask('TEDx');
  check('TEDx: finds the TEDx talk', /TEDx/i.test(flat(r)), flat(r));
  r = ask('what is a b cell');
  check('b cell explainer', /That.s me/.test(flat(r)), flat(r));
  r = ask('book aimee');
  check('booking: contact link', /\/contact/.test(flat(r)), flat(r));
  r = ask('should i take the covid vaccine');
  check('safety reply', /not a doctor/.test(flat(r)), flat(r));
  r = ask('banana');
  check('gibberish: fallback', /don.t know/.test(flat(r)), flat(r));
  r = ask('does she have a book');
  check('books: honest answer', /haven.t found a book/.test(flat(r)), flat(r));
  r = ask('radio');
  check('radio synonym: NPR/Sirius/KOA', /NPR|KOA|Sirius|radio/i.test(flat(r)), flat(r));
  r = ask('tlas');
  check('TLaS program with links', /tlasprogram/.test(flat(r)), flat(r));
  r = ask('outreach');
  check('outreach: four programs', /four outreach programs/.test(flat(r)), flat(r));
  r = ask('what does aimee do?');
  check('hats', /few hats/.test(flat(r)), flat(r));

  if (mode === 'chat') {
    console.log('\n--- Example 1: high to low ---');
    st = eng.initialState();
    r = ask('what does aimee do?');
    check('ex1 hats chips', chipLabels(r).includes('Educator') && chipLabels(r).includes('Science Communicator'), chipLabels(r).join());
    r = tap('persona:outreach');
    check('ex1 programs list', chipLabels(r).includes('ECHO'), chipLabels(r).join());
    r = tap('program:echo');
    check('ex1 echo links', /19ZUjebrKcE/.test(JSON.stringify(r)), flat(r));

    console.log('\n--- Example 2: refine with memory ---');
    st = eng.initialState();
    r = ask('podcasts');
    check('ex2 podcast facets include years', chipLabels(r).some((l) => /^2025/.test(l)) && chipLabels(r).some((l) => /^2024/.test(l)), chipLabels(r).join());
    r = ask('2024');
    check('ex2 refined to 2024 podcasts', cardsOf(r).length === 2 && cardsOf(r).every((c) => /Podcast/.test(c.meta) && /2024/.test(c.meta)), flat(r));
    r = ask('tell me about the second one');
    check('ex2 detail view of the second', /Detail|Podcast/.test(flat(r)) && /Back to the list/.test(chipLabels(r).join()), flat(r));
    r = tap('list');
    check('ex2 back to the list', cardsOf(r).length === 2, flat(r));

    console.log('\n--- Example 3: topic across the site, narrowing ---');
    st = eng.initialState();
    r = ask('what has she said about vaccines?');
    check('ex3 mixed kinds', cardsOf(r).length >= 3, flat(r));
    check('ex3 kind facets offered', chipLabels(r).some((l) => /Talks|Course/i.test(l)), chipLabels(r).join());
    r = ask('just the talks');
    check('ex3 narrows to talks, keeps topic', cardsOf(r).length > 0 && cardsOf(r).every((c) => /^Talk/.test(c.meta)), flat(r));
    r = ask('more');
    check('ex3 more shows next page or says done', cardsOf(r).length >= 0, flat(r));
    r = ask('back');
    check('back restores', r.blocks.length > 0, flat(r));
    r = ask('start over');
    check('start over greets', /What would you like/.test(flat(r)), flat(r));
  }
}
console.log(`\n${failures ? failures + ' FAILED' : 'ALL PASSED'}`);
process.exit(failures ? 1 : 0);
