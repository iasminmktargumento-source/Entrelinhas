/* Entrelinhas — backup do manuscrito num documento do Google Docs (com os comentários) */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;
  const SERVER = 'Google Docs';
  const DEFAULT_URL = 'https://docs.google.com/document/d/1xxjoFCwx-juG5EtiuCdenvQX11VkMXCsDAQtD5jJndE/edit';
  const idOf = (url) => { const m = String(url || '').match(/\/document\/d\/([a-zA-Z0-9_-]{20,})/) || String(url || '').match(/^([a-zA-Z0-9_-]{25,})$/); return m ? m[1] : null; };
  const BAD_CH = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u2028\\u2029]', 'g');
  const st = {}; // estado por livro: { running, again, dirty, timer, firstDirty }
  let mcp;
  async function getMcp(){ if (mcp === undefined) { try { mcp = (window.claude && claude.use) ? await Promise.race([claude.use('mcp'), new Promise(r => setTimeout(() => r(null), 11000))]) : null; } catch (e) { mcp = null; } } return mcp; }

  const G = T.GDocs = {
    cfg(pid){ return Object.assign({ url: '', on: false, last: 0, err: '' }, S().get(pid)?.meta?.gdocs || {}); },
    set(pid, patch){ S().update(pid, { meta: { gdocs: Object.assign(G.cfg(pid), patch) } }); T.emit('gdocs-status', pid); },
    status(pid){ const c = G.cfg(pid); const s = st[pid] || {}; return { on: c.on && !!idOf(c.url), running: !!s.running, dirty: !!s.dirty, last: c.last, err: c.err }; },
  };

  /* ---------- monta o texto do documento ---------- */
  const MARK = '⟦Entrelinhas · ';
  function build(pid, base = 1){
    const proj = S().get(pid);
    let text = ''; const paras = []; const runs = [];
    const para = (segs, style, align) => {
      const start = base + text.length;
      segs.forEach(sg => { const t = String(sg.t).replace(BAD_CH, ' '); if (!t) return; const a = base + text.length; text += t; if (sg.st && Object.keys(sg.st).length) runs.push({ a, b: base + text.length, st: sg.st }); });
      text += '\n';
      paras.push({ a: start, b: base + text.length, style: style || 'NORMAL_TEXT', align });
    };
    const fmt = (ts) => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    // marcador: cada livro tem a sua parte no documento (vários livros podem dividir o mesmo documento)
    para([{ t: MARK + pid + '⟧', st: { color: [.72, .72, .76], size: 7 } }], 'NORMAL_TEXT');
    para([{ t: proj?.title || 'Meu livro' }], 'TITLE');
    para([{ t: 'Cópia de segurança feita pelo Entrelinhas · atualizada em ' + fmt(Date.now()) + '. Esta parte do documento é refeita a cada backup deste livro: escreva no Entrelinhas, não aqui.', st: { italic: true, color: [.45, .45, .5] } }], 'NORMAL_TEXT');
    const flat = T.MS.flat(pid);
    let n = 0;
    const host = document.createElement('div');
    flat.forEach(it => {
      const title = (it.title || '').trim();
      if (it.type === 'part') para([{ t: title || 'Parte' }], 'HEADING_1');
      else if (it.type === 'chapter') para([{ t: title || 'Capítulo' }], 'HEADING_2');
      else if (title) para([{ t: title }], 'HEADING_3');
      host.innerHTML = it.body || '';
      const notes = [];
      const walk = (node, stl, out) => {
        node.childNodes.forEach(ch => {
          if (ch.nodeType === 3) { if (ch.data) out.push({ t: ch.data.replace(/\s+/g, ' '), st: stl }); return; }
          if (ch.nodeType !== 1) return;
          const tag = ch.tagName;
          if (tag === 'BR') { out.push({ t: ' ', st: stl }); return; }
          if (ch.classList.contains('scene-x') || ch.classList.contains('sep-x')) return;
          const s2 = Object.assign({}, stl);
          if (tag === 'B' || tag === 'STRONG') s2.bold = true;
          if (tag === 'I' || tag === 'EM') s2.italic = true;
          if (tag === 'U') s2.underline = true;
          if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') s2.strike = true;
          if (tag === 'MARK') s2.bg = ({ verde: [.75, .93, .72], azul: [.72, .87, 1], rosa: [1, .78, .9], laranja: [1, .84, .62], roxo: [.86, .78, 1], cinza: [.86, .87, .9] })[ch.dataset.hl] || [1, .95, .6];
          const cid = tag === 'SPAN' && ch.classList.contains('cmt') ? ch.dataset.c : null;
          const f = cid ? T.Comments?.find(pid, cid) : null;
          if (f) s2.bg = f.c.resolved ? null : [1, .93, .55];
          walk(ch, s2, out);
          if (f) { n++; notes.push({ n, c: f.c }); out.push({ t: '[' + n + ']', st: { sup: true, bold: true, color: [.75, .45, 0] } }); }
        });
      };
      [...host.children].forEach(b => {
        if (b.tagName === 'HR' || b.classList.contains('scene-sep')) { para([{ t: '⁂' }], 'NORMAL_TEXT', 'CENTER'); return; }
        const segs = []; walk(b, {}, segs);
        const plain = segs.map(x => x.t).join('').trim();
        if (!plain) return;
        if (segs.length) segs[0].t = segs[0].t.replace(/^\s+/, '');
        const style = b.dataset && b.dataset.st ? ({ t1: 'HEADING_4', t2: 'HEADING_5', t3: 'HEADING_6', sub: 'SUBTITLE' }[b.dataset.st] || 'NORMAL_TEXT') : /^H[1-3]$/.test(b.tagName) ? 'HEADING_4' : 'NORMAL_TEXT';
        para(segs, style, b.tagName === 'BLOCKQUOTE' ? null : null);
      });
      if (notes.length) {
        para([{ t: 'Comentários' + (title ? ' · ' + title : '') }], 'HEADING_5');
        notes.forEach(({ n, c }) => {
          para([{ t: '[' + n + '] ', st: { bold: true, color: [.75, .45, 0] } }, c.quote ? { t: '“' + c.quote + '” ', st: { italic: true, color: [.4, .4, .45] } } : { t: '' }, { t: '— ' + (c.text || '') }, c.resolved ? { t: '  (resolvido)', st: { italic: true, color: [.2, .55, .3] } } : { t: '' }], 'NORMAL_TEXT');
          (c.replies || []).forEach(r => para([{ t: '      ↳ ' + r.text, st: { color: [.35, .35, .4] } }], 'NORMAL_TEXT'));
        });
      }
    });
    return { text, paras, runs };
  }
  const rgb = (c) => ({ color: { rgbColor: { red: c[0], green: c[1], blue: c[2] } } });
  function requestsFor(doc){
    const L = doc.text.length; const out = [];
    out.push({ updateParagraphStyle: { range: { startIndex: 1, endIndex: 1 + L }, paragraphStyle: { namedStyleType: 'NORMAL_TEXT', alignment: 'START' }, fields: 'namedStyleType,alignment' } });
    out.push({ updateTextStyle: { range: { startIndex: 1, endIndex: 1 + L }, textStyle: {}, fields: 'bold,italic,underline,strikethrough,backgroundColor,foregroundColor,baselineOffset' } });
    doc.paras.forEach(p => {
      if (p.style !== 'NORMAL_TEXT') out.push({ updateParagraphStyle: { range: { startIndex: p.a, endIndex: p.b }, paragraphStyle: { namedStyleType: p.style }, fields: 'namedStyleType' } });
      if (p.align) out.push({ updateParagraphStyle: { range: { startIndex: p.a, endIndex: p.b }, paragraphStyle: { alignment: p.align }, fields: 'alignment' } });
    });
    doc.runs.forEach(r => {
      const ts = {}; const f = [];
      if (r.st.size) { ts.fontSize = { magnitude: r.st.size, unit: 'PT' }; f.push('fontSize'); }
      if (r.st.bold) { ts.bold = true; f.push('bold'); }
      if (r.st.italic) { ts.italic = true; f.push('italic'); }
      if (r.st.underline) { ts.underline = true; f.push('underline'); }
      if (r.st.strike) { ts.strikethrough = true; f.push('strikethrough'); }
      if (r.st.bg) { ts.backgroundColor = rgb(r.st.bg); f.push('backgroundColor'); }
      if (r.st.color) { ts.foregroundColor = rgb(r.st.color); f.push('foregroundColor'); }
      if (r.st.sup) { ts.baselineOffset = 'SUPERSCRIPT'; f.push('baselineOffset'); }
      if (f.length) out.push({ updateTextStyle: { range: { startIndex: r.a, endIndex: r.b }, textStyle: ts, fields: f.join(',') } });
    });
    return out;
  }
  // parágrafos do documento com posição e texto (formato do documents.get)
  function parasOf(payload){
    const c = payload?.content || payload?.document || payload;
    const body = c?.tabs?.[0]?.documentTab?.body || c?.body;
    return (body?.content || []).filter(x => x.paragraph).map(x => ({ a: x.startIndex || 0, b: x.endIndex || 0, t: (x.paragraph.elements || []).map(e => e.textRun?.content || '').join('') }));
  }
  function endIndexOf(payload){
    const c = payload?.content || payload?.document || payload;
    const body = c?.tabs?.[0]?.documentTab?.body || c?.body;
    const list = body?.content || [];
    return list.length ? (list[list.length - 1].endIndex || 2) : 2;
  }

  /* ---------- o backup em si ---------- */
  G.run = async function(pid, manual){
    const s = st[pid] = st[pid] || {};
    if (s.running) { s.again = true; return; }
    const c = G.cfg(pid); const id = idOf(c.url);
    if (!id) { if (manual) T.toast('Cole o link do documento do Google Docs primeiro.'); return; }
    const m = await getMcp();
    if (!m) { G.set(pid, { err: 'Para o backup no Google Docs, abra o Entrelinhas pelo claude.ai (com o Google Docs conectado).' }); return; }
    s.running = true; s.dirty = false; clearTimeout(s.timer); s.firstDirty = 0; T.emit('gdocs-status', pid);
    try {
      T.Shell.flushEditors && T.Shell.flushEditors();
      const r0 = await m.callTool(SERVER, 'read_doc', { documentId: id }, { cache: false });
      const end = endIndexOf(r0.payload);
      // onde fica a parte deste livro: entre o marcador dele e o próximo marcador
      const marks = parasOf(r0.payload).filter(p => p.t.startsWith(MARK));
      let base = 1, delA = 1, delB = end - 1;
      if (marks.length) {
        const i = marks.findIndex(p => p.t.startsWith(MARK + pid + '⟧'));
        if (i >= 0) { delA = base = marks[i].a; delB = i + 1 < marks.length ? marks[i + 1].a : end - 1; }
        else { base = delA = delB = end - 1; } // livro novo neste documento: vai para o fim
      }
      const doc = build(pid, base);
      const head = [];
      if (delB > delA) head.push({ deleteContentRange: { range: { startIndex: delA, endIndex: delB } } });
      // texto em pedaços (cada chamada tem limite de tamanho)
      const CH = 150000; let at = base;
      for (let i = 0; i < doc.text.length; i += CH) {
        const piece = doc.text.slice(i, i + CH);
        const reqs = (i === 0 ? head : []).concat([{ insertText: { location: { index: at }, text: piece } }]);
        await m.callTool(SERVER, 'update_doc', { documentId: id, requests: reqs }, { cache: false });
        at += piece.length;
      }
      const rq = requestsFor(doc);
      for (let i = 0; i < rq.length; i += 400) await m.callTool(SERVER, 'update_doc', { documentId: id, requests: rq.slice(i, i + 400) }, { cache: false });
      G.set(pid, { last: Date.now(), err: '' });
      if (manual) T.toast('Backup feito no Google Docs. Para conferir, toque em “Abrir o documento” na janela do backup.');
    } catch (e) {
      const code = e?.code;
      const msg = code === 'needs_reauth' ? 'O Google Docs desconectou. Reconecte em claude.ai › Configurações › Conectores e toque em “Fazer backup agora”.'
        : code === 'server_not_connected' ? 'O Google Docs não está conectado. Conecte em claude.ai › Configurações › Conectores.'
        : code === 'approval_required' || code === 'consent_required' ? 'O backup precisa da sua permissão para usar o Google Docs. Toque em “Fazer backup agora” e aceite o pedido.'
        : code === 'not_in_manifest' ? 'O acesso ao Google Docs foi recusado para este site. Toque em “Fazer backup agora” para pedir de novo.'
        : code === 'tool_error' ? 'O Google Docs recusou o backup: ' + String(e.message || '').slice(0, 160) + ' (confira se o link é de um documento que você pode editar).'
        : code === 'not_granted' || code === 'capability_disabled' ? 'Este jeito de abrir o site não permite usar o Google Docs. Abra o Entrelinhas pelo claude.ai.'
        : 'Não consegui fazer o backup agora (o Google não respondeu). Tento de novo na próxima mudança.';
      G.set(pid, { err: msg }); s.dirty = true;
      if (manual) T.toast(msg);
    } finally {
      s.running = false; T.emit('gdocs-status', pid);
      if (s.again) { s.again = false; schedule(pid, 20000); }
    }
  };
  // espera a escrita acalmar (1 min), mas nunca deixa passar de 5 min sem backup
  function schedule(pid, wait){
    const s = st[pid] = st[pid] || {};
    s.dirty = true; if (!s.firstDirty) s.firstDirty = Date.now();
    clearTimeout(s.timer);
    const left = Math.max(5000, Math.min(wait ?? 60000, 300000 - (Date.now() - s.firstDirty)));
    s.timer = setTimeout(() => G.run(pid), left);
    T.emit('gdocs-status', pid);
  }
  const MS_TYPES = new Set(['part', 'chapter', 'scene']);
  T.on('items', (ev) => {
    const it = ev?.item; if (!it || !it.pid) return;
    if (!G.status(it.pid).on) return;
    if (!MS_TYPES.has(it.type) && !(ev.kind === 'remove' && MS_TYPES.has(it.type))) return;
    const p = ev.patch || {};
    if (ev.kind === 'update' && !('body' in p) && !('title' in p) && !('parent' in p) && !('order' in p) && !(p.meta && 'comments' in p.meta)) return;
    schedule(it.pid);
  });
  T.on('comments-changed', (pid) => { if (G.status(pid).on) schedule(pid); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') for (const pid in st) if (st[pid].dirty && !st[pid].running && G.status(pid).on) G.run(pid); });

  /* ---------- cada livro com o seu documento ---------- */
  // devolve o livro que já usa este documento (para nunca um livro apagar o backup de outro)
  G.owner = async function(url, pid){
    const id = idOf(url); if (!id) return null;
    let ps = []; try { ps = await S().loadProjects(); } catch (e) { ps = []; }
    return ps.find(p => p.id !== pid && idOf(p.meta?.gdocs?.url) === id) || null;
  };
  G.suggest = async function(pid){ const c = G.cfg(pid); return c.url || DEFAULT_URL; };
  async function saveUrl(pid, raw, on){
    const u = String(raw || '').trim(); const id = idOf(u);
    if (!id) { T.toast('Esse link não parece de um documento do Google Docs.'); return false; }
    const o = await G.owner(u, pid);
    if (o) T.toast('Esse documento também guarda o backup de “' + (o.title || 'outro livro') + '”. Cada livro fica na sua própria parte do documento, um depois do outro.');
    G.set(pid, { url: u, on, never: false }); return true;
  }
  // ao abrir um livro sem backup: pede o link
  G.askOnOpen = async function(pid){
    const p = S().get(pid); if (!p) return; const c = G.cfg(pid);
    if (c.url || c.never || p.meta?.sample) return;
    const sug = await G.suggest(pid);
    if (T.Shell?.pid !== pid || document.querySelector('.scrim')) return;
    T.modal((box, close) => {
      const url = h('input.input', { value: sug, placeholder: 'https://docs.google.com/document/d/…', 'aria-label': 'Link do documento do Google Docs' });
      box.append(h('h2', 'Backup deste livro no Google Docs'),
        h('p.sub', '“' + (p.title || 'Este livro') + '” ainda não tem backup. Cole o link de um documento do Google Docs só para ele: o que você escrever no manuscrito (com os comentários) vai sendo copiado para lá sozinho, cerca de 1 minuto depois que você para de escrever.'),
        h('label.field', 'Link do documento', url),
        h('p.muted', { style: { fontSize: '12px', margin: '0' } }, 'Pode ser o mesmo documento de outro livro: cada livro fica na sua parte, uma depois da outra, e o backup de um não apaga o do outro. Ele é refeito a cada backup, então escreva no Entrelinhas, não no documento. Para criar um: docs.google.com › Documento em branco › copie o link da barra do navegador.'),
        h('div.modal-foot',
          h('button.btn.ghost', { onclick: () => { G.set(pid, { never: true }); close(); T.toast('Tudo bem. Se mudar de ideia: Manuscrito › Backup no Docs.'); } }, 'Não perguntar para este livro'),
          h('span.grow'),
          h('button.btn', { onclick: () => close() }, 'Agora não'),
          h('button.btn.primary', { onclick: async () => { if (await saveUrl(pid, url.value, true)) { close(); T.toast('Backup ligado para “' + (p.title || 'este livro') + '”. Fazendo o primeiro agora…'); G.run(pid, true); } } }, icon('check'), 'Ligar o backup')));
      setTimeout(() => { url.focus(); url.select(); }, 50);
    });
  };

  /* ---------- tela de ajustes do backup ---------- */
  G.panel = function(pid){
    T.modal((box, close) => {
      const c = G.cfg(pid);
      const url = h('input.input', { value: c.url || '', placeholder: 'https://docs.google.com/document/d/…', 'aria-label': 'Link do documento do Google Docs' });
      const stat = h('p.gd-stat');
      const draw = () => {
        const s = G.status(pid), cc = G.cfg(pid);
        stat.className = 'gd-stat' + (cc.err ? ' bad' : '');
        stat.textContent = s.running ? 'Fazendo o backup agora…' : cc.err ? cc.err : cc.last ? 'Último backup: ' + T.relTime(cc.last) + (s.dirty ? ' · há mudanças esperando o próximo backup' : ' · está tudo copiado') : 'Ainda não houve backup.';
      };
      const auto = h('input', { type: 'checkbox', checked: c.url ? !!c.on : true });
      if (!c.url) G.suggest(pid).then(u => { if (u && !url.value) url.value = u; });
      const save = () => saveUrl(pid, url.value, auto.checked);
      const off = T.on('gdocs-status', (p) => { if (p === pid) draw(); });
      box.append(h('h2', 'Backup no Google Docs'), T.STANDALONE ? h('div.banner', { style: { margin: '0 0 8px' } }, 'Nesta versão independente o backup no Google Docs não funciona: ele usa a conexão do Google feita pelo Claude. Use o backup em arquivo (rodapé da barra lateral) ou abra o Entrelinhas pelo claude.ai.') : null,
        h('p.sub', 'Tudo o que você escreve no manuscrito (partes, capítulos, cenas e os comentários, com o trecho marcado e as respostas) é copiado para este documento. O backup acontece sozinho cerca de 1 minuto depois que você para de escrever, e nunca passa de 5 minutos.'),
        h('div.stack',
          h('label.field', 'Link do documento', url),
          h('label.mp-chk', auto, 'Fazer backup automático enquanto escrevo'),
          stat,
          h('p.muted', { style: { fontSize: '12px', margin: 0 } }, 'O documento vira um espelho do livro: a cada backup ele é refeito do zero, então edite sempre no Entrelinhas (o que for mudado direto no Google Docs é substituído). O próprio Google Docs guarda o histórico de versões (Arquivo › Histórico de versões).')),
        h('div.modal-foot',
          (() => { const a = h('a.btn', { href: '#', target: '_blank', rel: 'noopener' }, icon('book'), 'Abrir o documento'); const upd = () => { const id = idOf(url.value.trim()); a.href = id ? 'https://docs.google.com/document/d/' + id + '/edit' : '#'; a.style.opacity = id ? '' : '.5'; }; url.addEventListener('input', upd); upd(); a.onclick = (e) => { if (a.getAttribute('href') === '#') { e.preventDefault(); T.toast('Cole o link do documento primeiro.'); } }; return a; })(),
          h('span.grow'),
          h('button.btn', { onclick: () => { off(); close(); } }, 'Fechar'),
          h('button.btn.primary', { onclick: async () => { if (await save()) G.run(pid, true); } }, icon('check'), 'Fazer backup agora')));
      draw();
    });
  };
})();
