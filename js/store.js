/* Tinteiro — camada de dados.
   Na nuvem: cada coisa (projeto, capítulo, cena, ideia…) é um documento em
   data/users/<id>/root/items/<itemId>, privado da usuária. Sem nuvem, cai para o navegador. */
(function(T){
  const items = new Map();
  let db = null, user = null, uid = null, coll = null, mode = 'local';
  const timers = new Map();      // id -> timeout de gravação
  const chains = new Map();      // id -> promessa da última gravação (uma por vez)
  const dirty = new Set();
  const LS = 'tinteiro:v1';
  let saving = 0, failed = false;

  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function status(){ T.emit('save-status', { saving, failed, mode }); }

  async function init(){
    try {
      if (window.claude && typeof claude.use === 'function') {
        const [d, u] = await Promise.all([withTimeout(claude.use('db'), 11000).catch(() => null), withTimeout(claude.use('user'), 11000).catch(() => null)]);
        user = u;
        if (d && u) {
          const id = await u.id().catch(() => null);
          if (id) { db = d; uid = id; coll = db.doc('data/users/' + uid + '/root').collection('items'); mode = 'cloud'; }
        }
      }
    } catch (e) { console.warn('db indisponível', e); }
    if (mode !== 'cloud') await loadLocal();
    return mode;
  }

  // sem nuvem: guarda no IndexedDB do navegador (cabe um livro inteiro; o localStorage só tem ~5 MB)
  let ldb = null;
  const lidb = () => ldb || (ldb = new Promise((res, rej) => { try { const r = indexedDB.open('entrelinhas-livros', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const lget = async (k) => { const d = await lidb(); return new Promise((res) => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); };
  const lput = async (k, v) => { const d = await lidb(); return new Promise((res, rej) => { const tx = d.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); };
  async function loadLocal(){
    let list = null;
    try { list = await lget(LS); } catch (e) { list = null; }
    if (!Array.isArray(list)) { try { const raw = localStorage.getItem(LS); if (raw) list = JSON.parse(raw); } catch (e) {} }
    (list || []).forEach(it => items.set(it.id, it));
  }
  const saveLocal = T.debounce(async () => {
    const all = [...items.values()];
    let ok = false;
    try { await lput(LS, all); ok = true; } catch (e) {}
    try { const js = JSON.stringify(all); if (js.length < 4e6) localStorage.setItem(LS, js); else localStorage.removeItem(LS); ok = true; } catch (e) {}
    if (!ok) T.emit('toast', 'Não consegui salvar no navegador: o espaço pode ter acabado. Baixe um backup agora.');
  }, 600);

  async function query(field, op, value){
    const snap = await withTimeout(coll.where(field, op, value).get(), 20000);
    // os documentos que chegam da nuvem vêm congelados (só leitura): guardo uma cópia editável
    snap.docs.forEach(d => {
      if (!d.exists || dirty.has(d.id)) return;
      const rem = d.data(), cur = items.get(d.id);
      // nunca troca uma versão mais nova (já editada aqui) por uma cópia mais antiga que a nuvem ainda devolve
      if (cur && (cur.updated || 0) > (rem.updated || 0)) return;
      items.set(d.id, clone(rem));
    });
    return snap.docs.length;
  }

  async function loadProjects(){
    if (mode === 'cloud') {
      try { await query('type', 'in', ['project', 'prefs']); }
      catch (e) { console.warn(e); T.emit('toast', 'A nuvem demorou a responder. Tentando de novo…'); try { await query('type', 'in', ['project', 'prefs']); } catch (e2) { T.emit('toast', 'Não consegui carregar seus projetos agora. Recarregue a página em instantes.'); } }
    }
    return [...items.values()].filter(i => i.type === 'project');
  }
  async function loadProject(pid){
    if (mode === 'cloud') {
      try { await query('pid', '==', pid); }
      catch (e) { console.warn(e); T.emit('toast', 'Parte do projeto ainda não carregou. Se algo faltar, recarregue a página.'); }
    }
    return all(pid);
  }

  const all = (pid) => [...items.values()].filter(i => i.pid === pid && i.type !== 'project');
  const get = (id) => items.get(id);
  const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.created ?? 0) - (b.created ?? 0);
  function children(pid, parent, area){
    return all(pid).filter(i => (i.parent || null) === (parent || null) && (area == null || i.area === area)).sort(byOrder);
  }
  function descendants(id){
    const out = []; const it = get(id); if (!it) return out;
    const pool = all(it.pid);
    const walk = (p) => pool.filter(c => c.parent === p).forEach(c => { out.push(c); walk(c.id); });
    walk(id); return out;
  }

  function create(obj){
    const now = Date.now();
    const it = Object.assign({ id: T.id(), title: '', parent: null, order: now, created: now, updated: now, meta: {} }, obj);
    if (it.type === 'project') it.pid = it.id;
    items.set(it.id, it);
    schedule(it.id, 0);
    T.emit('items', { id: it.id, kind: 'create', item: it });
    return it;
  }

  function update(id, patch, opts = {}){
    let it = items.get(id); if (!it) return;
    if (Object.isFrozen(it) || (it.meta && Object.isFrozen(it.meta))) { it = clone(it); items.set(id, it); }
    for (const k in patch) {
      if (k === 'meta' && patch.meta && typeof patch.meta === 'object') it.meta = Object.assign({}, it.meta, patch.meta);
      else it[k] = patch[k];
    }
    it.updated = Date.now();
    schedule(id, opts.delay ?? 900);
    if (!opts.silent) T.emit('items', { id, kind: 'update', item: it, patch });
    return it;
  }

  function remove(id){
    const it = items.get(id); if (!it) return;
    const doomed = [it, ...descendants(id)];
    doomed.forEach(d => {
      items.delete(d.id); clearTimeout(timers.get(d.id)); timers.delete(d.id); dirty.delete(d.id);
      if (mode === 'cloud') enqueue(d.id, () => coll.doc(d.id).delete());
    });
    if (mode !== 'cloud') saveLocal();
    T.emit('items', { id, kind: 'remove', item: it });
  }

  async function removeProject(pid){
    if (mode === 'cloud') { try { await query('pid', '==', pid); } catch (e) {} }
    const doomed = [...items.values()].filter(i => i.pid === pid);
    doomed.forEach(d => { items.delete(d.id); if (mode === 'cloud') enqueue(d.id, () => coll.doc(d.id).delete()); });
    if (mode !== 'cloud') saveLocal();
    T.emit('items', { id: pid, kind: 'remove' });
  }

  function schedule(id, delay){
    dirty.add(id);
    if (mode !== 'cloud') { saveLocal(); dirty.delete(id); return; }
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => write(id), delay));
  }
  function enqueue(id, fn){
    const prev = chains.get(id) || Promise.resolve();
    const next = prev.catch(() => {}).then(async () => {
      saving++; status();
      try { await fn(); failed = false; }
      catch (e) {
        if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 600 + Math.random() * 900)); try { await fn(); failed = false; } catch (e2) { onFail(e2); } }
        else onFail(e);
      }
      finally { saving--; status(); }
    });
    chains.set(id, next);
    return next;
  }
  function onFail(e){
    failed = true; console.warn('falha ao salvar', e);
    if (e && e.code === 'quota_exceeded') T.emit('toast', 'O espaço na nuvem deste site encheu. Apague versões antigas ou imagens que não usa mais.');
    else if (e && e.code === 'invalid_argument') T.emit('toast', 'Um texto ficou grande demais para salvar de uma vez. Divida o capítulo em cenas menores.');
    else T.emit('toast', 'Não consegui salvar a última alteração. Vou tentar de novo na próxima mudança.');
  }
  function write(id){
    timers.delete(id);
    const it = items.get(id); if (!it) { dirty.delete(id); return; }
    const body = clone(it);
    return enqueue(id, () => coll.doc(id).set(body)).then(() => { if (items.get(id) && items.get(id).updated === it.updated) dirty.delete(id); });
  }
  async function flush(){
    const ids = [...timers.keys()];
    ids.forEach(id => { clearTimeout(timers.get(id)); write(id); });
    await Promise.all([...chains.values()]).catch(() => {});
  }
  window.addEventListener('beforeunload', (e) => { if (mode === 'cloud' && (timers.size || saving)) { flush(); e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  // Preferências da usuária (um documento só)
  function prefs(){
    let p = items.get('prefs');
    if (!p) { p = { id: 'prefs', type: 'prefs', pid: '_', meta: {}, created: Date.now(), updated: Date.now() }; items.set('prefs', p); }
    return p.meta;
  }
  function setPrefs(patch){ prefs(); update('prefs', { meta: patch }, { delay: 400 }); }

  // Importar itens de um backup
  function importItems(list){
    list.forEach(it => { if (!it || !it.id) return; items.set(it.id, it); schedule(it.id, 50 + Math.random() * 800); });
    T.emit('items', { kind: 'import' });
  }

  T.Store = { init, loadProjects, loadProject, all, get, children, descendants, create, update, remove, removeProject, flush, prefs, setPrefs, importItems, byOrder,
    get mode(){ return mode; }, get user(){ return user; }, get busy(){ return saving > 0 || timers.size > 0; } };

  /* ---------- arquivos (imagens, vídeos, músicas) ---------- */
  let assets = undefined;
  const LIMIT = 19.5 * 1024 * 1024;
  const sessionUrls = new Map();
  T.Assets = {
    async ready(){ if (assets === undefined) { try { assets = (window.claude && claude.use) ? await withTimeout(claude.use('assets'), 11000) : null; } catch (e) { assets = null; } } return assets; },
    async upload(file){
      const a = await this.ready();
      // arquivos grandes: imagens são reduzidas; vídeos podem ser comprimidos ou guardados só neste computador
      if (file.size > LIMIT && T.BigFiles) {
        const out = await T.BigFiles.handle(file, !!a);
        if (!out) return null;
        if (out.local) return out.local;
        file = out.file;
      }
      if (a) {
        try { const r = await a.upload(file); return { id: r.id, url: r.url || ('/_blob/' + r.id), kind: (file.type || '').split('/')[0], name: file.name }; }
        catch (e) { console.warn(e); T.emit('toast', 'Não consegui enviar o arquivo. Tente de novo; se o problema continuar, guarde-o só neste computador.'); return null; }
      }
      // versão independente: guarda o arquivo neste navegador (IndexedDB), sem limite de 20 MB
      if (T.STANDALONE && T.BigFiles) { try { return await T.BigFiles.saveLocal(file); } catch (e) { T.emit('toast', 'Não há espaço neste navegador para esse arquivo.'); return null; } }
      // Sem nuvem: imagens pequenas viram data URL; o resto vale só nesta visita
      if (file.size < 700000 && file.type.startsWith('image/')) {
        const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
        return { id: 'data', url, kind: 'image', name: file.name };
      }
      const id = 'sess-' + T.id(); const url = URL.createObjectURL(file); sessionUrls.set(id, url);
      T.emit('toast', 'Este arquivo vale só nesta visita: o armazenamento na nuvem não está disponível aqui.');
      return { id, url, kind: (file.type || '').split('/')[0], name: file.name };
    },
    // endereço de um arquivo guardado só neste computador (assíncrono)
    async resolve(ref){ if (ref && ref.local && T.BigFiles) return await T.BigFiles.url(ref.id); return this.url(ref); },
    url(ref){ if (!ref) return ''; if (ref.local) return T.BigFiles?.cached(ref.id) || ''; if (typeof ref === 'string') return ref; if (ref.id && String(ref.id).startsWith('sess-')) return sessionUrls.get(ref.id) || ''; if (ref.url) return ref.url; return ref.id ? '/_blob/' + ref.id : ''; },
    async remove(ref){ const a = await this.ready(); if (a && ref && ref.id && !ref.id.startsWith('sess-') && ref.id !== 'data') { try { await a.delete(ref.id); } catch (e) {} } },
  };

  /* ---------- baixar arquivos ---------- */
  let dl = undefined;
  T.Download = {
    async save(filename, data){
      if (dl === undefined) { try { dl = (window.claude && claude.use) ? await withTimeout(claude.use('downloads'), 11000) : null; } catch (e) { dl = null; } }
      if (dl) { try { await dl.save({ filename, data }); return true; } catch (e) { if (e && (e.code === 'cancelled' || e.code === 'declined' || e.code === 'user_declined')) return false; console.warn(e); } }
      if (T.STANDALONE) { try { const blob = data instanceof Blob ? data : new Blob([data], { type: /\.json$/.test(filename) ? 'application/json' : 'application/octet-stream' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); return true; } catch (e) { console.warn(e); } }
      return null; // sem download: quem chamou mostra o texto para copiar
    }
  };
})(window.T);
