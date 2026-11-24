/* Tinteiro — utilidades básicas */
window.T = window.T || {};
// versão independente (fora do claude.ai): sem window.claude
window.T.STANDALONE = !(window.claude && typeof window.claude.use === 'function');
// nunca escrever "null" ou "undefined" na tela quando um pedaço opcional da interface não existe
[Element.prototype, DocumentFragment.prototype].forEach(P => ['append', 'prepend', 'replaceChildren', 'before', 'after'].forEach(m => { const o = P[m]; if (!o) return; P[m] = function(...a){ return o.apply(this, a.filter(x => x != null && x !== false)); }; }));
(function(T){
  T.id = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);

  // Criador de elementos: h('div.cls#id', {attrs}, children...)
  T.h = function(sel, attrs, ...kids){
    const m = sel.match(/^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => { if (t === '.') el.classList.add(v); else el.id = v; });
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k in el && k !== 'list' && k !== 'form' && typeof v !== 'string') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (k) => {
      if (k == null || k === false) return;
      if (Array.isArray(k)) return k.forEach(add);
      el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    };
    kids.forEach(add);
    return el;
  };

  T.esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  T.debounce = (fn, ms) => { let t; const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; d.flush = (...a) => { clearTimeout(t); fn(...a); }; d.cancel = () => clearTimeout(t); return d; };
  T.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  T.fmt = (n) => Number(n || 0).toLocaleString('pt-BR');

  // Palavras: conta sequências com letras ou números (acentos incluídos)
  const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
  T.countWords = (text) => { if (!text) return 0; const m = text.match(WORD); return m ? m.length : 0; };
  T.htmlToText = (html) => {
    if (!html) return '';
    const d = document.createElement('div');
    d.innerHTML = html.replace(/<\/(p|h1|h2|h3|div|li|section)>/gi, '$&\n').replace(/<br\s*\/?>/gi, '\n');
    return d.textContent.replace(/\n{3,}/g, '\n\n').trim();
  };
  T.words = (html) => T.countWords(T.htmlToText(html));
  T.tokens = (text) => (text.toLowerCase().match(WORD) || []);

  T.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  T.dayKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  T.relTime = (ts) => {
    if (!ts) return '';
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return 'agora';
    if (s < 3600) return 'há ' + Math.round(s / 60) + ' min';
    if (s < 86400) return 'há ' + Math.round(s / 3600) + ' h';
    if (s < 86400 * 7) return 'há ' + Math.round(s / 86400) + ' d';
    return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };
  T.dateLabel = (ts) => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  // Paleta arco-íris para projetos
  T.HUES = [352, 14, 32, 46, 88, 150, 178, 198, 218, 248, 268, 292, 318];

  // Ícones (traço fino, 24×24)
  const P = {
    plus: 'M12 5v14M5 12h14',
    x: 'M6 6l12 12M18 6L6 18',
    chev: 'M9 6l6 6-6 6',
    down: 'M6 9l6 6 6-6',
    up: 'M6 15l6-6 6 6',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
    book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 5.5v16M8 7h8',
    part: 'M4 4h16v4H4zM4 10h16v10H4z',
    chapter: 'M6 3h9l4 4v14H6zM15 3v4h4',
    scene: 'M7 4h10v16H7zM10 8h4M10 12h4M10 16h2',
    folder: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z',
    doc: 'M6 3h9l4 4v14H6zM9 12h7M9 16h5',
    idea: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    cork: 'M3 5h18v14H3zM6 8h5v4H6zM13 8h5v3h-5zM8 14h6v3H8z',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    dots: 'M5 12h.01M12 12h.01M19 12h.01',
    split: 'M4 4h16v16H4zM12 4v16',
    pop: 'M14 4h6v6M20 4l-8 8M18 14v6H4V6h6',
    layout1: 'M4 4h16v16H4z',
    layout2: 'M4 4h16v16H4zM12 4v16',
    layout3: 'M4 4h16v16H4zM12 4v16M12 12h8',
    layout4: 'M4 4h16v16H4zM12 4v16M4 12h16',
    sound: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
    mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6',
    type: 'M4 7V5h16v2M9 19h6M12 5v14',
    pen: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    focus: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5',
    comment: 'M4 5h16v11H9l-5 4z',
    mark: 'M5 19h14M7 15l7.5-9.5 3 3L10 18H7z',
    camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
    play: 'M7 4l13 8-13 8z',
    pause: 'M7 4h4v16H7zM14 4h4v16h-4z',
    stop: 'M6 6h12v12H6z',
    scissors: 'M6 6a2.5 2.5 0 1 0 0 .01M6 18a2.5 2.5 0 1 0 0 .01M8 7.5L20 18M8 16.5L20 6',
    merge: 'M7 4v6a4 4 0 0 0 4 4h6M14 11l3 3-3 3M7 20v-4',
    bold: 'M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z',
    italic: 'M10 4h8M6 20h8M14 4l-4 16',
    orn: 'M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z',
    heading: 'M6 4v16M18 4v16M6 12h12',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    download: 'M12 4v11M7 10l5 5 5-5M4 20h16',
    upload: 'M12 20V9M7 14l5-5 5 5M4 4h16',
    image: 'M4 5h16v14H4zM8 10a1.5 1.5 0 1 0 0 .01M20 16l-5-5-9 8',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    edit: 'M4 20h4L19 9l-4-4L4 16z',
    home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
    sidebar: 'M4 4h16v16H4zM9 4v16',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
    tree: 'M12 4v4M6 12v-2h12v2M6 12v4M18 12v4M10 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z',
    web: 'M5 5a1.5 1.5 0 1 0 0 .01M19 6a1.5 1.5 0 1 0 0 .01M12 12a2 2 0 1 0 0 .01M6 19a1.5 1.5 0 1 0 0 .01M18 18a1.5 1.5 0 1 0 0 .01M6 6l5 5M18 7l-5 4M7 18l4-5M17 17l-4-4',
    dict: 'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12M9 8h6',
    cal: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
    timeline: 'M3 12h18M7 12V7M12 12v6M17 12V8',
    map: 'M9 4l-6 3v13l6-3 6 3 6-3V4l-6 3zM9 4v13M15 7v13',
    moodboard: 'M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z',
    radio: 'M4 9h16v11H4zM7 9l9-5M8 14a2 2 0 1 0 0 .01M13 13h4M13 16h4',
    cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
    feather: 'M20 4c-6 0-12 4-14 12l-2 4M6 16h7M9 12h7',
    archive: 'M4 5h16v4H4zM5 9v10h14V9M10 13h4',
    copy: 'M8 8h12v12H8zM4 16V4h12',
    history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
    voice: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
    replace: 'M4 7h12l-3-3M20 17H8l3 3',
    check: 'M5 12l5 5L20 7',
    flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 0-6 1-9z',
    undo: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
    redo: 'M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
    selall: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 9h8M8 12h8M8 15h5',
    underline: 'M7 4v7a5 5 0 0 0 10 0V4M5 20h14',
    wall: 'M3 5h18v14H3zM3 15l5-4 4 3 3-2 6 4M15.5 8.5a1 1 0 1 0 0 .01',
    person: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 20a8 8 0 0 1 16 0',
    pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z',
    paw: 'M8 10a2 2 0 1 0 0-.01M16 10a2 2 0 1 0 0-.01M5 14a1.6 1.6 0 1 0 0-.01M19 14a1.6 1.6 0 1 0 0-.01M12 13c-3 0-5 3-5 5 0 1.5 1.5 2 2.5 2 1 0 1.5-.6 2.5-.6s1.5.6 2.5.6c1 0 2.5-.5 2.5-2 0-2-2-5-5-5z',
    gem: 'M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 16M15 4l-3 16',
    wand: 'M4 20L16 8M14 4v3M18 6h3M19 2l-2 2M17 10h3',
    bookmark: 'M6 3h12v18l-6-4.5L6 21z',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15v2',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    quote: 'M7 7h4v4c0 3-2 5-4 6M14 7h4v4c0 3-2 5-4 6',
    list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
    eyeoff: 'M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6C3.9 8.4 2 12 2 12s3.5 6 10 6c1.6 0 3-.3 4.3-.9M9.9 10a3 3 0 0 0 4.2 4.2',
    filter: 'M4 5h16l-6 8v6l-4-2v-4z',
    hash: 'M5 9h15M4 15h15M10 4L8 20M16 4l-2 16',
    brush: 'M14 4l6 6-8.5 8.5a3 3 0 0 1-4.2 0l-1.8-1.8a3 3 0 0 1 0-4.2zM4 20c2 0 3-1 3-3',
    hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.3 14a1.5 1.5 0 0 1 2.5-1.7L8 15',
    mountain: 'M3 19l6-10 4 6 2-3 6 7zM9 9l1.5 2.5',
    raise: 'M12 19V5M6 11l6-6 6 6M4 21h16',
    lower: 'M12 5v14M6 13l6 6 6-6M4 3h16',
    smooth: 'M3 14c3-4 6-4 9 0s6 4 9 0M3 9c3-2 6-2 9 0s6 2 9 0',
    flat: 'M3 16h18M6 12h12M9 8h6',
    river: 'M6 3c-2 4 4 6 2 10s-4 5-1 8M14 3c-2 4 4 6 2 10s-4 5-1 8',
    route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',
    text: 'M5 6V4h14v2M12 4v16M9 20h6',
    zone: 'M5 7l6-3 8 4-2 10-9 2-4-6z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
    dice: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01',
    enter: 'M10 17l5-5-5-5M15 12H3M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5',
    back: 'M15 18l-6-6 6-6',
  };
  T.icon = (name, cls) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.7'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    if (cls) s.setAttribute('class', cls);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', P[name] || P.dots); s.appendChild(p);
    return s;
  };

  // Barramento de eventos simples
  const bus = {};
  T.on = (ev, fn) => { (bus[ev] = bus[ev] || new Set()).add(fn); return () => bus[ev].delete(fn); };
  T.emit = (ev, data) => { (bus[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); };
})(window.T);
