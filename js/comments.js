/* Tinteiro — comentários na margem (no estilo do Google Docs) e painel com todos os comentários */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;
  const clone = (o) => JSON.parse(JSON.stringify(o || {}));

  /* ---------- dados ----------
     cada cena guarda meta.comments = { [cid]: { text, quote, date, edited?, resolved?, replies: [{ id, text, date, edited? }] } }
     no texto, o trecho comentado é <span class="cmt" data-c="cid"> (com "cmt-res" quando resolvido) */
  const C = T.Comments = {
    author(pid){ return (S().get(pid)?.meta?.author || '').trim() || 'Você'; },
    all(pid){
      const out = [];
      S().all(pid).forEach(it => { if (it.type === 'snapshot') return; const cs = it.meta?.comments; if (cs) for (const cid in cs) out.push({ cid, c: cs[cid], it }); });
      return out;
    },
    find(pid, cid){ for (const it of S().all(pid)) { if (it.type === 'snapshot') continue; const c = it.meta?.comments?.[cid]; if (c) return { it, c }; } return null; },
    // muda (ou apaga, com null) um comentário onde quer que ele esteja guardado
    put(pid, cid, val, holderId){
      const f = C.find(pid, cid); const it = f ? f.it : S().get(holderId); if (!it) return;
      const cs = clone(it.meta?.comments);
      if (val == null) delete cs[cid]; else cs[cid] = val;
      S().update(it.id, { meta: { comments: cs } });
      T.emit('comments-changed', pid);
    },
    edit(pid, cid, fn){ const f = C.find(pid, cid); if (!f) return; const c = clone(f.c); fn(c); C.put(pid, cid, c); },
  };

  const initial = (name) => (name || '?').trim().charAt(0).toUpperCase();
  const avatar = (name) => h('span.cc-av', { 'aria-hidden': 'true' }, initial(name));
  const fmtDate = (ts) => { if (!ts) return ''; const d = new Date(ts); return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  const when = (ts) => { const s = (Date.now() - ts) / 1000; return s < 86400 ? T.relTime(ts) : fmtDate(ts); };

  // caixa de texto que cresce sozinha; Ctrl+Enter confirma, Esc cancela
  function box(value, placeholder, onOk, onCancel, okLabel){
    const ta = h('textarea.cc-input', { placeholder, rows: 1 }); ta.value = value || '';
    const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.min(220, ta.scrollHeight) + 'px'; };
    const ok = h('button.btn.sm.primary', { type: 'button', onclick: () => { const v = ta.value.trim(); if (v) onOk(v); } }, okLabel || 'Salvar');
    const cancel = h('button.btn.sm', { type: 'button', onclick: () => onCancel() }, 'Cancelar');
    const upd = () => { ok.disabled = !ta.value.trim(); fit(); };
    ta.addEventListener('input', upd);
    ta.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ok.click(); } if (e.key === 'Escape') { e.preventDefault(); onCancel(); } });
    const wrap = h('div.cc-box', ta, h('div.cc-btns', cancel, ok));
    requestAnimationFrame(() => { upd(); });
    wrap.focusIt = () => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); };
    return wrap;
  }

  /* ---------- trilho de comentários ao lado do texto ----------
     ctx: { ed, prose, pid, spanVisible(span) -> retângulo visível ou null, onChange(), reveal(span) } */
  C.rail = (ctx) => {
    const { pid, prose } = ctx;
    const head = h('div.cmt-rail-head.glass',
      icon('comment'), h('b.grow', 'Comentários'),
      h('button.btn.sm', { type: 'button', title: 'Ver todos os comentários do livro, resolvidos ou não', onclick: () => C.panel(pid, { here: ctx }) }, 'Ver todos'),
      T.iconBtn('x', 'Esconder a lateral de comentários (volta pelo menu Ferramentas)', () => { S().setPrefs({ cmtRail: false }); ctx.onToggle && ctx.onToggle(); }, '.sm'));
    const list = h('div.cmt-rail-list');
    const el = h('div.cmt-rail', head, list);
    let active = null, draft = null; // draft = { cid, span, holderId }
    const editing = new Set(); // cids/reply ids em edição
    const cards = new Map();

    const spanOf = (cid) => prose.querySelector('span.cmt[data-c="' + cid + '"]');
    function openCids(){
      const seen = new Set(), out = [];
      prose.querySelectorAll('span.cmt[data-c]').forEach(s => {
        const cid = s.dataset.c; if (seen.has(cid)) return; seen.add(cid);
        if (draft && draft.cid === cid) { out.push(cid); return; }
        const f = C.find(pid, cid); if (f && !f.c.resolved) out.push(cid);
      });
      return out;
    }
    function count(){ return openCids().length; }

    function setActive(cid, focusReply){
      if (active === cid && !focusReply) return;
      active = cid;
      prose.querySelectorAll('span.cmt.cmt-on').forEach(s => s.classList.remove('cmt-on'));
      if (cid) prose.querySelectorAll('span.cmt[data-c="' + cid + '"]').forEach(s => s.classList.add('cmt-on'));
      build(); layout();
      if (focusReply) { const rb = cards.get(cid)?.querySelector('.cc-reply-box textarea'); if (rb) rb.focus(); }
    }

    function menuFor(btn, items){ T.menuAt(btn, items); }

    function card(cid){
      const isDraft = draft && draft.cid === cid;
      const f = isDraft ? null : C.find(pid, cid);
      if (!isDraft && !f) return null;
      const c = f ? f.c : null;
      const name = C.author(pid);
      const elc = h('div.cmt-card.glass.glass-strong', { 'data-c': cid, tabindex: '-1' });
      if (cid === active) elc.classList.add('active');
      elc.addEventListener('mousedown', (e) => { if (!e.target.closest('button, textarea')) { setActive(cid); } });
      if (isDraft) {
        elc.classList.add('active', 'draft');
        const b = box('', 'Escreva um comentário…', (v) => {
          const rec = { text: v, quote: draft.quote, date: Date.now(), replies: [] };
          const holder = draft.holderId; const id = draft.cid; draft = null;
          C.put(pid, id, rec, holder); ctx.onChange(); active = id; build(); layout();
        }, () => cancelDraft(), 'Comentar');
        elc.append(h('div.cc-head', avatar(name), h('div.cc-who', h('b', name))), b);
        requestAnimationFrame(() => b.focusIt());
        return elc;
      }
      const head = h('div.cc-head', avatar(name), h('div.cc-who', h('b', name), h('span.cc-time', { title: fmtDate(c.date) }, when(c.date) + (c.edited ? ' · editado' : ''))),
        h('button.cc-ic', { type: 'button', title: 'Resolver (o trecho deixa de ficar marcado; dá para reabrir em “Ver todos”)', 'aria-label': 'Resolver', onclick: (e) => { e.stopPropagation(); resolve(cid); } }, icon('check')),
        h('button.cc-ic', { type: 'button', title: 'Mais opções', 'aria-label': 'Mais opções', onclick: (e) => { e.stopPropagation(); menuFor(e.currentTarget, [
          { label: 'Editar', icon: 'edit', fn: () => { editing.add(cid); active = cid; build(); layout(); } },
          { label: 'Apagar o comentário', icon: 'trash', fn: () => remove(cid) },
        ]); } }, icon('dots')));
      elc.append(head);
      if (editing.has(cid)) {
        const b = box(c.text, 'Comentário', (v) => { editing.delete(cid); C.edit(pid, cid, x => { x.text = v; x.edited = Date.now(); }); build(); layout(); }, () => { editing.delete(cid); build(); layout(); });
        elc.append(b); requestAnimationFrame(() => b.focusIt());
      } else elc.append(h('div.cc-text', c.text));
      (c.replies || []).forEach(r => {
        const rk = cid + ':' + r.id;
        const rel = h('div.cc-reply',
          h('div.cc-head', avatar(name), h('div.cc-who', h('b', name), h('span.cc-time', { title: fmtDate(r.date) }, when(r.date) + (r.edited ? ' · editado' : ''))),
            h('button.cc-ic', { type: 'button', title: 'Mais opções', 'aria-label': 'Mais opções da resposta', onclick: (e) => { e.stopPropagation(); menuFor(e.currentTarget, [
              { label: 'Editar', icon: 'edit', fn: () => { editing.add(rk); active = cid; build(); layout(); } },
              { label: 'Apagar a resposta', icon: 'trash', fn: () => { C.edit(pid, cid, x => { x.replies = (x.replies || []).filter(y => y.id !== r.id); }); build(); layout(); } },
            ]); } }, icon('dots'))));
        if (editing.has(rk)) { const b = box(r.text, 'Resposta', (v) => { editing.delete(rk); C.edit(pid, cid, x => { const y = (x.replies || []).find(y => y.id === r.id); if (y) { y.text = v; y.edited = Date.now(); } }); build(); layout(); }, () => { editing.delete(rk); build(); layout(); }); rel.append(b); requestAnimationFrame(() => b.focusIt()); }
        else rel.append(h('div.cc-text', r.text));
        elc.append(rel);
      });
      if (cid === active && !editing.has(cid)) {
        const rb = box('', 'Responder…', (v) => { C.edit(pid, cid, x => { (x.replies = x.replies || []).push({ id: T.id(), text: v, date: Date.now() }); }); build(); layout(); }, () => setActive(null), 'Responder');
        rb.classList.add('cc-reply-box');
        elc.append(rb);
      } else if ((c.replies || []).length === 0) {
        // nada
      }
      return elc;
    }

    function build(){
      list.innerHTML = ''; cards.clear();
      openCids().forEach(cid => { const c = card(cid); if (c) { cards.set(cid, c); list.appendChild(c); } });
    }

    // alinha cada cartão à altura do seu trecho, sem sobrepor (o ativo fica no lugar exato)
    function layout(){
      if (!el.isConnected) return;
      el.classList.toggle('compact', !!(ctx.compact && ctx.compact()));
      const lr = list.getBoundingClientRect();
      const rows = [];
      cards.forEach((c, cid) => {
        const s = [...prose.querySelectorAll('span.cmt[data-c="' + cid + '"]')];
        let r = null; for (const sp of s) { r = ctx.spanVisible(sp); if (r) break; }
        if (!r) { c.style.display = 'none'; return; }
        c.style.display = '';
        rows.push({ c, cid, want: r.top - lr.top, hgt: c.offsetHeight });
      });
      rows.sort((a, b) => a.want - b.want);
      const gap = 8;
      let ai = rows.findIndex(x => x.cid === active);
      if (ai < 0) ai = 0;
      if (rows.length) {
        rows[ai].y = rows[ai].want;
        for (let i = ai + 1; i < rows.length; i++) rows[i].y = Math.max(rows[i].want, rows[i - 1].y + rows[i - 1].hgt + gap);
        for (let i = ai - 1; i >= 0; i--) rows[i].y = Math.min(rows[i].want, rows[i + 1].y - rows[i].hgt - gap);
      }
      rows.forEach(x => { x.c.style.transform = 'translateY(' + Math.round(x.y) + 'px)'; });
    }

    function resolve(cid){
      C.edit(pid, cid, x => { x.resolved = Date.now(); });
      prose.querySelectorAll('span.cmt[data-c="' + cid + '"]').forEach(s => s.classList.add('cmt-res'));
      if (active === cid) active = null;
      ctx.onChange(); build(); layout();
      T.toast('Comentário resolvido.', { action: { label: 'Desfazer', fn: () => reopen(cid) } });
    }
    function reopen(cid){
      C.edit(pid, cid, x => { delete x.resolved; });
      prose.querySelectorAll('span.cmt[data-c="' + cid + '"]').forEach(s => s.classList.remove('cmt-res'));
      ctx.onChange(); build(); layout();
    }
    async function remove(cid){
      if (!await T.confirm('Apagar este comentário?', 'O comentário e as respostas somem. O texto continua igual.', 'Apagar', true)) return;
      removeNow(cid);
    }
    function removeNow(cid){
      prose.querySelectorAll('span.cmt[data-c="' + cid + '"]').forEach(s => s.replaceWith(...s.childNodes));
      C.put(pid, cid, null); if (active === cid) active = null;
      ctx.onChange(); build(); layout();
    }
    function cancelDraft(){
      if (!draft) return;
      const s = spanOf(draft.cid); if (s) s.replaceWith(...s.childNodes);
      draft = null; active = null; ctx.onChange(); build(); layout();
    }
    function startDraft(span, holderId, quote){
      if (draft) cancelDraft();
      draft = { cid: span.dataset.c, holderId, quote };
      active = draft.cid; span.classList.add('cmt-on');
      ctx.onChange(); build(); layout();
    }

    // clique num trecho comentado abre o cartão
    prose.addEventListener('click', (e) => { const s = e.target.closest && e.target.closest('span.cmt[data-c]'); if (s && !s.classList.contains('cmt-res') && el.isConnected) setActive(s.dataset.c); else if (!s && active && !draft) setActive(null); });
    const off = T.on('comments-changed', (p) => { if (p === pid && !draft) { build(); layout(); } });

    return {
      el, build, layout, count, startDraft, cancelDraft, resolve, reopen, remove, removeNow,
      activate(cid, reply){ setActive(cid, reply); },
      get draft(){ return draft; },
      destroy(){ off && off(); el.remove(); },
    };
  };

  /* ---------- painel com todos os comentários ---------- */
  C.panel = (pid, opts = {}) => {
    const here = opts.here; // trilho do editor aberto (para ir direto ao trecho)
    let filt = opts.filter || 'open', scope = here && opts.scope !== 'all' ? 'here' : 'all', q = '';
    const flat = T.MS.flat(pid).map(x => x.id);
    const order = (id) => { const i = flat.indexOf(id); return i < 0 ? 1e9 : i; };
    T.modal((boxEl, close) => {
      const body = h('div.cmtp-list');
      const segs = h('div.cmtp-bar');
      const search = h('input.input', { type: 'search', placeholder: 'Procurar nos comentários…', 'aria-label': 'Procurar nos comentários' });
      search.oninput = () => { q = search.value.trim().toLowerCase(); draw(); };
      function seg(vals, cur, fn, label){ return h('div.seg', { role: 'group', 'aria-label': label }, vals.map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => fn(k) }, l); if (k === cur) b.classList.add('on'); return b; })); }
      function draw(){
        let all = C.all(pid);
        if (scope === 'here' && here) { const ids = new Set(here.ids()); all = all.filter(x => ids.has(x.it.id) || here.has(x.cid)); }
        const nOpen = all.filter(x => !x.c.resolved).length, nRes = all.length - nOpen;
        segs.innerHTML = '';
        segs.append(seg([['open', 'Abertos (' + nOpen + ')'], ['res', 'Resolvidos (' + nRes + ')'], ['all', 'Todos (' + all.length + ')']], filt, (k) => { filt = k; draw(); }, 'Quais comentários'),
          here ? seg([['here', 'Este texto'], ['all', 'Livro inteiro']], scope, (k) => { scope = k; draw(); }, 'Onde') : null, search);
        let rows = all.filter(x => filt === 'all' || (filt === 'open' ? !x.c.resolved : !!x.c.resolved));
        if (q) rows = rows.filter(x => [x.c.text, x.c.quote, ...(x.c.replies || []).map(r => r.text)].join(' ').toLowerCase().includes(q));
        rows.sort((a, b) => order(a.it.id) - order(b.it.id) || a.c.date - b.c.date);
        body.innerHTML = '';
        if (!rows.length) { body.append(h('p.muted.cmtp-empty', filt === 'res' ? 'Nenhum comentário resolvido.' : filt === 'open' ? 'Nenhum comentário aberto. Selecione um trecho do texto e toque no balão para comentar.' : 'Nenhum comentário ainda.')); return; }
        let lastId = null;
        rows.forEach(({ cid, c, it }) => {
          if (it.id !== lastId) { lastId = it.id; const ch = T.MS.chapterOf ? T.MS.chapterOf(it) : null; body.append(h('div.cmtp-group', (ch && ch.id !== it.id ? (ch.title || 'Capítulo') + ' › ' : '') + (it.title || 'Sem título'))); }
          const name = C.author(pid);
          const go = () => {
            close();
            if (here && here.has(cid)) { here.focus(cid); return; }
            T._cmtFocus = cid; T.Shell.open({ kind: 'doc', ref: it.id });
          };
          body.append(h('div.cmtp-item' + (c.resolved ? '.res' : ''),
            c.quote ? h('q', c.quote) : null,
            h('div.cc-head', avatar(name), h('div.cc-who', h('b', name), h('span.cc-time', fmtDate(c.date))), c.resolved ? h('span.chip.cmtp-chip', icon('check'), 'Resolvido') : null),
            h('div.cc-text', c.text),
            (c.replies || []).length ? h('div.cmtp-replies', (c.replies || []).map(r => h('div', h('b', name + ': '), r.text))) : null,
            h('div.cmtp-actions',
              h('button.btn.sm', { type: 'button', onclick: go }, icon('eye'), 'Ir ao trecho'),
              c.resolved
                ? h('button.btn.sm', { type: 'button', onclick: () => { if (here && here.has(cid)) here.reopen(cid); else { C.edit(pid, cid, x => { delete x.resolved; }); unmark(it, cid, false); } draw(); } }, icon('undo'), 'Reabrir')
                : h('button.btn.sm', { type: 'button', onclick: () => { if (here && here.has(cid)) here.resolve(cid); else { C.edit(pid, cid, x => { x.resolved = Date.now(); }); unmark(it, cid, true); } draw(); } }, icon('check'), 'Resolver'),
              h('button.btn.sm', { type: 'button', onclick: async () => {
                if (!await T.confirm('Apagar este comentário?', 'O comentário e as respostas somem. O texto continua igual.', 'Apagar', true)) return;
                if (here && here.has(cid)) { here.removeNow(cid); } else { stripSpan(it, cid); C.put(pid, cid, null); }
                draw();
              } }, icon('trash'), 'Apagar'))));
        });
      }
      // marca/desmarca o trecho dentro do texto guardado (quando a cena não está aberta)
      function unmark(it, cid, res){
        const f = findSpanHolder(cid) || it; const d = document.createElement('div'); d.innerHTML = f.body || '';
        d.querySelectorAll('span.cmt[data-c="' + cid + '"]').forEach(s => s.classList.toggle('cmt-res', res));
        S().update(f.id, { body: d.innerHTML });
      }
      function stripSpan(it, cid){
        const f = findSpanHolder(cid) || it; const d = document.createElement('div'); d.innerHTML = f.body || '';
        d.querySelectorAll('span.cmt[data-c="' + cid + '"]').forEach(s => s.replaceWith(...s.childNodes));
        S().update(f.id, { body: d.innerHTML });
      }
      function findSpanHolder(cid){ return S().all(pid).find(x => x.type !== 'snapshot' && (x.body || '').includes('data-c="' + cid + '"')); }
      boxEl.append(h('h2', 'Comentários'), h('p.sub', 'Todos os comentários do livro. Os resolvidos ficam guardados aqui e podem ser reabertos.'), segs, body,
        h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Fechar')));
      draw();
    }, { wide: true });
  };
})();
