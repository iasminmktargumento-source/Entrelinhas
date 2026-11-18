/* Tinteiro — wiki do mundo */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;

  /* ---------- editor de texto rico (páginas da wiki) ---------- */
  const RICH_OK = { P: 1, H2: 1, H3: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, MARK: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, BR: 1, HR: 1, A: 1, IMG: 1, DIV: 1 };
  function cleanRich(root){
    const c = root.cloneNode(true);
    c.querySelectorAll('*').forEach(e => {
      const ok = RICH_OK[e.tagName] && !(e.tagName === 'A' && !e.dataset.p) && !(e.tagName === 'DIV' && !e.classList.contains('spoiler'));
      if (!ok) { if (e.tagName === 'DIV') { const p = document.createElement('p'); p.innerHTML = e.innerHTML; e.replaceWith(p); } else e.replaceWith(...e.childNodes); return; }
      [...e.attributes].forEach(a => {
        const keep = (e.tagName === 'A' && (a.name === 'data-p' || (a.name === 'class' && a.value === 'wl'))) || (e.tagName === 'IMG' && (a.name === 'src' || a.name === 'data-a' || a.name === 'alt')) || (e.tagName === 'DIV' && a.name === 'class');
        if (!keep) e.removeAttribute(a.name);
      });
      if (e.tagName === 'DIV') e.className = 'spoiler';
    });
    return c.innerHTML.trim();
  }
  T.Rich = {
    mount(host, { pid, html, placeholder, onSave }){
      const tools = h('div.wtools.glass');
      const ed = h('div.wrich.prose', { contenteditable: 'true', spellcheck: 'true', lang: 'pt-BR', 'data-ph': placeholder || '' });
      ed.innerHTML = html || '<p><br></p>';
      host.append(tools, ed);
      const save = T.debounce(() => onSave(cleanRich(ed)), 700);
      const fmt = (c, v) => { ed.focus(); document.execCommand(c, false, v); save(); };
      const btn = (ic, title, fn, label) => h('button.icon-btn.sm', { type: 'button', title, 'aria-label': title, onmousedown: (e) => e.preventDefault(), onclick: fn }, label ? h('b', { style: { fontSize: '12px' } }, label) : icon(ic));
      tools.append(
        btn(null, 'Título de seção', () => fmt('formatBlock', 'h2'), 'T1'),
        btn(null, 'Subtítulo', () => fmt('formatBlock', 'h3'), 'T2'),
        btn(null, 'Texto normal', () => fmt('formatBlock', 'p'), '¶'),
        h('span.sep'),
        btn('bold', 'Negrito', () => fmt('bold')), btn('italic', 'Itálico', () => fmt('italic')), btn('underline', 'Sublinhado', () => fmt('underline')),
        btn('list', 'Lista', () => fmt('insertUnorderedList')), btn('quote', 'Citação', () => fmt('formatBlock', 'blockquote')),
        h('span.sep'),
        btn('link', 'Link para outra página ([[)', () => { ed.focus(); document.execCommand('insertText', false, '[['); ed.dispatchEvent(new Event('input')); }),
        btn('image', 'Inserir imagem', async () => { const f = await T.pickFile('image/*'); if (!f) return; const ref = await T.Assets.upload(f); if (!ref) return; ed.focus(); document.execCommand('insertHTML', false, '<img src="' + T.Assets.url(ref) + '" data-a="' + (ref.id || '') + '" alt=""><p><br></p>'); save(); }),
        btn('eyeoff', 'Bloco de spoiler (fica borrado até clicar)', () => { ed.focus(); const t = getSelection().toString(); document.execCommand('insertHTML', false, '<div class="spoiler"><p>' + (T.esc(t) || 'Spoiler…') + '</p></div><p><br></p>'); save(); }));
      ed.addEventListener('input', save);
      ed.addEventListener('paste', (e) => { e.preventDefault(); const t = e.clipboardData.getData('text/plain'); document.execCommand('insertHTML', false, t.split(/\n{2,}|\n/).map(s => '<p>' + T.esc(s) + '</p>').join('')); });
      ed.addEventListener('click', (e) => { const sp = e.target.closest('.spoiler'); if (sp && !sp.classList.contains('open')) sp.classList.add('open'); });
      const offHover = T.Ent.hover(ed, pid);
      const closeAC = T.Ent.autocomplete(ed, pid, () => save());
      const deco = T.debounce(() => T.Ent.decorate(ed, pid), 600); deco(); ed.addEventListener('input', deco);
      return { el: ed, flush: () => save.flush(), destroy(){ save.flush(); offHover(); closeAC(); T.Ent.undecorate(ed); } };
    }
  };

  /* ---------- utilidades ---------- */
  T.Wiki = {
    create(pid, tpl = 'personagem', title){
      const t = T.WIKI_TPL[tpl] || T.WIKI_TPL.livre;
      const p = S().create({ pid, type: 'page', area: 'wiki', title: title || 'Nova página', meta: { tpl, fields: t.fields.map(k => ({ k, v: '' })) }, body: t.sections.map(s => '<h2>' + s + '</h2><p><br></p>').join('') || '<p><br></p>' });
      T.emit('tree-changed');
      return p;
    },
    newMenu(btn, pid, after){
      T.menuAt(btn, [{ head: 'Nova página da wiki' }, ...Object.entries(T.WIKI_TPL).map(([k, t]) => ({ label: t.name, icon: t.icon, fn: () => { const p = T.Wiki.create(pid, k); after ? after(p) : T.Shell.open({ kind: 'page', ref: p.id }); } }))]);
    },
    backlinks(pid, id){ return S().all(pid).filter(i => i.id !== id && i.body && i.body.includes('data-p="' + id + '"')); },
    mentions(pid, page){
      const names = [page.title, ...(page.meta?.aliases || '').split(',')].map(s => (s || '').trim()).filter(s => s.length > 1);
      if (!names.length) return [];
      const re = new RegExp('(?<![\\p{L}\\p{N}])(' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}\\p{N}])', 'giu');
      return T.MS.flat(pid).filter(i => i.body).map(i => { const m = T.htmlToText(i.body).match(re); return m ? { it: i, n: m.length, word: m[0] } : null; }).filter(Boolean);
    },
    card(p, extra){
      const tpl = T.tplOf(p);
      const img = p.meta?.portrait || p.meta?.banner;
      const c = h('div.wcard', { role: 'button', tabindex: '0', onclick: () => T.Shell.open({ kind: 'page', ref: p.id }) },
        img ? h('img', { src: T.Assets.url(img), alt: '' }) : h('div.wph', { style: { '--h': tpl.hue } }, h('span', (p.title || '?').trim()[0]?.toUpperCase() || '?')),
        h('div.wcap', h('b', p.title || 'Sem título'), h('span', extra || tpl.name)));
      c.style.setProperty('--h', tpl.hue);
      c.addEventListener('keydown', e => { if (e.key === 'Enter') c.click(); });
      return c;
    },
  };

  const PREF = ['Ocupação', 'Espécie', 'Tipo', 'Região', 'Líder', 'Habitat', 'Origem', 'Fonte', 'Data', 'Facção'];
  const subtitle = (p) => { const f = p.meta?.fields || []; for (const k of PREF) { const x = f.find(y => y.k === k && y.v); if (x) return x.v; } return T.tplOf(p).name; };

  /* ---------- índice da wiki ---------- */
  T.Views.wiki = {
    icon: 'book', title: () => 'Wiki do mundo',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad'); root.appendChild(v);
      let q = '';
      function render(){
        const pages = T.Ent.pages(pid);
        v.innerHTML = '';
        const search = h('input.input', { placeholder: 'Procurar páginas, apelidos ou informações…', value: q, 'aria-label': 'Procurar na wiki', style: { maxWidth: '360px', borderRadius: '99px' } });
        search.oninput = () => { q = search.value; draw(); };
        const nb = h('button.btn.primary', { onclick: (e) => T.Wiki.newMenu(e.currentTarget, pid) }, icon('plus'), 'Nova página');
        const gb = h('button.btn', { title: 'Mapa mental com tudo ligado: personagens, lugares, tramas, eventos e cenas (como o grafo do Obsidian)', onclick: () => T.Shell.open({ kind: 'web', ref: 'web', mode: 'all' }) }, icon('web'), 'Grafo');
        v.append(h('div.view-h', h('div.grow', h('h1', 'Wiki do mundo'), h('p', T.fmt(pages.length) + (pages.length === 1 ? ' página' : ' páginas') + '. Escreva [[ em qualquer texto para criar um link para uma página.')), search, gb, nb));
        const list = h('div'); v.appendChild(list);
        function draw(){
          list.innerHTML = '';
          const ql = q.toLowerCase();
          const match = (p) => !ql || (p.title || '').toLowerCase().includes(ql) || (p.meta?.aliases || '').toLowerCase().includes(ql) || (p.meta?.fields || []).some(f => (f.v || '').toLowerCase().includes(ql));
          let any = false;
          Object.entries(T.WIKI_TPL).forEach(([k, t]) => {
            const ps = pages.filter(p => (p.meta?.tpl || 'livre') === k && match(p)).sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pt'));
            if (!ps.length) return; any = true;
            list.append(h('div.wsec-h', icon(t.icon), h('h2', t.plural), h('span.chip.gray.num', String(ps.length)), h('button.icon-btn.sm', { title: 'Nova página de ' + t.name.toLowerCase(), onclick: () => { const p = T.Wiki.create(pid, k); T.Shell.open({ kind: 'page', ref: p.id }); } }, icon('plus'))),
              h('div.wgrid', ps.map(p => T.Wiki.card(p, subtitle(p)))));
          });
          if (!any) list.appendChild(h('div.glass.panel', h('h3', pages.length ? 'Nada encontrado' : 'A wiki está vazia'), h('p', { style: { margin: 0, color: 'var(--ink-2)' } }, pages.length ? 'Tente outro termo.' : 'Crie a primeira página: um personagem, um lugar, uma facção… Cada personagem também vira um cartão na árvore de relações.')));
        }
        draw();
      }
      render();
      const off = T.on('tree-changed', () => { if (!v.contains(document.activeElement)) render(); });
      return { destroy(){ off(); } };
    }
  };

  /* ---------- página ---------- */
  T.Views.page = {
    icon: 'doc', title: (tab) => S().get(tab.ref)?.title || 'Página',
    mount(root, tab, ctx){
      const pid = ctx.pid; const page = S().get(tab.ref);
      if (!page) { root.appendChild(h('div.pane-empty', 'Esta página foi apagada.')); return { destroy(){} }; }
      const v = h('div.view.wpage'); root.appendChild(v);
      let rich = null;
      function render(){
        if (rich) { rich.destroy(); rich = null; }
        const p = S().get(page.id); const tpl = T.tplOf(p);
        v.innerHTML = '';
        // capa
        const banner = h('div.wbanner', { style: { '--h': tpl.hue } });
        if (p.meta?.banner) banner.appendChild(h('img', { src: T.Assets.url(p.meta.banner), alt: '' }));
        const title = h('input.wtitle', { value: p.title || '', 'aria-label': 'Título da página', placeholder: 'Nome' });
        title.onchange = () => { S().update(p.id, { title: title.value.trim() || 'Sem título' }); T.emit('tree-changed'); };
        banner.append(h('div.wbanner-shade'),
          h('div.wbanner-tools', h('button.btn.sm.glass', { onclick: async () => { const f = await T.pickFile('image/*'); if (!f) return; const ref = await T.Assets.upload(f); if (ref) { S().update(p.id, { meta: { banner: ref } }); render(); } } }, icon('image'), p.meta?.banner ? 'Trocar capa' : 'Adicionar capa'),
            h('button.icon-btn.glass', { title: 'Mais opções', onclick: (e) => T.menuAt(e.currentTarget, [
              { head: 'Tipo de página' }, ...Object.entries(T.WIKI_TPL).map(([k, t]) => ({ label: ((p.meta?.tpl || 'livre') === k ? '● ' : '○ ') + t.name, fn: () => changeTpl(k) })),
              '-', p.meta?.banner ? { label: 'Remover capa', icon: 'x', fn: () => { S().update(p.id, { meta: { banner: null } }); render(); } } : null,
              { label: 'Abrir na árvore de relações', icon: 'tree', fn: () => T.Shell.open({ kind: 'tree', ref: 'tree', focus: p.id }) },
              { label: 'Apagar página', icon: 'trash', danger: true, fn: async () => { if (await T.confirm('Apagar “' + p.title + '”?', 'Os links para ela no texto continuam como texto normal.', 'Apagar', true)) { S().remove(p.id); T.emit('tree-changed'); T.Shell.closeTabsFor(p.id); } } },
            ]) }, icon('dots'))),
          h('div.wtitle-wrap', h('span.chip', icon(tpl.icon), tpl.name), title));
        v.appendChild(banner);
        // corpo + caixa de informações
        const main = h('div.wmain');
        const aside = h('aside.infobox.glass');
        v.appendChild(h('div.wbody', main, aside));
        rich = T.Rich.mount(main, { pid, html: p.body, placeholder: 'Escreva sobre ' + (p.title || 'esta página') + '…', onSave: (html) => S().update(p.id, { body: html }, { silent: true }) });
        // retrato
        const por = p.meta?.portrait ? h('img.portrait', { src: T.Assets.url(p.meta.portrait), alt: 'Retrato de ' + p.title }) : h('div.portrait.ph', { style: { '--h': tpl.hue } }, icon(tpl.icon), h('span', 'Adicionar imagem'));
        por.style.setProperty('--h', tpl.hue);
        por.onclick = async () => { const f = await T.pickFile('image/*'); if (!f) return; const ref = await T.Assets.upload(f); if (ref) { S().update(p.id, { meta: { portrait: ref } }); render(); } };
        por.title = 'Clique para trocar a imagem';
        const aliases = h('input.input', { value: p.meta?.aliases || '', placeholder: 'apelidos, separados por vírgula', id: 'al-' + tab.id });
        aliases.onchange = () => { S().update(p.id, { meta: { aliases: aliases.value } }); };
        const fieldsEl = h('div.ifields');
        const fields = (p.meta?.fields || []).map(f => Object.assign({}, f));
        const saveFields = () => S().update(p.id, { meta: { fields: fields.filter(f => f.k || f.v) } });
        fields.forEach((f, i) => {
          const k = h('input.ik', { value: f.k, 'aria-label': 'Nome do campo' }); const val = h('textarea.iv', { rows: 1, 'aria-label': f.k || 'Valor' }); val.value = f.v || '';
          const grow = () => { val.style.height = 'auto'; val.style.height = val.scrollHeight + 'px'; };
          k.onchange = () => { f.k = k.value; saveFields(); }; val.oninput = grow; val.onchange = () => { f.v = val.value; saveFields(); };
          fieldsEl.appendChild(h('div.ifield', k, val, h('button.icon-btn.sm.idel', { title: 'Tirar este campo', onclick: () => { fields.splice(i, 1); saveFields(); render(); } }, icon('x'))));
          requestAnimationFrame(grow);
        });
        const isChar = (p.meta?.tpl || 'livre') === 'personagem';
        let birthBox = null;
        if (isChar && T.Cal) {
          const cc = T.Cal.cfg(pid);
          const age = p.meta?.birth && cc.today ? T.Cal.age(cc, p.meta.birth, cc.today) : null;
          birthBox = h('div.field', h('span', 'Nascimento no calendário do mundo'),
            T.Cal.datePicker(cc, p.meta?.birth, (v) => { S().update(p.id, { meta: { birth: v } }); T.emit('cal-changed', pid); render(); }, { clear: true }),
            age != null ? h('span.muted', { style: { fontSize: '12px' } }, (age < 0 ? 'Ainda não nasceu' : age + (age === 1 ? ' ano' : ' anos')) + ' em ' + T.Cal.fmt(cc, cc.today) + ' (hoje na história)') : h('span.muted', { style: { fontSize: '12px' } }, 'Com a data, a idade aparece nos eventos e na timeline.'));
        }
        aside.append(...[por, h('label.field', { for: 'al-' + tab.id }, 'Também chamado de', aliases), birthBox].filter(Boolean), fieldsEl,
          h('button.btn.sm', { onclick: () => { fields.push({ k: 'Novo campo', v: '' }); saveFields(); render(); } }, icon('plus'), 'Campo'));
        // relações, menções, explore
        const rels = T.Rel ? T.Rel.of(pid, p.id) : [];
        if (rels.length) v.appendChild(h('section.wsec', h('div.wsec-h', icon('tree'), h('h2', 'Relações')), h('div.wgrid', rels.map(r => { const c = T.Wiki.card(r.page, r.label); c.style.setProperty('--rc', r.color); c.classList.add('is-rel'); return c; }))));
        const ment = T.Wiki.mentions(pid, p);
        if (ment.length) v.appendChild(h('section.wsec', h('div.wsec-h', icon('scene'), h('h2', 'Aparece no livro'), h('span.chip.gray.num', T.fmt(ment.reduce((a, m) => a + m.n, 0)) + ' menções')),
          h('div.wment', ment.slice(0, 30).map(m => h('button.btn.sm', { onclick: () => T.Shell.open({ kind: 'doc', ref: m.it.id, find: m.word }, { side: true }) }, icon('scene'), (m.it.title || 'Sem título') + ' · ' + m.n)))));
        const outIds = [...(p.body || '').matchAll(/data-p="([^"]+)"/g)].map(m => m[1]);
        const back = T.Wiki.backlinks(pid, p.id);
        const explore = new Map();
        outIds.forEach(id => { const x = S().get(id); if (x && x.type === 'page' && x.id !== p.id) explore.set(id, [x, 'citada aqui']); });
        back.filter(b => b.type === 'page').forEach(b => explore.set(b.id, [b, 'cita esta página']));
        T.Ent.pages(pid).filter(x => x.id !== p.id && (x.meta?.tpl || 'livre') === (p.meta?.tpl || 'livre')).slice(0, 8).forEach(x => { if (!explore.has(x.id) && explore.size < 12) explore.set(x.id, [x, T.tplOf(x).name]); });
        if (explore.size) v.appendChild(h('section.wsec', h('div.wsec-h', icon('globe'), h('h2', 'Explore')), h('div.wgrid', [...explore.values()].map(([x, why]) => T.Wiki.card(x, why)))));
        const backScenes = back.filter(b => b.type !== 'page');
        if (backScenes.length) v.appendChild(h('section.wsec', h('div.wsec-h', icon('link'), h('h2', 'Links no manuscrito')), h('div.wment', backScenes.map(b => h('button.btn.sm', { onclick: () => T.Shell.open({ kind: 'doc', ref: b.id }, { side: true }) }, icon('scene'), b.title || 'Sem título')))));
        const onMaps = T.Maps ? T.Maps.pinsFor(pid, page.id) : [];
        if (onMaps.length) v.appendChild(h('section.wsec', h('div.wsec-h', icon('map'), h('h2', 'No mapa')), h('div.wment', onMaps.map(o => h('button.btn.sm', { onclick: () => T.Shell.open({ kind: 'map', ref: o.map.id, focusPin: o.pin.id }) }, icon('pin'), o.map.title + ' · ' + (o.pin.title || 'pin'))))));
      }
      function changeTpl(k){
        const p = S().get(page.id); const t = T.WIKI_TPL[k];
        const have = new Set((p.meta?.fields || []).map(f => f.k));
        const fields = [...(p.meta?.fields || []), ...t.fields.filter(f => !have.has(f)).map(f => ({ k: f, v: '' }))];
        S().update(p.id, { meta: { tpl: k, fields } }); T.emit('tree-changed'); render();
      }
      render();
      const off = T.on('items', (ev) => { if (ev.id === page.id && ev.patch && ('title' in ev.patch) && !v.contains(document.activeElement)) render(); });
      return { destroy(){ off(); rich && rich.destroy(); }, flush(){ rich && rich.flush(); } };
    }
  };
})(window.T);
