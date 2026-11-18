/* Tinteiro — versões: salvas à mão e automáticas, com visualização, comparação e restauração */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const AUTO_EVERY = 10 * 60 * 1000; // uma versão automática a cada 10 minutos de escrita
  const AUTO_KEEP = 30;              // guarda as 30 automáticas mais recentes de cada texto
  const list = (id) => S().all(S().get(id)?.pid).filter(s => s.type === 'snapshot' && s.parent === id).sort((a, b) => b.created - a.created);
  const strip = (html) => (html || '').replace(/\s+/g, ' ').trim();
  T.Versions = {
    list,
    auto(pid, id, body, force){
      if (!pid || !id) return;
      const all = S().all(pid).filter(s => s.type === 'snapshot' && s.parent === id);
      const autos = all.filter(s => s.meta?.auto).sort((a, b) => b.created - a.created);
      const last = autos[0];
      if (last && strip(last.body) === strip(body)) return;         // nada mudou
      if (!strip(body) && !last) return;                              // texto vazio
      if (!force && last && Date.now() - last.created < AUTO_EVERY) { // atualiza a mais recente em vez de criar outra
        S().update(last.id, { body, title: 'Automática · ' + T.dateLabel(Date.now()) }, { delay: 4000, silent: true });
        return;
      }
      if (force && last && Date.now() - last.created < AUTO_EVERY) { S().update(last.id, { body, title: 'Automática · ' + T.dateLabel(Date.now()) }, { delay: 300, silent: true }); return; }
      S().create({ pid, type: 'snapshot', area: 'snap', parent: id, title: 'Automática · ' + T.dateLabel(Date.now()), body, meta: { auto: true } });
      autos.slice(AUTO_KEEP - 1).forEach(x => S().remove(x.id));
    },
    browse(it, after, focusId){
      if (!it) return;
      T.modal((box, close) => {
        let sel = focusId || null, mode = 'view', filter = 'all';
        function draw(){
          const vs = list(it.id).filter(v => filter === 'all' || (filter === 'auto' ? v.meta?.auto : !v.meta?.auto));
          if (!sel || !vs.find(v => v.id === sel)) sel = vs[0]?.id || null;
          const cur = S().get(it.id)?.body || '';
          const v = vs.find(x => x.id === sel);
          box.innerHTML = '';
          const fseg = h('div.seg', [['all', 'Todas'], ['manual', 'Salvas por mim'], ['auto', 'Automáticas']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { filter = k; draw(); } }, l); if (k === filter) b.classList.add('on'); return b; }));
          const mseg = h('div.seg', [['view', 'Ler a versão'], ['diff', 'Comparar com o atual']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { mode = k; draw(); } }, l); if (k === mode) b.classList.add('on'); return b; }));
          const side = h('div.ver-list', vs.length ? vs.map(x => h('button.ver-item' + (x.id === sel ? '.on' : ''), { type: 'button', onclick: () => { sel = x.id; draw(); } },
            h('b', x.meta?.auto ? 'Automática' : (x.title || 'Versão')), h('span', T.dateLabel(x.created) + ' · ' + T.fmt(T.words(x.body)) + ' palavras'),
            x.meta?.auto ? h('span.chip.gray', 'auto') : null)) : h('p.muted', 'Nenhuma versão ainda. Elas aparecem aqui sozinhas a cada 10 minutos de escrita, ou quando você salva uma.'));
          const body = !v ? h('div.diff', h('p.muted', 'Escolha uma versão.')) : mode === 'diff' ? h('div.diff', { html: T.diffHTML(v.body || '', cur) }) : h('div.diff.ver-read', { html: v.body || '<p class="muted">Versão vazia.</p>' });
          box.append(h('div.row', h('h2.grow', 'Versões de “' + (it.title || 'texto') + '”'), fseg),
            h('p.sub', 'As versões automáticas são guardadas enquanto você escreve (uma a cada 10 minutos e outra ao fechar o texto). As 30 mais recentes de cada texto ficam guardadas; as que você salva à mão ficam para sempre.'),
            h('div.ver-wrap', side, h('div.ver-main', v ? h('div.row', mseg, h('span.grow'), mode === 'diff' ? h('span.muted', { style: { fontSize: '12px' } }, 'verde = entrou depois · vermelho = saiu') : null) : null, body)),
            h('div.modal-foot',
              v ? h('button.btn.danger', { onclick: async () => { if (await T.confirm('Apagar esta versão?', null, 'Apagar', true)) { S().remove(v.id); sel = null; draw(); } } }, icon('trash'), 'Apagar') : null,
              v && v.meta?.auto ? h('button.btn', { onclick: async () => { const n = await T.ask('Nome para guardar esta versão para sempre', { value: 'Versão de ' + T.dateLabel(v.created), ok: 'Guardar' }); if (n) { S().update(v.id, { title: n, meta: { auto: false } }); draw(); } } }, icon('star'), 'Guardar para sempre') : null,
              h('span.grow'),
              h('button.btn', { onclick: async () => { const n = await T.ask('Nome da versão', { value: T.dateLabel(Date.now()), ok: 'Salvar' }); if (n != null) { S().create({ pid: it.pid, type: 'snapshot', area: 'snap', parent: it.id, title: n, body: cur }); draw(); } } }, icon('camera'), 'Salvar versão agora'),
              v ? h('button.btn', { onclick: () => { const ta = h('textarea'); ta.value = T.htmlToText(v.body); navigator.clipboard.writeText(ta.value).then(() => T.toast('Texto da versão copiado.')).catch(() => T.toast('Não consegui copiar.')); } }, icon('copy'), 'Copiar texto') : null,
              v ? h('button.btn.primary', { onclick: async () => { if (await T.confirm('Voltar para esta versão?', 'O texto atual vira uma versão salva antes, então nada se perde.', 'Restaurar')) {
                S().create({ pid: it.pid, type: 'snapshot', area: 'snap', parent: it.id, title: 'Antes de restaurar · ' + T.dateLabel(Date.now()), body: cur });
                S().update(it.id, { body: v.body, meta: { words: T.words(v.body) } });
                close(); T.toast('Versão restaurada.'); after && after(); } } }, icon('history'), 'Restaurar') : null));
        }
        draw();
      }, { wide: true });
    },
  };
})(window.T);
