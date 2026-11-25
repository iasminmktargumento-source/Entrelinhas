/* Entrelinhas — post-its: um quadro para brainstorm, com notas que crescem conforme você escreve */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;
  const COLORS = [
    ['amarelo', '#fff3a3', '#e8c93a'], ['rosa', '#ffd1e3', '#e88ab0'], ['azul', '#cfe8ff', '#6fa9e0'],
    ['verde', '#d4f5c9', '#78c26a'], ['lilás', '#e4d7ff', '#9d84e0'], ['laranja', '#ffdcbc', '#f0a060'], ['branco', '#fbfbf7', '#c9c9c0'],
  ];
  const colorOf = (k) => COLORS.find(c => c[0] === k) || COLORS[0];
  const BOARD_W = 4200, BOARD_H = 3000, CLAMP = 170;

  T.Views.postits = {
    icon: 'sticky', title: () => 'Post-its',
    mount(root, tab, ctx){
      const pid = ctx.pid;
      const notes = () => S().all(pid).filter(i => i.type === 'postit').sort((a, b) => (a.meta?.z || 0) - (b.meta?.z || 0));
      const wrap = h('div.view.pi-view');
      const board = h('div.pi-board', { style: { width: BOARD_W + 'px', height: BOARD_H + 'px' } });
      const scrollBox = h('div.pi-scroll', board);
      let zoom = S().prefs().piZoom || 1;
      const applyZoom = () => { board.style.transform = 'scale(' + zoom + ')'; board.style.width = BOARD_W + 'px'; board.style.height = BOARD_H + 'px'; sizer.style.width = BOARD_W * zoom + 'px'; sizer.style.height = BOARD_H * zoom + 'px'; zl.textContent = Math.round(zoom * 100) + '%'; };
      const sizer = h('div.pi-sizer'); scrollBox.prepend(sizer);
      const zl = h('span.num.pi-zl');
      const setZoom = (z, cx, cy) => {
        const old = zoom; zoom = T.clamp(+z.toFixed(2), .3, 1.6); if (zoom === old) return;
        const r = scrollBox.getBoundingClientRect(); cx = cx ?? r.width / 2; cy = cy ?? r.height / 2;
        const bx = (scrollBox.scrollLeft + cx) / old, by = (scrollBox.scrollTop + cy) / old;
        applyZoom(); scrollBox.scrollLeft = bx * zoom - cx; scrollBox.scrollTop = by * zoom - cy; S().setPrefs({ piZoom: zoom });
      };
      let topZ = Math.max(1, ...notes().map(n => n.meta?.z || 0));
      const center = () => { const r = scrollBox.getBoundingClientRect(); return { x: (scrollBox.scrollLeft + r.width / 2) / zoom, y: (scrollBox.scrollTop + r.height / 2) / zoom }; };
      function addNote(x, y, color){
        const c = color || S().prefs().piColor || 'amarelo';
        const n = S().create({ pid, type: 'postit', area: 'brainstorm', parent: null, title: '', body: '', order: Date.now(), meta: { x: Math.round(x - 110), y: Math.round(y - 40), color: c, z: ++topZ, w: 230 } });
        draw(); setTimeout(() => { const el = board.querySelector('[data-id="' + n.id + '"] .pi-text'); el && el.focus(); }, 30);
      }
      const bar = h('div.pi-bar.glass',
        h('button.btn.sm.primary', { type: 'button', onclick: () => { const c = center(); const ns = notes(); const last = ns.sort((a, b) => (b.order || 0) - (a.order || 0))[0]; if (last && Math.abs((last.meta?.x || 0) + 110 - c.x) < 900 && Math.abs((last.meta?.y || 0) + 40 - c.y) < 700) { const lx = (last.meta?.x || 0) + (last.meta?.w || 230) + 24; const r = scrollBox.getBoundingClientRect(); if ((lx + 230) * zoom - scrollBox.scrollLeft < r.width) addNote(lx + 110, (last.meta?.y || 0) + 40); else addNote(c.x - 300 + 110, (last.meta?.y || 0) + 260); } else addNote(c.x, c.y - 120); } }, icon('plus'), 'Novo post-it'),
        h('div.pi-swatches', { title: 'Cor dos próximos post-its' }, COLORS.map(([k, bg, bd]) => h('button.pi-sw' + ((S().prefs().piColor || 'amarelo') === k ? '.on' : ''), { type: 'button', title: k, style: { background: bg, borderColor: bd }, onclick: (e) => { S().setPrefs({ piColor: k }); bar.querySelectorAll('.pi-sw').forEach(b => b.classList.toggle('on', b === e.currentTarget)); } }))),
        h('span.grow'),
        h('span.muted.pi-hint', 'Dois cliques no quadro criam um post-it · arraste pela faixa de cima'),
        h('div.zoom-ctl', h('button', { type: 'button', title: 'Afastar', onclick: () => setZoom(zoom - .1) }, '−'), zl, h('button', { type: 'button', title: 'Aproximar', onclick: () => setZoom(zoom + .1) }, '+')),
        h('button.btn.sm', { type: 'button', title: 'Organizar todos em grade', onclick: () => tidy() }, icon('grid'), 'Organizar'));
      wrap.append(bar, scrollBox);
      root.appendChild(wrap);

      function tidy(){
        const list = notes(); const c = center(); const cols = Math.max(1, Math.round(Math.sqrt(list.length * 1.6)));
        const x0 = Math.max(40, c.x - cols * 125), y0 = Math.max(40, c.y - 200);
        const colH = Array(cols).fill(y0);
        list.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(n => {
          const el = board.querySelector('[data-id="' + n.id + '"]'); const hgt = el ? el.offsetHeight : 160;
          let k = colH.indexOf(Math.min(...colH));
          S().update(n.id, { meta: { x: Math.round(x0 + k * 250), y: Math.round(colH[k]) } }, { silent: true }); colH[k] += hgt + 20;
        });
        draw();
      }

      function noteEl(n){
        const [cname, bg, bd] = colorOf(n.meta?.color);
        const text = h('div.pi-text', { contenteditable: 'true', spellcheck: 'true', lang: 'pt-BR', 'data-ph': 'Escreva uma ideia…' });
        text.textContent = n.body || '';
        const more = h('button.pi-more', { type: 'button' });
        const el = h('div.pi-note', { 'data-id': n.id, style: { left: (n.meta?.x || 0) + 'px', top: (n.meta?.y || 0) + 'px', width: (n.meta?.w || 230) + 'px', zIndex: n.meta?.z || 1, '--pi-bg': bg, '--pi-bd': bd } },
          h('div.pi-grip', { title: 'Arraste para mover' },
            h('span.pi-dots'),
            h('button.pi-ic', { type: 'button', title: 'Cor', onclick: (e) => { e.stopPropagation(); T.menuAt(e.currentTarget, COLORS.map(([k, b2, d2]) => ({ label: k[0].toUpperCase() + k.slice(1), on: k === cname, icon: 'dot', color: d2, fn: () => { S().update(n.id, { meta: { color: k } }); draw(); } }))); } }, icon('dot')),
            h('button.pi-ic', { type: 'button', title: 'Apagar post-it', onclick: async (e) => { e.stopPropagation(); if (!(text.textContent || '').trim() || await T.confirm('Apagar este post-it?', (text.textContent || '').slice(0, 80), 'Apagar', true)) { S().remove(n.id); draw(); } } }, icon('x'))),
          text, more);
        // ver mais / ver menos
        let open = !!n.meta?.open;
        const fit = () => {
          const editing = document.activeElement === text;
          text.style.maxHeight = ''; const full = text.scrollHeight;
          const long = full > CLAMP + 24;
          el.classList.toggle('long', long && !editing);
          if (long && !editing && !open) { text.style.maxHeight = CLAMP + 'px'; el.classList.add('clamped'); } else el.classList.remove('clamped');
          more.hidden = !long || editing; more.textContent = open ? 'Ver menos ▴' : 'Ver mais ▾';
        };
        more.onclick = (e) => { e.stopPropagation(); open = !open; S().update(n.id, { meta: { open } }, { silent: true }); fit(); };
        text.addEventListener('focus', () => { el.classList.add('editing'); fit(); raise(); });
        text.addEventListener('blur', () => { el.classList.remove('editing'); const v = text.innerText.replace(/\n{3,}/g, '\n\n').trim(); if (v !== (n.body || '')) S().update(n.id, { body: v, title: v.split('\n')[0].slice(0, 60) }, { silent: true }); n.body = v; fit(); });
        text.addEventListener('input', T.debounce(() => { const v = text.innerText.trim(); S().update(n.id, { body: v, title: v.split('\n')[0].slice(0, 60) }, { silent: true }); }, 500));
        text.addEventListener('paste', (e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); });
        text.addEventListener('keydown', (e) => { if (e.key === 'Escape') text.blur(); });
        const raise = () => { if ((n.meta?.z || 0) < topZ) { n.meta = Object.assign({}, n.meta, { z: ++topZ }); el.style.zIndex = topZ; S().update(n.id, { meta: { z: topZ } }, { silent: true }); } };
        // arrastar pela faixa
        el.querySelector('.pi-grip').addEventListener('pointerdown', (e) => {
          if (e.target.closest('button')) return; e.preventDefault(); raise();
          const sx = e.clientX, sy = e.clientY, ox = n.meta?.x || 0, oy = n.meta?.y || 0; el.classList.add('drag');
          const mv = (ev) => { const x = T.clamp(ox + (ev.clientX - sx) / zoom, 0, BOARD_W - 80), y = T.clamp(oy + (ev.clientY - sy) / zoom, 0, BOARD_H - 40); el.style.left = x + 'px'; el.style.top = y + 'px'; n.meta = Object.assign({}, n.meta, { x, y }); };
          const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); el.classList.remove('drag'); S().update(n.id, { meta: { x: Math.round(n.meta.x), y: Math.round(n.meta.y) } }, { silent: true }); };
          addEventListener('pointermove', mv); addEventListener('pointerup', up);
        });
        // largura: puxar o canto
        const rz = h('span.pi-rz', { title: 'Arraste para mudar a largura' }); el.appendChild(rz);
        rz.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); const sx = e.clientX, ow = n.meta?.w || 230;
          const mv = (ev) => { const w = T.clamp(ow + (ev.clientX - sx) / zoom, 150, 520); el.style.width = w + 'px'; n.meta = Object.assign({}, n.meta, { w }); fit(); };
          const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); S().update(n.id, { meta: { w: Math.round(n.meta.w) } }, { silent: true }); };
          addEventListener('pointermove', mv); addEventListener('pointerup', up); });
        requestAnimationFrame(fit);
        return el;
      }
      function draw(){
        const focusId = document.activeElement?.closest?.('.pi-note')?.dataset.id;
        board.replaceChildren(...notes().map(noteEl));
        if (!notes().length) board.appendChild(h('div.pi-empty', { style: { left: (center().x - 170) + 'px', top: (center().y - 60) + 'px' } }, h('b', 'Seu quadro de brainstorm'), h('span', 'Clique em “Novo post-it” ou dê dois cliques em qualquer lugar do quadro.')));
        if (focusId) board.querySelector('[data-id="' + focusId + '"] .pi-text')?.focus();
      }
      board.addEventListener('dblclick', (e) => { if (e.target !== board && !e.target.classList.contains('pi-empty')) return; const r = board.getBoundingClientRect(); addNote((e.clientX - r.left) / zoom, (e.clientY - r.top) / zoom); });
      // arrastar o fundo para passear pelo quadro
      scrollBox.addEventListener('pointerdown', (e) => {
        if (e.target !== board && e.target !== scrollBox && e.target !== sizer) return;
        const sx = e.clientX, sy = e.clientY, ol = scrollBox.scrollLeft, ot = scrollBox.scrollTop; scrollBox.classList.add('panning');
        const mv = (ev) => { scrollBox.scrollLeft = ol - (ev.clientX - sx); scrollBox.scrollTop = ot - (ev.clientY - sy); };
        const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); scrollBox.classList.remove('panning'); S().setPrefs({ piScroll: { [pid]: [scrollBox.scrollLeft, scrollBox.scrollTop] } }); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up);
      });
      scrollBox.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const r = scrollBox.getBoundingClientRect(); setZoom(zoom + (e.deltaY < 0 ? .1 : -.1), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
      applyZoom(); draw();
      requestAnimationFrame(() => {
        const sv = (S().prefs().piScroll || {})[pid];
        if (sv) { scrollBox.scrollLeft = sv[0]; scrollBox.scrollTop = sv[1]; }
        else { const ns = notes(); const x = ns.length ? Math.min(...ns.map(n => n.meta?.x || 0)) - 60 : BOARD_W / 2 - 400; const y = ns.length ? Math.min(...ns.map(n => n.meta?.y || 0)) - 60 : BOARD_H / 2 - 300; scrollBox.scrollLeft = Math.max(0, x * zoom); scrollBox.scrollTop = Math.max(0, y * zoom); }
        if (!notes().length) draw();
      });
      const off = T.on('items', (ev) => { if (ev?.item?.type === 'postit' && ev.item.pid === pid && !wrap.contains(document.activeElement)) draw(); });
      return { destroy(){ off(); document.activeElement?.closest?.('.pi-note') && document.activeElement.blur(); } };
    },
  };
})();
