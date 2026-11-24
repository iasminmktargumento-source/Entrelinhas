/* Entrelinhas — insígnias: conquistas de cada livro, com confete quando você ganha uma */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;
  const k1 = (n) => n >= 1000 ? (n % 1000 ? (n / 1000).toFixed(1).replace('.', ',') : n / 1000) + 'K' : String(n);

  // cores de cada família de insígnia
  const FAM = {
    words: { name: 'Palavras no livro', a: 'hsl(198 85% 62%)', b: 'hsl(222 70% 48%)' },
    day: { name: 'Dias de escrita', a: 'hsl(330 85% 70%)', b: 'hsl(300 55% 48%)' },
    streak: { name: 'Constância', a: 'hsl(38 95% 62%)', b: 'hsl(14 85% 52%)' },
    book: { name: 'Estrutura do livro', a: 'hsl(150 60% 55%)', b: 'hsl(172 70% 34%)' },
    sprint: { name: 'Sprints', a: 'hsl(265 75% 70%)', b: 'hsl(245 55% 48%)' },
  };

  // lista de insígnias: test(st) diz se já foi conquistada
  const W = [100, 1667, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000, 125000, 150000];
  const WNAME = { 100: 'Primeiras palavras', 1667: 'Ritmo de novembro', 50000: 'Romance curto', 100000: 'Cem mil' };
  const WDESC = { 100: 'As primeiras 100 palavras do livro', 1667: '1.667 palavras: o ritmo diário do desafio de novembro' };
  const LIST = [
    ...W.map(n => ({ id: 'w' + n, fam: 'words', label: n === 1667 ? '1667' : k1(n), name: WNAME[n] || T.fmt(n) + ' palavras', desc: WDESC[n] || 'O livro chegou a ' + T.fmt(n) + ' palavras', test: (st) => st.total >= n })),
    { id: 'goal-book', fam: 'words', ic: 'star', name: 'Meta do livro', desc: 'Alcançou a meta total de palavras do livro', test: (st) => st.bookGoal > 0 && st.total >= st.bookGoal },
    { id: 'd-first', fam: 'day', ic: 'feather', name: 'Primeiro dia', desc: 'Escreveu num dia pela primeira vez neste livro', test: (st) => st.days >= 1 },
    { id: 'd-goal', fam: 'day', ic: 'check', name: 'Meta do dia', desc: 'Bateu a meta de palavras do dia', test: (st) => st.goalDays >= 1 },
    { id: 'd-goal10', fam: 'day', ic: 'check', label: '10×', name: 'Dez metas', desc: 'Bateu a meta do dia 10 vezes', test: (st) => st.goalDays >= 10 },
    { id: 'd-2k', fam: 'day', label: '2K', name: 'Dia produtivo', desc: '2.000 palavras num só dia', test: (st) => st.bestDay >= 2000 },
    { id: 'd-5k', fam: 'day', label: '5K', name: 'Maratona', desc: '5.000 palavras num só dia', test: (st) => st.bestDay >= 5000 },
    { id: 'd-10', fam: 'day', label: '10', name: 'Dez dias', desc: 'Escreveu em 10 dias diferentes', test: (st) => st.days >= 10 },
    { id: 'd-50', fam: 'day', label: '50', name: 'Cinquenta dias', desc: 'Escreveu em 50 dias diferentes', test: (st) => st.days >= 50 },
    { id: 'd-100', fam: 'day', label: '100', name: 'Cem dias', desc: 'Escreveu em 100 dias diferentes', test: (st) => st.days >= 100 },
    { id: 's3', fam: 'streak', ic: 'flame', label: '3', name: 'Pegando o ritmo', desc: '3 dias seguidos escrevendo', test: (st) => st.bestStreak >= 3 },
    { id: 's7', fam: 'streak', ic: 'flame', label: '7', name: 'Uma semana', desc: '7 dias seguidos escrevendo', test: (st) => st.bestStreak >= 7 },
    { id: 's14', fam: 'streak', ic: 'flame', label: '14', name: 'Hábito', desc: '14 dias seguidos escrevendo', test: (st) => st.bestStreak >= 14 },
    { id: 's30', fam: 'streak', ic: 'flame', label: '30', name: 'Um mês inteiro', desc: '30 dias seguidos escrevendo', test: (st) => st.bestStreak >= 30 },
    { id: 'c1', fam: 'book', ic: 'chapter', name: 'Primeiro capítulo', desc: 'Um capítulo com pelo menos 500 palavras', test: (st) => st.chapters >= 1 },
    { id: 'c5', fam: 'book', ic: 'chapter', label: '5', name: 'Cinco capítulos', desc: '5 capítulos com pelo menos 500 palavras', test: (st) => st.chapters >= 5 },
    { id: 'c10', fam: 'book', ic: 'chapter', label: '10', name: 'Dez capítulos', desc: '10 capítulos com pelo menos 500 palavras', test: (st) => st.chapters >= 10 },
    { id: 'c20', fam: 'book', ic: 'chapter', label: '20', name: 'Vinte capítulos', desc: '20 capítulos com pelo menos 500 palavras', test: (st) => st.chapters >= 20 },
    { id: 'p2', fam: 'book', ic: 'part', name: 'Em partes', desc: 'O livro tem duas partes ou mais', test: (st) => st.parts >= 2 },
    { id: 'done', fam: 'book', ic: 'bookmark', name: 'Capítulo pronto', desc: 'Marcou um capítulo como pronto (status final)', test: (st) => st.doneCh >= 1 },
    { id: 'sp1', fam: 'sprint', ic: 'clock', name: 'Primeiro sprint', desc: 'Terminou um sprint de escrita', test: (st) => st.sprints >= 1 },
    { id: 'sp10', fam: 'sprint', ic: 'clock', label: '10', name: 'Dez sprints', desc: 'Terminou 10 sprints', test: (st) => st.sprints >= 10 },
    { id: 'sp1k', fam: 'sprint', label: '1K', name: 'Sprint de mil', desc: '1.000 palavras num só sprint', test: (st) => st.bestSprint >= 1000 },
  ];

  function stats(pid){
    const p = S().get(pid); if (!p) return null;
    const tg = Object.assign({ book: 90000, session: 1000 }, p.meta?.targets || {});
    const tal = (p.meta?.tallies || []).reduce((a, t) => a + (+t.n || 0), 0);
    const total = T.MS.words(pid) + tal;
    const w = T.Goals ? T.Goals.written(pid) : (p.meta?.history || {});
    const vals = Object.values(w).map(Number);
    const days = vals.filter(v => v > 0).length;
    const bestDay = Math.max(0, ...vals);
    const goalDays = tg.session ? vals.filter(v => v >= tg.session).length : 0;
    const bestStreak = T.Goals ? T.Goals.streaks(w, 1).best : 0;
    const all = S().all(pid).filter(i => i.area === 'ms');
    const chs = all.filter(i => i.type === 'chapter');
    const chWords = (c) => T.MS.docs(c).reduce((a, d) => a + (d.meta?.words ?? T.words(d.body)), 0) + (c.body ? T.words(c.body) : 0);
    const chapters = chs.filter(c => chWords(c) >= 500).length;
    const isDone = (i) => /pronto|final|revisado/i.test(i.meta?.status || '');
    const doneCh = chs.filter(c => isDone(c) || (T.MS.docs(c).length && T.MS.docs(c).every(isDone))).length;
    const sp = p.meta?.sprints || [];
    return { total, bookGoal: tg.book || 0, days, bestDay, goalDays, bestStreak, chapters, parts: all.filter(i => i.type === 'part').length, doneCh, sprints: sp.length, bestSprint: Math.max(0, ...sp.map(s => +s.words || 0)) };
  }

  /* ----- desenho da insígnia (hexágono, emblema no meio) ----- */
  let gid = 0;
  function art(b, on, size = 84){
    const f = FAM[b.fam]; const id = 'bg' + (++gid);
    const svg = `<svg viewBox="0 0 100 112" width="${size}" height="${size * 1.12}" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${on ? f.a : 'hsl(220 12% 86%)'}"/><stop offset="1" stop-color="${on ? f.b : 'hsl(220 10% 72%)'}"/></linearGradient></defs>
      <path d="M50 3 L95 28 L95 84 L50 109 L5 84 L5 28 Z" fill="url(#${id})" stroke="${on ? 'hsl(0 0% 100% / .85)' : 'hsl(0 0% 100% / .6)'}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 14 L85 34 L85 78 L50 98 L15 78 L15 34 Z" fill="none" stroke="hsl(0 0% 100% / ${on ? .35 : .4})" stroke-width="2" stroke-linejoin="round"/>
      ${on ? '<path d="M18 33 L50 14 L82 33 Q50 26 18 33 Z" fill="hsl(0 0% 100% / .28)"/>' : ''}
    </svg>`;
    const el = h('div.bdg-art' + (on ? '.on' : '.off')); el.innerHTML = svg;
    const em = h('div.bdg-em');
    if (!on) { if (b.label) em.appendChild(h('span.bdg-num' + (b.ic ? '.small' : ''), b.label)); em.appendChild(icon('lock', b.label ? 'bdg-lk' : '')); }
    else {
      if (b.ic) em.appendChild(icon(b.ic));
      if (b.label) em.appendChild(h('span.bdg-num' + (b.ic ? '.small' : ''), b.label));
    }
    el.appendChild(em);
    return el;
  }

  /* ----- confete ----- */
  function confetti(){
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = h('canvas.confetti'); document.body.appendChild(c);
    const dpr = Math.min(2, devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; const g = c.getContext('2d'); g.scale(dpr, dpr);
    const cols = ['#ff5d8f', '#ffb84d', '#ffe066', '#5ce1a1', '#4dc3ff', '#9a7bff', '#ff7a59'];
    const N = reduce ? 40 : 170;
    const ps = Array.from({ length: N }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * .6, vx: (Math.random() - .5) * 2.2, vy: 1.6 + Math.random() * 2.8, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .25, w: 6 + Math.random() * 6, h: 9 + Math.random() * 8, col: cols[(Math.random() * cols.length) | 0], sh: Math.random() < .3 ? 'c' : 'r', sw: Math.random() * 6 }));
    const t0 = performance.now(); const DUR = reduce ? 1800 : 4200;
    (function step(t){
      const e = t - t0; g.clearRect(0, 0, W, H);
      const fade = e > DUR - 900 ? Math.max(0, (DUR - e) / 900) : 1;
      ps.forEach(p => {
        p.x += p.vx + Math.sin((e / 400) + p.sw) * .6; p.y += p.vy; p.r += p.vr;
        g.save(); g.globalAlpha = fade; g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.col;
        if (p.sh === 'c') { g.beginPath(); g.arc(0, 0, p.w / 2.4, 0, 7); g.fill(); }
        else { g.scale(1, Math.abs(Math.cos(p.r * 2)) * .8 + .2); g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
        g.restore();
      });
      if (e < DUR) requestAnimationFrame(step); else c.remove();
    })(t0);
  }

  /* ----- aviso de conquista ----- */
  let card = null;
  function celebrate(list, opts = {}){
    if (!list.length) return;
    confetti();
    if (card) card.remove();
    const main = list[0];
    card = h('div.bdg-pop.glass.glass-strong', { role: 'status' },
      art(main, true, 64),
      h('div.bdg-pop-t',
        h('div.bdg-pop-k', opts.first ? 'Suas insígnias' : list.length > 1 ? list.length + ' novas insígnias!' : 'Nova insígnia!'),
        h('b', opts.first ? 'Você já começa com ' + list.length + (list.length === 1 ? ' insígnia' : ' insígnias') : main.name),
        h('span', opts.first ? 'Pelo que o livro já tem até aqui.' : list.length > 1 ? list.slice(0, 4).map(b => b.name).join(' · ') + (list.length > 4 ? ' e mais ' + (list.length - 4) : '') : main.desc)),
      h('button.btn.sm', { type: 'button', onclick: () => { close(); T.Shell.open({ kind: 'badges', ref: 'badges' }); } }, 'Ver todas'),
      h('button.icon-btn', { type: 'button', 'aria-label': 'Fechar', onclick: () => close() }, icon('x')));
    document.body.appendChild(card);
    const me = card; const close = () => { me.classList.add('out'); setTimeout(() => me.remove(), 300); if (card === me) card = null; };
    setTimeout(close, 9000);
  }

  /* ----- checagem ----- */
  function check(pid, quiet){
    const p = S().get(pid); if (!p || p.type !== 'project') return [];
    const st = stats(pid); if (!st) return [];
    const have = Object.assign({}, p.meta?.badges || {});
    const fresh = LIST.filter(b => !have[b.id] && b.test(st));
    if (!fresh.length && p.meta?.badgesSeeded) return [];
    const day = T.today();
    fresh.forEach(b => { have[b.id] = day; });
    const first = !p.meta?.badgesSeeded;
    S().update(pid, { meta: { badges: have, badgesSeeded: true } }, { silent: true });
    if (!quiet && fresh.length) celebrate(fresh, { first: first && fresh.length > 1 });
    T.emit('badges-changed', { pid });
    return fresh;
  }
  const later = T.debounce(() => { const pid = T.Shell?.pid; if (pid) check(pid); }, 1800);
  ['session', 'tree-changed', 'doc-saved'].forEach(ev => T.on(ev, later));
  T.on('project-opened', later);
  T.on('badges-changed', T.debounce(() => T.Shell?.redrawTree?.(), 300));

  T.Badges = { LIST, FAM, stats, check, art, confetti, celebrate };

  /* ----- tela de insígnias ----- */
  T.Views.badges = {
    icon: 'trophy', title: () => 'Insígnias',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad.bdg-view'); root.appendChild(v);
      function render(){
        v.innerHTML = '';
        const p = S().get(pid); const have = p?.meta?.badges || {}; const st = stats(pid) || {};
        const n = LIST.filter(b => have[b.id]).length;
        v.appendChild(h('div.bdg-head',
          h('div', h('h2', 'Suas insígnias'), h('p.muted', 'Cada livro tem as suas. Elas aparecem conforme você escreve, e cai confete quando chega uma nova.')),
          h('div.bdg-count', h('b', String(n)), h('span', 'de ' + LIST.length)),
          h('div.bdg-bar', h('i', { style: { width: (n / LIST.length * 100) + '%' } }))));
        Object.entries(FAM).forEach(([fk, f]) => {
          const items = LIST.filter(b => b.fam === fk); if (!items.length) return;
          const got = items.filter(b => have[b.id]).length;
          v.appendChild(h('section.bdg-sec',
            h('h3', f.name, h('span.muted', got + '/' + items.length)),
            h('div.bdg-grid', items.map(b => {
              const on = !!have[b.id];
              const when = on && have[b.id] ? new Date(have[b.id] + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
              return h('div.bdg' + (on ? '.got' : ''), { title: b.desc + (on ? ' — ganha em ' + when : ' — ainda não') , tabindex: '0' },
                art(b, on), h('div.bdg-name', b.name), h('div.bdg-desc', on ? when : b.desc));
            }))));
        });
        v.appendChild(h('div.row.bdg-foot',
          h('button.btn.sm', { type: 'button', onclick: () => confetti() }, icon('spark'), 'Jogar confete'),
          h('span.muted', 'Hoje: ' + T.fmt(T.Session ? T.Session.today(pid) : 0) + ' palavras · Livro: ' + T.fmt(st.total || 0))));
      }
      check(pid);
      render();
      const off = T.on('badges-changed', (e) => { if (e.pid === pid) render(); });
      return { destroy(){ off(); } };
    },
  };
})();
