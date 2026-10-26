/* The "Ask me a Q?" engine. Pure functions, no DOM, no network: give it the content index and it answers.
   Two modes share one matcher:
     search - one question, one answer (a fun line and up to 3 items). No memory.
     chat   - remembers what you were looking at, offers follow-ups taken from the results, and can drill
              from a hat (educator, communicator...) to a kind to one item.
   Nothing is invented: every reply is a hand-written template (ask-script.js) filled from real content. */
import * as S from './ask-script.js';

/* ---------- text helpers ---------- */
export const normalize = (s) =>
  String(s ?? '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();

export function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}
const stemAll = (s) => normalize(s).split(' ').filter(Boolean).map(stem);

const STOP = new Set(
  ('a an the and or of in on at to for from with by about as is are was were be been being do does did can could would should will what whats which who whom how when where why that this these those it its i me my you your we our they their he she her his him aimee aimees dr some any all other please tell show give find look looking want need like got have has had there here just only really also anything something things thing stuff item one ones lot much many few new newest latest recent hers some get see know ask question about into out up down over under again then than so very too if but not no yes ok okay hmm').split(' ')
);

const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const numWord = (n) => (n >= 0 && n <= 10 ? NUM[n] : String(n));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (tpl, n) => tpl.replace('{N}', cap(numWord(n))).replace('{n}', numWord(n));
const pick = (arr, seed) => arr[seed % arr.length];

export function oneLiner(desc, max = 150) {
  if (!desc) return '';
  const t = String(desc).replace(/\s+/g, ' ').trim();
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  let first = m ? m[1] : t;
  if (first.length > max) first = first.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return first;
}

/* ---------- vocabulary ---------- */
const KIND_STEM = new Map();
const KIND_PHRASES = [];
for (const [kind, words] of Object.entries(S.KIND_WORDS)) {
  for (const w of words) {
    if (w.includes(' ')) KIND_PHRASES.push([w, kind]);
    else KIND_STEM.set(stem(normalize(w)), kind);
  }
}
// Both "speak" and "teach" are kind words, so "does she speak" finds talks.

const GROUPS = S.SYNONYMS.map((g) => {
  const singles = g.filter((w) => !w.includes(' ')).map((w) => stem(normalize(w)));
  const phrases = g.filter((w) => w.includes(' ')).map(normalize);
  return { singles, phrases };
});
const GROUP_OF = new Map();
GROUPS.forEach((g) => g.singles.forEach((s) => GROUP_OF.set(s, g)));

/* ---------- index ---------- */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/** Year and month as one number so "April 2025" sorts after "January 2025". 0 when the item has no date. */
export function stamp(r) {
  if (!r.year) return 0;
  const m = MONTHS.findIndex((x) => String(r.date ?? '').toLowerCase().includes(x));
  return r.year * 12 + (m < 0 ? 0 : m);
}

export function prepare(index) {
  const recs = index.records.map((r) => ({
    ...r,
    ts: stamp(r),
    _t: new Set(stemAll(r.title)),
    _v: new Set(stemAll(r.venue)),
    _d: new Set(stemAll(r.desc)),
    _m: new Set(stemAll([r.parent, r.persona].filter(Boolean).join(' '))),
    _text: normalize([r.title, r.venue, r.desc, r.parent].filter(Boolean).join(' ')),
  }));
  const byId = new Map(recs.map((r) => [r.id, r]));
  const programs = index.programs ?? [];
  return { recs, byId, programs };
}

const has = (set, t) => {
  if (set.has(t)) return true;
  if (t.length >= 4) for (const w of set) if (w.length > t.length && w.startsWith(t)) return true;
  return false;
};

/* A "term" is one thing the visitor mentioned: the word plus anything that means the same. */
function termFor(word) {
  const s = stem(word);
  const g = GROUP_OF.get(s);
  return { word, alts: g ? [...new Set([s, ...g.singles])] : [s], phrases: g ? g.phrases : [] };
}

function scoreTerm(rec, term) {
  let best = 0;
  for (const a of term.alts) {
    if (has(rec._t, a)) best = Math.max(best, 3);
    else if (has(rec._v, a)) best = Math.max(best, 2);
    else if (has(rec._m, a)) best = Math.max(best, 1);
    else if (has(rec._d, a)) best = Math.max(best, 1);
  }
  for (const p of term.phrases) if (rec._text.includes(p)) best = Math.max(best, 2);
  return best;
}

/* ---------- parsing ---------- */
export function parse(text) {
  let q = normalize(text);
  const out = { raw: text, norm: q, year: 0, kinds: [], terms: [] };
  const ym = q.match(/\b(19|20)\d{2}\b/);
  if (ym) { out.year = Number(ym[0]); q = q.replace(ym[0], ' '); }
  const kinds = new Set();
  for (const [p, kind] of KIND_PHRASES) if (q.includes(p)) { kinds.add(kind); q = q.replace(p, ' '); }
  for (const g of GROUPS) {
    for (const p of g.phrases) {
      if (q.includes(p)) { out.terms.push({ word: p, alts: g.singles, phrases: g.phrases }); q = q.replace(p, ' '); break; }
    }
  }
  for (const w of q.split(' ').filter(Boolean)) {
    if (STOP.has(w)) continue;
    const s = stem(w);
    if (STOP.has(s)) continue;
    const kind = KIND_STEM.get(s);
    if (kind) { kinds.add(kind); continue; }
    out.terms.push(termFor(w));
  }
  out.kinds = [...kinds];
  return out;
}

/* ---------- search ---------- */
const kindOk = (rec, kinds, hasTerms) => {
  if (!kinds.length) return true;
  return kinds.some((k) => {
    if (k === 'course') return rec.type === 'course' || (hasTerms && rec.type === 'topic');
    return rec.type === k;
  });
};

function runSearch(prep, f) {
  const hasTerms = f.terms.length > 0;
  const need = f.terms.length <= 2 ? f.terms.length : Math.ceil(f.terms.length * 0.6);
  const scored = [];
  for (const rec of prep.recs) {
    if (!kindOk(rec, f.kinds, hasTerms)) continue;
    if (f.venue && !rec._text.includes(f.venue)) continue;
    let score = 1;
    if (hasTerms) {
      let matched = 0, sum = 0;
      for (const t of f.terms) { const s = scoreTerm(rec, t); if (s > 0) { matched++; sum += s; } }
      if (matched < need) continue;
      score = sum;
    }
    scored.push({ rec, score });
  }
  if (!scored.length && f.terms.length > 1) {
    // Nothing matched every word; accept any one of them.
    for (const rec of prep.recs) {
      if (!kindOk(rec, f.kinds, true)) continue;
      if (f.venue && !rec._text.includes(f.venue)) continue;
      let sum = 0;
      for (const t of f.terms) sum += scoreTerm(rec, t);
      if (sum > 0) scored.push({ rec, score: sum });
    }
  }
  const byTitle = new Set();
  const rank = (a, b) => (b.rec.featured - a.rec.featured) || (b.score - a.score) || (b.rec.ts - a.rec.ts) || a.rec.title.localeCompare(b.rec.title);
  const unique = (list) => list.sort(rank).filter(({ rec }) => { const k = normalize(rec.title) + '|' + rec.year; if (byTitle.has(k)) return false; byTitle.add(k); return true; });
  let primary, secondary = [];
  if (f.year) {
    const inYear = scored.filter((x) => x.rec.year === f.year);
    primary = unique(inYear);
    if (hasTerms) secondary = unique(scored.filter((x) => x.rec.year !== f.year));
  } else {
    primary = unique(scored);
  }
  return { primary, secondary };
}

const card = (rec) => ({
  id: rec.id,
  title: rec.title,
  meta: [S.KIND_LABEL[rec.type] ?? '', rec.venue, rec.date].filter(Boolean).join(' · '),
  desc: rec.type === 'topic' ? '' : oneLiner(rec.desc),
  href: rec.href,
});

/* ---------- replies ---------- */
const text = (t) => ({ t: 'text', text: t });
const cards = (c, extra = {}) => ({ t: 'cards', cards: c, ...extra });
const say = (label, s) => ({ label, say: s });
const act = (label, a) => ({ label, act: a });

function dedupeTerms(terms) {
  const seen = new Set();
  return terms.filter((t) => { const k = t.alts[0]; if (seen.has(k)) return false; seen.add(k); return true; });
}

const topicWords = (f) => f.terms.map((t) => t.word).join(' ');

function lead(f, n, seed) {
  if (f.kinds.length === 1 && !f.terms.length && f.year) {
    return `Here are ${S.KIND_PLURAL[f.kinds[0]] ?? 'things'} from ${f.year}:`;
  }
  if (f.terms.length && f.year) return `Here’s what I found about “${topicWords(f)}” from ${f.year}:`;
  const k = f.kinds.length === 1 ? f.kinds[0] : 'any';
  const variants = S.LEADS[k] ?? S.LEADS.any;
  let line = fill(pick(variants, seed), n);
  if (f.terms.length && f.kinds.length === 1) line = `${cap(S.KIND_PLURAL[k] ?? 'things')} about “${topicWords(f)}”:`;
  else if (f.terms.length) line = fill(`Here’s what I found about “${topicWords(f)}”:`, n);
  return line;
}

function topicFact(f) {
  for (const t of f.terms) for (const a of t.alts) for (const [k, v] of Object.entries(S.TOPIC_FACTS)) if (a.startsWith(k) || k.startsWith(a)) return v;
  return null;
}

function facetChips(prep, f, all, memory) {
  const chips = [];
  if (!memory) return chips;
  const yearCount = new Map();
  const typeCount = new Map();
  const venueCount = new Map();
  for (const { rec } of all) {
    if (rec.year) yearCount.set(rec.year, (yearCount.get(rec.year) ?? 0) + 1);
    typeCount.set(rec.type, (typeCount.get(rec.type) ?? 0) + 1);
    if (rec.venue && rec.type !== 'topic' && rec.type !== 'course') venueCount.set(rec.venue, (venueCount.get(rec.venue) ?? 0) + 1);
  }
  if (!f.year) {
    [...yearCount].sort((a, b) => b[1] - a[1] || b[0] - a[0]).slice(0, 3).forEach(([y, c]) => chips.push(act(`${y} (${c})`, `year:${y}`)));
  }
  if (!f.kinds.length && typeCount.size > 1) {
    [...typeCount].sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([t, c]) => chips.push(act(`${cap(S.KIND_PLURAL[t] ?? t)} (${c})`, `kind:${t}`)));
  }
  if (f.kinds.length && !f.venue && venueCount.size > 1) {
    [...venueCount].sort((a, b) => b[1] - a[1]).slice(0, 2).forEach(([v]) => chips.push(act(v.length > 24 ? v.slice(0, 23) + '…' : v, `venue:${v}`)));
  }
  return chips;
}

const starterChips = (n = 6) => S.STARTERS.slice(0, n).map((s) => say(s.label, s.say));
const contactChip = () => ({ label: 'Contact Aimee', href: '/contact' });

/* ---------- the engine ---------- */
export function createEngine(index, { mode = 'chat' } = {}) {
  const prep = prepare(index);
  const memory = mode === 'chat';
  const PER = 3;
  const hasResults = (f) => { const r = runSearch(prep, f); return r.primary.length + r.secondary.length > 0; };

  const blank = () => ({ f: { kinds: [], year: 0, terms: [], venue: '' }, ids: [], shown: 0, cards: [], view: 'home', turn: 0, history: [], secondaryFrom: 0 });

  function finish(state, blocks, chips, patch = {}) {
    const next = { ...state, ...patch, turn: state.turn + 1 };
    if (memory) next.history = [...state.history, snapshot(state)].slice(-12);
    return { blocks, chips, state: next };
  }
  const snapshot = (s) => ({ ...s, history: [] });

  function greet() {
    return { blocks: [], chips: starterChips(), state: blank() };
  }

  function resultsReply(state, f, seedBase) {
    const { primary, secondary } = runSearch(prep, f);
    const all = [...primary, ...secondary];
    if (!all.length) return fallback(state, f);
    const blocks = [];
    const seed = hash(seedBase) + state.turn;
    const shownPrimary = primary.slice(0, PER);
    if (primary.length) {
      blocks.push(text(lead(f, primary.length, seed)));
      const fact = topicFact(f);
      if (fact) blocks.push(text(fact));
      blocks.push(cards(shownPrimary.map((x) => card(x.rec))));
    }
    let shown = shownPrimary.length;
    let secondaryShown = 0;
    if (secondary.length && (primary.length === 0 || f.year)) {
      blocks.push(text(primary.length ? `More on “${topicWords(f)}”:` : `Nothing from ${f.year} on “${topicWords(f)}”, but here’s what I have:`));
      const sec = secondary.slice(0, Math.max(1, PER - shownPrimary.length > 0 ? PER - shownPrimary.length : 2));
      blocks.push(cards(sec.map((x) => card(x.rec))));
      secondaryShown = sec.length;
    }
    const order = primary.map((x) => x.rec.id).concat(secondary.map((x) => x.rec.id));
    const shownCount = shown + secondaryShown;
    const remaining = order.length - shownCount;
    const chips = [];
    if (remaining > 0) chips.push(act(`More (${remaining})`, 'more'));
    if (memory) chips.push(...facetChips(prep, f, all, memory));
    if (!memory) chips.push(...starterChips(4));
    else if (f.kinds.length || f.terms.length || f.year) chips.push(act('Start over', 'reset'));
    const shownIds = blocks.filter((b) => b.t === 'cards').flatMap((b) => b.cards.map((c) => c.id));
    return finish(state, blocks, chips, { f, ids: order, shown: shownCount, cards: shownIds, view: 'results' });
  }

  function fallback(state, f) {
    return finish(state, [text(S.FALLBACK[0]), text(S.FALLBACK[1])], [...starterChips(4), contactChip()], { view: 'home', cards: [] });
  }

  function more(state) {
    if (!state.ids.length || state.shown >= state.ids.length) {
      return finish(state, [text('That’s everything I have on that!')], [act('Start over', 'reset'), ...starterChips(3)], {});
    }
    const slice = state.ids.slice(state.shown, state.shown + PER).map((id) => prep.byId.get(id)).filter(Boolean);
    const shown = state.shown + slice.length;
    const remaining = state.ids.length - shown;
    const chips = [];
    if (remaining > 0) chips.push(act(`More (${remaining})`, 'more'));
    chips.push(act('Start over', 'reset'));
    return finish(state, [text('A few more:'), cards(slice.map(card))], chips, { shown, cards: slice.map((r) => r.id) });
  }

  function detail(state, id) {
    const rec = prep.byId.get(id);
    if (!rec) return fallback(state, state.f);
    const blocks = [text(rec.title)];
    const meta = [S.KIND_LABEL[rec.type], rec.venue, rec.date].filter(Boolean).join(' · ');
    if (meta) blocks.push(text(meta));
    if (rec.desc) blocks.push(text(rec.type === 'topic' ? rec.desc : String(rec.desc).replace(/\s+/g, ' ').trim().slice(0, 600)));
    if (rec.href) blocks.push(cards([{ id: rec.id, title: rec.href.startsWith('/') ? 'See it on the site' : 'Open it', meta: '', desc: '', href: rec.href }], { link: true }));
    const chips = [];
    if (state.ids.length) chips.push(act('Back to the list', 'list'));
    if (state.shown < state.ids.length) chips.push(act(`More (${state.ids.length - state.shown})`, 'more'));
    chips.push(act('Start over', 'reset'));
    return finish(state, blocks, chips, { view: 'detail', cards: [rec.id] });
  }

  function relist(state) {
    if (!state.ids.length) return greetAgain(state);
    const slice = state.ids.slice(0, Math.max(PER, Math.min(state.shown, state.ids.length))).map((id) => prep.byId.get(id)).filter(Boolean);
    return finish(state, [text('Back to the list:'), cards(slice.map(card))], [act('Start over', 'reset')], { view: 'results', cards: slice.map((r) => r.id) });
  }

  function greetAgain(state) {
    return finish(state, [text('What would you like to look at?')], starterChips(), { view: 'home', ids: [], shown: 0, cards: [], f: blank().f });
  }

  function hats(state) {
    const chips = S.PERSONAS.map((p) => act(p.label, `persona:${p.id}`));
    return finish(state, [text(S.HATS_LEAD)], chips, { view: 'hats' });
  }

  function persona(state, id) {
    const p = S.PERSONAS.find((x) => x.id === id);
    if (!p) return hats(state);
    if (p.id === 'outreach') return programsList(state);
    const chips = [...p.chips.map((c) => say(c.label, c.say)), act('Other hats', 'hats')];
    return finish(state, [text(p.blurb), cards([{ id: 'page-' + p.id, title: `The ${p.label} page`, meta: 'On this site', desc: '', href: p.page }], { link: true })], chips, { view: 'persona', cards: [] });
  }

  function programsList(state) {
    const blocks = [text(S.PROGRAMS_LEAD[0]), text(S.PROGRAMS_LEAD[1])];
    const progs = prep.programs;
    if (memory) {
      return finish(state, blocks, [...progs.map((p) => act(p.tag, `program:${p.id}`)), act('Other hats', 'hats')], { view: 'programs', cards: [] });
    }
    blocks.push(cards(progs.map((p) => ({ id: p.id, title: p.title, meta: p.tag, desc: oneLiner(p.text, 120), href: p.links[0]?.href ?? null }))));
    return finish(state, blocks, starterChips(4), { view: 'programs' });
  }

  function program(state, id) {
    const p = prep.programs.find((x) => x.id === id);
    if (!p) return programsList(state);
    const blocks = [text(`${p.title} (${p.tag})`), text(p.text), cards(p.links.map((l) => ({ id: p.id + l.label, title: l.label, meta: '', desc: '', href: l.href })), { link: true })];
    const chips = memory ? [act('Another program', 'programs'), act('Other hats', 'hats')] : starterChips(4);
    return finish(state, blocks, chips, { view: 'program', cards: [] });
  }

  function explainer(state, lines) {
    return finish(state, lines.map(text), [say('Talks about immunology', 'talks about immunology'), ...starterChips(3)], { view: 'home' });
  }

  function booking(state) {
    return finish(state, [text(S.BOOKING[0]), text(S.BOOKING[1]), cards([S.BOOKING_CARD], { link: true })], starterChips(4), { view: 'home' });
  }

  function applyAction(a, state) {
    const [kind, ...rest] = a.split(':');
    const val = rest.join(':');
    switch (kind) {
      case 'more': return more(state);
      case 'reset': return greetAgain(state);
      case 'list': return relist(state);
      case 'hats': return hats(state);
      case 'programs': return programsList(state);
      case 'program': return program(state, val);
      case 'persona': return persona(state, val);
      case 'item': return detail(state, val);
      case 'year': return resultsReply(state, { ...state.f, year: Number(val) }, 'year' + val);
      case 'kind': return resultsReply(state, { ...state.f, kinds: [val], venue: '' }, 'kind' + val);
      case 'venue': return resultsReply(state, { ...state.f, venue: normalize(val) }, 'venue' + val);
      case 'back': return back(state);
      default: return greetAgain(state);
    }
  }

  function back(state) {
    const prev = state.history[state.history.length - 1];
    if (!prev) return greetAgain(state);
    const restored = { ...prev, history: state.history.slice(0, -1), turn: state.turn + 1 };
    if (restored.view === 'results' && restored.ids.length) {
      const slice = restored.ids.slice(0, Math.max(PER, restored.shown)).map((id) => prep.byId.get(id)).filter(Boolean);
      return { blocks: [text('Back we go:'), cards(slice.map(card))], chips: [act('Start over', 'reset')], state: restored };
    }
    return { blocks: [text('Back we go! What would you like to look at?')], chips: starterChips(), state: restored };
  }

  const RE = {
    safety: /\b(should i (take|get|have|worry)|my (symptoms?|doctor|child|baby|kid|health)|diagnos|prescrib|dosage|am i (sick|immune|allergic)|do i have|is it safe|side effects?|treat my|cure for|medical advice)\b/,
    books: /\b(her book|a book|books|written a book|any book)\b/,
    book: /\b(book (her|aimee|a speaker)|booking|hire|invite|availab|engage|speaker for|speak (at|for) (my|our)|contact|email|e-mail|get in touch|reach out|consult|collaborat)\b/,
    who: /\b(who is|who are you|about aimee|about her|what does aimee do|what do you do|what does she do|bio|biograph|introduce|what s aimee|whats aimee|what is aimee)\b/,
    help: /\b(help|what can you|what do you know|how do (i|you) use|options|what can i ask)\b/,
    hi: /^(hi|hello|hey|hiya|yo|howdy|good (morning|afternoon|evening))\b/,
    thanks: /\b(thanks|thank you|thx|cheers)\b/,
    reset: /\b(start over|restart|reset|begin again|new search)\b/,
    back: /^(back|go back|previous|undo)$/,
    more: /^(more|another|another one|next|show more|others|more please|keep going|next one|more results)$|\b(show me more|any more|anything else|something else|other ones)\b/,
    explain: /\b(what (is|are|s) (a |an |the )?)(.+)/,
    outreach: /\b(outreach|kids|children|elementary|k-?12|young people|programs?)\b/,
  };
  const PROGRAM_RE = {
    tlas: /\b(tlas|think like a scientist)\b/,
    reach: /\b(reach program|raising environmental|reach)\b(?! out)/,
    echo: /\b(echo|exploring careers)\b/,
    start: /\b(start program|cancer research (education|experiences)|summer (science )?camps?)\b/,
  };
  const ORD = [[/\b(first|1st|top one|number one|#1)\b/, 0], [/\b(second|2nd|#2|number two)\b/, 1], [/\b(third|3rd|#3|number three)\b/, 2], [/\b(last|bottom one)\b/, -1]];

  function say_(input, state0) {
    const raw = String(input ?? '').trim();
    const state = memory ? state0 : blank();
    if (!raw) return greet();
    const n = normalize(raw);
    const words = n.split(' ').filter(Boolean);

    if (RE.reset.test(n)) return greetAgain(state);
    if (RE.hi.test(n) && words.length <= 3) return finish(state, S.GREETING.map(text), starterChips(), { view: 'home' });
    if (RE.thanks.test(n) && words.length <= 5) return finish(state, [text(pick(S.THANKS, hash(n)))], starterChips(4), {});
    if (RE.safety.test(n)) return finish(state, S.SAFETY.map(text), [say('Educational videos', 'educational videos'), contactChip()], { view: 'home' });
    if (memory && RE.back.test(n)) return back(state);
    if (memory && RE.more.test(n)) return more(state);

    // "tell me about the second one"
    if (memory && state.cards.length && words.length <= 8) {
      for (const [re, idx] of ORD) {
        if (re.test(n)) {
          const i = idx < 0 ? state.cards.length - 1 : idx;
          if (state.cards[i]) return detail(state, state.cards[i]);
        }
      }
    }
    if (memory && state.view === 'detail' && /^(tell me more|more about it|more about that|go on|and)$/.test(n) && state.cards[0]) return detail(state, state.cards[0]);

    if (RE.help.test(n) && words.length <= 8) return finish(state, S.HELP.map(text), starterChips(), { view: 'home' });
    if (RE.books.test(n)) {
      const r = resultsReply(state, { kinds: ['article'], year: 0, terms: [], venue: '' }, 'books');
      return { ...r, blocks: [text('I haven’t found a book by Aimee. Her writing is here:'), ...r.blocks.slice(1)] };
    }
    if (RE.book.test(n)) return booking(state);
    if (RE.who.test(n) && !/\bwho is (the )?(host|she talking)/.test(n)) {
      if (/\b(b cell|dendritic|macrophage|t cell)\b/.test(n) || /who are you/.test(n)) return explainer(state, S.EXPLAINERS[0].lines);
      return hats(state);
    }

    // The outreach programs
    for (const [id, re] of Object.entries(PROGRAM_RE)) {
      if (re.test(n) && !/\b(to reach|reach out)\b/.test(n)) return program(state, id);
    }
    if (RE.outreach.test(n) && !/\b(talk|podcast|article|paper)\b/.test(n)) return programsList(state);

    // "what is a vaccine?"
    const em = n.match(RE.explain);
    if (em) {
      const ex = S.EXPLAINERS.find((e) => e.words.some((w) => normalize(em[4]).includes(normalize(w))));
      if (ex) return explainer(state, ex.lines);
    }

    const parsed = parse(raw);

    // A hat on its own: "educator", "immunologist"
    if (!parsed.terms.length && !parsed.kinds.length && !parsed.year) {
      for (const p of S.PERSONAS) if (p.words.some((w) => n === w || n === `the ${w}`)) return persona(state, p.id);
    }
    if (words.length <= 3 && parsed.terms.length === 1 && !parsed.kinds.length && !parsed.year) {
      const w = parsed.terms[0].word;
      for (const p of S.PERSONAS) if (p.words.includes(w)) return persona(state, p.id);
    }

    // Refine the last search: "2024", "just the talks", or a topic added to a kind ("talks" then "vaccines")
    let f = { kinds: parsed.kinds, year: parsed.year, terms: dedupeTerms(parsed.terms), venue: '' };
    let merged = false;
    if (memory && state.view === 'results') {
      const prior = state.f;
      if (!parsed.terms.length && (parsed.year || parsed.kinds.length)) {
        f = { kinds: parsed.kinds.length ? parsed.kinds : prior.kinds, year: parsed.year || prior.year, terms: prior.terms, venue: prior.venue };
        merged = true;
      } else if (parsed.terms.length && !parsed.kinds.length && prior.kinds.length && !prior.terms.length) {
        f = { kinds: prior.kinds, year: parsed.year || prior.year, terms: dedupeTerms(parsed.terms), venue: '' };
        merged = true;
      }
    }
    if (merged && !hasResults(f)) f = { kinds: parsed.kinds, year: parsed.year, terms: dedupeTerms(parsed.terms), venue: '' };
    if (!f.terms.length && !f.kinds.length && !f.year) return fallback(state, f);
    return resultsReply(state, f, n);
  }

  return {
    greet,
    say: say_,
    act: (a, state) => applyAction(a, memory ? state : blank()),
    initialState: blank,
    stats: () => ({ records: prep.recs.length }),
  };
}
