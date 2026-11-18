/* Tinteiro — línguas inventadas: alfabeto desenhado à mão, dicionário e gerador de nomes */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const POS = ['substantivo', 'verbo', 'adjetivo', 'advérbio', 'pronome', 'partícula', 'expressão', 'gíria', 'nome próprio', 'interjeição', 'outro'];
  const DEFAULT_LETTERS = 'a b c d e f g h i j k l m n o p q r s t u v w x y z';

  const glyphSVG = (strokes, hue) => {
    if (!strokes || !strokes.length) return '';
    const paths = strokes.map(s => '<path d="M' + s.p.map(pt => pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' L') + '" stroke-width="' + (s.w || 7) + '"/>').join('');
    return '<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  };
  const lettersOf = (lang) => (lang?.meta?.letters || DEFAULT_LETTERS).split(/\s+/).filter(Boolean);

  T.Lang = {
    scriptHTML(lang, word){
      if (!lang) return '';
      const g = lang.meta?.glyphs || {}; const letters = lettersOf(lang).filter(l => g[l]?.length).sort((a, b) => b.length - a.length);
      if (!letters.length) return '';
      const w = (word || '').toLowerCase(); let i = 0, out = '';
      while (i < w.length) {
        const ch = w[i];
        if (ch === ' ') { out += '<span class="gsp"></span>'; i++; continue; }
        let hit = letters.find(l => w.startsWith(l, i));
        if (!hit) { const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, ''); if (g[base]?.length) { out += glyphSVG(g[base]); i++; continue; } }
        if (hit) { out += glyphSVG(g[hit]); i += hit.length; } else { out += '<span class="gx">' + T.esc(ch) + '</span>'; i++; }
      }
      return '<span class="script" style="color:hsl(' + (lang.meta?.hue ?? 268) + ' 70% 45%)">' + out + '</span>';
    },
    // gerador de nomes: cadeia de Markov de ordem 2 sobre as palavras da língua
    names(lang, n = 12){
      const words = S().all(lang.pid).filter(w => w.type === 'word' && w.parent === lang.id).map(w => w.title.toLowerCase().replace(/[^\p{L}'-]/gu, '')).filter(w => w.length > 1);
      const out = new Set(); const existing = new Set(words);
      if (words.length >= 4) {
        const model = new Map();
        words.forEach(w => { const s = '^^' + w + '$'; for (let i = 2; i < s.length; i++) { const k = s.slice(i - 2, i); (model.get(k) || model.set(k, []).get(k)).push(s[i]); } });
        let tries = 0;
        while (out.size < n && tries++ < 600) {
          let k = '^^', w = '';
          for (let j = 0; j < 14; j++) { const opts = model.get(k); if (!opts) break; const c = opts[Math.random() * opts.length | 0]; if (c === '$') break; w += c; k = k[1] + c; }
          if (w.length >= 3 && w.length <= 11 && !existing.has(w)) out.add(w[0].toUpperCase() + w.slice(1));
        }
      }
      if (out.size < n) { // poucas palavras: sílabas com as letras da língua
        const L = lettersOf(lang); const V = L.filter(l => /^[aeiouyáéíóúâêôãõàäëïöü]+$/.test(l)); const C = L.filter(l => !V.includes(l));
        const vv = V.length ? V : ['a', 'e', 'i', 'o', 'u'], cc = C.length ? C : ['l', 'r', 'n', 'th', 'v', 's', 'k'];
        const pick = (a) => a[Math.random() * a.length | 0];
        while (out.size < n) { const syl = 2 + (Math.random() * 2 | 0); let w = ''; for (let i = 0; i < syl; i++) w += (Math.random() < .85 ? pick(cc) : '') + pick(vv) + (Math.random() < .25 ? pick(cc) : ''); out.add(w[0].toUpperCase() + w.slice(1)); }
      }
      return [...out];
    },
  };

  /* ---------- desenhar uma letra ---------- */
  function drawGlyph(lang, letter, onSaved){
    const letters = lettersOf(lang); let idx = letters.indexOf(letter);
    T.modal((box, close) => {
      let strokes = JSON.parse(JSON.stringify(lang.meta?.glyphs?.[letter] || [])); let width = 7; let cur = null;
      const cv = h('canvas.glyph-cv', { width: 560, height: 560, 'aria-label': 'Área de desenho da letra' });
      const c = cv.getContext('2d');
      const hue = lang.meta?.hue ?? 268;
      function paint(){
        c.clearRect(0, 0, 560, 560);
        c.strokeStyle = 'rgba(120,120,160,.25)'; c.lineWidth = 2; c.setLineDash([8, 8]);
        [[0, 140, 560, 140], [0, 420, 560, 420], [0, 280, 560, 280], [280, 0, 280, 560]].forEach(([a, b, x, y]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); });
        c.setLineDash([]); c.strokeStyle = `hsl(${hue} 70% 45%)`; c.lineCap = c.lineJoin = 'round';
        [...strokes, ...(cur ? [cur] : [])].forEach(s => { c.lineWidth = (s.w || 7) * 5.6; c.beginPath(); s.p.forEach((pt, i) => i ? c.lineTo(pt[0] * 5.6, pt[1] * 5.6) : c.moveTo(pt[0] * 5.6, pt[1] * 5.6)); if (s.p.length === 1) c.lineTo(s.p[0][0] * 5.6 + .1, s.p[0][1] * 5.6); c.stroke(); });
      }
      const pt = (e) => { const r = cv.getBoundingClientRect(); return [T.clamp((e.clientX - r.left) / r.width * 100, 0, 100), T.clamp((e.clientY - r.top) / r.height * 100, 0, 100)]; };
      cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); cur = { w: width, p: [pt(e)] }; paint(); });
      cv.addEventListener('pointermove', (e) => { if (!cur) return; const p = pt(e); const last = cur.p[cur.p.length - 1]; if (Math.hypot(p[0] - last[0], p[1] - last[1]) > .8) { cur.p.push(p); paint(); } });
      cv.addEventListener('pointerup', () => { if (cur) { strokes.push(cur); cur = null; paint(); } });
      const wIn = h('input.range', { type: 'range', min: 2, max: 16, value: width, 'aria-label': 'Espessura do traço' }); wIn.oninput = () => width = +wIn.value;
      const save = () => { const g = Object.assign({}, S().get(lang.id).meta?.glyphs, { [letters[idx]]: strokes.map(s => ({ w: s.w, p: s.p.map(q => [+q[0].toFixed(1), +q[1].toFixed(1)]) })) }); S().update(lang.id, { meta: { glyphs: g } }); onSaved && onSaved(); };
      const title = h('h2', 'Letra “' + letters[idx] + '”');
      const go = (d) => { save(); idx = (idx + d + letters.length) % letters.length; strokes = JSON.parse(JSON.stringify(S().get(lang.id).meta?.glyphs?.[letters[idx]] || [])); title.textContent = 'Letra “' + letters[idx] + '”'; paint(); };
      box.append(title, h('p.sub', 'Desenhe com o mouse, a caneta ou o dedo. As linhas tracejadas ajudam a manter o tamanho igual entre as letras.'),
        h('div', { style: { display: 'grid', placeItems: 'center' } }, cv),
        h('div.row', { style: { marginTop: '12px', flexWrap: 'wrap' } }, h('label.row', { style: { gap: '8px', fontSize: '12.5px' } }, 'Traço', wIn),
          h('button.btn.sm', { onclick: () => { strokes.pop(); paint(); } }, icon('undo'), 'Desfazer traço'), h('button.btn.sm', { onclick: () => { strokes = []; paint(); } }, icon('trash'), 'Limpar')),
        h('div.modal-foot', h('button.btn', { onclick: () => go(-1) }, '← Anterior'), h('button.btn', { onclick: () => go(1) }, 'Próxima →'), h('button.btn.primary', { onclick: () => { save(); close(); } }, 'Salvar')));
      paint();
    });
  }
  function alphabetModal(lang, after){
    T.modal((box, close) => {
      const grid = h('div.alpha-grid');
      const letters = h('input.input', { value: lettersOf(S().get(lang.id)).join(' '), id: 'letters-' + lang.id });
      const hueBox = T.swatches(lang.meta?.hue ?? 268, (x) => { S().update(lang.id, { meta: { hue: x } }); draw(); });
      function draw(){
        const L = S().get(lang.id); grid.innerHTML = '';
        lettersOf(L).forEach(l => {
          const g = L.meta?.glyphs?.[l];
          grid.appendChild(h('button.alpha-cell', { type: 'button', title: 'Desenhar “' + l + '”', onclick: () => drawGlyph(S().get(lang.id), l, draw), style: { color: `hsl(${L.meta?.hue ?? 268} 70% 45%)` } },
            g && g.length ? h('span', { html: glyphSVG(g) }) : h('span.alpha-empty', '＋'), h('small', l)));
        });
      }
      letters.onchange = () => { S().update(lang.id, { meta: { letters: letters.value.trim().toLowerCase().replace(/\s+/g, ' ') } }); draw(); };
      box.append(h('h2', 'Alfabeto de ' + (lang.title || 'sua língua')), h('p.sub', 'Clique numa letra para desenhar o símbolo dela. Dá para incluir dígrafos (ch, th, lh) como letras próprias.'),
        h('label.field', { for: 'letters-' + lang.id }, 'Letras, separadas por espaço', letters),
        h('div.field', h('span', { style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' } }, 'Cor da escrita'), hueBox),
        grid, h('div.modal-foot', h('button.btn.primary', { onclick: () => close() }, 'Pronto')));
      draw();
    }, { wide: true, onClose: after });
  }

  /* ---------- tela do dicionário ---------- */
  T.Views.lang = {
    icon: 'dict', title: (tab) => tab.ref === 'langs' ? 'Dicionário' : (S().get(tab.ref)?.title || 'Dicionário'),
    mount(root, tab, ctx){
      const pid = ctx.pid;
      let langId = tab.ref !== 'langs' && S().get(tab.ref) ? tab.ref : (S().all(pid).find(i => i.type === 'lang')?.id || null);
      let wordId = tab.word || null, q = '';
      const v = h('div.view.dict'); root.appendChild(v);
      const colL = h('div.dict-langs'), colW = h('div.dict-words.glass'), colE = h('div.dict-entry');
      v.append(colL, colW, colE);

      const langs = () => S().all(pid).filter(i => i.type === 'lang').sort(S().byOrder);
      const words = () => S().all(pid).filter(i => i.type === 'word' && i.parent === langId).sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pt'));
      function newLang(){ return T.ask('Nome da língua', { placeholder: 'ex.: Élfico do Norte, gíria das docas', ok: 'Criar' }).then(n => { if (!n) return; const l = S().create({ pid, type: 'lang', area: 'lang', title: n, meta: { letters: DEFAULT_LETTERS, glyphs: {}, detect: true, hue: T.HUES[langs().length * 4 % T.HUES.length] } }); langId = l.id; wordId = null; T.emit('tree-changed'); renderAll(); }); }

      function renderLangs(){
        colL.innerHTML = '';
        colL.append(h('div.view-h', { style: { marginBottom: '8px' } }, h('h1', { style: { fontSize: '32px' } }, 'Línguas')));
        langs().forEach(l => {
          const row = h('div.tree-row' + (l.id === langId ? '.active' : ''), { role: 'button', tabindex: '0', onclick: () => { langId = l.id; wordId = null; renderAll(); } }, h('span.tw'), icon('dict', 'ic'), h('span.lbl', l.title), h('span.wc.num', String(S().all(pid).filter(w => w.type === 'word' && w.parent === l.id).length)));
          colL.appendChild(row);
        });
        colL.appendChild(h('button.btn.sm', { style: { marginTop: '8px' }, onclick: newLang }, icon('plus'), 'Nova língua'));
        const L = S().get(langId);
        if (L) {
          const det = h('input', { type: 'checkbox', id: 'det-' + L.id, checked: L.meta?.detect !== false }); det.onchange = () => { S().update(L.id, { meta: { detect: det.checked } }); };
          colL.append(h('div.panel.glass', { style: { marginTop: '14px', padding: '14px' } }, h('h3', L.title),
            h('div.dict-alpha', { html: lettersOf(L).slice(0, 26).map(l => L.meta?.glyphs?.[l]?.length ? glyphSVG(L.meta.glyphs[l]) : '').join('') || '<span class="muted" style="font-size:12px">Nenhuma letra desenhada ainda.</span>', style: { color: `hsl(${L.meta?.hue ?? 268} 70% 45%)` } }),
            h('div.stack', { style: { gap: '8px', marginTop: '10px' } },
              h('button.btn.sm', { onclick: () => alphabetModal(L, renderAll) }, icon('brush'), 'Desenhar alfabeto'),
              h('label.row', { for: 'det-' + L.id, style: { gap: '8px', fontSize: '12.5px' } }, det, 'Sublinhar estas palavras no texto'),
              h('button.btn.sm', { onclick: async () => { const n = await T.ask('Nome da língua', { value: L.title }); if (n) { S().update(L.id, { title: n }); renderAll(); T.emit('tree-changed'); } } }, icon('edit'), 'Renomear'),
              h('button.btn.sm.danger', { onclick: async () => { if (await T.confirm('Apagar a língua “' + L.title + '”?', 'Todas as palavras dela também serão apagadas.', 'Apagar', true)) { S().remove(L.id); langId = langs()[0]?.id || null; wordId = null; renderAll(); T.emit('tree-changed'); } } }, icon('trash'), 'Apagar língua'))));
        }
      }
      function renderWords(){
        colW.innerHTML = '';
        const L = S().get(langId);
        if (!L) { colW.append(h('div.pane-empty', h('div', h('div.big', 'Nenhuma língua'), h('p', 'Crie uma língua para começar o dicionário.'), h('button.btn.primary', { onclick: newLang }, icon('plus'), 'Nova língua')))); return; }
        const search = h('input.input', { placeholder: 'palavra ou significado…', value: q, 'aria-label': 'Procurar no dicionário', style: { borderRadius: '99px' } });
        search.oninput = () => { q = search.value; list(); };
        const ul = h('div.dict-list');
        colW.append(h('div.row', { style: { padding: '12px 12px 6px' } }, h('b.grow', L.title + ' · ' + words().length + ' palavras'),
          h('button.btn.sm', { title: 'Gerador de nomes com os sons desta língua', onclick: (e) => namesPop(e.currentTarget, L) }, icon('wand'), 'Nomes'),
          h('button.btn.sm.primary', { onclick: () => newWord() }, icon('plus'), 'Palavra')),
          h('div', { style: { padding: '0 12px 8px' } }, search), ul);
        function list(){
          ul.innerHTML = '';
          const ql = q.toLowerCase().trim();
          const ws = words().filter(w => !ql || (w.title || '').toLowerCase().includes(ql) || (w.meta?.defs || []).some(d => (d.text || '').toLowerCase().includes(ql)));
          if (!ws.length) ul.appendChild(h('p.muted', { style: { padding: '8px 14px' } }, ql ? 'Nada encontrado.' : 'Nenhuma palavra ainda.'));
          ws.forEach(w => ul.appendChild(h('button.dict-row' + (w.id === wordId ? '.on' : ''), { type: 'button', onclick: () => { wordId = w.id; renderWords(); renderEntry(); } },
            h('span.grow', h('b', w.title || '—'), w.meta?.defs?.[0]?.text ? h('span.muted', ' — ' + w.meta.defs[0].text.slice(0, 40)) : null),
            h('span', { html: T.Lang.scriptHTML(L, w.title) }))));
        }
        list();
      }
      function newWord(title){
        const w = S().create({ pid, type: 'word', area: 'lang', parent: langId, title: title || 'nova palavra', meta: { pos: 'substantivo', defs: [{ text: '', ex: '', subs: [] }], sections: [] } });
        wordId = w.id; renderWords(); renderEntry();
        setTimeout(() => colE.querySelector('.dict-word')?.select(), 30);
      }
      function namesPop(btn, L){
        const box = h('div.stack', { style: { width: '300px' } });
        const draw = () => { box.innerHTML = ''; box.append(h('b', 'Nomes no estilo de ' + L.title), h('p.muted', { style: { margin: 0, fontSize: '12px' } }, words().length >= 4 ? 'Criados a partir dos sons das suas palavras.' : 'Com poucas palavras, uso as letras do alfabeto. Quanto mais palavras, mais parecidos com a língua.'),
          h('div.names', T.Lang.names(L).map(n => h('button.chip', { type: 'button', title: 'Opções para “' + n + '”', onclick: (e) => T.menuAt(e.currentTarget, [
            { label: 'Copiar', icon: 'copy', fn: () => navigator.clipboard.writeText(n).then(() => T.toast('“' + n + '” copiado.')).catch(() => T.toast(n)) },
            { label: 'Criar personagem com este nome', icon: 'person', fn: () => { const p = T.Wiki.create(pid, 'personagem', n); T.Shell.open({ kind: 'page', ref: p.id }, { side: true }); } },
            { label: 'Criar lugar com este nome', icon: 'pin', fn: () => { const p = T.Wiki.create(pid, 'lugar', n); T.Shell.open({ kind: 'page', ref: p.id }, { side: true }); } },
            { label: 'Adicionar ao dicionário', icon: 'dict', fn: () => newWord(n.toLowerCase()) },
          ]) }, n))),
          h('button.btn.sm', { onclick: draw }, icon('history'), 'Gerar outros')); };
        draw(); T.popover(btn, box);
      }
      function renderEntry(){
        colE.innerHTML = '';
        const w = S().get(wordId); const L = S().get(langId);
        if (!w || !L) { if (L) colE.appendChild(h('div.pane-empty', h('div', h('div.big', 'Escolha uma palavra'), h('p', 'Ou crie uma nova para começar o verbete.')))); return; }
        const upd = (patch) => { S().update(w.id, patch); };
        const script = h('div.dict-script', { html: T.Lang.scriptHTML(L, w.title) || '<span class="muted" style="font-size:13px">Desenhe o alfabeto para ver a palavra escrita nele.</span>' });
        const word = h('input.dict-word', { value: w.title, 'aria-label': 'Palavra' });
        word.oninput = () => { script.innerHTML = T.Lang.scriptHTML(L, word.value); };
        word.onchange = () => { upd({ title: word.value.trim() }); renderWords(); };
        const pron = h('input.dict-pron', { value: w.meta?.pron || '', placeholder: 'pronúncia', 'aria-label': 'Pronúncia' }); pron.onchange = () => upd({ meta: { pron: pron.value.trim() } });
        const pos = h('select.select', { style: { width: 'auto' }, 'aria-label': 'Classe gramatical' }, POS.map(p => h('option', { value: p, selected: w.meta?.pos === p }, p))); pos.onchange = () => upd({ meta: { pos: pos.value } });
        const defs = JSON.parse(JSON.stringify(w.meta?.defs || [])); const saveDefs = () => upd({ meta: { defs } });
        const defsEl = h('ol.dict-defs');
        defs.forEach((d, i) => {
          const t = h('textarea.textarea', { placeholder: 'Definição', style: { minHeight: '54px' } }); t.value = d.text || ''; t.onchange = () => { d.text = t.value; saveDefs(); renderWords(); };
          const ex = h('input.input.dict-ex', { value: d.ex || '', placeholder: 'Frase de exemplo' }); ex.onchange = () => { d.ex = ex.value; saveDefs(); };
          const subs = h('ul', (d.subs || []).map((s, j) => { const si = h('input.input', { value: s, placeholder: 'outro sentido' }); si.onchange = () => { d.subs[j] = si.value; saveDefs(); }; return h('li.row', si, T.iconBtn('x', 'Tirar', () => { d.subs.splice(j, 1); saveDefs(); renderEntry(); }, '.sm')); }));
          defsEl.appendChild(h('li', t, ex, subs, h('div.row', h('button.btn.sm', { onclick: () => { (d.subs = d.subs || []).push(''); saveDefs(); renderEntry(); } }, icon('plus'), 'Sentido extra'), defs.length > 1 ? h('button.btn.sm', { onclick: () => { defs.splice(i, 1); saveDefs(); renderEntry(); } }, icon('trash'), 'Tirar definição') : null)));
        });
        const origin = h('textarea.textarea', { placeholder: 'De onde veio a palavra? Quem usa? Tem conotação?' }); origin.value = w.meta?.origin || ''; origin.onchange = () => upd({ meta: { origin: origin.value } });
        const secs = JSON.parse(JSON.stringify(w.meta?.sections || [])); const saveSecs = () => upd({ meta: { sections: secs } });
        const secsEl = h('div.stack', secs.map((s, i) => { const st = h('input.input.dict-sec-t', { value: s.t, placeholder: 'Título da seção' }); const sx = h('textarea.textarea'); sx.value = s.x || ''; st.onchange = () => { s.t = st.value; saveSecs(); }; sx.onchange = () => { s.x = sx.value; saveSecs(); }; return h('div', h('div.row', st, T.iconBtn('trash', 'Tirar seção', () => { secs.splice(i, 1); saveSecs(); renderEntry(); }, '.sm')), sx); }));
        colE.append(h('div.dict-card.glass',
          script, word, h('div.row', h('span.muted', '/'), pron, h('span.muted', '/'), h('span.grow'), pos),
          h('h3', 'Definições'), defsEl, h('button.btn.sm', { onclick: () => { defs.push({ text: '', ex: '', subs: [] }); saveDefs(); renderEntry(); } }, icon('plus'), 'Nova definição'),
          h('h3', 'Origem'), origin,
          secsEl, h('button.btn.sm', { onclick: () => { secs.push({ t: 'Nova seção', x: '' }); saveSecs(); renderEntry(); } }, icon('plus'), 'Adicionar seção'),
          h('div.row', { style: { marginTop: '18px' } }, h('span.grow'), h('button.btn.sm.danger', { onclick: async () => { if (await T.confirm('Apagar “' + w.title + '”?', null, 'Apagar', true)) { S().remove(w.id); wordId = null; renderWords(); renderEntry(); } } }, icon('trash'), 'Apagar palavra'))));
      }
      function renderAll(){ renderLangs(); renderWords(); renderEntry(); }
      renderAll();
      return { destroy(){} };
    }
  };
})(window.T);
