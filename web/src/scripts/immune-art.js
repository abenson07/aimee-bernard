// Cartoon cell and pathogen art (inline SVG) plus per-kind settings, shared by the
// footer game (immune-game.js) and the mission-text swipe game (immune-swipe.js).
// ---------- Art ----------
export const OUT = '#1d1a2e';
const eyes = (cx, cy, gap, r, mood) => {
  const brow = mood === 'mean'
    ? `<path d="M${cx - gap - r * 1.3} ${cy - r * 2.1} L${cx - gap + r * 1.2} ${cy - r * 1.1}" stroke="${OUT}" stroke-width="${r * 0.8}" stroke-linecap="round"/>
       <path d="M${cx + gap + r * 1.3} ${cy - r * 2.1} L${cx + gap - r * 1.2} ${cy - r * 1.1}" stroke="${OUT}" stroke-width="${r * 0.8}" stroke-linecap="round"/>`
    : '';
  const eye = (x) => `<ellipse cx="${x}" cy="${cy}" rx="${r}" ry="${r * 1.25}" fill="${OUT}"/><circle cx="${x + r * 0.35}" cy="${cy - r * 0.45}" r="${r * 0.38}" fill="#fff"/>`;
  return brow + eye(cx - gap) + eye(cx + gap);
};
const grin = (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w} ${cy}" fill="${OUT}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M${cx - w * 0.55} ${cy + 2} l${w * 0.28} ${w * 0.3} l${w * 0.28} ${-w * 0.3} M${cx + 2} ${cy + 2} l${w * 0.28} ${w * 0.3} l${w * 0.28} ${-w * 0.3}" fill="#fff"/>`;
const smile = (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.8} ${cx + w} ${cy}" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>`;
const blush = (cx, cy, gap, c) => `<ellipse cx="${cx - gap}" cy="${cy}" rx="9" ry="5" fill="${c}" opacity=".55"/><ellipse cx="${cx + gap}" cy="${cy}" rx="9" ry="5" fill="${c}" opacity=".55"/>`;
const shine = (cx, cy, r) => `<ellipse cx="${cx - r * 0.38}" cy="${cy - r * 0.45}" rx="${r * 0.28}" ry="${r * 0.16}" transform="rotate(-35 ${cx - r * 0.38} ${cy - r * 0.45})" fill="#fff" opacity=".55"/>`;
const ring = (n, fn) => Array.from({ length: n }, (_, i) => fn((i / n) * Math.PI * 2, i)).join('');
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${body}</svg>`;

export const ART = {
  flu: svg(`
    ${ring(16, (a, i) => {
      const x1 = 100 + Math.cos(a) * 58, y1 = 100 + Math.sin(a) * 58;
      const x2 = 100 + Math.cos(a) * 84, y2 = 100 + Math.sin(a) * 84;
      const cap = i % 2
        ? `<circle cx="${x2}" cy="${y2}" r="8" fill="#ffb347" stroke="${OUT}" stroke-width="4"/>`
        : `<rect x="${x2 - 8}" y="${y2 - 6}" width="16" height="12" rx="3" transform="rotate(${(a * 180) / Math.PI + 90} ${x2} ${y2})" fill="#7ee0c3" stroke="${OUT}" stroke-width="4"/>`;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${OUT}" stroke-width="5"/>${cap}`;
    })}
    <circle cx="100" cy="100" r="62" fill="#9a7cf0" stroke="${OUT}" stroke-width="6"/>
    <circle cx="100" cy="100" r="50" fill="#b39cff" opacity=".45"/>
    ${shine(100, 100, 62)}
    ${eyes(100, 94, 20, 8, 'mean')}${grin(100, 122, 20)}`),
  corona: svg(`
    ${ring(14, (a) => {
      const x1 = 100 + Math.cos(a) * 60, y1 = 100 + Math.sin(a) * 60;
      const x2 = 100 + Math.cos(a) * 82, y2 = 100 + Math.sin(a) * 82;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff9f8f" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="${x2}" cy="${y2}" rx="13" ry="9" transform="rotate(${(a * 180) / Math.PI + 90} ${x2} ${y2})" fill="#ff6b5e" stroke="${OUT}" stroke-width="4"/>`;
    })}
    <circle cx="100" cy="100" r="64" fill="#ff7a6b" stroke="${OUT}" stroke-width="6"/>
    ${ring(7, (a) => `<circle cx="${100 + Math.cos(a + 0.4) * 40}" cy="${100 + Math.sin(a + 0.4) * 40}" r="6" fill="#e0493c" opacity=".55"/>`)}
    ${shine(100, 100, 64)}
    ${eyes(100, 96, 21, 8, 'mean')}${grin(100, 124, 18)}`),
  rhino: svg(`
    <polygon points="${ring(6, (a) => `${100 + Math.cos(a) * 80},${100 + Math.sin(a) * 80} `)}" fill="#4cc7d6" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <polygon points="${ring(6, (a) => `${100 + Math.cos(a + Math.PI / 6) * 44},${100 + Math.sin(a + Math.PI / 6) * 44} `)}" fill="#7fe0ea" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    ${ring(6, (a) => `<line x1="${100 + Math.cos(a) * 80}" y1="${100 + Math.sin(a) * 80}" x2="${100 + Math.cos(a + Math.PI / 6) * 44}" y2="${100 + Math.sin(a + Math.PI / 6) * 44}" stroke="${OUT}" stroke-width="4"/><line x1="${100 + Math.cos(a) * 80}" y1="${100 + Math.sin(a) * 80}" x2="${100 + Math.cos(a - Math.PI / 6) * 44}" y2="${100 + Math.sin(a - Math.PI / 6) * 44}" stroke="${OUT}" stroke-width="4"/>`)}
    ${shine(100, 100, 70)}
    ${eyes(100, 96, 18, 7, 'mean')}${grin(100, 118, 15)}`),
  ecoli: svg(`
    <path d="M150 100 C168 80, 176 120, 192 96" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
    <path d="M146 116 C166 112, 170 146, 190 136" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
    <path d="M146 84 C160 66, 178 78, 186 58" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
    <rect x="18" y="62" width="140" height="76" rx="38" fill="#8fd16a" stroke="${OUT}" stroke-width="6"/>
    <rect x="30" y="72" width="116" height="30" rx="15" fill="#b6e79a" opacity=".6"/>
    ${[40, 64, 92, 120].map((x) => `<line x1="${x}" y1="62" x2="${x - 4}" y2="52" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/><line x1="${x + 8}" y1="138" x2="${x + 12}" y2="148" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${eyes(78, 96, 17, 7, 'mean')}${grin(78, 118, 14)}`),
  staph: svg(`
    ${[[62, 64], [118, 58], [150, 104], [44, 116], [96, 110], [120, 150], [70, 156]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="30" fill="#f7c948" stroke="${OUT}" stroke-width="6"/>${shine(x, y, 30)}`).join('')}
    ${eyes(96, 106, 14, 6, 'mean')}${grin(96, 124, 11)}`),

  rbc: svg(`
    <ellipse cx="100" cy="104" rx="80" ry="66" fill="#b8323a" stroke="${OUT}" stroke-width="6"/>
    <ellipse cx="100" cy="100" rx="80" ry="66" fill="#e5484d" stroke="${OUT}" stroke-width="6"/>
    <ellipse cx="100" cy="102" rx="44" ry="34" fill="#c93a40"/>
    ${shine(100, 100, 74)}
    ${eyes(100, 98, 18, 7, 'happy')}${smile(100, 114, 12)}${blush(100, 112, 34, '#ffb3b8')}`),
  tcell: svg(`
    ${ring(26, (a) => `<circle cx="${100 + Math.cos(a) * 72}" cy="${100 + Math.sin(a) * 72}" r="9" fill="#6aa8ff" stroke="${OUT}" stroke-width="4"/>`)}
    <circle cx="100" cy="100" r="70" fill="#8ec0ff" stroke="${OUT}" stroke-width="6"/>
    <circle cx="112" cy="90" r="36" fill="#5b8fe0" opacity=".45"/>
    ${ring(4, (a) => {
      const x = 100 + Math.cos(a + 0.8) * 70, y = 100 + Math.sin(a + 0.8) * 70, d = (a + 0.8) * 180 / Math.PI + 90;
      return `<g transform="translate(${x} ${y}) rotate(${d})"><path d="M0 0 V-14 M0 -14 L-7 -24 M0 -14 L7 -24" stroke="${OUT}" stroke-width="4" stroke-linecap="round" fill="none"/></g>`;
    })}
    ${shine(100, 100, 70)}
    ${eyes(100, 98, 20, 8, 'happy')}${smile(100, 118, 14)}${blush(100, 116, 38, '#ffd0e0')}`),
  neutro: svg(`
    <circle cx="100" cy="100" r="78" fill="#f3d9ff" stroke="${OUT}" stroke-width="6"/>
    ${ring(22, (a) => `<circle cx="${100 + Math.cos(a) * (40 + (a * 37) % 26)}" cy="${100 + Math.sin(a) * (40 + (a * 37) % 26)}" r="3" fill="#c79be0"/>`)}
    <path d="M58 82 C52 58, 84 52, 88 72 C92 52, 124 52, 120 76 C140 64, 156 88, 138 102" fill="#a86fd1" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    ${shine(100, 100, 78)}
    ${eyes(100, 114, 20, 8, 'happy')}${smile(100, 134, 13)}${blush(100, 130, 38, '#ffb3d9')}`),

  antibody: svg(`
    <circle cx="100" cy="100" r="92" fill="#ffe27a" opacity=".35"/>
    <g stroke="${OUT}" stroke-width="6" stroke-linejoin="round">
      <rect x="86" y="96" width="28" height="84" rx="12" fill="#ffd23f"/>
      <rect x="86" y="96" width="28" height="84" rx="12" fill="none"/>
      <rect x="40" y="26" width="26" height="86" rx="12" transform="rotate(-38 53 69)" fill="#ffd23f"/>
      <rect x="134" y="26" width="26" height="86" rx="12" transform="rotate(38 147 69)" fill="#ffd23f"/>
      <rect x="26" y="36" width="16" height="52" rx="8" transform="rotate(-38 34 62)" fill="#fff3b0"/>
      <rect x="158" y="36" width="16" height="52" rx="8" transform="rotate(38 166 62)" fill="#fff3b0"/>
    </g>
    <circle cx="100" cy="98" r="10" fill="#fff3b0" stroke="${OUT}" stroke-width="5"/>`),
};

// `r` is the hit radius in design px (scaled per zone width).
export const KINDS = {
  flu:      { role: 'bad',   r: 40, juice: '#a88bff' },
  corona:   { role: 'bad',   r: 42, juice: '#ff7a6b' },
  rhino:    { role: 'bad',   r: 36, juice: '#4cc7d6' },
  ecoli:    { role: 'bad',   r: 44, juice: '#8fd16a' },
  staph:    { role: 'bad',   r: 42, juice: '#f7c948' },
  rbc:      { role: 'self',  r: 42, juice: '#e5484d' },
  tcell:    { role: 'self',  r: 42, juice: '#8ec0ff' },
  neutro:   { role: 'self',  r: 44, juice: '#d8a8f5' },
  antibody: { role: 'power', r: 38, juice: '#ffd23f' },
};
export const BAD = ['flu', 'corona', 'rhino', 'ecoli', 'staph'];
export const SELF = ['rbc', 'tcell', 'neutro'];
