/* Tinteiro — peças de interface: modais, menus, avisos */
(function(T){
  const { h, icon } = T;

  T.toast = (msg, opts = {}) => {
    const layer = document.getElementById('layer-toast');
    const el = h('div.toast.glass.glass-strong', msg, opts.action ? h('button.btn.sm', { onclick: () => { opts.action.fn(); el.remove(); } }, opts.action.label) : null);
    layer.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, opts.ms || 3600);
  };
  T.on('toast', (m) => T.toast(m));

  T.modal = (build, opts = {}) => {
    const layer = document.getElementById('layer-modal');
    const box = h('div.modal.glass.glass-strong' + (opts.wide ? '.wide' : ''), { role: 'dialog', 'aria-modal': 'true' });
    const scrim = h('div.scrim', box);
    let closed = false;
    const close = (v) => { if (closed) return; closed = true; scrim.remove(); document.removeEventListener('keydown', onKey, true); opts.onClose && opts.onClose(v); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('mousedown', (e) => { if (e.target === scrim && !opts.sticky) close(); });
    build(box, close);
    layer.appendChild(scrim);
    const f = box.querySelector('[autofocus], input, textarea'); if (f) setTimeout(() => f.focus(), 30);
    return close;
  };

  T.confirm = (title, text, okLabel = 'Confirmar', danger = false) => new Promise(res => {
    T.modal((box, close) => {
      box.append(h('h2', title), text ? h('p.sub', text) : null,
        h('div.modal-foot', h('button.btn', { onclick: () => close(false) }, 'Cancelar'), h('button.btn' + (danger ? '.danger' : '.primary'), { onclick: () => close(true) }, okLabel)));
    }, { onClose: (v) => res(!!v) });
  });

  T.ask = (title, opts = {}) => new Promise(res => {
    T.modal((box, close) => {
      const inp = opts.multiline ? h('textarea.textarea', { placeholder: opts.placeholder || '' }) : h('input.input', { placeholder: opts.placeholder || '', value: opts.value || '' });
      if (opts.multiline) inp.value = opts.value || '';
      const ok = () => close(inp.value.trim());
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (!opts.multiline || e.metaKey || e.ctrlKey)) { e.preventDefault(); ok(); } });
      box.append(h('h2', title), opts.text ? h('p.sub', opts.text) : null, inp,
        h('div.modal-foot', h('button.btn', { onclick: () => close(null) }, 'Cancelar'), h('button.btn.primary', { onclick: ok }, opts.ok || 'Salvar')));
    }, { onClose: (v) => res(v == null ? null : v) });
  });

  // Menu de contexto: items = [{label, icon, fn, danger}, '-', {head:'…'}]
  let openMenu = null;
  T.menu = (x, y, list) => {
    T.closeMenu();
    const m = h('div.menu.glass.glass-strong', { role: 'menu' });
    list.forEach(it => {
      if (!it) return;
      if (it === '-') return m.appendChild(h('hr'));
      if (it.head) return m.appendChild(h('div.mh', it.head));
      const txt = it.desc ? h('span.mi-t', h('span.mi-l', it.label), h('span.mi-d', it.desc)) : h('span.mi-t', it.label);
      const b = h('button' + (it.danger ? '.danger' : '') + (it.on ? '.mi-is-on' : ''), { role: it.on !== undefined ? 'menuitemcheckbox' : 'menuitem', 'aria-checked': it.on !== undefined ? String(!!it.on) : null, onclick: () => { T.closeMenu(); it.fn && it.fn(); } }, it.icon ? icon(it.icon) : null, txt,
        it.key ? h('span.mi-k', it.key) : null, it.on !== undefined ? h('span.mi-on', it.on ? '✓' : '') : null);
      if (it.svg) { const sp = h('span.menu-svg'); sp.innerHTML = it.svg; b.prepend(sp); }
      m.appendChild(b);
    });
    document.body.appendChild(m);
    const r = { width: m.offsetWidth, height: m.offsetHeight }; // tamanho real (a animação encolhe o retângulo)
    m.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
    // painel longo: fica perto do botão e ganha barra de rolagem
    const below = innerHeight - y - 10, above = y - 10;
    if (r.height <= below) m.style.top = y + 'px';
    else if (below >= 260 || below >= above) { m.style.top = y + 'px'; m.style.maxHeight = Math.max(160, below) + 'px'; }
    else if (r.height <= above) m.style.top = Math.max(8, y - r.height - 12) + 'px';
    else { m.style.top = '8px'; m.style.maxHeight = Math.max(160, above - 4) + 'px'; }
    if (m.scrollHeight > m.clientHeight + 2) m.classList.add('scrolls');
    openMenu = m;
    setTimeout(() => document.addEventListener('mousedown', outside, true), 0);
    return m;
  };
  function outside(e){ if (openMenu && !openMenu.contains(e.target)) T.closeMenu(); }
  T.closeMenu = () => { if (openMenu) { openMenu.remove(); openMenu = null; document.removeEventListener('mousedown', outside, true); } };
  T.menuAt = (btn, list) => { const r = btn.getBoundingClientRect(); return T.menu(r.left, r.bottom + 6, list); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') T.closeMenu(); });

  // Painel flutuante preso a um botão (fecha ao clicar fora)
  let openPop = null;
  T.popover = (anchor, content, opts = {}) => {
    if (openPop) { openPop.remove(); openPop = null; }
    const pop = h('div.popover.glass.glass-strong', content);
    document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect(); const pr = { width: pop.offsetWidth, height: pop.offsetHeight };
    pop.style.left = T.clamp(r.left + r.width / 2 - pr.width / 2, 8, innerWidth - pr.width - 8) + 'px';
    const spB = innerHeight - r.bottom - 16, spA = r.top - 16;
    if (pr.height <= spB) pop.style.top = (r.bottom + 8) + 'px';
    else if (pr.height <= spA) pop.style.top = (r.top - pr.height - 8) + 'px';
    else if (spB >= spA) { pop.style.top = (r.bottom + 8) + 'px'; pop.style.maxHeight = Math.max(200, spB) + 'px'; }
    else { pop.style.top = '8px'; pop.style.maxHeight = Math.max(200, spA) + 'px'; }
    openPop = pop;
    const out = (e) => { if (!pop.contains(e.target) && !anchor.contains(e.target)) { pop.remove(); if (openPop === pop) openPop = null; document.removeEventListener('mousedown', out, true); } };
    setTimeout(() => document.addEventListener('mousedown', out, true), 0);
    const esc = (e) => { if (e.key === 'Escape') pop.remove(); };
    document.addEventListener('keydown', esc, true);
    const remove = pop.remove.bind(pop);
    pop.remove = () => { remove(); document.removeEventListener('mousedown', out, true); document.removeEventListener('keydown', esc, true); if (openPop === pop) openPop = null; };
    return pop;
  };

  // botão de menu com setinha (para juntar ferramentas)
  T.menuButton = (ic, label, title, onOpen, cls = '') => h('button.btn.sm.tool-menu' + cls, { type: 'button', title, onclick: (e) => onOpen(e.currentTarget) }, ic ? T.icon(ic) : null, label, h('span.caret', '▾'));

  T.closePopover = () => { if (openPop) openPop.remove(); };

  // escolhe um arquivo; quando o navegador deixa, já abre na pasta Downloads
  T.pickFile = (accept, opts = {}) => new Promise(res => {
    const viaInput = () => { const inp = h('input', { type: 'file', accept, style: { display: 'none' } }); inp.addEventListener('change', () => { res(inp.files[0] || null); inp.remove(); }); document.body.appendChild(inp); inp.click(); };
    if (opts.startIn && window.showOpenFilePicker && window.top === window) {
      const exts = String(accept || '').split(',').map(x => x.trim()).filter(x => x.startsWith('.'));
      window.showOpenFilePicker({ startIn: opts.startIn, multiple: false, types: exts.length ? [{ description: 'Arquivos', accept: { 'application/octet-stream': exts } }] : undefined })
        .then(async ([hd]) => res(hd ? await hd.getFile() : null))
        .catch((e) => { if (e && e.name === 'AbortError') res(null); else viaInput(); });
      return;
    }
    viaInput();
  });

  T.iconBtn = (name, title, onclick, cls = '') => {
    const b = h('button.icon-btn' + cls, { title, 'aria-label': title, onclick }, icon(name));
    return b;
  };

  // Seletor de cor arco-íris
  T.swatches = (current, onPick) => {
    const wrap = h('div.swatches');
    T.HUES.forEach(hh => {
      const b = h('button.swatch', { type: 'button', title: 'Cor ' + hh, style: { '--h': hh } });
      b.style.setProperty('--h', hh);
      if (hh === current) b.classList.add('on');
      b.onclick = () => { wrap.querySelectorAll('.swatch').forEach(s => s.classList.remove('on')); b.classList.add('on'); onPick(hh); };
      wrap.appendChild(b);
    });
    return wrap;
  };
})(window.T);
