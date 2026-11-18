/* Tinteiro — Tesauro da Escrita: o guia de 16 partes como consulta ao lado do texto */
(function(T){
  const { h, icon } = T;
  const FILES = ['artes', 'parte01', 'parte01b', 'parte01c', 'parte01d', 'parte02', 'parte02b', 'parte02c', 'parte02d', 'parte02e', 'parte02f', 'parte03', 'parte03b', 'parte03c', 'parte03d', 'parte03e', 'parte03f', 'parte04', 'parte04b', 'parte04c', 'parte04d', 'parte04e', 'parte05', 'parte05b', 'parte05c', 'parte06', 'parte06b', 'parte06c', 'parte07', 'parte07b', 'parte08', 'parte08b', 'parte09', 'parte10', 'parte11', 'parte12', 'parte12x', 'parte13', 'parte13b', 'parte13x', 'parte14', 'parte14x', 'parte15', 'parte15x', 'parte16', 'parte16x'];
  const META = [
    { n: 1, h: 355, t: 'Emoções', s: 'Mostrar o que a personagem sente' },
    { n: 2, h: 330, t: 'Defeitos de personagem', s: 'Traços que atrapalham e humanizam' },
    { n: 3, h: 38, t: 'Qualidades de personagem', s: 'Forças que fazem o leitor torcer' },
    { n: 4, h: 125, t: 'Cenários rurais e pessoais', s: 'Casa, escola e natureza' },
    { n: 5, h: 178, t: 'Cenários urbanos', s: 'Os espaços da cidade' },
    { n: 6, h: 272, t: 'Feridas emocionais', s: 'O trauma que molda a personagem' },
    { n: 7, h: 22, t: 'Profissões', s: 'O trabalho como atalho para o caráter' },
    { n: 8, h: 212, t: 'Conflitos, volume 1', s: 'Obstáculos, adversários e lutas internas' },
    { n: 9, h: 236, t: 'Conflitos, volume 2', s: 'Poder, ego, perigo e perda de controle' },
    { n: 10, h: 80, t: 'Amplificadores emocionais', s: 'Estresse que tira o controle' },
    { n: 11, h: 296, t: 'Medos', s: 'O que segura a personagem' },
    { n: 12, h: 48, t: 'Verbos de elocução', s: 'Como cada emoção soa no diálogo' },
    { n: 13, h: 152, t: 'Cenários de ficção científica', s: 'Naves, planetas e cidades do futuro' },
    { n: 14, h: 100, t: 'Descrição física', s: 'Rostos, corpos, vozes, roupas e cheiros' },
    { n: 15, h: 195, t: 'Clima, luz e hora do dia', s: 'O céu como amplificador da cena' },
    { n: 16, h: 254, t: 'Personagens com deficiência', s: 'Escrever com respeito e verdade' },
  ];
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').trim();
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fmt = (s) => T.esc(String(s)).replace(/==(.+?)==/g, '<mark>$1</mark>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const lista = (v) => Array.isArray(v) ? v : String(v).split('|').map(x => x.trim()).filter(Boolean);

  let loading = null; const IDX = {}, ALT = {}, TODAS = [];
  function load(){
    if (loading) return loading;
    window.GUIA = window.GUIA || { partes: {}, add(p){ this.partes[p.n] = p; } };
    window.ARTE = window.ARTE || {};
    loading = FILES.reduce((pr, f) => pr.then(() => new Promise((res) => { const s = document.createElement('script'); s.src = 'tesauro/' + f + '.js'; s.onload = res; s.onerror = () => { console.warn('tesauro: falhou ' + f); res(); }; document.head.appendChild(s); })), Promise.resolve()).then(buildIndex);
    return loading;
  }
  function buildIndex(){
    const G = window.GUIA;
    for (const m of META) { const p = G.partes[m.n]; if (!p) continue;
      for (const g of (p.grupos || [])) for (const e of g.itens) {
        const id = 'p' + m.n + '-' + slug(e.nome); e._id = id; e._n = m.n;
        const k = norm(e.nome); if (!IDX[k]) IDX[k] = { id, n: m.n };
        const al = [...(Array.isArray(e.alias) ? e.alias : (e.alias ? String(e.alias).split('|') : []))];
        if (/o$/.test(k)) al.push(k.slice(0, -1) + 'a'); if (/or$/.test(k)) al.push(k + 'a'); if (/ao$/.test(k)) al.push(k.slice(0, -2) + 'ona');
        al.forEach(a => { const ka = norm(a); if (!IDX[ka]) IDX[ka] = { id, n: m.n }; (ALT[ka] = ALT[ka] || []).push({ id, n: m.n }); });
        (ALT[k] = ALT[k] || []).push({ id, n: m.n });
        TODAS.push({ nome: e.nome, id, n: m.n, e, txt: norm(e.nome + ' ' + Object.values(e).filter(v => typeof v === 'string').join(' ')) });
      } }
  }
  const findEntry = (id) => TODAS.find(x => x.id === id);
  const link = (txt, pref) => { const k = norm(txt); let r = null; if (pref && ALT[k]) r = ALT[k].find(x => x.n === pref) || null; r = r || IDX[k];
    return r ? '<a data-go="' + r.id + '" style="--lh:' + META[r.n - 1].h + '">' + fmt(txt) + '</a>' : '<span>' + fmt(txt) + '</span>'; };

  function entradaHTML(e, p){
    let s = '<article class="tes-ent" id="tes-' + e._id + '"><div class="tes-ent-h"><h3>' + T.esc(e.nome) + '</h3><button class="btn sm" data-copyall="' + e._id + '" title="Copiar a entrada inteira">Copiar</button></div>';
    for (const c of p.campos) { const v = e[c.k]; if (v == null || v === '') continue;
      if (c.t === 'texto') s += '<div class="tes-campo' + (c.k === 'def' ? ' def' : '') + '"><h4>' + c.l + '</h4><p>' + fmt(v) + '</p></div>';
      else if (c.t === 'lista') s += '<div class="tes-campo"><h4>' + c.l + '</h4><ul>' + lista(v).map(x => '<li data-copy title="Clique para copiar">' + fmt(x) + '</li>').join('') + '</ul></div>';
      else if (c.t === 'links') s += '<div class="tes-campo"><h4>' + c.l + '</h4><div class="tes-chips">' + lista(v).map(x => link(x, c.p)).join('') + '</div></div>';
      else if (c.t === 'chips') s += '<div class="tes-campo"><h4>' + c.l + '</h4><div class="tes-chips">' + lista(v).map(x => '<span data-copy title="Clique para copiar">' + fmt(x) + '</span>').join('') + '</div></div>';
      else if (c.t === 'paras') s += '<div class="tes-campo"><h4>' + c.l + '</h4><div class="tes-para">' + lista(v).map(x => '<p data-copy title="Clique para copiar">' + fmt(x) + '</p>').join('') + '</div></div>';
      else if (c.t === 'dica') s += '<div class="tes-dica tes-campo"><h4>' + c.l + '</h4><p>' + fmt(v) + '</p></div>';
    }
    return s + '</article>';
  }

  T.Tesauro = { load, META };

  T.Views.tesauro = {
    icon: 'feather', title: () => 'Tesauro da Escrita',
    mount(root, tab){
      const v = h('div.view.tes'); root.appendChild(v);
      const head = h('div.tes-head');
      const q = h('input.input', { type: 'search', placeholder: 'Buscar emoção, defeito, cenário, medo, verbo…', 'aria-label': 'Buscar no tesauro', value: tab.q || '' });
      const res = h('div.tes-res.glass.glass-strong.hidden');
      const nav = h('div.tes-nav.hscroll');
      const body = h('div.tes-body');
      head.append(h('div.tes-search', icon('search'), q, res), nav);
      v.append(head, body);
      let cur = tab.part || 0; // 0 = início

      function setHue(hh){ v.style.setProperty('--h', hh); }
      function drawNav(){
        nav.innerHTML = '';
        nav.append(h('button.tes-pill' + (cur === 0 ? '.on' : ''), { type: 'button', style: { '--ph': 280 }, onclick: () => go(0) }, '◎ Início'),
          ...META.map(m => h('button.tes-pill' + (cur === m.n ? '.on' : ''), { type: 'button', style: { '--ph': m.h }, title: m.s, onclick: () => go(m.n) }, h('b', String(m.n)), ' ' + m.t)));
      }
      function capa(){
        setHue(280);
        const G = window.GUIA;
        body.innerHTML = '';
        body.append(h('div.tes-capa', h('div.tes-faixa', META.map(m => h('i', { style: { background: `hsl(${m.h} 75% 58%)` } }))),
          h('h1', 'Tesauro da Escrita'),
          h('p', 'As 16 partes do seu guia, para consultar sem sair do texto. Use a busca acima, toque numa parte, e clique em qualquer item de uma lista para copiar e colar na cena.'),
          h('div.tes-grade', META.map(m => { const p = G.partes[m.n]; const qt = p ? (p.grupos || []).reduce((a, g) => a + g.itens.length, 0) : 0;
            const c = h('button.tes-card', { type: 'button', style: { '--ph': m.h }, onclick: () => go(m.n) }, h('small', 'Parte ' + m.n + (qt ? ' · ' + qt + ' entradas' : '')), h('b', m.t), h('span', m.s));
            return c; }))));
      }
      function parte(n, alvo){
        const m = META[n - 1], p = window.GUIA.partes[n]; setHue(m.h);
        let s = '<section class="tes-parte"><div class="tes-ab">' + ((window.ARTE[n] || (() => ''))()) + '<div class="txt"><div class="eyebrow">Parte ' + n + ' de 16</div><h1>' + m.t + '</h1><p>' + (p ? fmt(p.chamada || m.s) : m.s) + '</p></div></div>';
        if (!p) s += '<p class="muted">Esta parte ainda não foi escrita.</p>';
        else {
          const total = (p.grupos || []).reduce((a, g) => a + g.itens.length, 0);
          if (total) {
            s += '<h2 class="tes-sec">' + T.esc(p.tituloEntradas || 'Entradas') + '</h2><p class="muted" style="margin:0">' + total + ' entradas' + (p.notaEntradas ? ' · ' + T.esc(p.notaEntradas) : '') + '</p>';
            for (const g of p.grupos) { if (p.grupos.length > 1) s += '<div class="tes-gtit">' + T.esc(g.nome) + '</div>'; s += '<div class="tes-indice">' + g.itens.map(e => '<a data-go="' + e._id + '">' + T.esc(e.nome) + '</a>').join('') + '</div>'; }
          }
          if (p.teoria && p.teoria.length) s += '<details class="tes-teoria"><summary>Introdução e teoria da parte</summary>' + p.teoria.map(t => '<h3>' + T.esc(t.t) + '</h3>' + t.html.replace(/==(.+?)==/g, '<mark>$1</mark>')).join('') + '</details>';
          for (const g of (p.grupos || [])) { if (p.grupos.length > 1) s += '<h2 class="tes-sec" style="font-size:24px">' + T.esc(g.nome) + '</h2>'; for (const e of g.itens) s += entradaHTML(e, p); }
        }
        s += '</section>';
        body.innerHTML = s;
        if (alvo) requestAnimationFrame(() => { const el = body.querySelector('#tes-' + CSS.escape(alvo)); if (el) { el.classList.add('alvo'); el.scrollIntoView({ block: 'start' }); } });
        else v.scrollTop = 0;
      }
      function go(n, alvo){ cur = n; tab.part = n; T.emit('tab-changed', tab); drawNav(); if (n) parte(n, alvo); else { capa(); v.scrollTop = 0; } }
      function goEntry(id){ const n = +id.match(/^p(\d+)-/)[1]; if (n === cur) { const el = body.querySelector('#tes-' + CSS.escape(id)); body.querySelectorAll('.alvo').forEach(x => x.classList.remove('alvo')); if (el) { el.classList.add('alvo'); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } } else go(n, id); }

      // busca
      q.addEventListener('input', () => {
        const t = norm(q.value); if (t.length < 2) { res.classList.add('hidden'); return; }
        const byName = TODAS.filter(x => norm(x.nome).includes(t)); const byText = TODAS.filter(x => !byName.includes(x) && x.txt.includes(t));
        const r = [...byName, ...byText].slice(0, 40);
        res.innerHTML = '';
        if (!r.length) res.append(h('div.muted', { style: { padding: '10px' } }, 'Nada encontrado para “' + q.value + '”.'));
        r.forEach((x, i) => res.append(h('button', { type: 'button', style: { '--rh': META[x.n - 1].h }, onclick: () => { res.classList.add('hidden'); goEntry(x.id); } }, h('span', x.nome), h('small', (i >= byName.length ? 'citado em · ' : '') + 'Parte ' + x.n + ' · ' + META[x.n - 1].t))));
        res.classList.remove('hidden');
      });
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const b = res.querySelector('button'); if (b) b.click(); } if (e.key === 'Escape') res.classList.add('hidden'); });
      v.addEventListener('mousedown', (e) => { if (!e.target.closest('.tes-search')) res.classList.add('hidden'); });
      // links e copiar
      v.addEventListener('click', async (e) => {
        const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); goEntry(a.dataset.go); return; }
        const all = e.target.closest('[data-copyall]');
        if (all) { const el = body.querySelector('#tes-' + CSS.escape(all.dataset.copyall)); const txt = [...el.querySelectorAll('h3, h4, p, li, .tes-chips span, .tes-chips a')].map(x => (x.tagName === 'LI' ? '• ' : '') + x.textContent).join('\n'); try { await navigator.clipboard.writeText(txt); T.toast('Entrada copiada.'); } catch (er) { T.toast('Não consegui copiar.'); } return; }
        const c = e.target.closest('[data-copy]');
        if (c) { try { await navigator.clipboard.writeText(c.textContent.trim()); c.classList.add('copied'); setTimeout(() => c.classList.remove('copied'), 900); T.toast('Copiado: “' + c.textContent.trim().slice(0, 50) + (c.textContent.length > 50 ? '…' : '') + '”. Cole no texto com Ctrl+V.'); } catch (er) { T.toast('Não consegui copiar.'); } }
      });

      body.append(h('div.pane-empty', h('div', h('div.big', 'Abrindo o tesauro…'))));
      load().then(() => { drawNav(); if (tab.q) { q.dispatchEvent(new Event('input')); q.focus(); } go(cur, tab.entry); });
      return { destroy(){}, focus(){ q.focus(); } };
    }
  };
})(window.T);
