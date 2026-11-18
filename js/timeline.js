/* Tinteiro — timeline: eventos do calendário numa linha com zoom, eras como faixas */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;

  T.Views.timeline = {
    icon: 'timeline', title: () => 'Timeline',
    mount(root, tab, ctx){
      const pid = ctx.pid; const Cal = T.Cal;
      let c = Cal.cfg(pid);
      let k = tab.k || 4, x0 = tab.x0 ?? null; // px por dia, dia absoluto na borda esquerda
      let who = tab.who || '', hidden = new Set(tab.hiddenCats || []), showScenes = tab.scenes !== false;
      const wrap = h('div.tline'); root.appendChild(wrap);
      const bar = h('div.rel-bar.glass.lg.hscroll');
      const stage = h('div.tl-stage');
      const axis = h('div.tl-axis');
      const evLayer = h('div.tl-evs'), eraLayer = h('div.tl-eras'), scLayer = h('div.tl-scenes'), tickLayer = h('div.tl-ticks');
      stage.append(eraLayer, tickLayer, axis, scLayer, evLayer);
      const card = h('div.tl-card.glass.glass-strong.hidden');
      wrap.append(stage, bar, card);

      const yL = () => Cal.yearLen(c);
      const W = () => wrap.clientWidth || 800;
      const axisY = () => Math.round((wrap.clientHeight || 600) * .58);
      const xOf = (a) => (a - x0) * k;
      const aOf = (x) => x / k + x0;

      function data(){
        let evs = Cal.events(pid).filter(e => !hidden.has(e.meta.cat || 'outro'));
        if (who) { const p = S().get(who); evs = evs.filter(e => (e.meta.chars || []).includes(who)); if (p?.meta?.birth) evs = [{ id: '_birth', title: 'Nasce ' + p.title, meta: { date: p.meta.birth, cat: 'nascimento' }, virtual: true }, ...evs]; }
        const scenes = showScenes ? T.MS.flat(pid).filter(i => i.meta?.date && (!who || i.meta?.pov === S().get(who)?.title || (i.body || '').includes(S().get(who)?.title || '\u0000'))) : [];
        return { evs, scenes, eras: c.banners || [] };
      }
      function fit(){
        const { evs, scenes, eras } = data();
        const pts = [...evs.map(e => Cal.abs(c, e.meta.date)), ...evs.filter(e => e.meta.end).map(e => Cal.abs(c, e.meta.end)), ...scenes.map(s => Cal.abs(c, s.meta.date)), ...eras.flatMap(b => [Cal.abs(c, b.start), Cal.abs(c, b.end || b.start)])];
        if (!pts.length) { const a = Cal.abs(c, c.today || c.cursor || { y: 1, m: 0, d: 1 }); x0 = a - 30; k = W() / 400; return; }
        let lo = Math.min(...pts), hi = Math.max(...pts); if (hi - lo < 10) { lo -= 15; hi += 15; }
        const pad = (hi - lo) * .08;
        k = (W() - 60) / (hi - lo + 2 * pad); x0 = lo - pad - 30 / k;
      }
      function persist(){ Object.assign(tab, { k, x0, who, hiddenCats: [...hidden], scenes: showScenes }); T.emit('tab-changed', tab); }
      const persistD = T.debounce(persist, 600);

      /* ----- marcas do eixo ----- */
      const nice = (v, steps) => steps.find(s => s >= v) || steps[steps.length - 1];
      function ticks(){
        tickLayer.innerHTML = '';
        const target = 130 / k; // dias por marca
        const L = yL(); const left = x0, right = aOf(W());
        const out = [];
        if (target >= L * .7) {
          const yrs = nice(target / L, [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 50000, 100000]);
          let y0 = Cal.fromAbs(c, Math.floor(left)).y; y0 = Math.floor(y0 / yrs) * yrs; if (y0 === 0) y0 = 1;
          for (let y = y0, guard = 0; guard < 400; guard++) {
            const yy = y === 0 ? 1 : y; const a = Cal.abs(c, { y: yy, m: 0, d: 1 }); if (a > right) break;
            if (a >= left - L) out.push([a, Cal.yearLabel(c, yy), true]);
            y = yy + yrs; if (y === 0) y = 1; if (yy < 0 && y > 0 && yrs > 1) y = Math.max(1, y - 1);
          }
        } else if (target >= 18) {
          const step = target > L / 4 ? 3 : target > L / 8 ? 2 : 1;
          let cur = Cal.fromAbs(c, Math.floor(left)); cur = { y: cur.y, m: cur.m, d: 1 };
          for (let guard = 0; guard < 500; guard++) {
            const a = Cal.abs(c, cur); if (a > right) break;
            if (cur.m % step === 0) out.push([a, (c.months[cur.m]?.name || '').slice(0, 3) + (cur.m === 0 ? ' · ' + Cal.yearLabel(c, cur.y) : ''), cur.m === 0]);
            cur.m++; if (cur.m >= c.months.length) { cur.m = 0; cur.y = cur.y + 1 === 0 ? 1 : cur.y + 1; }
          }
        } else {
          const step = nice(target, [1, 2, 5, 7, 10, 15]);
          for (let a = Math.ceil(left / step) * step; a <= right; a += step) { const dt = Cal.fromAbs(c, a); out.push([a, dt.d + ' ' + (c.months[dt.m]?.name || '').slice(0, 3), dt.d === 1]); }
        }
        out.forEach(([a, label, major]) => {
          const x = xOf(a); if (x < -40 || x > W() + 40) return;
          tickLayer.appendChild(h('div.tl-tick' + (major ? '.major' : ''), { style: { left: x + 'px', top: (axisY() - 6) + 'px' } }, h('span', label)));
        });
      }

      /* ----- desenho ----- */
      function render(){
        c = Cal.cfg(pid);
        if (x0 == null) fit();
        const ay = axisY();
        axis.style.top = ay + 'px';
        ticks();
        const { evs, scenes, eras } = data();
        // eras (abaixo do eixo)
        eraLayer.innerHTML = '';
        const eraLanes = [];
        eras.slice().sort((a, b) => Cal.abs(c, a.start) - Cal.abs(c, b.start)).forEach(b => {
          const s = Cal.abs(c, b.start), e = Cal.abs(c, b.end || b.start) + 1;
          let lane = eraLanes.findIndex(end => end <= s); if (lane < 0) { lane = eraLanes.length; eraLanes.push(e); } else eraLanes[lane] = e;
          const x1 = xOf(s), x2 = xOf(e); if (x2 < 0 || x1 > W()) return;
          eraLayer.appendChild(h('div.tl-era.sh-' + (b.shape || 'plain'), { title: b.name + ' · ' + Cal.fmt(c, b.start) + (b.end ? ' – ' + Cal.fmt(c, b.end) : ''), style: { left: Math.max(-10, x1) + 'px', width: Math.max(6, Math.min(W() + 10, x2) - Math.max(-10, x1)) + 'px', top: (ay + 42 + lane * 34) + 'px', background: Cal.bannerBg(b) } }, h('span', b.name)));
        });
        // cenas do livro com data
        scLayer.innerHTML = '';
        scenes.forEach(sc => {
          const x = xOf(Cal.abs(c, sc.meta.date)); if (x < -20 || x > W() + 20) return;
          scLayer.appendChild(h('button.tl-scene', { type: 'button', title: 'Cena: ' + (sc.title || '') + ' · ' + Cal.fmt(c, sc.meta.date), style: { left: x + 'px', top: (ay + 14) + 'px' }, onclick: () => T.Shell.open({ kind: 'doc', ref: sc.id }, { side: true }) }));
        });
        // eventos (acima do eixo, em pistas para não se sobreporem)
        evLayer.innerHTML = '';
        const lanes = [];
        const items = evs.map(e => ({ e, a: Cal.abs(c, e.meta.date), b: e.meta.end ? Cal.abs(c, e.meta.end) + 1 : null })).sort((p, q) => p.a - q.a);
        items.forEach(({ e, a, b }) => {
          const x = xOf(a); const wPill = Math.min(220, 34 + (e.title || '').length * 6.6);
          const xEnd = Math.max(x + wPill, b ? xOf(b) : 0);
          if (xEnd < -10 || x > W() + 10) return;
          let lane = lanes.findIndex(end => end < x - 6); if (lane < 0) { lane = lanes.length; lanes.push(xEnd); } else lanes[lane] = xEnd;
          const top = ay - 44 - lane * 34; if (top < 64) return;
          const ct = Cal.evCat(c, e);
          evLayer.appendChild(h('div.tl-stem', { style: { left: x + 'px', top: (top + 26) + 'px', height: (ay - top - 26) + 'px', '--eh': ct.hue } }));
          evLayer.appendChild(h('div.tl-dot', { style: { left: x + 'px', top: ay + 'px', '--eh': ct.hue } }));
          if (b) evLayer.appendChild(h('div.tl-span', { style: { left: x + 'px', width: Math.max(4, xOf(b) - x) + 'px', top: (top + 27) + 'px', '--eh': ct.hue } }));
          const pill = h('button.tl-pill' + (e.virtual ? '.virtual' : ''), { type: 'button', style: { left: x + 'px', top: top + 'px', maxWidth: wPill + 'px', '--eh': ct.hue }, title: e.title + ' · ' + Cal.fmt(c, e.meta.date) },
            e.meta.image ? h('img', { src: T.Assets.url(e.meta.image), alt: '' }) : h('i'), h('span', e.title));
          pill.onclick = (ev) => { ev.stopPropagation(); if (!e.virtual) showCard(e, pill); };
          evLayer.appendChild(pill);
        });
        if (!evs.length && !eras.length) evLayer.appendChild(h('div.rel-empty.glass', { style: { top: '90px' } }, h('b', 'A timeline está vazia'), h('p', 'Crie eventos aqui (clique duas vezes na linha) ou no calendário. As faixas do calendário viram as eras da timeline.')));
      }
      function showCard(e, pill){
        const ct = Cal.evCat(c, e);
        const chars = (e.meta.chars || []).map(id => S().get(id)).filter(Boolean);
        card.innerHTML = '';
        card.append(...[
          e.meta.image ? h('img.tl-card-img', { src: T.Assets.url(e.meta.image), alt: '' }) : null,
          h('div.row', h('span.chip', { style: { background: `hsl(${ct.hue} 80% 60% / .2)`, color: `hsl(${ct.hue} 60% 35%)` } }, ct.name), h('span.grow'), T.iconBtn('x', 'Fechar', () => card.classList.add('hidden'), '.sm')),
          h('h3.tl-card-t', e.title),
          h('div.muted', { style: { fontSize: '12.5px' } }, Cal.fmt(c, e.meta.date) + (e.meta.end ? ' – ' + Cal.fmt(c, e.meta.end) : '')),
          e.meta.desc ? h('p', { style: { margin: 0, fontFamily: 'var(--font-write)', fontSize: '14px', lineHeight: 1.5 } }, e.meta.desc) : null,
          chars.length ? h('div.names', chars.map(p => h('button.chip', { type: 'button', onclick: () => T.Shell.open({ kind: 'page', ref: p.id }, { side: true }) }, p.title + (p.meta?.birth ? ' · ' + Cal.age(c, p.meta.birth, e.meta.date) + ' anos' : '')))) : null,
          h('div.row', h('button.btn.sm', { onclick: () => { card.classList.add('hidden'); Cal.editEvent(pid, e, null, render); } }, icon('edit'), 'Editar'),
            e.meta.scene ? h('button.btn.sm', { onclick: () => T.Shell.open({ kind: 'doc', ref: e.meta.scene }, { side: true }) }, icon('scene'), 'Abrir capítulo') : null),
        ].filter(Boolean));
        card.classList.remove('hidden');
        const r = pill.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        card.style.left = T.clamp(r.left - wr.left, 10, wr.width - 330) + 'px';
        card.style.top = Math.max(64, r.top - wr.top - 10 - Math.min(card.offsetHeight, 340)) + 'px';
      }

      /* ----- barra ----- */
      function buildBar(){
        bar.innerHTML = '';
        const chars = T.Ent.pages(pid).filter(p => p.meta?.tpl === 'personagem');
        const sel = h('select.select', { style: { width: 'auto', padding: '5px 10px' }, 'aria-label': 'Ver a vida de um personagem' }, h('option', { value: '' }, 'Todos os personagens'), chars.map(p => h('option', { value: p.id, selected: who === p.id }, 'Só ' + p.title)));
        sel.onchange = () => { who = sel.value; persist(); render(); };
        const nFilters = (who ? 1 : 0) + hidden.size + (showScenes ? 0 : 1);
        const filters = T.menuButton('filter', 'Filtros' + (nFilters ? ' (' + nFilters + ')' : ''), 'Personagem, categorias e cenas', (btn) => {
          const box = h('div.stack', { style: { width: '320px' } }, h('b', 'Filtros da timeline'),
            chars.length ? h('label.field', 'Personagem', sel) : null,
            h('div.field', h('span.muted', { style: { fontSize: '12px' } }, 'Categorias (toque para esconder ou mostrar)'),
              h('div.names', (c.cats || []).map(ct => h('button.rel-chip' + (hidden.has(ct.id) ? '.off' : ''), { type: 'button', onclick: (e) => { hidden.has(ct.id) ? hidden.delete(ct.id) : hidden.add(ct.id); e.currentTarget.classList.toggle('off'); persist(); render(); } }, h('i', { style: { width: '9px', height: '9px', borderRadius: '50%', background: `hsl(${ct.hue} 80% 58%)` } }), ct.name)))),
            h('label.row', { style: { gap: '8px', fontSize: '13px' } }, (() => { const cb = h('input', { type: 'checkbox', checked: showScenes }); cb.onchange = () => { showScenes = cb.checked; persist(); render(); }; return cb; })(), 'Mostrar as cenas do livro que têm data'),
            h('div.row', h('span.grow'), h('button.btn.sm', { onclick: () => { who = ''; hidden.clear(); showScenes = true; persist(); T.closePopover(); buildBar(); render(); } }, 'Limpar filtros')));
          T.popover(btn, box);
        });
        sel.addEventListener('change', () => buildBar());
        bar.append(
          h('button.btn.sm.primary', { onclick: () => { const a = Math.round(aOf(W() / 2)); Cal.newEvent(pid, Cal.fromAbs(c, a), render); } }, icon('plus'), 'Evento'),
          filters,
          h('span.grow'),
          h('button.icon-btn.sm', { title: 'Afastar', onclick: () => zoom(1 / 1.4) }, h('b', '−')),
          T.iconBtn('focus', 'Ajustar tudo na tela', () => { fit(); persist(); render(); }, '.sm'),
          h('button.icon-btn.sm', { title: 'Aproximar', onclick: () => zoom(1.4) }, h('b', '+')),
          T.iconBtn('cal', 'Abrir o calendário', () => T.Shell.open({ kind: 'cal', ref: 'cal' }), '.sm'));
      }
      function zoom(f, px){ px = px ?? W() / 2; const a = aOf(px); k = T.clamp(k * f, 1e-5, 400); x0 = a - px / k; persistD(); render(); }

      /* ----- interação ----- */
      wrap.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.rel-bar, .tl-pill, .tl-card, .tl-scene')) return;
        card.classList.add('hidden');
        const sx = e.clientX, ox = x0; wrap.setPointerCapture(e.pointerId); wrap.classList.add('panning');
        const mv = (ev) => { x0 = ox - (ev.clientX - sx) / k; render(); };
        const up = () => { wrap.removeEventListener('pointermove', mv); wrap.removeEventListener('pointerup', up); wrap.classList.remove('panning'); persistD(); };
        wrap.addEventListener('pointermove', mv); wrap.addEventListener('pointerup', up);
      });
      wrap.addEventListener('wheel', (e) => {
        if (e.target.closest('.rel-bar, .tl-card')) return;
        e.preventDefault(); const r = wrap.getBoundingClientRect();
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { x0 += e.deltaX / k; persistD(); render(); return; }
        zoom(Math.exp(-e.deltaY * .0018), e.clientX - r.left);
      }, { passive: false });
      wrap.addEventListener('dblclick', (e) => {
        if (e.target.closest('.rel-bar, .tl-pill, .tl-card')) return;
        const r = wrap.getBoundingClientRect(); Cal.newEvent(pid, Cal.fromAbs(c, Math.round(aOf(e.clientX - r.left))), render);
      });
      const ro = new ResizeObserver(() => render()); ro.observe(wrap);
      const off = T.on('cal-changed', (p) => { if (p === pid) { buildBar(); render(); } });
      buildBar(); render();
      return { destroy(){ ro.disconnect(); off(); persist(); } };
    }
  };
})(window.T);
