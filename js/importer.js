/* Entrelinhas — importar um livro escrito em outro programa (Word .docx, Google Docs baixado como .docx, .txt, .md, .html) */
(() => {
  const S = () => T.Store;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------- ler um .docx (é um zip) sem biblioteca ---------- */
  async function unzip(buf){
    const dv = new DataView(buf); const u8 = new Uint8Array(buf);
    let eocd = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('zip');
    const n = dv.getUint16(eocd + 10, true); let off = dv.getUint32(eocd + 16, true);
    const files = {};
    for (let k = 0; k < n; k++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
      const nl = dv.getUint16(off + 28, true), xl = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true), lho = dv.getUint32(off + 42, true);
      const name = new TextDecoder().decode(u8.subarray(off + 46, off + 46 + nl));
      files[name] = { method, csize, lho };
      off += 46 + nl + xl + cl;
    }
    return async (name) => {
      const f = files[name]; if (!f) return null;
      const lnl = dv.getUint16(f.lho + 26, true), lxl = dv.getUint16(f.lho + 28, true);
      const data = u8.subarray(f.lho + 30 + lnl + lxl, f.lho + 30 + lnl + lxl + f.csize);
      if (f.method === 0) return new TextDecoder().decode(data);
      const ds = new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
      return await ds.text();
    };
  }
  async function readDocx(file){
    const get = await unzip(await file.arrayBuffer());
    const xml = await get('word/document.xml'); if (!xml) throw new Error('docx');
    const stylesXml = await get('word/styles.xml');
    // nomes dos estilos (o id pode ser "Ttulo1", "Heading1"…)
    const names = {};
    if (stylesXml) { const sd = new DOMParser().parseFromString(stylesXml, 'application/xml'); [...sd.getElementsByTagName('w:style')].forEach(st => { const id = st.getAttribute('w:styleId'); const nm = st.getElementsByTagName('w:name')[0]?.getAttribute('w:val') || ''; names[id] = nm; }); }
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const out = [];
    [...doc.getElementsByTagName('w:p')].forEach(p => {
      const sid = p.getElementsByTagName('w:pStyle')[0]?.getAttribute('w:val') || '';
      const sname = (names[sid] || sid).toLowerCase();
      let level = 0; const m = sname.match(/(heading|t[ií]tulo|titulo)\s*([1-6])/); if (m) level = +m[2]; else if (/^(title|t[ií]tulo)$/.test(sname)) level = -1;
      let html = '', text = '';
      [...p.childNodes].forEach(function walk(node){
        if (node.nodeName === 'w:r') {
          const rp = node.getElementsByTagName('w:rPr')[0];
          const on = (tag) => { const e = rp && rp.getElementsByTagName(tag)[0]; return !!e && e.getAttribute('w:val') !== '0' && e.getAttribute('w:val') !== 'false'; };
          let t = ''; [...node.childNodes].forEach(c => { if (c.nodeName === 'w:t') t += c.textContent; else if (c.nodeName === 'w:tab') t += ' '; else if (c.nodeName === 'w:br') t += ' '; });
          if (!t) return; text += t; let x = esc(t);
          if (on('w:i')) x = '<em>' + x + '</em>'; if (on('w:b')) x = '<strong>' + x + '</strong>';
          html += x;
        } else if (node.nodeName === 'w:hyperlink' || node.nodeName === 'w:ins' || node.nodeName === 'w:smartTag') [...node.childNodes].forEach(walk);
      });
      out.push({ level, text: text.trim(), html: html.trim() });
    });
    return out;
  }
  function readText(txt, md){
    return txt.replace(/\r\n?/g, '\n').split(/\n\s*\n|\n(?=#)/).flatMap(block => {
      const lines = md ? [block.replace(/\n/g, ' ')] : block.split('\n');
      return lines.map(l => {
        const s = l.trim(); if (!s) return null;
        const hm = md && s.match(/^(#{1,6})\s+(.*)$/);
        if (hm) return { level: hm[1].length, text: hm[2], html: esc(hm[2]) };
        let html = esc(s); if (md) html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>').replace(/_(.+?)_/g, '<em>$1</em>');
        return { level: 0, text: s, html };
      }).filter(Boolean);
    });
  }
  function readHtml(src){
    const d = new DOMParser().parseFromString(src, 'text/html');
    return [...d.body.querySelectorAll('h1,h2,h3,p')].map(e => ({ level: /^H/.test(e.tagName) ? +e.tagName[1] : 0, text: e.textContent.trim(), html: e.tagName === 'P' ? e.innerHTML.replace(/<(?!\/?(em|i|strong|b)\b)[^>]*>/g, '').trim() : esc(e.textContent.trim()) }));
  }

  /* ---------- montar partes, capítulos e cenas ---------- */
  const SEP = /^\s*(\*\s*\*\s*\*|\*{3,}|#|~{3,}|-{3,}|✦|◆|—\s*—\s*—)\s*$/;
  const CH_LINE = /^\s*(cap[ií]tulo|chapter|parte)\b[\s\dIVXLC.:–—-]*/i;
  function structure(paras){
    paras = paras.filter(p => p.text || p.level);
    const lv = new Set(paras.filter(p => p.level > 0).map(p => p.level));
    let partL = 0, chL = 0;
    const lvls = [...lv].sort();
    if (lvls.length >= 2) { partL = lvls[0]; chL = lvls[1]; } else if (lvls.length === 1) chL = lvls[0];
    const title = paras.find(p => p.level === -1)?.text || '';
    const parts = []; let part = null, ch = null, scene = null;
    const newCh = (t) => { ch = { title: t || 'Capítulo ' + (countCh() + 1), scenes: [] }; scene = { title: 'Cena 1', paras: [] }; ch.scenes.push(scene); (part ? part.chapters : loose).push(ch); };
    const loose = []; const countCh = () => loose.length + parts.reduce((a, p) => a + p.chapters.length, 0);
    paras.forEach(p => {
      if (p.level === -1) return;
      if (partL && p.level === partL) { part = { title: p.text || 'Parte', chapters: [] }; parts.push(part); ch = null; return; }
      if ((chL && p.level === chL) || (!chL && p.text.length < 60 && CH_LINE.test(p.text))) { newCh(p.text); return; }
      if (p.level > 0) { if (!ch) newCh(''); scene.paras.push('<p><strong>' + p.html + '</strong></p>'); return; }
      if (SEP.test(p.text)) { if (ch && scene.paras.length) { scene = { title: 'Cena ' + (ch.scenes.length + 1), paras: [] }; ch.scenes.push(scene); } return; }
      if (!ch) newCh('');
      scene.paras.push('<p>' + p.html + '</p>');
    });
    return { title, parts, loose };
  }

  async function fromFile(file){
    const name = file.name || 'Livro importado'; const ext = (name.split('.').pop() || '').toLowerCase();
    let paras;
    try {
      if (ext === 'docx') paras = await readDocx(file);
      else if (ext === 'md' || ext === 'markdown') paras = readText(await file.text(), true);
      else if (ext === 'html' || ext === 'htm') paras = readHtml(await file.text());
      else if (ext === 'txt') paras = readText(await file.text(), false);
      else if (ext === 'doc' || ext === 'odt' || ext === 'pdf' || ext === 'pages') { T.toast('Esse formato não dá para ler aqui. Abra o arquivo no Word ou no Google Docs e salve/baixe como .docx, depois importe de novo.'); return; }
      else { T.toast('Escolha um arquivo .docx, .txt, .md ou .html.'); return; }
    } catch (e) { console.warn(e); T.toast('Não consegui ler esse arquivo. Se for do Word, salve de novo como .docx e tente outra vez.'); return; }
    const st = structure(paras);
    const nCh = st.loose.length + st.parts.reduce((a, p) => a + p.chapters.length, 0);
    if (!nCh) { T.toast('O arquivo parece vazio.'); return; }
    const words = paras.reduce((a, p) => a + T.countWords(p.text), 0);
    const title = st.title || name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    const ok = await T.confirm('Importar “' + title + '”?', 'Vai virar um livro novo com ' + (st.parts.length ? st.parts.length + (st.parts.length === 1 ? ' parte, ' : ' partes, ') : '') + nCh + (nCh === 1 ? ' capítulo' : ' capítulos') + ' e cerca de ' + T.fmt(words) + ' palavras. O arquivo original não é alterado.' + (nCh === 1 && words > 4000 ? ' Dica: os capítulos são separados pelos títulos (estilo “Título 1” no Word/Docs) ou por linhas como “Capítulo 2”.' : ''), 'Importar');
    if (!ok) return;
    const p = T.Shell.createProject({ title, hue: Math.floor(Math.random() * 360) }, { noOpen: true });
    const pid = p.id;
    S().all(pid).filter(i => i.area === 'ms').forEach(i => S().remove(i.id));
    let o = 1000;
    const mk = (type, t, parent, body = '') => S().create({ pid, type, area: 'ms', parent, title: t, order: (o += 1000), body, meta: Object.assign({ status: 'rascunho' }, body ? { words: T.words(body) } : {}) });
    const addCh = (c, parent) => { const ci = mk('chapter', c.title, parent); c.scenes.forEach(s => mk('scene', s.title, ci.id, s.paras.join(''))); };
    st.loose.forEach(c => addCh(c, null));
    st.parts.forEach(pt => { const pi = mk('part', pt.title, null); pt.chapters.forEach(c => addCh(c, pi.id)); });
    T.emit('tree-changed');
    T.toast('“' + title + '” importado: ' + nCh + (nCh === 1 ? ' capítulo.' : ' capítulos.'));
    setTimeout(() => T.Shell.openProject(pid), 300);
  }

  T.Importer = {
    fromFile,
    async pick(){ const f = await T.pickFile('.docx,.txt,.md,.markdown,.html,.htm,.doc,.odt,.pdf', { startIn: 'downloads' }); if (f) fromFile(f); },
  };
})();
