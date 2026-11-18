/* Tinteiro — o livro pronto: compilar (PDF, ePub, .docx), curva de tensão, modo leitor e mockup 3D */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const TIMES = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,250,333,408,500,500,833,778,180,333,333,500,564,250,333,250,278,500,500,500,500,500,500,500,500,500,500,278,278,564,564,564,444,921,722,667,667,722,611,556,722,722,333,389,722,611,889,722,722,556,722,667,556,611,722,722,944,722,722,611,333,278,333,469,500,333,444,500,444,500,444,333,500,500,278,278,500,278,778,500,500,500,500,333,389,278,500,500,722,500,500,444,480,200,480,541,761,500,500,333,500,444,1000,500,500,333,1000,556,333,889,500,611,500,500,333,333,444,444,350,500,1000,333,980,389,333,722,500,444,722,250,333,500,500,500,500,200,500,333,760,276,500,564,333,760,333,400,564,300,300,333,500,453,250,333,300,310,500,750,750,750,444,722,722,722,722,722,722,889,667,611,611,611,611,333,333,333,333,722,722,722,722,722,722,722,564,722,722,722,722,722,722,556,500,444,444,444,444,444,444,667,444,444,444,444,444,278,278,278,278,500,500,500,500,500,500,500,564,500,500,500,500,500,500,500,500],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,250,333,420,500,500,833,778,214,333,333,500,675,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,675,675,675,500,920,611,611,667,722,611,611,722,722,333,444,667,556,833,667,722,611,722,611,500,556,722,611,833,611,556,556,389,278,389,422,500,333,500,500,444,500,444,278,500,500,278,278,444,278,722,500,500,500,500,389,389,278,500,444,667,444,444,389,400,275,400,541,761,500,500,333,500,556,889,500,500,333,1000,500,333,944,500,556,500,500,333,333,556,556,350,500,889,333,980,389,333,667,500,389,556,250,389,500,500,500,500,275,500,333,760,276,500,675,333,760,333,400,675,300,300,333,500,523,250,333,300,310,500,750,750,750,500,611,611,611,611,611,611,889,667,611,611,611,611,333,333,333,333,722,667,722,722,722,722,722,675,722,722,722,722,722,556,611,500,500,500,500,500,500,500,667,444,444,444,444,444,278,278,278,278,500,500,500,500,500,500,500,675,500,500,500,500,500,444,500,444],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,250,333,555,500,500,1000,833,278,333,333,500,570,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,570,570,570,500,930,722,667,722,722,667,611,778,778,389,500,778,667,944,722,778,611,778,722,556,667,722,722,1000,722,722,667,333,278,333,581,500,333,500,556,444,556,444,333,500,556,278,333,556,278,833,556,500,556,556,444,389,333,556,500,722,500,500,444,394,220,394,520,761,500,500,333,500,500,1000,500,500,333,1000,556,333,1000,500,667,500,500,333,333,500,500,350,500,1000,333,1000,389,333,722,500,444,722,250,333,500,500,500,500,220,500,333,747,300,500,570,333,747,333,400,570,300,300,333,556,540,250,333,300,330,500,750,750,750,500,722,722,722,722,722,722,1000,722,667,667,667,667,389,389,389,389,722,722,778,778,778,778,778,570,778,722,722,722,722,722,611,556,500,500,500,500,500,500,722,444,444,444,444,444,278,278,278,278,500,556,500,500,500,500,500,570,500,556,556,556,556,500,556,500],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,250,389,555,500,500,833,778,278,333,333,500,570,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,570,570,570,500,832,667,667,667,722,667,667,722,778,389,500,667,611,889,722,722,611,722,667,556,611,722,667,889,667,611,611,333,278,333,570,500,333,500,500,444,500,444,333,500,556,278,278,500,278,778,556,500,500,500,389,389,278,556,444,667,500,444,389,348,220,348,570,761,500,500,333,500,500,1000,500,500,333,1000,556,333,944,500,611,500,500,333,333,500,500,350,500,1000,333,1000,389,333,722,500,389,611,250,389,500,500,500,500,220,500,333,747,266,500,606,333,747,333,400,570,300,300,333,576,500,250,333,300,300,500,750,750,750,500,667,667,667,667,667,667,944,667,667,667,667,667,389,389,389,389,722,722,722,722,722,722,722,570,722,722,722,722,722,611,611,500,500,500,500,500,500,500,722,444,444,444,444,444,278,278,278,278,500,556,500,500,500,500,500,570,500,556,556,556,556,444,500,444]];

  /* ================= manuscrito em estrutura ================= */
  function runsOf(node, st = { i: false, b: false }, out = []){
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) { if (n.nodeValue) out.push({ t: n.nodeValue.replace(/\s+/g, ' '), i: st.i, b: st.b }); return; }
      if (n.nodeType !== 1) return;
      const tg = n.tagName;
      if (tg === 'BR') { out.push({ t: ' ', i: st.i, b: st.b }); return; }
      const ns = { i: st.i || tg === 'EM' || tg === 'I', b: st.b || tg === 'STRONG' || tg === 'B' };
      runsOf(n, ns, out);
    });
    return out;
  }
  function blocksOf(html){
    const d = document.createElement('div'); d.innerHTML = html || '';
    const out = [];
    const walk = (el) => [...el.children].forEach(c => {
      const tg = c.tagName;
      if (tg === 'SECTION' || tg === 'DIV' || tg === 'ARTICLE') return walk(c);
      if (tg === 'HR') return out.push({ k: 'sep' });
      if (/^H[1-6]$/.test(tg)) return out.push({ k: 'h', runs: runsOf(c) });
      if (tg === 'UL' || tg === 'OL') return [...c.children].forEach(li => out.push({ k: 'p', runs: [{ t: '• ' }, ...runsOf(li)] }));
      const runs = runsOf(c); const txt = runs.map(r => r.t).join('').trim();
      if (!txt) return;
      if (/^(\*\s*){3}$|^#$|^✦$|^~+$/.test(txt)) return out.push({ k: 'sep' });
      out.push({ k: tg === 'BLOCKQUOTE' ? 'q' : 'p', runs });
    });
    walk(d);
    if (!out.length && d.textContent.trim()) d.textContent.split(/\n{2,}|\n/).forEach(s => s.trim() && out.push({ k: 'p', runs: [{ t: s.trim() }] }));
    return out;
  }
  function collect(pid, cfg = {}){
    const flat = T.MS.flat(pid); const skip = new Set(cfg.skip || []);
    const out = []; let chN = 0, partN = 0;
    const roots = S().children(pid, null, 'ms');
    const addChapter = (ch) => {
      if (skip.has(ch.id) || ch.meta?.compile === false) return;
      chN++;
      const docs = T.MS.docs(ch).filter(d => !skip.has(d.id) && d.meta?.compile !== false);
      const blocks = [];
      docs.forEach((d, i) => { if (i > 0 && blocks.length) blocks.push({ k: 'sep' }); blocksOf(d.body).forEach(b => blocks.push(b)); });
      while (blocks.length && blocks[0].k === 'sep') blocks.shift();
      out.push({ type: 'chapter', id: ch.id, num: chN, title: ch.title || '', blocks });
    };
    roots.forEach(r => {
      if (skip.has(r.id)) return;
      if (r.type === 'part') { partN++; out.push({ type: 'part', id: r.id, num: partN, title: r.title || '' }); S().children(pid, r.id, 'ms').forEach(c => c.type === 'chapter' ? addChapter(c) : addChapter(c)); }
      else addChapter(r);
    });
    return out.filter((x, i, a) => x.type !== 'part' || a.slice(i + 1).some(y => y.type === 'chapter'));
  }
  const ROMAN = (n) => { const m = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; m.forEach(([v, r]) => { while (n >= v) { s += r; n -= v; } }); return s; };
  const NUM_PT = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez', 'Onze', 'Doze', 'Treze', 'Catorze', 'Quinze', 'Dezesseis', 'Dezessete', 'Dezoito', 'Dezenove', 'Vinte'];
  function chapterLabel(c, cfg){
    const n = cfg.numStyle === 'romano' ? ROMAN(c.num) : cfg.numStyle === 'extenso' && c.num <= 20 ? NUM_PT[c.num] : String(c.num);
    const head = cfg.chapterWord === false ? n : 'Capítulo ' + n;
    if (cfg.titles === 'num') return { top: head, title: '' };
    if (cfg.titles === 'title') return { top: '', title: c.title || head };
    return { top: head, title: c.title && !/^cap[íi]tulo\s+\d+$/i.test(c.title) ? c.title : '' };
  }

  /* ================= PDF próprio (fontes Times padrão) ================= */
  const WIN = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };
  const enc = (s) => { let o = ''; for (const ch of s) { const c = ch.codePointAt(0); o += String.fromCharCode(c < 128 || (c >= 160 && c < 256) ? c : WIN[c] || (c === 0x2015 ? 0x97 : c === 0x2032 ? 0x27 : 0x3F)); } return o; };
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const fontIx = (r) => (r.b ? 2 : 0) + (r.i ? 1 : 0);
  const wOf = (str, f, size) => { const w = TIMES[f]; let s = 0; for (let i = 0; i < str.length; i++) s += w[str.charCodeAt(i)] || 500; return s * size / 1000; };

  function buildPDF(pid, cfg){
    const p = S().get(pid); const book = collect(pid, cfg);
    const SIZES = { '14x21': [396.85, 595.28], '16x23': [453.54, 651.97], 'a5': [419.53, 595.28], '6x9': [432, 648], 'a4': [595.28, 841.89] };
    const [PW, PH] = SIZES[cfg.size] || SIZES['14x21'];
    const fs = +cfg.fontSize || 11, lead = fs * (+cfg.lead || 1.45);
    const mIn = cfg.size === 'a4' ? 72 : 50, mOut = cfg.size === 'a4' ? 72 : 42, mTop = cfg.size === 'a4' ? 72 : 52, mBot = cfg.size === 'a4' ? 72 : 56;
    const pages = []; let pg = null, y = 0;
    const newPage = (opts = {}) => { pg = { ops: [], num: opts.num !== false, kind: opts.kind || 'body', head: opts.head }; pages.push(pg); y = mTop; return pg; };
    const leftM = (pgI) => (cfg.mirror !== false && (pgI % 2 === 1)) ? mOut : mIn;
    const textW = PW - mIn - mOut;
    const text = (x, yy, str, f, size, tw) => { pg.ops.push(`BT /F${f + 1} ${size.toFixed(2)} Tf ${(tw || 0).toFixed(3)} Tw ${x.toFixed(2)} ${(PH - yy).toFixed(2)} Td (${esc(str)}) Tj ET`); };
    const centerE = (yy, e, f, size) => { const w = wOf(e, f, size); pg.ops.push({ c: true, y: yy, s: e, f, size, w }); };
    const center = (yy, str, f, size) => centerE(yy, enc(str), f, size);
    // linhas de um parágrafo
    function lines(runs, width, size, indent){
      const toks = []; runs.forEach(r => { const f = fontIx(r); enc(r.t).split(/( )/).forEach(t => { if (t) toks.push({ t, f, sp: t === ' ' }); }); });
      const out = []; let cur = [], cw = 0, first = true;
      const maxW = () => width - (first ? indent : 0);
      const push = () => { while (cur.length && cur[cur.length - 1].sp) cur.pop(); out.push({ toks: cur, w: cur.reduce((a, t) => a + wOf(t.t, t.f, size), 0), indent: first ? indent : 0 }); cur = []; cw = 0; first = false; };
      toks.forEach(t => { const tw = wOf(t.t, t.f, size); if (t.sp) { if (cur.length) { cur.push(t); cw += tw; } return; } if (cw + tw > maxW() && cur.length) push(); cur.push(t); cw += tw; });
      if (cur.length) push();
      return out;
    }
    function drawLine(L, x, yy, size, justify, width){
      let tw = 0; const spaces = L.toks.filter(t => t.sp).length;
      if (justify && spaces) tw = (width - L.indent - L.w) / spaces; if (tw > size * .6) tw = 0;
      let xx = x + L.indent; let seg = null; const segs = [];
      L.toks.forEach(t => { if (!seg || seg.f !== t.f) { seg = { f: t.f, s: '' }; segs.push(seg); } seg.s += t.t; });
      segs.forEach(sg => { text(xx, yy, sg.s, sg.f, size, tw); const n = (sg.s.match(/ /g) || []).length; xx += wOf(sg.s, sg.f, size) + n * tw; });
    }
    const bottom = () => PH - mBot;
    const toc = [];
    // corpo
    book.forEach(item => {
      if (item.type === 'part') {
        newPage({ num: false, kind: 'part' });
        center(PH * .38, 'PARTE ' + (cfg.numStyle === 'romano' ? ROMAN(item.num) : item.num), 0, fs * 1.05);
        if (item.title) center(PH * .38 + fs * 2.6, item.title, 0, fs * 2);
        toc.push({ t: (item.title || 'Parte ' + item.num), page: pages.length - 1, part: true });
        if (cfg.blankAfterPart !== false) newPage({ num: false, kind: 'blank' });
        return;
      }
      if (cfg.chapterOdd && pages.length % 2 === 1) newPage({ num: false, kind: 'blank' });
      newPage({ num: false, kind: 'chapter' });
      const lab = chapterLabel(item, cfg);
      y = mTop + (PH - mTop - mBot) * .22;
      if (lab.top) { center(y, lab.top.toUpperCase().split('').join(' '), 0, fs * .95); y += fs * 2.4; }
      if (lab.title) { lines([{ t: lab.title }], textW * .85, fs * 1.75, 0).forEach(L => { centerE(y, L.toks.map(t => t.t).join(''), 0, fs * 1.75); y += fs * 2.2; }); }
      y += lead * 2.2;
      toc.push({ t: [lab.top, lab.title].filter(Boolean).join(' · ') || ('Capítulo ' + item.num), page: pages.length - 1 });
      let firstPara = true;
      item.blocks.forEach(b => {
        if (b.k === 'sep') { y += lead * .5; if (y > bottom() - lead) { newPage(); } center(y + fs * .2, cfg.sep || '*   *   *', 0, fs); y += lead * 1.5; firstPara = true; return; }
        const size = b.k === 'h' ? fs * 1.15 : fs;
        const width = b.k === 'q' ? textW - 2 * fs * 1.5 : textW;
        const ind = firstPara || b.k === 'h' ? 0 : fs * 1.4;
        const ls = lines(b.k === 'h' ? b.runs.map(r => Object.assign({}, r, { b: true })) : b.runs, width, size, ind);
        if (b.k === 'h') y += lead * .4;
        ls.forEach((L, i) => {
          if (y + size > bottom()) newPage();
          const x = mIn + (b.k === 'q' ? fs * 1.5 : 0);
          drawLine(L, x, y + size * .78, size, cfg.justify !== false && i < ls.length - 1 && b.k !== 'h', width);
          y += lead;
        });
        if (b.k === 'h' || b.k === 'q') y += lead * .3;
        firstPara = b.k === 'h';
      });
    });
    const body = pages.splice(0);
    // parte da frente
    const front = [];
    const fp = (kind) => { pg = { ops: [], num: false, kind }; front.push(pg); y = mTop; return pg; };
    const title = p.title || 'Sem título', author = p.meta?.author || '';
    if (cfg.halfTitle !== false) { fp('half'); center(PH * .33, title, 0, fs * 1.4); fp('blank'); }
    fp('title'); center(PH * .3, title, 0, fs * 2.4); if (p.meta?.subtitle) center(PH * .3 + fs * 3, p.meta.subtitle, 1, fs * 1.2); if (author) center(PH * .3 + fs * 6, author, 0, fs * 1.3);
    fp('copy'); { const yr = new Date().getFullYear(); const lines_ = [(cfg.copyright || ('© ' + yr + (author ? ' ' + author : '') + '. Todos os direitos reservados.'))]; let yy = PH - mBot - lead * 3; lines_.forEach(s => lines([{ t: s }], textW, fs * .82, 0).forEach(L => { pg.ops.push({ c: false, x: leftM(front.length - 1), y: yy, s: L.toks.map(t => t.t).join(''), f: 0, size: fs * .82, raw: true }); yy += fs * 1.2; })); }
    if (cfg.dedication) { fp('ded'); let yy = PH * .3; lines([{ t: cfg.dedication, i: true }], textW * .8, fs, 0).forEach(L => { centerE(yy, L.toks.map(t => t.t).join(''), 1, fs); yy += lead; }); fp('blank'); }
    if (cfg.epigraph) { fp('epi'); let yy = PH * .3; lines([{ t: cfg.epigraph, i: true }], textW * .75, fs, 0).forEach(L => { centerE(yy, L.toks.map(t => t.t).join(''), 1, fs); yy += lead; }); if (cfg.epigraphBy) { yy += lead * .6; center(yy, '— ' + cfg.epigraphBy, 0, fs * .9); } fp('blank'); }
    let tocPages = 0;
    if (cfg.toc !== false && toc.length) {
      const per = Math.floor((PH - mTop - mBot - fs * 5) / (lead * 1.15)); tocPages = Math.ceil(toc.length / per);
      if ((front.length + tocPages) % 2 === 1) {} // começa onde cair
      const firstBody = front.length + tocPages + ((front.length + tocPages) % 2 === 1 && cfg.chapterOdd ? 1 : 0);
      for (let k = 0; k < tocPages; k++) {
        fp('toc'); if (k === 0) { center(mTop + fs * 2, 'SUMÁRIO'.split('').join(' '), 0, fs * 1.05); y = mTop + fs * 5; } else y = mTop;
        toc.slice(k * per, (k + 1) * per).forEach(e => {
          const num = String(firstBody + e.page + 1); const sz = e.part ? fs * .95 : fs; const f = e.part ? 2 : 0;
          const lab = enc(e.t); const x0 = leftM(front.length - 1) + (e.part ? 0 : fs * .8); const nw = wOf(num, 0, sz);
          let labS = lab; while (wOf(labS, f, sz) > textW - nw - fs * 3 && labS.length > 3) labS = labS.slice(0, -2);
          if (labS !== lab) labS += '…';
          pg.ops.push({ c: false, x: x0, y: y + sz * .78, s: labS, f, size: sz, raw: true });
          const lw = wOf(labS, f, sz); const dotsW = textW - (x0 - leftM(front.length - 1)) - lw - nw - fs; const dot = wOf('.', 0, sz); const nd = Math.max(0, Math.floor(dotsW / (dot * 2.2)));
          if (!e.part) pg.ops.push({ c: false, x: x0 + lw + fs * .4, y: y + sz * .78, s: ' .'.repeat(nd), f: 0, size: sz, raw: true });
          pg.ops.push({ c: false, x: leftM(front.length - 1) + textW - nw, y: y + sz * .78, s: num, f: 0, size: sz, raw: true });
          y += lead * 1.15;
        });
      }
    }
    if (cfg.chapterOdd && front.length % 2 === 1) fp('blank');
    const all = [...front, ...body];
    // números e cabeçalhos
    const firstBodyIx = front.length;
    all.forEach((pp, i) => {
      if (pp.kind === 'body' && cfg.pageNumbers !== false) { const n = String(i + 1); pp.ops.push({ c: true, y: PH - mBot + fs * 2.2, s: n, f: 0, size: fs * .85, w: wOf(n, 0, fs * .85) }); }
      if (pp.kind === 'body' && cfg.runningHead !== false) { const s = enc(i % 2 === 1 ? (author || title) : title).toUpperCase(); const sp = s.split('').join(' '); pp.ops.push({ c: true, y: mTop - fs * 1.8, s: sp, f: 0, size: fs * .7, w: wOf(sp, 0, fs * .7) }); }
    });
    // serialização
    const objs = []; const add = (s) => { objs.push(s); return objs.length; };
    const catalogN = add(''), pagesN = add('');
    const fN = ['Times-Roman', 'Times-Italic', 'Times-Bold', 'Times-BoldItalic'].map(n => add(`<< /Type /Font /Subtype /Type1 /BaseFont /${n} /Encoding /WinAnsiEncoding >>`));
    const kids = [];
    all.forEach((pp, i) => {
      const lm = leftM(i);
      const ops = pp.ops.map(o => {
        if (typeof o === 'string') { if (lm !== mIn) return o.replace(/ Tf (-?[\d.]+ Tw )(-?[\d.]+) /, (m, tw, x) => ` Tf ${tw}${(+x - mIn + lm).toFixed(2)} `); return o; }
        const x = o.c ? (lm + textW / 2 - o.w / 2) : o.x; const s = o.raw || o.c ? o.s : enc(o.s);
        return `BT /F${o.f + 1} ${o.size.toFixed(2)} Tf 0 Tw ${x.toFixed(2)} ${(PH - o.y).toFixed(2)} Td (${esc(s)}) Tj ET`;
      }).join('\n');
      const cN = add(`<< /Length ${ops.length} >>\nstream\n${ops}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesN} 0 R /MediaBox [0 0 ${PW.toFixed(2)} ${PH.toFixed(2)}] /Resources << /Font << /F1 ${fN[0]} 0 R /F2 ${fN[1]} 0 R /F3 ${fN[2]} 0 R /F4 ${fN[3]} 0 R >> >> /Contents ${cN} 0 R >>`));
    });
    objs[pagesN - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
    objs[catalogN - 1] = `<< /Type /Catalog /Pages ${pagesN} 0 R >>`;
    const u16 = (s) => { let o = '<FEFF'; for (const ch of s) { const c = ch.charCodeAt(0); o += c.toString(16).padStart(4, '0').toUpperCase(); } return o + '>'; };
    const infoN = add(`<< /Title ${u16(title)} /Author ${u16(author)} /Creator ${u16('Entrelinhas')} >>`);
    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogN} 0 R /Info ${infoN} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    return { blob: new Blob([bytes], { type: 'application/pdf' }), pages: all.length };
  }

  /* ================= zip simples (sem compressão) ================= */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u) => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files){
    const te = new TextEncoder(); const parts = []; const central = []; let off = 0;
    const d = new Date(); const dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    files.forEach(f => {
      const name = te.encode(f.name); const data = typeof f.data === 'string' ? te.encode(f.data) : f.data; const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, dt, true); lh.setUint16(12, dd, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, dt, true); ch.setUint16(14, dd, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
      central.push(new Uint8Array(ch.buffer), name);
      off += 30 + name.length + data.length;
    });
    const cs = central.reduce((a, u) => a + u.length, 0);
    const end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cs, true); end.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)]);
  }
  const xesc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ================= ePub ================= */
  async function buildEPUB(pid, cfg){
    const p = S().get(pid); const book = collect(pid, cfg); const title = p.title || 'Sem título', author = p.meta?.author || '';
    const uid = 'urn:uuid:' + (p.meta?.uuid || p.id); const lang = 'pt-BR';
    const runsHTML = (runs) => runs.map(r => { let t = xesc(r.t); if (r.i) t = '<em>' + t + '</em>'; if (r.b) t = '<strong>' + t + '</strong>'; return t; }).join('');
    const page = (t, body) => `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}"><head><meta charset="utf-8"/><title>${xesc(t)}</title><link rel="stylesheet" type="text/css" href="estilo.css"/></head><body>${body}</body></html>`;
    const files = [{ name: 'mimetype', data: 'application/epub+zip' },
      { name: 'META-INF/container.xml', data: '<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>' },
      { name: 'OEBPS/estilo.css', data: `body{font-family:serif;line-height:1.5;margin:0 5%;} p{margin:0;text-indent:1.4em;text-align:justify;} p.first,h2+p,.sep+p{text-indent:0;} .cap{margin-top:22%;text-align:center;} .cap .n{font-size:.85em;letter-spacing:.3em;text-transform:uppercase;} .cap h1{font-weight:normal;font-size:1.7em;margin:.4em 0 2em;} .sep{text-align:center;margin:1em 0;} blockquote{margin:1em 2em;font-style:italic;} .tit{text-align:center;margin-top:30%;} .tit h1{font-weight:normal;font-size:2em;} .parte{text-align:center;margin-top:35%;} .ded{text-align:center;font-style:italic;margin-top:30%;} h2{font-size:1.1em;}` }];
    const manifest = [], spine = [], navItems = [];
    let cover = null;
    if (p.meta?.cover && cfg.epubCover !== false) { try { const u = await T.Assets.resolve(p.meta.cover); const r = await fetch(u); const b = await r.blob(); const ext = /png/.test(b.type) ? 'png' : 'jpg'; cover = { name: 'capa.' + ext, type: b.type || 'image/jpeg', data: new Uint8Array(await b.arrayBuffer()) }; } catch (e) {} }
    if (cover) { files.push({ name: 'OEBPS/' + cover.name, data: cover.data }); manifest.push(`<item id="capa-img" href="${cover.name}" media-type="${cover.type}" properties="cover-image"/>`); files.push({ name: 'OEBPS/capa.xhtml', data: page('Capa', `<div style="text-align:center"><img src="${cover.name}" alt="Capa" style="max-width:100%;max-height:100vh"/></div>`) }); manifest.push('<item id="capa" href="capa.xhtml" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="capa"/>'); }
    files.push({ name: 'OEBPS/rosto.xhtml', data: page(title, `<div class="tit"><h1>${xesc(title)}</h1>${author ? '<p style="text-indent:0">' + xesc(author) + '</p>' : ''}</div>`) }); manifest.push('<item id="rosto" href="rosto.xhtml" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="rosto"/>');
    if (cfg.dedication) { files.push({ name: 'OEBPS/dedicatoria.xhtml', data: page('Dedicatória', `<p class="ded">${xesc(cfg.dedication)}</p>`) }); manifest.push('<item id="ded" href="dedicatoria.xhtml" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="ded"/>'); }
    if (cfg.epigraph) { files.push({ name: 'OEBPS/epigrafe.xhtml', data: page('Epígrafe', `<blockquote style="margin-top:30%">${xesc(cfg.epigraph)}${cfg.epigraphBy ? '<br/>— ' + xesc(cfg.epigraphBy) : ''}</blockquote>`) }); manifest.push('<item id="epi" href="epigrafe.xhtml" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="epi"/>'); }
    let k = 0;
    book.forEach(it => {
      k++; const fn = 'c' + String(k).padStart(3, '0') + '.xhtml';
      if (it.type === 'part') { const t = 'Parte ' + (cfg.numStyle === 'romano' ? ROMAN(it.num) : it.num) + (it.title ? ' · ' + it.title : ''); files.push({ name: 'OEBPS/' + fn, data: page(t, `<div class="parte"><p style="text-indent:0">PARTE ${xesc(cfg.numStyle === 'romano' ? ROMAN(it.num) : String(it.num))}</p><h1 style="font-weight:normal">${xesc(it.title || '')}</h1></div>`) }); navItems.push({ fn, t }); }
      else {
        const lab = chapterLabel(it, cfg); let first = true;
        const body = it.blocks.map(b => { if (b.k === 'sep') { first = true; return `<p class="sep">${xesc(cfg.sep || '* * *')}</p>`; } if (b.k === 'h') return `<h2>${runsHTML(b.runs)}</h2>`; if (b.k === 'q') return `<blockquote><p>${runsHTML(b.runs)}</p></blockquote>`; const c = first ? ' class="first"' : ''; first = false; return `<p${c}>${runsHTML(b.runs)}</p>`; }).join('\n');
        const t = [lab.top, lab.title].filter(Boolean).join(' · ') || 'Capítulo ' + it.num;
        files.push({ name: 'OEBPS/' + fn, data: page(t, `<section epub:type="chapter"><div class="cap">${lab.top ? '<p class="n" style="text-indent:0">' + xesc(lab.top) + '</p>' : ''}${lab.title ? '<h1>' + xesc(lab.title) + '</h1>' : '<h1></h1>'}</div>${body}</section>`) });
        navItems.push({ fn, t });
      }
      manifest.push(`<item id="i${k}" href="${fn}" media-type="application/xhtml+xml"/>`); spine.push(`<itemref idref="i${k}"/>`);
    });
    files.push({ name: 'OEBPS/nav.xhtml', data: page('Sumário', `<nav epub:type="toc" id="toc"><h1>Sumário</h1><ol>${navItems.map(n => `<li><a href="${n.fn}">${xesc(n.t)}</a></li>`).join('')}</ol></nav>`) });
    manifest.push('<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>', '<item id="css" href="estilo.css" media-type="text/css"/>', '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>');
    files.push({ name: 'OEBPS/toc.ncx', data: `<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${uid}"/></head><docTitle><text>${xesc(title)}</text></docTitle><navMap>${navItems.map((n, i) => `<navPoint id="n${i + 1}" playOrder="${i + 1}"><navLabel><text>${xesc(n.t)}</text></navLabel><content src="${n.fn}"/></navPoint>`).join('')}</navMap></ncx>` });
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    files.push({ name: 'OEBPS/content.opf', data: `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${lang}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">${uid}</dc:identifier><dc:title>${xesc(title)}</dc:title><dc:creator>${xesc(author || 'Autora')}</dc:creator><dc:language>${lang}</dc:language><meta property="dcterms:modified">${now}</meta>${cover ? '<meta name="cover" content="capa-img"/>' : ''}</metadata><manifest>${manifest.join('')}</manifest><spine toc="ncx">${spine.join('')}</spine></package>` });
    return { blob: new Blob([zip(files)], { type: 'application/epub+zip' }), chapters: navItems.length };
  }

  /* ================= .docx (formato de manuscrito) ================= */
  function buildDOCX(pid, cfg){
    const p = S().get(pid); const book = collect(pid, cfg); const title = p.title || 'Sem título', author = p.meta?.author || '';
    const words = T.MS.words(pid);
    const font = cfg.docxFont === 'courier' ? 'Courier New' : 'Times New Roman';
    const run = (r) => `<w:r><w:rPr>${r.b ? '<w:b/>' : ''}${r.i ? '<w:i/>' : ''}</w:rPr><w:t xml:space="preserve">${xesc(r.t)}</w:t></w:r>`;
    const para = (runs, opts = {}) => `<w:p><w:pPr>${opts.style ? `<w:pStyle w:val="${opts.style}"/>` : ''}${opts.pageBreak ? '<w:pageBreakBefore/>' : ''}${opts.center ? '<w:jc w:val="center"/>' : ''}${opts.noIndent ? '<w:ind w:firstLine="0"/>' : ''}${opts.before ? `<w:spacing w:before="${opts.before}"/>` : ''}</w:pPr>${runs.map(run).join('')}</w:p>`;
    const sur = (author.trim().split(/\s+/).pop() || 'Autora');
    const body = [];
    // folha de rosto do manuscrito
    body.push(para([{ t: author || 'Nome da autora' }], { noIndent: true, style: 'Plano' }));
    body.push(para([{ t: 'cerca de ' + (Math.round(words / 1000) * 1000 || words).toLocaleString('pt-BR') + ' palavras' }], { noIndent: true, style: 'Plano' }));
    body.push(para([{ t: title.toUpperCase() }], { center: true, before: 4800, noIndent: true }));
    if (author) body.push(para([{ t: 'por ' + author }], { center: true, noIndent: true }));
    let firstPara = true;
    book.forEach(it => {
      if (it.type === 'part') { body.push(para([{ t: 'PARTE ' + (cfg.numStyle === 'romano' ? ROMAN(it.num) : it.num) }], { pageBreak: true, center: true, before: 4320, noIndent: true })); if (it.title) body.push(para([{ t: it.title }], { center: true, noIndent: true })); return; }
      const lab = chapterLabel(it, cfg);
      body.push(para([{ t: lab.top || lab.title || ('Capítulo ' + it.num) }], { pageBreak: true, center: true, before: 2880, noIndent: true, style: 'Capitulo' }));
      if (lab.top && lab.title) body.push(para([{ t: lab.title }], { center: true, noIndent: true }));
      body.push(para([{ t: '' }], { noIndent: true }));
      firstPara = true;
      it.blocks.forEach(b => {
        if (b.k === 'sep') { body.push(para([{ t: '#' }], { center: true, noIndent: true })); firstPara = true; return; }
        body.push(para(b.runs, { noIndent: firstPara || b.k === 'h' }));
        firstPara = false;
      });
    });
    body.push(para([{ t: 'FIM' }], { center: true, noIndent: true, before: 480 }));
    const sect = `<w:sectPr><w:headerReference w:type="default" r:id="rIdH1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/><w:titlePg/></w:sectPr>`;
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${body.join('')}${sect}</w:body></w:document>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="480" w:lineRule="auto"/><w:ind w:firstLine="720"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Capitulo"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:jc w:val="center"/><w:ind w:firstLine="0"/><w:outlineLvl w:val="0"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Plano"><w:name w:val="Plano"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/></w:pPr></w:style></w:styles>`;
    const header = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:hdr ${NS}><w:p><w:pPr><w:jc w:val="right"/><w:ind w:firstLine="0"/><w:spacing w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:t xml:space="preserve">${xesc(sur)} / ${xesc(title.toUpperCase())} / </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:hdr>`;
    const files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
      { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${xesc(title)}</dc:title><dc:creator>${xesc(author)}</dc:creator></cp:coreProperties>` },
      { name: 'word/document.xml', data: doc },
      { name: 'word/styles.xml', data: styles },
      { name: 'word/header1.xml', data: header },
      { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdH1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>' },
    ];
    return { blob: new Blob([zip(files)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) };
  }

  T.Compile = { collect, buildPDF, buildEPUB, buildDOCX, zip };

  /* ================= vista: compilar ================= */
  const DEF = { format: 'pdf', size: '14x21', fontSize: 11, lead: 1.45, justify: true, mirror: true, toc: true, halfTitle: true, pageNumbers: true, runningHead: true, chapterOdd: false, titles: 'both', numStyle: 'numero', sep: '*   *   *', dedication: '', epigraph: '', epigraphBy: '', skip: [], docxFont: 'times' };
  T.Views.compile = {
    icon: 'download', title: () => 'Compilar o livro',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad.cp'); root.appendChild(v);
      const cfg = Object.assign({}, DEF, S().get(pid)?.meta?.compile || {}); cfg.skip = [...(cfg.skip || [])];
      const save = T.debounce(() => S().update(pid, { meta: { compile: Object.assign({}, cfg) } }), 500);
      function render(){
        v.innerHTML = '';
        const p = S().get(pid);
        const seg = (key, opts) => h('div.seg', opts.map(([k, n]) => h('button' + (String(cfg[key]) === String(k) ? '.on' : ''), { onclick: () => { cfg[key] = k; save(); render(); } }, n)));
        const chk = (key, label) => h('label.mp-chk', h('input', { type: 'checkbox', checked: cfg[key] !== false, onchange: (e) => { cfg[key] = e.target.checked; save(); } }), label);
        const txt = (key, ph, multi) => { const i = multi ? h('textarea.textarea', { rows: 2, placeholder: ph }) : h('input.input', { placeholder: ph }); i.value = cfg[key] || ''; i.oninput = () => { cfg[key] = i.value; save(); }; return i; };
        // conteúdo
        const tree = h('div.cp-tree');
        S().children(pid, null, 'ms').forEach(r => {
          const row = (it, depth) => { const on = !cfg.skip.includes(it.id); const words = T.MS.docs(it).reduce((a, d) => a + (d.meta?.words || 0), 0);
            return h('label.cp-row', { style: { paddingLeft: (depth * 18 + 6) + 'px' } }, h('input', { type: 'checkbox', checked: on, onchange: (e) => { cfg.skip = e.target.checked ? cfg.skip.filter(x => x !== it.id) : [...cfg.skip, it.id]; save(); sum(); } }), icon(it.type === 'part' ? 'part' : it.type === 'chapter' ? 'chapter' : 'scene'), h('span.grow', it.title || 'Sem título'), h('span.muted.num', T.fmt(words))); };
          tree.appendChild(row(r, 0)); if (r.type === 'part') S().children(pid, r.id, 'ms').forEach(c => tree.appendChild(row(c, 1)));
        });
        const sumEl = h('p.muted');
        const sum = () => { const b = collect(pid, cfg); const chs = b.filter(x => x.type === 'chapter'); const w = chs.reduce((a, c) => a + c.blocks.reduce((s, bl) => s + (bl.runs ? T.countWords(bl.runs.map(r => r.t).join('')) : 0), 0), 0); sumEl.textContent = chs.length + ' capítulos · ' + T.fmt(w) + ' palavras · cerca de ' + Math.max(1, Math.round(w / (cfg.size === 'a4' ? 400 : 260))) + ' páginas'; };
        sum();
        const fmtCard = (k, ic, n, d) => h('button.cp-fmt' + (cfg.format === k ? '.on' : ''), { onclick: () => { cfg.format = k; save(); render(); } }, icon(ic), h('b', n), h('span', d));
        const fmts = h('div.cp-fmts', fmtCard('pdf', 'book', 'PDF diagramado', 'Livro pronto para ler ou imprimir, com folha de rosto, sumário e números de página.'),
          fmtCard('epub', 'doc', 'ePub', 'Livro digital para Kindle, Kobo, Apple Livros e leitores no celular.'), fmtCard('docx', 'edit', 'Manuscrito .docx', 'Formato padrão para enviar a editoras e agentes: Times 12, espaço duplo.'));
        const opts = h('div.cp-opts');
        if (cfg.format === 'pdf') opts.append(
          h('div.cp-r', h('b', 'Tamanho da página'), seg('size', [['14x21', '14 × 21 cm'], ['16x23', '16 × 23 cm'], ['a5', 'A5'], ['6x9', '6 × 9 pol.'], ['a4', 'A4']])),
          h('div.cp-r', h('b', 'Letra'), seg('fontSize', [[10, '10'], [10.5, '10,5'], [11, '11'], [12, '12']]), h('b', 'Entrelinha'), seg('lead', [[1.3, 'Justa'], [1.45, 'Normal'], [1.65, 'Aberta']])),
          h('div.cp-chks', chk('justify', 'Texto justificado'), chk('toc', 'Sumário'), chk('halfTitle', 'Falsa folha de rosto'), chk('pageNumbers', 'Números de página'), chk('runningHead', 'Título e autora no alto das páginas'), chk('mirror', 'Margens espelhadas (para imprimir frente e verso)'), h('label.mp-chk', h('input', { type: 'checkbox', checked: !!cfg.chapterOdd, onchange: (e) => { cfg.chapterOdd = e.target.checked; save(); } }), 'Capítulos sempre na página da direita')));
        if (cfg.format === 'docx') opts.append(h('div.cp-r', h('b', 'Fonte'), seg('docxFont', [['times', 'Times New Roman'], ['courier', 'Courier New']])), h('p.mp-tip', 'Segue o formato padrão de manuscrito: margens de 2,5 cm, espaço duplo, recuo de parágrafo, cada capítulo numa página nova, "#" entre cenas e cabeçalho com Sobrenome / TÍTULO / página. A primeira página traz seu nome e a contagem de palavras.'));
        if (cfg.format === 'epub') opts.append(h('div.cp-chks', chk('epubCover', 'Usar a capa do livro'), chk('toc', 'Sumário navegável')));
        const sepI = h('input.input', { value: cfg.sep, style: { maxWidth: '140px' } }); sepI.oninput = () => { cfg.sep = sepI.value; save(); };
        const go = h('button.btn.primary.lg', { onclick: async () => {
          go.disabled = true; go.textContent = 'Compilando…';
          try {
            const name = (p.title || 'livro').replace(/[\\/:*?"<>|]+/g, '');
            let res, file;
            if (cfg.format === 'pdf') { res = buildPDF(pid, cfg); file = name + '.pdf'; }
            else if (cfg.format === 'epub') { res = await buildEPUB(pid, cfg); file = name + '.epub'; }
            else { res = buildDOCX(pid, cfg); file = name + ' (manuscrito).docx'; }
            const ok = await T.Download.save(file, res.blob);
            if (ok === null) { const a = document.createElement('a'); a.href = URL.createObjectURL(res.blob); a.download = file; document.body.appendChild(a); a.click(); a.remove(); }
            if (ok !== false) T.toast(file + ' pronto' + (res.pages ? ' · ' + res.pages + ' páginas' : '') + '.');
          } catch (e) { console.error(e); T.toast('Não consegui compilar: ' + (e.message || e)); }
          go.disabled = false; go.replaceChildren(icon('download'), 'Compilar e baixar');
        } }, icon('download'), 'Compilar e baixar');
        v.append(h('div.mp-gal-head', h('div', h('h1', 'Compilar o livro'), h('p.muted', 'Junte o manuscrito num arquivo pronto. Escolha o que entra, a parte da frente e o formato.')), go),
          h('div.cp-grid',
            h('div.panel.glass', h('h3', 'Formato'), fmts, opts),
            h('div.panel.glass', h('h3', 'O que entra'), h('p.mp-tip', 'Desmarque partes ou capítulos que ainda não devem ir para o arquivo.'), tree, sumEl),
            h('div.panel.glass', h('h3', 'Capítulos'), h('div.cp-r', h('b', 'Como aparecem'), seg('titles', [['both', 'Número e título'], ['num', 'Só o número'], ['title', 'Só o título']])),
              h('div.cp-r', h('b', 'Número'), seg('numStyle', [['numero', '1, 2, 3'], ['extenso', 'Um, Dois'], ['romano', 'I, II, III']])), h('div.cp-r', h('b', 'Entre cenas'), sepI)),
            h('div.panel.glass', h('h3', 'Parte da frente'), h('label.mp-f', h('span', 'Dedicatória'), txt('dedication', 'Para…', true)), h('label.mp-f', h('span', 'Epígrafe'), txt('epigraph', 'Uma citação para abrir o livro', true)), h('label.mp-f', h('span', 'Autor da epígrafe'), txt('epigraphBy', 'Quem disse')),
              h('p.mp-tip', 'O título e o nome da autora vêm do livro (Estante › editar livro).'))));
      }
      render();
      return { destroy(){ } };
    }
  };

  /* ================= vista: curva de tensão ================= */
  T.Views.tension = {
    icon: 'chart', title: () => 'Curva de tensão',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad.tn'); root.appendChild(v);
      let ref = tab.ref2 !== false, drag = null;
      function data(){
        const flat = T.MS.flat(pid); let sc = flat.filter(i => i.type === 'scene');
        if (!sc.length) sc = flat.filter(i => i.type === 'chapter');
        return sc.map(s => ({ it: s, ch: T.MS.chapterOf(s), t: s.meta?.tension, part: (() => { let x = s; while (x && x.type !== 'part') x = x.parent ? S().get(x.parent) : null; return x; })() }));
      }
      const ideal = (x) => { const pts = [[0, 2], [.12, 3], [.25, 5.5], [.32, 4.5], [.5, 6.5], [.62, 5.5], [.75, 7.5], [.8, 4], [.9, 9.5], [.95, 6], [1, 3]]; for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const f = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); const e = f * f * (3 - 2 * f); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * e; } return 3; };
      function render(){
        v.innerHTML = '';
        const D = data();
        const W = Math.max(600, (v.clientWidth || 900) - 40), H = 340, padL = 40, padR = 16, padT = 20, padB = 70;
        const xs = (i) => padL + (D.length < 2 ? (W - padL - padR) / 2 : i / (D.length - 1) * (W - padL - padR));
        const ys = (t) => padT + (10 - t) / 10 * (H - padT - padB);
        const NS = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'tn-svg');
        const el = (n, a, txt) => { const e = document.createElementNS(NS, n); Object.entries(a).forEach(([k, val]) => e.setAttribute(k, val)); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
        for (let t = 0; t <= 10; t += 2) { el('line', { x1: padL, x2: W - padR, y1: ys(t), y2: ys(t), class: 'tn-grid' }); el('text', { x: padL - 8, y: ys(t) + 4, class: 'tn-ax', 'text-anchor': 'end' }, String(t)); }
        // partes e capítulos
        let lastCh = null, lastPart = null;
        D.forEach((d, i) => {
          if (d.part && d.part !== lastPart) { lastPart = d.part; el('text', { x: xs(i), y: H - 8, class: 'tn-part' }, (d.part.title || 'Parte').slice(0, 26)); if (i) el('line', { x1: xs(i) - 4, x2: xs(i) - 4, y1: padT, y2: H - padB + 30, class: 'tn-partl' }); }
          if (d.ch && d.ch !== lastCh) { lastCh = d.ch; el('line', { x1: xs(i), x2: xs(i), y1: padT, y2: H - padB, class: 'tn-chl' }); const tx = el('text', { x: xs(i) + 3, y: H - padB + 16, class: 'tn-ch' }, 'Cap. ' + T.MS.chapterNumber(d.ch)); tx.setAttribute('transform', `rotate(35 ${xs(i) + 3} ${H - padB + 16})`); }
        });
        if (ref && D.length > 1) { let dd = ''; for (let k = 0; k <= 100; k++) { const x = k / 100; dd += (k ? 'L' : 'M') + (padL + x * (W - padL - padR)).toFixed(1) + ' ' + ys(ideal(x)).toFixed(1); } el('path', { d: dd, class: 'tn-ideal' }); }
        const vals = D.map(d => d.t ?? 5);
        if (D.length > 1) {
          let dd = `M${xs(0)} ${ys(vals[0])}`;
          for (let i = 0; i < D.length - 1; i++) { const p0 = [xs(i - 1 < 0 ? 0 : i - 1), ys(vals[Math.max(0, i - 1)])], p1 = [xs(i), ys(vals[i])], p2 = [xs(i + 1), ys(vals[i + 1])], p3 = [xs(Math.min(D.length - 1, i + 2)), ys(vals[Math.min(D.length - 1, i + 2)])]; dd += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`; }
          el('path', { d: dd + `L${xs(D.length - 1)} ${ys(0)}L${xs(0)} ${ys(0)}Z`, class: 'tn-area' }); el('path', { d: dd, class: 'tn-line' });
        }
        const tip = h('div.tn-tip.glass.glass-strong.hidden');
        D.forEach((d, i) => {
          const c = el('circle', { cx: xs(i), cy: ys(vals[i]), r: 7, class: 'tn-pt' + (d.t == null ? ' unset' : '') });
          c.addEventListener('pointerdown', (e) => { e.preventDefault(); c.setPointerCapture(e.pointerId); drag = { i, c, moved: false }; });
          c.addEventListener('pointermove', (e) => {
            if (!drag || drag.i !== i) { const r = svg.getBoundingClientRect(); tip.classList.remove('hidden'); tip.style.left = (xs(i) / W * r.width + 10) + 'px'; tip.style.top = (ys(vals[i]) / H * r.height - 10) + 'px'; tip.replaceChildren(h('b', d.it.title || 'Sem título'), h('span', 'Tensão ' + (d.t ?? '— (sem marcar)') + (d.it.meta?.pov ? ' · ' + d.it.meta.pov : '') + ' · ' + T.fmt(d.it.meta?.words || 0) + ' palavras'), h('em', 'Arraste para mudar · clique para abrir')); return; }
            const r = svg.getBoundingClientRect(); const yy = (e.clientY - r.top) / r.height * H; const t = clamp(Math.round(10 - (yy - padT) / (H - padT - padB) * 10), 0, 10);
            if (t !== vals[i]) { vals[i] = t; drag.moved = true; c.setAttribute('cy', ys(t)); drag.t = t; }
          });
          c.addEventListener('pointerleave', () => tip.classList.add('hidden'));
          c.addEventListener('pointerup', () => { if (!drag) return; const dr = drag; drag = null; if (dr.moved) { S().update(d.it.id, { meta: { tension: dr.t } }); render(); } else T.Shell.open({ kind: 'doc', ref: d.it.id }, { side: true }); });
        });
        // leitura
        const set = D.filter(d => d.t != null);
        const notes = [];
        if (!D.length) notes.push('Ainda não há cenas no manuscrito.');
        else {
          if (set.length < D.length) notes.push((D.length - set.length) + ' de ' + D.length + ' cenas ainda sem tensão marcada (pontos vazios valem 5). Arraste os pontos ou marque na ficha da cena.');
          const mx = Math.max(...vals); const at = vals.indexOf(mx); notes.push('O ponto mais tenso é “' + (D[at].it.title || 'Sem título') + '”, a ' + Math.round(at / Math.max(1, D.length - 1) * 100) + '% do livro.' + (at / Math.max(1, D.length - 1) < .7 ? ' Muitos livros guardam o pico para depois dos 80%.' : ''));
          let run = 1, worst = 1, wi = 0; for (let i = 1; i < vals.length; i++) { if (vals[i] === vals[i - 1]) { run++; if (run > worst) { worst = run; wi = i; } } else run = 1; }
          if (worst >= 4) notes.push(worst + ' cenas seguidas com a mesma tensão (até “' + (D[wi].it.title || '') + '”). Talvez valha uma virada ou um respiro ali.');
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length; notes.push('Tensão média: ' + avg.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' de 10.');
        }
        v.append(h('div.mp-gal-head', h('div', h('h1', 'Curva de tensão'), h('p.muted', 'Cada ponto é uma cena. Arraste para cima ou para baixo para marcar a tensão; clique para abrir a cena ao lado.')),
          h('label.mp-chk', h('input', { type: 'checkbox', checked: ref, onchange: (e) => { ref = e.target.checked; tab.ref2 = ref; T.emit('tab-changed', tab); render(); } }), 'Mostrar o arco clássico de referência')),
          h('div.panel.glass.tn-box', svg, tip), h('div.panel.glass', h('h3', 'Leitura do ritmo'), h('ul.tn-notes', notes.map(n => h('li', n)))));
      }
      render();
      const off = T.on('items', (e) => { if (!drag && e?.item && (e.item.type === 'scene' || e.item.type === 'chapter')) rd(); }); const rd = T.debounce(render, 400);
      const ro = new ResizeObserver(T.debounce(render, 200)); ro.observe(v);
      return { destroy(){ off(); ro.disconnect(); } };
    }
  };

  /* ================= vista: modo leitor ================= */
  T.Views.reader = {
    icon: 'book', title: () => 'Modo leitor',
    mount(root, tab, ctx){
      const pid = ctx.pid; const p = S().get(pid);
      const st = Object.assign({ theme: 'sepia', size: 19, toc: true }, S().prefs().reader || {});
      const wrap = h('div.rd'); root.appendChild(wrap);
      const bar = h('div.rd-bar.glass'); const side = h('nav.rd-toc'); const page = h('article.rd-page'); const prog = h('div.rd-prog', h('i'));
      const scroller = h('div.rd-scroll', page);
      wrap.append(prog, bar, side, scroller);
      const book = collect(pid, {});
      const words = book.reduce((a, c) => a + (c.blocks || []).reduce((s, b) => s + (b.runs ? T.countWords(b.runs.map(r => r.t).join('')) : 0), 0), 0);
      const runsHTML = (runs) => runs.map(r => { let t = T.esc(r.t); if (r.i) t = '<em>' + t + '</em>'; if (r.b) t = '<strong>' + t + '</strong>'; return t; }).join('');
      let html = `<header class="rd-title"><h1>${T.esc(p.title || '')}</h1>${p.meta?.author ? '<p>' + T.esc(p.meta.author) + '</p>' : ''}<p class="rd-meta">${T.fmt(words)} palavras · cerca de ${Math.max(1, Math.round(words / 230))} min de leitura</p></header>`;
      book.forEach(it => {
        if (it.type === 'part') { html += `<section class="rd-part" id="rd-${it.id}"><span>Parte ${it.num}</span><h2>${T.esc(it.title || '')}</h2></section>`; return; }
        const lab = chapterLabel(it, {}); let first = true;
        html += `<section class="rd-ch" id="rd-${it.id}"><header><span>${T.esc(lab.top)}</span>${lab.title ? '<h2>' + T.esc(lab.title) + '</h2>' : ''}</header>` + it.blocks.map(b => { if (b.k === 'sep') { first = true; return '<p class="rd-sep">✦</p>'; } if (b.k === 'h') return '<h3>' + runsHTML(b.runs) + '</h3>'; if (b.k === 'q') return '<blockquote>' + runsHTML(b.runs) + '</blockquote>'; const c = first ? ' class="first"' : ''; first = false; return `<p${c}>${runsHTML(b.runs)}</p>`; }).join('') + '</section>';
      });
      html += '<p class="rd-end">✦ ✦ ✦</p>';
      page.innerHTML = html;
      side.append(h('b', 'Sumário'), ...book.map(it => h('button' + (it.type === 'part' ? '.part' : ''), { onclick: () => page.querySelector('#rd-' + it.id)?.scrollIntoView({ behavior: 'smooth' }) }, it.type === 'part' ? ('Parte ' + it.num + (it.title ? ' · ' + it.title : '')) : ([chapterLabel(it, {}).top, chapterLabel(it, {}).title].filter(Boolean).join(' · ')))));
      const apply = () => { wrap.dataset.theme = st.theme; page.style.fontSize = st.size + 'px'; wrap.classList.toggle('no-toc', !st.toc); S().setPrefs({ reader: Object.assign({}, st) }); drawBar(); };
      function drawBar(){
        bar.innerHTML = '';
        bar.append(h('button.icon-btn', { title: 'Sumário', onclick: () => { st.toc = !st.toc; apply(); } }, icon('list')),
          h('div.seg', [['claro', 'Claro'], ['sepia', 'Sépia'], ['noite', 'Noite']].map(([k, n]) => h('button' + (st.theme === k ? '.on' : ''), { onclick: () => { st.theme = k; apply(); } }, n))),
          h('button.icon-btn', { title: 'Letra menor', onclick: () => { st.size = Math.max(14, st.size - 1); apply(); } }, h('b', { style: { fontSize: '12px' } }, 'A−')),
          h('button.icon-btn', { title: 'Letra maior', onclick: () => { st.size = Math.min(28, st.size + 1); apply(); } }, h('b', { style: { fontSize: '15px' } }, 'A+')),
          h('span.rd-where'));
      }
      apply();
      const onScroll = () => { const max = scroller.scrollHeight - scroller.clientHeight; const f = max > 0 ? scroller.scrollTop / max : 0; prog.firstChild.style.width = (f * 100) + '%'; const w = bar.querySelector('.rd-where'); if (w) w.textContent = Math.round(f * 100) + '% lido'; tab.pos = f; persist(); };
      const persist = T.debounce(() => T.emit('tab-changed', tab), 800);
      scroller.addEventListener('scroll', onScroll);
      requestAnimationFrame(() => { if (tab.pos) scroller.scrollTop = tab.pos * (scroller.scrollHeight - scroller.clientHeight); onScroll(); });
      return { destroy(){ scroller.removeEventListener('scroll', onScroll); } };
    }
  };

  /* ================= vista: mockup 3D do livro ================= */
  const TRIMS = { '14x21': [140, 210], '16x23': [160, 230], 'a5': [148, 210], 'bolso': [110, 180], '6x9': [152, 229] };
  T.Views.mockup = {
    icon: 'cube', title: () => 'Mockup 3D do livro',
    mount(root, tab, ctx){
      const pid = ctx.pid;
      const st = Object.assign({ trim: '14x21', hard: false, src: 'real', yaw: -28, pitch: -8, auto: false, paper: 'polen', bg: 'estudio' }, S().get(pid)?.meta?.mockup || {});
      const wrap = h('div.bk'); root.appendChild(wrap);
      const stage = h('div.bk-stage'); const panel = h('div.bk-panel.glass.glass-strong');
      wrap.append(stage, panel);
      let raf = 0, destroyed = false, coverUrl = '';
      const save = T.debounce(() => S().update(pid, { meta: { mockup: Object.assign({}, st) } }), 500);
      async function loadCover(){ const p = S().get(pid); coverUrl = p.meta?.cover ? await T.Assets.resolve(p.meta.cover) : ''; build(); }
      function pagesCount(){ const p = S().get(pid); const words = st.src === 'meta' ? (p.meta?.targets?.book || 90000) : T.MS.words(pid); const perPage = st.trim === 'bolso' ? 230 : st.trim === '16x23' ? 330 : 280; return Math.max(24, Math.ceil(words / perPage / 2) * 2 + 8); }
      function build(){
        const p = S().get(pid); const [wmm, hmm] = TRIMS[st.trim] || TRIMS['14x21'];
        const pages = pagesCount(); const caliper = st.paper === 'offset' ? .1 : st.paper === 'couche' ? .08 : .12; // mm por folha… (por página/2)
        const tmm = Math.max(3, pages / 2 * caliper + (st.hard ? 5 : .6));
        const scale = Math.min((stage.clientHeight || 600) * .62 / hmm, (stage.clientWidth || 800) * .42 / wmm);
        const W = wmm * scale, H = hmm * scale, D = tmm * scale;
        const hue = p.meta?.hue ?? 230; const title = p.title || 'Sem título', author = p.meta?.author || '';
        const face = (cls, w, hh, tf, kids) => h('div.bk-f.' + cls, { style: { width: w + 'px', height: hh + 'px', transform: tf, marginLeft: (-w / 2) + 'px', marginTop: (-hh / 2) + 'px' } }, kids);
        const coverArt = coverUrl ? h('img', { src: coverUrl, alt: '' }) : h('div.bk-gen', { style: { background: `linear-gradient(160deg, hsl(${hue} 55% 38%), hsl(${(hue + 40) % 360} 60% 18%))` } }, h('div.bk-gen-t', title), author ? h('div.bk-gen-a', author) : null);
        const book = h('div.bk-book' + (st.hard ? '.hard' : ''), { style: { width: W + 'px', height: H + 'px' } },
          face('front', W, H, `translateZ(${D / 2}px)`, [coverArt, h('i.bk-shine')]),
          face('back', W, H, `rotateY(180deg) translateZ(${D / 2}px)`, h('div.bk-back', { style: { background: coverUrl ? `hsl(${hue} 35% 22%)` : `linear-gradient(200deg, hsl(${hue} 55% 34%), hsl(${(hue + 40) % 360} 60% 16%))` } }, h('p', p.meta?.description || 'Uma história que começa quando uma lua vermelha aparece no céu… (escreva a sinopse em Estante › editar livro)'), h('div.bk-bar', h('i'), h('span', pages + ' páginas')))),
          face('spine', D, H, `rotateY(-90deg) translateZ(${W / 2}px)`, h('div.bk-spine', { style: { background: coverUrl ? `hsl(${hue} 40% 24%)` : `linear-gradient(90deg, hsl(${hue} 50% 26%), hsl(${hue} 55% 36%) 40%, hsl(${hue} 50% 24%))` } }, h('span.bk-sp-t', title), author ? h('span.bk-sp-a', author.split(' ').pop()) : null)),
          face('pages', D, H, `rotateY(90deg) translateZ(${W / 2 - (st.hard ? 3 : 0)}px)`, null),
          face('top', W, D, `rotateX(90deg) translateZ(${H / 2 - (st.hard ? 3 : 0)}px)`, null),
          face('bottom', W, D, `rotateX(-90deg) translateZ(${H / 2 - (st.hard ? 3 : 0)}px)`, null));
        stage.replaceChildren(h('div.bk-floor'), h('div.bk-rot', { style: { transform: `rotateX(${st.pitch}deg) rotateY(${st.yaw}deg)` } }, book), h('div.bk-shadow', { style: { width: (W * 1.3) + 'px' } }));
        stage.dataset.bg = st.bg;
        const words = st.src === 'meta' ? (p.meta?.targets?.book || 90000) : T.MS.words(pid);
        panel.replaceChildren(
          h('b', 'Mockup do livro'),
          h('p.muted', T.fmt(words) + ' palavras → ' + pages + ' páginas · lombada de ' + tmm.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mm'),
          h('div.mp-pop-r', h('span', 'Contar'), h('div.seg', [['real', 'O que já escrevi'], ['meta', 'A meta do livro']].map(([k, n]) => h('button' + (st.src === k ? '.on' : ''), { onclick: () => { st.src = k; save(); build(); } }, n)))),
          h('div.mp-pop-r', h('span', 'Formato'), h('div.seg', [['bolso', 'Bolso'], ['14x21', '14 × 21'], ['a5', 'A5'], ['16x23', '16 × 23']].map(([k, n]) => h('button' + (st.trim === k ? '.on' : ''), { onclick: () => { st.trim = k; save(); build(); } }, n)))),
          h('div.mp-pop-r', h('span', 'Capa'), h('div.seg', [[false, 'Brochura'], [true, 'Capa dura']].map(([k, n]) => h('button' + (st.hard === k ? '.on' : ''), { onclick: () => { st.hard = k; save(); build(); } }, n)))),
          h('div.mp-pop-r', h('span', 'Papel'), h('div.seg', [['polen', 'Pólen'], ['offset', 'Offset'], ['couche', 'Couché']].map(([k, n]) => h('button' + (st.paper === k ? '.on' : ''), { onclick: () => { st.paper = k; save(); build(); } }, n)))),
          h('div.mp-pop-r', h('span', 'Fundo'), h('div.seg', [['estudio', 'Estúdio'], ['madeira', 'Mesa'], ['escuro', 'Escuro']].map(([k, n]) => h('button' + (st.bg === k ? '.on' : ''), { onclick: () => { st.bg = k; save(); build(); } }, n)))),
          h('div.mp-row', h('button.btn.sm' + (st.auto ? '.on' : ''), { onclick: () => { st.auto = !st.auto; save(); build(); spin(); } }, icon(st.auto ? 'pause' : 'play'), 'Girar'), h('button.btn.sm', { onclick: () => { st.yaw = -28; st.pitch = -8; build(); save(); } }, 'Frente'), h('button.btn.sm', { onclick: () => { st.yaw = 62; st.pitch = -6; build(); save(); } }, 'Lombada'), h('button.btn.sm', { onclick: () => { st.yaw = 180; st.pitch = -6; build(); save(); } }, 'Contracapa')),
          h('button.btn.sm', { onclick: () => T.Shell.projectModal && T.Shell.projectModal(S().get(pid)) }, icon('image'), coverUrl ? 'Trocar capa ou sinopse' : 'Pôr capa e sinopse'),
          h('p.mp-tip', 'Arraste o livro para girar em qualquer direção. A grossura é calculada pelas palavras, pelo formato e pelo papel.'));
      }
      let dragging = null;
      stage.addEventListener('pointerdown', (e) => { stage.setPointerCapture(e.pointerId); dragging = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch }; });
      stage.addEventListener('pointermove', (e) => { if (!dragging) return; st.yaw = dragging.yaw + (e.clientX - dragging.x) * .5; st.pitch = clamp(dragging.pitch - (e.clientY - dragging.y) * .35, -70, 70); const r = stage.querySelector('.bk-rot'); if (r) r.style.transform = `rotateX(${st.pitch}deg) rotateY(${st.yaw}deg)`; });
      stage.addEventListener('pointerup', () => { if (dragging) save(); dragging = null; });
      function spin(){ cancelAnimationFrame(raf); if (!st.auto) return; const step = () => { if (destroyed || !st.auto) return; if (!dragging) { st.yaw += .35; const r = stage.querySelector('.bk-rot'); if (r) r.style.transform = `rotateX(${st.pitch}deg) rotateY(${st.yaw}deg)`; } raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }
      const ro = new ResizeObserver(T.debounce(build, 150)); ro.observe(stage);
      const off = T.on('items', (e) => { if (e?.id === pid) loadCover(); });
      loadCover(); spin();
      return { destroy(){ destroyed = true; cancelAnimationFrame(raf); ro.disconnect(); off(); } };
    }
  };
})(window.T);
