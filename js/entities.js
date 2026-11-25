/* Tinteiro — entidades do mundo: links [[ ]], nomes destacados no texto e balão ao passar o mouse */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;

  /* ---------- modelos de página da wiki ---------- */
  T.WIKI_TPL = {
    personagem: { name: 'Personagem', plural: 'Personagens', icon: 'person', hue: 330, fields: ['Nome completo', 'Idade', 'Espécie', 'Pronomes', 'Facção', 'Nascimento', 'Ocupação', 'Aparência', 'Objetivo', 'Medo', 'Segredo'], sections: ['História', 'Personalidade', 'Relações', 'Arco no livro'] },
    lugar: { name: 'Lugar', plural: 'Lugares', icon: 'pin', hue: 150, fields: ['Tipo', 'Região', 'Governante', 'População', 'Clima', 'Fundação', 'Facções presentes'], sections: ['Descrição', 'História', 'Cultura', 'Lugares importantes'] },
    faccao: { name: 'Facção', plural: 'Facções', icon: 'shield', hue: 22, fields: ['Líder', 'Sede', 'Fundação', 'Objetivo', 'Símbolo', 'Aliados', 'Inimigos'], sections: ['Origem', 'Crenças', 'Estrutura', 'Membros notáveis'] },
    criatura: { name: 'Criatura', plural: 'Criaturas', icon: 'paw', hue: 95, fields: ['Habitat', 'Tamanho', 'Dieta', 'Perigo', 'Habilidades'], sections: ['Aparência', 'Comportamento', 'Lendas'] },
    item: { name: 'Item ou artefato', plural: 'Itens e artefatos', icon: 'gem', hue: 46, fields: ['Tipo', 'Origem', 'Dono atual', 'Poderes', 'Preço ou custo'], sections: ['Descrição', 'História'] },
    sistema: { name: 'Magia ou tecnologia', plural: 'Magia e tecnologia', icon: 'wand', hue: 268, fields: ['Fonte', 'Quem pode usar', 'Custo', 'Limites'], sections: ['Como funciona', 'Regras', 'Exceções e falhas'] },
    evento: { name: 'Evento histórico', plural: 'Eventos históricos', icon: 'star', hue: 200, fields: ['Data', 'Local', 'Envolvidos', 'Consequências'], sections: ['O que aconteceu', 'Antecedentes', 'Depois'] },
    livre: { name: 'Página livre', plural: 'Outras páginas', icon: 'doc', hue: 230, fields: [], sections: [] },
  };
  T.tplOf = (page) => T.WIKI_TPL[page?.meta?.tpl] || T.WIKI_TPL.livre;

  /* ---------- índice de nomes por projeto ---------- */
  const cache = new Map();
  T.on('items', (ev) => { const t = ev.item?.type; if (!t || ['page', 'word', 'lang'].includes(t) || ev.kind === 'import') cache.clear(); });
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  T.Ent = {
    pages(pid){ return S().all(pid).filter(i => i.type === 'page'); },
    index(pid){
      if (cache.has(pid)) return cache.get(pid);
      const ents = []; const byName = new Map();
      const add = (name, ent) => { const n = (name || '').trim(); if (n.length < 2) return; const k = n.toLowerCase(); if (!byName.has(k)) { byName.set(k, ent); ents.push(n); } };
      T.Ent.pages(pid).forEach(p => {
        const e = { kind: 'page', id: p.id };
        add(p.title, e);
        (p.meta?.aliases || '').split(',').forEach(a => add(a, e));
        const full = (p.meta?.fields || []).find(f => /nome completo/i.test(f.k)); if (full) add(full.v, e);
      });
      const langs = S().all(pid).filter(i => i.type === 'lang' && i.meta?.detect !== false).map(l => l.id);
      S().all(pid).filter(i => i.type === 'word' && langs.includes(i.parent)).forEach(w => add(w.title, { kind: 'word', id: w.id }));
      ents.sort((a, b) => b.length - a.length);
      const re = ents.length ? new RegExp('(?<![\\p{L}\\p{N}])(' + ents.map(escRe).join('|') + ')(?![\\p{L}\\p{N}])', 'giu') : null;
      const out = { re, byName };
      cache.set(pid, out);
      return out;
    },
    find(pid, name){ return T.Ent.index(pid).byName.get((name || '').toLowerCase()); },
  };

  /* ---------- destaque no texto (CSS Custom Highlight API: não mexe no texto) ---------- */
  const registry = new Map(); // root -> [{range, ent}]
  const canHL = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';
  function rebuild(){
    if (!canHL) return;
    const pg = new Highlight(), wd = new Highlight();
    registry.forEach(list => list.forEach(({ range, ent }) => (ent.kind === 'word' ? wd : pg).add(range)));
    CSS.highlights.set('ent-page', pg); CSS.highlights.set('ent-word', wd);
  }
  T.Ent.decorate = function(root, pid){
    const { re } = T.Ent.index(pid);
    const list = [];
    if (re) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement && n.parentElement.closest('a.wl, .ch-title, .scene-sep') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      let n, count = 0;
      while ((n = walker.nextNode()) && count < 3000) {
        re.lastIndex = 0; let m;
        while ((m = re.exec(n.textContent))) {
          const ent = T.Ent.find(pid, m[1]); if (!ent) continue;
          const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
          list.push({ range: r, ent }); count++;
        }
      }
    }
    registry.set(root, list); rebuild();
  };
  T.Ent.undecorate = function(root){ registry.delete(root); rebuild(); };

  /* ---------- balão ao passar o mouse ---------- */
  let tip = null, tipTimer = null, tipFor = null;
  function pointNode(x, y){
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); return p ? { node: p.offsetNode, offset: p.offset } : null; }
    if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); return r ? { node: r.startContainer, offset: r.startOffset } : null; }
    return null;
  }
  T.Ent.hover = function(root, pid){
    const onMove = T.debounce((e) => {
      const a = e.target.closest && e.target.closest('a.wl');
      if (a && a.dataset.p) return show({ kind: 'page', id: a.dataset.p }, a.getBoundingClientRect());
      const list = registry.get(root); if (!list || !list.length) return hideSoon();
      const pt = pointNode(e.clientX, e.clientY); if (!pt || pt.node.nodeType !== 3) return hideSoon();
      const hit = list.find(({ range }) => range.startContainer === pt.node && pt.offset >= range.startOffset && pt.offset <= range.endOffset);
      if (!hit) return hideSoon();
      const rr = hit.range.getBoundingClientRect();
      if (e.clientX < rr.left - 2 || e.clientX > rr.right + 2 || e.clientY < rr.top - 2 || e.clientY > rr.bottom + 2) return hideSoon();
      show(hit.ent, rr);
    }, 60);
    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', hideSoon);
    root.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a.wl');
      if (a && a.dataset.p && (e.ctrlKey || e.metaKey || root.getAttribute('contenteditable') !== 'true')) { e.preventDefault(); T.Shell.open({ kind: 'page', ref: a.dataset.p }, { side: true }); }
    });
    return () => { root.removeEventListener('mousemove', onMove); root.removeEventListener('mouseleave', hideSoon); };
  };
  function hideSoon(){ clearTimeout(tipTimer); tipTimer = setTimeout(() => { if (tip && !tip.matches(':hover')) { tip.remove(); tip = null; tipFor = null; } }, 220); }
  function show(ent, rect){
    clearTimeout(tipTimer);
    const key = ent.kind + ent.id; if (tip && tipFor === key) return;
    if (tip) tip.remove();
    const it = S().get(ent.id); if (!it) return;
    tip = ent.kind === 'word' ? wordCard(it) : pageCard(it);
    tipFor = key;
    tip.addEventListener('mouseleave', hideSoon);
    document.body.appendChild(tip);
    const tr = tip.getBoundingClientRect();
    tip.style.left = T.clamp(rect.left, 8, innerWidth - tr.width - 8) + 'px';
    tip.style.top = (rect.bottom + 8 + tr.height < innerHeight ? rect.bottom + 8 : rect.top - tr.height - 8) + 'px';
  }
  function pageCard(p){
    const tpl = T.tplOf(p);
    const fields = (p.meta?.fields || []).filter(f => f.v).slice(0, 4);
    const first = T.htmlToText(p.body).split('\n').find(l => l.trim().length > 20) || '';
    return h('div.ent-tip.glass.glass-strong',
      h('div.row', p.meta?.portrait ? h('img.ent-por', { src: T.Assets.url(p.meta.portrait), alt: '' }) : h('div.ent-por.ph', { style: { '--h': tpl.hue } }, icon(tpl.icon)),
        h('div.grow', h('b', p.title || 'Sem título'), h('div.muted', { style: { fontSize: '12px' } }, tpl.name))),
      fields.length ? h('div.ent-fields', fields.map(f => h('div', h('span.muted', f.k + ': '), f.v))) : null,
      first ? h('p.ent-sum', first.slice(0, 180) + (first.length > 180 ? '…' : '')) : null,
      h('div.row', { style: { gap: '6px' } }, (() => { const vv = T.Voices && T.Voices.voiceFor(p.pid, p.title); return vv && (vv.clips || []).length ? h('button.btn.sm.primary', { onclick: () => T.Voices.play(vv) }, icon('play'), 'Ouvir a voz') : null; })(),
        h('button.btn.sm', { onclick: () => { tip && tip.remove(); tip = null; T.Shell.open({ kind: 'page', ref: p.id }, { side: true }); } }, icon('pop'), 'Abrir página')));
  }
  function wordCard(w){
    const lang = S().get(w.parent);
    const def = (w.meta?.defs || [])[0];
    return h('div.ent-tip.glass.glass-strong',
      h('div.ent-script', { html: T.Lang ? T.Lang.scriptHTML(lang, w.title) : '' }),
      h('div.row', h('b.grow', w.title), w.meta?.pos ? h('span.chip', w.meta.pos) : null),
      w.meta?.pron ? h('div.muted', '/' + w.meta.pron + '/') : null,
      def ? h('p.ent-sum', def.text) : null,
      h('div.row', h('span.muted.grow', { style: { fontSize: '11.5px' } }, lang?.title || ''), h('button.btn.sm', { onclick: () => { tip && tip.remove(); tip = null; T.Shell.open({ kind: 'lang', ref: lang.id, word: w.id }, { side: true }); } }, icon('dict'), 'Ver verbete')));
  }

  /* ---------- autocompletar [[ ---------- */
  T.Ent.autocomplete = function(root, pid, onInsert){
    let box = null, items = [], sel = 0, startRange = null;
    function close(){ if (box) { box.remove(); box = null; } }
    function query(){
      const s = getSelection(); if (!s.rangeCount || !s.isCollapsed) return null;
      const r = s.getRangeAt(0); const n = r.startContainer; if (n.nodeType !== 3 || !root.contains(n)) return null;
      const before = n.textContent.slice(0, r.startOffset);
      const m = before.match(/\[\[([^\[\]\n]{0,40})$/); if (!m) return null;
      const rg = document.createRange(); rg.setStart(n, r.startOffset - m[0].length); rg.setEnd(n, r.startOffset);
      return { q: m[1], range: rg };
    }
    function render(q){
      const ql = q.toLowerCase();
      const pages = T.Ent.pages(pid).filter(p => (p.title || '').toLowerCase().includes(ql) || (p.meta?.aliases || '').toLowerCase().includes(ql)).slice(0, 8);
      items = pages.map(p => ({ p }));
      if (q.trim()) items.push({ create: q.trim() });
      if (!box) { box = h('div.ac.glass.glass-strong'); document.body.appendChild(box); }
      box.innerHTML = '';
      if (!items.length) box.appendChild(h('div.muted', { style: { padding: '8px 10px', fontSize: '12.5px' } }, 'Digite o nome de uma página da wiki…'));
      items.forEach((it, i) => {
        const tpl = it.p ? T.tplOf(it.p) : null;
        const b = h('button' + (i === sel ? '.on' : ''), { type: 'button', onmousedown: (e) => { e.preventDefault(); choose(i); } }, icon(it.p ? tpl.icon : 'plus'), it.p ? it.p.title : 'Criar página “' + it.create + '”', it.p ? h('span.muted', tpl.name) : null);
        box.appendChild(b);
      });
      const rr = startRange.getBoundingClientRect();
      box.style.left = T.clamp(rr.left, 8, innerWidth - 280) + 'px'; box.style.top = (rr.bottom + 6) + 'px';
    }
    function choose(i){
      const it = items[i]; if (!it) return;
      let page = it.p;
      if (it.create) page = S().create({ pid, type: 'page', area: 'wiki', title: it.create, meta: { tpl: 'personagem', fields: T.WIKI_TPL.personagem.fields.map(k => ({ k, v: '' })) }, body: T.WIKI_TPL.personagem.sections.map(s => '<h2>' + s + '</h2><p><br></p>').join('') });
      const s = getSelection(); s.removeAllRanges(); s.addRange(startRange);
      document.execCommand('insertHTML', false, '<a class="wl" data-p="' + page.id + '">' + T.esc(page.title) + '</a>&nbsp;');
      close(); onInsert && onInsert(page);
      if (it.create) { T.emit('tree-changed'); T.toast('Página “' + page.title + '” criada na wiki.', { action: { label: 'Abrir', fn: () => T.Shell.open({ kind: 'page', ref: page.id }, { side: true }) } }); }
    }
    root.addEventListener('input', () => { const q = query(); if (!q) return close(); startRange = q.range; sel = 0; render(q.q); });
    root.addEventListener('keydown', (e) => {
      if (!box) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, items.length); render(query()?.q || ''); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(1, items.length); render(query()?.q || ''); }
      else if (e.key === 'Enter' || e.key === 'Tab') { if (items.length) { e.preventDefault(); e.stopImmediatePropagation(); choose(sel); } }
      else if (e.key === 'Escape') { close(); }
    }, true);
    root.addEventListener('blur', () => setTimeout(close, 150));
    return close;
  };
})(window.T);
