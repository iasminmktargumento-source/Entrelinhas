/* Tinteiro — editor: modos normal, máquina de escrever, livro paginado e composição */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;

  /* ---------- manuscrito: ordem e numeração ---------- */
  const TEXT_TYPES = ['part', 'chapter', 'scene', 'doc'];
  T.MS = {
    flat(pid, parent = null, out = []){
      S().children(pid, parent, 'ms').forEach(it => { out.push(it); T.MS.flat(pid, it.id, out); });
      return out;
    },
    chapterNumber(item){
      if (!item) return 0;
      const chs = T.MS.flat(item.pid).filter(i => i.type === 'chapter');
      return chs.findIndex(c => c.id === item.id) + 1;
    },
    chapterOf(item){ let it = item; while (it && it.type !== 'chapter') it = it.parent ? S().get(it.parent) : null; return it; },
    // documentos de texto que formam este item (ele mesmo e/ou os filhos)
    docs(item){
      const out = [];
      const walk = (it) => {
        const kids = S().children(it.pid, it.id).filter(k => TEXT_TYPES.includes(k.type));
        if (!kids.length || (it.body && T.words(it.body) > 0)) out.push(it);
        kids.forEach(walk);
      };
      walk(item);
      return out;
    },
    words(pid){ return T.MS.flat(pid).reduce((a, i) => a + (i.meta?.words ?? T.words(i.body)), 0); },
    // junta a cena b no fim da cena a e apaga b (versões de b passam para a)
    join(aId, bId, sep){
      const a = S().get(aId), b = S().get(bId); if (!a || !b) return;
      let body = (a.body || '') + (sep || '') + (b.body || '');
      if (!sep) {
        // se a divisão caiu no meio de um parágrafo (sem pontuação final), cola os dois pedaços de novo
        const d = document.createElement('div'); d.innerHTML = (a.body || '') + '\u0000' + (b.body || '');
        const ps = [...d.querySelectorAll('p')]; const k = ps.findIndex(p => p.textContent.includes('\u0000'));
        const tmp = document.createElement('div'); tmp.innerHTML = a.body || ''; const lastA = [...tmp.querySelectorAll('p')].pop();
        const tmp2 = document.createElement('div'); tmp2.innerHTML = b.body || ''; const firstB = tmp2.querySelector('p');
        if (lastA && firstB && !/[.!?…:;"”»)\]—–-]\s*$/.test(lastA.textContent)) {
          lastA.innerHTML = lastA.innerHTML.replace(/<br>$/, '') + firstB.innerHTML; firstB.remove();
          body = tmp.innerHTML + tmp2.innerHTML;
        }
      }
      S().update(a.id, { body, meta: { words: T.words(body), comments: Object.assign({}, a.meta?.comments, b.meta?.comments) } });
      S().all(a.pid).filter(x => x.type === 'snapshot' && x.parent === b.id).forEach(x => S().update(x.id, { parent: a.id }, { silent: true }));
      if (T.Shell.closeTabsFor) T.Shell.closeTabsFor(b.id);
      S().remove(b.id); T.emit('tree-changed');
      if (T.Shell.open) T.Shell.open({ kind: 'doc', ref: a.parent && S().get(a.parent)?.type === 'chapter' ? a.parent : a.id });
    },
  };

  /* ---------- limpeza do HTML colado/gerado ---------- */
  const ALLOWED = { P: 1, B: 1, STRONG: 1, I: 1, EM: 1, MARK: 1, SPAN: 1, BR: 1, HR: 1, U: 1, S: 1, A: 1 };
  const keepAttr = (e, a) => (e.tagName === 'SPAN' && (a.name === 'class' || a.name === 'data-c')) || (e.tagName === 'A' && (a.name === 'data-p' || (a.name === 'class' && a.value === 'wl'))) || (e.tagName === 'P' && a.name === 'class' && /^(al-[lcrj]|in-[1-5]|fl-0)(\s+(al-[lcrj]|in-[1-5]|fl-0))*$/.test(a.value.trim())) || (e.tagName === 'P' && a.name === 'data-st' && /^(t1|t2|t3|sub)$/.test(a.value)) || (e.tagName === 'MARK' && a.name === 'data-hl' && /^[a-z]+$/.test(a.value));
  T.MS.keepAttr = keepAttr;
  function cleanSection(sec){
    // garante que tudo esteja dentro de <p>
    [...sec.childNodes].forEach(n => {
      if (n.nodeType === 3) { if (!n.textContent.trim()) { n.remove(); return; } const p = document.createElement('p'); sec.insertBefore(p, n); p.appendChild(n); }
      else if (n.nodeType === 1 && (n.tagName === 'DIV' || n.tagName === 'H2' || n.tagName === 'H3')) { const p = document.createElement('p'); p.innerHTML = n.innerHTML; sec.replaceChild(p, n); }
      else if (n.nodeType === 1 && !['P', 'HR'].includes(n.tagName)) { const p = document.createElement('p'); sec.insertBefore(p, n); p.appendChild(n); }
    });
    if (!sec.firstChild) sec.innerHTML = '<p><br></p>';
  }
  function serialize(sec){
    const c = sec.cloneNode(true);
    c.querySelectorAll('.reading,.hit').forEach(e => { if (e.tagName === 'SPAN' && !e.dataset.c) e.replaceWith(...e.childNodes); else e.classList.remove('reading', 'hit'); });
    c.querySelectorAll('*').forEach(e => { if (!ALLOWED[e.tagName] || (e.tagName === 'A' && !e.dataset.p)) e.replaceWith(...e.childNodes); else { [...e.attributes].forEach(a => { if (!keepAttr(e, a)) e.removeAttribute(a.name); }); } });
    let html = c.innerHTML.replace(/<p><br><\/p>$/, '').trim();
    return html;
  }
  function pasteAsText(e){
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const paras = text.replace(/\r/g, '').split(/\n{2,}|\n/).map(s => s.trim());
    const html = paras.map(s => s ? '<p>' + T.esc(s) + '</p>' : '').join('');
    if (paras.length <= 1) document.execCommand('insertText', false, text);
    else document.execCommand('insertHTML', false, html);
  }

  /* ---------- configuração de livro ---------- */
  const TRIMS = {
    '14x21': { name: '14 × 21 cm', w: 14, h: 21, mt: 2.0, mb: 2.3, mi: 2.0, mo: 1.6, wpp: 270 },
    '16x23': { name: '16 × 23 cm', w: 16, h: 23, mt: 2.2, mb: 2.5, mi: 2.2, mo: 1.8, wpp: 340 },
    '5.5x8.5': { name: '5,5 × 8,5 pol.', w: 13.97, h: 21.59, mt: 1.9, mb: 2.2, mi: 2.0, mo: 1.6, wpp: 290 },
    '6x9': { name: '6 × 9 pol.', w: 15.24, h: 22.86, mt: 2.0, mb: 2.3, mi: 2.2, mo: 1.7, wpp: 340 },
  };
  T.TRIMS = TRIMS;
  const bookCfg = (proj) => Object.assign({ trim: '14x21', pt: 11, lead: 1.42, dropcap: true, sink: 30, face: 'literata' }, proj?.meta?.book || {});
  // letras do modo Livro: Literata foi desenhada para ler na tela (mais nítida); Garamond é a clássica de livro impresso
  const BOOK_FACES = { literata: { name: 'Literata (nítida)', css: '"Literata", Georgia, serif', w: 400 }, garamond: { name: 'Garamond', css: '"EB Garamond", Garamond, serif', w: 500 }, georgia: { name: 'Georgia', css: 'Georgia, Gelasio, "Times New Roman", serif', w: 400, f: 'georgia' },
    times: { name: 'Times New Roman', css: '"Times New Roman", Tinos, Times, serif', w: 400, f: 'times' }, baskerville: { name: 'Libre Baskerville', css: '"Libre Baskerville", Baskerville, serif', w: 400, f: 'baskerville' },
    crimson: { name: 'Crimson Pro', css: '"Crimson Pro", Georgia, serif', w: 400, f: 'crimson' }, lora: { name: 'Lora', css: '"Lora", Georgia, serif', w: 400, f: 'lora' }, cormorant: { name: 'Cormorant Garamond', css: '"Cormorant Garamond", Garamond, serif', w: 500, f: 'cormorant' },
    palatino: { name: 'Palatino', css: '"Palatino Linotype", Palatino, "Book Antiqua", Domine, serif', w: 400, f: 'palatino' }, ptserif: { name: 'PT Serif', css: '"PT Serif", Georgia, serif', w: 400, f: 'ptserif' }, sourceserif: { name: 'Source Serif', css: '"Source Serif 4", Georgia, serif', w: 400, f: 'sourceserif' } };

  /* ---------- aparência do texto (zoom, fonte, tamanho) por modo ---------- */
  const PAPERS = [['', 'Padrão'], ['branco', 'Branco'], ['sepia', 'Sépia'], ['preto', 'Preto']];
  const PAPER_BG = { branco: '#ffffff', sepia: '#f3e9d2', preto: '#121214' };
  const INKS = [['#1b1a17', 'Preto'], ['#3d4148', 'Grafite'], ['#5b4636', 'Marrom sépia'], ['#1f3a68', 'Azul-tinta'], ['#6b1f2a', 'Vinho'], ['#24533f', 'Verde-musgo'], ['#e8e2d4', 'Creme'], ['#ffffff', 'Branco']];
  const VIEW_DEF = {
    normal: { zoom: 100, size: 18.5, font: 'write', lead: 1.72, justify: false, marks: true },
    tw: { zoom: 100, size: 17, font: 'type', lead: 1.85, justify: false, para: 'indent', light: true, marks: true },
    book: { zoom: 100 },
    compose: { zoom: 100, size: 19, font: 'write', lead: 1.75, justify: false, marks: true },
  };
  // fontes: [nome, css, grupo, família no Google Fonts (carrega só quando você escolhe)]
  const VAR = (f) => f + ':ital,wght@0,400..700;1,400..700';
  const FOUR = (f) => f + ':ital,wght@0,400;0,700;1,400;1,700';
  const FONTS = {
    times: ['Times New Roman', '"Times New Roman", Tinos, Times, serif', 'Clássicas (Word e Google Docs)', FOUR('Tinos')],
    arial: ['Arial', 'Arial, Arimo, Helvetica, sans-serif', 'Clássicas (Word e Google Docs)', FOUR('Arimo')],
    georgia: ['Georgia', 'Georgia, Gelasio, serif', 'Clássicas (Word e Google Docs)', VAR('Gelasio')],
    book: ['Garamond', 'var(--font-book)', 'Clássicas (Word e Google Docs)'],
    calibri: ['Calibri', 'Calibri, Carlito, sans-serif', 'Clássicas (Word e Google Docs)', FOUR('Carlito')],
    cambria: ['Cambria', 'Cambria, Caladea, serif', 'Clássicas (Word e Google Docs)', FOUR('Caladea')],
    verdana: ['Verdana', 'Verdana, "DejaVu Sans", Geneva, sans-serif', 'Clássicas (Word e Google Docs)'],
    tahoma: ['Tahoma', 'Tahoma, Verdana, sans-serif', 'Clássicas (Word e Google Docs)'],
    trebuchet: ['Trebuchet MS', '"Trebuchet MS", "Lucida Grande", sans-serif', 'Clássicas (Word e Google Docs)'],
    palatino: ['Palatino', '"Palatino Linotype", Palatino, "Book Antiqua", "Domine", serif', 'Clássicas (Word e Google Docs)', 'Domine:wght@400..700'],
    couriernew: ['Courier New', '"Courier New", Cousine, monospace', 'Clássicas (Word e Google Docs)', FOUR('Cousine')],
    comic: ['Comic Sans', '"Comic Sans MS", "Comic Neue", cursive', 'Clássicas (Word e Google Docs)', 'Comic+Neue:ital,wght@0,400;0,700;1,400'],
    write: ['Literata', 'var(--font-write)', 'Serifadas para livro'],
    lora: ['Lora', '"Lora", Georgia, serif', 'Serifadas para livro', VAR('Lora')],
    merriweather: ['Merriweather', '"Merriweather", Georgia, serif', 'Serifadas para livro', FOUR('Merriweather')],
    crimson: ['Crimson Pro', '"Crimson Pro", Georgia, serif', 'Serifadas para livro', VAR('Crimson+Pro')],
    baskerville: ['Libre Baskerville', '"Libre Baskerville", Baskerville, serif', 'Serifadas para livro', 'Libre+Baskerville:ital,wght@0,400;0,700;1,400'],
    cormorant: ['Cormorant Garamond', '"Cormorant Garamond", Garamond, serif', 'Serifadas para livro', VAR('Cormorant+Garamond')],
    playfair: ['Playfair Display', '"Playfair Display", Georgia, serif', 'Serifadas para livro', VAR('Playfair+Display')],
    ptserif: ['PT Serif', '"PT Serif", Georgia, serif', 'Serifadas para livro', FOUR('PT+Serif')],
    sourceserif: ['Source Serif', '"Source Serif 4", Georgia, serif', 'Serifadas para livro', VAR('Source+Serif+4')],
    spectral: ['Spectral', '"Spectral", Georgia, serif', 'Serifadas para livro', FOUR('Spectral')],
    alegreya: ['Alegreya', '"Alegreya", Georgia, serif', 'Serifadas para livro', VAR('Alegreya')],
    display: ['Instrument Serif', 'var(--font-display)', 'Serifadas para livro'],
    fell: ['IM Fell (antiga)', '"IM Fell English", Georgia, serif', 'Serifadas para livro'],
    ui: ['Instrument Sans', 'var(--font-ui)', 'Sem serifa'],
    roboto: ['Roboto', '"Roboto", Arial, sans-serif', 'Sem serifa', VAR('Roboto')],
    opensans: ['Open Sans', '"Open Sans", Arial, sans-serif', 'Sem serifa', VAR('Open+Sans')],
    lato: ['Lato', '"Lato", Arial, sans-serif', 'Sem serifa', FOUR('Lato')],
    montserrat: ['Montserrat', '"Montserrat", Arial, sans-serif', 'Sem serifa', VAR('Montserrat')],
    nunito: ['Nunito', '"Nunito", Arial, sans-serif', 'Sem serifa', VAR('Nunito')],
    poppins: ['Poppins', '"Poppins", Arial, sans-serif', 'Sem serifa', FOUR('Poppins')],
    raleway: ['Raleway', '"Raleway", Arial, sans-serif', 'Sem serifa', VAR('Raleway')],
    sourcesans: ['Source Sans', '"Source Sans 3", Arial, sans-serif', 'Sem serifa', VAR('Source+Sans+3')],
    type: ['Special Elite', 'var(--font-type)', 'Máquina de escrever'],
    courier: ['Courier Prime', '"Courier Prime", "Courier New", monospace', 'Máquina de escrever'],
    cinzel: ['Cinzel (títulos)', '"Cinzel", serif', 'Especiais'],
  };
  T.FONTS = FONTS;
  const fontLoaded = new Set();
  T.loadFont = (k) => {
    const f = FONTS[k]; if (!f || !f[3] || fontLoaded.has(k)) return; fontLoaded.add(k);
    document.head.appendChild(h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=' + f[3] + '&display=swap' }));
  };
  // lista de fontes agrupada, cada nome escrito na própria letra
  T.fontSelect = (cur, onChange, opts = {}) => {
    const groups = {}; Object.entries(FONTS).forEach(([k, f]) => { (groups[f[2]] = groups[f[2]] || []).push([k, f]); });
    const sel = h('select.select.font-sel', { 'aria-label': 'Fonte' },
      opts.keep ? h('option', { value: 'keep' }, opts.keep) : null,
      ...Object.entries(groups).map(([g, list]) => h('optgroup', { label: g }, list.map(([k, f]) => h('option', { value: k, selected: k === cur, style: { fontFamily: f[1] } }, f[0])))));
    const paint = () => { const f = FONTS[sel.value]; sel.style.fontFamily = f ? f[1] : ''; if (f) T.loadFont(sel.value); };
    sel.onchange = () => { paint(); onChange && onChange(sel.value); };
    if (cur) { T.loadFont(cur); setTimeout(paint, 0); }
    return sel;
  };
  T.FONTS = FONTS;
  const view = (m) => Object.assign({}, VIEW_DEF[m], (S().prefs().view || {})[m]);
  const setView = (m, patch) => { const all = Object.assign({}, S().prefs().view); all[m] = Object.assign({}, view(m), patch); S().setPrefs({ view: all }); T.emit('view-changed', m); };
  T.EditorView = { get: view, set: setView };
  // aplica fonte/tamanho/entrelinha a um elemento de texto
  T.applyTextView = (el, v) => {
    T.loadFont(v.font); el.style.fontFamily = (FONTS[v.font] || FONTS.write)[1];
    el.style.fontSize = v.size + 'px';
    el.style.lineHeight = String(v.lead);
    el.style.textAlign = v.justify ? 'justify' : '';
    el.style.hyphens = el.style.webkitHyphens = v.justify ? 'auto' : '';
  };
  // painel “Aa”: zoom, tamanho, fonte, entrelinha, alinhamento
  T.typePanel = (anchor, m, opts = {}) => {
    const v = view(m);
    const stepper = (label, val, fmt, dec, inc) => h('div.tp-row', h('span.tp-l', label), h('div.tp-step', h('button.icon-btn.sm', { type: 'button', title: 'Diminuir', onclick: dec }, '−'), h('b.num', fmt(val)), h('button.icon-btn.sm', { type: 'button', title: 'Aumentar', onclick: inc }, '+')));
    const re = () => { pop.remove(); T.typePanel(anchor, m, opts); };
    const set = (patch) => { setView(m, patch); re(); };
    const fontSel = T.fontSelect(v.font || 'write', (k) => set({ font: k }));
    const segOf = (vals, cur, fn) => h('div.seg', vals.map(([k, l, t]) => { const b = h('button', { type: 'button', title: t || l, onclick: () => fn(k) }, l); if (k === cur) b.classList.add('on'); return b; }));
    const rows = [
      stepper('Zoom', v.zoom, x => x + '%', () => set({ zoom: Math.max(50, v.zoom - 10) }), () => set({ zoom: Math.min(220, v.zoom + 10) })),
    ];
    if (m === 'book') {
      const cfg = opts.bookCfg ? opts.bookCfg() : { pt: 11 };
      rows.push(stepper('Corpo', cfg.pt, x => String(x).replace('.', ',') + ' pt', () => opts.setBook({ pt: Math.max(9, cfg.pt - .5) }), () => opts.setBook({ pt: Math.min(15, cfg.pt + .5) })));
    } else {
      rows.push(stepper('Tamanho', v.size, x => String(x).replace('.', ',') + ' px', () => set({ size: Math.max(11, +(v.size - 1).toFixed(1)) }), () => set({ size: Math.min(40, +(v.size + 1).toFixed(1)) })),
        h('div.tp-row', h('span.tp-l', 'Fonte'), fontSel),
        h('div.tp-row', h('span.tp-l', 'Entrelinha'), segOf([[1.4, '1,4'], [1.6, '1,6'], [1.8, '1,8'], [2.1, '2,1']], [1.4, 1.6, 1.8, 2.1].reduce((a, b) => Math.abs(b - v.lead) < Math.abs(a - v.lead) ? b : a), (k) => set({ lead: k }))),
        h('div.tp-row', h('span.tp-l', 'Texto'), segOf([[false, 'Alinhado à esquerda'], [true, 'Justificado']], !!v.justify, (k) => set({ justify: k }))));
    }
    if (m !== 'compose') {
      const lum = (hex) => { const n = parseInt((hex || '#000').slice(1), 16); const c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
      const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const sw = (cls, title, on, fn, inner) => { const b = h('button.pp-sw' + cls, { type: 'button', title, 'aria-label': title, onclick: fn }, inner || null); if (on) b.classList.add('on'); return b; };
      rows.push(h('div.tp-row', h('span.tp-l', 'Fundo'), h('div.pp-row', PAPERS.map(([k, l]) => h('div.pp-opt', sw('.pg-' + (k || 'def'), 'Fundo ' + l.toLowerCase(), (v.paper || '') === k, () => {
        const patch = { paper: k };
        if (v.ink && k && contrast(v.ink, PAPER_BG[k]) < 3) { patch.ink = ''; T.toast('A cor das letras voltou para a automática, para continuar legível.'); }
        set(patch);
      }), h('span', l))))));
      const picker = h('input.pp-pick', { type: 'color', value: v.ink || '#1b1a17', title: 'Escolher outra cor', 'aria-label': 'Escolher outra cor para as letras' });
      picker.onchange = () => set({ ink: picker.value });
      rows.push(h('div.tp-row', h('span.tp-l', 'Letras'), h('div.pp-row.inks',
        sw('.ink-auto', 'Cor automática (combina com o fundo)', !v.ink, () => set({ ink: '' }), 'A'),
        INKS.map(([c, l]) => sw('', l, (v.ink || '').toLowerCase() === c, () => set({ ink: c }), h('i', { style: { background: c } }))),
        h('label.pp-sw.pp-custom', { title: 'Escolher outra cor' }, h('i', { style: { background: v.ink && !INKS.some(x => x[0] === v.ink.toLowerCase()) ? v.ink : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' } }), picker))));
    }
    if (m !== 'book') rows.push(h('div.tp-row', h('span.tp-l', 'Páginas'), h('label.mp-chk', h('input', { type: 'checkbox', checked: v.marks !== false, onchange: (e) => set({ marks: e.target.checked }) }), 'Mostrar onde cada página acaba (folha A4)')));
    if (opts.bg) rows.push(h('div.tp-row', h('span.tp-l', 'Fundo da tela'), h('button.btn.sm', { type: 'button', title: 'Cenas animadas, imagens ou vídeos atrás da página', onclick: (e) => opts.bg(anchor) }, icon('image'), opts.bgName())));
    if (m === 'tw') {
      rows.push(h('div.tp-row', h('span.tp-l', 'Parágrafo'), segOf([['indent', 'Recuo', 'Recuo na primeira linha'], ['space', 'Linha em branco', 'Uma linha vazia entre parágrafos'], ['both', 'Os dois'], ['none', 'Nenhum']], v.para, (k) => set({ para: k }))),
        h('div.tp-row', h('span.tp-l', 'Luz'), segOf([[true, 'Luz projetada ligada'], [false, 'Desligada']], v.light !== false, (k) => set({ light: k }))));
    }
    if (opts.align) rows.push(h('div.tp-row', h('span.tp-l', 'Parágrafo atual'), segOf([['l', '⟵', 'Esquerda'], ['c', '≡', 'Centralizado'], ['r', '⟶', 'Direita'], ['j', '☰', 'Justificado']], null, (k) => { opts.align(k); })));
    rows.push(h('div.tp-row', h('span.tp-l', ''), h('button.btn.sm', { type: 'button', title: 'Copia zoom, tamanho, entrelinha e alinhamento deste modo para Normal, Máquina, Livro e Composição', onclick: () => {
      const cur = view(m); const all = Object.assign({}, S().prefs().view);
      ['normal', 'tw', 'book', 'compose'].forEach(k => { if (k === m) return; const pt = k === 'book' ? { zoom: cur.zoom } : { zoom: cur.zoom, size: cur.size ?? VIEW_DEF[k].size, lead: cur.lead ?? VIEW_DEF[k].lead, justify: !!cur.justify }; all[k] = Object.assign({}, view(k), pt); });
      S().setPrefs({ view: all }); T.toast('Pronto: os outros modos usam os mesmos ajustes. Eles ficam guardados até você mudar.');
    } }, 'Usar nos outros modos')));
    rows.push(h('p.muted', { style: { margin: '4px 0 0', fontSize: '11.5px' } }, 'Seus ajustes ficam guardados até você mudar (cada modo tem os seus). Atalhos: Ctrl + e Ctrl − mudam o zoom; Ctrl 0 volta a 100%.'));
    const pop = T.popover(anchor, h('div.type-panel', h('b', { style: { fontSize: '13px' } }, m === 'compose' ? 'Texto e zoom' : 'Texto, cores e zoom'), ...rows));
    return pop;
  };

  /* ======================================================================= */
  T.Editor = {
    mount(root, tab, ctx){
      const item = S().get(tab.ref);
      if (!item) { root.appendChild(h('div.pane-empty', 'Este texto foi apagado.')); return { destroy(){} }; }
      const proj = S().get(item.pid);
      const prefs = S().prefs();
      let mode = tab.mode || prefs.defaultMode || 'normal';
      let docs = T.MS.docs(item);
      const before = new Map(); // id -> html salvo
      let spread = 0, ncols = 1, geo = null, sinkEnabled = true;
      let destroyed = false, inspectorOpen = false, reading = null, composeOn = false, bookInfo = '';

      const ed = h('div.ed');
      let rail = null;
      const scroll = h('div.ed-scroll');
      const prose = h('div.prose', { contenteditable: 'true', spellcheck: 'true', lang: 'pt-BR' });
      const tools = h('div.ed-tools.glass.lg');
      const status = h('div.ed-status.glass');
      const bgEl = h('div.ed-bg', { 'aria-hidden': 'true' }, h('div.ed-bg-host'), h('canvas.ed-bg-layer'), h('div.ed-bg-dim'));
      ed.append(bgEl, scroll, tools, status);
      root.appendChild(ed);
      const toolsObs = new ResizeObserver(() => { const hh = tools.offsetHeight; if (hh) { const prev = ed.style.getPropertyValue('--tools-h'); ed.style.setProperty('--tools-h', hh + 'px'); if (prev !== hh + 'px' && mode === 'book' && geo) layoutBook(); } });
      toolsObs.observe(tools);
      try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}

      /* ----- conteúdo ----- */
      function heading(){
        const first = docs[0];
        const ch = item.type === 'chapter' ? item : (first && T.MS.chapterOf(first));
        const isOpening = item.type === 'chapter' || (ch && first && S().children(ch.pid, ch.id)[0]?.id === first.id) || item.type === 'part';
        if (!ch && item.type !== 'part') return null;
        if (!isOpening) return null;
        const target = item.type === 'part' ? item : ch;
        const n = target.type === 'chapter' ? T.MS.chapterNumber(target) : 0;
        // se o próprio título já diz o que é ("Capítulo 3", "Prólogo", "III"), não repete o número em cima
        const selfNamed = /^\s*(cap[ií]tulo|chapter|pr[oó]logo|ep[ií]logo|interl[uú]dio|parte|\d{1,3}\b|[IVXLC]{1,7}\b)/i.test(target.title || '');
        return h('h1.ch-title', { contenteditable: 'false' }, n && !selfNamed ? h('span.ch-num', 'Capítulo ' + n) : (target.type === 'part' ? h('span.ch-num', 'Parte') : null), target.title || 'Sem título');
      }
      function render(){
        prose.innerHTML = '';
        const hd = heading(); if (hd) prose.appendChild(hd);
        docs.forEach((d, i) => {
          if (i > 0) {
            const prevDoc = docs[i - 1];
            const sep = h('div.scene-sep', { contenteditable: 'false' },
              h('button.sep-name', { type: 'button', title: 'Abrir só esta cena' , onclick: () => T.Shell.open({ kind: 'doc', ref: d.id }) }, d.title || 'Cena'),
              h('button.sep-x', { type: 'button', title: 'Tirar esta divisão: juntar com o texto de cima', 'aria-label': 'Tirar esta divisão', onclick: async (e) => {
                e.stopPropagation();
                if (!await T.confirm('Tirar esta divisão?', 'O texto de “' + (d.title || 'cena') + '” volta a continuar direto o texto de cima, como se nunca tivesse sido dividido.', 'Tirar divisão')) return;
                save.flush(); T.MS.join(prevDoc.id, d.id, ''); T.toast('Divisão retirada.');
              } }, icon('x')));
            prose.appendChild(sep);
          }
          const sec = h('section', { 'data-id': d.id });
          sec.innerHTML = d.body || '<p><br></p>';
          before.set(d.id, d.body || '');
          prose.appendChild(sec);
        });
        if (!docs.length) { prose.innerHTML = '<section data-id="' + item.id + '"><p><br></p></section>'; docs = [item]; before.set(item.id, item.body || ''); }
        if (rail) syncMarks();
        applyMode();
      }

      /* ----- gravação ----- */
      const save = T.debounce(() => {
        if (destroyed) return;
        let delta = 0;
        prose.querySelectorAll('section[data-id]').forEach(sec => {
          const id = sec.dataset.id; const it = S().get(id); if (!it) return;
          const html = serialize(sec);
          if (html !== (before.get(id) ?? '')) {
            const w = T.words(html); delta += w - (it.meta?.words ?? T.words(it.body));
            before.set(id, html);
            S().update(id, { body: html, meta: { words: w } }, { silent: true });
            T.Versions.auto(item.pid, id, html);
          }
        });
        // texto que saiu de dentro das seções (apagar entre cenas) volta para a seção anterior
        if (delta) T.emit('words-delta', { pid: item.pid, delta });
        T.emit('doc-saved', { pid: item.pid });
        updateStatus();
      }, 650);

      function normalize(){
        let lastSec = null;
        [...prose.childNodes].forEach(n => {
          if (n.nodeType === 1 && n.tagName === 'SECTION') { lastSec = n; return; }
          if (n.nodeType === 1 && (n.classList.contains('scene-sep') || n.classList.contains('ch-title'))) return;
          if (n.nodeType === 3 && !n.textContent.trim()) { n.remove(); return; }
          // nó solto: guarda na seção anterior (ou na primeira)
          const target = lastSec || prose.querySelector('section');
          if (target) target.appendChild(n);
        });
        prose.querySelectorAll('section').forEach(cleanSection);
        // se uma seção sumiu, ela fica vazia (a cena não é apagada)
        docs.forEach(d => { if (!prose.querySelector('section[data-id="' + d.id + '"]')) { const sec = h('section', { 'data-id': d.id }); sec.innerHTML = '<p><br></p>'; prose.appendChild(sec); } });
      }

      /* ----- ferramentas ----- */
      function seg(){
        const s = h('div.seg', { role: 'group', 'aria-label': 'Modo de escrita' });
        [['normal', 'Normal'], ['tw', 'Máquina'], ['book', 'Livro']].forEach(([m, l]) => {
          const b = h('button', { type: 'button', onclick: () => setMode(m) }, l); if (m === mode) b.classList.add('on'); s.appendChild(b);
        });
        return s;
      }
      function buildTools(){
        tools.innerHTML = '';
        const z = view(mode).zoom;
        // botões agrupados em menus para a barra caber numa linha só
        const menuBtn = (ic, label, title, items) => h('button.btn.sm.tool-menu', { type: 'button', title, onmousedown: (e) => { e.preventDefault(); keepSel(); }, onclick: (e) => T.menuAt(e.currentTarget, items()) }, icon(ic), h('span.lbl', label), h('span.caret', '▾'));
        const focusOn = !!T.Shell?.el?.classList.contains('focus');
        const cb = curBlock(); const curSt = cb?.dataset?.st || '';
        const stBtn = h('button.btn.sm.tool-menu.st-btn', { type: 'button', title: 'Tipo de parágrafo: texto normal, título ou subtítulo', onmousedown: (e) => { e.preventDefault(); keepSel(); }, onclick: (e) => T.menuAt(e.currentTarget, [
          { head: 'Este parágrafo é…' },
          ...PSTYLES.map(([k, l]) => ({ label: l, on: k === curSt, fn: () => { restoreSel(); setPStyle(k); } })),
          '-', { label: 'Guia do documento', desc: 'Lista os títulos ao lado, para pular entre eles', icon: 'list', on: !!S().prefs().outline, fn: () => toggleOutline() },
        ]) }, icon('text'), h('span.lbl', (PSTYLES.find(x => x[0] === curSt) || PSTYLES[0])[1]), h('span.caret', '▾'));
        const anOn = AN.len || AN.weak;
        const MODES = [['normal', 'Normal', 'text', 'Página simples, que vai rolando'], ['tw', 'Máquina de escrever', 'feather', 'Folha de papel, linha sempre no meio da tela'], ['book', 'Livro', 'book', 'Páginas de verdade, como o livro impresso']];
        const modeName = { normal: 'Normal', tw: 'Máquina', book: 'Livro' }[mode];
        const typeOpts = { bg: (a) => bgPicker(a), bgName: () => { const c = bgCfgOf(mode); return !c ? 'Nenhum' : c.bg.kind === 'scene' ? T.Scenes.get(c.bg.id).name : (c.bg.name || 'Meu fundo'); }, align: alignPara, bookCfg: () => bookCfg(S().get(item.pid)), setBook: (patch) => setBookCfg(patch) };
        const kit = T.typeKit(mode, false); const soundOn = kit && kit !== 'off';

        // 1. desfazer / refazer
        const ubtn = (ic, t, c) => h('button.btn.sm.icon-only', { type: 'button', title: t, 'aria-label': t, onmousedown: (e) => { e.preventDefault(); keepSel(); }, onclick: () => cmd(c) }, icon(ic));
        const undoGrp = h('div.ed-undo', { role: 'group', 'aria-label': 'Desfazer e refazer' }, ubtn('undo', 'Desfazer (Ctrl+Z)', 'undo'), ubtn('redo', 'Refazer (Ctrl+Y)', 'redo'));

        // 2. formatar o texto
        const fmtBtn = menuBtn('bold', 'Formatar', 'Negrito, itálico, sublinhado, pausa no capítulo, selecionar tudo', () => [
          { head: 'Letras' },
          { label: 'Negrito', icon: 'bold', key: 'Ctrl+B', fn: () => cmd('bold') },
          { label: 'Itálico', icon: 'italic', key: 'Ctrl+I', fn: () => cmd('italic') },
          { label: 'Sublinhado', icon: 'underline', key: 'Ctrl+U', fn: () => cmd('underline') },
          { head: 'Texto' },
          { label: 'Pausa no capítulo (⁂)', desc: 'Uma linha de respiro entre dois momentos', icon: 'orn', fn: () => insertBreak() },
          { label: 'Travessão automático', desc: 'Troca - por — enquanto você escreve', icon: 'edit', on: S().prefs().autoDash !== false, fn: () => { S().setPrefs({ autoDash: S().prefs().autoDash === false }); T.toast(S().prefs().autoDash !== false ? 'Travessão automático ligado.' : 'Travessão automático desligado.'); } },
          { label: 'Selecionar todo o texto', icon: 'selall', key: 'Ctrl+A', fn: () => selectAllText() },
          { label: 'Formatar o livro todo…', desc: 'Fonte, tamanho, alinhamento e recuo em todos os capítulos de uma vez', icon: 'book', fn: () => bookFormatModal() },
        ]);

        // 2b. alinhar e recuar
        const AL = [['l', 'Alinhar à esquerda', 'alignl', 'Ctrl+Shift+L'], ['c', 'Centralizar', 'alignc', 'Ctrl+Shift+E'], ['r', 'Alinhar à direita', 'alignr', ''], ['j', 'Justificar', 'alignj', '']];
        const ca = curAlign();
        const alBtn = menuBtn((AL.find(a => a[0] === ca) || AL[0])[2], 'Alinhar', 'Alinhar, justificar e recuar o parágrafo', () => [
          { head: 'Alinhamento do parágrafo' },
          ...AL.map(([k, l, ic, key]) => ({ label: l, icon: ic, key: key || undefined, on: k === ca, fn: () => { restoreSel(); alignPara(k); buildTools(); } })),
          { head: 'Recuo' },
          { label: 'Aumentar recuo', desc: 'Afasta o parágrafo da margem esquerda', icon: 'indentin', key: 'Ctrl+]', fn: () => { restoreSel(); indentPara(1); } },
          { label: 'Diminuir recuo', desc: 'Traz o parágrafo de volta para a margem', icon: 'indentout', key: 'Ctrl+[', fn: () => { restoreSel(); indentPara(-1); } },
          { label: 'Recuo da primeira linha', desc: 'O espacinho no começo do parágrafo', icon: 'firstline', on: !(curBlock()?.classList?.contains('fl-0')), fn: () => { restoreSel(); toggleFirstLine(); } },
          '-', { label: 'Aplicar no livro todo…', desc: 'Alinhar ou recuar todos os capítulos de uma vez', icon: 'book', fn: () => bookFormatModal() },
        ]);
        alBtn.classList.add('al-btn');
        // 3. como ver a página
        const verBtn = menuBtn('eye', 'Ver: ' + modeName, 'Jeito de escrever (normal, máquina, livro), foco, zoom, letras, cores e fundo', () => {
          const btn = verBtn; const single = !!view('book').single;
          return [
            { head: 'Jeito de escrever' },
            ...MODES.map(([m, l, ic, d]) => ({ label: l, desc: d, icon: ic, on: m === mode, fn: () => setMode(m) })),
            ...(mode === 'book' ? [{ head: 'Páginas do livro' },
              { label: 'Uma página por vez', on: single, fn: () => { if (!single) { const col = geo ? (OR() ? spread * 2 - (spread > 0 ? 1 : 0) : spread * 2) : 0; setView('book', { single: true }); go(Math.max(0, col), false); } } },
              { label: 'Duas páginas lado a lado', on: !single, fn: () => { if (single) { const sp = OR() ? Math.floor((spread + 1) / 2) : Math.floor(spread / 2); setView('book', { single: false }); go(sp, false); } } },
              { label: 'Formato do livro…', desc: 'Tamanho da página, margens, letra', icon: 'gear', fn: () => bookSettings(btn) }] : []),
            ...(mode === 'tw' ? [{ head: 'Máquina de escrever' }, { label: 'Luz sobre o papel', icon: 'sun', on: view('tw').light !== false, fn: () => { const lo = view('tw').light !== false; setView('tw', { light: !lo }); } }] : []),
            { head: 'Tela' },
            { label: 'Modo foco', desc: 'Esconde tudo, fica só o texto (Esc sai)', icon: 'focus', on: focusOn, fn: () => T.emit('focus-mode') },
            { label: 'Modo composição', desc: 'Escrever sobre uma imagem ou vídeo em tela cheia', icon: 'image', fn: () => openCompose() },
            { label: 'Ver todas as páginas', desc: 'Miniaturas lado a lado; toque numa para ir até ela', icon: 'grid', fn: () => pagesOverview() },
            { head: 'Aparência' },
            { label: 'Letras e cores…', desc: 'Tamanho, fonte, alinhamento, cor do papel', icon: 'type', fn: () => T.typePanel(btn, mode, typeOpts) },
            { label: 'Fundo atrás da página…', desc: 'Cenas, imagens ou vídeos', icon: 'image', fn: () => bgPicker(btn) },
            { label: 'Som das teclas…', desc: soundOn ? 'Ligado: ' + T.Sound.KITS[kit] : 'Desligado', icon: soundOn ? 'sound' : 'mute', fn: () => T.soundPanel(btn, mode, () => buildTools()) },
          ];
        });

        // 4. revisar
        const revBtn = menuBtn('check', 'Revisar', 'Localizar, análise do texto, ortografia, comentários e versões', () => [
          { label: 'Localizar e substituir', icon: 'search', key: 'Ctrl+F', fn: () => findBar() },
          { head: 'Análise do texto' },
          { label: 'Tamanho das frases', desc: 'Pinta frases curtas, médias e longas', icon: 'chart', on: !!AN.len, fn: () => setAn('len') },
          { label: 'Verbo fraco + advérbio', desc: 'Marca “andou rapidamente” e parecidos', icon: 'spark', on: !!AN.weak, fn: () => setAn('weak') },
          ...(anOn ? [{ label: 'Desligar a análise', icon: 'x', fn: () => { AN.len = AN.weak = false; runAnalysis(); buildTools(); } }] : []),
          { head: 'Ortografia' },
          { label: SP.busy ? 'Revisando…' : 'Revisar ortografia', desc: 'Sublinha palavras com erro (usa o Claude)', icon: 'check', on: !!SP.on, fn: () => toggleSpell() },
          SP.on ? { label: 'Revisar de novo', icon: 'replace', fn: () => checkSpelling() } : null,
          { label: 'Meu dicionário…', desc: 'Palavras do seu mundo que não são erro', icon: 'book', fn: () => dictModal() },
          { head: 'Comentários' },
          { label: 'Comentar o trecho selecionado', icon: 'comment', key: 'Ctrl+Alt+M', fn: () => { restoreSel(); addComment(); } },
          { label: 'Comentários na lateral', icon: 'comment', on: S().prefs().cmtRail !== false, fn: () => { S().setPrefs({ cmtRail: S().prefs().cmtRail === false }); updateRail(); } },
          { label: 'Todos os comentários…', icon: 'list', fn: () => T.Comments.panel(item.pid, { here: railCtx }) },
          { head: 'Versões' },
          { label: 'Salvar uma versão agora', desc: 'Uma cópia deste capítulo como está', icon: 'camera', fn: () => snapshot() },
          { label: 'Ver versões salvas…', desc: 'Comparar e voltar para uma anterior', icon: 'history', fn: () => { save.flush(); T.Versions.browse(currentSectionItem(), () => rerender()); } },
        ]);
        if (anOn || SP.on) revBtn.classList.add('on');

        // 5. ferramentas
        const toolBtn = menuBtn('feather', 'Ferramentas', 'Onde parei, ditado e leitura em voz alta', () => [
          { label: 'Onde parei e marca-páginas…', desc: 'Volta ao ponto em que você escreveu por último', icon: 'bookmark', fn: () => bookmarkMenu(toolBtn) },
          { head: 'Voz' },
          { label: dictOn ? 'Parar o ditado' : 'Ditar', desc: 'Fale e o texto aparece no cursor (diga “vírgula”, “ponto”…)', icon: 'voice', on: dictOn, fn: () => toggleDictation() },
          { label: reading ? 'Parar a leitura' : 'Ler em voz alta', icon: 'sound', fn: () => readAloud() },
          { label: 'Vozes da narração…', icon: 'sound', fn: () => T.Narr.settings(item.pid, [...prose.querySelectorAll('section p')]) },
          { label: T.Narr.hasRec(currentSectionItem()) ? 'Minha voz neste capítulo ✓' : 'Gravar minha voz neste capítulo…', icon: 'voice', fn: () => T.Narr.recModal(currentSectionItem(), () => buildTools()) },
        ]);

        const zoomCtl = h('div.zoom-ctl', { role: 'group', 'aria-label': 'Zoom' },
          h('button', { type: 'button', title: 'Diminuir zoom (Ctrl −)', onclick: () => setView(mode, { zoom: Math.max(50, z - 10) }) }, '−'),
          h('button.zv', { type: 'button', title: 'Voltar para 100% (Ctrl 0)', onclick: () => setView(mode, { zoom: 100 }) }, z + '%'),
          h('button', { type: 'button', title: 'Aumentar zoom (Ctrl +)', onclick: () => setView(mode, { zoom: Math.min(220, z + 10) }) }, '+'));
        const ficha = h('button.btn.sm.ficha-btn' + (inspectorOpen ? '.on' : ''), { type: 'button', title: 'Ficha do capítulo: resumo, ponto de vista, status e comentários', onclick: () => toggleInspector() }, icon('info'), h('span.lbl', 'Ficha'));
        // avisos de algo ligado agora (para desligar com um clique)
        const live = [
          dictOn ? h('button.btn.sm.live-chip', { type: 'button', title: 'Parar o ditado', onclick: () => toggleDictation() }, h('span.dot'), 'Ditando · parar') : null,
          reading ? h('button.btn.sm.live-chip', { type: 'button', title: 'Parar a leitura em voz alta', onclick: () => readAloud() }, h('span.dot'), 'Lendo · parar') : null,
        ];
        const sep = () => h('span.tsep');
        tools.append(undoGrp, sep(), stBtn, fmtBtn, alBtn, sep(), verBtn, revBtn, toolBtn, ...live, sep(), zoomCtl, ficha);
      }
      // guarda a seleção do texto ao abrir um menu, para os comandos agirem sobre ela
      let savedRange = null;
      // seleciona só o texto do capítulo (sem o título fixo nem o resto da tela)
      function selectAllText(){
        const secs = prose.querySelectorAll('section'); const a = secs[0], z = secs[secs.length - 1];
        prose.focus({ preventScroll: true });
        const r = document.createRange();
        if (a) { r.setStart(a, 0); r.setEnd(z, z.childNodes.length); } else r.selectNodeContents(prose);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        T.toast('Todo o texto selecionado. Ctrl+C copia; Formatar aplica em tudo.');
      }
      function keepSel(){ const sel = getSelection(); savedRange = sel.rangeCount && prose.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null; }
      function restoreSel(){ if (savedRange) { prose.focus({ preventScroll: true }); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); savedRange = null; } else prose.focus({ preventScroll: true }); }
      function cmd(c){ restoreSel(); document.execCommand(c); normalize(); save(); }
      function alignPara(k){
        const sel = getSelection(); if (!sel.rangeCount || !prose.contains(sel.anchorNode)) { T.toast('Clique no parágrafo que quer alinhar.'); return; }
        const r = sel.getRangeAt(0);
        prose.querySelectorAll('section p').forEach(p => { if (r.intersectsNode(p)) { p.classList.remove('al-l', 'al-c', 'al-r', 'al-j'); if (k !== 'l') p.classList.add('al-' + k); if (!p.classList.length) p.removeAttribute('class'); } });
        save();
      }
      // recuo do parágrafo (como o Aumentar/Diminuir recuo do Google Docs)
      function selParas(){ const sel = getSelection(); if (!sel.rangeCount || !prose.contains(sel.anchorNode)) return []; const r = sel.getRangeAt(0); return [...prose.querySelectorAll('section p')].filter(p => r.intersectsNode(p)); }
      function indentPara(d){
        const ps = selParas(); if (!ps.length) { T.toast('Clique no parágrafo que quer recuar.'); return; }
        ps.forEach(p => { const cur = +((p.className.match(/\bin-(\d)\b/) || [])[1] || 0); const nx = Math.max(0, Math.min(5, cur + d)); p.classList.remove('in-' + cur); if (nx) p.classList.add('in-' + nx); if (!p.classList.length) p.removeAttribute('class'); });
        save();
      }
      function toggleFirstLine(){
        const ps = selParas(); if (!ps.length) { T.toast('Clique no parágrafo primeiro.'); return; }
        const on = !ps[0].classList.contains('fl-0');
        ps.forEach(p => { p.classList.toggle('fl-0', on); if (!p.classList.length) p.removeAttribute('class'); });
        save();
      }
      // formatar o livro todo (todos os capítulos de uma vez)
      function bookFormatModal(){
        const pid = item.pid; const v0 = view(mode);
        const st = { font: 'keep', size: 'keep', align: 'keep', centered: false, first: 'keep', clearIn: false };
        T.modal((box, close) => {
          const seg = (key, opts) => { const el = h('div.seg.bf-seg'); const draw = () => { el.innerHTML = ''; opts.forEach(([k, l]) => el.appendChild(h('button' + (st[key] === k ? '.on' : ''), { type: 'button', onclick: () => { st[key] = k; draw(); } }, l))); }; draw(); return el; };
          const fontSel = T.fontSelect('', (k) => { st.font = k; }, { keep: 'Não mudar (' + (FONTS[v0.font]?.[0] || 'Literata') + ')' });
          const sizeSel = h('select.select', { onchange: (e) => { st.size = e.target.value; } }, h('option', { value: 'keep' }, 'Não mudar (' + (v0.size || '') + ' px)'), ...[15, 16, 17, 18, 19, 20, 22, 24].map(n => h('option', { value: String(n) }, n + ' px')));
          const chk = (key, label) => h('label.mp-chk', h('input', { type: 'checkbox', onchange: (e) => { st[key] = e.target.checked; } }), label);
          const nCh = T.MS.flat(pid).filter(i => i.type === 'chapter').length;
          box.append(
            h('h2', 'Formatar o livro todo'),
            h('p.sub', 'Muda todos os capítulos de uma vez, até os anteriores (' + nCh + (nCh === 1 ? ' capítulo' : ' capítulos') + '). O que você escreveu não muda, só a aparência.'),
            h('div.bf-grid',
              h('span.bf-l', 'Fonte'), fontSel,
              h('span.bf-l', 'Tamanho da letra'), sizeSel,
              h('span.bf-l', 'Alinhamento'), h('div', seg('align', [['keep', 'Não mudar'], ['l', 'Esquerda'], ['j', 'Justificado'], ['c', 'Centralizado']]),
                h('div.bf-hint', chk('centered', 'Mudar também os parágrafos centralizados ou à direita (separadores, epígrafes…)'))),
              h('span.bf-l', 'Primeira linha'), seg('first', [['keep', 'Não mudar'], ['on', 'Com recuo'], ['off', 'Sem recuo']]),
              h('span.bf-l', 'Recuos'), chk('clearIn', 'Tirar os recuos de parágrafo (voltar todos para a margem)')),
            h('p.muted', { style: { fontSize: '12px', margin: '10px 0 0' } }, 'A fonte e o tamanho valem para os modos Normal, Máquina e Composição. No modo Livro, a letra muda em Ver ▾ › Formato do livro.'),
            h('div.modal-foot',
              h('button.btn', { type: 'button', onclick: () => close() }, 'Cancelar'),
              h('button.btn.primary', { type: 'button', onclick: () => { close(); applyBookFormat(st); } }, icon('check'), 'Aplicar no livro todo')));
        });
      }
      function applyBookFormat(st){
        const pid = item.pid; save.flush();
        if (st.font !== 'keep' || st.size !== 'keep') ['normal', 'tw', 'compose'].forEach(m => { const pt = {}; if (st.font !== 'keep') pt.font = st.font; if (st.size !== 'keep') pt.size = +st.size; setView(m, pt); });
        const undo = []; let n = 0;
        if (st.align !== 'keep' || st.first !== 'keep' || st.clearIn) {
          T.MS.flat(pid).filter(i => i.body).forEach(it => {
            const t = document.createElement('template'); t.innerHTML = it.body;
            t.content.querySelectorAll('p').forEach(p => {
              if (st.align !== 'keep') {
                const special = p.classList.contains('al-c') || p.classList.contains('al-r');
                if (st.centered || !special || st.align === 'c') { p.classList.remove('al-l', 'al-c', 'al-r', 'al-j'); if (st.align !== 'l') p.classList.add('al-' + st.align); }
              }
              if (st.first === 'on') p.classList.remove('fl-0'); else if (st.first === 'off') p.classList.add('fl-0');
              if (st.clearIn) [1, 2, 3, 4, 5].forEach(k => p.classList.remove('in-' + k));
              if (!p.classList.length) p.removeAttribute('class');
            });
            const html = t.innerHTML;
            if (html !== it.body) { undo.push([it.id, it.body]); S().update(it.id, { body: html }, { silent: true }); n++; }
          });
        }
        rerender(); buildTools();
        T.toast(n ? 'Pronto: ' + n + (n === 1 ? ' texto formatado.' : ' textos formatados.') : 'Pronto: aparência do livro atualizada.', undo.length ? { ms: 9000, action: { label: 'Desfazer', fn: () => { save.flush(); undo.forEach(([id, b]) => S().update(id, { body: b }, { silent: true })); rerender(); T.toast('Desfeito.'); } } } : {});
      }
      function curAlign(){ const b = curBlock(); const c = b && b.className || ''; return (c.match(/\bal-([lcrj])\b/) || [])[1] || 'l'; }
      function setBookCfg(patch){ const p = S().get(item.pid); S().update(item.pid, { meta: { book: Object.assign({}, bookCfg(p), patch) } }); if (bookEls) { bookEls.cfg = bookCfg(S().get(item.pid)); bookEls.tr = TRIMS[bookEls.cfg.trim]; prose.classList.toggle('dropcap', !!bookEls.cfg.dropcap); layoutBook(); } }
      function applyPaper(){
        const v = view(mode);
        if (v.paper) ed.dataset.paper = v.paper; else delete ed.dataset.paper;
        if (v.ink) { ed.dataset.ink = '1'; ed.style.setProperty('--ink-user', v.ink); } else { delete ed.dataset.ink; ed.style.removeProperty('--ink-user'); }
      }
      function applyView(){
        marksSoon();
        if (composeOn) return;
        applyPaper();
        if (mode === 'book') { layoutBook(); return; }
        const v = view(mode);
        T.applyTextView(prose, v);
        const box = mode === 'normal' ? prose.parentElement : mode === 'tw' ? prose.parentElement : null;
        if (box) box.style.zoom = v.zoom / 100;
        if (mode === 'tw') {
          prose.dataset.para = v.para || 'indent';
          if (twEls) { twEls[0].style.display = twEls[1].style.display = v.light === false ? 'none' : ''; }
          requestAnimationFrame(twFollow);
        }
      }
      const offFocus = T.on('focus-changed', () => { if (!destroyed) buildTools(); });
      const offTargets = T.on('targets-changed', (e) => { if (!destroyed && e?.pid === item.pid) updateStatus(); });
      const offView = T.on('view-changed', (m) => { if (m === mode) { applyView(); buildTools(); } });
      function insertBreak(){ restoreSel(); document.execCommand('insertHTML', false, '<hr><p><br></p>'); save(); }

      function updateStatus(){
        const total = docs.reduce((a, d) => a + (S().get(d.id)?.meta?.words ?? T.words(S().get(d.id)?.body)), 0);
        const p = S().get(item.pid); const dg = T.Goals ? T.Goals.daily(item.pid) : { goal: p?.meta?.targets?.session || 0 }; const tgt = dg.goal || 0;
        const sess = T.Session ? T.Session.today(item.pid) : 0;
        status.innerHTML = '';
        status.append(...[h('span.num', { title: 'Palavras neste capítulo' }, T.fmt(total) + ' palavras'),
          mode === 'book' ? h('span.num', { title: bookInfo }, 'pág. ' + pageLabel()) : null,
          mode !== 'book' && pages > 0 && view(mode).marks !== false ? h('span.num', { title: 'Páginas em folha A4 na largura atual' }, pages + (pages === 1 ? ' página' : ' páginas')) : null,
          mode === 'book' && bookInfo ? h('span.num.muted', bookInfo) : null,
          h('span.st-sep'),
          h('span.st-goal', { title: tgt ? 'Palavras escritas hoje, de ' + T.fmt(tgt) + ' da meta do dia' + (dg.auto ? ' (calculada para bater a meta do livro até ' + T.fmtDate(dg.deadline) + ')' : '') + ' (clique para ver as metas)' : 'Palavras escritas hoje (clique para definir uma meta do dia)', onclick: openGoals },
            h('b', 'Hoje'), h('span.num', T.fmt(sess) + (tgt ? ' / ' + T.fmt(tgt) : '')),
            tgt ? h('span.bar', h('i', { style: { width: Math.min(100, sess / tgt * 100) + '%' } })) : null),
          (() => { const tgB = Object.assign({ book: 90000 }, p?.meta?.targets || {}).book || 0;
            const tal = (p?.meta?.tallies || []).reduce((a, t) => a + (+t.n || 0), 0);
            const bk = T.MS.words(item.pid) + tal; const pc = tgB ? Math.min(100, Math.round(bk / tgB * 100)) : 0;
            return h('span.st-goal', { title: 'Palavras do livro inteiro' + (tgB ? ', de ' + T.fmt(tgB) + ' da meta total (' + pc + '%)' : '') + ' (clique para ver as metas)', onclick: openGoals },
              h('b', 'Livro'), h('span.num', T.fmt(bk) + (tgB ? ' / ' + T.fmt(tgB) : '')),
              tgB ? h('span.bar', h('i', { style: { width: pc + '%' } })) : null, tgB ? h('span.num.muted', pc + '%') : null); })()].filter(Boolean));
      }
      function openGoals(){ T.Shell.open({ kind: 'overview', ref: 'overview' });
      }

      /* ----- modos ----- */
      function setMode(m){ save.flush(); mode = m; tab.mode = m; T.emit('tab-changed', tab); applyMode(); buildTools(); setTimeout(() => placeCaretEnd(true), 30); }
      let twEls = null, bookEls = null, resizeObs = null;
      function applyMode(){
        ed.className = 'ed mode-' + mode;
        scroll.innerHTML = ''; scroll.onscroll = null;
        if (twEls) { twEls.forEach(e => e.remove()); twEls = null; }
        if (bookEls) { bookEls.stage.remove(); bookEls = null; }
        prose.className = 'prose'; prose.removeAttribute('style');
        scroll.style.display = '';
        if (mode === 'normal') {
          scroll.appendChild(h('div.pan', h('div.page', prose)));
        } else if (mode === 'tw') {
          const sheet = h('div.tw-sheet', { style: { paddingTop: '48vh', paddingBottom: '48vh' } }, prose);
          scroll.appendChild(h('div.pan', sheet));
          const glow = h('div.tw-glow'), glow2 = h('div.tw-glow2');
          const bar = h('div.tw-bar-wrap', h('div.tw-bar'), h('div.tw-lamp'));
          twEls = [glow, glow2, bar, h('div.tw-hint', 'clac · clac · plim')];
          ed.append(...twEls);
          requestAnimationFrame(twFollow);
        } else if (mode === 'book') {
          scroll.style.display = 'none';
          buildBook();
        }
        applyView(); buildTools(); updateStatus(); updateRail();
        requestAnimationFrame(() => setupPan());
        applyBg(); setTimeout(marksSoon, 60); setTimeout(drawOutline, 80);
      }
      /* ----- rolagem horizontal: a página pode sair do centro ----- */
      let panBusy = false;
      const panEl = () => mode === 'book' ? bookEls?.stage : scroll;
      function panPx(){ return Math.round(Math.max(120, ed.clientWidth * .38)); }
      function setupPan(){
        const el = panEl(); if (!el || composeOn) return;
        const P = panPx(); ed.style.setProperty('--pan', P + 'px');
        const off = (S().prefs().pan || {})[mode] || 0;
        panBusy = true; el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2 + off); requestAnimationFrame(() => { panBusy = false; });
        if (!el._panOn) { el._panOn = true; el.addEventListener('scroll', () => { if (panBusy) return; savePan(); updatePanBtn(); }, { passive: true }); }
        updatePanBtn();
      }
      const savePan = T.debounce(() => { const el = panEl(); if (!el || destroyed) return; const off = Math.round(el.scrollLeft - (el.scrollWidth - el.clientWidth) / 2); const all = Object.assign({}, S().prefs().pan); all[mode] = Math.abs(off) < 4 ? 0 : off; S().setPrefs({ pan: all }); }, 400);
      let panBtn = null;
      function updatePanBtn(){
        const el = panEl(); if (!el) return;
        const off = el.scrollLeft - (el.scrollWidth - el.clientWidth) / 2;
        if (Math.abs(off) > 6) {
          if (!panBtn) { panBtn = h('button.btn.sm.glass.pan-center', { type: 'button', title: 'Voltar a página para o centro', onclick: () => { const e2 = panEl(); if (!e2) return; const all = Object.assign({}, S().prefs().pan); all[mode] = 0; S().setPrefs({ pan: all }); panBusy = true; e2.scrollLeft = (e2.scrollWidth - e2.clientWidth) / 2; requestAnimationFrame(() => { panBusy = false; updatePanBtn(); }); } }, h('span', '⇔'), 'Centralizar página'); }
          if (!panBtn.isConnected) ed.appendChild(panBtn);
        } else if (panBtn) panBtn.remove();
      }

      /* ----- localizar e substituir dentro do texto aberto ----- */
      let fb = null;
      function findBar(initial){
        if (fb) { fb.q.focus(); fb.q.select(); return; }
        const sel0 = getSelection(); const pre = initial ?? (sel0.rangeCount && prose.contains(sel0.anchorNode) ? sel0.toString().trim() : '');
        const q = h('input.input.fb-q', { placeholder: 'Localizar…', 'aria-label': 'Localizar', value: pre.length < 80 ? pre : '' });
        const rp = h('input.input.fb-r', { placeholder: 'Substituir por…', 'aria-label': 'Substituir por' });
        const cnt = h('span.fb-n.num');
        const opt = { case: false, word: false };
        const tg = (k, label, title) => { const b = h('button.fb-t', { type: 'button', title, 'aria-pressed': 'false', onclick: () => { opt[k] = !opt[k]; b.classList.toggle('on', opt[k]); b.setAttribute('aria-pressed', String(opt[k])); run(); } }, label); return b; };
        let hits = [], cur = -1;
        const hl = (window.CSS && CSS.highlights && window.Highlight) ? { all: new Highlight(), one: new Highlight() } : null;
        function clearHl(){ if (hl) { hl.all.clear(); hl.one.clear(); CSS.highlights.delete('fb-all'); CSS.highlights.delete('fb-one'); } }
        function run(keep){
          hits = []; const term = q.value; clearHl();
          if (term) {
            const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(opt.word ? '(?<![\\p{L}\\p{N}])' + esc + '(?![\\p{L}\\p{N}])' : esc, 'gu' + (opt.case ? '' : 'i'));
            const w = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT); let t;
            while ((t = w.nextNode())) { if (t.parentElement.closest('.scene-sep, .cmt-rail')) continue; re.lastIndex = 0; let m; while ((m = re.exec(t.data))) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length); hits.push(r); if (!m[0].length) re.lastIndex++; } }
          }
          if (hl) { hits.forEach(r => hl.all.add(r)); CSS.highlights.set('fb-all', hl.all); }
          if (!keep) { const caret = getSelection().rangeCount ? getSelection().getRangeAt(0) : null; cur = hits.length ? Math.max(0, caret ? hits.findIndex(r => r.compareBoundaryPoints(Range.START_TO_START, caret) >= 0) : 0) : -1; }
          else cur = Math.min(cur, hits.length - 1);
          show(false);
        }
        function show(go){
          cnt.textContent = !q.value ? '' : hits.length ? (cur + 1) + ' de ' + hits.length : 'nada';
          cnt.classList.toggle('none', !!q.value && !hits.length);
          if (hl) { hl.one.clear(); if (hits[cur]) { hl.one.add(hits[cur]); CSS.highlights.set('fb-one', hl.one); } }
          if (go && hits[cur]) reveal(hits[cur]);
        }
        function reveal(r){
          const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r.cloneRange());
          if (composeOn) { const rr = r.getBoundingClientRect(); composeEls?.sc && (composeEls.sc.scrollTop += rr.top - innerHeight * .4); }
          else if (mode === 'book') bookFollowCaret();
          else if (mode === 'tw') twFollow();
          else { const er = scroll.getBoundingClientRect(), rr = r.getBoundingClientRect(); if (rr.top < er.top + 80 || rr.bottom > er.bottom - 60) scroll.scrollTop += rr.top - er.top - er.height * .4; }
        }
        const step = (d) => { if (!hits.length) return; cur = (cur + d + hits.length) % hits.length; show(true); };
        function replaceOne(){
          if (!hits[cur]) return; const r = hits[cur];
          prose.focus({ preventScroll: true }); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
          document.execCommand('insertText', false, rp.value); normalize(); save();
          run(true); if (hits.length) { if (cur >= hits.length) cur = 0; show(true); }
          fb.q.focus();
        }
        function replaceAll(){
          if (!hits.length) return; const n = hits.length;
          prose.focus({ preventScroll: true }); const sel = getSelection();
          for (let i = hits.length - 1; i >= 0; i--) { sel.removeAllRanges(); sel.addRange(hits[i]); document.execCommand('insertText', false, rp.value); }
          normalize(); save(); run(); T.toast(n + (n === 1 ? ' troca feita.' : ' trocas feitas.') + ' Ctrl+Z desfaz.');
        }
        q.addEventListener('input', () => run());
        q.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') close(); });
        rp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); if (e.ctrlKey || e.metaKey) replaceAll(); else replaceOne(); } if (e.key === 'Escape') close(); });
        const close = () => { clearHl(); el.remove(); fb = null; prose.focus({ preventScroll: true }); };
        const el = h('div.find-bar.glass.glass-strong', { role: 'search' },
          h('div.fb-line', icon('search'), q, cnt, tg('case', 'Aa', 'Diferenciar maiúsculas e minúsculas'), tg('word', 'ab|', 'Só a palavra inteira'),
            T.iconBtn('up', 'Anterior (Shift+Enter)', () => step(-1), '.sm'), T.iconBtn('down', 'Próximo (Enter)', () => step(1), '.sm'), T.iconBtn('x', 'Fechar (Esc)', () => close(), '.sm')),
          h('div.fb-line', h('span.fb-ic', '⇄'), rp, h('button.btn.sm', { type: 'button', onclick: replaceOne, title: 'Substituir este (Enter)' }, 'Substituir'), h('button.btn.sm', { type: 'button', onclick: replaceAll, title: 'Substituir todos neste texto (Ctrl+Enter)' }, 'Todos'),
            h('button.btn.sm.fb-all', { type: 'button', title: 'Procurar e substituir em todos os capítulos do livro', onclick: () => { Shell_open_find(q.value); } }, 'No livro todo')));
        (composeOn && composeEls ? composeEls.wrap : ed).appendChild(el);
        fb = { el, q, rerun: () => run(true), close };
        run(); show(true); setTimeout(() => { q.focus(); q.select(); }, 10);
      }
      const Shell_open_find = (term) => T.Shell.open({ kind: 'find', ref: 'find', q: term || '' });
      prose.addEventListener('input', () => { if (fb) fb.rerun(); });
      prose.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); e.stopPropagation(); findBar(); } if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); e.stopPropagation(); findBar(); setTimeout(() => fb && fb.el.querySelector('.fb-r').focus(), 30); } });

      /* ----- quebras de página (como no Google Docs), folha A4 na largura da página ----- */
      let pages = 0;
      function pageHost(){
        if (composeOn) return composeEls ? composeEls.wrap.querySelector('.c-paper') : null;
        if (mode === 'normal') return scroll.querySelector('.page');
        if (mode === 'tw') return scroll.querySelector('.tw-sheet');
        return null;
      }
      function drawMarks(){
        const m = composeOn ? 'compose' : mode;
        const host = pageHost();
        ed.querySelectorAll('.pg-marks').forEach(x => { if (!host || x.parentElement !== host) x.remove(); });
        if (composeEls) composeEls.wrap.querySelectorAll('.pg-marks').forEach(x => { if (x.parentElement !== host) x.remove(); });
        if (!host || view(m).marks === false) { if (host) host.querySelector(':scope > .pg-marks')?.remove(); pages = 0; return; }
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        let ov = host.querySelector(':scope > .pg-marks'); if (!ov) { ov = h('div.pg-marks', { 'aria-hidden': 'true' }); host.appendChild(ov); }
        const W = host.clientWidth; if (!W) return;
        const H = Math.round(W * 297 / 210);
        const top = m === 'normal' ? 0 : prose.offsetTop;
        const total = m === 'normal' ? host.scrollHeight : prose.offsetHeight + (m === 'compose' ? 0 : 0);
        const n = Math.max(1, Math.ceil((m === 'normal' ? total : total) / H));
        if (ov.childElementCount === n - 1 && ov.dataset.h === String(H) && ov.dataset.t === String(top)) { pages = n; return; }
        ov.dataset.h = H; ov.dataset.t = top; ov.innerHTML = '';
        for (let k = 1; k < n; k++) ov.appendChild(h('div.pg-mark', { style: { top: (top + k * H) + 'px' } }, h('span', 'fim da pág. ' + k), h('span', 'pág. ' + (k + 1))));
        pages = n;
      }
      const marksSoon = (() => { let r = 0; return () => { if (r) return; r = requestAnimationFrame(() => { r = 0; if (!destroyed) { const before = pages; drawMarks(); if (before !== pages) updateStatus(); } }); }; })();
      prose.addEventListener('input', marksSoon);

      /* ----- marca-página: onde parei e marcadores próprios ----- */
      // posição = { sid: id da cena/section, off: nº de caracteres desde o começo dela }
      function posOfCaret(){
        const sel = getSelection(); if (!sel.rangeCount || !prose.contains(sel.anchorNode)) return null;
        const n = sel.anchorNode; const sec = (n.nodeType === 1 ? n : n.parentElement).closest('section'); if (!sec) return null;
        const r = document.createRange(); r.setStart(sec, 0); r.setEnd(n, sel.anchorOffset);
        return { sid: sec.dataset.id, off: r.toString().length };
      }
      function rangeOfPos(pos){
        const sec = pos && prose.querySelector('section[data-id="' + pos.sid + '"]'); if (!sec) return null;
        const w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT); let left = pos.off, t, last = null;
        while ((t = w.nextNode())) { last = t; if (left <= t.length) { const r = document.createRange(); r.setStart(t, left); r.collapse(true); return r; } left -= t.length; }
        const r = document.createRange(); if (last) { r.setStart(last, last.length); } else { r.selectNodeContents(sec); r.collapse(false); } r.collapse(true); return r;
      }
      function snippetAt(pos){ const sec = prose.querySelector('section[data-id="' + pos.sid + '"]'); if (!sec) return ''; const t = sec.textContent; return t.slice(Math.max(0, pos.off - 40), pos.off).replace(/\s+/g, ' ').trim(); }
      function goToPos(pos, label){
        const r = rangeOfPos(pos); if (!r) { T.toast('Não achei esse ponto no texto (a cena pode ter sido apagada ou movida).'); return; }
        prose.focus({ preventScroll: true }); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        if (composeOn) { const rr = r.getBoundingClientRect(); composeEls?.sc && (composeEls.sc.scrollTop += rr.top - innerHeight * .4); }
        else if (mode === 'book') bookFollowCaret();
        else if (mode === 'tw') twFollow();
        else { const er = scroll.getBoundingClientRect(), rr = r.getBoundingClientRect(); scroll.scrollTop += rr.top - er.top - er.height * .4; }
        // destaque rápido no ponto
        const rect = r.getBoundingClientRect(); if (rect && (rect.top || rect.left)) { const flash = h('div.bm-flash', { style: { left: (rect.left - 6) + 'px', top: (rect.top - 4) + 'px', height: Math.max(18, rect.height + 8) + 'px' } }); document.body.appendChild(flash); setTimeout(() => flash.remove(), 1800); }
        if (label) T.toast(label);
      }
      /* ----- todas as páginas lado a lado (miniaturas em A4; toque numa para ir até ela) ----- */
      function pagesOverview(){
        save.flush();
        // mesma medida de página das marcas de fim de página (A4 na largura da folha do editor)
        const host = pageHost(); const hw = host ? host.clientWidth : 0; const pcw = prose.clientWidth - (parseFloat(getComputedStyle(prose).paddingLeft) || 0) - (parseFloat(getComputedStyle(prose).paddingRight) || 0);
        const PW = hw > 300 ? hw : 640, CW = hw > 300 && pcw > 200 && pcw < hw ? Math.round(pcw) : Math.round(PW * .78);
        const PAD = Math.round((PW - CW) / 2), PH = Math.round(PW * 297 / 210), G = 36, STEP = PW + G;
        const CH = PH - PAD * 2;
        const cs = getComputedStyle(prose);
        const mkFlow = () => {
          const f = h('div.prose.pv-flow');
          f.innerHTML = prose.innerHTML;
          f.querySelectorAll('[contenteditable]').forEach(x => x.removeAttribute('contenteditable'));
          f.querySelectorAll('.pg-marks, .bm-flash').forEach(x => x.remove());
          Object.assign(f.style, { width: CW + 'px', height: CH + 'px', columnWidth: CW + 'px', columnGap: (STEP - CW) + 'px', columnFill: 'auto', fontFamily: cs.fontFamily, fontSize: cs.fontSize, lineHeight: cs.lineHeight, textAlign: cs.textAlign, color: '#1d1b17' });
          return f;
        };
        // mede quantas páginas e onde cada uma começa
        const meas = mkFlow(); meas.style.position = 'fixed'; meas.style.left = '-99999px'; meas.style.top = '0'; meas.style.visibility = 'hidden';
        document.body.appendChild(meas);
        const ml = meas.getBoundingClientRect().left;
        const blocks = [...meas.querySelectorAll('section > p, section > h1, section > h2, section > h3, section > h4, h1.ch-title, section > div')];
        let last = 0; blocks.forEach(b => { const r = b.getBoundingClientRect(); if (r.width) last = Math.max(last, Math.floor((r.right - ml - 1) / STEP)); });
        const n = Math.max(1, last + 1, Math.round((meas.scrollWidth + (STEP - CW)) / STEP));
        const starts = new Array(n).fill(null);
        blocks.forEach(b => {
          const rects = [...b.getClientRects()]; rects.forEach((r, ri) => { const k = Math.floor((r.left - ml + 2) / STEP); if (k >= 0 && k < n && !starts[k]) starts[k] = { el: b, line: ri }; });
        });
        const posOf = (st) => {
          if (!st) return null; const sec = st.el.closest('section'); if (!sec) return null;
          const r = document.createRange(); r.setStart(sec, 0); r.setEnd(st.el, 0);
          return { sid: sec.dataset.id, off: r.toString().length };
        };
        const posList = starts.map(posOf);
        meas.remove();

        let scale = S().prefs().pvScale || .34;
        const wrapEl = h('div.pv-wrap');
        const grid = h('div.pv-grid');
        const close = () => { wrapEl.remove(); document.removeEventListener('keydown', onKey, true); };
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
        document.addEventListener('keydown', onKey, true);
        const zoom = h('input', { type: 'range', min: 18, max: 80, value: Math.round(scale * 100), 'aria-label': 'Tamanho das páginas' });
        zoom.oninput = () => { scale = +zoom.value / 100; S().setPrefs({ pvScale: scale }); draw(); };
        const words = T.countWords ? T.countWords(prose.textContent) : prose.textContent.split(/\s+/).filter(Boolean).length;
        wrapEl.append(h('div.pv-head.glass',
          h('b', item.title || 'Texto'), h('span.muted', n + (n === 1 ? ' página' : ' páginas') + ' · ' + T.fmt(words) + ' palavras · tamanho A4'),
          h('span.grow'), h('label.pv-zoom', icon('search'), zoom),
          h('button.btn.sm', { onclick: close }, icon('x'), 'Fechar')), h('div.pv-scroll', grid));
        function draw(){
          grid.innerHTML = '';
          const avail = Math.max(200, (wrapEl.clientWidth || innerWidth) - 48);
          const per = Math.max(1, Math.floor((avail + G * scale) / (STEP * scale)));
          const rows = Math.ceil(n / per);
          for (let r = 0; r < rows; r++) {
            const cnt = Math.min(per, n - r * per);
            const row = h('div.pv-row', { style: { width: (cnt * STEP - G) * scale + 'px', height: (PH + 30) * scale + 'px' } });
            const inner = h('div.pv-inner', { style: { width: (cnt * STEP - G) + 'px', height: (PH + 30) + 'px', transform: `scale(${scale})` } });
            for (let j = 0; j < cnt; j++) {
              const k = r * per + j;
              inner.appendChild(h('button.pv-page', { type: 'button', title: 'Ir para a página ' + (k + 1), style: { left: j * STEP + 'px', width: PW + 'px', height: PH + 'px' }, onclick: () => { const ps = posList[k]; close(); if (ps) goToPos(ps, 'Página ' + (k + 1)); } }));
              inner.appendChild(h('span.pv-num', { style: { left: j * STEP + 'px', width: PW + 'px', top: (PH + 6) + 'px', fontSize: Math.round(13 / Math.max(scale, .3)) + 'px' } }, String(k + 1)));
            }
            const vp = h('div.pv-vp', { style: { left: PAD + 'px', top: PAD + 'px', width: ((cnt - 1) * STEP + CW) + 'px', height: CH + 'px' } });
            const fl = mkFlow(); fl.style.transform = `translateX(${-r * per * STEP}px)`; vp.appendChild(fl);
            inner.appendChild(vp); row.appendChild(inner); grid.appendChild(row);
          }
        }
        document.getElementById('layer-modal').appendChild(wrapEl);
        requestAnimationFrame(draw);
      }
      // guarda sozinho onde você escreveu por último (por texto aberto)
      const saveLast = T.debounce(() => { if (destroyed) return; const pos = posOfCaret(); if (!pos) return; S().update(item.id, { meta: { lastPos: Object.assign(pos, { at: Date.now() }) } }, { silent: true }); }, 1200);
      prose.addEventListener('input', saveLast);
      function bookmarkMenu(btn){
        const it = S().get(item.id); const last = it?.meta?.lastPos; const marks = (it?.meta?.marks || []).slice().sort((a, b) => b.at - a.at);
        const go = (p, lb) => () => goToPos(p, lb);
        T.menuAt(btn, [
          { head: 'Marca-página' },
          last ? { label: 'Ir para onde parei · ' + T.relTime(last.at), icon: 'bookmark', fn: go(last, 'Aqui foi onde você escreveu por último.') } : { label: 'Ainda não há onde parei: comece a escrever', icon: 'bookmark', fn: () => {} },
          { label: 'Marcar este ponto (onde está o cursor)…', icon: 'plus', fn: async () => {
            restoreSel(); const pos = posOfCaret(); if (!pos) { T.toast('Clique no texto, no ponto que quer marcar.'); return; }
            const name = await T.ask('Nome do marca-página', { value: snippetAt(pos).slice(-30) || 'Marca-página', ok: 'Marcar' }); if (name == null) return;
            const list = (S().get(item.id).meta?.marks || []).slice(); list.push(Object.assign(pos, { id: T.id(), name: name.trim() || 'Marca-página', at: Date.now() }));
            S().update(item.id, { meta: { marks: list } }); T.toast('Marca-página guardado.');
          } },
          ...(marks.length ? ['-', { head: 'Meus marca-páginas' }, ...marks.map(m => ({ label: m.name + ' · ' + T.relTime(m.at), icon: 'pin', fn: go(m, '“' + m.name + '”') }))] : []),
          ...(marks.length ? ['-', { label: 'Apagar marca-páginas…', icon: 'trash', fn: (e) => T.menuAt(btn, marks.map(m => ({ label: 'Apagar “' + m.name + '”', icon: 'trash', fn: () => { S().update(item.id, { meta: { marks: (S().get(item.id).meta?.marks || []).filter(x => x.id !== m.id) } }); T.toast('Apagado.'); } }))) }] : []),
        ]);
      }

      /* ----- fundo animado atrás da página (cenas, imagens ou vídeos, como no modo composição) ----- */
      let bgStop = null, bgLayStop = null, bgKey = '';
      const bgCfgOf = (m) => { const all = S().get(item.pid)?.meta?.edBg || {}; return all[m] || null; };
      function setBgCfg(m, cfg){ const all = Object.assign({}, S().get(item.pid)?.meta?.edBg); if (cfg) all[m] = cfg; else delete all[m]; S().update(item.pid, { meta: { edBg: all } }); }
      function applyBg(force){
        const cfg = composeOn ? null : bgCfgOf(mode);
        const key = JSON.stringify(cfg || null) + '|' + mode;
        const host = bgEl.firstChild, lay = bgEl.children[1], dim = bgEl.children[2];
        ed.classList.toggle('has-bg', !!cfg);
        if (cfg) { dim.style.background = `rgba(0,0,0,${(cfg.dim ?? 20) / 100})`; host.style.filter = cfg.blur ? `blur(${cfg.blur}px)` : ''; }
        if (key === bgKey && !force) return; bgKey = key;
        if (bgStop) { bgStop(); bgStop = null; } if (bgLayStop) { bgLayStop(); bgLayStop = null; }
        host.innerHTML = '';
        if (!cfg) return;
        const b = cfg.bg || {};
        if (b.kind === 'scene') { const cv = h('canvas'); host.appendChild(cv); requestAnimationFrame(() => { if (!destroyed && cv.isConnected) bgStop = T.Scenes.start(b.id, cv, { scale: (S().prefs().sceneQuality === 'alta' ? .7 : .45) }); }); }
        else if (b.kind === 'image') { const im = h('img', { alt: '' }); host.appendChild(im); T.Assets.resolve(b.ref).then(u => { if (u) im.src = u; }); }
        else if (b.kind === 'video') { const v = h('video', { autoplay: true, loop: true, muted: true, playsinline: true }); v.muted = true; host.appendChild(v); T.Assets.resolve(b.ref).then(u => { if (u) { v.src = u; v.play().catch(() => {}); } }); }
        if ((cfg.layers || []).length) requestAnimationFrame(() => { if (!destroyed) bgLayStop = T.SceneLayers.start(lay, cfg.layers); });
      }
      const offBgItems = T.on('items', (ev) => { if (ev.id === item.pid && ev.patch?.meta && 'edBg' in ev.patch.meta) applyBg(); });
      function bgPicker(anchor){
        const m = mode; const names = { normal: 'Normal', tw: 'Máquina', book: 'Livro' };
        let tab = 'todos';
        const box = h('div.eb-panel');
        const cur = () => bgCfgOf(m);
        const put = (patch) => { const c = Object.assign({ bg: null, dim: 20, blur: 0, layers: [] }, cur() || {}, patch); setBgCfg(m, c.bg ? c : null); draw(); };
        const draw = () => {
          const c = cur(); const all = [{ id: 'todos', name: 'Todos' }, ...T.Scenes.genres, { id: 'meus', name: 'Meus fundos' }];
          const tabs = h('div.eb-tabs', all.map(g => h('button' + (g.id === tab ? '.on' : ''), { type: 'button', onclick: () => { tab = g.id; draw(); } }, g.name)));
          const grid = h('div.eb-grid');
          grid.appendChild(h('button.eb-card' + (!c ? '.on' : ''), { type: 'button', onclick: () => { setBgCfg(m, null); draw(); } }, h('span.th.none', '∅'), h('span.nm', 'Sem fundo')));
          if (tab === 'meus') {
            (S().get(item.pid).meta?.bgs || []).forEach((g, i) => { const th = h('span.th'); if (g.kind === 'image') T.Assets.resolve(g.ref).then(u => { if (u) th.style.backgroundImage = `url("${u}")`; }); else th.textContent = '▶';
              const on = c?.bg?.ref && g.ref && c.bg.ref.id === g.ref.id;
              grid.appendChild(h('button.eb-card' + (on ? '.on' : ''), { type: 'button', onclick: () => put({ bg: g }) }, th, h('span.nm', g.name || 'Fundo ' + (i + 1)))); });
            grid.appendChild(h('button.eb-card', { type: 'button', onclick: async () => {
              const f = await T.pickFile('image/*,video/*'); if (!f) return; T.toast('Enviando ' + f.name + '…');
              const ref = await T.Assets.upload(f); if (!ref) return;
              const g = { kind: f.type.startsWith('video') ? 'video' : 'image', ref, name: f.name.replace(/\.[^.]+$/, '') };
              const p = S().get(item.pid); S().update(item.pid, { meta: { bgs: [...(p.meta?.bgs || []), g] } }); put({ bg: g });
            } }, h('span.th.none', '＋'), h('span.nm', 'Enviar imagem ou vídeo')));
          } else T.Scenes.list.filter(sc => tab === 'todos' || sc.g.includes(tab)).forEach(sc => {
            const th = h('span.th'); T.Scenes.thumb(sc.id).then(u => { if (u) th.style.backgroundImage = `url("${u}")`; });
            const on = c?.bg?.kind === 'scene' && T.Scenes.get(c.bg.id).id === sc.id;
            grid.appendChild(h('button.eb-card' + (on ? '.on' : ''), { type: 'button', onclick: () => put({ bg: { kind: 'scene', id: sc.id } }) }, th, h('span.nm', sc.name)));
          });
          const sl = (label, key, min, max, def) => { const r = h('input', { type: 'range', min, max, value: c?.[key] ?? def, disabled: !c, 'aria-label': label }); r.oninput = () => { const cc = Object.assign({}, cur()); cc[key] = +r.value; setBgCfg(m, cc); }; return h('label.eb-sl', label, r); };
          const layers = h('div.eb-lay', T.SceneLayers.list.map(L => { const on = (c?.layers || []).includes(L.id); return h('button' + (on ? '.on' : ''), { type: 'button', disabled: !c, onclick: () => put({ layers: on ? c.layers.filter(x => x !== L.id) : [...(c.layers || []), L.id] }) }, (on ? '✓ ' : '') + L.name); }));
          box.replaceChildren(
            h('div.eb-head', h('b', 'Fundo atrás da página · modo ' + names[m]), h('span.muted', 'A página continua igual; o fundo fica em volta dela.')),
            tabs, grid,
            h('div.eb-row', sl('Escurecer', 'dim', 0, 85, 20), sl('Desfoque', 'blur', 0, 20, 0)),
            h('div.eb-row2', h('span.muted', 'Camadas:'), layers),
            h('div.eb-foot', c ? h('button.btn.sm', { type: 'button', onclick: () => { ['normal', 'tw', 'book'].forEach(k => setBgCfg(k, Object.assign({}, c))); T.toast('Este fundo agora vale para Normal, Máquina e Livro.'); } }, 'Usar nos três modos') : null,
              h('span.grow'), h('span.muted', { style: { fontSize: '11.5px' } }, 'Ajuste a qualidade da animação no modo composição.')));
        };
        draw();
        T.popover(anchor, box);
      }

      /* ----- máquina de escrever: linha fixa, papel sobe, luz acompanha ----- */
      let lineTop = null, belled = false;
      function caretRect(){
        const sel = getSelection(); if (!sel.rangeCount) return null;
        const r = sel.getRangeAt(0); if (!prose.contains(r.startContainer)) return null;
        let rect = r.getClientRects()[0] || r.getBoundingClientRect();
        if (!rect || (!rect.height && !rect.width && !rect.top)) {
          const node = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement;
          const el = node.childNodes[r.startOffset] && node.childNodes[r.startOffset].nodeType === 1 ? node.childNodes[r.startOffset] : node;
          rect = el.getBoundingClientRect();
          return { left: rect.left + parseFloat(getComputedStyle(el).paddingLeft || 0), top: rect.top, height: parseFloat(getComputedStyle(el).lineHeight) || rect.height, bottom: rect.top + rect.height };
        }
        return rect;
      }
      function twFollow(){
        if (mode !== 'tw' || !twEls || composeOn) return;
        const er = ed.getBoundingClientRect();
        const target = er.height * 0.6;
        const c = caretRect();
        if (c) {
          const dy = (c.top - er.top) - target;
          if (Math.abs(dy) > 1) scroll.scrollTop += dy;
        }
        const c2 = caretRect();
        const pr = prose.getBoundingClientRect();
        const x = c2 ? c2.left - er.left : pr.left - er.left + 48;
        const lh = c2 && c2.height ? c2.height : 30;
        const y = (c2 ? c2.top - er.top : target) + lh + 2;
        const [glow, glow2, bar] = twEls;
        bar.style.top = y + 'px'; bar.style.left = (pr.left - er.left) + 'px'; bar.style.width = pr.width + 'px'; bar.style.right = 'auto';
        bar.querySelector('.tw-lamp').style.left = (x - (pr.left - er.left)) + 'px';
        glow.style.left = x + 'px'; glow.style.top = y + 'px';
        glow2.style.left = x + 'px'; glow2.style.top = y + 'px';
        if (c2) {
          if (lineTop !== Math.round(c2.top)) { lineTop = Math.round(c2.top); belled = false; }
          const frac = (c2.left - pr.left) / pr.width;
          if (frac > .86 && !belled && T.typeKit('tw') === 'maquina' && lastKeyWasChar) { belled = true; T.Sound.bell(); }
        }
      }

      /* ----- livro paginado ----- */
      function buildBook(){
        const cfg = bookCfg(S().get(item.pid));
        const tr = TRIMS[cfg.trim] || TRIMS['14x21'];
        const stage = h('div.book-stage');
        const spreadEl = h('div.book-spread');
        const pgL = h('div.pg.l'), pgR = h('div.pg.r'), spine = h('div.spine');
        const clip = h('div.book-clip');
        const deco = h('div.book-deco');
        const prev = h('button.icon-btn.glass.book-nav', { type: 'button', 'aria-label': 'Página anterior', title: 'Página anterior', style: { left: '14px' }, onpointerdown: (e) => e.preventDefault(), onclick: () => { if (spread > 0) go(spread - 1, true); else neighborText(-1); } }, icon('chev'));
        prev.firstChild.style.transform = 'rotate(180deg)';
        const next = h('button.icon-btn.glass.book-nav.nx', { type: 'button', 'aria-label': 'Próxima página', title: 'Próxima página', style: { right: '14px' }, onpointerdown: (e) => e.preventDefault(), onclick: () => { if (geo && spread < maxSpreadNow()) go(spread + 1, true); else neighborText(1); } }, icon('chev'));
        const meta = h('div');
        prose.classList.add('book-flow'); if (cfg.dropcap) prose.classList.add('dropcap');
        clip.appendChild(prose);
        spreadEl.append(pgL, pgR, spine, clip, deco);
        stage.append(spreadEl);
        ed.append(stage, prev, next);
        bookEls = { stage, spreadEl, pgL, pgR, clip, deco, prev, next, meta, cfg, tr };
        // remove botões/meta junto com o palco
        const oldRemove = stage.remove.bind(stage);
        stage.remove = () => { oldRemove(); prev.remove(); next.remove(); meta.remove(); };
        layoutBook();
      }
      function layoutBook(){
        if (!bookEls || composeOn) return;
        const { stage, spreadEl, pgL, pgR, clip, cfg, tr } = bookEls;
        const W = ed.clientWidth - 110, H = ed.clientHeight - (tools.offsetHeight || 50) - 14 - 46 - 16;
        const single = !!view('book').single;
        const s = Math.max(6, Math.min(H / tr.h, W / ((single ? 1 : 2) * tr.w)) * (view('book').zoom / 100)); // px por cm
        // tudo em pixels inteiros: frações de pixel deixam as letras borradas
        const R = Math.round; const PW = R(tr.w * s), PH = R(tr.h * s), mt = R(tr.mt * s), mb = R(tr.mb * s), mi = R(tr.mi * s), mo = R(tr.mo * s);
        const TW = PW - mi - mo, TH = PH - mt - mb, G = 2 * mi;
        const fs = Math.round(cfg.pt * 0.03528 * s * 4) / 4;
        const face = BOOK_FACES[cfg.face] || BOOK_FACES.literata; if (face.f) T.loadFont(face.f); prose.style.setProperty('--font-book', face.css); prose.style.fontWeight = face.w; bookEls.deco.style.setProperty('--font-book', face.css);
        geo = { s, PW, PH, mt, mb, mi, mo, TW, TH, G, fs, single };
        spreadEl.style.width = (single ? 1 : 2) * PW + 'px'; spreadEl.style.height = PH + 'px';
        spreadEl.classList.toggle('single', single);
        pgL.style.width = PW + 'px'; pgR.style.width = PW + 'px';
        clip.style.left = '0px'; clip.style.top = mt + 'px'; clip.style.width = (single ? 1 : 2) * PW + 'px'; clip.style.height = TH + 'px';
        Object.assign(prose.style, { width: (single ? TW : 2 * TW + G) + 'px', height: TH + 'px', columnWidth: TW + 'px', columnGap: G + 'px', columnFill: 'auto', fontSize: fs + 'px', lineHeight: String(cfg.lead) });
        prose.style.setProperty('--sink', (cfg.sink / 100 * TH * 0.9) + 'px');
        measureBook();
        go(spread, false);
      }
      function colOfRect(r){
        if (!r || !geo) return 0;
        const fr = prose.getBoundingClientRect();
        return Math.max(0, Math.floor((r.left - fr.left + 2) / (geo.TW + geo.G)));
      }
      function measureBook(){
        const els = prose.querySelectorAll('p, h1, hr, .scene-sep');
        const last = els[els.length - 1];
        if (!last) { ncols = 1; return; }
        const rects = last.getClientRects(); const r = rects[rects.length - 1] || last.getBoundingClientRect();
        ncols = colOfRect(r) + 1;
      }
      function startPage(){
        // estimativa de páginas antes deste texto, calibrada pelo que acabou de ser medido
        const flat = T.MS.flat(item.pid); const firstId = docs[0]?.id;
        let prevWords = 0; for (const it of flat) { if (it.id === firstId || it.id === item.id) break; prevWords += it.meta?.words ?? T.words(it.body); }
        const here = docs.reduce((a, d) => a + (S().get(d.id)?.meta?.words || 0), 0);
        const wpp = (here > 200 && ncols > 1) ? here / ncols : (bookEls?.tr.wpp || 270);
        let p = Math.floor(prevWords / wpp) + 1;
        if (OR() ? p % 2 === 0 : p % 2 === 1) p++; // abertura na direita (ímpar) ou na esquerda (par)
        return { p, wpp: Math.round(wpp) };
      }
      function pageLabel(){
        if (!geo) return '';
        const { p } = startPage();
        if (geo.single) return '≈' + (p + spread);
        if (!OR()) { const a = p + spread * 2; return ncols > spread * 2 + 1 ? '≈' + a + '–' + (a + 1) : '≈' + a; }
        const a = p + Math.max(0, spread * 2 - 1), b = p + spread * 2;
        return spread === 0 ? '≈' + p : '≈' + a + '–' + b;
      }
      const OR = () => !!bookCfg(S().get(item.pid)).openRight;
      const maxSpreadNow = () => !geo ? 0 : geo.single ? ncols - 1 : (OR() ? Math.floor(ncols / 2) : Math.floor((ncols - 1) / 2));
      // texto vizinho no manuscrito (capítulo ou cena, do mesmo tipo do que está aberto)
      function neighbor(dir){
        const flat = T.MS.flat(item.pid);
        const unit = item.type === 'chapter' ? 'chapter' : item.type === 'part' ? 'part' : null;
        let list;
        if (unit) list = flat.filter(i => i.type === unit);
        else list = flat.filter(i => (i.type === 'scene' || i.type === 'doc') && i.area === 'ms');
        const k = list.findIndex(i => i.id === item.id); if (k < 0) return null;
        return list[k + dir] || null;
      }
      function neighborText(dir){
        const nb = neighbor(dir); if (!nb) { T.toast(dir > 0 ? 'Este é o fim do livro.' : 'Este é o começo do livro.'); return; }
        save.flush();
        if (T.Sound && S().prefs().pageSound !== false) try { T.Sound.page(); } catch (e) {}
        T._bookJump = { ref: nb.id, end: dir < 0 };
        T.Shell.open({ kind: 'doc', ref: nb.id, mode: 'book' }, { replace: tab });
      }
      function go(n, animate){
        if (!geo || !bookEls) return;
        const maxSpread = geo.single ? ncols - 1 : (OR() ? Math.floor(ncols / 2) : Math.floor((ncols - 1) / 2));
        n = T.clamp(n, 0, Math.max(0, maxSpread));
        const xOf = (sp) => geo.single ? ((sp % 2 === 0 ? geo.mi : geo.mo) - sp * (geo.TW + geo.G)) : geo.mo - (OR() ? 2 * sp - 1 : 2 * sp) * (geo.TW + geo.G);
        const doFlip = animate && n !== spread; const fwd = n > spread; const old = spread, xOld = xOf(spread);
        let leaf = null; if (doFlip) { leaf = flipStart(fwd, xOld, old); prose.style.transition = 'none'; requestAnimationFrame(() => requestAnimationFrame(() => { prose.style.transition = ''; })); }
        spread = n;
        // uma página: a página n é a coluna n (página da direita quando par, com a margem interna à esquerda)
        const x = xOf(spread);
        if (geo.single) { bookEls.pgR.classList.toggle('r', spread % 2 === 0); bookEls.pgR.classList.toggle('l', spread % 2 === 1); }
        else { bookEls.pgR.classList.add('r'); bookEls.pgR.classList.remove('l'); } // voltando de 1 para 2 páginas: a da direita volta para o lado certo
        prose.style.transform = 'translateX(' + Math.round(x) + 'px)';
        drawDeco();
        const nb = (d) => neighbor(d);
        const pv = nb(-1), nx = nb(1);
        bookEls.prev.classList.toggle('end', spread === 0 && !pv);
        bookEls.next.classList.toggle('end', spread >= maxSpread && !nx);
        bookEls.prev.classList.toggle('jump', spread === 0 && !!pv); bookEls.next.classList.toggle('jump', spread >= maxSpread && !!nx);
        bookEls.prev.title = spread === 0 ? (pv ? 'Capítulo anterior: ' + (pv.title || 'Sem título') : 'Este é o começo do livro') : 'Página anterior';
        bookEls.next.title = spread >= maxSpread ? (nx ? 'Próximo capítulo: ' + (nx.title || 'Sem título') : 'Este é o fim do livro') : 'Próxima página';
        updateStatus();
        if (leaf) flipEnd(leaf, fwd, x);
        if (rail) { requestAnimationFrame(() => rail.layout()); setTimeout(() => rail && rail.layout(), 560); }
      }
      /* virar a página: uma folha com o conteúdo da página antiga gira em torno da lombada */
      function pageFace(xT, side, back){
        const face = h('div.leaf-face' + (back ? '.back' : ''), { style: { width: geo.PW + 'px', height: geo.PH + 'px' } });
        const off = geo.single ? 0 : (side === 'r' ? -geo.PW : 0);
        const inner = h('div.leaf-in', { style: { left: off + 'px', top: geo.mt + 'px', width: bookEls.clip.style.width, height: geo.TH + 'px' } });
        const pc = prose.cloneNode(true); pc.removeAttribute('contenteditable'); pc.style.transform = 'translateX(' + Math.round(xT) + 'px)';
        inner.appendChild(pc); face.appendChild(inner);
        const dc = bookEls.deco.cloneNode(true); dc.style.left = off + 'px'; face.appendChild(dc);
        face.appendChild(h('i.leaf-shade'));
        return face;
      }
      function flipStart(fwd, xOld){
        const { spreadEl } = bookEls;
        if (S().prefs().pageSound !== false) T.Sound.page();
        const left = geo.single ? 0 : (fwd ? geo.PW : 0);
        const leaf = h('div.leaf' + (fwd ? '.fwd' : '.bwd') + (geo.single ? '.single' : ''), { style: { width: geo.PW + 'px', height: geo.PH + 'px', left: left + 'px' } });
        leaf.appendChild(pageFace(xOld, geo.single ? 's' : (fwd ? 'r' : 'l'), false));
        const shadow = h('div.leaf-cast' + (fwd ? '.fwd' : '.bwd'), { style: { width: geo.PW + 'px', height: geo.PH + 'px', left: (geo.single ? 0 : (fwd ? 0 : geo.PW)) + 'px' } });
        spreadEl.append(shadow, leaf);
        return { leaf, shadow };
      }
      function flipEnd(o, fwd, xNew){
        requestAnimationFrame(() => {
          if (!geo.single) o.leaf.appendChild(pageFace(xNew, fwd ? 'l' : 'r', true));
          else o.leaf.appendChild(h('div.leaf-face.back.blank', { style: { width: geo.PW + 'px', height: geo.PH + 'px' } }, h('i.leaf-shade')));
          o.leaf.classList.add('go'); o.shadow.classList.add('go');
          setTimeout(() => { o.leaf.remove(); o.shadow.remove(); }, 900);
        });
      }
      function drawDeco(){
        const { deco, cfg } = bookEls; deco.innerHTML = '';
        const { p, wpp } = startPage();
        const proj = S().get(item.pid);
        const author = proj?.meta?.author || '';
        const ch = item.type === 'chapter' ? item : T.MS.chapterOf(docs[0]);
        const rhRight = ch?.title || proj?.title || '';
        const hasHeading = !!prose.querySelector('h1.ch-title');
        (geo.single ? [[spread, spread % 2 === 0 ? 'r' : 'l', 0]] : (OR() ? [[2 * spread - 1, 'l'], [2 * spread, 'r']] : [[2 * spread, 'l'], [2 * spread + 1, 'r']])).forEach(([col, side, fixedX]) => {
          if (col < 0 || col >= ncols) { (side === 'l' ? bookEls.pgL : bookEls.pgR).style.opacity = col < 0 ? '.92' : '1'; return; }
          (side === 'l' ? bookEls.pgL : bookEls.pgR).style.opacity = '1';
          const num = p + col;
          const x0 = fixedX != null ? fixedX : side === 'l' ? 0 : geo.PW;
          const opening = col === 0 && hasHeading;
          if (!opening) {
            const rh = h('div.rh', side === 'l' ? (author || proj?.title || '') : rhRight);
            Object.assign(rh.style, { left: x0 + 'px', width: geo.PW + 'px', textAlign: 'center', top: (geo.mt * .45) + 'px', fontSize: (geo.fs * .78) + 'px' });
            deco.appendChild(rh);
          }
          const pn = h('div.pn.num', String(num));
          Object.assign(pn.style, { left: x0 + 'px', width: geo.PW + 'px', textAlign: 'center', bottom: (geo.mb * .38) + 'px', fontSize: (geo.fs * .82) + 'px' });
          deco.appendChild(pn);
        });
        const info = (TRIMS[cfg.trim] || TRIMS['14x21']).name + ' · ' + ncols + (ncols === 1 ? ' pág.' : ' págs.') + ' aqui · ≈' + wpp + ' pal./pág.';
        if (info !== bookInfo) { bookInfo = info; updateStatus(); }
      }
      function bookFollowCaret(){
        if (mode !== 'book' || !geo || composeOn) return;
        measureBook();
        const r = caretRect(); if (!r) { drawDeco(); return; }
        const col = colOfRect(r);
        const want = geo.single ? col : (OR() ? Math.floor((col + 1) / 2) : Math.floor(col / 2));
        if (want !== spread) go(want, true); else drawDeco();
      }
      function bookSettings(btn){
        const draw = () => {
          const cfg = bookCfg(S().get(item.pid));
          const setB = (patch) => { setBookCfg(patch); draw(); };
          const seg = (opts) => h('div.seg.bs-seg', opts.map(([on, label, fn]) => h('button' + (on ? '.on' : ''), { type: 'button', onclick: fn }, label)));
          const row = (label, el) => h('div.bs-row', h('span.tp-l', label), el);
          const author = S().get(item.pid)?.meta?.author || '';
          box.replaceChildren(
            h('b.bs-h', 'Formato do livro'),
            row('Tamanho', seg(Object.entries(TRIMS).map(([k, v]) => [cfg.trim === k, v.name, () => setB({ trim: k })]))),
            row('Corpo do texto', seg([10.5, 11, 11.5, 12].map(pt => [cfg.pt === pt, String(pt).replace('.', ',') + ' pt', () => setB({ pt })]))),
            row('Letra', (() => { const sl = h('select.select.font-sel', { 'aria-label': 'Letra do livro', onchange: (e) => setB({ face: e.target.value }) }, Object.entries(BOOK_FACES).map(([k, f]) => h('option', { value: k, selected: (cfg.face || 'literata') === k, style: { fontFamily: f.css } }, f.name))); sl.style.fontFamily = (BOOK_FACES[cfg.face] || BOOK_FACES.literata).css; Object.values(BOOK_FACES).forEach(f => f.f && T.loadFont(f.f)); return sl; })()),
            row('Entrelinha', seg([[1.3, 'Justa'], [1.42, 'Normal'], [1.55, 'Aberta']].map(([l, n]) => [cfg.lead === l, n, () => setB({ lead: l })]))),
            h('label.mp-chk', h('input', { type: 'checkbox', checked: !!cfg.dropcap, onchange: () => setB({ dropcap: !cfg.dropcap }) }), 'Letra capitular na abertura do capítulo'),
            h('label.mp-chk', h('input', { type: 'checkbox', checked: !!cfg.openRight, onchange: () => { setB({ openRight: !cfg.openRight }); go(0, false); } }), 'Capítulo começa sozinho na página da direita (como no livro impresso)'),
            row('Autora nos cabeçalhos', h('button.btn.sm', { type: 'button', onclick: async () => { const v = await T.ask('Nome da autora', { value: author, text: 'Aparece no alto das páginas da esquerda.' }); if (v != null) { S().update(item.pid, { meta: { author: v } }); applyMode && applyMode(); draw(); } } }, icon('edit'), author || 'Escrever o nome')));
        };
        const box = h('div.bs-panel');
        draw();
        T.popover(btn, box);
      }

      /* ----- teclado, som, eventos ----- */
      let lastKeyWasChar = false, typingTimer = null;
      prose.addEventListener('keydown', (e) => {
        document.body.classList.add('typing'); clearTimeout(typingTimer); typingTimer = setTimeout(() => document.body.classList.remove('typing'), 2500);
        const kit = T.typeKit(mode, composeOn);
        lastKeyWasChar = e.key.length === 1;
        if (kit !== 'off' && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const kind = e.key === 'Enter' ? 'enter' : e.key === ' ' ? 'space' : (e.key === 'Backspace' || e.key === 'Delete') ? 'back' : e.key.length === 1 ? 'key' : null;
          if (kind) T.Sound.type(kit, kind);
        }
        if (mode === 'book' && !composeOn && (e.key === 'PageDown' || e.key === 'PageUp')) { e.preventDefault(); (e.key === 'PageDown' ? bookEls?.next : bookEls?.prev)?.click(); }
        if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')) {
          e.preventDefault(); const m = composeOn ? 'compose' : mode; const z = view(m).zoom;
          setView(m, { zoom: e.key === '0' ? 100 : T.clamp(z + (e.key === '-' ? -10 : 10), 50, 220) });
        }
      });
      prose.addEventListener('input', () => {
        normalize(); save();
        if (!composeOn && mode === 'tw') requestAnimationFrame(twFollow);
        if (!composeOn && mode === 'book') requestAnimationFrame(bookFollowCaret);
      });
      prose.addEventListener('paste', pasteAsText);
      prose.addEventListener('click', (e) => {
        const hr = e.target.closest && e.target.closest('section hr'); if (!hr) return;
        const r = hr.getBoundingClientRect();
        const anchor = h('span', { style: { position: 'fixed', left: (r.left + r.width / 2) + 'px', top: r.top + 'px', width: '1px', height: r.height + 'px' } }); document.body.appendChild(anchor);
        const pop = T.popover(anchor, h('button.btn.sm', { onclick: () => { hr.remove(); normalize(); save(); pop.remove(); T.toast('Quebra de cena retirada.'); } }, icon('trash'), 'Tirar esta quebra de cena (⁂)'));
        setTimeout(() => anchor.remove(), 50);
      });
      prose.addEventListener('mouseover', (e) => { const c = e.target.closest && e.target.closest('.cmt'); if (c) showCommentTip(c); });
      const onSel = () => {
        { const lb = tools.querySelector('.st-btn .lbl'); if (lb) { const b = curBlock(); if (b !== null || document.activeElement === prose) { const k = b?.dataset?.st || ''; const nm = (PSTYLES.find(x => x[0] === k) || PSTYLES[0])[1]; if (lb.textContent !== nm) lb.textContent = nm; } } }
        if (destroyed) return;
        const sel = getSelection();
        if (!sel.rangeCount || !prose.contains(sel.anchorNode)) { hideSelPop(); return; }
        if (!composeOn && mode === 'tw') requestAnimationFrame(twFollow);
        if (!composeOn && mode === 'book') requestAnimationFrame(bookFollowCaret);
        if (!sel.isCollapsed && sel.toString().trim()) showSelPop(); else hideSelPop();
        if (inspectorOpen) refreshInspectorTarget();
      };
      document.addEventListener('selectionchange', onSel);
      resizeObs = new ResizeObserver(() => { marksSoon(); if (!composeOn) { const el = panEl(); const keep = el ? el.scrollLeft - (el.scrollWidth - el.clientWidth) / 2 : 0; ed.style.setProperty('--pan', panPx() + 'px'); if (el) { panBusy = true; el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2 + keep; requestAnimationFrame(() => { panBusy = false; }); } } if (mode === 'book') layoutBook(); if (mode === 'tw') twFollow(); if (rail && rail.el.isConnected) rail.layout(); });
      resizeObs.observe(ed);
      document.addEventListener('mousemove', clearTyping);
      function clearTyping(){ if (document.body.classList.contains('typing')) { clearTimeout(typingTimer); typingTimer = setTimeout(() => document.body.classList.remove('typing'), 300); } }

      function placeCaretEnd(onlyIfNone){
        const sel = getSelection();
        if (onlyIfNone && sel.rangeCount && prose.contains(sel.anchorNode)) { prose.focus(); return; }
        const secs = prose.querySelectorAll('section'); const last = secs[secs.length - 1]; if (!last) return;
        const p = last.lastElementChild || last;
        const r = document.createRange(); r.selectNodeContents(p); r.collapse(false);
        prose.focus({ preventScroll: true }); sel.removeAllRanges(); sel.addRange(r);
        if (!composeOn && mode === 'tw') twFollow(); if (!composeOn && mode === 'book') bookFollowCaret();
        if (mode === 'normal') { const cr = caretRect(); if (cr) { const er = scroll.getBoundingClientRect(); scroll.scrollTop += cr.top - er.top - er.height * .5; } }
      }

      /* ----- seleção: negrito, marca-texto, comentário ----- */
      let selPop = null;
      function showSelPop(){
        const sel = getSelection(); const r = sel.getRangeAt(0).getBoundingClientRect();
        if (!selPop) {
          selPop = h('div.sel-pop.glass.glass-strong',
            T.iconBtn('bold', 'Negrito', () => cmd('bold'), '.sm'),
            T.iconBtn('italic', 'Itálico', () => cmd('italic'), '.sm'),
            T.iconBtn('mark', 'Marca-texto (escolher a cor)', (e) => hlPalette(e.currentTarget), '.sm'),
            h('button.btn.sm.syn-btn', { type: 'button', title: 'Sinônimos da palavra selecionada', onclick: () => showSynonyms() }, icon('replace'), 'Sinônimos'),
            T.iconBtn('comment', 'Comentar', () => addComment(), '.sm'));
          selPop.addEventListener('mousedown', e => e.preventDefault());
          document.body.appendChild(selPop);
        }
        selPop.style.left = Math.max(8, Math.min(innerWidth - 300, r.left + r.width / 2 - 120)) + 'px';
        selPop.style.top = Math.max(8, r.top - 46) + 'px';
      }
      function showSynonyms(){
        const sel = getSelection(); if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0).cloneRange();
        const raw = sel.toString(); const word = raw.trim().replace(/^[\s“”"'«»(—–-]+|[\s“”"'«».,;:!?…)—–-]+$/g, '');
        if (!word || word.split(/\s+/).length > 4) { T.toast('Selecione uma palavra (ou uma expressão curta).'); return; }
        const pEl = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement).closest('p');
        const ptxt = pEl ? pEl.textContent : ''; const at = Math.max(0, ptxt.indexOf(word)); const sentence = ptxt.length <= 300 ? ptxt : ptxt.slice(Math.max(0, at - 150), at + 150);
        const rect = range.getBoundingClientRect(); hideSelPop();
        T.Syn.panel(rect, word, sentence, (w) => {
          // mantém maiúscula inicial e o que estava em volta da palavra
          const out = /^[A-ZÀ-Ý]/.test(word) ? w.charAt(0).toUpperCase() + w.slice(1) : w;
          const lead = raw.slice(0, raw.indexOf(word)), tail = raw.slice(raw.indexOf(word) + word.length);
          prose.focus({ preventScroll: true }); const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(range);
          document.execCommand('insertText', false, lead + out + tail);
          normalize(); save();
          if (!composeOn && mode === 'book') requestAnimationFrame(bookFollowCaret);
        });
      }
      function hideSelPop(){ if (selPop) { selPop.remove(); selPop = null; } }
      function sameBlock(range){
        const a = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
        const b = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement;
        return a.closest('p') && a.closest('p') === b.closest('p');
      }
      function wrapSel(tag, attrs){
        const sel = getSelection(); if (!sel.rangeCount) return null;
        const range = sel.getRangeAt(0);
        if (!sameBlock(range)) { T.toast('Selecione um trecho dentro de um único parágrafo.'); return null; }
        const existing = (range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement).closest(tag);
        if (tag === 'mark' && existing) { existing.replaceWith(...existing.childNodes); save(); hideSelPop(); return null; }
        const el = document.createElement(tag); if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
        try { el.appendChild(range.extractContents()); range.insertNode(el); } catch (e) { return null; }
        sel.removeAllRanges(); save(); hideSelPop();
        return el;
      }
      /* ----- ditado: falar e o texto aparece onde está o cursor ----- */
      let dict = undefined, dictOn = false, dictRec = null, dictPrev = null, dictRange = null;
      (async () => { try { dict = (window.claude && claude.use) ? await Promise.race([claude.use('dictation'), new Promise(r => setTimeout(() => r(null), 11000))]) : null; } catch (e) { dict = null; } if (dict) { dict.onPartial(({ text }) => dictPartial(text)); dict.onFinal(({ text }) => dictFinal(text)); dict.onState(({ state, reason }) => { const on = state === 'listening'; if (on !== dictOn) { dictOn = on; if (!on) dictPartial(''); buildTools(); if (!on && reason && reason !== 'stopped' && reason !== 'viewer_stopped') T.toast('O ditado parou' + (reason === 'hidden' ? ' (a aba ficou escondida).' : '.')); } }); } })();
      const VOICE_CMDS = [[/\bponto e v[ií]rgula\b/gi, ';'], [/\bdois pontos\b/gi, ':'], [/\b(ponto de )?interroga[cç][aã]o\b/gi, '?'], [/\b(ponto de )?exclama[cç][aã]o\b/gi, '!'], [/\b(ponto final|ponto)\b/gi, '.'], [/\bv[ií]rgula\b/gi, ','], [/\b(retic[eê]ncias)\b/gi, '…'], [/\btravess[aã]o\b/gi, '—'], [/\babre aspas\b/gi, '“'], [/\bfecha aspas\b/gi, '”']];
      function dictClean(t){
        let x = ' ' + t + ' ';
        VOICE_CMDS.forEach(([re, ch]) => { x = x.replace(re, ch); });
        x = x.replace(/\s+([.,;:?!…”])/g, '$1').replace(/([“—])\s+/g, '$1 ').replace(/“ /g, '“').replace(/\s{2,}/g, ' ');
        return x.trim();
      }
      function dictInsert(raw){
        const parts = raw.split(/\b(?:nova linha|novo par[aá]grafo|par[aá]grafo)\b/i);
        prose.focus({ preventScroll: true });
        const sel = getSelection(); if (dictRange && !(sel.rangeCount && prose.contains(sel.anchorNode))) { sel.removeAllRanges(); sel.addRange(dictRange); }
        parts.forEach((pt, i) => {
          if (i > 0) document.execCommand('insertParagraph');
          let t = dictClean(pt); if (!t) return;
          const s2 = getSelection(); const n = s2.anchorNode; let before = '';
          if (n && n.nodeType === 3) before = n.data.slice(0, s2.anchorOffset);
          else { const p = n && (n.nodeType === 1 ? n : n.parentElement).closest('p'); before = p ? p.textContent : ''; }
          const startSentence = !before.trim() || /[.!?…]["”»]?\s*$/.test(before);
          if (startSentence) t = t.charAt(0).toUpperCase() + t.slice(1);
          if (before && !/\s$/.test(before) && !/^[.,;:?!…”]/.test(t)) t = ' ' + t;
          document.execCommand('insertText', false, t);
        });
        const s3 = getSelection(); if (s3.rangeCount) dictRange = s3.getRangeAt(0).cloneRange();
        normalize(); save();
        if (mode === 'book') requestAnimationFrame(bookFollowCaret); else if (mode === 'tw') twFollow();
      }
      function dictFinal(text){ dictPartial(''); if (text && text.trim()) dictInsert(text); }
      function dictPartial(text){
        if (!text) { if (dictPrev) { dictPrev.remove(); dictPrev = null; } return; }
        if (!dictPrev) { dictPrev = h('div.dict-prev.glass.glass-strong', { 'aria-live': 'polite' }); (composeOn && composeEls ? composeEls.wrap : ed).appendChild(dictPrev); }
        dictPrev.replaceChildren(h('span.dict-dot'), h('span', text));
      }
      function toggleDictation(){
        if (dict) {
          if (dictOn) { dict.stop().catch(() => {}); return; }
          const sel = getSelection(); if (sel.rangeCount && prose.contains(sel.anchorNode)) dictRange = sel.getRangeAt(0).cloneRange(); else { placeCaretEnd(false); const s2 = getSelection(); dictRange = s2.rangeCount ? s2.getRangeAt(0).cloneRange() : null; }
          dict.start().catch((e) => { if (e?.code === 'not_granted') T.toast('Sem permissão para o microfone. Dá para liberar nas permissões do site.'); else if (e?.code !== 'dismissed') T.toast('Não consegui começar o ditado agora.'); });
          dictOn = true; buildTools(); return;
        }
        // reserva: reconhecimento de voz do próprio navegador (Chrome/Edge)
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { T.toast('O ditado funciona no Chrome, no Edge ou no app do Claude.'); return; }
        if (dictOn && dictRec) { dictRec.stop(); return; }
        const sel = getSelection(); if (sel.rangeCount && prose.contains(sel.anchorNode)) dictRange = sel.getRangeAt(0).cloneRange();
        const rec = new SR(); rec.lang = 'pt-BR'; rec.continuous = true; rec.interimResults = true; dictRec = rec;
        rec.onresult = (ev) => { let interim = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) dictFinal(r[0].transcript); else interim += r[0].transcript; } dictPartial(interim); };
        rec.onend = () => { dictOn = false; dictRec = null; dictPartial(''); buildTools(); };
        rec.onerror = (ev) => { if (ev.error === 'not-allowed') T.toast('Sem permissão para o microfone.'); };
        try { rec.start(); dictOn = true; buildTools(); } catch (e) { T.toast('Não consegui começar o ditado.'); }
      }

      /* ----- travessão automático: "-" no começo do parágrafo, depois de espaço, ou "--" vira "—" ----- */
      prose.addEventListener('input', (e) => {
        if (e.inputType !== 'insertText' || e.data !== '-' || S().prefs().autoDash === false) return;
        const sel = getSelection(); if (!sel.rangeCount || !sel.isCollapsed) return;
        const n = sel.anchorNode, o = sel.anchorOffset; if (!n || n.nodeType !== 3 || o < 1 || n.data[o - 1] !== '-') return;
        const before = n.data.slice(0, o - 1);
        const p = n.parentElement.closest('p'); if (!p) return;
        const r0 = document.createRange(); r0.setStart(p, 0); r0.setEnd(n, o - 1); const lead = r0.toString();
        let from = o - 1, rep = null;
        if (before.endsWith('-') || before.endsWith('—')) { from = o - 2; rep = '—'; }
        else if (!lead.trim() || /\s$/.test(lead)) rep = '—';
        if (!rep) return;
        const r = document.createRange(); r.setStart(n, from); r.setEnd(n, o); sel.removeAllRanges(); sel.addRange(r);
        document.execCommand('insertText', false, rep);
      });

      /* ----- análise do texto: tamanho das frases e verbo fraco + advérbio (liga e desliga) ----- */
      const AN = { len: false, weak: false };
      let anPanel = null, anHits = [];
      const HLN = window.CSS && CSS.highlights && window.Highlight;
      const BUCKETS = [[1, 5, 'Bem curta (até 5 palavras)'], [2, 12, 'Curta (6 a 12)'], [3, 20, 'Média (13 a 20)'], [4, 30, 'Longa (21 a 30)'], [5, 1e9, 'Muito longa (mais de 30)']];
      function textMap(p){ const nodes = []; let txt = ''; const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { if (t.parentElement.closest('.scene-sep')) continue; nodes.push([t, txt.length]); txt += t.data; } return { txt, nodes }; }
      function rangeAt(map, a, b){ const r = document.createRange(); let sa = false; for (let i = 0; i < map.nodes.length; i++) { const [t, off] = map.nodes[i]; const end = off + t.data.length; if (!sa && a <= end) { r.setStart(t, Math.max(0, a - off)); sa = true; } if (sa && b <= end) { r.setEnd(t, Math.max(0, b - off)); return r; } } return sa ? r : null; }
      /* ----- revisão de ortografia (Claude) + meu dicionário ----- */
      const SP = { on: false, errs: new Map(), busy: false, ign: new Set() };
      const spKey = (w) => w.toLowerCase();
      const myDict = () => new Set([...(S().get(item.pid)?.meta?.dict || []).map(spKey), ...(T.Ent?.pages ? T.Ent.pages(item.pid).flatMap(p => (p.title || '').split(/\s+/)).map(spKey) : [])]);
      const WORD_RE = /[\p{L}]+(?:[-'’][\p{L}]+)*/gu;
      function markSpelling(){
        if (!HLN) return 0; CSS.highlights.delete('sp-err');
        if (!SP.on || !SP.errs.size) return 0;
        const hl = new Highlight(); const dict = myDict(); const found = new Set();
        prose.querySelectorAll('section > p, section > h1, section > h2').forEach(p => {
          const map = textMap(p); let m; WORD_RE.lastIndex = 0;
          while ((m = WORD_RE.exec(map.txt))) { const k = spKey(m[0]); if (!SP.errs.has(k) || dict.has(k) || SP.ign.has(k)) continue; const r = rangeAt(map, m.index, m.index + m[0].length); if (r) { hl.add(r); found.add(k); } }
        });
        CSS.highlights.set('sp-err', hl); return found.size;
      }
      const markSpellSoon = T.debounce(markSpelling, 500);
      async function checkSpelling(){
        if (SP.busy) return; SP.busy = true; buildTools();
        try {
          const dict = myDict();
          const paras = [...prose.querySelectorAll('section > p')].map(p => p.textContent.trim()).filter(Boolean);
          const chunks = []; let cur = '';
          paras.forEach(t => { if ((cur + '\n' + t).length > 6000 && cur) { chunks.push(cur); cur = ''; } cur += (cur ? '\n' : '') + t; }); if (cur) chunks.push(cur);
          if (!chunks.length) { T.toast('Não há texto para revisar aqui.'); return; }
          T.toast('Revisando a ortografia…');
          for (const ch of chunks) {
            const out = await T.AI.json('Você é um revisor de ortografia do português do Brasil. No texto abaixo (trecho de um romance de fantasia), encontre SOMENTE palavras escritas com erro de ortografia ou acentuação (não aponte gramática, estilo, pontuação, regência nem escolhas do autor). Ignore nomes próprios e palavras inventadas que pareçam intencionais do mundo da história. Não aponte estas palavras, que a autora já aprovou: ' + ([...dict].slice(0, 300).join(', ') || '(nenhuma)') + '.\nResponda só JSON: {"erros":[{"palavra":"como está escrita no texto","sugestoes":["forma correta mais provável","outra opção"]}]}. Se não houver erros, {"erros":[]}.\n\nTEXTO:\n' + ch);
            (out?.erros || []).forEach(e => { const w = String(e.palavra || '').trim(); if (!w || /\s/.test(w)) return; const sug = (e.sugestoes || []).map(String).filter(x => x && x !== w).slice(0, 5); if (sug.length) SP.errs.set(spKey(w), { word: w, sug }); });
          }
          const n = markSpelling();
          T.toast(n ? n + (n === 1 ? ' palavra marcada' : ' palavras marcadas') + ' com sublinhado vermelho. Toque nela para ver a correção.' : 'Nenhum erro de ortografia encontrado aqui. 🎉');
        } catch (e) { T.toast(T.AI.errText(e)); if (e?.code === 'private' || e?.code === 'standalone') { SP.on = false; prose.spellcheck = true; } }
        finally { SP.busy = false; buildTools(); }
      }
      function toggleSpell(){
        SP.on = !SP.on; prose.spellcheck = !SP.on;
        if (SP.on) checkSpelling(); else { if (HLN) CSS.highlights.delete('sp-err'); buildTools(); }
      }
      function addToDict(word){
        const p = S().get(item.pid); const d = [...(p.meta?.dict || [])]; if (!d.some(x => spKey(x) === spKey(word))) d.push(word);
        S().update(item.pid, { meta: { dict: d.sort((a, b) => a.localeCompare(b, 'pt')) } }); markSpelling();
        T.toast('“' + word + '” entrou no seu dicionário. Não vou mais marcar essa palavra.');
      }
      function dictModal(){
        T.modal((box, close) => {
          const draw = () => {
            const d = S().get(item.pid)?.meta?.dict || []; box.innerHTML = '';
            const inp = h('input.input', { placeholder: 'Adicionar palavra…', 'aria-label': 'Nova palavra do dicionário' });
            const add = () => { const w = inp.value.trim(); if (!w) return; addToDict(w); draw(); };
            inp.onkeydown = (e) => { if (e.key === 'Enter') add(); };
            box.append(h('h2', 'Meu dicionário'), h('p.sub', 'Palavras do seu livro que estão certas do jeito que são (nomes, termos do seu mundo, regionalismos). A revisão de ortografia não marca nenhuma delas. Nomes das páginas da wiki já contam sozinhos.'),
              h('div.row', { style: { gap: '8px' } }, inp, h('button.btn', { onclick: add }, icon('plus'), 'Adicionar')),
              d.length ? h('div.dict-chips', d.map(w => h('span.chip', w, h('button.ra', { type: 'button', title: 'Tirar do dicionário', onclick: () => { S().update(item.pid, { meta: { dict: d.filter(x => x !== w) } }); markSpelling(); draw(); } }, '×')))) : h('p.muted', 'Ainda vazio.'),
              h('div.modal-foot', h('span.grow'), h('button.btn.primary', { onclick: close }, 'Pronto')));
          };
          draw();
        });
      }
      prose.addEventListener('input', () => { if (SP.on) markSpellSoon(); });
      prose.addEventListener('click', () => {
        if (!SP.on || !SP.errs.size) return;
        const sel = getSelection(); if (!sel.rangeCount || !sel.isCollapsed) return;
        const node = sel.anchorNode; if (!node || node.nodeType !== 3) return;
        const t = node.textContent, off = sel.anchorOffset;
        let a = off, b = off; while (a > 0 && /[\p{L}\-'’]/u.test(t[a - 1])) a--; while (b < t.length && /[\p{L}\-'’]/u.test(t[b])) b++;
        const w = t.slice(a, b); const k = spKey(w); const e = SP.errs.get(k);
        if (!w || !e || SP.ign.has(k) || myDict().has(k)) return;
        const rng = document.createRange(); rng.setStart(node, a); rng.setEnd(node, b);
        const rect = rng.getBoundingClientRect();
        const anchor = h('span', { style: { position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' } }); document.body.appendChild(anchor);
        const fix = (to) => { const keep = /^[A-ZÀ-Ý]/.test(w) ? to.charAt(0).toUpperCase() + to.slice(1) : to; const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(rng); document.execCommand('insertText', false, keep); normalize(); save(); markSpelling(); pop.remove(); };
        const pop = T.popover(anchor, h('div.stack.sp-pop', { style: { width: '240px' } },
          h('b', 'Talvez você quis dizer:'),
          h('div.sp-sugs', e.sug.map(sg => h('button.btn.sm.primary', { onclick: () => fix(sg) }, sg))),
          h('button.btn.sm', { onclick: () => { addToDict(w); pop.remove(); } }, icon('book'), 'Adicionar ao meu dicionário'),
          h('button.btn.sm.ghost', { onclick: () => { SP.ign.add(k); markSpelling(); pop.remove(); } }, 'Ignorar por agora')));
        setTimeout(() => anchor.remove(), 60);
      });
      function runAnalysis(){
        if (HLN) ['sl-1', 'sl-2', 'sl-3', 'sl-4', 'sl-5', 'an-weak'].forEach(k => CSS.highlights.delete(k));
        anHits = [];
        if (!AN.len && !AN.weak) { if (anPanel) { anPanel.remove(); anPanel = null; } return; }
        const hl = {}; if (HLN) ['sl-1', 'sl-2', 'sl-3', 'sl-4', 'sl-5', 'an-weak'].forEach(k => hl[k] = new Highlight());
        const counts = [0, 0, 0, 0, 0, 0]; let total = 0, words = 0;
        prose.querySelectorAll('section > p').forEach(p => {
          if (p.dataset.st) return;
          const map = textMap(p); const txt = map.txt; if (!txt.trim()) return;
          if (AN.len) {
            const re = /[^.!?…]+(?:[.!?…]+["”»’)]*|$)/g; let m;
            while ((m = re.exec(txt))) { const seg = m[0]; if (!seg.trim()) { if (!seg.length) re.lastIndex++; continue; }
              const lead = seg.length - seg.replace(/^\s+/, '').length; const a = m.index + lead, b = m.index + seg.replace(/\s+$/, '').length;
              const n = (txt.slice(a, b).match(/[\p{L}\p{N}]+(?:[-'’][\p{L}]+)*/gu) || []).length; if (!n) continue;
              const k = BUCKETS.find(x => n <= x[1])[0]; counts[k]++; total++; words += n;
              const r = rangeAt(map, a, b); if (r && HLN) hl['sl-' + k].add(r);
              if (!seg.length) re.lastIndex++;
            }
          }
          if (AN.weak) {
            const pats = [/(?<![\p{L}])([\p{L}]{3,})\s+([\p{L}]{4,}mente)(?![\p{L}])/gu, /(?<![\p{L}])([\p{L}]{4,}mente)\s+([\p{L}]{3,})(?![\p{L}])/gu, /(?<![\p{L}])(muito|bem|bastante|super)\s+([\p{L}]{4,})(?![\p{L}])/giu, /(?<![\p{L}])([\p{L}]{3,})\s+(de medo|de raiva|de alegria|de dor|de frio|em silêncio|com força|com cuidado|com calma|com pressa|sem parar|devagar|depressa|baixinho|alto)(?![\p{L}])/giu];
            const NOT = /^(somente|mente|semente|demente|clemente|frequentemente|simplesmente|apenas|realmente|exatamente|finalmente|novamente|certamente|provavelmente|talvez|que|como|e|o|a|os|as|um|uma|de|do|da|em|no|na|se|não)$/i;
            const seen = new Set();
            pats.forEach((re, pi) => { let m; while ((m = re.exec(txt))) {
              const w1 = m[1], w2 = m[2];
              if (pi === 0 && (NOT.test(w1) || NOT.test(w2))) continue;
              if (pi === 1 && (NOT.test(w1) || NOT.test(w2))) continue;
              const a = m.index, b = m.index + m[0].length; const key = a + ':' + b; if (seen.has(key)) continue; seen.add(key);
              const r = rangeAt(map, a, b); if (!r) continue; if (HLN) hl['an-weak'].add(r);
              const sent = (txt.slice(0, a).split(/[.!?…]\s/).pop() + txt.slice(a).split(/[.!?…](\s|$)/)[0]).slice(0, 260);
              anHits.push({ r, text: m[0], sentence: sent, p });
            } });
          }
        });
        if (HLN) for (const k in hl) if (hl[k].size) CSS.highlights.set(k, hl[k]);
        drawAnPanel(counts, total, words);
      }
      const anSoon = T.debounce(() => { if (!destroyed && (AN.len || AN.weak)) runAnalysis(); }, 700);
      prose.addEventListener('input', anSoon);
      function setAn(k){ AN[k] = !AN[k]; runAnalysis(); buildTools(); }
      function drawAnPanel(counts, total, words){
        if (!anPanel) { anPanel = h('div.an-panel.glass.glass-strong'); (composeOn && composeEls ? composeEls.wrap : ed).appendChild(anPanel); }
        const parts = [h('div.an-head', h('b', 'Análise do texto'), T.iconBtn('x', 'Desligar a análise', () => { AN.len = AN.weak = false; runAnalysis(); buildTools(); }, '.sm'))];
        if (AN.len) {
          const avg = total ? Math.round(words / total) : 0;
          const mx = Math.max(1, ...counts.slice(1));
          parts.push(h('div.an-sec', h('div.an-t', 'Tamanho das frases · média ' + avg + ' palavras'),
            ...BUCKETS.map(([k, , l]) => h('div.an-row', h('i.an-dot.b' + k), h('span.grow', l), h('span.an-bar', h('i', { style: { width: (counts[k] / mx * 100) + '%' } })), h('b.num', String(counts[k])))),
            h('p.an-tip', total < 4 ? 'Escreva mais algumas frases para ver o ritmo.' : (counts[4] + counts[5]) / total > .45 ? 'Muitas frases longas seguidas: quebre algumas para dar fôlego.' : (counts[1] + counts[2]) / total > .7 ? 'Quase tudo curto: junte algumas frases para o texto não ficar picado.' : 'Boa variação. Misturar curtas e longas deixa a leitura com ritmo.')));
        }
        if (AN.weak) {
          parts.push(h('div.an-sec', h('div.an-t', 'Verbo fraco + advérbio · ' + anHits.length),
            anHits.length ? h('div.an-list', anHits.slice(0, 60).map(x => h('button.an-hit', { type: 'button', title: 'Ver opções mais fortes', onclick: (e) => strongOptions(x, e.currentTarget) }, '“' + x.text + '”'))) : h('p.an-tip', 'Nenhum par encontrado neste texto. 👏')));
        }
        anPanel.replaceChildren(...parts);
      }
      async function strongOptions(x, btn){
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(x.r.cloneRange());
        if (mode === 'book') bookFollowCaret(); else if (mode !== 'tw') { const er = scroll.getBoundingClientRect(), rr = x.r.getBoundingClientRect(); if (rr.top < er.top + 80 || rr.bottom > er.bottom - 60) scroll.scrollTop += rr.top - er.top - er.height * .4; } else twFollow();
        const body = h('div.syn-body', h('div.syn-wait', h('span.syn-spin'), 'Procurando um jeito mais forte de dizer “' + x.text + '”…'));
        document.querySelector('.syn-pop')?.remove();
        const pop = h('div.syn-pop.glass.glass-strong', h('div.syn-h', icon('spark'), h('b.grow', x.text), T.iconBtn('x', 'Fechar', () => pop.remove(), '.sm')), body);
        pop.addEventListener('mousedown', (e) => e.preventDefault());
        document.body.appendChild(pop);
        const rr = x.r.getBoundingClientRect(); pop.style.left = T.clamp(rr.left, 10, innerWidth - 400) + 'px'; pop.style.top = Math.min(innerHeight - 260, rr.bottom + 10) + 'px';
        try {
          const out = await T.AI.json('Você revisa ficção em português do Brasil. Na frase: "' + x.sentence + '", o trecho "' + x.text + '" usa um verbo fraco com advérbio (ou intensificador). Sugira de 5 a 8 substituições com UM verbo (ou expressão curta) mais forte e preciso que já carregue o sentido do advérbio, conjugadas para encaixar direto no lugar do trecho (ex.: "tremeu de medo" → "estremeceu", "tiritou", "encolheu-se"; "falou baixinho" → "sussurrou", "murmurou"). Diga a nuance de cada uma em poucas palavras. Responda SÓ com JSON: {"opcoes":[{"texto":"...","nuance":"..."}]}');
          const ops = (out?.opcoes || []).filter(o => o && o.texto);
          body.replaceChildren(ops.length ? h('div.syn-ws', ops.map(o => h('button.syn-w', { type: 'button', title: o.nuance || '', onclick: () => {
            const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(x.r); prose.focus({ preventScroll: true }); document.execCommand('insertText', false, o.texto); normalize(); save(); pop.remove(); runAnalysis();
          } }, o.texto, o.nuance ? h('small', ' · ' + o.nuance) : null))) : h('p.muted.syn-msg', 'Sem sugestões para este trecho.'), h('p.syn-foot', 'Clique para trocar no texto. Ctrl+Z desfaz.'));
        } catch (e) { body.replaceChildren(h('p.muted.syn-msg', T.AI.errText(e))); }
        const off = (e) => { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('mousedown', off, true); } };
        setTimeout(() => document.addEventListener('mousedown', off, true), 0);
      }

      /* ----- marca-texto colorido ----- */
      const HL = [['amarelo', 'Amarelo'], ['verde', 'Verde'], ['azul', 'Azul'], ['rosa', 'Rosa'], ['laranja', 'Laranja'], ['roxo', 'Roxo'], ['cinza', 'Cinza']];
      function hlPalette(anchor){
        const sel = getSelection(); if (!sel.rangeCount || sel.isCollapsed) return;
        const range = sel.getRangeAt(0).cloneRange();
        const apply = (k) => {
          const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(range);
          const node = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
          const ex = node.closest('mark');
          if (ex && prose.contains(ex)) { if (k) ex.dataset.hl = k; else ex.replaceWith(...ex.childNodes); normalize(); save(); hideSelPop(); pop.remove(); return; }
          if (!k) { pop.remove(); return; }
          // tira marcas antigas dentro do trecho antes de pintar de novo
          const frag = range.cloneContents(); if (frag.querySelector && frag.querySelector('mark')) { const tmp = document.createElement('div'); tmp.appendChild(range.extractContents()); tmp.querySelectorAll('mark').forEach(m => m.replaceWith(...m.childNodes)); const f2 = document.createDocumentFragment(); [...tmp.childNodes].forEach(n => f2.appendChild(n)); range.insertNode(f2); }
          const el = wrapSel('mark', { 'data-hl': k }); pop.remove();
          if (el) S().setPrefs({ lastHl: k });
        };
        const pop = h('div.hl-pop.glass.glass-strong', { role: 'menu' },
          ...HL.map(([k, l]) => h('button.hl-sw', { type: 'button', title: l, 'aria-label': 'Marcar de ' + l.toLowerCase(), 'data-hl': k, onmousedown: (e) => e.preventDefault(), onclick: () => apply(k) })),
          h('button.hl-sw.off', { type: 'button', title: 'Tirar o marca-texto', 'aria-label': 'Tirar o marca-texto', onmousedown: (e) => e.preventDefault(), onclick: () => apply(null) }, '⌫'));
        document.querySelectorAll('.hl-pop').forEach(x => x.remove());
        (composeOn && composeEls ? composeEls.wrap : document.body).appendChild(pop);
        const r = anchor.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(innerWidth - 300, r.left - 40)) + 'px'; pop.style.top = (r.bottom + 8) + 'px';
        const off = (e) => { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('mousedown', off, true); } };
        setTimeout(() => document.addEventListener('mousedown', off, true), 0);
      }
      /* ----- estilos de parágrafo (texto normal, títulos) e guia do documento ----- */
      const PSTYLES = [['', 'Texto normal'], ['t1', 'Título 1'], ['t2', 'Título 2'], ['t3', 'Título 3'], ['sub', 'Subtítulo']];
      function curBlock(){ const sel = getSelection(); if (!sel.rangeCount || !prose.contains(sel.anchorNode)) return null; const n = sel.anchorNode; return (n.nodeType === 1 ? n : n.parentElement).closest('section > p'); }
      function setPStyle(k){
        restoreSel(); const sel = getSelection(); if (!sel.rangeCount) return;
        const r = sel.getRangeAt(0);
        const blocks = [...prose.querySelectorAll('section > p')].filter(p => r.intersectsNode(p));
        if (!blocks.length) { const b = curBlock(); if (b) blocks.push(b); }
        if (!blocks.length) { T.toast('Clique no parágrafo que quer mudar.'); return; }
        blocks.forEach(p => { if (k) p.dataset.st = k; else p.removeAttribute('data-st'); });
        save(); buildTools(); outlineSoon();
      }
      let outline = null;
      function toggleOutline(){ const on = !S().prefs().outline; S().setPrefs({ outline: on }); drawOutline(); buildTools(); }
      function drawOutline(){
        const on = !!S().prefs().outline && !composeOn;
        if (!on) { if (outline) { outline.remove(); outline = null; } ed.classList.remove('outline-on'); return; }
        if (!outline) { outline = h('nav.doc-outline.glass', { 'aria-label': 'Guia do documento' }); ed.appendChild(outline); }
        ed.classList.add('outline-on');
        const items = [];
        prose.querySelectorAll('section').forEach(sec => {
          const d = S().get(sec.dataset.id);
          if (d && d.id !== item.id && d.title) items.push({ lv: 0, t: d.title, el: sec, kind: d.type });
          sec.querySelectorAll(':scope > p[data-st]').forEach(p => { const t = p.textContent.trim(); if (t) items.push({ lv: { t1: 1, t2: 2, t3: 3, sub: 3 }[p.dataset.st], t, el: p, kind: p.dataset.st }); });
        });
        outline.replaceChildren(h('div.do-head', h('b', 'Guia do documento'), T.iconBtn('x', 'Fechar o guia', () => toggleOutline(), '.sm')),
          items.length ? h('div.do-list', items.map(x => h('button.do-item.lv' + x.lv + (x.kind === 'sub' ? '.sub' : ''), { type: 'button', title: x.t, onclick: () => jumpTo(x.el) }, x.t))) :
            h('p.muted.do-empty', 'Os títulos que você marcar no texto (Título 1, 2, 3 ou Subtítulo, no botão de estilo da barra) aparecem aqui, junto com as cenas. Clique para ir direto ao trecho.'));
      }
      function jumpTo(el){
        const r = document.createRange(); r.selectNodeContents(el); r.collapse(true);
        prose.focus({ preventScroll: true }); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        if (mode === 'book') bookFollowCaret(); else if (mode === 'tw') twFollow(); else { const er = scroll.getBoundingClientRect(), rr = el.getBoundingClientRect(); scroll.scrollTop += rr.top - er.top - 90; }
      }
      const outlineSoon = T.debounce(() => { if (!destroyed && outline) drawOutline(); }, 500);
      prose.addEventListener('input', outlineSoon);
      async function addComment(){
        const sel = getSelection(); if (!sel.rangeCount || sel.isCollapsed || !prose.contains(sel.anchorNode)) { T.toast('Selecione o trecho que quer comentar.'); return; }
        const range = sel.getRangeAt(0).cloneRange();
        const sec = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement).closest('section');
        if (!sec) return;
        const quote = sel.toString().slice(0, 140);
        if (rail && rail.draft) rail.cancelDraft();
        const cid = T.id();
        const el = wrapSel('span', { class: 'cmt', 'data-c': cid }); if (!el) return;
        if (S().prefs().cmtRail === false) S().setPrefs({ cmtRail: true });
        if (inspectorOpen) toggleInspector();
        updateRail(true);
        rail.startDraft(el, sec.dataset.id, quote);
      }
      /* lateral de comentários */
      const RAILW = 300;
      function spanVisible(sp){
        const box = (composeOn && composeEls ? composeEls.sc : mode === 'book' && bookEls ? bookEls.clip : scroll).getBoundingClientRect();
        for (const r of sp.getClientRects()) if (r.width > 0 && r.right > box.left + 1 && r.left < box.right - 1 && r.bottom > box.top && r.top < box.bottom) return r;
        return null;
      }
      let composeEls = null;
      function updateRail(force){
        if (!rail) return;
        const host = composeOn ? composeEls?.wrap : ed;
        const want = !!host && !destroyed && (composeOn || !inspectorOpen) && S().prefs().cmtRail !== false && (force || rail.draft || rail.count() > 0);
        const was = ed.classList.contains('rail-on');
        ed.classList.toggle('rail-on', !!want && !composeOn);
        if (composeEls) { composeEls.wrap.classList.toggle('rail-on', !!want && composeOn); composeEls.refresh && composeEls.refresh(); }
        if (want && rail.el.parentElement !== host) host.appendChild(rail.el);
        if (!want && rail.el.isConnected) rail.el.remove();

        if (want) { rail.build(); requestAnimationFrame(() => rail.layout()); }
      }
      // limpa marcas sem comentário e acerta as marcas resolvidas
      function syncMarks(){
        let changed = false;
        prose.querySelectorAll('span.cmt[data-c]').forEach(sp => {
          const f = T.Comments.find(item.pid, sp.dataset.c);
          if (!f) { if (!(rail && rail.draft && rail.draft.cid === sp.dataset.c)) { sp.replaceWith(...sp.childNodes); changed = true; } return; }
          sp.classList.toggle('cmt-res', !!f.c.resolved); sp.classList.remove('cmt-on');
        });
        if (changed) save();
      }
      function focusComment(cid){
        const sp = prose.querySelector('span.cmt[data-c="' + cid + '"]'); if (!sp) return false;
        const r = document.createRange(); r.setStart(sp, 0); r.collapse(true);
        prose.focus({ preventScroll: true }); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        if (mode === 'book') bookFollowCaret(); else if (mode === 'tw') twFollow(); else { const er = scroll.getBoundingClientRect(), rr = sp.getBoundingClientRect(); scroll.scrollTop += rr.top - er.top - er.height * .4; }
        const f = T.Comments.find(item.pid, cid);
        if (f && !f.c.resolved) {
          if (S().prefs().cmtRail === false) S().setPrefs({ cmtRail: true });
          if (inspectorOpen) toggleInspector();
          updateRail(); rail.activate(cid); setTimeout(() => rail && rail.layout(), 600);
        } else { sp.classList.add('cmt-flash'); setTimeout(() => sp.classList.remove('cmt-flash'), 1800); }
        return true;
      }
      const railCtx = {
        ed, prose, pid: item.pid, spanVisible,
        compact: () => {
          const host = composeOn ? composeEls?.wrap.querySelector('.c-paper') : mode === 'book' ? bookEls?.spreadEl : mode === 'tw' ? scroll.querySelector('.tw-sheet') : scroll.querySelector('.page');
          const box = (composeOn ? composeEls?.wrap : ed)?.getBoundingClientRect(); if (!host || !box) return false;
          return box.right - host.getBoundingClientRect().right < 304;
        },
        onChange: () => { save(); updateRail(); },
        onToggle: () => { updateRail(); T.toast('Comentários escondidos. Para mostrar de novo: Ferramentas › Mostrar comentários na lateral.'); },
        ids: () => docs.map(d => d.id),
        has: (cid) => !!prose.querySelector('span.cmt[data-c="' + cid + '"]'),
        focus: (cid) => focusComment(cid),
        resolve: (cid) => rail.resolve(cid), reopen: (cid) => rail.reopen(cid), removeNow: (cid) => rail.removeNow(cid),
      };
      rail = T.Comments.rail(railCtx);
      scroll.addEventListener('scroll', () => { if (rail && rail.el.isConnected) rail.layout(); }, { passive: true });
      prose.addEventListener('input', () => { if (rail && rail.el.isConnected) requestAnimationFrame(() => rail.layout()); });
      prose.addEventListener('keydown', (e) => {
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
        const al = e.shiftKey && { KeyL: 'l', KeyE: 'c', KeyR: 'r', KeyJ: 'j' }[e.code];
        if (al) { e.preventDefault(); e.stopPropagation(); alignPara(al); buildTools(); return; }
        if (!e.shiftKey && (e.key === ']' || e.code === 'BracketRight')) { e.preventDefault(); indentPara(1); }
        else if (!e.shiftKey && (e.key === '[' || e.code === 'BracketLeft')) { e.preventDefault(); indentPara(-1); }
      });
      prose.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'm' || e.key === 'M' || e.code === 'KeyM')) { e.preventDefault(); addComment(); } });
      document.addEventListener('keydown', function bmKey(e){ if (destroyed) { document.removeEventListener('keydown', bmKey); return; } if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyP' && ed.contains(document.activeElement) || ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyP' && document.activeElement === document.body && ed.isConnected && ed.offsetParent)) { const last = S().get(item.id)?.meta?.lastPos; if (last) { e.preventDefault(); goToPos(last); } } });
      let tip = null;
      function showCommentTip(el){
        if (ed.classList.contains('rail-on') || el.classList.contains('cmt-res')) return;
        const f = T.Comments.find(item.pid, el.dataset.c); const c = f?.c; if (!c || c.resolved) return;
        if (tip) tip.remove();
        const r = el.getBoundingClientRect();
        tip = h('div.menu.glass.glass-strong', { style: { left: Math.min(r.left, innerWidth - 300) + 'px', top: (r.bottom + 6) + 'px', maxWidth: '280px', padding: '10px 12px', fontSize: '13px' } }, c.text);
        document.body.appendChild(tip);
        el.addEventListener('mouseleave', () => { if (tip) { tip.remove(); tip = null; } }, { once: true });
      }

      /* ----- ficha / comentários / versões ----- */
      let insp = null, inspTarget = null;
      function currentSectionItem(){
        const sel = getSelection();
        if (sel.rangeCount && prose.contains(sel.anchorNode)) { const n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement; const s = n.closest('section'); if (s) return S().get(s.dataset.id); }
        return S().get(docs[0]?.id) || item;
      }
      function toggleInspector(){ inspectorOpen = !inspectorOpen; if (!inspectorOpen && insp) { insp.remove(); insp = null; } else renderInspector(); buildTools(); updateRail(); }
      function refreshInspectorTarget(){ const t = currentSectionItem(); if (t && t.id !== inspTarget) renderInspector(); }
      function renderInspector(){
        if (insp) insp.remove();
        const it = currentSectionItem(); inspTarget = it.id;
        const povs = [...new Set(S().all(item.pid).map(i => i.meta?.pov).filter(Boolean))];
        const dl = h('datalist#povs-' + item.id, povs.map(p => h('option', { value: p })));
        const upd = (patch) => { S().update(it.id, patch); T.emit('meta-changed', it.id); };
        const title = h('input.input', { value: it.title || '', 'aria-label': 'Título' }); title.onchange = () => upd({ title: title.value });
        const syn = h('textarea.textarea', { placeholder: 'Sinopse: o que acontece aqui, em uma ou duas frases.' }); syn.value = it.meta?.synopsis || ''; syn.onchange = () => upd({ meta: { synopsis: syn.value } });
        const pov = h('input.input', { value: it.meta?.pov || '', list: 'povs-' + item.id, placeholder: 'quem narra' }); pov.onchange = () => upd({ meta: { pov: pov.value.trim() } });
        const st = h('select.select', ['rascunho', 'revisando', 'pronto'].map(s => h('option', { value: s, selected: (it.meta?.status || 'rascunho') === s }, s))); st.onchange = () => upd({ meta: { status: st.value } });
        const tens = h('input.range', { type: 'range', min: 0, max: 10, value: it.meta?.tension ?? 5 }); const tv = h('b.num', String(it.meta?.tension ?? 5));
        tens.oninput = () => tv.textContent = tens.value; tens.onchange = () => upd({ meta: { tension: +tens.value } });
        const comments = T.Comments.all(item.pid).filter(x => !x.c.resolved && (x.it.id === it.id || prose.querySelector('section[data-id="' + it.id + '"] span.cmt[data-c="' + x.cid + '"]'))).map(x => [x.cid, x.c]);
        const snaps = S().all(item.pid).filter(s => s.type === 'snapshot' && s.parent === it.id).sort((a, b) => b.created - a.created);
        insp = h('aside.inspector.glass.glass-strong',
          h('div.row', h('h3.grow', 'Ficha do capítulo'), T.iconBtn('x', 'Fechar', () => toggleInspector(), '.sm')),
          h('label.field', 'Título', title), h('label.field', 'Sinopse', syn),
          h('div.row', h('label.field.grow', 'Ponto de vista', pov), h('label.field.grow', 'Situação', st)), dl,
          h('label.field', h('span', 'Tensão da cena: ', tv, '/10'), tens),
          h('div.field', h('span', 'Data na história'), T.Cal.datePicker(T.Cal.cfg(item.pid), it.meta?.date, (v) => { upd({ meta: { date: v } }); T.emit('cal-changed', item.pid); }, { clear: true }),
            it.meta?.date ? h('span.muted', { style: { fontSize: '12px' } }, T.Cal.fmt(T.Cal.cfg(item.pid), it.meta.date, { long: true })) : h('span.muted', { style: { fontSize: '12px' } }, 'Com data, a cena aparece na timeline.')),
          h('div.row', h('h3.grow', 'Comentários abertos (' + comments.length + ')'), h('button.btn.sm', { type: 'button', onclick: () => T.Comments.panel(item.pid, { here: railCtx }) }, 'Ver todos')),
          comments.length ? h('div.stack', comments.map(([cid, c]) => h('div.cmt-item', { onclick: () => { if (inspectorOpen) toggleInspector(); focusComment(cid); } },
            c.quote ? h('q', c.quote) : null, c.text,
            h('div.row', { style: { marginTop: '6px' } }, h('span.muted.grow', { style: { fontSize: '11px' } }, T.relTime(c.date)), h('button.btn.sm', { onclick: (e) => { e.stopPropagation(); resolveComment(it, cid); } }, icon('check'), 'Resolver'))))) : h('p.muted', { style: { margin: 0, fontSize: '12.5px' } }, 'Selecione um trecho e toque em comentar.'),
          h('h3', 'Versões (' + snaps.length + ')'),
          h('button.btn.sm', { onclick: () => snapshot() }, icon('camera'), 'Salvar versão agora'),
          snaps.length ? h('div.stack', snaps.slice(0, 20).map(s => h('div.snap-item', h('span.grow', s.title || T.dateLabel(s.created), h('br'), h('span.muted.num', { style: { fontSize: '11px' } }, T.fmt(T.words(s.body)) + ' palavras')),
            h('button.btn.sm', { onclick: () => { save.flush(); T.Versions.browse(it, () => rerender(), s.id); } }, 'Abrir'),
            T.iconBtn('trash', 'Apagar versão', async () => { if (await T.confirm('Apagar esta versão?', null, 'Apagar', true)) { S().remove(s.id); renderInspector(); } }, '.sm')))) : null,
        );
        ed.appendChild(insp);
      }
      function resolveComment(it, cid){
        rail.resolve(cid); save.flush(); renderInspector();
      }
      async function snapshot(){
        save.flush();
        const it = currentSectionItem();
        const label = await T.ask('Salvar versão de “' + (it.title || 'cena') + '”', { placeholder: 'ex.: antes de reescrever o final', value: T.dateLabel(Date.now()), ok: 'Salvar versão' });
        if (label == null) return;
        S().create({ pid: item.pid, type: 'snapshot', area: 'snap', parent: it.id, title: label, body: S().get(it.id).body || '' });
        T.toast('Versão salva.');
        if (inspectorOpen) renderInspector();
      }
      function compare(it, snap){
        save.flush();
        const cur = S().get(it.id).body || '';
        T.modal((box, close) => {
          box.append(h('h2', 'Comparar versões'), h('p.sub', '“' + (snap.title || '') + '” comparada com o texto atual. ', h('ins', { style: { background: 'hsl(140 60% 50% / .25)', textDecoration: 'none' } }, 'verde'), ' = entrou depois; ', h('del', { style: { background: 'hsl(350 80% 60% / .22)' } }, 'vermelho'), ' = saiu.'),
            h('div.diff', { html: T.diffHTML(snap.body || '', cur) }),
            h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Fechar'),
              h('button.btn.primary', { onclick: async () => { if (await T.confirm('Voltar para esta versão?', 'O texto atual vira uma nova versão salva, então nada se perde.', 'Restaurar')) {
                S().create({ pid: item.pid, type: 'snapshot', area: 'snap', parent: it.id, title: 'Antes de restaurar · ' + T.dateLabel(Date.now()), body: cur });
                S().update(it.id, { body: snap.body, meta: { words: T.words(snap.body) } });
                close(); rerender(); } } }, icon('history'), 'Restaurar esta versão')));
        }, { wide: true });
      }

      /* ----- dividir cena ----- */
      async function splitScene(){
        const sel = getSelection(); if (!sel.rangeCount || !prose.contains(sel.anchorNode)) { T.toast('Clique no ponto do texto onde a nova cena deve começar.'); return; }
        const n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement; const sec = n.closest('section'); if (!sec) return;
        const it = S().get(sec.dataset.id);
        if (it.type !== 'scene' && it.type !== 'doc') { T.toast('Dá para dividir cenas; este trecho é do próprio capítulo.'); return; }
        const keep = sel.getRangeAt(0).cloneRange();
        if (!await T.confirm('Dividir “' + (it.title || 'cena') + '” em duas?', 'O texto a partir do cursor vira uma cena nova logo depois desta. Dá para desfazer em seguida ou juntar as cenas depois.', 'Dividir')) return;
        sel.removeAllRanges(); sel.addRange(keep);
        const r = document.createRange(); r.setStart(sel.anchorNode, sel.anchorOffset); r.setEndAfter(sec.lastChild);
        const frag = r.extractContents(); const tmp = h('div'); tmp.appendChild(frag);
        cleanSection(sec);
        const body = tmp.innerHTML;
        save.flush();
        const sibs = S().children(it.pid, it.parent);
        const idx = sibs.findIndex(s => s.id === it.id); const nextO = sibs[idx + 1]?.order ?? (it.order + 1000);
        const ns = S().create({ pid: it.pid, type: it.type, area: it.area, parent: it.parent, order: (it.order + nextO) / 2, title: (it.title || 'Cena') + ' (cont.)', body, meta: { words: T.words(body), pov: it.meta?.pov } });
        T.toast('Cena dividida em duas.', { ms: 9000, action: { label: 'Desfazer', fn: () => { T.Shell.flushEditors(); T.MS.join(it.id, ns.id, ''); T.toast('Divisão desfeita.'); } } });
        T.emit('tree-changed');
        if (item.id === it.id) T.Shell.open({ kind: 'doc', ref: it.parent || it.id }, { replace: tab }); else rerender();
      }

      async function joinWithNext(){
        save.flush();
        const it = currentSectionItem();
        const sibs = S().children(it.pid, it.parent); const nx = sibs[sibs.findIndex(x => x.id === it.id) + 1];
        if (!nx || (nx.type !== 'scene' && nx.type !== 'doc')) { T.toast('Não há uma cena logo depois desta.'); return; }
        const sepYes = await T.confirm('Juntar “' + (it.title || 'cena') + '” com “' + (nx.title || 'cena') + '”?', 'O texto da segunda cena vai para o fim da primeira, e a segunda some da lista. Quer um ornamento de quebra de cena (⁂) entre as duas?', 'Juntar com ⁂');
        if (!sepYes) { if (!await T.confirm('Juntar sem ornamento?', 'O texto continua direto, como se nunca tivesse sido dividido.', 'Juntar direto')) return; }
        T.MS.join(it.id, nx.id, sepYes ? '<hr>' : '');
        T.toast('Cenas juntas.');
      }

      /* ----- ler em voz alta ----- */
      function readAloud(){
        if (reading) { T.Narr.stop(); return; }
        const ps = [...prose.querySelectorAll('section p')].filter(p => p.textContent.trim());
        let i = 0; const sel = getSelection();
        if (sel.rangeCount && prose.contains(sel.anchorNode)) { const n = (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement).closest('p'); const k = ps.indexOf(n); if (k >= 0) i = k; }
        reading = { on: true }; buildTools();
        const here = currentSectionItem();
        const c = S().prefs().narr || {};
        if (c.useRec !== false && T.Narr.hasRec(here)) { T.Narr.playRec(here, () => { reading = null; if (!destroyed) buildTools(); }); return; }
        T.Narr.read(ps.slice(i), { pid: item.pid,
          onPara: (p) => { prose.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); if (p) { p.classList.add('reading'); p.scrollIntoView({ block: 'center', behavior: 'smooth' }); } },
          onEnd: () => { reading = null; prose.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); if (!destroyed) buildTools(); },
        });
      }

      /* ----- composição ----- */
      function openCompose(){
        save.flush();
        composeOn = true;
        const back = prose.parentElement;
        prose.className = 'prose'; prose.removeAttribute('style');
        updateRail(); applyBg();
        T.Compose.open({ item, prose,
          onMount: (wrap, sc, refresh) => { composeEls = { wrap, sc, refresh }; sc.addEventListener('scroll', () => { if (rail && rail.el.isConnected) rail.layout(); }, { passive: true }); updateRail(); setTimeout(marksSoon, 80); },
          comments: {
            count: () => rail ? rail.count() : 0,
            shown: () => S().prefs().cmtRail !== false,
            toggle: () => { S().setPrefs({ cmtRail: S().prefs().cmtRail === false }); updateRail(); if (S().prefs().cmtRail !== false && rail.count() === 0) T.toast('Ainda não há comentários abertos neste texto. Selecione um trecho e toque no balão.'); },
            all: () => T.Comments.panel(item.pid, { here: railCtx }),
          },
          onClose: () => { composeOn = false; if (composeEls) composeEls.wrap.classList.remove('rail-on'); composeEls = null; if (rail && rail.el.isConnected) rail.el.remove(); back.appendChild(prose); applyMode(); } });
      }

      function rerender(){ docs = T.MS.docs(S().get(item.id) || item); render(); decorate && decorate(); }
      const offItems = T.on('items', (ev) => {
        if (destroyed || !ev.id) return;
        if (ev.kind === 'remove' && ev.id === item.id) return;
        const mine = docs.some(d => d.id === ev.id) || ev.item?.parent === item.id || ev.id === item.id;
        if (!mine) return;
        if (ev.patch && 'body' in ev.patch && document.activeElement !== prose) rerender();
        else if (ev.kind === 'create' && ev.item?.type !== 'snapshot') rerender();
        else if (ev.patch && 'title' in ev.patch) { const hd = prose.querySelector('h1.ch-title'); if (hd && !document.activeElement?.closest?.('.inspector')) { const nh = heading(); if (nh) hd.replaceWith(nh); } }
      });
      const offFind = T.on('find-focus', (q) => { if (q.tab === tab) highlightFirst(q.text); });
      function highlightFirst(q){
        if (!q) return;
        const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
        let n; const ql = q.toLowerCase();
        while ((n = walker.nextNode())) {
          const k = n.textContent.toLowerCase().indexOf(ql);
          if (k >= 0) { const r = document.createRange(); r.setStart(n, k); r.setEnd(n, k + q.length); const sel = getSelection(); prose.focus({ preventScroll: true }); sel.removeAllRanges(); sel.addRange(r); const rr = r.getBoundingClientRect(); if (mode === 'normal') { const er = scroll.getBoundingClientRect(); scroll.scrollTop += rr.top - er.top - er.height / 2; } if (mode === 'book') bookFollowCaret(); if (mode === 'tw') twFollow(); return; }
        }
      }

      const offHover = T.Ent.hover(prose, item.pid);
      const closeAC = T.Ent.autocomplete(prose, item.pid, () => save());
      const decorate = T.debounce(() => { if (!destroyed) T.Ent.decorate(prose, item.pid); }, 700);
      prose.addEventListener('input', decorate);
      const offEnt = T.on('items', (ev) => { if (['page', 'word', 'lang'].includes(ev.item?.type)) decorate(); });
      render();
      decorate();
      const jump = T._bookJump && T._bookJump.ref === item.id ? T._bookJump : null; if (jump) T._bookJump = null;
      setTimeout(() => { if (jump && mode === 'book') { go(jump.end ? maxSpreadNow() : 0, false); setTimeout(() => { if (!destroyed && mode === 'book') go(jump.end ? maxSpreadNow() : 0, false); }, 400); return; } if (!destroyed) { const lp = !tab.find && !T._cmtFocus ? S().get(item.id)?.meta?.lastPos : null; if (lp && rangeOfPos(lp)) setTimeout(() => { if (!destroyed) goToPos(lp); }, mode === 'book' ? 350 : 40); else placeCaretEnd(true); } if (tab.find) highlightFirst(tab.find); if (T._cmtFocus && !destroyed) { const c = T._cmtFocus; T._cmtFocus = null; setTimeout(() => focusComment(c), 120); } }, 60);
      document.fonts && document.fonts.ready.then(() => { if (mode === 'book') layoutBook(); if (mode === 'tw') twFollow(); });

      return {
        destroy(){ destroyed = true; save.flush(); docs.forEach(d => { const x = S().get(d.id); if (x) T.Versions.auto(item.pid, d.id, x.body || '', true); }); offView(); toolsObs.disconnect(); offHover(); closeAC(); offEnt(); T.Ent.undecorate(prose); document.removeEventListener('selectionchange', onSel); document.removeEventListener('mousemove', clearTyping); offItems(); offFind(); resizeObs && resizeObs.disconnect(); hideSelPop(); if (reading) T.Narr.stop(); if (rail) rail.destroy(); if (fb) fb.close(); try { if (dictOn) { if (dict) dict.stop().catch(() => {}); if (dictRec) dictRec.stop(); } } catch (e) {} dictPartial(''); if (HLN) ['sl-1', 'sl-2', 'sl-3', 'sl-4', 'sl-5', 'an-weak'].forEach(k => CSS.highlights.delete(k)); if (anPanel) anPanel.remove(); offFocus(); offTargets(); offBgItems(); if (bgStop) bgStop(); if (bgLayStop) bgLayStop(); },
        flush(){ save.flush(); },
        focus(){ prose.focus(); },
      };
    }
  };

  /* ---------- comparação de versões (parágrafos e depois palavras) ---------- */
  function lcs(a, b){
    const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const ops = []; let i = 0, j = 0;
    while (i < n && j < m) { if (a[i] === b[j]) { ops.push(['=', a[i]]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push(['-', a[i]]); i++; } else { ops.push(['+', b[j]]); j++; } }
    while (i < n) ops.push(['-', a[i++]]); while (j < m) ops.push(['+', b[j++]]);
    return ops;
  }
  const paras = (html) => T.htmlToText(html).split(/\n+/).map(s => s.trim()).filter(Boolean);
  T.diffHTML = (oldHtml, newHtml) => {
    const A = paras(oldHtml), B = paras(newHtml);
    if (A.length * B.length > 250000) return '<p>Texto grande demais para comparar de uma vez. Compare cenas menores.</p>';
    const ops = lcs(A, B); let out = '';
    for (let k = 0; k < ops.length; k++) {
      const [op, s] = ops[k];
      if (op === '=') { out += '<p>' + T.esc(s) + '</p>'; continue; }
      if (op === '-' && ops[k + 1] && ops[k + 1][0] === '+') {
        const wa = s.split(/(\s+)/), wb = ops[k + 1][1].split(/(\s+)/);
        if (wa.length * wb.length < 400000) { out += '<p>' + lcs(wa, wb).map(([o, w]) => o === '=' ? T.esc(w) : o === '-' ? '<del>' + T.esc(w) + '</del>' : '<ins>' + T.esc(w) + '</ins>').join('') + '</p>'; k++; continue; }
      }
      out += '<p>' + (op === '-' ? '<del>' : '<ins>') + T.esc(s) + (op === '-' ? '</del>' : '</ins>') + '</p>';
    }
    return out || '<p class="muted">As duas versões são iguais.</p>';
  };

  /* ======================================================================= */
  /* Modo composição: texto flutuando sobre cena animada, imagem ou vídeo     */
  T.Compose = {
    open({ item, prose, onClose, onMount, comments }){
      const proj = S().get(item.pid);
      const cfg = Object.assign({ bg: { kind: 'scene', id: 'chuva-quente' }, paper: 18, blur: 6, dim: 25, width: 720, light: true, shadow: true, layers: [] }, proj.meta?.compose || {});
      if (!Array.isArray(cfg.layers)) cfg.layers = [];
      if (item.meta?.bg) cfg.bg = item.meta.bg;
      const wrap = h('div.compose');
      const bgHost = h('div', { style: { position: 'absolute', inset: '0' } });
      const dim = h('div.bg-dim');
      const layerCv = h('canvas.scene-layer');
      const paper = h('div.c-paper', prose);
      const sc = h('div.c-scroll', paper);
      const toolsEl = h('div.c-tools.glass');
      const close = h('button.icon-btn.glass.c-close', { title: 'Sair do modo composição (Esc)' }, icon('x'));
      wrap.append(bgHost, dim, layerCv, sc, toolsEl, close);
      document.getElementById('layer-modal').appendChild(wrap);
      let stopScene = null, stopLayers = null, picker = null, pickTab = 'todos';
      function setLayers(){ if (stopLayers) stopLayers(); stopLayers = null; requestAnimationFrame(() => { stopLayers = T.SceneLayers.start(layerCv, cfg.layers); }); }

      let liveStream = null;
      const canCapture = (() => { try { const md = navigator.mediaDevices; if (!md || !md.getDisplayMedia) return false; const pol = document.permissionsPolicy || document.featurePolicy; if (pol && pol.allowsFeature && !pol.allowsFeature('display-capture')) return false; return true; } catch (e) { return false; } })();
      function stopLive(){ if (liveStream) { liveStream.getTracks().forEach(t => t.stop()); liveStream = null; } }
      async function startLive(){
        const md = navigator.mediaDevices;
        if (!md || !md.getDisplayMedia) { T.toast('Este navegador não deixa mostrar outra aba aqui. No Chrome ou Edge do computador funciona.'); return false; }
        try {
          const st = await md.getDisplayMedia({ video: { frameRate: 30 }, audio: false, preferCurrentTab: false, selfBrowserSurface: 'exclude', surfaceSwitching: 'include' });
          stopLive(); liveStream = st;
          st.getVideoTracks()[0]?.addEventListener('ended', () => { if (liveStream === st) { liveStream = null; if (cfg.bg.kind === 'screen') { setBg(); T.toast('A aba parou de ser mostrada. Escolha de novo em Fundos › Vídeo ao vivo.'); } } });
          cfg.bg = { kind: 'screen', name: 'Vídeo ao vivo' };
          if (cfg.paper > 30) cfg.paper = 8; if (cfg.dim > 30) cfg.dim = 15;
          setBg(); style(); persist(); buildTools(); if (picker) openPicker();
          return true;
        } catch (e) {
          if (e && e.name === 'NotAllowedError' && /policy|permission/i.test(e.message || '') ) T.toast('O navegador bloqueou a captura de tela nesta página. Abra o Entrelinhas numa aba própria (fora da conversa) e tente de novo.');
          else if (e && e.name === 'NotAllowedError') T.toast('Nada foi escolhido. Toque de novo quando quiser escolher a aba.');
          else T.toast('Não deu para mostrar a aba: ' + ((e && e.message) || 'erro desconhecido'));
          return false;
        }
      }
      function setBg(){
        if (stopScene) { stopScene(); stopScene = null; } bgHost.innerHTML = ''; bgHost.style.background = '';
        const b = cfg.bg || {};
        if (b.kind === 'screen') {
          if (liveStream) { const v = h('video.bg-media.bg-live', { autoplay: true, muted: true, playsinline: true }); v.muted = true; v.srcObject = liveStream; bgHost.appendChild(v); v.play().catch(() => {}); }
          else { bgHost.style.background = '#111'; bgHost.appendChild(h('div.bg-live-wait', h('b', 'Vídeo ao vivo'), h('span', 'Toque no botão de fundos (lá embaixo) e escolha “Mostrar outra aba” para ver seu vídeo atrás do texto.'))); }
          return;
        }
        if (b.kind === 'scene') { const cv = h('canvas.scene'); bgHost.appendChild(cv); requestAnimationFrame(() => { stopScene = T.Scenes.start(b.id, cv); }); }
        else if (b.kind === 'image') { const im = h('img.bg-media', { alt: '' }); bgHost.appendChild(im); T.Assets.resolve(b.ref).then(u => { if (u) im.src = u; else T.toast('Este fundo foi guardado em outro computador ou navegador.'); }); }
        else if (b.kind === 'video') { const v = h('video.bg-media', { autoplay: true, loop: true, muted: true, playsinline: true }); v.muted = true; bgHost.appendChild(v); T.Assets.resolve(b.ref).then(u => { if (u) { v.src = u; v.play().catch(() => {}); } else T.toast('Este vídeo foi guardado só em outro computador ou navegador. Suba de novo aqui.'); }); }
        else bgHost.style.background = '#111';
      }
      function style(){
        const ink = cfg.light ? '#f6f2ea' : '#1b1a17';
        const pc = cfg.light ? `rgba(12,12,18,${cfg.paper / 100})` : `rgba(251,250,246,${cfg.paper / 100})`;
        paper.style.maxWidth = cfg.width + 'px';
        paper.style.background = pc;
        paper.style.backdropFilter = paper.style.webkitBackdropFilter = cfg.paper > 2 ? `blur(${cfg.blur}px)` : 'none';
        const tv = view('compose'); T.applyTextView(prose, tv); paper.style.zoom = tv.zoom / 100;
        prose.style.color = ink; prose.style.caretColor = ink;
        prose.style.textShadow = cfg.shadow ? (cfg.light ? '0 1px 3px rgba(0,0,0,.75), 0 0 18px rgba(0,0,0,.35)' : '0 1px 2px rgba(255,255,255,.6)') : 'none';
        dim.style.background = `rgba(0,0,0,${cfg.dim / 100})`;
        bgHost.style.filter = cfg.blur && cfg.paper <= 2 ? `blur(${cfg.blur / 3}px)` : 'none';
      }
      const persist = T.debounce(() => { const c = Object.assign({}, cfg); delete c.bgScene; S().update(item.pid, { meta: { compose: c } }); }, 500);
      function slider(label, key, min, max){
        const r = h('input', { type: 'range', min, max, value: cfg[key], 'aria-label': label });
        r.oninput = () => { cfg[key] = +r.value; style(); persist(); };
        return h('label', label, r);
      }
      function buildTools(){
        const curName = cfg.bg.kind === 'scene' ? T.Scenes.get(cfg.bg.id).name : cfg.bg.kind === 'screen' ? (liveStream ? 'Vídeo ao vivo' : 'Vídeo ao vivo (escolher aba)') : (cfg.bg.name || 'Meu fundo');
        const pick = h('button.btn.sm.c-bg-btn', { type: 'button', title: 'Fundos: cenas, imagens, vídeos seus e vídeo ao vivo de outra aba', onclick: () => picker ? closePicker() : openPicker() }, icon('image'), h('span', curName), cfg.layers.length ? h('span.c-bg-n', '+' + cfg.layers.length) : null, h('span.caret', '▾'));
        const perScene = h('button.btn.sm', { onclick: () => { const it = S().get(item.id); const on = !!it.meta?.bg; S().update(item.id, { meta: { bg: on ? null : cfg.bg } }); T.toast(on ? 'Este texto volta a usar o fundo padrão do projeto.' : 'Este fundo agora abre sozinho com este texto.'); buildTools(); } }, S().get(item.id).meta?.bg ? '✓ Fundo deste texto' : 'Usar só neste texto');
        const sndSel = h('select.c-snd', { title: 'Som da digitação' }, h('option', { value: 'off' }, 'Sem som de digitação'), ...Object.entries(T.Sound.KITS).map(([k, n]) => h('option', { value: k }, 'Som: ' + n)));
        sndSel.value = T.typeKit('compose', true); sndSel.onchange = () => { S().setPrefs({ typeKit: sndSel.value }); T.Sound.unlock(); if (sndSel.value !== 'off') T.Sound.type(sndSel.value, 'key'); };
        const snd = sndSel;
        toolsEl.innerHTML = '';
        const liveBtn = h('button.btn.sm' + (cfg.bg.kind === 'screen' && liveStream ? '.on' : ''), { type: 'button', title: 'Escrever por cima de um vídeo tocando em outra aba (YouTube, filme…), como no Scrivener', onclick: () => { if (!canCapture) { upload(); return; } if (cfg.bg.kind === 'screen' && liveStream) { pickTab = 'live'; openPicker(); } else startLive(); } }, canCapture ? '▶ Vídeo de outra aba' : '▶ Usar um vídeo meu (longo)');
        toolsEl.append(pick, liveBtn, slider('Papel', 'paper', 0, 100), slider('Desfoque', 'blur', 0, 24), slider('Escurecer', 'dim', 0, 85), slider('Largura', 'width', 460, 1000),
          h('button.btn.sm', { onclick: () => { cfg.light = !cfg.light; style(); persist(); } }, cfg.light ? 'Letra clara' : 'Letra escura'),
          h('button.btn.sm', { onclick: () => { cfg.shadow = !cfg.shadow; style(); persist(); buildTools(); } }, (cfg.shadow ? '✓ ' : '') + 'Sombra'),
          perScene, snd, h('button.btn.sm', { title: 'Texto e zoom', onclick: (e) => T.typePanel(e.currentTarget, 'compose') }, 'Aa'),
          comments ? h('button.btn.sm' + (comments.shown() ? '.on' : ''), { title: (comments.shown() ? 'Esconder' : 'Mostrar') + ' os comentários ao lado do texto. Para comentar: selecione um trecho e toque no balão (ou Ctrl+Alt+M).', onclick: () => { comments.toggle(); buildTools(); } }, icon('comment'), 'Comentários' + (comments.count() ? ' (' + comments.count() + ')' : '')) : null,
          comments ? h('button.btn.sm', { title: 'Todos os comentários do livro, abertos e resolvidos', onclick: () => comments.all() }, 'Ver todos') : null);
      }
      function closePicker(){ if (picker) { picker.remove(); picker = null; } }
      function openPicker(){
        closePicker();
        picker = h('div.c-picker.glass');
        const tabs = h('div.cp-tabs'); const grid = h('div.cp-grid'); const extra = h('div.cp-extra');
        const all = [{ id: 'todos', name: 'Todos' }, { id: 'live', name: canCapture ? '▶ Vídeo ao vivo' : '▶ Vídeo longo' }, ...T.Scenes.genres, { id: 'meus', name: 'Meus fundos' }];
        const pickScene = (sc) => { cfg.bg = { kind: 'scene', id: sc.id }; setBg(); persist(); buildTools(); fill(); };
        const fill = () => {
          tabs.innerHTML = ''; grid.innerHTML = '';
          all.forEach(g => { const b = h('button', { type: 'button', onclick: () => { pickTab = g.id; fill(); } }, g.name); if (g.id === pickTab) b.classList.add('on'); tabs.appendChild(b); });
          if (pickTab === 'live' && !canCapture) {
            grid.appendChild(h('button.cp-card.cp-up', { type: 'button', onclick: upload }, h('span.th', h('span.th-play', '＋')), h('span.nm', 'Enviar um vídeo meu'), h('span.gn', 'de qualquer tamanho')));
            extra.innerHTML = '';
            extra.append(
              h('p.cp-tip', h('b', 'Por que não dá para mostrar outra aba: '), 'por segurança, o Claude roda este site numa “caixa” que não deixa nenhuma página capturar a tela ou outras abas. Então o truque do Scrivener (deixar a janela transparente por cima de um vídeo do YouTube) não funciona aqui.'),
              h('p.cp-tip', h('b', 'O jeito que funciona: '), 'baixe o vídeo para o computador (vídeos de chuva, lareira, floresta, cidade à noite… no Pexels, Pixabay ou Coverr) e envie aqui. Vídeos longos e pesados ficam guardados só neste computador, sem limite de tamanho, e tocam em repetição atrás do texto. Depois deixe o papel bem transparente.'),
              h('div.cp-row', h('b', 'Papel'), h('div.scene-pick', ...[['Transparente', 0, 0], ['Véu leve', 10, 10], ['Meio a meio', 35, 15], ['Quase opaco', 75, 20]].map(([n, pp, dd]) => h('button', { type: 'button', onclick: () => { cfg.paper = pp; cfg.dim = dd; if (pp < 5) cfg.blur = 0; style(); persist(); buildTools(); } }, n)))));
            return;
          }
          if (pickTab === 'live') {
            const on = cfg.bg.kind === 'screen' && liveStream;
            grid.appendChild(h('button.cp-card.cp-up' + (on ? '.on' : ''), { type: 'button', onclick: () => startLive() }, h('span.th', h('span.th-play', on ? '⟳' : '▶')), h('span.nm', on ? 'Trocar de aba' : 'Mostrar outra aba'), h('span.gn', 'YouTube, filme, qualquer vídeo')));
            if (on) grid.appendChild(h('button.cp-card', { type: 'button', onclick: () => { stopLive(); cfg.bg = { kind: 'scene', id: 'chuva-quente' }; setBg(); persist(); buildTools(); fill(); } }, h('span.th', h('span.th-play', '■')), h('span.nm', 'Parar'), h('span.gn', 'volta para a cena')));
            extra.innerHTML = '';
            const pre = (n, pp, dd) => h('button', { type: 'button', onclick: () => { cfg.paper = pp; cfg.dim = dd; if (pp < 5) cfg.blur = 0; style(); persist(); buildTools(); } }, n);
            extra.append(
              h('p.cp-tip', h('b', 'Como no Scrivener: '), 'abra o vídeo (YouTube, por exemplo) em outra aba ou janela e dê play. Volte aqui, toque em “Mostrar outra aba” e escolha a aba do vídeo. Ele aparece ao vivo atrás do seu texto, do tamanho que for. Deixe o papel bem transparente para ver a cena.'),
              h('p.cp-tip', 'O som continua saindo da outra aba. Nada é gravado nem enviado: a imagem só aparece aqui enquanto o modo composição estiver aberto. Funciona no Chrome e no Edge do computador.'),
              h('div.cp-row', h('b', 'Papel'), h('div.scene-pick', pre('Transparente', 0, 0), pre('Véu leve', 10, 10), pre('Meio a meio', 35, 15), pre('Quase opaco', 75, 20))));
            return;
          }
          if (pickTab === 'meus') {
            const bgs = S().get(item.pid).meta?.bgs || [];
            bgs.forEach((g, i) => {
              const th = h('span.th'); const on = cfg.bg.ref && g.ref && cfg.bg.ref.id === g.ref.id;
              if (g.kind === 'image') T.Assets.resolve(g.ref).then(u => { if (u) th.style.backgroundImage = `url("${u}")`; });
              else th.appendChild(h('span.th-play', '▶'));
              const del = h('span.cp-del', { title: 'Tirar da lista', onclick: (e) => { e.stopPropagation(); const p = S().get(item.pid); S().update(item.pid, { meta: { bgs: (p.meta?.bgs || []).filter((_, k) => k !== i) } }); fill(); } }, '×');
              grid.appendChild(h('button.cp-card' + (on ? '.on' : ''), { type: 'button', onclick: () => { cfg.bg = g; setBg(); persist(); buildTools(); fill(); } }, th, h('span.nm', g.name || 'Fundo ' + (i + 1)), h('span.gn', g.kind === 'video' ? 'vídeo' : 'imagem'), del));
            });
            grid.appendChild(h('button.cp-card.cp-up', { type: 'button', onclick: upload }, h('span.th', h('span.th-play', '＋')), h('span.nm', 'Enviar imagem ou vídeo'), h('span.gn', 'cenas filmadas de verdade')));
            extra.innerHTML = '';
            extra.appendChild(h('p.cp-tip', 'Para fundos filmados de verdade, envie um vídeo seu. Bancos gratuitos como Pexels, Pixabay e Coverr têm vídeos por tema: chuva, floresta, castelo, cidade à noite, espaço… Baixe no computador e envie aqui. Vídeos grandes são comprimidos ou ficam guardados neste computador.'));
            return;
          }
          const list = T.Scenes.list.filter(sc => pickTab === 'todos' || sc.g.includes(pickTab));
          list.forEach(sc => {
            const on = cfg.bg.kind === 'scene' && T.Scenes.get(cfg.bg.id).id === sc.id;
            const th = h('span.th'); T.Scenes.thumb(sc.id).then(u => { if (u) th.style.backgroundImage = `url("${u}")`; });
            const gn = sc.g.map(id => (T.Scenes.genres.find(g => g.id === id) || {}).name).filter(Boolean).slice(0, 2).join(' · ');
            grid.appendChild(h('button.cp-card' + (on ? '.on' : ''), { type: 'button', onclick: () => pickScene(sc) }, th, h('span.nm', sc.name), h('span.gn', gn)));
          });
          extra.innerHTML = '';
          const lay = h('div.scene-pick');
          T.SceneLayers.list.forEach(L => { const on = cfg.layers.includes(L.id); const b = h('button', { type: 'button', onclick: () => { cfg.layers = on ? cfg.layers.filter(x => x !== L.id) : [...cfg.layers, L.id]; setLayers(); persist(); buildTools(); fill(); } }, (on ? '✓ ' : '') + L.name); if (on) b.classList.add('on'); lay.appendChild(b); });
          const q = S().prefs().sceneQuality || 'auto';
          const qual = h('div.scene-pick', ...[['leve', 'Leve'], ['auto', 'Automática'], ['alta', 'Alta']].map(([k, n]) => { const b = h('button', { type: 'button', onclick: () => { S().setPrefs({ sceneQuality: k }); setBg(); fill(); } }, n); if (q === k) b.classList.add('on'); return b; }));
          extra.append(h('div.cp-row', h('b', 'Camadas por cima (pode juntar várias)'), lay), h('div.cp-row', h('b', 'Qualidade da animação'), qual));
        };
        picker.append(h('div.cp-head', h('b', 'Fundos por gênero'), h('span.grow'), h('button.icon-btn', { title: 'Fechar', onclick: closePicker }, icon('x'))), tabs, grid, extra);
        wrap.appendChild(picker); fill();
      }
      const offV = T.on('view-changed', (m) => { if (m === 'compose') style(); });
      async function upload(){
        const f = await T.pickFile('image/*,video/*'); if (!f) return;
        if (f.size < 19.5 * 1024 * 1024) T.toast('Enviando ' + f.name + '…');
        const ref = await T.Assets.upload(f); if (!ref) return;
        const g = { kind: f.type.startsWith('video') ? 'video' : 'image', ref, name: f.name.replace(/\.[^.]+$/, '') + (ref.local ? ' (neste computador)' : '') };
        const p = S().get(item.pid);
        S().update(item.pid, { meta: { bgs: [...(p.meta?.bgs || []), g] } });
        cfg.bg = g; setBg(); persist(); buildTools(); if (picker) openPicker();
      }
      let idleT = null;
      const wake = () => { wrap.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => wrap.classList.add('idle'), 2600); };
      wrap.addEventListener('mousemove', wake);
      prose.addEventListener('keydown', onKeyIdle);
      function onKeyIdle(){ wrap.classList.add('idle'); }
      // escreve sempre para baixo: a página acompanha o cursor e a barra de rolagem mostra o que veio antes
      const follow = () => { const sel = getSelection(); if (!sel.rangeCount || !prose.contains(sel.anchorNode)) return; const rg = sel.getRangeAt(0); const r = rg.getClientRects()[0] || rg.getBoundingClientRect(); if (!r || !r.height) return; const sr = sc.getBoundingClientRect(); const target = sr.top + sr.height * .62; if (r.bottom > target) sc.scrollTop += r.bottom - target; };
      prose.addEventListener('input', follow);
      const onKey = (e) => { if (e.key === 'Escape') { if (document.querySelector('.scrim, .menu, .syn-pop, .popover')) return; e.preventDefault(); if (picker) closePicker(); else done(); } };
      document.addEventListener('keydown', onKey);
      function done(){
        if (stopScene) stopScene(); if (stopLayers) stopLayers(); stopLive(); offV(); document.removeEventListener('keydown', onKey); prose.removeEventListener('keydown', onKeyIdle); prose.removeEventListener('input', follow);
        prose.style.color = ''; prose.style.textShadow = ''; prose.style.caretColor = '';
        try { if (document.fullscreenElement && !wasFull) document.exitFullscreen().catch(() => {}); } catch (e) {}
        wrap.remove(); onClose && onClose();
      }
      close.onclick = done;
      setBg(); setLayers(); style(); buildTools(); wake();
      if (onMount) onMount(wrap, sc, () => buildTools());
      // tela cheia na página inteira, para menus, avisos e janelas aparecerem por cima da composição
      const wasFull = !!document.fullscreenElement;
      try { const de = document.documentElement; if (!wasFull) de.requestFullscreen && de.requestFullscreen().catch(() => {}); } catch (e) {}
      setTimeout(() => { prose.focus(); const r = document.createRange(); const last = prose.querySelector('section:last-of-type'); if (last) { r.selectNodeContents(last); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } }, 50);
    }
  };
})(window.T);
