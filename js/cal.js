/* Tinteiro — calendário do mundo: matemática das datas, luas, faixas e eventos */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;

  const DEFAULT_CAL = () => ({
    kind: 'cal',
    hoursPerDay: 24,
    weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    monthStartsWeek: false,
    epochWeekday: 0,
    months: [['Janeiro', 31], ['Fevereiro', 28], ['Março', 31], ['Abril', 30], ['Maio', 31], ['Junho', 30], ['Julho', 31], ['Agosto', 31], ['Setembro', 30], ['Outubro', 31], ['Novembro', 30], ['Dezembro', 31]].map(([name, days]) => ({ name, days })),
    era: { after: 'depois da Fundação', before: 'antes da Fundação', afterShort: 'd.F.', beforeShort: 'a.F.' },
    moons: [{ id: 'lua', name: 'Lua', hue: 46, cycle: 29.53, offset: 0, show: true, full: '', fresh: '' }],
    banners: [],
    cats: [
      { id: 'batalha', name: 'Batalha', hue: 352 }, { id: 'nascimento', name: 'Nascimento', hue: 150 }, { id: 'morte', name: 'Morte', hue: 248 },
      { id: 'descoberta', name: 'Descoberta', hue: 46 }, { id: 'profecia', name: 'Profecia', hue: 292 }, { id: 'politica', name: 'Política', hue: 210 },
      { id: 'viagem', name: 'Viagem', hue: 178 }, { id: 'festa', name: 'Festival', hue: 22 }, { id: 'outro', name: 'Outro', hue: 230 },
    ],
    cursor: { y: 1, m: 0, d: 1 },
    today: null,
  });

  const mod = (a, n) => ((a % n) + n) % n;
  const Cal = T.Cal = {
    item(pid){
      let c = S().all(pid).find(i => i.type === 'cal');
      if (!c) c = S().create({ pid, type: 'cal', area: 'time', title: 'Calendário', meta: DEFAULT_CAL() });
      return c;
    },
    cfg(pid){ return Object.assign(DEFAULT_CAL(), Cal.item(pid).meta); },
    save(pid, patch){ const c = Cal.item(pid); S().update(c.id, { meta: patch }); T.emit('cal-changed', pid); },
    yearLen: (c) => c.months.reduce((a, m) => a + (+m.days || 0), 0) || 1,
    // dia absoluto (o dia 1 do ano 1 é 0; não existe ano 0)
    abs(c, dt){
      if (!dt) return 0;
      const L = Cal.yearLen(c); let doy = 0;
      for (let i = 0; i < dt.m && i < c.months.length; i++) doy += +c.months[i].days;
      doy += (dt.d || 1) - 1;
      return (dt.y > 0 ? (dt.y - 1) * L : dt.y * L) + doy;
    },
    fromAbs(c, a){
      const L = Cal.yearLen(c);
      let y = Math.floor(a / L); let doy = a - y * L; y = y >= 0 ? y + 1 : y;
      let m = 0; while (m < c.months.length - 1 && doy >= +c.months[m].days) { doy -= +c.months[m].days; m++; }
      return { y, m, d: doy + 1 };
    },
    weekday(c, dt){
      const W = c.weekdays.length || 7;
      if (c.monthStartsWeek) return mod((dt.d || 1) - 1, W);
      return mod(Cal.abs(c, dt) + (+c.epochWeekday || 0), W);
    },
    yearLabel(c, y, long){ return Math.abs(y) + ' ' + (y > 0 ? (long ? c.era.after : c.era.afterShort) : (long ? c.era.before : c.era.beforeShort)); },
    fmt(c, dt, opt = {}){
      if (!dt) return '';
      const m = c.months[dt.m]?.name || '?';
      return (opt.noDay ? '' : dt.d + ' de ') + m + ' de ' + Cal.yearLabel(c, dt.y, opt.long);
    },
    cmp(c, a, b){ return Cal.abs(c, a) - Cal.abs(c, b); },
    // fase de 0 (nova) a 1
    phase(moon, a){ const cy = +moon.cycle || 29.53; return mod((a - (+moon.offset || 0)) / cy, 1); },
    phaseName(p){
      const n = ['Nova', 'Crescente', 'Quarto crescente', 'Gibosa crescente', 'Cheia', 'Gibosa minguante', 'Quarto minguante', 'Minguante'];
      return n[Math.round(p * 8) % 8];
    },
    moonSVG(p, hue, size = 16){
      const r = 7, c = 8; const k = Math.cos(2 * Math.PI * p); const rx = Math.abs(k) * r; const waxing = p < .5;
      const outer = waxing ? 1 : 0; const inner = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
      const lit = (p < .02 || p > .98) ? '' : `<path d="M${c} ${c - r} A${r} ${r} 0 0 ${outer} ${c} ${c + r} A${rx} ${r} 0 0 ${inner} ${c} ${c - r}Z" fill="hsl(${hue} 90% 72%)"/>`;
      return `<svg class="moon" width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="hsl(${hue} 25% 30% / .55)"/>${lit}<circle cx="8" cy="8" r="7" fill="none" stroke="hsl(${hue} 50% 60% / .6)" stroke-width=".8"/></svg>`;
    },
    // eventos e faixas
    events(pid){ return S().all(pid).filter(i => i.type === 'event' && i.meta?.date); },
    bannerOn(c, b, a){ return a >= Cal.abs(c, b.start) && a <= Cal.abs(c, b.end || b.start); },
    // idade em anos completos na data
    age(c, birth, at){
      if (!birth || !at) return null;
      let yrs = (at.y > 0 ? at.y : at.y + 1) - (birth.y > 0 ? birth.y : birth.y + 1);
      if (at.m < birth.m || (at.m === birth.m && at.d < birth.d)) yrs--;
      return yrs;
    },
    // estilo de faixa: padrão e cor
    bannerBg(b){
      const c1 = `hsl(${b.hue ?? 268} 75% 58%)`, c2 = `hsl(${b.hue ?? 268} 75% 70%)`;
      switch (b.pattern) {
        case 'stripes': return `repeating-linear-gradient(135deg, ${c1} 0 8px, ${c2} 8px 16px)`;
        case 'dots': return `radial-gradient(${c2} 2.2px, transparent 2.6px) 0 0/10px 10px, ${c1}`;
        case 'checker': return `conic-gradient(${c1} 25%, ${c2} 0 50%, ${c1} 0 75%, ${c2} 0) 0 0/12px 12px`;
        case 'grid': return `linear-gradient(${c2} 1.5px, transparent 1.5px) 0 0/10px 10px, linear-gradient(90deg, ${c2} 1.5px, transparent 1.5px) 0 0/10px 10px, ${c1}`;
        case 'image': return b.image ? `url("${T.Assets.url(b.image)}") center/cover, ${c1}` : c1;
        default: return c1;
      }
    },
    // seletor de data compacto
    datePicker(c, value, onChange, opts = {}){
      const v = Object.assign({ y: c.cursor?.y || 1, m: 0, d: 1 }, value || {});
      const d = h('input.input.num', { type: 'number', min: 1, max: c.months[v.m]?.days || 31, value: v.d, 'aria-label': 'Dia', style: { width: '64px' } });
      const m = h('select.select', { 'aria-label': 'Mês', style: { width: 'auto' } }, c.months.map((mm, i) => h('option', { value: i, selected: i === v.m }, mm.name)));
      const y = h('input.input.num', { type: 'number', min: 1, value: Math.abs(v.y), 'aria-label': 'Ano', style: { width: '84px' } });
      const e = h('select.select', { 'aria-label': 'Era', style: { width: 'auto' } }, h('option', { value: '1', selected: v.y > 0 }, c.era.afterShort), h('option', { value: '-1', selected: v.y < 0 }, c.era.beforeShort));
      const emit = () => { const dd = { y: Math.max(1, +y.value || 1) * (+e.value), m: +m.value, d: T.clamp(+d.value || 1, 1, +c.months[+m.value]?.days || 31) }; d.max = c.months[dd.m]?.days || 31; onChange(dd); };
      [d, m, y, e].forEach(x => x.addEventListener('change', emit));
      const wrap = h('div.datepick', opts.label ? h('span.muted', opts.label) : null, d, m, y, e, opts.clear ? h('button.btn.sm', { type: 'button', onclick: () => onChange(null) }, 'Sem data') : null);
      return wrap;
    },
    catOf(c, id){ return (c.cats || []).find(x => x.id === id) || { name: 'Evento', hue: 230 }; },
    // categoria do evento, com a cor própria dele quando escolhida
    evCat(c, e){ const ct = Cal.catOf(c, e?.meta?.cat); return e?.meta?.hue != null ? Object.assign({}, ct, { hue: e.meta.hue }) : ct; },
    // editor de evento (popover ou modal)
    editEvent(pid, ev, anchorRect, after){
      let c = Cal.cfg(pid);
      const it = ev ? S().get(ev.id) : null; if (!it) return;
      T.modal((box, close) => {
        const title = h('input.input', { value: it.title || '', 'aria-label': 'Nome do evento', style: { fontFamily: 'var(--font-display)', fontSize: '26px', padding: '4px 10px' } });
        const desc = h('textarea.textarea', { placeholder: 'O que aconteceu?' }); desc.value = it.meta?.desc || '';
        let date = it.meta.date, end = it.meta.end || null, hour = it.meta.hour ?? '';
        let cat = it.meta.cat || 'outro', hueOwn = it.meta.hue ?? null;
        const cats = h('div.type-pick');
        const HUES = [0, 22, 42, 60, 95, 140, 170, 195, 215, 245, 275, 300, 330];
        const colorRow = h('div.ev-colors');
        const hexToHue = (hex) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; let hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round((hh * 60 + 360) % 360); };
        function drawColors(){
          const catHue = Cal.catOf(c, cat).hue;
          const pk = h('input', { type: 'color', value: '#5b8cff', 'aria-label': 'Outra cor' }); pk.oninput = () => { hueOwn = hexToHue(pk.value); drawColors(); };
          colorRow.replaceChildren(
            h('button.ev-sw.auto' + (hueOwn == null ? '.on' : ''), { type: 'button', title: 'Usar a cor da categoria', onclick: () => { hueOwn = null; drawColors(); } }, h('i', { style: { background: `hsl(${catHue} 80% 58%)` } }), 'Cor da categoria'),
            ...HUES.map(hu => h('button.ev-sw' + (hueOwn === hu ? '.on' : ''), { type: 'button', title: 'Usar esta cor', 'aria-label': 'Cor ' + hu, onclick: () => { hueOwn = hu; drawColors(); } }, h('i', { style: { background: `hsl(${hu} 80% 58%)` } }))),
            h('label.ev-sw.pick' + (hueOwn != null && !HUES.includes(hueOwn) ? '.on' : ''), { title: 'Escolher outra cor' }, h('i', { style: { background: hueOwn != null && !HUES.includes(hueOwn) ? `hsl(${hueOwn} 80% 58%)` : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' } }), pk));
        }
        function drawCats(){
          c = Cal.cfg(pid);
          cats.replaceChildren(...(c.cats || []).map(ct => h('button' + (cat === ct.id ? '.on' : ''), { type: 'button', onclick: () => { cat = ct.id; drawCats(); drawColors(); } }, h('i', { style: { background: `hsl(${ct.hue} 80% 58%)` } }), ct.name)),
            h('button.ev-cat-add', { type: 'button', title: 'Criar uma categoria sua', onclick: async () => {
              const name = await T.ask('Nova categoria de evento', { placeholder: 'ex.: Profecias, Viagens, Mortes, Festas', ok: 'Criar' }); if (!name || !name.trim()) return;
              const list = (Cal.cfg(pid).cats || []).slice(); const nc = { id: T.id(), name: name.trim(), hue: HUES[(list.length * 5) % HUES.length] }; list.push(nc);
              Cal.save(pid, { cats: list }); cat = nc.id; drawCats(); drawColors(); T.emit('cal-changed', pid);
            } }, '+ Nova categoria'),
            h('button.ev-cat-add', { type: 'button', title: 'Renomear, mudar a cor ou apagar categorias', onclick: (e) => T.typeEditor(e.currentTarget, (Cal.cfg(pid).cats || []).map(x => Object.assign({ style: 'solid' }, x)), (nt) => { Cal.save(pid, { cats: nt.map(x => ({ id: x.id, name: x.name, hue: x.hue })) }); drawCats(); drawColors(); T.emit('cal-changed', pid); }, 'Categorias de evento') }, icon('edit'), 'Editar'));
        }
        drawCats(); drawColors();
        const pages = T.Ent.pages(pid).filter(p => p.meta?.tpl === 'personagem');
        let chars = new Set(it.meta.chars || []);
        const charBox = h('div.names', pages.map(p => { const b = h('button.chip' + (chars.has(p.id) ? '' : '.gray'), { type: 'button', onclick: () => { chars.has(p.id) ? chars.delete(p.id) : chars.add(p.id); b.classList.toggle('gray'); ageLine(); } }, p.title); return b; }));
        const ages = h('p.muted', { style: { margin: 0, fontSize: '12.5px' } });
        function ageLine(){ const list = [...chars].map(id => S().get(id)).filter(p => p?.meta?.birth).map(p => p.title + ': ' + Cal.age(c, p.meta.birth, date) + ' anos'); ages.textContent = list.length ? 'Idades nesta data: ' + list.join(' · ') : ''; }
        const scenes = T.MS.flat(pid).filter(i => i.type === 'scene' || i.type === 'chapter');
        const sceneSel = h('select.select', { 'aria-label': 'Capítulo ou cena' }, h('option', { value: '' }, '— nenhum —'), scenes.map(s => h('option', { value: s.id, selected: it.meta.scene === s.id }, (s.type === 'chapter' ? '' : '   ') + (s.title || 'Sem título'))));
        let img = it.meta.image || null;
        const imgBox = h('div.row', img ? h('img.cover-prev', { src: T.Assets.url(img), alt: '', style: { width: '120px', height: '70px' } }) : null,
          h('button.btn.sm', { type: 'button', onclick: async () => { const f = await T.pickFile('image/*'); if (!f) return; const r = await T.Assets.upload(f); if (r) { img = r; imgBox.firstChild?.tagName === 'IMG' ? imgBox.firstChild.src = T.Assets.url(r) : imgBox.prepend(h('img.cover-prev', { src: T.Assets.url(r), alt: '', style: { width: '120px', height: '70px' } })); } } }, icon('image'), img ? 'Trocar imagem' : 'Imagem'));
        const hourIn = h('input.input.num', { type: 'number', min: 0, max: (c.hoursPerDay || 24) - 1, value: hour, placeholder: 'hora', style: { width: '80px' }, 'aria-label': 'Hora' });
        // data de fim só quando marcada (evento que dura vários dias)
        const endWrap = h('div.ev-end');
        const drawEnd = () => {
          const cb = h('input', { type: 'checkbox', checked: !!end, onchange: () => { end = cb.checked ? Object.assign({}, date) : null; drawEnd(); } });
          endWrap.replaceChildren(...[h('label.mp-chk', cb, 'Durou um tempo (tem data de fim)'), end ? h('div.row', { style: { gap: '8px', marginTop: '6px' } }, h('span.muted', { style: { fontSize: '12.5px' } }, 'até'), Cal.datePicker(c, end, (v) => { end = v; if (!v) drawEnd(); })) : null].filter(Boolean));
        };
        drawEnd();
        const save = () => {
          S().update(it.id, { title: title.value.trim() || 'Evento', meta: { desc: desc.value, date, end, hour: hourIn.value === '' ? null : +hourIn.value, chars: [...chars], scene: sceneSel.value || null, image: img, cat, hue: hueOwn } });
          T.emit('cal-changed', pid); close(); after && after();
        };
        box.append(h('div.row', h('h2.grow', 'Evento'), it.meta.scene ? h('button.btn.sm', { onclick: () => { close(); T.Shell.open({ kind: 'doc', ref: it.meta.scene }, { side: true }); } }, icon('scene'), 'Abrir capítulo') : null),
          h('div.stack', title,
            h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Quando aconteceu'), h('div.row', { style: { gap: '8px', flexWrap: 'wrap' } }, Cal.datePicker(c, date, (v) => { date = v || date; ageLine(); }), hourIn), endWrap),
            h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Categoria'), cats),
            h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Cor na timeline e no calendário'), colorRow),
            desc,
            pages.length ? h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Personagens envolvidos'), charBox, ages) : null,
            h('label.field', 'Acontece no capítulo', sceneSel), imgBox),
          h('div.modal-foot', h('button.btn.danger', { onclick: async () => { if (await T.confirm('Apagar “' + it.title + '”?', null, 'Apagar', true)) { S().remove(it.id); T.emit('cal-changed', pid); close(); after && after(); } } }, icon('trash'), 'Apagar'), h('span.grow'), h('button.btn', { onclick: () => close() }, 'Cancelar'), h('button.btn.primary', { onclick: save }, 'Salvar')));
        ageLine();
      }, { wide: true });
    },
    newEvent(pid, date, after){
      const it = S().create({ pid, type: 'event', area: 'time', title: 'Novo evento', meta: { date, cat: 'outro', chars: [] } });
      Cal.editEvent(pid, it, null, after);
      return it;
    },
  };

  /* ================= TELA DO CALENDÁRIO ================= */
  T.Views.cal = {
    icon: 'cal', title: () => 'Calendário',
    mount(root, tab, ctx){
      const pid = ctx.pid;
      let c = Cal.cfg(pid);
      let view = tab.mode || 'month';
      let cur = Object.assign({}, c.cursor || { y: 1, m: 0, d: 1 });
      let settingsOpen = false, section = null;
      const wrap = h('div.calv'); root.appendChild(wrap);
      const head = h('div.cal-head.glass.lg.hscroll');
      const body = h('div.cal-body');
      const panel = h('aside.cal-panel.glass.glass-strong.hidden');
      wrap.append(head, body, panel);
      const persistCursor = T.debounce(() => Cal.save(pid, { cursor: cur }), 800);

      function nav(dir){
        if (view === 'year') cur.y = step(cur.y, dir);
        else if (view === 'month') { let m = cur.m + dir; let y = cur.y; if (m < 0) { m = c.months.length - 1; y = step(y, -1); } if (m >= c.months.length) { m = 0; y = step(y, 1); } cur.m = m; cur.y = y; cur.d = Math.min(cur.d, c.months[m].days); }
        else { const a = Cal.abs(c, cur) + dir; cur = Cal.fromAbs(c, a); }
        persistCursor(); render();
      }
      const step = (y, d) => { let n = y + d; if (n === 0) n = d > 0 ? 1 : -1; return n; };
      function renderHead(){
        head.innerHTML = '';
        const vs = h('div.seg', [['year', 'Ano'], ['month', 'Mês'], ['day', 'Dia']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { view = k; tab.mode = k; T.emit('tab-changed', tab); render(); } }, l); if (k === view) b.classList.add('on'); return b; }));
        const label = view === 'year' ? Cal.yearLabel(c, cur.y, true) : view === 'month' ? (c.months[cur.m]?.name + ' · ' + Cal.yearLabel(c, cur.y)) : Cal.fmt(c, cur);
        const goTo = (anchor) => { const box = h('div.stack', { style: { width: '320px' } }, h('b', 'Ir para'), Cal.datePicker(c, cur, (v) => { if (v) { cur = v; persistCursor(); render(); } })); T.popover(anchor, box); };
        const more = T.menuButton('dots', 'Mais', 'Ir para uma data, hoje no mundo, timeline, configurações', (btn) => T.menuAt(btn, [
          { label: 'Ir para uma data…', icon: 'cal', fn: () => goTo(btn) },
          c.today ? { label: 'Hoje no mundo (' + Cal.fmt(c, c.today) + ')', icon: 'pin', fn: () => { cur = Object.assign({}, c.today); persistCursor(); render(); } } : null,
          { label: 'Abrir a timeline', icon: 'timeline', fn: () => T.Shell.open({ kind: 'timeline', ref: 'timeline' }) },
          '-', { label: settingsOpen ? 'Fechar configurações' : 'Configurar calendário…', icon: 'gear', fn: () => { settingsOpen = !settingsOpen; section = null; renderPanel(); renderHead(); } },
        ]));
        head.append(
          h('button.icon-btn', { title: 'Anterior', onclick: () => nav(-1) }, h('span', { style: { transform: 'rotate(180deg)', display: 'grid' } }, icon('chev'))),
          h('b.cal-title', label),
          h('button.icon-btn', { title: 'Próximo', onclick: () => nav(1) }, icon('chev')),
          vs,
          h('span.grow'),
          h('button.btn.sm.primary', { onclick: () => Cal.newEvent(pid, Object.assign({}, cur), render) }, icon('plus'), 'Evento'),
          more);
      }

      /* ----- dados do período ----- */
      const evs = () => Cal.events(pid);
      function eventsOn(a){ return evs().filter(e => { const s = Cal.abs(c, e.meta.date), en = e.meta.end ? Cal.abs(c, e.meta.end) : s; return a >= s && a <= en; }); }
      const moonsShown = () => (c.moons || []).filter(m => m.show !== false);

      /* ----- visão de ano ----- */
      function yearView(){
        const g = h('div.cal-year');
        c.months.forEach((mo, mi) => {
          const card = h('div.cal-mini.glass', { role: 'button', tabindex: '0', onclick: () => { cur.m = mi; cur.d = 1; view = 'month'; tab.mode = 'month'; render(); } });
          const startA = Cal.abs(c, { y: cur.y, m: mi, d: 1 });
          const bans = (c.banners || []).filter(b => Cal.abs(c, b.start) <= startA + mo.days - 1 && Cal.abs(c, b.end || b.start) >= startA);
          card.append(h('div.cal-mini-h', h('b', mo.name), bans.length ? h('span.cal-mini-ban', { style: { background: Cal.bannerBg(bans[0]) }, title: bans.map(b => b.name).join(', ') }) : null));
          const W = c.weekdays.length || 7;
          const grid = h('div.cal-mini-g', { style: { gridTemplateColumns: `repeat(${W}, 1fr)` } });
          c.weekdays.forEach(w => grid.appendChild(h('span.wd', (w || '?')[0])));
          const first = Cal.weekday(c, { y: cur.y, m: mi, d: 1 });
          for (let i = 0; i < first; i++) grid.appendChild(h('span'));
          for (let d = 1; d <= mo.days; d++) {
            const a = startA + d - 1; const e = eventsOn(a);
            const full = moonsShown().some(m => { const p = Cal.phase(m, a); return Math.abs(p - .5) < .5 / (+m.cycle || 29.5); });
            const cell = h('span.dn' + (e.length ? '.has' : '') + (full ? '.full' : ''), { title: e.map(x => x.title).join(', ') }, String(d));
            if (e.length) cell.style.setProperty('--eh', Cal.evCat(c, e[0]).hue);
            grid.appendChild(cell);
          }
          card.appendChild(grid);
          g.appendChild(card);
        });
        return g;
      }

      /* ----- visão de mês ----- */
      function monthView(){
        const W = c.weekdays.length || 7; const mo = c.months[cur.m]; if (!mo) return h('p', 'Crie meses nas configurações.');
        const startA = Cal.abs(c, { y: cur.y, m: cur.m, d: 1 });
        const first = Cal.weekday(c, { y: cur.y, m: cur.m, d: 1 });
        const rows = Math.ceil((first + mo.days) / W);
        const nb = Math.min(3, (c.banners || []).filter(b => Cal.abs(c, b.start) <= startA + mo.days - 1 && Cal.abs(c, b.end || b.start) >= startA).length);
        const rowH = 108 + nb * 22;
        const wrapM = h('div.cal-month', { style: { '--cols': W, '--rows': rows, '--banh': (nb * 22) + 'px' } });
        const headRow = h('div.cal-wds', { style: { gridTemplateColumns: `repeat(${W}, 1fr)` } }, c.weekdays.map(w => h('span', w)));
        const grid = h('div.cal-grid', { style: { gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${rows}, ${rowH}px)` } });
        for (let i = 0; i < rows * W; i++) {
          const d = i - first + 1;
          if (d < 1 || d > mo.days) { grid.appendChild(h('div.cal-cell.out')); continue; }
          const a = startA + d - 1; const dt = { y: cur.y, m: cur.m, d };
          const isToday = c.today && Cal.abs(c, c.today) === a;
          const cell = h('div.cal-cell' + (isToday ? '.today' : ''), { 'data-a': a, ondblclick: (e) => { if (e.target.closest('.cal-ev')) return; Cal.newEvent(pid, dt, render); } },
            h('div.cal-dh', h('button.cal-dn', { type: 'button', title: 'Ver o dia', onclick: () => { cur = dt; view = 'day'; tab.mode = 'day'; render(); } }, String(d)),
              h('span.cal-moons', { html: moonsShown().map(m => { const p = Cal.phase(m, a); const near = [0, .25, .5, .75].some(t => Math.abs(p - t) < .5 / (+m.cycle || 29.5) || Math.abs(p - t - 1) < .5 / (+m.cycle || 29.5)); return near || moonsShown().length === 1 ? `<span title="${T.esc(m.name)}: ${Cal.phaseName(p)}${Math.abs(p - .5) < .02 && m.full ? ' · ' + T.esc(m.full) : ''}">${Cal.moonSVG(p, m.hue ?? 46, 14)}</span>` : ''; }).join('') })),
          );
          eventsOn(a).slice(0, 3).forEach(e => {
            const ct = Cal.evCat(c, e);
            cell.appendChild(h('button.cal-ev', { type: 'button', style: { '--eh': ct.hue }, title: e.title, onclick: (ev) => { ev.stopPropagation(); Cal.editEvent(pid, e, null, render); } },
              e.meta.image ? h('img', { src: T.Assets.url(e.meta.image), alt: '' }) : null, h('span', e.title)));
          });
          const more = eventsOn(a).length - 3; if (more > 0) cell.appendChild(h('span.muted', { style: { fontSize: '11px' } }, '+' + more));
          grid.appendChild(cell);
        }
        // faixas por semana
        const bansLayer = h('div.cal-bans', { style: { gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${rows}, ${rowH}px)` } });
        (c.banners || []).filter(b => Cal.abs(c, b.start) <= startA + mo.days - 1 && Cal.abs(c, b.end || b.start) >= startA).slice(0, 3).forEach((b, bi) => {
          const s = Math.max(Cal.abs(c, b.start), startA), e = Math.min(Cal.abs(c, b.end || b.start), startA + mo.days - 1);
          if (s > e) return;
          let i0 = s - startA + first; const i1 = e - startA + first;
          while (i0 <= i1) {
            const row = Math.floor(i0 / W); const rowEnd = Math.min(i1, row * W + W - 1);
            const seg = h('div.cal-ban.sh-' + (b.shape || 'plain'), { title: b.name, style: { gridRow: String(row + 1), gridColumn: (i0 % W + 1) + ' / ' + (rowEnd % W + 2), background: Cal.bannerBg(b), '--bi': bi } }, h('span', b.name));
            bansLayer.appendChild(seg); i0 = rowEnd + 1;
          }
        });
        wrapM.append(headRow, h('div.cal-gridwrap', grid, bansLayer));
        return wrapM;
      }

      /* ----- visão de dia ----- */
      function dayView(){
        const a = Cal.abs(c, cur); const es = eventsOn(a);
        const H = +c.hoursPerDay || 24;
        const bans = (c.banners || []).filter(b => Cal.bannerOn(c, b, a));
        const wk = c.weekdays[Cal.weekday(c, cur)] || '';
        const top = h('div.cal-day-top.glass',
          h('div', h('div.muted', wk), h('h2', { style: { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '38px', margin: 0 } }, Cal.fmt(c, cur, { long: true }))),
          h('div.cal-day-moons', moonsShown().map(m => { const p = Cal.phase(m, a); return h('div.row', { html: Cal.moonSVG(p, m.hue ?? 46, 26) + `<span><b>${T.esc(m.name)}</b><br><span class="muted">${Cal.phaseName(p)}${Math.abs(p - .5) < .5 / (+m.cycle || 29.5) && m.full ? ' · ' + T.esc(m.full) : ''}${(p < .5 / (+m.cycle || 29.5) || p > 1 - .5 / (+m.cycle || 29.5)) && m.fresh ? ' · ' + T.esc(m.fresh) : ''}</span></span>` }); })),
          bans.length ? h('div.names', bans.map(b => h('span.chip', { style: { background: Cal.bannerBg(b), color: '#fff' } }, b.name))) : null,
          h('div.row', h('button.btn.sm', { onclick: () => { Cal.save(pid, { today: Object.assign({}, cur) }); c = Cal.cfg(pid); T.toast('Esta é agora a data atual da história.'); render(); } }, icon('pin'), 'Marcar como “hoje” na história'),
            h('button.btn.sm', { onclick: () => agesPop() }, icon('person'), 'Idades nesta data')));
        const hours = h('div.cal-hours');
        const allDay = es.filter(e => e.meta.hour == null);
        if (allDay.length) hours.appendChild(h('div.cal-hour', h('span.hn', 'dia todo'), h('div.cal-hev', allDay.map(e => evChip(e)))));
        for (let i = 0; i < H; i++) {
          const at = es.filter(e => e.meta.hour === i);
          hours.appendChild(h('div.cal-hour', { ondblclick: () => { const it = S().create({ pid, type: 'event', area: 'time', title: 'Novo evento', meta: { date: Object.assign({}, cur), hour: i, cat: 'outro', chars: [] } }); Cal.editEvent(pid, it, null, render); } }, h('span.hn.num', String(i).padStart(2, '0') + 'h'), h('div.cal-hev', at.map(e => evChip(e)))));
        }
        return h('div.cal-day', top, hours);
      }
      function evChip(e){ const ct = Cal.evCat(c, e); return h('button.cal-ev', { type: 'button', style: { '--eh': ct.hue }, onclick: () => Cal.editEvent(pid, e, null, render) }, e.meta.image ? h('img', { src: T.Assets.url(e.meta.image), alt: '' }) : null, h('span', e.title)); }
      function agesPop(){
        const chars = T.Ent.pages(pid).filter(p => p.meta?.tpl === 'personagem');
        T.modal((box, close) => {
          box.append(h('h2', 'Idades em ' + Cal.fmt(c, cur)), h('p.sub', 'Defina o nascimento de cada personagem na página dele na wiki (caixa de informações).'),
            h('div.stack', chars.length ? chars.map(p => h('div.row', h('b.grow', p.title), p.meta?.birth ? h('span.num', (() => { const a = Cal.age(c, p.meta.birth, cur); return a < 0 ? 'ainda não nasceu' : a + (a === 1 ? ' ano' : ' anos'); })()) : h('span.muted', 'sem data de nascimento'))) : h('p.muted', 'Nenhum personagem na wiki ainda.')),
            h('div.modal-foot', h('button.btn.primary', { onclick: () => close() }, 'Fechar')));
        });
      }

      /* ----- painel de configurações ----- */
      function renderPanel(){
        panel.classList.toggle('hidden', !settingsOpen); panel.innerHTML = '';
        if (!settingsOpen) return;
        const save = (patch) => { Cal.save(pid, patch); c = Cal.cfg(pid); render(); };
        const secs = [['years', 'Contagem dos anos', 'hash'], ['months', 'Meses', 'cal'], ['days', 'Dias e semanas', 'clock'], ['moons', 'Luas', 'moon'], ['banners', 'Faixas (eras e períodos)', 'flame'], ['cats', 'Categorias de evento', 'filter']];
        if (!section) {
          panel.append(h('div.row', h('b.grow', 'Configurações do calendário'), T.iconBtn('x', 'Fechar', () => { settingsOpen = false; renderPanel(); renderHead(); }, '.sm')),
            h('div.stack', { style: { gap: '4px' } }, secs.map(([k, l, ic]) => h('button.cal-sec', { type: 'button', onclick: () => { section = k; renderPanel(); } }, icon(ic), h('span.grow', l), icon('chev')))),
            h('p.muted', { style: { fontSize: '12px', margin: '8px 0 0' } }, 'Ano tem ' + Cal.yearLen(c) + ' dias · semana de ' + c.weekdays.length + ' dias · ' + c.hoursPerDay + ' horas por dia.'));
          return;
        }
        const back = h('div.row', T.iconBtn('chev', 'Voltar', () => { section = null; renderPanel(); }, '.sm'), h('b.grow', secs.find(s => s[0] === section)[1]));
        back.firstChild.firstChild.style.transform = 'rotate(180deg)';
        panel.appendChild(back);
        if (section === 'years') {
          const f = (k, l) => { const i = h('input.input', { value: c.era[k] || '', 'aria-label': l }); i.onchange = () => save({ era: Object.assign({}, c.era, { [k]: i.value }) }); return h('label.field', l, i); };
          panel.append(h('p.muted', { style: { fontSize: '12.5px', margin: 0 } }, 'Os anos são contados a partir de um marco (como “a Queda” ou “a Ascensão”). Não existe ano zero: depois do ano 1 antes vem o ano 1 depois.'),
            f('after', 'Depois do marco (por extenso)'), f('afterShort', 'Depois (abreviado)'), f('before', 'Antes do marco (por extenso)'), f('beforeShort', 'Antes (abreviado)'),
            h('p', { style: { fontSize: '13px' } }, 'Exemplo: ', h('b', Cal.fmt(c, { y: 1500, m: 0, d: 3 }, { long: true }))));
        }
        if (section === 'months') {
          const ms = c.months.map(m => Object.assign({}, m));
          const list = h('div.stack', { style: { gap: '6px' } }, ms.map((m, i) => {
            const n = h('input.input', { value: m.name, 'aria-label': 'Nome do mês' }); n.onchange = () => { ms[i].name = n.value; save({ months: ms }); };
            const d = h('input.input.num', { type: 'number', min: 1, max: 400, value: m.days, style: { width: '76px' }, 'aria-label': 'Dias' }); d.onchange = () => { ms[i].days = Math.max(1, +d.value || 1); save({ months: ms }); };
            return h('div.row', h('span.muted.num', { style: { width: '20px' } }, String(i + 1)), n, d, T.iconBtn('trash', 'Tirar mês', () => { if (ms.length < 2) return; ms.splice(i, 1); cur.m = Math.min(cur.m, ms.length - 1); save({ months: ms }); renderPanel(); }, '.sm'));
          }));
          panel.append(h('div.row', { style: { fontSize: '12px' } }, h('span.grow.muted', 'Nome'), h('span.muted', 'Dias')), list,
            h('button.btn.sm', { onclick: () => { ms.push({ name: 'Novo mês', days: 30 }); save({ months: ms }); renderPanel(); } }, icon('plus'), 'Mês'),
            h('p.muted', { style: { fontSize: '12px' } }, 'Total: ' + Cal.yearLen(c) + ' dias por ano.'));
        }
        if (section === 'days') {
          const hp = h('input.input.num', { type: 'number', min: 1, max: 100, value: c.hoursPerDay, style: { width: '90px' }, 'aria-label': 'Horas por dia' }); hp.onchange = () => save({ hoursPerDay: Math.max(1, +hp.value || 24) });
          const msw = h('input', { type: 'checkbox', id: 'msw-' + tab.id, checked: !!c.monthStartsWeek }); msw.onchange = () => save({ monthStartsWeek: msw.checked });
          const wds = c.weekdays.slice();
          const list = h('div.stack', { style: { gap: '6px' } }, wds.map((w, i) => { const n = h('input.input', { value: w, 'aria-label': 'Dia ' + (i + 1) }); n.onchange = () => { wds[i] = n.value; save({ weekdays: wds }); }; return h('div.row', h('span.muted.num', { style: { width: '20px' } }, String(i + 1)), n, T.iconBtn('trash', 'Tirar dia', () => { if (wds.length < 2) return; wds.splice(i, 1); save({ weekdays: wds }); renderPanel(); }, '.sm')); }));
          const ep = h('select.select', { 'aria-label': 'Dia da semana do dia 1' }, wds.map((w, i) => h('option', { value: i, selected: (+c.epochWeekday || 0) === i }, w))); ep.onchange = () => save({ epochWeekday: +ep.value });
          panel.append(...[h('label.row', 'Horas por dia', hp), h('label.row', { for: msw.id, style: { gap: '8px', fontSize: '13px' } }, msw, 'Cada mês começa uma semana nova'),
            !c.monthStartsWeek ? h('label.field', 'O dia 1 do ano 1 cai num(a)', ep) : null,
            h('b', { style: { fontSize: '12.5px', marginTop: '8px' } }, 'Dias da semana'), list,
            h('button.btn.sm', { onclick: () => { wds.push('Dia ' + (wds.length + 1)); save({ weekdays: wds }); renderPanel(); } }, icon('plus'), 'Dia da semana')].filter(Boolean));
        }
        if (section === 'moons') {
          const ms = (c.moons || []).map(m => Object.assign({}, m));
          ms.forEach((m, i) => {
            const n = h('input.input', { value: m.name, 'aria-label': 'Nome da lua' }); n.onchange = () => { ms[i].name = n.value; save({ moons: ms }); };
            const cy = h('input.input.num', { type: 'number', step: .01, min: 1, value: m.cycle, style: { width: '90px' }, 'aria-label': 'Ciclo em dias' }); cy.onchange = () => { ms[i].cycle = Math.max(1, +cy.value || 29.53); save({ moons: ms }); };
            const of = h('input.input.num', { type: 'number', step: .5, value: m.offset || 0, style: { width: '80px' }, 'aria-label': 'Deslocamento' }); of.onchange = () => { ms[i].offset = +of.value || 0; save({ moons: ms }); };
            const sh = h('input', { type: 'checkbox', checked: m.show !== false, id: 'msh-' + i + tab.id }); sh.onchange = () => { ms[i].show = sh.checked; save({ moons: ms }); };
            const full = h('input.input', { value: m.full || '', placeholder: 'texto da lua cheia (ex.: lua de sangue)' }); full.onchange = () => { ms[i].full = full.value; save({ moons: ms }); };
            const fresh = h('input.input', { value: m.fresh || '', placeholder: 'texto da lua nova' }); fresh.onchange = () => { ms[i].fresh = fresh.value; save({ moons: ms }); };
            panel.append(h('div.glass.cal-moon', { style: { padding: '10px', borderRadius: '14px', display: 'grid', gap: '8px' } },
              h('div.row', h('span', { html: Cal.moonSVG(.35, m.hue ?? 46, 24) }), n, T.iconBtn('trash', 'Apagar lua', () => { ms.splice(i, 1); save({ moons: ms }); renderPanel(); }, '.sm')),
              T.swatches(m.hue ?? 46, (x) => { ms[i].hue = x; save({ moons: ms }); }),
              h('div.row', h('label.field', 'Ciclo (dias)', cy), h('label.field', 'Deslocamento', of)),
              h('label.row', { for: sh.id, style: { gap: '8px', fontSize: '12.5px' } }, sh, 'Mostrar as fases no calendário'), full, fresh));
          });
          panel.append(h('button.btn.sm', { onclick: () => { ms.push({ id: T.id(), name: 'Nova lua', hue: T.HUES[(ms.length * 4) % T.HUES.length], cycle: 20, offset: 0, show: true }); save({ moons: ms }); renderPanel(); } }, icon('plus'), 'Lua'),
            h('p.muted', { style: { fontSize: '12px' } }, 'O deslocamento escolhe em que dia a lua está nova. Mude até a fase bater com a sua história.'));
        }
        if (section === 'banners') {
          const bs = (c.banners || []).map(b => Object.assign({}, b));
          bs.forEach((b, i) => {
            const n = h('input.input', { value: b.name, placeholder: 'ex.: Era de Ouro' }); n.onchange = () => { bs[i].name = n.value; save({ banners: bs }); };
            const shapes = [['plain', 'Lisa'], ['bunting', 'Bandeirinhas'], ['scallop', 'Ondulada'], ['ribbon', 'Fita']];
            const pats = [['plain', 'Liso'], ['stripes', 'Listras'], ['dots', 'Bolinhas'], ['checker', 'Xadrez'], ['grid', 'Grade'], ['image', 'Imagem']];
            const segOf = (list, curv, fn) => h('div.seg', { style: { flexWrap: 'wrap' } }, list.map(([k, l]) => { const bb = h('button', { type: 'button', onclick: () => fn(k) }, l); if ((curv || 'plain') === k) bb.classList.add('on'); return bb; }));
            panel.append(h('div.glass', { style: { padding: '10px', borderRadius: '14px', display: 'grid', gap: '8px' } },
              h('div.row', n, T.iconBtn('trash', 'Apagar faixa', () => { bs.splice(i, 1); save({ banners: bs }); renderPanel(); }, '.sm')),
              Cal.datePicker(c, b.start, (v) => { if (v) { bs[i].start = v; save({ banners: bs }); } }, { label: 'de' }),
              Cal.datePicker(c, b.end, (v) => { bs[i].end = v; save({ banners: bs }); }, { label: 'até', clear: true }),
              h('span.muted', { style: { fontSize: '12px' } }, 'Formato'), segOf(shapes, b.shape, (k) => { bs[i].shape = k; save({ banners: bs }); renderPanel(); }),
              h('span.muted', { style: { fontSize: '12px' } }, 'Padrão'), segOf(pats, b.pattern, async (k) => { if (k === 'image') { const f = await T.pickFile('image/*'); if (!f) return; const r = await T.Assets.upload(f); if (!r) return; bs[i].image = r; } bs[i].pattern = k; save({ banners: bs }); renderPanel(); }),
              T.swatches(b.hue ?? 268, (x) => { bs[i].hue = x; save({ banners: bs }); renderPanel(); }),
              h('div.cal-ban-prev.sh-' + (b.shape || 'plain'), { style: { background: Cal.bannerBg(b) } }, h('span', b.name || 'Prévia'))));
          });
          panel.append(h('button.btn.sm', { onclick: () => { bs.push({ id: T.id(), name: 'Nova faixa', start: Object.assign({}, cur), end: Cal.fromAbs(c, Cal.abs(c, cur) + 6), shape: 'plain', pattern: 'plain', hue: T.HUES[(bs.length * 3) % T.HUES.length] }); save({ banners: bs }); renderPanel(); } }, icon('plus'), 'Faixa'),
            h('p.muted', { style: { fontSize: '12px' } }, 'Faixas marcam períodos: uma era, uma guerra, um festival. Elas aparecem no calendário e viram as eras da timeline.'));
        }
        if (section === 'cats') {
          panel.append(h('button.btn.sm', { onclick: (e) => T.typeEditor(e.currentTarget, (c.cats || []).map(x => Object.assign({ style: 'solid' }, x)), (nt) => { save({ cats: nt.map(x => ({ id: x.id, name: x.name, hue: x.hue })) }); renderPanel(); }, 'Categorias de evento') }, icon('edit'), 'Editar categorias'),
            h('div.names', (c.cats || []).map(x => h('span.chip', { style: { background: `hsl(${x.hue} 80% 60% / .2)`, color: `hsl(${x.hue} 60% 35%)` } }, x.name))));
        }
      }

      function render(){
        c = Cal.cfg(pid);
        if (cur.m >= c.months.length) cur.m = 0;
        renderHead();
        body.innerHTML = '';
        body.appendChild(view === 'year' ? yearView() : view === 'day' ? dayView() : monthView());
        if (settingsOpen) renderPanel();
      }
      render();
      const off = T.on('cal-changed', (p) => { if (p === pid && !panel.contains(document.activeElement)) { c = Cal.cfg(pid); renderHead(); body.innerHTML = ''; body.appendChild(view === 'year' ? yearView() : view === 'day' ? dayView() : monthView()); } });
      return { destroy(){ off(); persistCursor.flush(); } };
    }
  };
})(window.T);
