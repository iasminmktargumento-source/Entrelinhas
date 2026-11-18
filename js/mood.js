/* Tinteiro — moodboards: colagem livre com imagens, notas, textos e cores; paleta extraída das imagens */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const NOTE_COLORS = ['#fff3a8', '#ffd3c4', '#d7f0c7', '#cfe6ff', '#ead7ff', '#ffffff'];
  const BGS = { linho: 'Linho', cortica: 'Cortiça', papel: 'Papel', escuro: 'Escuro', quadriculado: 'Quadriculado' };

  /* ---------- paleta: k-means simples nos pixels ---------- */
  function paletteOf(img, k = 5){
    try {
      const c = document.createElement('canvas'); const s = 64; c.width = s; c.height = Math.max(1, Math.round(s * img.naturalHeight / img.naturalWidth));
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height).data; const px = [];
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
      if (!px.length) return [];
      let cs = Array.from({ length: k }, (_, i) => px[Math.floor((i + .5) / k * px.length)].slice());
      for (let it = 0; it < 8; it++) {
        const sum = cs.map(() => [0, 0, 0, 0]);
        px.forEach(p => { let b = 0, bd = 1e9; cs.forEach((c2, j) => { const dd = (p[0] - c2[0]) ** 2 + (p[1] - c2[1]) ** 2 + (p[2] - c2[2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); const s2 = sum[b]; s2[0] += p[0]; s2[1] += p[1]; s2[2] += p[2]; s2[3]++; });
        cs = cs.map((c2, j) => sum[j][3] ? [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3], sum[j][3]] : c2);
      }
      return cs.sort((a, b) => (b[3] || 0) - (a[3] || 0)).map(c2 => hex(c2));
    } catch (e) { return []; }
  }
  const hex = (c) => '#' + c.slice(0, 3).map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const lum = (hx) => { const n = parseInt(hx.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (r * .299 + g * .587 + b * .114) / 255; };
  function mergePalette(list, n = 8){ // junta cores parecidas
    const out = [];
    list.forEach(hx => { const a = parseInt(hx.slice(1), 16); const ar = [(a >> 16) & 255, (a >> 8) & 255, a & 255]; if (!out.some(o => { const b = parseInt(o.slice(1), 16); return Math.hypot(ar[0] - ((b >> 16) & 255), ar[1] - ((b >> 8) & 255), ar[2] - (b & 255)) < 38; })) out.push(hx); });
    return out.slice(0, n);
  }

  T.Moods = {
    list(pid){ return S().all(pid).filter(i => i.type === 'mood').sort(S().byOrder); },
    create(pid, title){ const it = S().create({ pid, type: 'mood', area: 'world', title: title || 'Novo moodboard', meta: { items: [], bg: 'linho' } }); T.emit('tree-changed'); return it; },
  };

  /* ---------- galeria ---------- */
  T.Views.moods = {
    icon: 'moodboard', title: () => 'Moodboards',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad'); root.appendChild(v);
      const newB = async () => { const t = await T.ask('Nome do moodboard', { placeholder: 'Ex.: A cidade submersa, Vera, Estética do livro' }); if (t == null) return; const it = T.Moods.create(pid, t || 'Novo moodboard'); T.Shell.open({ kind: 'mood', ref: it.id }); };
      function render(){
        const list = T.Moods.list(pid); v.innerHTML = '';
        v.append(h('div.mp-gal-head', h('div', h('h1', 'Moodboards'), h('p.muted', 'Colagens livres com imagens, notas e cores para cada personagem, lugar ou para o clima do livro.')), h('button.btn.primary', { onclick: newB }, icon('plus'), 'Novo moodboard')));
        if (!list.length) { v.append(h('div.mp-empty.glass', icon('moodboard'), h('h2', 'Nenhum moodboard ainda'), h('p', 'Crie um e jogue imagens, notas e cores lá dentro. Dá para arrastar arquivos e colar imagens direto.'), h('button.btn.primary', { onclick: newB }, 'Criar um moodboard'))); return; }
        const grid = h('div.mp-gal-grid');
        list.forEach(m => {
          const its = (m.meta?.items || []).filter(x => x.kind === 'img').slice(0, 4);
          const th = h('div.md-th' + '.bg-' + (m.meta?.bg || 'linho'));
          its.forEach(x => { const im = h('img', { alt: '' }); T.Assets.resolve(x.ref).then(u => { if (u) im.src = u; }); th.appendChild(im); });
          const pal = h('div.md-th-pal', (m.meta?.palette || []).slice(0, 6).map(c => h('i', { style: { background: c } })));
          grid.appendChild(h('div.mp-card-g.glass', { role: 'button', tabindex: '0', onclick: () => T.Shell.open({ kind: 'mood', ref: m.id }) }, th, pal,
            h('div.mp-cg-b', h('b', m.title || 'Moodboard'), h('span.muted', (m.meta?.items || []).length + ' peças')),
            h('button.icon-btn.sm.mp-cg-menu', { title: 'Opções', onclick: (e) => { e.stopPropagation(); T.menuAt(e.currentTarget, [
              { label: 'Renomear', icon: 'edit', fn: async () => { const t = await T.ask('Nome', { value: m.title }); if (t) { S().update(m.id, { title: t }); T.emit('tree-changed'); render(); } } },
              '-', { label: 'Apagar moodboard', icon: 'trash', danger: true, fn: async () => { if (await T.confirm('Apagar “' + m.title + '”?', 'As imagens enviadas continuam guardadas, mas o quadro some.', 'Apagar', true)) { S().remove(m.id); T.emit('tree-changed'); render(); } } }]); } }, icon('dots'))));
        });
        v.appendChild(grid);
      }
      render();
      const off = T.on('tree-changed', () => render());
      return { destroy(){ off(); } };
    }
  };

  /* ---------- quadro ---------- */
  T.Views.mood = {
    icon: 'moodboard', title: (tab) => S().get(tab.ref)?.title || 'Moodboard',
    mount(root, tab, ctx){
      const pid = ctx.pid; const board = S().get(tab.ref);
      if (!board) { root.appendChild(h('div.pane-empty', 'Este moodboard foi apagado.')); return { destroy(){} }; }
      let items = (board.meta?.items || []).map(x => Object.assign({}, x));
      let bg = board.meta?.bg || 'linho'; let palette = (board.meta?.palette || []).slice();
      let vw = Object.assign({ x: 0, y: 0, z: 1 }, tab.vw || {});
      let sel = null;
      const wrap = h('div.md' + '.bg-' + bg); root.appendChild(wrap);
      const layer = h('div.md-layer'); const bar = h('div.md-bar.glass.lg'); const pal = h('div.md-pal.glass'); const hint = h('div.mp-hint', 'Arraste imagens do computador para cá, ou cole (Ctrl+V). Arraste o fundo para andar, role para aproximar.');
      wrap.append(layer, bar, pal, hint);
      const markHas = () => wrap.classList.toggle('has-items', items.length > 0);
      const save = T.debounce(() => { markHas(); S().update(board.id, { meta: { items: items.map(x => { const { _el, _place, ...r } = x; return r; }), bg, palette } }); }, 600);
      const persistTab = T.debounce(() => { tab.vw = Object.assign({}, vw); T.emit('tab-changed', tab); }, 600);
      const applyView = () => { layer.style.transform = `translate(${vw.x}px, ${vw.y}px) scale(${vw.z})`; };
      const topZ = () => items.reduce((a, x) => Math.max(a, x.z || 0), 0) + 1;
      const center = () => { const r = wrap.getBoundingClientRect(); return [(r.width / 2 - vw.x) / vw.z, (r.height / 2 - vw.y) / vw.z]; };

      const filt = (f) => !f ? 'none' : `brightness(${f.b ?? 100}%) contrast(${f.c ?? 100}%) saturate(${f.s ?? 100}%) sepia(${f.sep ?? 0}%) grayscale(${f.g ?? 0}%) blur(${f.bl ?? 0}px)`;
      function applyCrop(im, it){ const c = it.crop || { x: 0, y: 0, w: 1, h: 1 }; Object.assign(im.style, { position: 'absolute', width: (100 / c.w) + '%', height: (100 / c.h) + '%', left: (-c.x / c.w * 100) + '%', top: (-c.y / c.h * 100) + '%', objectFit: 'fill', filter: filt(it.filter), transform: it.flip ? 'scaleX(-1)' : '' }); }
      function editImage(it){
        T.Assets.resolve(it.ref).then(u => { if (!u) return T.toast('Não achei a imagem.');
          T.modal((box, close) => {
            const im = new Image(); im.src = u;
            let c = Object.assign({ x: 0, y: 0, w: 1, h: 1 }, it.crop || {}); let f = Object.assign({ b: 100, c: 100, s: 100, sep: 0, g: 0, bl: 0 }, it.filter || {}); let flip = !!it.flip; let ar = null;
            const stage = h('div.mdx-stage'); const pic = h('img', { src: u, alt: '' }); const rect = h('div.mdx-rect', ['nw', 'ne', 'sw', 'se'].map(k => h('i.mdx-h.' + k, { 'data-k': k })));
            stage.append(pic, rect);
            const place = () => { Object.assign(rect.style, { left: c.x * 100 + '%', top: c.y * 100 + '%', width: c.w * 100 + '%', height: c.h * 100 + '%' }); pic.style.filter = filt(f); pic.style.transform = flip ? 'scaleX(-1)' : ''; };
            let dr = null;
            stage.addEventListener('pointerdown', (e) => { const r = stage.getBoundingClientRect(); stage.setPointerCapture(e.pointerId); dr = { k: e.target.dataset.k || (e.target === rect ? 'mv' : 'new'), x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, c0: Object.assign({}, c) }; if (dr.k === 'new') { c = { x: dr.x, y: dr.y, w: .01, h: .01 }; dr.c0 = Object.assign({}, c); dr.k = 'se'; } });
            stage.addEventListener('pointermove', (e) => { if (!dr) return; const r = stage.getBoundingClientRect(); const x = clamp((e.clientX - r.left) / r.width, 0, 1), y = clamp((e.clientY - r.top) / r.height, 0, 1); const o = dr.c0; let n = Object.assign({}, o);
              if (dr.k === 'mv') { n.x = clamp(o.x + x - dr.x, 0, 1 - o.w); n.y = clamp(o.y + y - dr.y, 0, 1 - o.h); }
              else { let x0 = o.x, y0 = o.y, x1 = o.x + o.w, y1 = o.y + o.h; if (dr.k.includes('w')) x0 = Math.min(x, x1 - .03); if (dr.k.includes('e')) x1 = Math.max(x, x0 + .03); if (dr.k.includes('n')) y0 = Math.min(y, y1 - .03); if (dr.k.includes('s')) y1 = Math.max(y, y0 + .03);
                n = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
                if (ar && im.naturalWidth) { const k = im.naturalWidth / im.naturalHeight; const hh = n.w * k / ar; if (dr.k.includes('n')) n.y = y1 - hh; n.h = hh; if (n.y < 0 || n.y + n.h > 1) { n.h = Math.min(n.h, 1 - Math.max(0, n.y)); n.w = n.h * ar / k; if (dr.k.includes('w')) n.x = x1 - n.w; } } }
              c = n; place(); });
            stage.addEventListener('pointerup', () => dr = null);
            const setAR = (a) => { ar = a; if (a && im.naturalWidth) { const k = im.naturalWidth / im.naturalHeight; let w = c.w, hh = w * k / a; if (hh > 1) { hh = 1; w = a / k; } if (w > 1) { w = 1; hh = k / a; } c = { x: clamp(c.x, 0, 1 - w), y: clamp(c.y, 0, 1 - hh), w, h: hh }; } place(); };
            const arSeg = h('div.seg', [[null, 'Livre'], [1, '1:1'], [4 / 5, '4:5'], [3 / 4, '3:4'], [16 / 9, '16:9'], [9 / 16, '9:16']].map(([a, n]) => { const b = h('button' + (a === ar ? '.on' : ''), { type: 'button', onclick: () => { arSeg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); setAR(a); } }, n); return b; }));
            const sl = (label, key, min, max) => { const r = h('input', { type: 'range', min, max, value: f[key] }); r.oninput = () => { f[key] = +r.value; place(); }; return h('label.mp-rng', h('span', label), r); };
            box.append(h('h2', 'Recortar e ajustar'), h('p.sub', 'Arraste para recortar (ou desenhe um retângulo novo). As mudanças não estragam a foto original.'), stage,
              h('div.mdx-tools', h('div.cp-r', h('b', 'Proporção'), arSeg),
                h('div.mdx-sl', sl('Brilho', 'b', 30, 180), sl('Contraste', 'c', 30, 180), sl('Saturação', 's', 0, 220), sl('Sépia', 'sep', 0, 100), sl('Preto e branco', 'g', 0, 100), sl('Desfoque', 'bl', 0, 8)),
                h('div.mp-row', h('button.btn.sm', { type: 'button', onclick: () => { flip = !flip; place(); } }, 'Espelhar'), h('button.btn.sm', { type: 'button', onclick: () => { c = { x: 0, y: 0, w: 1, h: 1 }; f = { b: 100, c: 100, s: 100, sep: 0, g: 0, bl: 0 }; flip = false; box.querySelectorAll('.mdx-sl input').forEach((r, i) => r.value = [100, 100, 100, 0, 0, 0][i]); place(); } }, 'Voltar ao original'))),
              h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Cancelar'), h('button.btn.primary', { onclick: () => {
                const nat = im.naturalWidth ? [im.naturalWidth, im.naturalHeight] : (it.nat || [it.w, it.h]); const newAr = (c.w * nat[0]) / (c.h * nat[1]);
                const area = it.w * it.h; it.crop = c; it.filter = f; it.flip = flip; it.w = Math.sqrt(area * newAr); it.h = it.w / newAr; renderItem(it); select(it.id); save(); close(); } }, 'Aplicar')));
            im.onload = () => place(); place();
          }, { wide: true });
        });
      }
      function resizeSel(it, w){ const ar = it.w / it.h; it.w = w; it.h = w / ar; it._place(); save(); }
      function renderItem(it){
        if (it._el) it._el.remove();
        const el = h('div.md-it.md-' + it.kind, { 'data-id': it.id });
        const place = () => { el.style.left = it.x + 'px'; el.style.top = it.y + 'px'; el.style.width = it.w + 'px'; el.style.height = it.h + 'px'; el.style.transform = `rotate(${it.rot || 0}deg)`; el.style.zIndex = it.z || 1; };
        if (it.kind === 'img') { const im = h('img', { alt: '', draggable: 'false' }); const box = h('div.md-crop', im); applyCrop(im, it); T.Assets.resolve(it.ref).then(u => { if (u) { im.src = u; im.onload = () => { it.nat = [im.naturalWidth, im.naturalHeight]; if (!it.pal) { it.pal = paletteOf(im); recomputePalette(); save(); } }; } }); el.appendChild(box); if (it.cap) el.appendChild(h('span.md-cap', it.cap)); }
        else if (it.kind === 'note') { el.style.background = it.color || NOTE_COLORS[0]; const t = h('div.md-txt', { contenteditable: 'false' }); t.textContent = it.text || ''; el.appendChild(t); }
        else if (it.kind === 'text') { const t = h('div.md-txt', { contenteditable: 'false' }); t.textContent = it.text || ''; el.appendChild(t); el.style.color = it.color || '#2a2520'; }
        else if (it.kind === 'color') { el.append(h('div.md-sw', { style: { background: it.color } }), h('span.md-hex', (it.label ? it.label + ' · ' : '') + it.color.toUpperCase())); }
        el.append(h('i.md-h.rs', { title: 'Mudar o tamanho' }), h('i.md-h.rt', { title: 'Girar' }));
        place(); it._el = el; it._place = place; layer.appendChild(el);
        if (sel === it.id) el.classList.add('sel');
        el.addEventListener('pointerdown', (e) => onItemDown(e, it));
        el.addEventListener('dblclick', (e) => { e.stopPropagation(); editText(it); });
      }
      function renderAll(){ layer.querySelectorAll('.md-it').forEach(e => e.remove()); items.forEach(x => { x._el = null; renderItem(x); }); drawBar(); drawPal(); }
      function select(id){ sel = id; layer.querySelectorAll('.md-it').forEach(e => e.classList.toggle('sel', e.dataset.id === id)); drawBar(); }
      function editText(it, what){
        if (it.kind !== 'note' && it.kind !== 'text') { if (it.kind === 'img' && what !== 'cap') { editImage(it); return; } if (it.kind === 'img') { T.ask('Legenda da imagem', { value: it.cap || '' }).then(v => { if (v == null) return; it.cap = v; renderItem(it); save(); }); } else if (it.kind === 'color') { T.ask('Nome da cor', { value: it.label || '', placeholder: 'Ex.: azul da capa' }).then(v => { if (v == null) return; it.label = v; renderItem(it); save(); }); } return; }
        const t = it._el.querySelector('.md-txt'); t.contentEditable = 'true'; t.focus(); const r = document.createRange(); r.selectNodeContents(t); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        const done = () => { t.contentEditable = 'false'; it.text = t.innerText.trim(); save(); t.removeEventListener('blur', done); };
        t.addEventListener('blur', done);
      }
      let drag = null;
      function onItemDown(e, it){
        if (e.target.isContentEditable) return;
        e.stopPropagation(); select(it.id); it.z = topZ(); it._place();
        const mode = e.target.classList.contains('rs') ? 'rs' : e.target.classList.contains('rt') ? 'rt' : 'mv';
        drag = { it, mode, sx: e.clientX, sy: e.clientY, x: it.x, y: it.y, w: it.w, h: it.h, rot: it.rot || 0, ar: it.w / it.h };
        if (mode === 'rt') { const r = it._el.getBoundingClientRect(); drag.cx = r.left + r.width / 2; drag.cy = r.top + r.height / 2; drag.a0 = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI; }
        wrap.setPointerCapture(e.pointerId);
      }
      wrap.addEventListener('pointerdown', (e) => { if (e.target !== wrap && e.target !== layer) return; select(null); drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, x: vw.x, y: vw.y }; wrap.setPointerCapture(e.pointerId); });
      wrap.addEventListener('pointermove', (e) => {
        if (!drag) return; const dx = (e.clientX - drag.sx), dy = (e.clientY - drag.sy);
        if (drag.mode === 'pan') { vw.x = drag.x + dx; vw.y = drag.y + dy; applyView(); persistTab(); return; }
        const it = drag.it; drag.moved = true;
        if (drag.mode === 'mv') { it.x = drag.x + dx / vw.z; it.y = drag.y + dy / vw.z; }
        else if (drag.mode === 'rs') { let w = Math.max(60, drag.w + dx / vw.z); let hh = Math.max(40, drag.h + dy / vw.z); if (it.kind === 'img' && !e.shiftKey) hh = w / drag.ar; it.w = w; it.h = hh; }
        else if (drag.mode === 'rt') { const a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI; let r = drag.rot + a - drag.a0; if (e.shiftKey) r = Math.round(r / 15) * 15; it.rot = Math.round(r * 10) / 10; }
        it._place();
      });
      const up = () => { if (drag && drag.it && drag.moved) save(); drag = null; };
      wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
      wrap.addEventListener('wheel', (e) => { e.preventDefault(); const r = wrap.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top; zoomTo(vw.z * Math.exp(-e.deltaY * .0015), sx, sy); }, { passive: false });

      function zoomTo(z, cx, cy){ const r = wrap.getBoundingClientRect(); cx = cx ?? r.width / 2; cy = cy ?? r.height / 2; z = clamp(z, .15, 4); const wx = (cx - vw.x) / vw.z, wy = (cy - vw.y) / vw.z; vw.z = z; vw.x = cx - wx * z; vw.y = cy - wy * z; applyView(); persistTab(); const zl = bar.querySelector('.md-zoom .zv'); if (zl) zl.textContent = Math.round(vw.z * 100) + '%'; }
      const zoomBy = (k) => zoomTo(vw.z * k);
      /* ---------- adicionar ---------- */
      async function addImages(files, at){
        const imgs = [...files].filter(f => f.type.startsWith('image/')); if (!imgs.length) return;
        let [cx, cy] = at || center(); T.toast(imgs.length > 1 ? 'Enviando ' + imgs.length + ' imagens…' : 'Enviando a imagem…');
        for (const f of imgs) {
          const ref = await T.Assets.upload(f); if (!ref) continue;
          const url = await T.Assets.resolve(ref); const ar = await new Promise(r => { const im = new Image(); im.onload = () => r(im.naturalWidth / im.naturalHeight || 1); im.onerror = () => r(1); im.src = url; });
          const w = ar >= 1 ? 280 : 200; const it = { id: T.id(), kind: 'img', ref, x: cx - w / 2 + (Math.random() - .5) * 60, y: cy - w / ar / 2 + (Math.random() - .5) * 60, w, h: w / ar, rot: Math.round((Math.random() - .5) * 8), z: topZ() };
          items.push(it); renderItem(it); cx += 40; cy += 30;
        }
        save();
      }
      const addNote = () => { const [cx, cy] = center(); const it = { id: T.id(), kind: 'note', text: 'Nova nota', color: NOTE_COLORS[items.filter(x => x.kind === 'note').length % NOTE_COLORS.length], x: cx - 90, y: cy - 70, w: 180, h: 140, rot: Math.round((Math.random() - .5) * 6), z: topZ() }; items.push(it); renderItem(it); select(it.id); editText(it); save(); };
      const addText = () => { const [cx, cy] = center(); const it = { id: T.id(), kind: 'text', text: 'Palavra', x: cx - 120, y: cy - 30, w: 240, h: 70, rot: 0, z: topZ(), font: 'display' }; items.push(it); renderItem(it); select(it.id); editText(it); save(); };
      const addColor = (c) => { const [cx, cy] = center(); const it = { id: T.id(), kind: 'color', color: c, x: cx - 55 + (Math.random() - .5) * 80, y: cy - 70, w: 110, h: 140, rot: 0, z: topZ() }; items.push(it); renderItem(it); select(it.id); save(); };
      wrap.addEventListener('dragover', (e) => { e.preventDefault(); wrap.classList.add('drop'); });
      wrap.addEventListener('dragleave', () => wrap.classList.remove('drop'));
      wrap.addEventListener('drop', (e) => { e.preventDefault(); wrap.classList.remove('drop'); const r = wrap.getBoundingClientRect(); addImages(e.dataTransfer.files, [(e.clientX - r.left - vw.x) / vw.z, (e.clientY - r.top - vw.y) / vw.z]); });
      const onPaste = (e) => { if (!wrap.isConnected || !wrap.matches(':hover') || document.activeElement?.isContentEditable) return; const fs = [...(e.clipboardData?.files || [])]; if (fs.length) { e.preventDefault(); addImages(fs); } };
      document.addEventListener('paste', onPaste);
      const onKey = (e) => {
        if (wrap.isConnected && (e.ctrlKey || e.metaKey) && ['=', '+', '-', '0'].includes(e.key) && wrap.matches(':hover')) { e.preventDefault(); if (e.key === '0') zoomTo(1); else zoomBy(e.key === '-' ? 1 / 1.25 : 1.25); return; }
        if (!wrap.isConnected || !sel || e.target.closest('input, textarea, [contenteditable="true"]')) return;
        const it = items.find(x => x.id === sel); if (!it) return;
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeIt(it); }
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); dup(it); }
      };
      document.addEventListener('keydown', onKey);
      function removeIt(it){ const i = items.indexOf(it); items.splice(i, 1); it._el.remove(); sel = null; drawBar(); recomputePalette(); save(); T.toast('Peça tirada do quadro.', { action: { label: 'Desfazer', fn: () => { items.splice(i, 0, it); renderItem(it); recomputePalette(); save(); } } }); }
      function dup(it){ const { _el, _place, ...r } = it; const c = Object.assign({}, r, { id: T.id(), x: it.x + 24, y: it.y + 24, z: topZ() }); items.push(c); renderItem(c); select(c.id); save(); }

      /* ---------- paleta ---------- */
      function recomputePalette(){ const all = []; items.filter(x => x.kind === 'img' && x.pal).forEach(x => x.pal.forEach(c => all.push(c))); palette = mergePalette(all, 8); drawPal(); }
      function drawPal(){
        pal.innerHTML = '';
        if (!palette.length) { pal.append(h('span.muted', 'A paleta aparece aqui quando você puser imagens.')); return; }
        pal.append(h('b', 'Paleta'), ...palette.map(c => h('button.md-pc', { title: c.toUpperCase() + ' · clique para copiar, duplo clique para pôr no quadro', style: { background: c, color: lum(c) > .6 ? '#222' : '#fff' }, onclick: () => { navigator.clipboard?.writeText(c.toUpperCase()); T.toast('Cor ' + c.toUpperCase() + ' copiada.'); }, ondblclick: () => addColor(c) }, h('span', c.toUpperCase()))),
          h('button.btn.sm', { title: 'Usar estas cores no tema do livro', onclick: () => usePaletteAsTheme() }, icon('wand'), 'Usar no tema'));
      }
      function usePaletteAsTheme(){
        const c = palette.find(x => { const l = lum(x); return l > .25 && l < .75; }) || palette[0]; if (!c) return;
        const n = parseInt(c.slice(1), 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0;
        if (mx !== mn) { const d = mx - mn; hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh = Math.round(hh * 60); if (hh < 0) hh += 360; }
        S().update(pid, { meta: { hue: hh } }); T.Shell.applyTheme && T.Shell.applyTheme(); T.emit('theme-changed'); T.toast('A cor do livro agora vem do moodboard.');
      }

      /* ---------- exportar como imagem / fundo ---------- */
      async function snapshot(){
        if (!items.length) return null;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        items.forEach(it => { const r = Math.hypot(it.w, it.h) / 2, cx = it.x + it.w / 2, cy = it.y + it.h / 2; x0 = Math.min(x0, cx - r); y0 = Math.min(y0, cy - r); x1 = Math.max(x1, cx + r); y1 = Math.max(y1, cy + r); });
        const pad = 40; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
        const sc = Math.min(2, 2400 / Math.max(x1 - x0, y1 - y0));
        const cv = document.createElement('canvas'); cv.width = Math.round((x1 - x0) * sc); cv.height = Math.round((y1 - y0) * sc); const c = cv.getContext('2d');
        c.fillStyle = { linho: '#ece4d6', cortica: '#c9a27a', papel: '#f7f3ea', escuro: '#1d1e24', quadriculado: '#f4f6fa' }[bg] || '#ece4d6'; c.fillRect(0, 0, cv.width, cv.height);
        const sorted = items.slice().sort((a, b) => (a.z || 0) - (b.z || 0));
        for (const it of sorted) {
          c.save(); c.translate((it.x + it.w / 2 - x0) * sc, (it.y + it.h / 2 - y0) * sc); c.rotate((it.rot || 0) * Math.PI / 180); const w = it.w * sc, hh = it.h * sc;
          c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 12 * sc; c.shadowOffsetY = 4 * sc;
          if (it.kind === 'img') { const u = await T.Assets.resolve(it.ref); await new Promise(r => { const im = new Image(); im.onload = () => { const cr = it.crop || { x: 0, y: 0, w: 1, h: 1 }; c.fillStyle = '#fff'; c.fillRect(-w / 2, -hh / 2, w, hh); c.shadowColor = 'transparent'; c.save(); c.filter = filt(it.filter); if (it.flip) c.scale(-1, 1); const p = 6 * sc; c.drawImage(im, cr.x * im.naturalWidth, cr.y * im.naturalHeight, cr.w * im.naturalWidth, cr.h * im.naturalHeight, -w / 2 + p, -hh / 2 + p, w - 2 * p, hh - 2 * p); c.restore(); r(); }; im.onerror = r; im.src = u; }); }
          else if (it.kind === 'note') { c.fillStyle = it.color || NOTE_COLORS[0]; c.fillRect(-w / 2, -hh / 2, w, hh); c.shadowColor = 'transparent'; c.fillStyle = '#2b2620'; c.font = `${15 * sc}px "Instrument Sans", sans-serif`; wrapText(c, it.text || '', -w / 2 + 14 * sc, -hh / 2 + 26 * sc, w - 28 * sc, 20 * sc); }
          else if (it.kind === 'text') { c.shadowColor = 'transparent'; c.fillStyle = it.color || '#2a2520'; c.font = `${Math.min(hh * .7, 44 * sc)}px "Instrument Serif", serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.text || '', 0, 0); }
          else if (it.kind === 'color') { c.fillStyle = '#fff'; c.fillRect(-w / 2, -hh / 2, w, hh); c.shadowColor = 'transparent'; c.fillStyle = it.color; c.fillRect(-w / 2 + 8 * sc, -hh / 2 + 8 * sc, w - 16 * sc, hh - 40 * sc); c.fillStyle = '#333'; c.font = `${11 * sc}px "Instrument Sans", sans-serif`; c.fillText(it.color.toUpperCase(), -w / 2 + 10 * sc, hh / 2 - 13 * sc); }
          c.restore();
        }
        return await new Promise(r => cv.toBlob(r, 'image/jpeg', .9));
      }
      function wrapText(c, text, x, y, maxW, lh){ text.split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; line = w; } else line = t; }); c.fillText(line, x, y); y += lh; }); }
      async function useAsBg(where){
        const b = await snapshot(); if (!b) return T.toast('Ponha algumas peças no quadro primeiro.');
        T.toast('Preparando o fundo…');
        const f = new File([b], (S().get(board.id)?.title || 'moodboard') + '.jpg', { type: 'image/jpeg' });
        const ref = await T.Assets.upload(f); if (!ref) return;
        const p = S().get(pid);
        if (where === 'compose') { const g = { kind: 'image', ref, name: 'Moodboard · ' + (S().get(board.id)?.title || '') }; S().update(pid, { meta: { bgs: [...(p.meta?.bgs || []), g], compose: Object.assign({}, p.meta?.compose || {}, { bg: g }) } }); T.toast('Pronto: o moodboard é o fundo do modo composição (Ferramentas › Modo composição).'); }
        else { S().update(pid, { meta: { walls: Object.assign({ blur: 14, strength: 70 }, p.meta?.walls || {}, { [where]: ref }) } }); T.Shell.applyWalls && T.Shell.applyWalls(); T.toast(where === 'doc' ? 'Pronto: o moodboard é o papel de parede da escrita.' : 'Pronto: o moodboard é o fundo geral do livro.'); }
      }
      async function exportImg(){ const b = await snapshot(); if (!b) return T.toast('O quadro está vazio.'); const name = (S().get(board.id)?.title || 'moodboard') + '.jpg'; const ok = await T.Download.save(name, b); if (ok === null) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); } }

      /* ---------- barra ---------- */
      function drawBar(){
        bar.innerHTML = '';
        const it = sel ? items.find(x => x.id === sel) : null;
        bar.append(h('button.mp-title', { title: 'Renomear', onclick: async () => { const t = await T.ask('Nome do moodboard', { value: S().get(board.id)?.title }); if (t) { S().update(board.id, { title: t }); T.emit('tree-changed'); drawBar(); } } }, S().get(board.id)?.title || 'Moodboard'),
          h('button.btn.sm', { onclick: async () => { const inp = h('input', { type: 'file', accept: 'image/*', multiple: true, style: { display: 'none' } }); inp.onchange = () => { addImages(inp.files); inp.remove(); }; document.body.appendChild(inp); inp.click(); } }, icon('image'), 'Imagens'),
          h('button.btn.sm', { onclick: addNote }, icon('idea'), 'Nota'),
          h('button.btn.sm', { onclick: addText }, icon('text'), 'Palavra'),
          (() => { const ci = h('input', { type: 'color', value: '#6c5ce7', style: { position: 'absolute', opacity: 0, width: 0, height: 0 } }); ci.onchange = () => addColor(ci.value); return h('label.btn.sm', { style: { position: 'relative' } }, ci, h('span.md-dot'), 'Cor'); })(),
          h('div.zoom-ctl.md-zoom', h('button', { type: 'button', title: 'Afastar', onclick: () => zoomBy(1 / 1.25) }, '−'), h('button.zv', { type: 'button', title: 'Voltar para 100%', onclick: () => zoomTo(1) }, Math.round(vw.z * 100) + '%'), h('button', { type: 'button', title: 'Aproximar', onclick: () => zoomBy(1.25) }, '+'), h('button', { type: 'button', title: 'Mostrar tudo', onclick: () => { fit(); drawBar(); } }, icon('focus'))),
          T.menuButton('wall', 'Fundo', 'Fundo do quadro', (b) => T.menuAt(b, Object.entries(BGS).map(([k, n]) => ({ label: (bg === k ? '✓ ' : '') + n, fn: () => { wrap.classList.remove('bg-' + bg); bg = k; wrap.classList.add('bg-' + bg); save(); } })))),
          T.menuButton('dots', 'Usar', 'Usar o moodboard em outro lugar', (b) => T.menuAt(b, [
            { head: 'Usar como fundo' },
            { label: 'do modo composição', icon: 'image', fn: () => useAsBg('compose') }, { label: 'da tela de escrita', icon: 'doc', fn: () => useAsBg('doc') }, { label: 'geral do livro', icon: 'wall', fn: () => useAsBg('default') },
            '-', { label: 'Baixar como imagem', icon: 'download', fn: exportImg }, { label: 'Organizar em grade', icon: 'grid', fn: tidy }, { label: 'Todos os moodboards', icon: 'moodboard', fn: () => T.Shell.open({ kind: 'moods', ref: 'moods' }) }])));
        if (it) {
          const tools = h('div.md-seltools');
          if (it.kind === 'img') { const r = h('input', { type: 'range', min: 60, max: 1000, step: 10, value: Math.round(it.w), title: 'Tamanho da foto' }); r.oninput = () => resizeSel(it, +r.value);
            tools.append(h('span.md-szl', 'Tamanho'), ...[['P', 160], ['M', 280], ['G', 460]].map(([n, w]) => h('button.btn.sm', { title: 'Tamanho ' + n, onclick: () => { resizeSel(it, w); r.value = w; } }, n)), r,
              h('button.btn.sm', { title: 'Recortar, ajustar cores e espelhar (duplo clique na foto)', onclick: () => editImage(it) }, icon('scissors'), 'Recortar e editar'), h('button.icon-btn.sm', { title: 'Legenda', onclick: () => editText(it, 'cap') }, icon('text'))); }
          if (it.kind === 'note') NOTE_COLORS.forEach(c => tools.appendChild(h('button.md-ncol' + (it.color === c ? '.on' : ''), { style: { background: c }, title: 'Cor da nota', onclick: () => { it.color = c; renderItem(it); save(); drawBar(); } })));
          if (it.kind === 'text') { const ci = h('input', { type: 'color', value: it.color || '#2a2520' }); ci.oninput = () => { it.color = ci.value; it._el.style.color = ci.value; save(); }; tools.appendChild(h('label.md-tcol', { title: 'Cor do texto' }, ci)); }
          tools.append(h('button.icon-btn.sm', { title: 'Editar texto ou legenda (duplo clique)', onclick: () => editText(it) }, icon('edit')), h('button.icon-btn.sm', { title: 'Duplicar (Ctrl+D)', onclick: () => dup(it) }, icon('copy')), h('button.icon-btn.sm', { title: 'Mandar para trás', onclick: () => { const mn = items.reduce((a, x) => Math.min(a, x.z || 0), 0); it.z = mn - 1; it._place(); save(); } }, icon('down')), h('button.icon-btn.sm', { title: 'Tirar (Delete)', onclick: () => removeIt(it) }, icon('trash')));
          bar.appendChild(tools);
        }
      }
      function tidy(){
        const cols = Math.ceil(Math.sqrt(items.length)); let x = 0, y = 0, rowH = 0, i = 0;
        items.forEach(it => { it.rot = 0; it.x = x; it.y = y; rowH = Math.max(rowH, it.h); x += it.w + 24; i++; if (i % cols === 0) { x = 0; y += rowH + 24; rowH = 0; } it._place(); });
        save(); fit();
      }
      function fit(){ if (!items.length) { vw = { x: 0, y: 0, z: 1 }; applyView(); return; } let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; items.forEach(it => { x0 = Math.min(x0, it.x); y0 = Math.min(y0, it.y); x1 = Math.max(x1, it.x + it.w); y1 = Math.max(y1, it.y + it.h); }); const r = wrap.getBoundingClientRect(); const z = clamp(Math.min((r.width - 80) / (x1 - x0), (r.height - 180) / (y1 - y0)), .15, 1.5); vw = { z, x: (r.width - (x1 - x0) * z) / 2 - x0 * z, y: (r.height - (y1 - y0) * z) / 2 - y0 * z + 20 }; applyView(); persistTab(); }

      if (!tab.vw) requestAnimationFrame(() => { const r = wrap.getBoundingClientRect(); if (!items.length) { vw = { x: r.width / 2 - 300, y: r.height / 2 - 200, z: 1 }; applyView(); } else fit(); });
      applyView(); renderAll(); markHas();
      return { destroy(){ document.removeEventListener('paste', onPaste); document.removeEventListener('keydown', onKey); save.flush && save.flush(); } };
    }
  };
})(window.T);
