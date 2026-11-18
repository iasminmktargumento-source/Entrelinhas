/* Tinteiro — teia: constelação animada da história (cenas, tramas, pistas) e do mundo (páginas e links) */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;

  const BEAT_KINDS = {
    trama: { name: 'Trama', hue: 268 },
    pista: { name: 'Pista', hue: 46 },
    revelacao: { name: 'Revelação', hue: 330 },
    reviravolta: { name: 'Reviravolta', hue: 12 },
    momento: { name: 'Momento-chave', hue: 190 },
  };
  const DEFAULT_LINKS = [
    { id: 'causa', name: 'Causa → consequência', hue: 25, style: 'solid', dir: true },
    { id: 'pista', name: 'Pista → revelação', hue: 46, style: 'dotted', dir: true },
    { id: 'espelho', name: 'Espelho / paralelo', hue: 185, style: 'dashed', dir: false },
    { id: 'flashback', name: 'Flashback', hue: 280, style: 'dashed', dir: true },
    { id: 'conflito', name: 'Conflito', hue: 355, style: 'solid', dir: false },
  ];
  T.BEAT_KINDS = BEAT_KINDS;

  T.Views.web = {
    icon: 'web', title: () => 'Teia',
    mount(root, tab, ctx){
      const pid = ctx.pid;
      const board = T.board(pid, 'story', { links: [], types: DEFAULT_LINKS.map(t => Object.assign({}, t)) });
      const M = JSON.parse(JSON.stringify(board.meta)); M.links = M.links || []; M.types = M.types || DEFAULT_LINKS.map(t => Object.assign({}, t));
      const persist = T.debounce(() => S().update(board.id, { meta: JSON.parse(JSON.stringify(M)) }, { silent: true }), 600);
      let mode = tab.mode || 'story', paper = !!S().prefs().webPaper, filterPlot = null, loose = false;
      let nodes = [], links = [], byId = new Map(), adj = new Map();
      let view = { x: 0, y: 0, k: 1 }, alpha = 1, raf = 0, hover = null, selected = null, linking = null, drag = null;
      let play = null, playBtn = null; // {t0, dur, cur}
      // modo "Tudo" (estilo Obsidian): grupos que dá para ligar e desligar, busca, grafo local
      const GP = Object.assign({}, S().prefs().webGroups || {});
      let gq = '', local = 0, orphans = S().prefs().webOrphans !== false;
      const groupOf = (n) => n.group || n.kind;
      const groupOn = (n) => mode !== 'all' || GP[groupOf(n)] !== false;

      const wrap = h('div.web' + (paper ? '.paper' : ''));
      const cv = h('canvas.web-cv'); const ctx2 = cv.getContext('2d');
      const bar = h('div.rel-bar.glass.lg.hscroll');
      const side = h('div.web-side.glass.glass-strong.hidden');
      const tipEl = h('div.web-tip.hidden');
      wrap.append(cv, bar, side, tipEl); root.appendChild(wrap); wrap.classList.toggle('obs', mode === 'all');

      /* ----- montar o grafo ----- */
      function build(){
        const keep = new Map(nodes.map(n => [n.id, n]));
        nodes = []; links = []; byId = new Map(); adj = new Map();
        const flat = T.MS.flat(pid); const scenes = flat.filter(i => i.type === 'scene' || (i.type === 'chapter' && !S().children(pid, i.id).length));
        const order = new Map(scenes.map((s, i) => [s.id, i])); const N = Math.max(1, scenes.length);
        const add = (id, label, kind, hue, t, extra) => { const o = keep.get(id); const n = Object.assign({ id, label, kind, hue, t, r: 5, x: o ? o.x : (Math.random() - .5) * 400, y: o ? o.y : (Math.random() - .5) * 400, vx: 0, vy: 0 }, extra || {}); nodes.push(n); byId.set(id, n); return n; };
        const link = (a, b, type, opts = {}) => { if (!byId.has(a) || !byId.has(b) || a === b) return; links.push(Object.assign({ a, b, type }, opts)); };
        if (mode === 'story') {
          scenes.forEach(s => add(s.id, s.title || 'Cena', 'scene', s.meta?.pov ? T.povHue(s.meta.pov) : 220, order.get(s.id) / N));
          S().all(pid).filter(i => i.type === 'plot').forEach(p => add(p.id, p.title, 'plot', p.meta?.hue ?? 268, 0, { big: true }));
          S().all(pid).filter(i => i.type === 'beat').forEach(b => add(b.id, b.title, b.meta?.kind || 'momento', BEAT_KINDS[b.meta?.kind]?.hue ?? 190, 1));
          for (let i = 1; i < scenes.length; i++) link(scenes[i - 1].id, scenes[i].id, '_seq', { faint: true, len: 40 });
          scenes.forEach(s => (s.meta?.plots || []).forEach(pl => link(s.id, pl, '_plot', { len: 90 })));
          M.links.forEach(l => link(l.a, l.b, l.type, { id: l.id, note: l.note }));
          // tempo de aparição: tramas e pontos aparecem com a primeira cena ligada
          nodes.forEach(n => { if (n.kind !== 'scene') { const ts = links.filter(l => (l.a === n.id || l.b === n.id)).map(l => byId.get(l.a === n.id ? l.b : l.a)).filter(x => x && x.kind === 'scene').map(x => x.t); n.t = ts.length ? Math.min(...ts) : 1; } });
          if (filterPlot) { const keepIds = new Set([filterPlot]); links.forEach(l => { if (l.a === filterPlot) keepIds.add(l.b); if (l.b === filterPlot) keepIds.add(l.a); }); M.links.forEach(l => { if (keepIds.has(l.a)) keepIds.add(l.b); if (keepIds.has(l.b)) keepIds.add(l.a); }); nodes = nodes.filter(n => keepIds.has(n.id)); byId = new Map(nodes.map(n => [n.id, n])); links = links.filter(l => byId.has(l.a) && byId.has(l.b)); }
        } else if (mode === 'all') {
          const pages = T.Ent.pages(pid);
          pages.forEach(p => { const tp = p.meta?.tpl || 'livre'; add(p.id, p.title || 'Sem título', 'page', T.tplOf(p).hue, 0, { tpl: tp, group: 'p:' + tp }); });
          S().all(pid).filter(i => i.type === 'plot').forEach(p => add(p.id, p.title, 'plot', p.meta?.hue ?? 268, 0, { big: true, group: 'plot' }));
          S().all(pid).filter(i => i.type === 'beat').forEach(b => add(b.id, b.title, b.meta?.kind || 'momento', BEAT_KINDS[b.meta?.kind]?.hue ?? 190, 0, { group: 'beat' }));
          S().all(pid).filter(i => i.type === 'event').forEach(ev => add(ev.id, ev.title || 'Evento', 'event', (() => { try { return T.Cal.evCat(T.Cal.cfg(pid), ev)?.hue ?? 200; } catch (e) { return 200; } })(), 0, { group: 'event' }));
          scenes.forEach(sc => add(sc.id, sc.title || 'Cena', 'scene', 220, order.get(sc.id) / N, { small: true, group: 'scene' }));
          for (let i = 1; i < scenes.length; i++) link(scenes[i - 1].id, scenes[i].id, '_seq', { faint: true, len: 40 });
          scenes.forEach(sc => (sc.meta?.plots || []).forEach(pl => link(sc.id, pl, '_plot', { len: 90 })));
          M.links.forEach(l => link(l.a, l.b, l.type, { id: l.id, note: l.note }));
          const rel = S().all(pid).find(i => i.type === 'board' && i.meta?.kind === 'rel');
          (rel?.meta?.edges || []).forEach(e => { const t = (rel.meta.types || []).find(x => x.id === e.type); link(e.a, e.b, '_rel', { hue: t?.hue, len: 120 }); });
          S().all(pid).filter(i => i.type === 'event').forEach(ev => { (ev.meta?.chars || []).forEach(c => link(ev.id, c, '_ev', { len: 80 })); if (ev.meta?.scene) link(ev.id, ev.meta.scene, '_ev', { len: 70 }); });
          S().all(pid).filter(i => i.body && byId.has(i.id)).forEach(i => [...i.body.matchAll(/data-p="([^"]+)"/g)].forEach(m => { if (!links.some(l => l.a === i.id && l.b === m[1])) link(i.id, m[1], '_wl', { len: 80 }); }));
          pages.forEach(p => T.Wiki.mentions(pid, p).forEach(m => { if (!links.some(l => (l.a === m.it.id && l.b === p.id) || (l.b === m.it.id && l.a === p.id))) link(m.it.id, p.id, '_ment', { faint: true, len: 70 }); }));
        } else {
          const pages = T.Ent.pages(pid);
          pages.forEach(p => add(p.id, p.title, 'page', T.tplOf(p).hue, 0, { tpl: p.meta?.tpl }));
          scenes.forEach(s => add(s.id, s.title || 'Cena', 'scene', 220, order.get(s.id) / N, { small: true }));
          const rel = S().all(pid).find(i => i.type === 'board' && i.meta?.kind === 'rel');
          (rel?.meta?.edges || []).forEach(e => { const t = (rel.meta.types || []).find(x => x.id === e.type); link(e.a, e.b, '_rel', { hue: t?.hue, len: 120 }); });
          S().all(pid).filter(i => i.body && (i.type === 'page' || byId.has(i.id))).forEach(i => [...i.body.matchAll(/data-p="([^"]+)"/g)].forEach(m => link(i.id, m[1], '_wl', { len: 80 })));
          pages.forEach(p => T.Wiki.mentions(pid, p).forEach(m => { if (!links.some(l => l.a === m.it.id && l.b === p.id)) link(m.it.id, p.id, '_ment', { faint: true, len: 70 }); }));
          nodes.forEach(n => { if (n.kind === 'page') { const ts = links.filter(l => l.b === n.id || l.a === n.id).map(l => byId.get(l.a === n.id ? l.b : l.a)).filter(x => x?.kind === 'scene').map(x => x.t); n.t = ts.length ? Math.min(...ts) : 0; } });
        }
        links.forEach(l => { (adj.get(l.a) || adj.set(l.a, new Set()).get(l.a)).add(l.b); (adj.get(l.b) || adj.set(l.b, new Set()).get(l.b)).add(l.a); });
        nodes.forEach(n => { const d = adj.get(n.id)?.size || 0; n.deg = d; n.r = n.big ? 14 + Math.min(10, d) : n.small ? 3.5 + Math.min(5, d * .6) : 5 + Math.min(12, d * 1.4); });
        // pontas soltas
        nodes.forEach(n => n.loose = null);
        if (mode === 'story') {
          nodes.filter(n => n.kind === 'pista').forEach(n => { if (!M.links.some(l => l.a === n.id && l.type === 'pista')) n.loose = 'Pista sem revelação ligada'; });
          nodes.filter(n => n.kind === 'plot').forEach(n => { const ts = links.filter(l => l.b === n.id && l.type === '_plot').map(l => byId.get(l.a)?.t ?? 0); if (!ts.length) n.loose = 'Trama sem nenhuma cena'; else if (Math.max(...ts) < .75 && scenes.length > 4) n.loose = 'Trama some antes do último quarto do livro'; });
        }
        alpha = 1; kick();
      }

      /* ----- física ----- */
      function tick(){
        const vis = nodes.filter(visible);
        const k = alpha;
        for (let i = 0; i < vis.length; i++) {
          const a = vis[i];
          for (let j = i + 1; j < vis.length; j++) {
            const b = vis[j]; let dx = b.x - a.x, dy = b.y - a.y; let d2 = dx * dx + dy * dy || .01;
            if (d2 > 160000) continue;
            const f = (900 + (a.r + b.r) * 40) / d2 * k; const d = Math.sqrt(d2);
            dx /= d; dy /= d; a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
          }
        }
        links.forEach(l => {
          const a = byId.get(l.a), b = byId.get(l.b); if (!a || !b || !visible(a) || !visible(b)) return;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01; const L = l.len || 70; const s = (d - L) / d * (l.faint ? .02 : .05) * k;
          a.vx += dx * s; a.vy += dy * s; b.vx -= dx * s; b.vy -= dy * s;
        });
        vis.forEach(n => { n.vx -= n.x * .0016 * k; n.vy -= n.y * .0016 * k; if (n === drag?.n) return; n.vx *= .82; n.vy *= .82; n.x += n.vx; n.y += n.vy; });
        alpha = Math.max(play ? .25 : 0, alpha * .985);
      }
      const visible = (n) => {
        if (play && n.t > play.cur + 1e-6) return false;
        if (mode !== 'all') return true;
        if (!groupOn(n)) return false;
        if (!orphans && !n.deg) return false;
        if (local && selected && n !== selected) { const a1 = adj.get(selected.id) || new Set(); if (a1.has(n.id)) return true; if (local < 2) return false; for (const x of a1) if (adj.get(x)?.has(n.id)) return true; return false; }
        return true;
      };
      const qHit = (n) => gq && (n.label || '').toLowerCase().includes(gq);
      function kick(){ if (!raf) raf = requestAnimationFrame(loop); }
      function loop(now){
        raf = 0;
        if (play) { play.cur = Math.min(1, (now - play.t0) / play.dur); if (playBtn) playBtn.lastChild.textContent = ' ' + Math.round(play.cur * 100) + '%'; if (play.cur >= 1 && now - play.t0 > play.dur + 1200) { play = null; buildBar(); } }
        if (alpha > .003 || play || drag) tick();
        draw(now);
        if (alpha > .003 || play || drag || nodes.some(n => n.loose && loose) || hover) raf = requestAnimationFrame(loop);
      }

      /* ----- desenho ----- */
      function size(){ const r = wrap.getBoundingClientRect(); if (!r.width || !r.height) return; const d = devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; if (!view.init) { view = { x: r.width / 2, y: r.height / 2 + 20, k: 1, init: true }; } kick(); }
      const dark = () => !paper && (mode === 'all' || document.body.dataset.mode === 'dark');
      function draw(now){
        const d = devicePixelRatio || 1; const W = cv.width, H = cv.height;
        ctx2.setTransform(1, 0, 0, 1, 0, 0); ctx2.clearRect(0, 0, W, H);
        ctx2.setTransform(d * view.k, 0, 0, d * view.k, d * view.x, d * view.y);
        const focus = hover || selected; const nb = focus ? adj.get(focus.id) || new Set() : null;
        const ink = paper ? '40,36,30' : dark() ? '230,232,255' : '30,32,60';
        links.forEach(l => {
          const a = byId.get(l.a), b = byId.get(l.b); if (!a || !b || !visible(a) || !visible(b)) return;
          const t = M.types.find(x => x.id === l.type);
          const on = !focus || l.a === focus.id || l.b === focus.id;
          let col = t ? `hsla(${t.hue},80%,${paper ? 45 : 58}%,${on ? .85 : .12})` : l.type === '_plot' ? `hsla(${b.hue},70%,55%,${on ? .45 : .08})` : l.type === '_rel' ? `hsla(${l.hue ?? 230},80%,58%,${on ? .7 : .1})` : `rgba(${ink},${(l.faint ? .1 : .28) * (on ? 1 : .35)})`;
          ctx2.strokeStyle = col; ctx2.lineWidth = (t ? 1.8 : l.faint ? .7 : 1) / Math.sqrt(view.k);
          ctx2.setLineDash(t ? T.dashFor(t.style).split(' ').filter(Boolean).map(Number) : []);
          if (t?.style === 'anim') ctx2.lineDashOffset = -now / 40;
          ctx2.beginPath(); ctx2.moveTo(a.x, a.y); ctx2.lineTo(b.x, b.y); ctx2.stroke();
          if (t?.dir) { const ang = Math.atan2(b.y - a.y, b.x - a.x); const ex = b.x - Math.cos(ang) * (b.r + 3), ey = b.y - Math.sin(ang) * (b.r + 3); ctx2.setLineDash([]); ctx2.fillStyle = col; ctx2.beginPath(); ctx2.moveTo(ex, ey); ctx2.lineTo(ex - Math.cos(ang - .4) * 8, ey - Math.sin(ang - .4) * 8); ctx2.lineTo(ex - Math.cos(ang + .4) * 8, ey - Math.sin(ang + .4) * 8); ctx2.fill(); }
        });
        ctx2.setLineDash([]);
        nodes.forEach(n => {
          if (!visible(n)) return;
          const on = gq ? qHit(n) : (!focus || n === focus || nb.has(n.id));
          let r = n.r; if (gq && on) r *= 1.4; if (play && n.t > play.cur - .04) r *= .5 + .5 * Math.min(1, (play.cur - n.t + .04) / .04);
          ctx2.globalAlpha = on ? 1 : .18;
          ctx2.fillStyle = `hsl(${n.hue},${n.kind === 'scene' ? 55 : 80}%,${paper ? 48 : dark() ? 62 : 55}%)`;
          ctx2.beginPath();
          if (n.kind === 'pista' || n.kind === 'revelacao' || n.kind === 'reviravolta' || n.kind === 'momento') { ctx2.moveTo(n.x, n.y - r * 1.25); ctx2.lineTo(n.x + r * 1.1, n.y); ctx2.lineTo(n.x, n.y + r * 1.25); ctx2.lineTo(n.x - r * 1.1, n.y); ctx2.closePath(); }
          else ctx2.arc(n.x, n.y, r, 0, 7);
          if (mode === 'all' && !paper && on) { ctx2.shadowColor = `hsla(${n.hue},90%,65%,.9)`; ctx2.shadowBlur = (n === focus ? 22 : 10) * view.k; }
          ctx2.fill(); ctx2.shadowBlur = 0;
          if (n.kind === 'plot') { ctx2.strokeStyle = `hsla(${n.hue},80%,70%,.6)`; ctx2.lineWidth = 3; ctx2.stroke(); }
          if (n === selected) { ctx2.strokeStyle = `rgba(${ink},.9)`; ctx2.lineWidth = 2 / view.k; ctx2.beginPath(); ctx2.arc(n.x, n.y, r + 4, 0, 7); ctx2.stroke(); }
          if (loose && n.loose) { const p = (Math.sin(now / 250) + 1) / 2; ctx2.strokeStyle = `rgba(230,60,70,${.5 + p * .5})`; ctx2.lineWidth = 2.5 / view.k; ctx2.beginPath(); ctx2.arc(n.x, n.y, r + 6 + p * 5, 0, 7); ctx2.stroke(); }
          const showLabel = (gq && on) || (mode === 'all' && (n.kind !== 'scene' || view.k > .9) && (on || view.k > 1.1)) || n.big || n === focus || (focus && nb.has(n.id)) || view.k > 1.3 || (n.kind !== 'scene' && view.k > .8) || n.r > 11;
          if (showLabel) { ctx2.globalAlpha = on ? 1 : .3; ctx2.fillStyle = `rgba(${ink},.9)`; ctx2.font = `${n.big ? 600 : 500} ${(n.big ? 13 : 11) / Math.sqrt(view.k)}px "Instrument Sans", system-ui, sans-serif`; ctx2.textAlign = 'center'; ctx2.fillText(n.label.slice(0, 32), n.x, n.y + r + 13 / Math.sqrt(view.k)); }
          ctx2.globalAlpha = 1;
        });
        if (linking && linking.mouse) { ctx2.strokeStyle = `rgba(${ink},.6)`; ctx2.setLineDash([4, 4]); ctx2.beginPath(); ctx2.moveTo(linking.n.x, linking.n.y); ctx2.lineTo(linking.mouse[0], linking.mouse[1]); ctx2.stroke(); ctx2.setLineDash([]); }
      }

      /* ----- interação ----- */
      const toWorld = (cx, cy) => { const r = cv.getBoundingClientRect(); return [(cx - r.left - view.x) / view.k, (cy - r.top - view.y) / view.k]; };
      function pick(cx, cy){ const [x, y] = toWorld(cx, cy); let best = null, bd = 1e9; nodes.forEach(n => { if (!visible(n)) return; const d = Math.hypot(n.x - x, n.y - y); if (d < Math.max(n.r + 6, 10 / view.k) && d < bd) { bd = d; best = n; } }); return best; }
      cv.addEventListener('pointerdown', (e) => {
        const n = pick(e.clientX, e.clientY);
        cv.setPointerCapture(e.pointerId);
        const sx = e.clientX, sy = e.clientY; let moved = false;
        if (n && linking) { finishLink(n, e); return; }
        if (n) { drag = { n }; alpha = Math.max(alpha, .3); kick(); }
        const vx = view.x, vy = view.y;
        const mv = (ev) => {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 3) moved = true;
          if (drag) { const [x, y] = toWorld(ev.clientX, ev.clientY); drag.n.x = x; drag.n.y = y; drag.n.vx = drag.n.vy = 0; alpha = Math.max(alpha, .2); kick(); }
          else { view.x = vx + ev.clientX - sx; view.y = vy + ev.clientY - sy; kick(); }
        };
        const up = () => { cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); if (!moved) { selected = n || null; if (local && !selected) { local = 0; buildBar(); } if (local) alpha = Math.max(alpha, .5); renderSide(); kick(); } drag = null; };
        cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up);
      });
      cv.addEventListener('mousemove', (e) => {
        if (linking) { linking.mouse = toWorld(e.clientX, e.clientY); kick(); }
        const n = pick(e.clientX, e.clientY);
        if (n !== hover) { hover = n; kick(); }
        cv.style.cursor = n ? 'pointer' : linking ? 'crosshair' : 'grab';
        if (n) { tipEl.classList.remove('hidden'); const r = wrap.getBoundingClientRect(); tipEl.style.left = (e.clientX - r.left + 14) + 'px'; tipEl.style.top = (e.clientY - r.top + 10) + 'px'; tipEl.textContent = n.label + ' · ' + kindName(n) + (n.loose ? ' · ⚠ ' + n.loose : ''); }
        else tipEl.classList.add('hidden');
      });
      cv.addEventListener('mouseleave', () => { hover = null; tipEl.classList.add('hidden'); kick(); });
      cv.addEventListener('dblclick', (e) => { const n = pick(e.clientX, e.clientY); if (n) openNode(n); });
      cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top; const k = T.clamp(view.k * Math.exp(-e.deltaY * .0015), .2, 4); const s = k / view.k; view.x = px - (px - view.x) * s; view.y = py - (py - view.y) * s; view.k = k; kick(); }, { passive: false });
      cv.addEventListener('contextmenu', (e) => { e.preventDefault(); const n = pick(e.clientX, e.clientY); if (!n) return; selected = n; renderSide(); nodeMenu(n, e.clientX, e.clientY); });

      const kindName = (n) => n.kind === 'event' ? 'evento da timeline' : n.kind === 'scene' ? 'cena' : n.kind === 'page' ? T.tplOf(S().get(n.id)).name.toLowerCase() : (BEAT_KINDS[n.kind]?.name || n.kind).toLowerCase();
      function openNode(n){ const it = S().get(n.id); if (!it) return; if (it.type === 'event') { if (T.Cal?.editEvent) T.Cal.editEvent(pid, it); else T.Shell.open({ kind: 'timeline', ref: 'timeline' }); return; } if (it.type === 'page') T.Shell.open({ kind: 'page', ref: it.id }, { side: true }); else if (it.type === 'scene' || it.type === 'chapter') T.Shell.open({ kind: 'doc', ref: it.id }, { side: true }); else renderSide(); }
      function nodeMenu(n, x, y){
        const it = S().get(n.id);
        T.menu(x, y, [
          { label: 'Abrir', icon: 'pop', fn: () => openNode(n) },
          mode === 'story' ? { label: 'Ligar a outro ponto…', icon: 'link', fn: () => startLink(n) } : null,
          it && (it.type === 'beat' || it.type === 'plot') ? { label: 'Apagar', icon: 'trash', danger: true, fn: async () => { if (await T.confirm('Apagar “' + it.title + '”?', null, 'Apagar', true)) { M.links = M.links.filter(l => l.a !== it.id && l.b !== it.id); persist(); S().remove(it.id); selected = null; build(); renderSide(); } } } : null,
        ]);
      }
      function startLink(n){ linking = { n }; T.toast('Agora clique no ponto que se liga a “' + n.label + '”. Esc cancela.'); }
      function finishLink(target, e){
        const from = linking.n; linking = null; if (target === from) return;
        const anchor = h('span', { style: { position: 'fixed', left: e.clientX + 'px', top: e.clientY + 'px', width: '1px', height: '1px' } }); document.body.appendChild(anchor);
        const pop = T.popover(anchor, h('div.stack', { style: { width: '280px' } }, h('b', from.label + ' → ' + target.label),
          h('div.type-pick', M.types.map(t => h('button', { type: 'button', onclick: () => { M.links.push({ id: T.id(), a: from.id, b: target.id, type: t.id }); persist(); build(); renderSide(); pop.remove(); } }, h('i', { style: { background: T.typeColor(t) } }), t.name))),
          h('button.btn.sm', { onclick: async () => { pop.remove(); const nm = await T.ask('Nome do novo tipo de ligação', { ok: 'Criar' }); if (!nm) return; const t = { id: T.id(), name: nm, hue: T.HUES[M.types.length % T.HUES.length], style: 'solid', dir: true }; M.types.push(t); M.links.push({ id: T.id(), a: from.id, b: target.id, type: t.id }); persist(); build(); } }, icon('plus'), 'Novo tipo…')));
        setTimeout(() => anchor.remove(), 50);
      }
      const onKey = (e) => { if (e.key === 'Escape' && linking) { linking = null; kick(); } };
      document.addEventListener('keydown', onKey);

      /* ----- painel lateral do ponto escolhido ----- */
      function renderSide(){
        if (!selected) { side.classList.add('hidden'); return; }
        const n = selected; const it = S().get(n.id); if (!it) { side.classList.add('hidden'); return; }
        side.classList.remove('hidden'); side.innerHTML = '';
        const conns = [...(adj.get(n.id) || [])].map(id => byId.get(id)).filter(Boolean);
        side.append(h('div.row', h('span.chip', { style: { background: `hsl(${n.hue} 80% 60% / .2)`, color: `hsl(${n.hue} 60% 35%)` } }, kindName(n)), h('span.grow'), T.iconBtn('x', 'Fechar', () => { selected = null; renderSide(); kick(); }, '.sm')));
        if (it.type === 'beat' || it.type === 'plot') {
          const t = h('input.input', { value: it.title, 'aria-label': 'Nome' }); t.onchange = () => { S().update(it.id, { title: t.value }); n.label = t.value; kick(); };
          const note = h('textarea.textarea', { placeholder: 'Anotações' }); note.value = it.meta?.note || ''; note.onchange = () => S().update(it.id, { meta: { note: note.value } });
          side.append(t, note);
          if (it.type === 'beat') { const sel = h('select.select', Object.entries(BEAT_KINDS).filter(([k]) => k !== 'trama').map(([k, b]) => h('option', { value: k, selected: it.meta?.kind === k }, b.name))); sel.onchange = () => { S().update(it.id, { meta: { kind: sel.value } }); build(); }; side.append(sel); }
        } else side.append(h('h3', { style: { margin: '4px 0', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '24px', textTransform: 'none', letterSpacing: 0, color: 'var(--ink)' } }, it.title || 'Sem título'));
        if (n.loose) side.append(h('div.banner', { style: { background: 'hsl(350 80% 60% / .14)', margin: 0 } }, '⚠ ' + n.loose));
        if (mode === 'story' && (it.type === 'scene' || it.type === 'chapter')) {
          const plots = S().all(pid).filter(i => i.type === 'plot');
          if (plots.length) side.append(h('div.field', h('span.muted', { style: { fontSize: '12px' } }, 'Tramas desta cena'), h('div.row', { style: { flexWrap: 'wrap', gap: '6px' } }, plots.map(p => { const on = (it.meta?.plots || []).includes(p.id); return h('button.btn.sm' + (on ? '.primary' : ''), { onclick: () => { const cur = new Set(it.meta?.plots || []); on ? cur.delete(p.id) : cur.add(p.id); S().update(it.id, { meta: { plots: [...cur] } }); build(); renderSide(); } }, p.title); }))));
        }
        side.append(h('div.row', { style: { flexWrap: 'wrap', gap: '6px' } },
          it.type !== 'beat' && it.type !== 'plot' ? h('button.btn.sm', { onclick: () => openNode(n) }, icon('pop'), 'Abrir') : null,
          mode === 'story' ? h('button.btn.sm', { onclick: () => startLink(n) }, icon('link'), 'Ligar a…') : null));
        const myLinks = M.links.filter(l => l.a === n.id || l.b === n.id);
        if (myLinks.length) side.append(h('div.stack', { style: { gap: '6px' } }, h('span.muted', { style: { fontSize: '12px' } }, 'Ligações'), myLinks.map(l => { const t = M.types.find(x => x.id === l.type); const other = byId.get(l.a === n.id ? l.b : l.a); return h('div.row', { style: { fontSize: '12.5px' } }, h('i', { style: { width: '10px', height: '10px', borderRadius: '50%', background: T.typeColor(t), flex: 'none' } }), h('span.grow', (l.a === n.id ? '→ ' : '← ') + (other?.label || '?') + ' · ' + (t?.name || '')), T.iconBtn('x', 'Apagar ligação', () => { M.links = M.links.filter(x => x !== l); persist(); build(); renderSide(); }, '.sm')); })));
        else if (conns.length) side.append(h('p.muted', { style: { margin: 0, fontSize: '12.5px' } }, conns.length + ' conexões'));
      }

      /* ----- barra de ferramentas ----- */
      function buildBar(){
        bar.innerHTML = '';
        const seg = h('div.seg', [['all', 'Tudo'], ['story', 'História'], ['world', 'Mundo']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { mode = k; tab.mode = k; T.emit('tab-changed', tab); selected = null; filterPlot = null; local = 0; wrap.classList.toggle('obs', mode === 'all'); build(); buildBar(); renderSide(); } }, l); if (k === mode) b.classList.add('on'); return b; }));
        const plots = S().all(pid).filter(i => i.type === 'plot');
        const more = T.menuButton('dots', 'Mais', 'Tipos de ligação, tramas, pontas soltas, fundo', (btn) => {
          const box = h('div.stack', { style: { width: '300px' } }, h('b', 'Opções da teia'),
            mode === 'story' ? h('button.btn.sm', { onclick: () => { T.closePopover(); T.typeEditor(btn, M.types, (nt) => { M.types = nt; persist(); build(); }, 'Tipos de ligação'); } }, icon('filter'), 'Tipos de ligação…') : null,
            mode === 'story' && plots.length ? h('label.field', 'Mostrar só uma trama', (() => { const sl = h('select.select', { 'aria-label': 'Mostrar uma trama' }, h('option', { value: '' }, 'Todas as tramas'), plots.map(p => h('option', { value: p.id, selected: filterPlot === p.id }, p.title))); sl.onchange = () => { filterPlot = sl.value || null; build(); }; return sl; })()) : null,
            mode === 'story' ? h('label.row', { style: { gap: '8px', fontSize: '13px' } }, (() => { const cb = h('input', { type: 'checkbox', checked: loose }); cb.onchange = () => { loose = cb.checked; kick(); const n = nodes.filter(x => x.loose).length; if (loose) T.toast(n ? n + (n === 1 ? ' ponta solta encontrada.' : ' pontas soltas encontradas.') : 'Nenhuma ponta solta. Tudo amarrado!'); }; return cb; })(), 'Destacar pontas soltas') : null,
            h('label.row', { style: { gap: '8px', fontSize: '13px' } }, (() => { const cb = h('input', { type: 'checkbox', checked: paper }); cb.onchange = () => { paper = cb.checked; S().setPrefs({ webPaper: paper }); wrap.classList.toggle('paper', paper); kick(); }; return cb; })(), 'Fundo cor de papel'));
          T.popover(btn, box);
        });
        let allBits = [];
        if (mode === 'all') {
          const srch = h('input.input.web-q', { type: 'search', placeholder: 'Procurar no grafo…', value: gq, 'aria-label': 'Procurar no grafo' });
          srch.oninput = () => { gq = srch.value.trim().toLowerCase(); kick(); };
          srch.onkeydown = (e) => { if (e.key === 'Enter') { const n = nodes.find(x => visible(x) && qHit(x)); if (n) { const r = wrap.getBoundingClientRect(); view.k = Math.max(view.k, 1.2); view.x = r.width / 2 - n.x * view.k; view.y = r.height / 2 - n.y * view.k; selected = n; renderSide(); kick(); } } };
          const groupsBtn = T.menuButton('filter', 'Grupos', 'Escolher o que aparece no grafo', (btn) => {
            const present = new Map(); nodes.forEach(n => { const g = groupOf(n); if (!present.has(g)) present.set(g, { n: 0, hue: n.hue }); present.get(g).n++; });
            const name = (g) => g.startsWith('p:') ? (T.WIKI_TPL[g.slice(2)] || T.WIKI_TPL.livre).plural : ({ plot: 'Tramas', beat: 'Pistas e momentos', event: 'Eventos da timeline', scene: 'Cenas do manuscrito' })[g] || g;
            const box = h('div.stack.web-groups', { style: { width: '280px' } }, h('b', 'O que aparece'),
              ...[...present.entries()].map(([g, x]) => { const cb = h('input', { type: 'checkbox', checked: GP[g] !== false }); cb.onchange = () => { GP[g] = cb.checked; S().setPrefs({ webGroups: Object.assign({}, GP) }); alpha = Math.max(alpha, .4); kick(); }; return h('label.row', { style: { gap: '8px', fontSize: '13px' } }, cb, h('i.web-dot', { style: { background: `hsl(${x.hue} 80% 58%)` } }), h('span.grow', name(g)), h('span.muted.num', String(x.n))); }),
              h('label.row', { style: { gap: '8px', fontSize: '13px', borderTop: '1px solid var(--line)', paddingTop: '8px' } }, (() => { const cb = h('input', { type: 'checkbox', checked: orphans }); cb.onchange = () => { orphans = cb.checked; S().setPrefs({ webOrphans: orphans }); kick(); }; return cb; })(), 'Mostrar pontos sem ligação'));
            T.popover(btn, box);
          });
          const loc = h('div.seg', { title: 'Grafo local: mostra só o ponto escolhido e o que está ligado a ele' }, [[0, 'Geral'], [1, 'Local'], [2, 'Local +2']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { if (k && !selected) { T.toast('Primeiro toque num ponto do grafo.'); return; } local = k; alpha = Math.max(alpha, .5); kick(); buildBar(); } }, l); if (local === k) b.classList.add('on'); return b; }));
          allBits = [srch, groupsBtn, loc];
        }
        bar.append(...[seg, ...allBits,
          mode === 'story' ? h('button.btn.sm.primary', { onclick: (e) => newMenu(e.currentTarget) }, icon('plus'), 'Novo ponto') : null,
          (playBtn = h('button.btn.sm', { title: 'Ver a teia crescer na ordem da história', onclick: () => { play = { t0: performance.now(), dur: 9000, cur: 0 }; alpha = 1; kick(); buildBar(); } }, icon('play'), h('span', play ? ' ' + Math.round(play.cur * 100) + '%' : 'Reproduzir'))),
          more,
          h('span.grow'),
          T.iconBtn('focus', 'Centralizar', () => { const r = wrap.getBoundingClientRect(); view.x = r.width / 2; view.y = r.height / 2 + 20; view.k = 1; kick(); }, '.sm')].filter(Boolean));
      }
      function newMenu(btn){
        T.menuAt(btn, Object.entries(BEAT_KINDS).map(([k, b]) => ({ label: b.name, icon: k === 'trama' ? 'web' : 'spark', fn: async () => {
          const nm = await T.ask('Nome: ' + b.name.toLowerCase(), { placeholder: k === 'trama' ? 'ex.: A busca pelo sino' : k === 'pista' ? 'ex.: o anel quebrado no capítulo 2' : 'ex.: Vera descobre a verdade', ok: 'Criar' }); if (!nm) return;
          const it = k === 'trama' ? S().create({ pid, type: 'plot', area: 'story', title: nm, meta: { hue: T.HUES[S().all(pid).filter(i => i.type === 'plot').length * 3 % T.HUES.length] } }) : S().create({ pid, type: 'beat', area: 'story', title: nm, meta: { kind: k } });
          build(); const n = byId.get(it.id); if (n) { n.x = (cv.clientWidth / 2 - view.x) / view.k + 30; n.y = (cv.clientHeight / 2 - view.y) / view.k; selected = n; renderSide(); }
          T.toast(k === 'trama' ? 'Trama criada. Clique numa cena e marque as tramas dela.' : 'Ponto criado. Use “Ligar a…” para conectar a cenas.');
        } })));
      }

      const ro = new ResizeObserver(size); ro.observe(wrap);
      build(); buildBar(); size();
      if (!nodes.length) side.classList.remove('hidden'), side.append(h('b', 'Teia vazia'), h('p', { style: { margin: 0, fontSize: '13px', color: 'var(--ink-2)' } }, 'Escreva cenas no manuscrito ou crie páginas na wiki para a teia ganhar pontos.'));
      const offTheme = T.on('save-status', () => {});
      return { destroy(){ cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('keydown', onKey); persist.flush(); offTheme(); }, flush(){ persist.flush(); } };
    }
  };
})(window.T);
