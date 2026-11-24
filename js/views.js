/* Tinteiro — telas: quadro de fichas, visão geral e metas, estatísticas, localizar, ideias, próximas etapas */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  T.Views = {};

  const STATUS_COLORS = { rascunho: 'hsl(40 85% 55%)', revisando: 'hsl(200 80% 55%)', pronto: 'hsl(145 60% 45%)' };
  T.STATUS_COLORS = STATUS_COLORS;
  const povHue = (s) => { let x = 0; for (const c of s || '') x = (x * 31 + c.charCodeAt(0)) % 360; return x; };
  T.povHue = povHue;

  /* ---------- Quadro de fichas ---------- */
  T.Views.cork = {
    icon: 'cork',
    title: (tab) => (tab.ref === 'ms' ? 'Manuscrito' : (S().get(tab.ref)?.title || 'Quadro')) + ' · fichas',
    mount(root, tab, ctx){
      const pid = ctx.pid;
      const parent = tab.ref === 'ms' || tab.ref === 'res' ? null : tab.ref;
      const area = tab.ref === 'res' ? 'res' : (parent ? S().get(parent)?.area : 'ms') || 'ms';
      const v = h('div.view.view-pad'); root.appendChild(v);
      let dragId = null;
      function render(){
        v.innerHTML = '';
        const it = parent ? S().get(parent) : null;
        const kids = S().children(pid, parent, area).filter(k => k.type !== 'snapshot');
        const childType = it?.type === 'part' ? 'chapter' : it?.type === 'chapter' ? 'scene' : area === 'res' ? 'doc' : 'chapter';
        const label = { chapter: 'capítulo', scene: 'cena', doc: 'documento' }[childType];
        v.append(h('div.view-h', h('div.grow', h('h1', it ? it.title || 'Sem título' : (area === 'res' ? 'Pesquisa' : 'Manuscrito')), h('p', 'Arraste as fichas para mudar a ordem no livro. Clique duas vezes para abrir o texto.')),
          h('button.btn.primary', { onclick: () => { const n = S().create({ pid, type: childType, area, parent, title: 'Nova ' + label.replace('capítulo', 'capítulo'), order: Date.now() }); if (childType === 'chapter') S().update(n.id, { title: 'Capítulo ' + (kids.filter(k => k.type === 'chapter').length + 1) }); T.emit('tree-changed'); } }, icon('plus'), 'Nova ficha de ' + label)));
        const grid = h('div.cork');
        if (!kids.length) grid.appendChild(h('p.muted', 'Nada aqui ainda.'));
        kids.forEach(k => {
          const lh = k.meta?.label ?? 48;
          const title = h('input.ct', { value: k.title || '', 'aria-label': 'Título da ficha' }); title.onchange = () => { S().update(k.id, { title: title.value }); T.emit('tree-changed'); };
          const syn = h('textarea', { placeholder: 'Sinopse…', 'aria-label': 'Sinopse' }); syn.value = k.meta?.synopsis || ''; syn.onchange = () => S().update(k.id, { meta: { synopsis: syn.value } });
          const st = h('select', { 'aria-label': 'Situação' }, ['rascunho', 'revisando', 'pronto'].map(s => h('option', { value: s, selected: (k.meta?.status || 'rascunho') === s }, s)));
          st.onchange = () => { S().update(k.id, { meta: { status: st.value } }); T.emit('tree-changed'); };
          const words = k.type === 'chapter' || k.type === 'part' ? T.MS.docs(k).reduce((a, d) => a + (d.meta?.words || 0), 0) : (k.meta?.words || 0);
          const card = h('div.card', { draggable: 'true' },
            h('button.icon-btn.sm.open', { title: 'Abrir texto', onclick: () => T.Shell.open({ kind: 'doc', ref: k.id }) }, icon('pop')),
            title, syn,
            h('div.cf', h('span.stat', { style: { width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[k.meta?.status || 'rascunho'] } }), st,
              k.meta?.pov ? h('span', { style: { fontWeight: 700, color: `hsl(${povHue(k.meta.pov)} 60% 38%)` } }, k.meta.pov) : null,
              h('span.num', { style: { marginLeft: 'auto' } }, T.fmt(words) + ' pal.'),
              h('button.icon-btn.sm', { title: 'Trocar a cor da etiqueta', style: { color: `hsl(${lh} 80% 50%)` }, onclick: () => { const i = T.HUES.indexOf(lh); S().update(k.id, { meta: { label: T.HUES[(i + 1) % T.HUES.length] } }); render(); } }, icon('spark'))));
          card.style.setProperty('--lh', lh);
          card.ondblclick = (e) => { if (e.target.closest('input,textarea,select,button')) return; T.Shell.open({ kind: k.type === 'part' || (k.type === 'chapter' && false) ? 'cork' : 'doc', ref: k.id }); };
          card.ondragstart = (e) => { if (e.target.closest('input,textarea,select')) { e.preventDefault(); return; } dragId = k.id; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', k.id); };
          card.ondragend = () => { card.classList.remove('dragging'); grid.querySelectorAll('.drop').forEach(c => c.classList.remove('drop')); };
          card.ondragover = (e) => { if (!dragId || dragId === k.id) return; e.preventDefault(); card.classList.add('drop'); };
          card.ondragleave = () => card.classList.remove('drop');
          card.ondrop = (e) => {
            e.preventDefault(); if (!dragId || dragId === k.id) return;
            const list = kids.filter(x => x.id !== dragId); const at = list.findIndex(x => x.id === k.id);
            const r = card.getBoundingClientRect(); const after = e.clientX > r.left + r.width / 2;
            list.splice(after ? at + 1 : at, 0, S().get(dragId));
            list.forEach((x, i) => { if (x.order !== (i + 1) * 1000) S().update(x.id, { order: (i + 1) * 1000 }, { silent: true }); });
            dragId = null; T.emit('tree-changed'); render();
          };
          grid.appendChild(card);
        });
        v.appendChild(grid);
      }
      render();
      const off = T.on('tree-changed', () => { if (!v.contains(document.activeElement)) render(); });
      return { destroy(){ off(); } };
    }
  };

  /* ---------- Sessão: palavras do dia ---------- */
  T.Session = {
    today(pid){ return S().get(pid)?.meta?.history?.[T.today()] || 0; },
    add(pid, delta){
      const p = S().get(pid); if (!p) return;
      const hist = Object.assign({}, p.meta?.history); const k = T.today();
      hist[k] = Math.max(0, (hist[k] || 0) + delta);
      // mantém só ~2 anos de histórico
      const keys = Object.keys(hist).sort(); while (keys.length > 730) delete hist[keys.shift()];
      S().update(pid, { meta: { history: hist } }, { delay: 2500, silent: true });
      T.emit('session', { pid });
    },
    streak(pid){
      const hist = S().get(pid)?.meta?.history || {}; let n = 0; const d = new Date();
      if (!hist[T.dayKey(d)]) d.setDate(d.getDate() - 1);
      while (hist[T.dayKey(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
  };
  T.on('words-delta', ({ pid, delta }) => T.Session.add(pid, delta));

  function heatmap(pid, weeks = 20){
    const hist = S().get(pid)?.meta?.history || {};
    const grid = h('div.heat', { role: 'img', 'aria-label': 'Palavras escritas por dia nas últimas ' + weeks + ' semanas' });
    const end = new Date(); const start = new Date(); start.setDate(end.getDate() - (weeks * 7 - 1) - end.getDay());
    const vals = Object.values(hist); const max = Math.max(500, ...vals);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const v = hist[T.dayKey(d)] || 0; const l = v <= 0 ? 0 : v < max * .15 ? 1 : v < max * .35 ? 2 : v < max * .65 ? 3 : 4;
      grid.appendChild(h('i', { 'data-l': l, title: d.toLocaleDateString('pt-BR') + ': ' + T.fmt(v) + ' palavras' }));
    }
    return grid;
  }

  /* ---------- Visão geral e metas (no espírito do TrackBear) ---------- */
  const DAY = 864e5;
  const dkey = (d) => T.dayKey(d);
  const parseD = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a, b) => Math.round((parseD(dkey(b)) - parseD(dkey(a))) / DAY);
  const fmtDay = (d, long) => d.toLocaleDateString('pt-BR', long ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' });
  T.Goals = {
    // palavras escritas por dia: o que o Tinteiro contou + registros feitos à mão
    written(pid){
      const p = S().get(pid); const out = Object.assign({}, p?.meta?.history || {});
      (p?.meta?.tallies || []).forEach(t => { out[t.d] = (out[t.d] || 0) + (+t.n || 0); });
      return out;
    },
    sum(w, a, b){ let n = 0; for (let d = new Date(a); dkey(d) <= dkey(b); d = addD(d, 1)) n += Math.max(0, w[dkey(d)] || 0); return n; },
    streaks(w, min = 1){
      const keys = Object.keys(w).filter(k => w[k] >= min).sort(); let best = 0, run = 0, prev = null;
      keys.forEach(k => { run = prev && daysBetween(parseD(prev), parseD(k)) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = k; });
      let cur = 0; let d = new Date(); if (!(w[dkey(d)] >= min)) d = addD(d, -1); while (w[dkey(d)] >= min) { cur++; d = addD(d, -1); }
      return { cur, best };
    },
    writeDays(a, b, days){ let n = 0; for (let d = new Date(a); dkey(d) <= dkey(b); d = addD(d, 1)) if (days.includes(d.getDay())) n++; return n; },
  };

  // gráfico de linha: progresso real × ritmo ideal × previsão (um eixo só)
  function lineChart(series, opts){
    const W = 760, H = 250, L = 52, R = 14, Tp = 14, B = 30;
    const xs = opts.days; const n = xs.length; const maxY = Math.max(10, ...series.flatMap(s => s.pts.map(p => p[1]))) * 1.06;
    const X = (i) => L + (n <= 1 ? 0 : i / (n - 1) * (W - L - R)), Y = (v) => Tp + (1 - v / maxY) * (H - Tp - B);
    const nice = (m) => { const e = Math.pow(10, Math.floor(Math.log10(m))); const f = m / e; return (f < 1.5 ? 1 : f < 3.5 ? 2.5 : f < 7.5 ? 5 : 10) * e / 4 * 4; };
    const step = nice(maxY) / 4; const ticks = []; for (let v = 0; v <= maxY; v += step) ticks.push(v);
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="gl-svg" role="img" aria-label="' + T.esc(opts.label) + '">';
    ticks.forEach(v => { svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="gl-grid"/><text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" class="gl-ax" text-anchor="end">' + T.fmt(Math.round(v)) + '</text>'; });
    const every = Math.max(1, Math.ceil(n / 7));
    xs.forEach((d, i) => { if (i % every === 0 || i === n - 1) svg += '<text x="' + X(i) + '" y="' + (H - 8) + '" class="gl-ax" text-anchor="middle">' + fmtDay(d) + '</text>'; });
    if (opts.todayI != null && opts.todayI < n - 1) svg += '<line x1="' + X(opts.todayI) + '" x2="' + X(opts.todayI) + '" y1="' + Tp + '" y2="' + (H - B) + '" class="gl-today"/><text x="' + (X(opts.todayI) + 4) + '" y="' + (Tp + 10) + '" class="gl-ax">hoje</text>';
    series.forEach(s => { if (s.pts.length < 1) return; svg += '<polyline class="gl-line ' + s.cls + '" points="' + s.pts.map(([i, v]) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)) .join(' ') + '"/>'; if (s.end) { const [i, v] = s.pts[s.pts.length - 1]; svg += '<circle class="gl-dot ' + s.cls + '" cx="' + X(i) + '" cy="' + Y(v) + '" r="4"/>'; } });
    svg += '<line class="gl-cross" y1="' + Tp + '" y2="' + (H - B) + '" x1="-9" x2="-9"/>';
    xs.forEach((d, i) => { const w = (W - L - R) / Math.max(1, n - 1); svg += '<rect class="gl-hit" data-i="' + i + '" x="' + (X(i) - w / 2) + '" y="' + Tp + '" width="' + w + '" height="' + (H - Tp - B) + '"/>'; });
    svg += '</svg>';
    const box = h('div.gl-box', { html: svg }); const tip = h('div.gl-tip'); box.appendChild(tip);
    const cross = box.querySelector('.gl-cross');
    box.addEventListener('mousemove', (e) => {
      const r = e.target.closest && e.target.closest('.gl-hit'); if (!r) return;
      const i = +r.dataset.i; const rows = series.map(s => { const p = s.pts.find(q => q[0] === i); return p ? h('div', h('i.' + s.cls), s.name + ': ', h('b.num', T.fmt(Math.round(p[1])))) : null; }).filter(Boolean);
      if (!rows.length) { tip.style.display = 'none'; return; }
      tip.replaceChildren(h('div.gl-tt', fmtDay(xs[i], true)), ...rows); tip.style.display = 'block';
      const br = box.getBoundingClientRect(); const x = X(i) / W * br.width;
      tip.style.left = Math.min(br.width - 190, Math.max(0, x + 12)) + 'px'; tip.style.top = '8px';
      cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i));
    });
    box.addEventListener('mouseleave', () => { tip.style.display = 'none'; cross.setAttribute('x1', -9); cross.setAttribute('x2', -9); });
    const legend = h('div.gl-legend', series.filter(s => s.pts.length).map(s => h('span', h('i.' + s.cls), s.name)));
    return h('div', legend, box);
  }
  // barras por dia com a linha da meta diária
  function barChart(days, vals, goal, label){
    const W = 760, H = 220, L = 52, R = 14, Tp = 12, B = 28; const n = days.length;
    const maxY = Math.max(goal || 0, 50, ...vals) * 1.1; const bw = (W - L - R) / n; const Y = (v) => Tp + (1 - v / maxY) * (H - Tp - B);
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="gl-svg" role="img" aria-label="' + T.esc(label) + '">';
    const st = (() => { const raw = maxY / 4; const e = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e; })();
    const tk = []; for (let x = 0; x <= maxY; x += st) tk.push(x);
    tk.forEach(v => { svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="gl-grid"/><text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" class="gl-ax" text-anchor="end">' + T.fmt(Math.round(v)) + '</text>'; });
    const every = Math.max(1, Math.ceil(n / 8));
    days.forEach((d, i) => {
      const v = vals[i]; const x = L + i * bw + Math.min(2, bw * .15); const w = Math.max(1, bw - Math.min(4, bw * .3));
      if (v > 0) { const y = Y(v), hh = H - B - y; svg += '<path class="gl-bar' + (goal && v >= goal ? ' met' : '') + '" d="M' + x + ',' + (H - B) + 'V' + (y + Math.min(4, hh)) + 'q0,-' + Math.min(4, hh) + ' ' + Math.min(4, w / 2) + ',-' + Math.min(4, hh) + 'H' + (x + w - Math.min(4, w / 2)) + 'q' + Math.min(4, w / 2) + ',0 ' + Math.min(4, w / 2) + ',' + Math.min(4, hh) + 'V' + (H - B) + 'Z"/>'; }
      if (i % every === 0) svg += '<text x="' + (x + w / 2) + '" y="' + (H - 8) + '" class="gl-ax" text-anchor="middle">' + fmtDay(d) + '</text>';
      svg += '<rect class="gl-hit" data-i="' + i + '" x="' + (L + i * bw) + '" y="' + Tp + '" width="' + bw + '" height="' + (H - Tp - B) + '"/>';
    });
    if (goal) svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(goal) + '" y2="' + Y(goal) + '" class="gl-goal"/><text x="' + (W - R) + '" y="' + (Y(goal) - 5) + '" class="gl-ax" text-anchor="end">meta do dia · ' + T.fmt(goal) + '</text>';
    svg += '</svg>';
    const box = h('div.gl-box', { html: svg }); const tip = h('div.gl-tip'); box.appendChild(tip);
    box.addEventListener('mousemove', (e) => { const r = e.target.closest && e.target.closest('.gl-hit'); if (!r) return; const i = +r.dataset.i; tip.replaceChildren(h('div.gl-tt', fmtDay(days[i], true)), h('div', h('b.num', T.fmt(vals[i])), ' palavras' + (goal ? (vals[i] >= goal ? ' · meta batida ✓' : ' · faltaram ' + T.fmt(goal - vals[i])) : ''))); tip.style.display = 'block'; const br = box.getBoundingClientRect(); tip.style.left = Math.min(br.width - 190, Math.max(0, (L + (i + .5) * bw) / W * br.width + 10)) + 'px'; tip.style.top = '8px'; });
    box.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    return box;
  }

  T.Views.overview = {
    icon: 'target', title: () => 'Metas e visão geral',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad'); root.appendChild(v);
      let chartKind = tab.chart || 'progress', range = tab.range || 'proj';
      function render(){
        const p = S().get(pid); const tg = Object.assign({ book: 90000, session: 1000, deadline: '', start: '', days: [1, 2, 3, 4, 5] }, p.meta?.targets || {});
        const W = T.Goals.written(pid);
        const tallies = (p.meta?.tallies || []);
        const tallyAll = tallies.reduce((a, t) => a + (+t.n || 0), 0);
        const manuscript = T.MS.words(pid); const total = manuscript + tallyAll;
        const today = new Date(); const tKey = dkey(today); const wToday = W[tKey] || 0;
        const firstKey = Object.keys(W).sort()[0];
        const start = tg.start ? parseD(tg.start) : (firstKey ? parseD(firstKey) : today);
        const end = tg.deadline ? parseD(tg.deadline) : null;
        // total acumulado em cada dia (de trás para frente a partir de hoje)
        const valueAt = (d) => { let later = 0; for (const k in W) if (k > dkey(d)) later += W[k]; return Math.max(0, total - later); };
        const baseStart = valueAt(addD(start, -1));
        // ritmo: média dos últimos 14 dias (ou desde o início)
        const span = Math.max(1, Math.min(14, daysBetween(start, today) + 1));
        const recent = T.Goals.sum(W, addD(today, -(span - 1)), today); const avg = recent / span;
        const remaining = Math.max(0, tg.book - total);
        let perDay = null, writeDays = null, daysLeft = null, behind = null;
        if (end) {
          daysLeft = Math.max(0, daysBetween(today, end));
          writeDays = T.Goals.writeDays(today, end, tg.days);
          perDay = writeDays ? Math.ceil((remaining + wToday) / writeDays) : null;
          const tot = Math.max(1, daysBetween(start, end) + 1), el = T.clamp(daysBetween(start, today) + 1, 0, tot);
          const expected = baseStart + (tg.book - baseStart) * el / tot; behind = Math.round(expected - total);
        }
        const finishIn = remaining <= 0 ? 0 : avg > 0 ? Math.ceil(remaining / avg) : null;
        const finish = finishIn != null ? addD(today, finishIn) : null;
        const sk = T.Goals.streaks(W, 1);
        const bestDay = Object.entries(W).sort((a, b) => b[1] - a[1])[0];
        const dayGoal = perDay && perDay > 0 ? perDay : tg.session;
        const setT = (patch) => { S().update(pid, { meta: { targets: Object.assign({}, tg, patch) } }); render(); };
        v.innerHTML = '';
        v.append(h('div.view-h', h('div.grow', h('h1', p.title), h('p', 'Metas, prazos e ritmo de escrita deste livro.')),
          h('button.btn', { onclick: () => tallyModal() }, icon('plus'), 'Registrar palavras'),
          h('button.btn.primary', { onclick: () => goalModal() }, icon('target'), 'Nova meta')));
        const pct = Math.min(100, total / Math.max(1, tg.book) * 100);
        const pace = behind == null ? null : behind > 0 ? h('span.gl-st.bad', '▼ ', T.fmt(behind), ' atrás do ritmo') : h('span.gl-st.ok', '▲ ', T.fmt(-behind), ' à frente do ritmo');
        v.append(h('div.tiles',
          h('div.tile.glass', h('div.k', 'Livro', h('button.tile-edit', { type: 'button', title: 'Mudar a meta do livro', onclick: () => { const i = v.querySelector('#tg-book'); if (i) { i.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => { i.focus(); i.select(); }, 350); } } }, icon('edit'), 'mudar meta')), h('div.v.num', T.fmt(total)), h('div.s', 'de ' + T.fmt(tg.book) + ' palavras · ' + Math.round(pct) + '%' + (tallyAll ? ' (inclui ' + T.fmt(tallyAll) + ' registradas à mão)' : '')), h('div.prog', h('i', { style: { width: pct + '%' } }))),
          h('div.tile.glass', h('div.k', 'Hoje'), h('div.v.num', T.fmt(wToday)), h('div.s', 'meta do dia: ' + T.fmt(dayGoal) + (wToday >= dayGoal ? ' · batida ✓' : ' · faltam ' + T.fmt(dayGoal - wToday))), h('div.prog', h('i', { style: { width: Math.min(100, wToday / Math.max(1, dayGoal) * 100) + '%' } }))),
          h('div.tile.glass', h('div.k', 'Para bater o prazo'), h('div.v.num', perDay != null ? T.fmt(perDay) : '—'), h('div.s', end ? 'palavras por dia de escrita · ' + writeDays + ' dias de escrita em ' + daysLeft + ' dias' : 'defina início e fim do projeto abaixo'), pace),
          h('div.tile.glass', h('div.k', 'Previsão de término'), h('div.v.num', { style: { fontSize: '30px' } }, finish ? (finishIn === 0 ? 'meta batida!' : fmtDay(finish, true)) : '—'), h('div.s', finish ? (finishIn === 0 ? '' : 'no ritmo atual de ' + T.fmt(Math.round(avg)) + ' palavras/dia' + (end ? (finish <= end ? ' · antes do prazo ✓' : ' · depois do prazo') : '')) : 'escreva alguns dias para calcular')),
          h('div.tile.glass', h('div.k', 'Sequência'), h('div.v.num', String(sk.cur)), h('div.s', (sk.cur === 1 ? 'dia seguido' : 'dias seguidos') + ' · recorde: ' + sk.best)),
          h('div.tile.glass', h('div.k', 'Média e melhor dia'), h('div.v.num', T.fmt(Math.round(avg))), h('div.s', 'palavras por dia (últimos ' + span + ' dias)' + (bestDay ? ' · melhor: ' + T.fmt(bestDay[1]) + ' em ' + fmtDay(parseD(bestDay[0])) : ''))),
        ));
        // gráficos
        const seg = (vals, cur, fn, label) => h('div.seg', { role: 'group', 'aria-label': label }, vals.map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => fn(k) }, l); if (k === cur) b.classList.add('on'); return b; }));
        let r0, r1;
        if (range === 'proj') { r0 = start; r1 = end && end > today ? end : today; if (daysBetween(r0, r1) < 13) r0 = addD(r1, -13); }
        else { const nd = { '30': 30, '90': 90, '365': 365 }[range] || 30; r0 = addD(today, -(nd - 1)); r1 = range === '30' && end && end > today && daysBetween(today, end) < 30 ? end : today; }
        const days = []; for (let d = new Date(r0); dkey(d) <= dkey(r1); d = addD(d, 1)) days.push(new Date(d));
        const ti = days.findIndex(d => dkey(d) === tKey);
        let chart;
        if (chartKind === 'progress') {
          const real = [], ideal = [], proj = [];
          days.forEach((d, i) => { if (dkey(d) <= tKey) real.push([i, valueAt(d)]); });
          if (end) { const s0 = days.findIndex(d => dkey(d) >= dkey(start)), s1 = days.findIndex(d => dkey(d) === dkey(end)); const tot = Math.max(1, daysBetween(start, end) + 1);
            days.forEach((d, i) => { if (dkey(d) >= dkey(start) && dkey(d) <= dkey(end)) ideal.push([i, baseStart + (tg.book - baseStart) * (daysBetween(start, d) + 1) / tot]); }); }
          if (ti >= 0 && avg > 0) days.forEach((d, i) => { if (i >= ti) proj.push([i, Math.min(Math.max(tg.book, total), total + avg * (i - ti))]); });
          chart = lineChart([{ name: 'Escrito', cls: 's-real', pts: real, end: true }, { name: 'Ritmo para o prazo', cls: 's-ideal', pts: ideal }, { name: 'Previsão no ritmo atual', cls: 's-proj', pts: proj.length > 1 ? proj : [] }], { days, todayI: ti, label: 'Progresso do livro em palavras' });
        } else {
          const past = days.filter(d => dkey(d) <= tKey);
          chart = barChart(past, past.map(d => W[dkey(d)] || 0), dayGoal, 'Palavras por dia');
        }
        v.append(h('div.panel.glass', h('div.row.gl-head', h('h3.grow', chartKind === 'progress' ? 'Progresso do livro' : 'Palavras por dia'),
          seg([['progress', 'Progresso'], ['daily', 'Por dia']], chartKind, (k) => { chartKind = tab.chart = k; T.emit('tab-changed', tab); render(); }, 'Tipo de gráfico'),
          seg([['proj', 'Projeto'], ['30', '30 dias'], ['90', '90 dias'], ['365', 'Ano']], range, (k) => { range = tab.range = k; T.emit('tab-changed', tab); render(); }, 'Período')), chart));
        // metas extras (com prazo ou hábito)
        const goals = p.meta?.goals || [];
        v.append(h('div.panel.glass', h('div.row', h('h3.grow', 'Minhas metas'), h('button.btn.sm', { onclick: () => goalModal() }, icon('plus'), 'Nova meta')),
          goals.length ? h('div.gl-goals', goals.map(g => goalCard(g, W, tg))) : h('p.muted', { style: { margin: 0, fontSize: '13px' } }, 'Crie metas com começo e fim (ex.: 50.000 palavras em novembro) ou hábitos (ex.: 500 palavras por dia, 3.000 por semana). Cada uma mostra quanto falta e quanto escrever por dia.')));
        // projeto: datas e metas principais
        const book = h('input.input.num', { type: 'number', min: 100, step: 1000, value: tg.book, id: 'tg-book' });
        const bookLive = T.debounce(() => { const n = +book.value; if (n >= 100) { S().update(pid, { meta: { targets: Object.assign({}, S().get(pid).meta?.targets || tg, { book: n }) } }); T.emit('targets-changed', { pid }); } }, 400);
        book.oninput = bookLive; book.onchange = () => { bookLive(); bookLive.flush && bookLive.flush(); setTimeout(() => { if (v.isConnected && !v.contains(document.activeElement)) render(); }, 300); };
        const sess = h('input.input.num', { type: 'number', min: 50, step: 50, value: tg.session, id: 'tg-sess' });
        sess.oninput = T.debounce(() => { const n = +sess.value; if (n >= 10) { S().update(pid, { meta: { targets: Object.assign({}, S().get(pid).meta?.targets || tg, { session: n }) } }); T.emit('targets-changed', { pid }); } }, 400);
        sess.onchange = () => { const n = +sess.value; if (n >= 10) { S().update(pid, { meta: { targets: Object.assign({}, S().get(pid).meta?.targets || tg, { session: n }) } }); T.emit('targets-changed', { pid }); } setTimeout(() => { if (v.isConnected && !v.contains(document.activeElement)) render(); }, 300); };
        const st = h('input.input', { type: 'date', value: tg.start || '', id: 'tg-st' }); st.onchange = () => setT({ start: st.value });
        const dl = h('input.input', { type: 'date', value: tg.deadline, id: 'tg-dl' }); dl.onchange = () => setT({ deadline: dl.value });
        const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'], dayFull = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        const daysEl = h('div.days', dayNames.map((n, i) => h('button' + (tg.days.includes(i) ? '.on' : ''), { type: 'button', title: dayFull[i], 'aria-pressed': tg.days.includes(i) ? 'true' : 'false', onclick: () => setT({ days: tg.days.includes(i) ? tg.days.filter(x => x !== i) : [...tg.days, i].sort() }) }, n)));
        v.append(h('div.panel.glass', h('h3', 'Projeto de escrita'),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px' } },
            h('label.field', { for: 'tg-book' }, 'Meta do livro (palavras)', book),
            h('label.field', { for: 'tg-st' }, 'Começo do projeto', st),
            h('label.field', { for: 'tg-dl' }, 'Fim do projeto (prazo)', dl),
            h('label.field', { for: 'tg-sess' }, 'Meta mínima por dia', sess),
            h('div.field', h('span', { style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' } }, 'Dias em que escrevo'), daysEl)),
          perDay != null ? h('p', { style: { margin: '14px 0 0', color: 'var(--ink-2)' } }, 'Faltam ', h('b.num', T.fmt(remaining)), ' palavras em ', h('b.num', String(writeDays)), ' dias de escrita até ' + fmtDay(end, true) + ': ', h('b.num', T.fmt(perDay)), ' por dia de escrita. A conta se refaz sozinha a cada sessão.') : null));
        v.append(h('div.panel.glass', h('h3', 'Calendário · últimas 20 semanas'), heatmap(pid)));
        if (tallies.length) v.append(h('div.panel.glass', h('h3', 'Registros feitos à mão'), h('div.gl-tallies', tallies.slice().sort((a, b) => b.d.localeCompare(a.d)).slice(0, 30).map(t => h('div.gl-tally', h('span.num', fmtDay(parseD(t.d), true)), h('b.num', (t.n > 0 ? '+' : '') + T.fmt(t.n)), h('span.grow.muted', t.note || ''), T.iconBtn('trash', 'Apagar registro', () => { S().update(pid, { meta: { tallies: (S().get(pid).meta?.tallies || []).filter(x => x.id !== t.id) } }); render(); }, '.sm'))))));
        const sprints = (p.meta?.sprints || []).slice(-8).reverse();
        if (sprints.length) v.append(h('div.panel.glass', h('h3', 'Sprints recentes'), h('div.bars', sprints.map(s => h('div.bar-row', h('span.l', new Date(s.at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' · ' + s.min + ' min' + (s.min ? ' · ' + T.fmt(s.perHour ?? Math.round(s.words / s.min * 60)) + '/h' : '') + (s.pauses ? ' · ' + s.pauses + (s.pauses === 1 ? ' pausa' : ' pausas') : '')), h('span.b', h('i', { style: { width: Math.min(100, s.words / 15) + '%' } })), h('span.n', T.fmt(s.words)))))));
      }
      function goalCard(g, W, tg){
        const today = new Date();
        const menu = T.iconBtn('dots', 'Editar ou apagar meta', (e) => T.menuAt(e.currentTarget, [
          { label: 'Editar…', icon: 'edit', fn: () => goalModal(g) },
          { label: 'Apagar meta', icon: 'trash', fn: async () => { if (await T.confirm('Apagar a meta “' + g.name + '”?', 'As palavras escritas não mudam.', 'Apagar', true)) { S().update(pid, { meta: { goals: (S().get(pid).meta?.goals || []).filter(x => x.id !== g.id) } }); render(); } } },
        ]), '.sm');
        if (g.kind === 'habit') {
          const per = g.every === 'week' ? 7 : 1;
          const pStart = (d) => { if (per === 1) return new Date(d); const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
          const cur0 = pStart(today); const now = T.Goals.sum(W, cur0, today);
          let streak = 0; let p0 = addD(cur0, -per); const st = g.start ? parseD(g.start) : addD(today, -365);
          if (now >= g.amount) streak = 1;
          while (p0 >= pStart(st) && T.Goals.sum(W, p0, addD(p0, per - 1)) >= g.amount) { streak++; p0 = addD(p0, -per); }
          let met = 0, tot = 0; for (let q = pStart(st); q < cur0; q = addD(q, per)) { tot++; if (T.Goals.sum(W, q, addD(q, per - 1)) >= g.amount) met++; }
          return h('div.gl-goal.glass', h('div.row', h('span.chip', 'Hábito'), h('b.grow', g.name), menu),
            h('div.gl-big.num', T.fmt(now), h('small', ' / ' + T.fmt(g.amount) + (per === 1 ? ' hoje' : ' nesta semana'))),
            h('div.prog', h('i', { style: { width: Math.min(100, now / Math.max(1, g.amount) * 100) + '%' } })),
            h('div.s', (now >= g.amount ? 'Batida ✓ · ' : 'Faltam ' + T.fmt(g.amount - now) + ' · ') + 'sequência: ' + streak + (per === 1 ? (streak === 1 ? ' dia' : ' dias') : (streak === 1 ? ' semana' : ' semanas')) + (tot ? ' · cumprida em ' + Math.round(met / tot * 100) + '% ' + (per === 1 ? 'dos dias' : 'das semanas') : '')));
        }
        const a = g.start ? parseD(g.start) : today, b = g.end ? parseD(g.end) : today;
        const done = T.Goals.sum(W, a, today < b ? today : b);
        const left = Math.max(0, g.target - done);
        const ended = today > b, notYet = today < a;
        const wd = T.Goals.writeDays(today < a ? a : today, b, tg.days);
        const need = !ended && wd ? Math.ceil((left + (notYet ? 0 : (W[dkey(today)] || 0))) / wd) : null;
        const tot = Math.max(1, daysBetween(a, b) + 1), el = T.clamp(daysBetween(a, today) + 1, 0, tot); const exp = Math.round(g.target * el / tot);
        return h('div.gl-goal.glass', h('div.row', h('span.chip', 'Com prazo'), h('b.grow', g.name), menu),
          h('div.gl-big.num', T.fmt(done), h('small', ' / ' + T.fmt(g.target))),
          h('div.prog.gl-prog', h('i', { style: { width: Math.min(100, done / Math.max(1, g.target) * 100) + '%' } }), !ended && !notYet ? h('b.gl-mark', { style: { left: Math.min(100, exp / Math.max(1, g.target) * 100) + '%' }, title: 'Onde deveria estar hoje para chegar no prazo: ' + T.fmt(exp) }) : null),
          h('div.s', fmtDay(a) + ' → ' + fmtDay(b) + ' · ' + (done >= g.target ? 'Meta batida ✓' : ended ? 'Prazo encerrado · faltaram ' + T.fmt(left) : notYet ? 'começa em ' + daysBetween(today, a) + ' dias · ' + (need ? T.fmt(need) + ' por dia de escrita' : '') : 'faltam ' + T.fmt(left) + ' · ' + (need != null ? T.fmt(need) + ' por dia de escrita' : 'sem dias de escrita até o fim') + ' · ' + (done >= exp ? 'no ritmo ✓' : T.fmt(exp - done) + ' atrás do ritmo'))));
      }
      function goalModal(g){
        g = Object.assign({ id: T.id(), name: '', kind: 'target', target: 50000, start: T.today(), end: '', amount: 500, every: 'day' }, g || {});
        T.modal((box, close) => {
          const name = h('input.input', { value: g.name, placeholder: 'ex.: Rascunho em novembro, 500 por dia' });
          let kind = g.kind;
          const body = h('div.stack');
          const draw = () => {
            body.innerHTML = '';
            const kseg = h('div.seg', [['target', 'Com começo e fim'], ['habit', 'Hábito']].map(([k, l]) => { const b = h('button' + (kind === k ? '.on' : ''), { type: 'button', onclick: () => { kind = k; draw(); } }, l); return b; }));
            body.append(h('label.field', 'Nome da meta', name), h('div.field', h('span', 'Tipo'), kseg));
            if (kind === 'target') {
              const tgt = h('input.input.num', { type: 'number', min: 100, step: 500, value: g.target }); tgt.oninput = () => { g.target = +tgt.value; info(); };
              const a = h('input.input', { type: 'date', value: g.start }); a.oninput = () => { g.start = a.value; info(); };
              const b = h('input.input', { type: 'date', value: g.end }); b.oninput = () => { g.end = b.value; info(); };
              const msg = h('p.muted', { style: { margin: 0, fontSize: '13px' } });
              const info = () => { if (g.start && g.end && g.target) { const tgD = Object.assign({ days: [1, 2, 3, 4, 5] }, S().get(pid).meta?.targets || {}).days; const wd = T.Goals.writeDays(parseD(g.start), parseD(g.end), tgD); const nd = daysBetween(parseD(g.start), parseD(g.end)) + 1; msg.textContent = nd > 0 ? 'São ' + nd + ' dias (' + wd + ' de escrita): cerca de ' + T.fmt(Math.ceil(g.target / Math.max(1, wd))) + ' palavras por dia de escrita, ou ' + T.fmt(Math.ceil(g.target / nd)) + ' por dia corrido.' : 'O fim precisa vir depois do começo.'; } else msg.textContent = 'Escolha a quantidade e as datas.'; };
              if (g.isBook === undefined) g.isBook = !(S().get(pid).meta?.goals || []).some(x => x.isBook);
              const asBook = h('label.mp-chk', h('input', { type: 'checkbox', checked: !!g.isBook, onchange: (e) => { g.isBook = e.target.checked; } }), 'Esta é a meta total do livro (muda o “Livro” das Metas e do rodapé do editor)');
              body.append(h('label.field', 'Quantas palavras', tgt), h('div.row', { style: { gap: '12px' } }, h('label.field.grow', 'Começa em', a), h('label.field.grow', 'Termina em', b)), msg, asBook);
              info();
            } else {
              const amt = h('input.input.num', { type: 'number', min: 10, step: 50, value: g.amount }); amt.oninput = () => { g.amount = +amt.value; };
              const ev = h('div.seg', [['day', 'Por dia'], ['week', 'Por semana']].map(([k, l]) => h('button' + (g.every === k ? '.on' : ''), { type: 'button', onclick: () => { g.every = k; draw(); } }, l)));
              const a = h('input.input', { type: 'date', value: g.start }); a.oninput = () => { g.start = a.value; };
              body.append(h('div.row', { style: { gap: '12px' } }, h('label.field.grow', 'Quantas palavras', amt), h('div.field', h('span', 'A cada'), ev)), h('label.field', 'Contar a partir de', a));
            }
          };
          draw();
          box.append(h('h2', g.name ? 'Editar meta' : 'Nova meta'), h('p.sub', 'As palavras contam sozinhas enquanto você escreve no Entrelinhas (e entram também os registros feitos à mão).'), body,
            h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Cancelar'), h('button.btn.primary', { onclick: () => {
              g.name = name.value.trim() || (kind === 'habit' ? T.fmt(g.amount) + (g.every === 'week' ? ' por semana' : ' por dia') : T.fmt(g.target) + ' palavras'); g.kind = kind;
              if (kind === 'target' && (!g.start || !g.end || g.end < g.start)) { T.toast('Escolha datas de começo e fim (o fim depois do começo).'); return; }
              let list = (S().get(pid).meta?.goals || []).filter(x => x.id !== g.id);
              if (kind === 'target' && g.isBook) list = list.map(x => x.isBook ? Object.assign({}, x, { isBook: false }) : x); else g.isBook = false;
              list.push(g);
              const patch = { goals: list };
              if (g.isBook) { const cur = S().get(pid).meta?.targets || {}; patch.targets = Object.assign({}, cur, { book: g.target }, cur.deadline ? {} : { deadline: g.end, start: cur.start || g.start }); }
              S().update(pid, { meta: patch }); close(); render(); T.emit('targets-changed', { pid });
              if (g.isBook) T.toast('Meta do livro agora é ' + T.fmt(g.target) + ' palavras.');
            } }, icon('check'), 'Salvar meta')));
        });
      }
      function tallyModal(){
        T.modal((box, close) => {
          const d = h('input.input', { type: 'date', value: T.today(), max: T.today() });
          const n = h('input.input.num', { type: 'number', step: 50, placeholder: 'ex.: 800' });
          const note = h('input.input', { placeholder: 'ex.: escrevi no caderno, no celular' });
          box.append(h('h2', 'Registrar palavras'), h('p.sub', 'Para contar o que você escreveu fora do Entrelinhas (caderno, celular…). Entra nos gráficos, nas sequências e nas metas. Use um número negativo para corrigir.'),
            h('div.stack', h('div.row', { style: { gap: '12px' } }, h('label.field.grow', 'Dia', d), h('label.field.grow', 'Palavras', n)), h('label.field', 'Nota (opcional)', note)),
            h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Cancelar'), h('button.btn.primary', { onclick: () => {
              const k = +n.value; if (!k || !d.value) { T.toast('Escreva quantas palavras.'); return; }
              const list = (S().get(pid).meta?.tallies || []).slice(); list.push({ id: T.id(), d: d.value, n: k, note: note.value.trim() });
              S().update(pid, { meta: { tallies: list } }); close(); render(); T.emit('session', { pid });
            } }, icon('plus'), 'Registrar')));
          setTimeout(() => n.focus(), 30);
        });
      }
      render();
      const off = T.on('session', (e) => { if (e.pid === pid && !v.contains(document.activeElement)) render(); });
      return { destroy(){ off(); } };
    }
  };

  /* ---------- Estatísticas ---------- */
  const STOP = new Set('a o e é de da do das dos que em um uma uns umas para por com não se na no nas nos as os ao aos à às mais mas como ela ele elas eles eu me meu minha seu sua seus suas lhe isso isto aquilo foi era ser tem ter há já ou quando também só pelo pela pelos pelas então te tu você vocês nós num numa dela dele delas deles esse essa este esta estava muito sem sobre até onde entre depois porque qual quem mesmo ainda bem tão nem lá aqui ali vai vou sim'.split(' '));
  const CRUTCH = ['então', 'apenas', 'muito', 'realmente', 'simplesmente', 'de repente', 'começou a', 'olhou', 'suspirou', 'sorriu', 'acenou', 'um pouco', 'meio que', 'parecia', 'sentiu', 'pensou', 'basicamente', 'literalmente'];
  T.Views.stats = {
    icon: 'chart', title: () => 'Estatísticas',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad'); root.appendChild(v);
      function render(){
        const p = S().get(pid); const flat = T.MS.flat(pid);
        let words = 0, chars = 0, dlg = 0; const freq = new Map(); const crutch = new Map(); const byPov = new Map();
        flat.forEach(it => {
          const text = T.htmlToText(it.body); if (!text) return;
          const w = T.countWords(text); words += w; chars += text.replace(/\s/g, '').length;
          text.split('\n').forEach(par => { const t = par.trim(); if (/^[—–\-“"«]/.test(t)) dlg += T.countWords(t); });
          if (it.meta?.pov) byPov.set(it.meta.pov, (byPov.get(it.meta.pov) || 0) + w);
          T.tokens(text).forEach(tk => { if (tk.length > 2 && !STOP.has(tk)) freq.set(tk, (freq.get(tk) || 0) + 1); });
          const low = ' ' + text.toLowerCase() + ' ';
          CRUTCH.forEach(c => { const re = new RegExp('(?<![\\p{L}])' + c + '(?![\\p{L}])', 'gu'); const m = low.match(re); if (m) crutch.set(c, (crutch.get(c) || 0) + m.length); });
        });
        const cfg = Object.assign({ trim: '14x21' }, p.meta?.book || {}); const tr = T.TRIMS[cfg.trim] || T.TRIMS['14x21'];
        const pages = Math.ceil(words / tr.wpp);
        v.innerHTML = '';
        v.append(h('div.view-h', h('div.grow', h('h1', 'Estatísticas'), h('p', 'Calculadas a partir do manuscrito inteiro, sempre atualizadas.')), h('button.btn', { onclick: render }, icon('history'), 'Recalcular')));
        v.append(h('div.tiles',
          h('div.tile.glass', h('div.k', 'Palavras'), h('div.v.num', T.fmt(words)), h('div.s', T.fmt(chars) + ' caracteres sem espaço')),
          h('div.tile.glass', h('div.k', 'Páginas estimadas'), h('div.v.num', T.fmt(pages)), h('div.s', 'em ' + tr.name + ' · ≈' + tr.wpp + ' palavras por página')),
          h('div.tile.glass', h('div.k', 'Tempo de leitura'), h('div.v.num', words < 200 * 60 ? Math.ceil(words / 200) + ' min' : (words / 200 / 60).toFixed(1).replace('.', ',') + ' h'), h('div.s', 'a 200 palavras por minuto')),
          h('div.tile.glass', h('div.k', 'Diálogo'), h('div.v.num', (words ? Math.round(dlg / words * 100) : 0) + '%'), h('div.s', 'do texto está em falas (travessão ou aspas)')),
        ));
        const chs = flat.filter(i => i.type === 'chapter');
        const chW = chs.map(c => ({ t: c.title || 'Sem título', w: T.MS.docs(c).reduce((a, d) => a + (d.meta?.words ?? T.words(d.body)), 0) }));
        const maxC = Math.max(1, ...chW.map(c => c.w));
        v.append(h('div.panel.glass', h('h3', 'Palavras por capítulo'), chW.length ? h('div.bars', chW.map(c => h('div.bar-row', h('span.l', c.t), h('span.b', h('i', { style: { width: c.w / maxC * 100 + '%' } })), h('span.n', T.fmt(c.w))))) : h('p.muted', 'Crie capítulos no manuscrito para ver esta lista.')));
        const povs = [...byPov.entries()].sort((a, b) => b[1] - a[1]); const maxP = Math.max(1, ...povs.map(x => x[1]));
        v.append(h('div.panel.glass', h('h3', 'Palavras por ponto de vista'), povs.length ? h('div.bars', povs.map(([n, w]) => h('div.bar-row', h('span.l', { style: { color: `hsl(${povHue(n)} 60% 40%)`, fontWeight: 700 } }, n), h('span.b', h('i', { style: { width: w / maxP * 100 + '%', background: `hsl(${povHue(n)} 70% 55%)` } })), h('span.n', T.fmt(w) + ' · ' + Math.round(w / Math.max(1, words) * 100) + '%')))) : h('p.muted', 'Marque o ponto de vista de cada cena na ficha da cena (botão ⓘ no editor) ou no quadro de fichas.')));
        const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
        v.append(h('div.panel.glass', h('h3', 'Palavras que você mais usa'), top.length ? h('div.freq', top.map(([w, n]) => h('span', w, h('b.num', String(n))))) : h('p.muted', 'Ainda não há texto suficiente.')));
        const cr = [...crutch.entries()].sort((a, b) => b[1] - a[1]);
        v.append(h('div.panel.glass', h('h3', 'Palavras-muleta'), h('p.muted', { style: { marginTop: 0 } }, 'Palavras e expressões que costumam se repetir sem a gente perceber. Use Localizar para encontrar cada uma.'),
          cr.length ? h('div.freq', cr.map(([w, n]) => h('span', { style: { cursor: 'pointer' }, onclick: () => T.Shell.open({ kind: 'find', ref: 'find', q: w }) }, w, h('b.num', String(n))))) : h('p.muted', 'Nenhuma encontrada.')));
      }
      render();
      return { destroy(){} };
    }
  };

  /* ---------- Localizar e substituir ---------- */
  T.Views.find = {
    icon: 'search', title: () => 'Localizar e substituir',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad'); root.appendChild(v);
      const q = h('input.input', { placeholder: 'Procurar no livro inteiro…', value: tab.q || '', id: 'find-q-' + tab.id });
      const rep = h('input.input', { placeholder: 'Substituir por…', id: 'find-r-' + tab.id });
      const cs = h('input', { type: 'checkbox', id: 'find-cs-' + tab.id }), ww = h('input', { type: 'checkbox', id: 'find-ww-' + tab.id }), titles = h('input', { type: 'checkbox', id: 'find-t-' + tab.id, checked: true });
      const res = h('div.find-res');
      v.append(h('div.view-h', h('div.grow', h('h1', 'Localizar e substituir'), h('p', 'Procura em todos os capítulos, cenas, pesquisas e ideias deste projeto.'))),
        h('div.glass.panel', { style: { marginTop: 0 } }, h('div.stack', h('div.row', q, h('button.btn.primary', { onclick: run }, icon('search'), 'Procurar')),
          h('div.row', rep, h('button.btn', { onclick: replaceAll }, icon('replace'), 'Substituir tudo')),
          h('div.row', { style: { flexWrap: 'wrap', fontSize: '13px' } },
            h('label.row', { for: cs.id, style: { gap: '6px' } }, cs, 'Diferenciar maiúsculas'),
            h('label.row', { for: ww.id, style: { gap: '6px' } }, ww, 'Só palavra inteira'),
            h('label.row', { for: titles.id, style: { gap: '6px' } }, titles, 'Incluir títulos')))),
        res);
      q.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
      function rx(){
        const s = q.value; if (!s) return null;
        const e = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(ww.checked ? '(?<![\\p{L}\\p{N}])' + e + '(?![\\p{L}\\p{N}])' : e, 'gu' + (cs.checked ? '' : 'i'));
      }
      const pool = () => S().all(pid).filter(i => ['part', 'chapter', 'scene', 'doc', 'idea', 'page'].includes(i.type));
      function run(){
        res.innerHTML = ''; const re = rx(); if (!re) return;
        let total = 0;
        pool().forEach(it => {
          const text = T.htmlToText(it.body); const hits = [];
          let m; re.lastIndex = 0;
          while ((m = re.exec(text)) && hits.length < 50) { hits.push([m.index, m[0].length]); if (!m[0].length) re.lastIndex++; }
          const tHit = titles.checked && it.title && (re.lastIndex = 0, re.test(it.title));
          if (!hits.length && !tHit) return;
          total += hits.length + (tHit ? 1 : 0);
          res.appendChild(h('div.find-doc.glass', h('div.row', icon(it.type === 'idea' ? 'idea' : it.type === 'page' ? T.tplOf(it).icon : it.type === 'scene' ? 'scene' : 'chapter'), h('b.grow', it.title || (it.type === 'idea' ? 'Ideia' : 'Sem título')), h('span.chip.gray.num', hits.length + (tHit ? ' + título' : ''))),
            hits.slice(0, 8).map(([i, l]) => h('div.find-hit', { onclick: () => T.Shell.open({ kind: it.type === 'idea' ? 'ideas' : it.type === 'page' ? 'page' : 'doc', ref: it.type === 'idea' ? 'ideas' : it.id, find: text.substr(i, l) }) },
              '…', text.slice(Math.max(0, i - 50), i), h('em', text.substr(i, l)), text.slice(i + l, i + l + 60), '…'))));
        });
        res.prepend(h('p.muted', total ? T.fmt(total) + ' ocorrências encontradas.' : 'Nada encontrado.'));
      }
      async function replaceAll(){
        const re = rx(); if (!re) return;
        const items = pool(); let n = 0;
        const plan = items.map(it => { const d = document.createElement('div'); d.innerHTML = it.body || ''; let c = 0; const w = document.createTreeWalker(d, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { re.lastIndex = 0; const m = t.textContent.match(re); if (m) c += m.length; } re.lastIndex = 0; const tc = titles.checked && it.title ? (it.title.match(re) || []).length : 0; return { it, d, c, tc }; }).filter(x => x.c || x.tc);
        n = plan.reduce((a, x) => a + x.c + x.tc, 0);
        if (!n) { T.toast('Nada para substituir.'); return; }
        if (!await T.confirm('Substituir ' + T.fmt(n) + ' ocorrências?', '“' + q.value + '” vira “' + rep.value + '” em ' + plan.length + ' textos. Antes, salvo uma versão de cada texto alterado.', 'Substituir tudo')) return;
        T.Shell.flushEditors();
        plan.forEach(({ it, d, c, tc }) => {
          if (c) {
            S().create({ pid, type: 'snapshot', area: 'snap', parent: it.id, title: 'Antes de substituir “' + q.value + '”', body: it.body || '' });
            const w = document.createTreeWalker(d, NodeFilter.SHOW_TEXT); let t; const nodes = []; while ((t = w.nextNode())) nodes.push(t);
            nodes.forEach(t => { re.lastIndex = 0; t.textContent = t.textContent.replace(re, rep.value); });
            S().update(it.id, { body: d.innerHTML, meta: { words: T.words(d.innerHTML) } });
          }
          if (tc) { re.lastIndex = 0; S().update(it.id, { title: it.title.replace(re, rep.value) }); }
        });
        T.emit('tree-changed'); T.toast(T.fmt(n) + ' substituições feitas.'); run();
      }
      if (tab.q) setTimeout(run, 30);
      return { destroy(){}, focus(){ q.focus(); } };
    }
  };

  /* ---------- Ideias rápidas, com pastas ---------- */
  const HUES = [350, 22, 45, 140, 175, 205, 250, 290];
  const IF = T.Ideas = {
    folders(pid){
      const p = S().get(pid); if (!p) return [];
      if (!Array.isArray(p.meta?.ideaFolders)) {
        const def = [['Nomes', 22], ['Cenas', 205], ['Personagens', 290], ['Mundo', 140], ['Falas e diálogos', 45]].map(([name, hue]) => ({ id: T.id(), name, hue }));
        S().update(pid, { meta: { ideaFolders: def } }, { silent: true }); return def;
      }
      return p.meta.ideaFolders;
    },
    save(pid, list){ S().update(pid, { meta: { ideaFolders: list } }); T.emit('idea-folders', pid); },
    async add(pid){
      const name = await T.ask('Nova pasta de ideias', { placeholder: 'ex.: Títulos, Reviravoltas, Magia', ok: 'Criar pasta' });
      if (!name || !name.trim()) return null;
      const list = IF.folders(pid).slice(); const f = { id: T.id(), name: name.trim(), hue: HUES[list.length % HUES.length] };
      list.push(f); IF.save(pid, list); return f;
    },
    of(it){ return it.meta?.folder || ''; },
    create(pid, text, folder){
      return S().create({ pid, type: 'idea', area: 'ideas', title: text.slice(0, 60), body: '<p>' + T.esc(text).replace(/\n/g, '</p><p>') + '</p>', meta: { folder: folder || '' } });
    },
    // fileira de pastas para escolher onde a ideia vai
    picker(pid, cur, onPick){
      const row = h('div.if-pick', { role: 'radiogroup', 'aria-label': 'Pasta da ideia' });
      const draw = () => {
        row.innerHTML = '';
        const mk = (id, name, hue) => { const b = h('button.if-chip' + (cur === id ? '.on' : ''), { type: 'button', role: 'radio', 'aria-checked': String(cur === id), style: hue != null ? { '--fh': hue } : null, onclick: () => { cur = id; onPick(id); draw(); } }, hue != null ? h('i') : null, name); return b; };
        row.append(mk('', 'Sem pasta', null), ...IF.folders(pid).map(f => mk(f.id, f.name, f.hue)),
          h('button.if-chip.add', { type: 'button', title: 'Criar uma pasta nova', onclick: async () => { const f = await IF.add(pid); if (f) { cur = f.id; onPick(f.id); draw(); } } }, '+ pasta'));
      };
      draw(); return row;
    },
  };
  T.Views.ideas = {
    icon: 'idea', title: () => 'Ideias',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad'); root.appendChild(v);
      let filt = tab.folder ?? 'all';
      let newFolder = null;
      function render(){
        const folders = IF.folders(pid);
        const fmap = new Map(folders.map(f => [f.id, f]));
        const all = S().all(pid).filter(i => i.type === 'idea').sort((a, b) => b.created - a.created);
        const fo = (it) => fmap.has(IF.of(it)) ? IF.of(it) : '';
        if (filt !== 'all' && filt !== '' && !fmap.has(filt)) filt = 'all';
        const list = filt === 'all' ? all : all.filter(it => fo(it) === filt);
        v.innerHTML = '';
        // barra de pastas (soltar uma ideia numa pasta move a ideia)
        const chip = (id, name, hue, n) => {
          const b = h('button.if-chip' + (filt === id ? '.on' : ''), { type: 'button', style: hue != null ? { '--fh': hue } : null, onclick: () => { filt = id; tab.folder = id; T.emit('tab-changed', tab); render(); } }, hue != null ? h('i') : null, name, h('span.num.if-n', String(n)));
          if (id !== 'all') {
            b.addEventListener('dragover', (e) => { if (drag) { e.preventDefault(); b.classList.add('drop'); } });
            b.addEventListener('dragleave', () => b.classList.remove('drop'));
            b.addEventListener('drop', (e) => { e.preventDefault(); b.classList.remove('drop'); if (drag) { S().update(drag, { meta: { folder: id } }); drag = null; render(); T.toast('Ideia movida para “' + name + '”.'); } });
          }
          if (fmap.has(id)) b.oncontextmenu = (e) => { e.preventDefault(); folderMenu(fmap.get(id), b); };
          return b;
        };
        const bar = h('div.if-bar',
          chip('all', 'Todas', null, all.length),
          ...folders.map(f => chip(f.id, f.name, f.hue, all.filter(it => fo(it) === f.id).length)),
          chip('', 'Sem pasta', null, all.filter(it => !fo(it)).length),
          h('button.if-chip.add', { type: 'button', onclick: async () => { const f = await IF.add(pid); if (f) { filt = f.id; render(); } } }, '+ Nova pasta'),
          fmap.has(filt) ? h('button.btn.sm', { type: 'button', title: 'Renomear, mudar a cor ou apagar esta pasta', onclick: (e) => folderMenu(fmap.get(filt), e.currentTarget) }, icon('dots'), 'Pasta') : null);
        const ta = h('textarea.textarea', { placeholder: 'Uma ideia solta… (Ctrl+Enter salva)', style: { fontFamily: 'var(--font-write)', fontSize: '15px' }, 'aria-label': 'Nova ideia' });
        if (newFolder === null || (newFolder && !fmap.has(newFolder))) newFolder = filt === 'all' ? '' : filt;
        const add = () => { const t = ta.value.trim(); if (!t) return; IF.create(pid, t, newFolder); ta.value = ''; render(); T.emit('tree-changed'); };
        ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) add(); });
        v.append(h('div.view-h', h('div.grow', h('h1', 'Ideias'), h('p', 'Separe as ideias em pastas, como playlists: nomes, cenas, mundo… Anote sem sair do capítulo pelo botão ✦ Ideia, no canto da tela, já escolhendo a pasta. Arraste uma ideia até uma pasta para mudá-la de lugar.'))),
          bar,
          h('div.glass.panel', { style: { marginTop: 0, marginBottom: '16px' } }, ta,
            h('div.row', { style: { marginTop: '10px', gap: '10px', alignItems: 'flex-start' } }, h('span.muted', { style: { fontSize: '12px', paddingTop: '6px' } }, 'Pasta:'), h('div.grow', IF.picker(pid, newFolder, (id) => { newFolder = id; })),
              h('button.btn.primary', { onclick: add }, icon('plus'), 'Guardar ideia'))));
        const card = (it) => {
          const p = h('p', T.htmlToText(it.body));
          p.contentEditable = 'true'; p.onblur = () => { const t = p.textContent.trim(); S().update(it.id, { title: t.slice(0, 60), body: '<p>' + T.esc(t).replace(/\n/g, '</p><p>') + '</p>' }); };
          const f = fmap.get(fo(it));
          const el = h('div.idea.glass', { draggable: 'true', style: f ? { '--fh': f.hue } : null }, p, h('div.row.idea-foot',
            h('button.if-tag' + (f ? '' : '.none'), { type: 'button', title: 'Mudar de pasta', onclick: (e) => T.menuAt(e.currentTarget, [{ head: 'Mover para a pasta' }, { label: (f ? '' : '● ') + 'Sem pasta', fn: () => { S().update(it.id, { meta: { folder: '' } }); render(); } }, ...folders.map(x => ({ label: (f && f.id === x.id ? '● ' : '') + x.name, fn: () => { S().update(it.id, { meta: { folder: x.id } }); render(); } })), '-', { label: 'Nova pasta…', icon: 'plus', fn: async () => { const nf = await IF.add(pid); if (nf) { S().update(it.id, { meta: { folder: nf.id } }); render(); } } }]) }, f ? h('i') : null, f ? f.name : 'Sem pasta', h('span.caret', '▾')),
            h('span.idea-time', T.relTime(it.created)), h('span.grow'),
            h('button.btn.sm', { onclick: (e) => toScene(it, e.currentTarget) }, icon('scene'), 'Virar cena'),
            h('button.btn.sm', { onclick: () => { S().update(it.id, { type: 'doc', area: 'res', parent: null }); T.emit('tree-changed'); render(); T.toast('Agora é um documento de pesquisa.'); } }, icon('doc'), 'Pesquisa'),
            T.iconBtn('trash', 'Apagar ideia', async () => { if (await T.confirm('Apagar esta ideia?', null, 'Apagar', true)) { S().remove(it.id); render(); T.emit('tree-changed'); } }, '.sm')));
          el.addEventListener('dragstart', (e) => { if (document.activeElement === p) { e.preventDefault(); return; } drag = it.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', it.id); });
          el.addEventListener('dragend', () => { drag = null; });
          return el;
        };
        if (!list.length) { v.appendChild(h('p.muted', filt === 'all' ? 'Nenhuma ideia guardada ainda.' : 'Nenhuma ideia nesta pasta ainda.')); return; }
        if (filt === 'all') {
          // agrupadas por pasta
          [...folders.map(f => [f.id, f.name, f.hue]), ['', 'Sem pasta', null]].forEach(([id, name, hue]) => {
            const items = list.filter(it => fo(it) === id); if (!items.length) return;
            v.append(h('h3.if-h', { style: hue != null ? { '--fh': hue } : null }, hue != null ? h('i') : null, name, h('span.num.muted', ' · ' + items.length)), h('div.ideas', items.map(card)));
          });
        } else v.appendChild(h('div.ideas', list.map(card)));
      }
      let drag = null;
      function folderMenu(f, btn){
        T.menuAt(btn, [
          { head: f.name },
          { label: 'Renomear…', icon: 'edit', fn: async () => { const n = await T.ask('Nome da pasta', { value: f.name, ok: 'Salvar' }); if (n && n.trim()) { IF.save(pid, IF.folders(pid).map(x => x.id === f.id ? Object.assign({}, x, { name: n.trim() }) : x)); render(); } } },
          { label: 'Mudar a cor', icon: 'spark', fn: () => { const i = HUES.indexOf(f.hue); IF.save(pid, IF.folders(pid).map(x => x.id === f.id ? Object.assign({}, x, { hue: HUES[(i + 1) % HUES.length] }) : x)); render(); } },
          '-',
          { label: 'Apagar a pasta (as ideias ficam, em “Sem pasta”)', icon: 'trash', fn: async () => {
            if (!await T.confirm('Apagar a pasta “' + f.name + '”?', 'As ideias dela não são apagadas: passam para “Sem pasta”.', 'Apagar pasta', true)) return;
            S().all(pid).filter(i => i.type === 'idea' && IF.of(i) === f.id).forEach(i => S().update(i.id, { meta: { folder: '' } }));
            IF.save(pid, IF.folders(pid).filter(x => x.id !== f.id)); if (filt === f.id) filt = 'all'; render();
          } },
        ]);
      }
      function toScene(it, btn){
        const chs = T.MS.flat(pid).filter(i => i.type === 'chapter');
        if (!chs.length) { T.toast('Crie um capítulo primeiro.'); return; }
        T.menuAt(btn, [{ head: 'Colocar em qual capítulo?' }, ...chs.slice(0, 30).map(c => ({ label: c.title || 'Sem título', icon: 'chapter', fn: () => {
          S().update(it.id, { type: 'scene', area: 'ms', parent: c.id, order: Date.now(), title: it.title.slice(0, 40), meta: { words: T.words(it.body) } });
          T.emit('tree-changed'); render(); T.toast('Ideia virou cena em “' + c.title + '”.', { action: { label: 'Abrir', fn: () => T.Shell.open({ kind: 'doc', ref: it.id }) } });
        } }))]);
      }
      render();
      const off = T.on('tree-changed', () => { if (!v.contains(document.activeElement)) render(); });
      const off2 = T.on('idea-folders', (p) => { if (p === pid && !v.contains(document.activeElement)) render(); });
      return { destroy(){ off(); off2(); } };
    }
  };

  /* ---------- Próximas etapas ---------- */
  T.MODULES = [
    { id: 'wiki', name: 'Wiki do mundo', icon: 'book', stage: 2, items: ['Páginas para personagens, lugares, facções, criaturas e itens, com capa larga e caixa de informações', 'Modelos prontos por tipo de página e links com [[nome]]', 'Seção “Explore” com cartões das páginas relacionadas', 'Blocos de spoiler e índice por categoria'] },
    { id: 'tree', name: 'Árvore de relações', icon: 'tree', stage: 2, items: ['Cartões com retrato ligados por linhas', 'Tipos de relação abertos, com cor e estilo de linha próprios', 'Linhas com direção, notas e filtros'] },
    { id: 'web', name: 'Teia da história', icon: 'web', stage: 2, items: ['Constelação animada de cenas, tramas, pistas e revelações', 'Ligações de causa, pista → revelação, espelho e flashback', 'Reprodução da teia crescendo capítulo por capítulo', 'Detector de pontas soltas'] },
    { id: 'dict', name: 'Dicionário e línguas', icon: 'dict', stage: 2, items: ['Várias línguas por projeto, com alfabeto desenhado à mão', 'Verbetes com pronúncia, classe, exemplos e origem', 'Palavras do dicionário sublinhadas no texto, com balão', 'Gerador de nomes com os sons da sua língua'] },
    { id: 'cal', name: 'Calendário', icon: 'cal', stage: 3, items: ['Meses, semanas, horas e luas inventados', 'Faixas para eras e festivais, com formatos e padrões', 'Visões de ano, mês e dia', 'Calculadora de idade dos personagens'] },
    { id: 'timeline', name: 'Timeline com eras', icon: 'timeline', stage: 3, items: ['Linha do tempo com zoom e eventos coloridos', 'Eras como faixas', 'Ligada ao calendário, aos personagens e aos capítulos'] },
    { id: 'maps', name: 'Mapas', icon: 'map', stage: 4, items: ['Terreno 3D esculpido com pincéis e biomas', 'Mapas de cidades com sua ilustração', 'Pins, zonas, rios, estradas e nomes de mapa antigo', 'Trilhas das jornadas, com reprodução animada'] },
    { id: 'mood', name: 'Moodboards', icon: 'moodboard', stage: 5, items: ['Tela livre de colagem com imagens, notas e cores', 'Paleta extraída das imagens', 'Usar o moodboard como fundo de escrita'] },
    { id: 'radio', name: 'Rádio literária', icon: 'radio', stage: 5, items: ['Rádio antigo com dial, FM (música) e AM (sons ambientes)', 'Música gerada ao vivo para cada gênero literário', 'Estações com suas próprias músicas enviadas', 'A cor da plataforma muda com a estação'] },
    { id: 'mockup', name: 'Mockup 3D do livro', icon: 'cube', stage: 5, items: ['Livro em 3D que gira 360°', 'Capa, lombada e contracapa', 'Grossura calculada pela contagem de palavras'] },
    { id: 'compile', name: 'Compilar o livro', icon: 'download', stage: 5, items: ['PDF diagramado, ePub e manuscrito em .docx', 'Escolher o que entra, folha de rosto e sumário'] },
    { id: 'tension', name: 'Curva de tensão', icon: 'chart', stage: 5, items: ['Gráfico do ritmo do livro a partir da tensão de cada cena (já dá para marcar a tensão na ficha da cena)'] },
  ];
  T.Views.soon = {
    icon: 'spark', title: (tab) => T.MODULES.find(m => m.id === tab.ref)?.name || 'Em breve',
    mount(root, tab){
      const m = T.MODULES.find(x => x.id === tab.ref) || T.MODULES[0];
      const v = h('div.view.view-pad', h('div.soon-wrap.glass', h('span.chip.soon', 'Etapa ' + m.stage + ' · em construção'), h('h1', { style: { marginTop: '12px' } }, m.name),
        h('p', { style: { color: 'var(--ink-2)' } }, 'Esta parte entra na etapa ' + m.stage + '. Vai ter:'), h('ul', m.items.map(i => h('li', i)))));
      root.appendChild(v); return { destroy(){} };
    }
  };
})(window.T);
