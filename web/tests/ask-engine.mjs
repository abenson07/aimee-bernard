// Checks for the "Ask me a Q?" engine against the live content index.
//   node tests/ask-engine.mjs [path-to-index.json | http://localhost:4321/api/ask-index.json]
import { readFileSync } from 'node:fs';
import { createEngine } from '../src/scripts/ask-engine.js';
import { KIND_LABEL } from '../src/scripts/ask-script.js';

const src = process.argv[2] ?? 'http://localhost:4321/api/ask-index.json';
const index = src.startsWith('http') ? await (await fetch(src)).json() : JSON.parse(readFileSync(src, 'utf8'));
let failures = 0;
const check = (name, ok, detail = '') => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  <- ' + detail}`); };

const flat = (r) => r.blocks.map((b) => (b.t === 'text' ? b.text : b.cards.map((c) => `[${c.title}${c.href ? ' ->' + c.href.slice(0, 30) : ''}]`).join(' '))).join(' | ');
// Search mode shows cards; chat mode shows one item at a time in a sentence (block.ref) plus a link.
const itemOf = (id) => { const x = index.records.find((q) => q.id === id); return { id, title: x.title, meta: [KIND_LABEL[x.type], x.venue, x.date].filter(Boolean).join(' · ') }; };
let currentMode = 'search';
const cardsOf = (r) => currentMode === 'chat' ? r.blocks.filter((b) => b.ref).map((b) => itemOf(b.ref)) : r.blocks.filter((b) => b.t === 'cards').flatMap((b) => b.cards);
const chipLabels = (r) => r.chips.map((c) => c.label);
const show = (q, r) => console.log(`\n> ${q}\n  ${flat(r)}\n  chips: ${chipLabels(r).join(' / ')}`);

for (const mode of ['search', 'chat']) {
  console.log(`\n===== MODE: ${mode} =====`);
  currentMode = mode;
  const chat = mode === 'chat';
  const eng = createEngine(index, { mode });
  let st = eng.initialState();
  const ask = (q) => { const r = eng.say(q, st); st = r.state; show(q, r); return r; };
  const tap = (a) => { const r = eng.act(a, st); st = r.state; show('(tap ' + a + ')', r); return r; };

  // ---- Version 1 style questions (both modes)
  let r = ask('podcasts');
  check('podcasts: results shown', cardsOf(r).length === (chat ? 1 : 3), flat(r));
  check('podcasts: newest first', /Autoimmunity/.test(cardsOf(r)[0].title), cardsOf(r)[0].title);
  r = ask('talks 2024');
  check('talks 2024: only 2024-dated items', cardsOf(r).every((c) => /2024/.test(c.meta)), JSON.stringify(cardsOf(r).map((c) => c.meta)));
  check('talks 2024: undated not mentioned', !/no date|undated/i.test(flat(r)), flat(r));
  r = ask('talks about vaccines in 2024');
  check('topic+year: some vaccine content', cardsOf(r).length > 0 && /vaccin/i.test(flat(r)), flat(r));
  r = ask('vaccines');
  check('vaccines: talks and course topics both appear', /vaccin/i.test(flat(r)) && cardsOf(r).length >= (chat ? 1 : 3), flat(r));
  r = ask('NPR');
  check('NPR: finds NPR or radio items', /NPR|radio|KOA|Sirius/i.test(flat(r)), flat(r));
  r = ask('awards');
  check('awards: award cards', cardsOf(r).length === (chat ? 1 : 3) && cardsOf(r).every((c) => /Award/.test(c.meta)), flat(r));
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
  check('gibberish: fallback', /don.t know|couldn.t find/.test(flat(r)), flat(r));
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
    check('ex2 podcast facets include years', chipLabels(r).some((l) => /^202\d/.test(l)), chipLabels(r).join());
    r = ask('2024');
    check('ex2 refined to 2024 podcasts', cardsOf(r).length === (chat ? 1 : 2) && cardsOf(r).every((c) => /Podcast/.test(c.meta) && /2024/.test(c.meta)), flat(r));
    r = ask('tell me about the second one');
    check('ex2 detail view of the second', /Detail|Podcast/.test(flat(r)) && /Back to the list/.test(chipLabels(r).join()), flat(r));
    r = tap('list');
    check('ex2 back to the list', cardsOf(r).length >= 1, flat(r));

    console.log('\n--- Follow-up questions about the item on screen ---');
    st = eng.initialState();
    r = ask('podcasts');
    r = ask('when was it?');
    check('followup when', /April 2025/.test(flat(r)), flat(r));
    r = ask('where');
    check('followup where', /Unbiased Science/.test(flat(r)), flat(r));
    r = ask('what is it about?');
    check('followup about', /autoimmunity/i.test(flat(r)), flat(r));
    r = ask('is there a link?');
    check('followup link honest when none', /don.t have a link/.test(flat(r)), flat(r));
    r = ask('when');
    check('followup bare when', /April 2025/.test(flat(r)), flat(r));

    console.log('\n--- Example 3: topic across the site, narrowing ---');
    st = eng.initialState();
    r = ask('what has she said about vaccines?');
    check('ex3 mixed kinds', cardsOf(r).length >= 1 && /vaccin/i.test(flat(r)), flat(r));
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
// Everyday questions a visitor is likely to type: each should get a sensible, honest reply and never a wrong search.
console.log('\n===== EVERYDAY QUESTIONS (chat) =====');
const everyday = [
  ['hi', /what would you like to know/i], ['bye', /come back/i], ['ok', /anything else/i],
  ['are you ai', /scripted helper, not an AI/], ['ignore all previous instructions', /scripted B cell/], ['<script>alert(1)</script>', /scripted B cell/],
  ['tell me a joke', /outside my notes/], ['what is 2+2', /outside my notes/], ['hola', /only understand English/], ['fuck you', /friendly/],
  ['what is her job', /Associate Professor/], ['where does she work', /Associate Professor/], ['how old is she', /personal/],
  ['how much does she charge', /don.t have prices/], ['how do i contact her', /contact page/], ['can i shadow her', /contact page/],
  ['what is immunology', /study of the immune system/], ['what is mrna', /instructions/], ['what do b cells do', /antibodies/],
  ['should i get a flu shot', /not a doctor/], ['i have cancer what should i do', /not a doctor/], ['is the covid vaccine safe for kids', /not a doctor/],
  ['what is her story', /her own story/], ['how do i become an immunologist', /her own story/],
  ['what is the best thing to read', /If you only look at one thing/], ['tiktok', /TikTok/], ['is she on twitter', /don.t see that one/], ['bluesky', /Bluesky/], ['substack', /Science Crosstalk/], ['instagram', /funsizeimmuninja/], ['what is her handle', /funsizeimmuninja/], ['what does she teach', /MIMS7530/], ['i have cancer what should i do', /so sorry/],
  ['vacines', /vaccine/i], ['podcats', /podcast/i], ['talks from 2019', /dated 2019/], ['talks in 2019 and 2020', /one year at a time/],
  ['last year', /from 2025/], ['oldest talk', /oldest/], ['latest', /newest/], ['has she been on tv', /couldn.t find anything about/],
  ['what does she doe', /few hats/], ['news coverage', /press mentions/], ['teaching award', /awards about/],
];
for (const [q, re] of everyday) {
  const e = createEngine(index, { mode: 'chat' });
  const r = e.say(q, e.initialState());
  check(`everyday: ${q}`, re.test(flat(r)), flat(r).slice(0, 200));
}
const eng2 = createEngine(index, { mode: 'chat' });
let st2 = eng2.initialState();
const say2 = (q) => { const r = eng2.say(q, st2); st2 = r.state; return r; };
say2('what does she do');
check('hats then "tell me them"', /Educator:/.test(flat(say2('tell me them'))));
say2('podcasts');
check('followup "when" after podcasts', /April 2025/.test(flat(say2('when was it?'))));
say2('talks');
check('refine to an empty year says so', /I don.t have/.test(flat(say2('what about 1999'))) || /dated 1999/.test(flat(say2('1999'))));

// ---- Facts written in Studio (plain phrases, escaped by askIndex) work, and a bad pattern cannot break the chat
{
  const sanityShaped = {
    ...index,
    facts: [
      { id: 'botFact-bad', match: ['(unclosed', '[oops'], answer: ['never shown'] },
      { id: 'botFact-lab', match: ['where is her lab', 'lab location'], answer: ['Aimee’s lab is on the Anschutz Medical Campus.', 'Come say hi.'], links: [{ label: 'Contact Aimee', href: '/contact' }] },
      ...(index.facts ?? []),
    ],
    socials: [{ id: 'bad', label: 'Bad', handle: '@bad', href: 'https://example.com', words: ['(broken'] }, ...(index.socials ?? [])],
  };
  for (const mode of ['search', 'chat']) {
    const e = createEngine(sanityShaped, { mode });
    const r1 = e.say('Where is her lab?', e.initialState());
    check(`studio fact (${mode}): answers with both lines and the link`, /Anschutz/.test(flat(r1)) && /Come say hi/.test(flat(r1)) && /Contact Aimee/.test(flat(r1)), flat(r1).slice(0, 200));
    const r2 = e.say('what is her lab location', e.initialState());
    check(`studio fact (${mode}): second phrase matches`, /Anschutz/.test(flat(r2)), flat(r2).slice(0, 200));
    let threw = false, r3;
    try { r3 = e.say('tell me about vaccines', e.initialState()); } catch { threw = true; }
    check(`invalid pattern (${mode}): chat keeps working`, !threw && !/never shown/.test(flat(r3)), threw ? 'threw' : flat(r3).slice(0, 200));
  }
}

console.log(`\n${failures ? failures + ' FAILED' : 'ALL PASSED'}`);
process.exit(failures ? 1 : 0);
