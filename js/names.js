/* Entrelinhas — gerador de nomes (pessoas, lugares, espécies…) pedindo ao Claude, com filtros */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;
  const KINDS = [
    ['pessoa', 'Pessoa', 'person', 'personagem'], ['lugar', 'Lugar (cidade, vila, região)', 'pin', 'lugar'], ['reino', 'Reino ou país', 'shield', 'lugar'],
    ['especie', 'Espécie ou povo', 'paw', 'criatura'], ['criatura', 'Criatura ou monstro', 'paw', 'criatura'], ['planeta', 'Planeta, estrela ou lua', 'spark', 'lugar'],
    ['nave', 'Nave, navio ou veículo', 'map', 'item'], ['faccao', 'Facção, ordem ou grupo', 'shield', 'faccao'], ['objeto', 'Objeto, arma ou artefato', 'gem', 'item'],
    ['magia', 'Magia, feitiço ou tecnologia', 'spark', 'sistema'], ['evento', 'Evento, guerra ou festival', 'timeline', 'evento'], ['taverna', 'Taverna, loja ou casa', 'pin', 'lugar'],
  ];
  const VIBES = ['sombrio', 'nobre', 'élfico', 'mágico', 'sci-fi', 'futurista', 'antigo', 'misterioso', 'delicado', 'brutal', 'rústico', 'celestial', 'divertido', 'poético', 'religioso', 'marítimo', 'selvagem', 'aristocrático', 'humilde', 'ameaçador'];
  const ORIGINS = ['brasileira', 'nordestina', 'indígena brasileira (tupi)', 'portuguesa', 'africana (iorubá)', 'latina', 'grega', 'nórdica', 'celta', 'eslava', 'árabe', 'persa', 'japonesa', 'chinesa', 'hindu', 'inventada (sem origem real)'];
  const TRAITS = ['corajosa', 'tímida', 'ambiciosa', 'gentil', 'cruel', 'curiosa', 'teimosa', 'leal', 'misteriosa', 'sarcástica', 'sábia', 'impulsiva', 'melancólica', 'alegre', 'fria', 'rebelde'];

  T.Views.names = {
    icon: 'person', title: () => 'Gerador de nomes',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad.nm-view'); root.appendChild(v);
      const f = Object.assign({ kind: 'pessoa', gender: 'tanto faz', age: '', traits: [], role: '', starts: '', ends: '', len: 'qualquer', vibes: [], origins: [], notes: '', n: 15 }, S().prefs().nameGen || {});
      let results = [], seen = new Set(), busy = false;
      const keep = () => S().setPrefs({ nameGen: Object.assign({}, f, { notes: f.notes }) });
      const chips = (list, sel, multi, onTog) => h('div.nm-chips', list.map(x => { const on = multi ? sel.includes(x) : sel === x; return h('button.if-chip' + (on ? '.on' : ''), { type: 'button', onclick: () => onTog(x) }, x); }));
      const tog = (arr, x) => arr.includes(x) ? arr.filter(y => y !== x) : [...arr, x];
      function form(){
        const kindRow = h('div.nm-kinds', KINDS.map(([k, l, ic]) => h('button.nm-kind' + (f.kind === k ? '.on' : ''), { type: 'button', onclick: () => { f.kind = k; keep(); draw(); } }, icon(ic), l)));
        const inp = (key, ph, w) => { const i = h('input.input', { value: f[key] || '', placeholder: ph, style: w ? { maxWidth: w } : null }); i.oninput = () => { f[key] = i.value; keep(); }; return i; };
        const person = f.kind === 'pessoa';
        const traitsIn = h('input.input', { placeholder: 'outros traços (separe por vírgula)', value: f.traits.filter(t => !TRAITS.includes(t)).join(', ') });
        traitsIn.onchange = () => { f.traits = [...f.traits.filter(t => TRAITS.includes(t)), ...traitsIn.value.split(',').map(x => x.trim()).filter(Boolean)]; keep(); };
        const vibesIn = h('input.input', { placeholder: 'outra vibe (ex.: cheiro de chuva, realeza decadente)', value: f.vibes.filter(t => !VIBES.includes(t)).join(', ') });
        vibesIn.onchange = () => { f.vibes = [...f.vibes.filter(t => VIBES.includes(t)), ...vibesIn.value.split(',').map(x => x.trim()).filter(Boolean)]; keep(); };
        const notes = h('textarea.textarea', { placeholder: 'Mais detalhes, se quiser: o papel na história, de onde vem, o que o nome precisa transmitir, nomes que você já usa no livro (para não repetir)…', style: { minHeight: '70px' } }); notes.value = f.notes || ''; notes.oninput = () => { f.notes = notes.value; keep(); };
        const nSel = h('select.select', { style: { width: 'auto' } }, [10, 15, 25, 40].map(n => h('option', { value: n, selected: +f.n === n }, n + ' nomes'))); nSel.onchange = () => { f.n = +nSel.value; keep(); };
        const lenSeg = h('div.seg', ['qualquer', 'curto', 'médio', 'longo'].map(x => h('button' + (f.len === x ? '.on' : ''), { type: 'button', onclick: () => { f.len = x; keep(); draw(); } }, x)));
        return h('div.glass.panel.nm-form',
          h('div.field', h('b', 'O nome é para'), kindRow),
          person ? h('div.nm-grid',
            h('div.field', h('b', 'Gênero'), chips(['mulher', 'homem', 'não binário', 'tanto faz'], f.gender, false, (x) => { f.gender = x; keep(); draw(); })),
            h('label.field', h('b', 'Idade'), inp('age', 'ex.: 17, uns 40, idosa', '180px')),
            h('label.field', h('b', 'Papel na história'), inp('role', 'ex.: capitã pirata, curandeira, vilão'))) : null,
          person ? h('div.field', h('b', 'Personalidade'), chips(TRAITS, f.traits, true, (x) => { f.traits = tog(f.traits, x); keep(); draw(); }), traitsIn) : null,
          h('div.field', h('b', 'Vibe'), chips(VIBES, f.vibes, true, (x) => { f.vibes = tog(f.vibes, x); keep(); draw(); }), vibesIn),
          h('div.field', h('b', 'Sonoridade / origem'), chips(ORIGINS, f.origins, true, (x) => { f.origins = tog(f.origins, x); keep(); draw(); })),
          h('div.nm-flex',
            h('label.field', h('b', 'Começa com'), inp('starts', 'ex.: A, Ma, Th', '160px')),
            h('label.field', h('b', 'Termina com'), inp('ends', 'ex.: a, iel, or', '160px')),
            h('div.field', h('b', 'Tamanho'), lenSeg),
            h('div.field', h('b', 'Quantos'), nSel)),
          h('div.field', h('b', 'Detalhes'), notes),
          h('div.row', { style: { justifyContent: 'flex-end', gap: '8px' } },
            results.length ? h('button.btn', { type: 'button', onclick: () => gen(true), disabled: busy }, icon('plus'), 'Gerar mais') : null,
            h('button.btn.primary', { type: 'button', onclick: () => gen(false), disabled: busy }, icon('spark'), busy ? 'Pensando nos nomes…' : 'Gerar nomes')));
      }
      function prompt(more){
        const kind = KINDS.find(k => k[0] === f.kind)[1];
        const L = [];
        L.push('Você ajuda uma escritora brasileira de ficção (sci-fantasia) a criar nomes. Gere ' + f.n + ' nomes ORIGINAIS para: ' + kind + '.');
        if (f.kind === 'pessoa') { if (f.gender !== 'tanto faz') L.push('Gênero: ' + f.gender + '.'); if (f.age) L.push('Idade: ' + f.age + '.'); if (f.role) L.push('Papel na história: ' + f.role + '.'); if (f.traits.length) L.push('Personalidade: ' + f.traits.join(', ') + '.'); }
        if (f.vibes.length) L.push('Vibe/sensação do nome: ' + f.vibes.join(', ') + '.');
        if (f.origins.length) L.push('Sonoridade ou origem cultural: ' + f.origins.join(', ') + '.');
        if (f.starts) L.push('Todos devem começar com "' + f.starts + '".');
        if (f.ends) L.push('Todos devem terminar com "' + f.ends + '".');
        if (f.len !== 'qualquer') L.push('Tamanho do nome: ' + f.len + '.');
        if (f.notes) L.push('Detalhes da autora: ' + f.notes);
        const ex = [...seen]; if (more && ex.length) L.push('Não repita nenhum destes: ' + ex.join(', ') + '.');
        L.push('Varie as opções (algumas mais simples, outras mais marcantes). Para pessoa, pode incluir sobrenome quando combinar. Para cada nome dê: como se pronuncia (se não for óbvio), o significado ou a inspiração, e por que combina com o pedido, em uma frase curta em português.');
        L.push('Responda SÓ com JSON: {"nomes":[{"nome":"...","pronuncia":"...","significado":"...","porque":"..."}]}');
        return L.join('\n');
      }
      async function gen(more){
        if (busy) return; busy = true; if (!more) { results = []; } draw();
        try {
          const out = await T.AI.json(prompt(more), { modelTier: 'default' });
          const list = (out?.nomes || []).filter(x => x && x.nome && !seen.has(x.nome.toLowerCase()));
          list.forEach(x => seen.add(x.nome.toLowerCase()));
          results = more ? results.concat(list) : list;
          if (!list.length) T.toast('Não vieram nomes novos. Tente mudar um filtro.');
        } catch (e) { T.toast(T.AI.errText(e)); }
        busy = false; draw();
      }
      function saveIdea(x){
        const folders = T.Ideas.folders(pid); const fd = folders.find(z => /^nomes?$/i.test(z.name)) || folders[0];
        T.Ideas.create(pid, x.nome + (x.significado ? ' — ' + x.significado : '') + (x.porque ? '\n' + x.porque : ''), fd ? fd.id : '');
        T.emit('tree-changed'); T.toast('Guardado em Ideias' + (fd ? ' › ' + fd.name : '') + '.');
      }
      function toWiki(x){
        const tpl = KINDS.find(k => k[0] === f.kind)[3];
        const p = T.Wiki.create(pid, tpl, x.nome);
        T.toast('Página “' + x.nome + '” criada na wiki.', { action: { label: 'Abrir', fn: () => T.Shell.open({ kind: 'page', ref: p.id }) } });
      }
      function draw(){
        v.innerHTML = '';
        v.append(h('div.view-h', h('div.grow', h('h1', 'Gerador de nomes'), h('p', 'Escolha para o que é o nome e marque o que ele precisa ter. Os nomes são sugeridos pelo Claude a partir só destes filtros (o texto do seu livro não é enviado).'))), form());
        if (busy && !results.length) v.append(h('div.nm-wait', h('span.syn-spin'), 'Criando nomes…'));
        if (results.length) v.append(h('div.nm-res', results.map(x => h('div.nm-card.glass',
          h('div.nm-name', x.nome, x.pronuncia ? h('span.nm-pr', '/' + x.pronuncia.replace(/^\/|\/$/g, '') + '/') : null),
          x.significado ? h('div.nm-mean', x.significado) : null,
          x.porque ? h('div.nm-why', x.porque) : null,
          h('div.nm-acts',
            h('button.btn.sm', { type: 'button', onclick: () => saveIdea(x), title: 'Guardar na pasta Nomes, em Ideias' }, icon('idea'), 'Guardar'),
            h('button.btn.sm', { type: 'button', onclick: () => toWiki(x), title: 'Criar uma página na wiki com este nome' }, icon('book'), 'Criar na wiki'),
            T.iconBtn('copy', 'Copiar o nome', () => { navigator.clipboard?.writeText(x.nome).then(() => T.toast('Copiado.')).catch(() => {}); }, '.sm'))))));
      }
      draw();
      return { destroy(){} };
    }
  };
})();
