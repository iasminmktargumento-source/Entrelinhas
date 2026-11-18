/* Entrelinhas — telas que juntam ferramentas parecidas em abas (menos itens soltos na barra lateral) */
(() => {
  const { h, icon } = T;
  const HUBS = {
    conexoes: { name: 'Conexões', icon: 'web', subs: [
      { k: 'teia', label: 'Teia e grafo', icon: 'web', kind: 'web', ref: 'web', def: { mode: 'all' } },
      { k: 'arvore', label: 'Árvore de relações', icon: 'tree', kind: 'tree', ref: 'tree' },
    ] },
    tempo: { name: 'Tempo da história', icon: 'cal', subs: [
      { k: 'calendario', label: 'Calendário', icon: 'cal', kind: 'cal', ref: 'cal' },
      { k: 'timeline', label: 'Timeline', icon: 'timeline', kind: 'timeline', ref: 'timeline' },
    ] },
    progresso: { name: 'Metas e progresso', icon: 'target', subs: [
      { k: 'metas', label: 'Metas', icon: 'target', kind: 'overview', ref: 'overview' },
      { k: 'estatisticas', label: 'Estatísticas', icon: 'chart', kind: 'stats', ref: 'stats' },
      { k: 'tensao', label: 'Curva de tensão', icon: 'chart', kind: 'tension', ref: 'tension' },
    ] },
  };
  // qual hub abre cada tipo de tela
  const KIND_TO = {};
  Object.entries(HUBS).forEach(([hid, hb]) => hb.subs.forEach(s => { if (!KIND_TO[s.kind]) KIND_TO[s.kind] = { hub: hid, sub: s.k }; }));
  T.Hubs = { HUBS, KIND_TO,
    // transforma um pedido de abrir "tree", "cal"… no pedido do hub certo
    route(spec){ const r = KIND_TO[spec.kind]; if (!r) return null; return { kind: 'hub', ref: r.hub, sub: r.sub, subSpec: Object.assign({}, spec) }; },
  };

  T.Views.hub = {
    icon: 'layers', title: (tab) => (HUBS[tab.ref] || {}).name || 'Ferramentas',
    mount(root, tab, ctx){
      const hb = HUBS[tab.ref]; if (!hb) { root.appendChild(h('div.pane-empty', 'Tela não encontrada.')); return { destroy(){} }; }
      tab.subs = tab.subs || {};
      if (!hb.subs.some(s => s.k === tab.sub)) tab.sub = hb.subs[0].k;
      if (tab.subSpec) { const sp = tab.subSpec; delete tab.subSpec; const s = hb.subs.find(x => x.k === tab.sub); const cur = tab.subs[s.k] || {}; const keep = { id: cur.id }; tab.subs[s.k] = Object.assign({}, cur, sp, keep, { kind: s.kind }); }
      const wrap = h('div.hub'); const bar = h('div.hub-bar'); const host = h('div.hub-host');
      wrap.append(bar, host); root.appendChild(wrap);
      let inst = null, curTab = null;
      const offTab = T.on('tab-changed', (t) => { if (t && t === curTab) T.emit('tab-changed', tab); });
      function drawBar(){
        bar.innerHTML = '';
        bar.appendChild(h('div.seg.hub-seg', { role: 'tablist', 'aria-label': hb.name }, hb.subs.map(s => { const b = h('button', { type: 'button', role: 'tab', 'aria-selected': String(s.k === tab.sub), onclick: () => { if (s.k !== tab.sub) { tab.sub = s.k; T.emit('tab-changed', tab); show(); } } }, icon(s.icon), h('span', s.label)); if (s.k === tab.sub) b.classList.add('on'); return b; })));
      }
      function show(){
        if (inst) { try { inst.flush && inst.flush(); inst.destroy(); } catch (e) {} inst = null; }
        host.innerHTML = ''; drawBar();
        const s = hb.subs.find(x => x.k === tab.sub);
        const st = tab.subs[s.k] = Object.assign({ id: T.id(), kind: s.kind, ref: s.ref }, s.def || {}, tab.subs[s.k] || {});
        st.kind = s.kind;
        // quando a tela de dentro pede para trocar a si mesma (ex.: outra árvore), troca aqui dentro
        Object.defineProperty(st, '_hubSwap', { value: (spec) => { Object.assign(st, spec, { kind: s.kind }); T.emit('tab-changed', tab); show(); }, enumerable: false, configurable: true });
        curTab = st;
        try { inst = T.Views[s.kind].mount(host, st, ctx); } catch (e) { console.error(e); host.appendChild(h('div.pane-empty', 'Algo deu errado ao abrir: ' + e.message)); inst = null; }
      }
      show();
      return {
        destroy(){ offTab(); if (inst) { try { inst.destroy(); } catch (e) {} } },
        flush(){ if (inst && inst.flush) inst.flush(); },
      };
    },
  };
})();
