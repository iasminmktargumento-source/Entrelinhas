/* Tinteiro — árvore de relações: cartões com retrato ligados por linhas de tipos livres */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  const STYLES = { solid: 'Contínua', dashed: 'Tracejada', dotted: 'Pontilhada', anim: 'Animada' };
  T.LINE_STYLES = STYLES;
  const DEFAULT_REL = [
    { id: 'familia', name: 'Família', hue: 210, style: 'solid', dir: false },
    { id: 'amizade', name: 'Amizade', hue: 140, style: 'solid', dir: false },
    { id: 'romance', name: 'Romance', hue: 330, style: 'solid', dir: false },
    { id: 'rivalidade', name: 'Rivalidade', hue: 25, style: 'dashed', dir: false },
    { id: 'inimizade', name: 'Inimizade', hue: 355, style: 'solid', dir: false, w: 3 },
    { id: 'mentoria', name: 'Mentoria', hue: 190, style: 'dotted', dir: true },
    { id: 'lealdade', name: 'Lealdade', hue: 48, style: 'solid', dir: true },
    { id: 'traicao', name: 'Traição', hue: 280, style: 'anim', dir: true },
    { id: 'divida', name: 'Dívida de sangue', hue: 5, style: 'dotted', dir: true },
    { id: 'reencarnacao', name: 'Reencarnação', hue: 172, style: 'anim', dir: true },
  ];
  T.typeColor = (t) => `hsl(${t?.hue ?? 230} 80% 58%)`;
  T.dashFor = (style) => style === 'dashed' ? '10 7' : style === 'dotted' ? '1.5 6' : style === 'anim' ? '9 9' : '';

  T.board = (pid, kind, defaults) => {
    let b = S().all(pid).find(i => i.type === 'board' && i.meta?.kind === kind);
    if (!b) b = S().create(Object.assign({ pid, type: 'board', area: 'board', title: kind, meta: { kind } }, { meta: Object.assign({ kind }, defaults) }));
    return b;
  };

  /* ---------- editor de tipos (reaproveitado na teia) ---------- */
  T.typeEditor = (anchor, types, onChange, title = 'Tipos de relação') => {
    const list = types.map(t => Object.assign({}, t));
    const commit = () => onChange(list.map(t => Object.assign({}, t)));
    const wrap = h('div.type-ed');
    function draw(){
      wrap.innerHTML = '';
      wrap.appendChild(h('b', { style: { fontSize: '13px' } }, title));
      list.forEach((t, i) => {
        const name = h('input.input', { value: t.name, 'aria-label': 'Nome do tipo' }); name.onchange = () => { t.name = name.value.trim() || 'Sem nome'; commit(); };
        const col = h('button.swatch', { type: 'button', title: 'Trocar cor', style: { '--h': t.hue } }); col.style.setProperty('--h', t.hue);
        col.onclick = () => { const k = T.HUES.indexOf(t.hue); t.hue = T.HUES[(k + 1) % T.HUES.length] ?? T.HUES[0]; commit(); draw(); };
        const st = h('select.select', { 'aria-label': 'Estilo da linha' }, Object.entries(STYLES).map(([k, l]) => h('option', { value: k, selected: t.style === k }, l))); st.onchange = () => { t.style = st.value; commit(); draw(); };
        const dir = h('button.btn.sm', { type: 'button', title: 'Com direção (seta) ou sem', onclick: () => { t.dir = !t.dir; commit(); draw(); } }, t.dir ? '→' : '—');
        const prev = svg('svg', { width: 54, height: 12, viewBox: '0 0 54 12' }); prev.appendChild(svg('line', { x1: 2, y1: 6, x2: 52, y2: 6, stroke: T.typeColor(t), 'stroke-width': t.w || 2.2, 'stroke-dasharray': T.dashFor(t.style), 'stroke-linecap': 'round' }));
        wrap.appendChild(h('div.type-row', col, name, prev, st, dir, h('button.icon-btn.sm', { title: 'Apagar tipo', onclick: () => { list.splice(i, 1); commit(); draw(); } }, icon('trash'))));
      });
      wrap.appendChild(h('button.btn.sm', { onclick: () => { list.push({ id: T.id(), name: 'Novo tipo', hue: T.HUES[list.length % T.HUES.length], style: 'solid', dir: false }); commit(); draw(); } }, icon('plus'), 'Novo tipo'));
    }
    draw();
    return T.popover(anchor, wrap);
  };

  /* ---------- relações de uma página (para a wiki) ---------- */
  T.Rel = {
    trees(pid){ return S().all(pid).filter(i => i.type === 'board' && i.meta?.kind === 'rel').sort((a, b) => (a.created || 0) - (b.created || 0)); },
    main(pid){ return T.Rel.trees(pid)[0] || T.board(pid, 'rel', { nodes: {}, edges: [], types: DEFAULT_REL.map(t => Object.assign({}, t)), view: { x: 80, y: 60, k: 1 }, name: 'Principal' }); },
    nameOf(b){ return b?.meta?.name || 'Principal'; },
    create(pid, name){ T.Rel.main(pid); const b = S().create({ pid, type: 'board', area: 'board', title: 'rel', meta: { kind: 'rel', name, nodes: {}, edges: [], view: { x: 80, y: 60, k: 1 }, hidden: [] } }); T.emit('tree-changed'); return b; },
    of(pid, pageId){
      const trees = T.Rel.trees(pid); if (!trees.length) return [];
      const types = trees[0].meta.types || DEFAULT_REL; const many = trees.length > 1;
      return trees.flatMap(b => (b.meta.edges || []).map(e => Object.assign({ _tn: many ? T.Rel.nameOf(b) : '' }, e))).filter(e => e.a === pageId || e.b === pageId).map(e => {
        const other = S().get(e.a === pageId ? e.b : e.a); const t = types.find(x => x.id === e.type);
        return other ? { page: other, label: (t?.name || 'Relação') + (e.note ? ' · ' + e.note.slice(0, 30) : '') + (e._tn ? ' (' + e._tn + ')' : ''), color: T.typeColor(t) } : null;
      }).filter(Boolean);
    }
  };

  /* ---------- a tela ---------- */
  const CW = 124, CH = 168;
  T.Views.tree = {
    icon: 'tree', title: (tab) => { const b = tab.ref && tab.ref !== 'tree' ? S().get(tab.ref) : null; return b ? 'Árvore · ' + T.Rel.nameOf(b) : 'Árvore de relações'; },
    mount(root, tab, ctx){
      const pid = ctx.pid;
      const mainB = T.Rel.main(pid);
      const trees = T.Rel.trees(pid);
      const one = tab.ref && tab.ref !== 'tree' ? S().get(tab.ref) : null;
      const isAll = !one && trees.length > 1;
      const board = one || (isAll ? T.board(pid, 'relall', { nodes: {}, view: { x: 80, y: 60, k: 1 }, hidden: [], hiddenTrees: [] }) : mainB);
      const shown = isAll ? trees : [board];
      // arestas de cada árvore (cópias editáveis) e tipos compartilhados (ficam na árvore principal)
      const TE = {}; trees.forEach(t => { TE[t.id] = JSON.parse(JSON.stringify(t.meta.edges || [])).map(e => Object.assign(e, { _t: t.id })); });
      const L = JSON.parse(JSON.stringify(board.meta));
      const M = { nodes: L.nodes || {}, view: L.view || { x: 80, y: 60, k: 1 }, hidden: L.hidden || [], hiddenTrees: L.hiddenTrees || [], types: JSON.parse(JSON.stringify(mainB.meta.types || DEFAULT_REL)), edges: [] };
      if (isAll) trees.forEach(t => Object.entries(t.meta.nodes || {}).forEach(([id, pos]) => { if (!M.nodes[id]) M.nodes[id] = Object.assign({}, pos); }));
      let curTree = isAll ? (tab.target && TE[tab.target] ? tab.target : mainB.id) : board.id;
      const rebuild = () => { M.edges = shown.filter(t => !M.hiddenTrees.includes(t.id)).flatMap(t => TE[t.id] || []); };
      rebuild();
      const strip = (arr) => arr.map(e => { const { _t, ...r } = e; return r; });
      // grava só o que mudou nesta tela (outra aba pode estar mexendo em outra árvore)
      const SNAP = {}; trees.forEach(t => SNAP[t.id] = JSON.stringify(strip(TE[t.id] || []))); let snapTypes = JSON.stringify(M.types);
      const persist = T.debounce(() => {
        S().update(board.id, { meta: isAll ? { nodes: M.nodes, view: M.view, hidden: M.hidden, hiddenTrees: M.hiddenTrees } : { nodes: M.nodes, view: M.view, hidden: M.hidden } }, { silent: true });
        trees.forEach(t => {
          const cur = JSON.stringify(strip(TE[t.id] || [])); const fresh = S().get(t.id); if (!fresh) return;
          const nodes = Object.assign({}, fresh.meta.nodes || {}); let addN = false;
          if (isAll) (TE[t.id] || []).forEach(e => [e.a, e.b].forEach(id => { if (!nodes[id] && M.nodes[id]) { nodes[id] = Object.assign({}, M.nodes[id]); addN = true; } }));
          if (cur !== SNAP[t.id] || addN) { S().update(t.id, { meta: Object.assign({ edges: strip(TE[t.id] || []) }, isAll ? { nodes } : {}) }, { silent: true }); SNAP[t.id] = cur; }
        });
        const ty = JSON.stringify(M.types); if (ty !== snapTypes) { S().update(mainB.id, { meta: { types: M.types } }, { silent: true }); snapTypes = ty; }
      }, 600);
      const addEdge = (e, tid) => { tid = tid || curTree; e._t = tid; (TE[tid] = TE[tid] || []).push(e); rebuild(); };
      const delEdge = (e) => { const arr = TE[e._t] || []; const i = arr.indexOf(e); if (i >= 0) arr.splice(i, 1); rebuild(); };
      const treeName = (tid) => T.Rel.nameOf(S().get(tid));

      const wrap = h('div.rel');
      const stage = h('div.rel-stage');
      const lines = svg('svg', { class: 'rel-svg', width: 1, height: 1 });
      const defs = svg('defs', {}); lines.appendChild(defs);
      const gEdges = svg('g', {}); lines.appendChild(gEdges);
      const temp = svg('path', { class: 'rel-temp', d: '' }); lines.appendChild(temp);
      const cardsEl = h('div');
      stage.append(lines, cardsEl);
      const bar = h('div.rel-bar.glass.lg.hscroll');
      const legend = h('div.rel-legend');
      wrap.append(stage, bar);
      root.appendChild(wrap);
      let hoverId = null;

      function applyView(){ stage.style.transform = `translate(${M.view.x}px,${M.view.y}px) scale(${M.view.k})`; }
      function pages(){ return Object.keys(M.nodes).map(id => S().get(id)).filter(Boolean); }

      function openTree(ref){ persist.flush(); T.Shell.open({ kind: 'tree', ref }, { replace: tab }); }
      function buildBar(){
        bar.innerHTML = '';
        legend.innerHTML = '';
        M.types.forEach(t => {
          const off = M.hidden.includes(t.id);
          const chip = h('button.rel-chip' + (off ? '.off' : ''), { type: 'button', title: off ? 'Mostrar ' + t.name : 'Esconder ' + t.name, onclick: () => { M.hidden = off ? M.hidden.filter(x => x !== t.id) : [...M.hidden, t.id]; persist(); buildBar(); drawEdges(); } });
          const s = svg('svg', { width: 22, height: 8 }); s.appendChild(svg('line', { x1: 1, y1: 4, x2: 21, y2: 4, stroke: T.typeColor(t), 'stroke-width': 2.4, 'stroke-dasharray': T.dashFor(t.style), 'stroke-linecap': 'round' }));
          chip.append(s, t.name); legend.appendChild(chip);
        });
        const typesBtn = T.menuButton('filter', 'Tipos de relação' + (M.hidden.length ? ' (' + M.hidden.length + ' ocultos)' : ''), 'Mostrar, esconder e editar os tipos de relação', (btn) => {
          T.popover(btn, h('div.stack', { style: { width: '340px' } }, h('b', 'Tipos de relação'), h('span.muted', { style: { fontSize: '12px' } }, 'Toque num tipo para esconder ou mostrar as linhas dele.'), legend,
            h('button.btn.sm', { onclick: () => { T.closePopover(); T.typeEditor(btn, M.types, (nt) => { M.types = nt; persist(); buildBar(); drawEdges(); }); } }, icon('edit'), 'Editar, criar ou apagar tipos…')));
        });
        legend.style.flexWrap = 'wrap';
        const treeBtn = T.menuButton('tree', isAll ? 'Geral (todas as árvores)' : T.Rel.nameOf(board), 'Trocar de árvore, criar uma nova', (btn) => T.menuAt(btn, [
          { head: 'Árvores de relações' },
          trees.length > 1 ? { label: (isAll ? '● ' : '○ ') + 'Geral: todas juntas', icon: 'layers', fn: () => openTree('tree') } : null,
          ...T.Rel.trees(pid).map(t => ({ label: (!isAll && t.id === board.id ? '● ' : '○ ') + T.Rel.nameOf(t), icon: 'tree', fn: () => openTree(t.id) })),
          '-', { label: 'Nova árvore…', icon: 'plus', fn: async () => { const n = await T.ask('Nome da nova árvore', { placeholder: 'Ex.: Família, Trabalho, A corte, Amores' , ok: 'Criar' }); if (!n) return; const b = T.Rel.create(pid, n); openTree(b.id); } },
          !isAll ? { label: 'Renomear esta árvore…', icon: 'edit', fn: async () => { const n = await T.ask('Nome da árvore', { value: T.Rel.nameOf(board) }); if (!n) return; S().update(board.id, { meta: { name: n } }); T.emit('tree-changed'); T.emit('tab-title', tab); buildBar(); } } : null,
          !isAll && board.id !== mainB.id ? { label: 'Apagar esta árvore', icon: 'trash', danger: true, fn: async () => { if (!await T.confirm('Apagar a árvore “' + T.Rel.nameOf(board) + '”?', 'As relações dela somem. Os personagens continuam na wiki e nas outras árvores.', 'Apagar', true)) return; S().remove(board.id); T.emit('tree-changed'); openTree('tree'); } } : null,
        ]));
        const layers = isAll ? h('div.rel-trees', trees.map(t => { const off = M.hiddenTrees.includes(t.id); return h('button.rel-chip' + (off ? '.off' : ''), { type: 'button', title: (off ? 'Mostrar' : 'Esconder') + ' as relações de ' + T.Rel.nameOf(t), onclick: () => { M.hiddenTrees = off ? M.hiddenTrees.filter(x => x !== t.id) : [...M.hiddenTrees, t.id]; rebuild(); persist(); buildBar(); drawEdges(); } }, icon('tree'), T.Rel.nameOf(t), h('span.num', String((TE[t.id] || []).length))); })) : null;
        bar.append(...[
          treeBtn, layers,
          h('button.btn.sm.primary', { onclick: (e) => addMenu(e.currentTarget) }, icon('plus'), 'Adicionar'),
          typesBtn,
          h('span.grow'),
          h('button.icon-btn.sm', { title: 'Afastar', onclick: () => zoomBy(1 / 1.15) }, h('b', '−')), T.iconBtn('focus', 'Ajustar à tela', () => fit(), '.sm'), h('button.icon-btn.sm', { title: 'Aproximar', onclick: () => zoomBy(1.15) }, h('b', '+'))].filter(Boolean));
      }
      function addMenu(btn){
        const all = T.Ent.pages(pid).filter(p => !M.nodes[p.id]);
        const chars = all.filter(p => p.meta?.tpl === 'personagem'), others = all.filter(p => p.meta?.tpl !== 'personagem');
        T.menuAt(btn, [
          { label: 'Novo personagem…', icon: 'person', fn: async () => { const n = await T.ask('Nome do personagem', { ok: 'Criar' }); if (!n) return; const p = T.Wiki.create(pid, 'personagem', n); place(p.id); } },
          chars.length ? { head: 'Personagens da wiki' } : null,
          ...chars.slice(0, 30).map(p => ({ label: p.title, icon: 'person', fn: () => place(p.id) })),
          others.length ? { head: 'Outras páginas' } : null,
          ...others.slice(0, 20).map(p => ({ label: p.title + ' · ' + T.tplOf(p).name, icon: T.tplOf(p).icon, fn: () => place(p.id) })),
          !all.length ? { head: 'Todas as páginas já estão na árvore' } : null,
        ]);
      }
      function place(id){
        const r = wrap.getBoundingClientRect();
        const n = Object.keys(M.nodes).length;
        M.nodes[id] = { x: Math.round((r.width / 2 - M.view.x) / M.view.k - CW / 2 + (n % 5) * 30), y: Math.round((r.height / 2 - M.view.y) / M.view.k - CH / 2 + (n % 3) * 30) };
        persist(); drawCards(); drawEdges();
      }

      function drawCards(){
        cardsEl.innerHTML = '';
        Object.entries(M.nodes).forEach(([id, pos]) => {
          const p = S().get(id); if (!p) { delete M.nodes[id]; return; }
          const tpl = T.tplOf(p);
          const card = h('div.rcard', { 'data-id': id, style: { left: pos.x + 'px', top: pos.y + 'px', '--h': tpl.hue } },
            p.meta?.portrait ? h('img', { src: T.Assets.url(p.meta.portrait), alt: '', draggable: 'false' }) : h('div.rph', icon(tpl.icon), h('span', (p.title || '?')[0].toUpperCase())),
            h('div.rname', p.title || 'Sem título'),
            h('button.rplus.r', { title: 'Puxe até outro cartão para criar uma relação', 'data-h': '1' }, '+'),
            h('button.rplus.b', { title: 'Puxe até outro cartão para criar uma relação', 'data-h': '1' }, '+'));
          card.style.setProperty('--h', tpl.hue);
          card.addEventListener('pointerdown', (e) => onCardDown(e, id, card));
          card.addEventListener('dblclick', () => T.Shell.open({ kind: 'page', ref: id }, { side: true }));
          card.addEventListener('contextmenu', (e) => { e.preventDefault(); T.menu(e.clientX, e.clientY, [
            { label: 'Abrir página', icon: 'pop', fn: () => T.Shell.open({ kind: 'page', ref: id }, { side: true }) },
            { label: isAll ? 'Tirar de todas as árvores' : 'Tirar desta árvore', icon: 'x', fn: () => { delete M.nodes[id]; (isAll ? trees.map(t => t.id) : [board.id]).forEach(tid => { TE[tid] = (TE[tid] || []).filter(x => x.a !== id && x.b !== id); if (isAll) { const t = S().get(tid); if (t?.meta?.nodes?.[id]) { const n = Object.assign({}, t.meta.nodes); delete n[id]; S().update(tid, { meta: { nodes: n } }, { silent: true }); } } }); rebuild(); persist(); drawCards(); drawEdges(); } },
          ]); });
          card.addEventListener('mouseenter', () => { hoverId = id; highlight(); });
          card.addEventListener('mouseleave', () => { hoverId = null; highlight(); });
          cardsEl.appendChild(card);
        });
      }
      function highlight(){
        const linked = new Set(); if (hoverId) { linked.add(hoverId); M.edges.forEach(e => { if (e.a === hoverId) linked.add(e.b); if (e.b === hoverId) linked.add(e.a); }); }
        cardsEl.querySelectorAll('.rcard').forEach(c => c.classList.toggle('dim', !!hoverId && !linked.has(c.dataset.id)));
        gEdges.querySelectorAll('g.edge').forEach(g => g.classList.toggle('dim', !!hoverId && g.dataset.a !== hoverId && g.dataset.b !== hoverId));
      }
      function border(ax, ay, bx, by){
        // ponto na borda do cartão a (centro ax,ay) em direção a b
        const dx = bx - ax, dy = by - ay; const sx = (CW / 2 + 4) / Math.abs(dx || 1e-6), sy = (CH / 2 + 4) / Math.abs(dy || 1e-6); const s = Math.min(sx, sy);
        return [ax + dx * s, ay + dy * s];
      }
      function drawEdges(){
        gEdges.innerHTML = ''; defs.innerHTML = '';
        M.types.forEach(t => {
          const mk = (id, rev) => { const m = svg('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: rev ? 'auto-start-reverse' : 'auto' }); m.appendChild(svg('path', { d: 'M0,0 L10,5 L0,10 z', fill: T.typeColor(t) })); defs.appendChild(m); };
          mk('ar-' + board.id + '-' + t.id, false);
        });
        const pairCount = {};
        M.edges.forEach(e => {
          if (M.hidden.includes(e.type)) return;
          const A = M.nodes[e.a], B = M.nodes[e.b]; if (!A || !B) return;
          const t = M.types.find(x => x.id === e.type) || { hue: 230, style: 'solid' };
          const key = [e.a, e.b].sort().join('|'); const k = pairCount[key] = (pairCount[key] || 0) + 1;
          const ax = A.x + CW / 2, ay = A.y + CH / 2, bx = B.x + CW / 2, by = B.y + CH / 2;
          const [sx, sy] = border(ax, ay, bx, by), [ex, ey] = border(bx, by, ax, ay);
          const mx = (sx + ex) / 2, my = (sy + ey) / 2; const len = Math.hypot(ex - sx, ey - sy) || 1;
          const off = (k - 1) * 26 * (k % 2 ? 1 : -1) + (k > 1 ? 0 : 0);
          const nx = -(ey - sy) / len, ny = (ex - sx) / len;
          const cx = mx + nx * off, cy = my + ny * off;
          const d = `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`;
          const g = svg('g', { class: 'edge', 'data-a': e.a, 'data-b': e.b });
          const hit = svg('path', { d, class: 'hit' });
          const path = svg('path', { d, class: 'line' + (t.style === 'anim' ? ' anim' : ''), stroke: T.typeColor(t), 'stroke-width': t.w || 2.4, 'stroke-dasharray': T.dashFor(t.style) });
          const dir = e.dir ?? (t.dir ? 'ab' : 'none');
          const mid = 'url(#ar-' + board.id + '-' + t.id + ')';
          if (dir === 'ab' || dir === 'both') path.setAttribute('marker-end', mid);
          if (dir === 'ba' || dir === 'both') { path.setAttribute('marker-start', mid); }
          if (dir === 'ba' || dir === 'both') { const ms = defs.querySelector('#ar-' + board.id + '-' + t.id); if (ms) ms.setAttribute('orient', 'auto-start-reverse'); }
          const lx = (sx + 2 * cx + ex) / 4, ly = (sy + 2 * cy + ey) / 4;
          const label = svg('text', { x: lx, y: ly - 6, class: 'elabel', 'text-anchor': 'middle' }); label.textContent = (isAll ? treeName(e._t) + ': ' : '') + t.name + (e.note ? ' · ' + e.note.slice(0, 22) : '');
          g.append(hit, path, label);
          g.addEventListener('click', (ev) => { ev.stopPropagation(); edgePop(e, ev); });
          gEdges.appendChild(g);
        });
        highlight();
      }
      function edgePop(e, ev){
        const anchor = h('span', { style: { position: 'fixed', left: ev.clientX + 'px', top: ev.clientY + 'px', width: '1px', height: '1px' } }); document.body.appendChild(anchor);
        const A = S().get(e.a), B = S().get(e.b);
        const types = h('div.type-pick', M.types.map(t => { const b = h('button' + (t.id === e.type ? '.on' : ''), { type: 'button', onclick: () => { e.type = t.id; persist(); drawEdges(); pop.remove(); edgePop(e, ev); } }, h('i', { style: { background: T.typeColor(t) } }), t.name); return b; }));
        const cur = e.dir ?? ((M.types.find(x => x.id === e.type) || {}).dir ? 'ab' : 'none');
        const dirSeg = h('div.seg', [['none', '—', 'Sem direção'], ['ab', A?.title?.split(' ')[0] + ' →', 'De ' + A?.title + ' para ' + B?.title], ['ba', '← ' + B?.title?.split(' ')[0], 'De ' + B?.title + ' para ' + A?.title], ['both', '↔', 'Nos dois sentidos']].map(([k, l, t]) => { const b = h('button', { type: 'button', title: t, onclick: () => { e.dir = k; persist(); drawEdges(); [...dirSeg.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); } }, l); if (k === cur) b.classList.add('on'); return b; }));
        const note = h('textarea.textarea', { placeholder: 'O que existe entre os dois? (aparece na linha e na wiki)', style: { minHeight: '64px' } }); note.value = e.note || '';
        const treeSel = trees.length > 1 ? h('label.mp-f', h('span', 'Está na árvore'), (() => { const sl = h('select.select', trees.map(t => h('option', { value: t.id, selected: t.id === e._t }, T.Rel.nameOf(t)))); sl.onchange = () => { delEdge(e); addEdge(e, sl.value); persist(); drawEdges(); }; return sl; })()) : null;
        note.onchange = () => { e.note = note.value.trim(); persist(); drawEdges(); };
        const pop = T.popover(anchor, h('div.stack', { style: { width: '320px' } }, h('b', (A?.title || '?') + ' & ' + (B?.title || '?')), types, dirSeg, note, treeSel,
          h('div.row', h('span.grow'), h('button.btn.sm.danger', { onclick: () => { delEdge(e); persist(); drawEdges(); pop.remove(); } }, icon('trash'), 'Apagar relação'))));
        setTimeout(() => anchor.remove(), 50);
      }
      function newEdge(a, b, ev){
        const anchor = h('span', { style: { position: 'fixed', left: ev.clientX + 'px', top: ev.clientY + 'px', width: '1px', height: '1px' } }); document.body.appendChild(anchor);
        const pick = h('div.type-pick', M.types.map(t => h('button', { type: 'button', onclick: () => { const e = { id: T.id(), a, b, type: t.id }; addEdge(e); persist(); drawEdges(); pop.remove(); } }, h('i', { style: { background: T.typeColor(t) } }), t.name)));
        const tsel = isAll ? h('label.mp-f', h('span', 'Guardar na árvore'), (() => { const sl = h('select.select', trees.map(t => h('option', { value: t.id, selected: t.id === curTree }, T.Rel.nameOf(t)))); sl.onchange = () => { curTree = sl.value; tab.target = curTree; T.emit('tab-changed', tab); }; return sl; })()) : null;
        const pop = T.popover(anchor, h('div.stack', { style: { width: '280px' } }, h('b', 'Que tipo de relação?'), tsel, pick,
          h('button.btn.sm', { onclick: async () => { pop.remove(); const n = await T.ask('Nome do novo tipo de relação', { placeholder: 'ex.: pacto de sangue, amor proibido, deve a vida' , ok: 'Criar' }); if (!n) return; const t = { id: T.id(), name: n, hue: T.HUES[M.types.length % T.HUES.length], style: 'solid', dir: false }; M.types.push(t); addEdge({ id: T.id(), a, b, type: t.id }); persist(); buildBar(); drawEdges(); } }, icon('plus'), 'Novo tipo…')));
        setTimeout(() => anchor.remove(), 50);
      }

      // arrastar cartões, criar ligações, mover o quadro
      function toStage(cx, cy){ const r = wrap.getBoundingClientRect(); return [(cx - r.left - M.view.x) / M.view.k, (cy - r.top - M.view.y) / M.view.k]; }
      function onCardDown(e, id, card){
        if (e.button !== 0) return;
        e.stopPropagation();
        const isPlus = e.target.dataset.h;
        const start = toStage(e.clientX, e.clientY); const pos = M.nodes[id]; const ox = start[0] - pos.x, oy = start[1] - pos.y;
        card.setPointerCapture(e.pointerId);
        let moved = false;
        const mv = (ev) => {
          const [x, y] = toStage(ev.clientX, ev.clientY);
          if (isPlus) { const ax = pos.x + CW / 2, ay = pos.y + CH / 2; temp.setAttribute('d', `M${ax},${ay} L${x},${y}`); return; }
          if (!moved && Math.hypot(x - start[0], y - start[1]) < 3) return;
          moved = true; pos.x = Math.round(x - ox); pos.y = Math.round(y - oy); card.style.left = pos.x + 'px'; card.style.top = pos.y + 'px'; drawEdges();
        };
        const up = (ev) => {
          card.removeEventListener('pointermove', mv); card.removeEventListener('pointerup', up);
          if (isPlus) {
            temp.setAttribute('d', '');
            const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.rcard');
            if (el && el.dataset.id !== id) newEdge(id, el.dataset.id, ev);
            return;
          }
          if (moved) persist();
        };
        card.addEventListener('pointermove', mv); card.addEventListener('pointerup', up);
      }
      wrap.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.rcard, .rel-bar, .edge')) return;
        const sx = e.clientX, sy = e.clientY, vx = M.view.x, vy = M.view.y;
        wrap.setPointerCapture(e.pointerId); wrap.classList.add('panning');
        const mv = (ev) => { M.view.x = vx + ev.clientX - sx; M.view.y = vy + ev.clientY - sy; applyView(); };
        const up = () => { wrap.removeEventListener('pointermove', mv); wrap.removeEventListener('pointerup', up); wrap.classList.remove('panning'); persist(); };
        wrap.addEventListener('pointermove', mv); wrap.addEventListener('pointerup', up);
      });
      wrap.addEventListener('wheel', (e) => { e.preventDefault(); const r = wrap.getBoundingClientRect(); zoomBy(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
      function zoomBy(f, px, py){
        const r = wrap.getBoundingClientRect(); px = px ?? r.width / 2; py = py ?? r.height / 2;
        const k = T.clamp(M.view.k * f, .25, 2.5); const s = k / M.view.k;
        M.view.x = px - (px - M.view.x) * s; M.view.y = py - (py - M.view.y) * s; M.view.k = k; applyView(); persist();
      }
      function fit(){
        const ps = Object.values(M.nodes); if (!ps.length) return;
        const r = wrap.getBoundingClientRect();
        const x0 = Math.min(...ps.map(p => p.x)), y0 = Math.min(...ps.map(p => p.y)), x1 = Math.max(...ps.map(p => p.x + CW)), y1 = Math.max(...ps.map(p => p.y + CH));
        const k = T.clamp(Math.min((r.width - 80) / (x1 - x0), (r.height - 140) / (y1 - y0)), .25, 1.4);
        M.view = { k, x: (r.width - (x1 - x0) * k) / 2 - x0 * k, y: 70 + (r.height - 70 - (y1 - y0) * k) / 2 - y0 * k }; applyView(); persist();
      }

      buildBar(); drawCards(); drawEdges(); applyView();
      if (!Object.keys(M.nodes).length && board.id === mainB.id) {
        const chars = T.Ent.pages(pid).filter(p => p.meta?.tpl === 'personagem').slice(0, 12);
        chars.forEach((p, i) => { M.nodes[p.id] = { x: 40 + (i % 4) * 190, y: 40 + Math.floor(i / 4) * 230 }; });
        if (chars.length) { persist(); drawCards(); drawEdges(); }
        else cardsEl.appendChild(h('div.rel-empty.glass', h('b', 'A árvore está vazia'), h('p', 'Toque em Adicionar para trazer personagens da wiki ou criar um novo. Depois puxe o + de um cartão até outro para ligar os dois.')));
      }
      if (!Object.keys(M.nodes).length && board.id !== mainB.id && !isAll) cardsEl.appendChild(h('div.rel-empty.glass', h('b', 'Árvore “' + T.Rel.nameOf(board) + '” vazia'), h('p', 'Toque em Adicionar para trazer só os personagens desta árvore. Na árvore Geral, todas aparecem juntas.')));
      if (tab.focus) { if (!M.nodes[tab.focus] && S().get(tab.focus)) place(tab.focus); const n = M.nodes[tab.focus]; if (n) { const r = wrap.getBoundingClientRect(); M.view.x = r.width / 2 - (n.x + CW / 2) * M.view.k; M.view.y = r.height / 2 - (n.y + CH / 2) * M.view.k; applyView(); } }
      const off = T.on('items', (ev) => { if (ev.item?.type === 'page' && M.nodes[ev.id] && ev.patch && ('title' in ev.patch || 'meta' in ev.patch)) drawCards(); });
      return { destroy(){ persist.flush(); off(); }, flush(){ persist.flush(); } };
    }
  };
})(window.T);
