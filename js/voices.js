/* Entrelinhas — biblioteca de vozes: áudios seus imitando como cada personagem fala */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;
  const listOf = (pid) => (S().get(pid)?.meta?.voices || []).slice();
  const saveList = (pid, list) => { S().update(pid, { meta: { voices: list } }); T.emit('voices-changed', { pid }); };
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  // nomes que contam para cada voz (nome + apelidos)
  const namesOf = (v) => [v.name, ...(v.aliases || [])].map(x => (x || '').trim()).filter(Boolean);

  /* ----- tocar ----- */
  let player = null, playingId = null;
  async function play(v, clipIdx = 0){
    const clip = (v.clips || [])[clipIdx]; if (!clip) { T.toast('Ainda não há áudio para ' + v.name + '.'); return; }
    stop();
    const url = await T.Assets.resolve(clip.ref); if (!url) { T.toast('Não achei o áudio (talvez ele esteja guardado só em outro computador).'); return; }
    player = new Audio(url); playingId = v.id + ':' + clipIdx;
    player.onended = () => { playingId = null; T.emit('voices-playing'); };
    try { await player.play(); } catch (e) { T.toast('Não consegui tocar o áudio.'); playingId = null; }
    T.emit('voices-playing');
  }
  function stop(){ if (player) { player.pause(); player = null; } playingId = null; T.emit('voices-playing'); }

  /* ----- subir ou gravar ----- */
  async function upload(pid, vid){
    const f = await T.pickFile('audio/*,.m4a,.mp3,.wav,.ogg,.webm,.aac'); if (!f) return;
    T.toast('Guardando ' + f.name + '…');
    const ref = await saveAudio(f); if (!ref) return;
    const clean = f.name.replace(/\.[^.]+$/, ''); const nm = /^(SaveClip|WhatsApp|AUD|PTT|Gravação|Recording|audio|voice)/i.test(clean) || clean.length > 40 ? 'Áudio ' + new Date().toLocaleDateString('pt-BR') : clean;
    addClip(pid, vid, { ref, name: nm, at: Date.now() });
  }
  // áudio: a nuvem das páginas do claude.ai não aceita arquivos de som, então ele fica guardado neste computador (no navegador)
  async function saveAudio(f){
    if (T.BigFiles?.saveLocal) { try { return await T.BigFiles.saveLocal(f); } catch (e) { console.warn(e); } }
    const ref = await T.Assets.upload(f); if (ref) return ref;
    T.toast('Não consegui guardar o áudio neste navegador. Veja se há espaço livre no computador e tente de novo.'); return null;
  }
  function addClip(pid, vid, clip){
    const list = listOf(pid); const v = list.find(x => x.id === vid); if (!v) return;
    v.clips = (v.clips || []).concat([clip]); saveList(pid, list); T.toast('Voz de ' + v.name + ' guardada' + (clip.ref?.local ? ' neste computador.' : '.'));
  }
  async function record(pid, vid){
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { T.toast('Este navegador não grava áudio. Grave no celular e suba o arquivo.'); return; }
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { T.toast(T.STANDALONE ? 'O microfone foi bloqueado. Libere o microfone para este site e tente de novo.' : 'Dentro do claude.ai o microfone fica bloqueado. Grave no celular (ou abra o Entrelinhas pelo GitHub) e suba o arquivo aqui.'); return; }
    const rec = new MediaRecorder(stream); const chunks = []; rec.ondataavailable = (e) => chunks.push(e.data);
    let t0 = Date.now(), tick;
    T.modal((box, close) => {
      const time = h('b.num.vc-rec-t', '0:00');
      tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); time.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 250);
      box.append(h('h2', 'Gravando…'), h('p.sub', 'Fale como o personagem fala. Quando terminar, clique em Parar e guardar.'), h('div.vc-rec', h('span.vc-dot'), time),
        h('div.modal-foot', h('button.btn', { type: 'button', onclick: () => { rec.onstop = null; rec.stop(); stream.getTracks().forEach(t => t.stop()); clearInterval(tick); close(); } }, 'Cancelar'),
          h('button.btn.primary', { type: 'button', onclick: () => { rec.stop(); clearInterval(tick); close(); } }, icon('check'), 'Parar e guardar')));
    });
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      const f = new File([blob], 'voz-' + new Date().toISOString().slice(0, 10) + '.webm', { type: blob.type });
      const ref = await saveAudio(f); if (ref) addClip(pid, vid, { ref, name: 'Gravação ' + new Date().toLocaleDateString('pt-BR'), at: Date.now() });
    };
    rec.start();
  }

  function newVoice(pid, name){
    const list = listOf(pid);
    const ex = list.find(v => norm(v.name) === norm(name)); if (ex) return ex;
    const page = S().all(pid).find(p => p.type === 'page' && norm(p.title) === norm(name));
    const v = { id: T.id(), name: name.trim(), aliases: [], note: '', clips: [], page: page ? page.id : null, at: Date.now() };
    list.push(v); saveList(pid, list); return v;
  }

  /* ----- achar a voz de um nome no texto ----- */
  function voiceFor(pid, text){
    const t = norm(text).replace(/[^a-z0-9\s'-]/g, ' ').trim(); if (!t) return null;
    return listOf(pid).find(v => namesOf(v).some(n => norm(n) === t || norm(n).split(/\s+/)[0] === t));
  }
  // nome do personagem que está no ponto onde você clicou
  function voiceAtPoint(pid, node, offset){
    if (!node || node.nodeType !== 3) return null;
    const txt = node.textContent; const list = listOf(pid); if (!list.length) return null;
    for (const v of list) for (const n of namesOf(v)) {
      const re = new RegExp('(^|[^\\p{L}])(' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\p{L}])', 'giu'); let m;
      while ((m = re.exec(txt))) { const a = m.index + m[1].length, b = a + m[2].length; if (offset >= a && offset <= b) { const r = document.createRange(); r.setStart(node, a); r.setEnd(node, b); return { v, range: r }; } }
    }
    return null;
  }
  // destaca no texto os nomes que têm voz (sublinhado pontilhado)
  function ranges(pid, root){
    const list = listOf(pid).filter(v => (v.clips || []).length); if (!list.length) return [];
    const names = list.flatMap(namesOf).sort((a, b) => b.length - a.length); if (!names.length) return [];
    const re = new RegExp('(^|[^\\p{L}])(' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}])', 'giu');
    const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const txt = n.textContent; let m; re.lastIndex = 0; while ((m = re.exec(txt))) { const a = m.index + m[1].length; const r = document.createRange(); r.setStart(n, a); r.setEnd(n, a + m[2].length); out.push(r); } }
    return out;
  }
  // balãozinho "▶ ouvir" perto do nome
  let chip = null, chipT = 0;
  function showChip(v, rect, opts = {}){
    hideChip();
    const pid = T.Shell?.pid; const has = (v.clips || []).length;
    chip = h('div.vc-chip.glass.glass-strong', { role: 'dialog' },
      has ? h('button.btn.sm.primary', { type: 'button', onclick: () => { if (playingId && playingId.startsWith(v.id)) stop(); else play(v); } }, icon(playingId && playingId.startsWith(v.id) ? 'pause' : 'play'), 'Ouvir ' + v.name) : h('button.btn.sm', { type: 'button', onclick: () => { hideChip(); upload(pid, v.id); } }, icon('upload'), 'Subir a voz de ' + v.name),
      has && v.clips.length > 1 ? h('span.muted', { style: { fontSize: '11px' } }, v.clips.length + ' áudios') : null,
      v.note ? h('span.vc-chip-note', v.note.slice(0, 90)) : null,
      h('button.icon-btn', { type: 'button', title: 'Abrir a biblioteca de vozes', onclick: () => { hideChip(); T.Shell.open({ kind: 'voices', ref: 'voices' }, { side: true }); } }, icon('pop')));
    chip.addEventListener('mousedown', (e) => e.preventDefault());
    document.body.appendChild(chip);
    const cr = chip.getBoundingClientRect();
    chip.style.left = T.clamp(rect.left, 8, innerWidth - cr.width - 8) + 'px';
    // embaixo da seleção (em cima fica o balão de negrito, itálico…)
    const below = rect.bottom + 10, above = rect.top - cr.height - 54;
    chip.style.top = (opts.below ? (below + cr.height < innerHeight - 8 ? below : Math.max(8, above)) : (rect.top - cr.height - 8 > 8 ? rect.top - cr.height - 8 : below)) + 'px';
    clearTimeout(chipT); chipT = setTimeout(() => { if (chip && !chip.matches(':hover')) hideChip(); }, 6000);
    chip.addEventListener('mouseleave', () => { clearTimeout(chipT); chipT = setTimeout(hideChip, 1500); });
  }
  function hideChip(){ if (chip) { chip.remove(); chip = null; } }
  document.addEventListener('mousedown', (e) => { if (chip && !chip.contains(e.target)) hideChip(); }, true);
  T.on('voices-playing', () => { if (chip) { const b = chip.querySelector('.btn.primary'); if (b && !playingId) b.firstChild.replaceWith(icon('play')); } });

  T.Voices = { list: listOf, play, stop, upload, record, newVoice, voiceFor, voiceAtPoint, ranges, showChip, hideChip, isPlaying: (id) => !!playingId && playingId.startsWith(id) };

  /* ----- tela: biblioteca de vozes ----- */
  T.Views.voices = {
    icon: 'voice', title: () => 'Biblioteca de vozes',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad.vc-view'); root.appendChild(v);
      const chars = () => S().all(pid).filter(p => p.type === 'page' && (p.meta?.tpl || '') === 'personagem').map(p => p.title).filter(Boolean);
      function render(){
        const list = listOf(pid).sort((a, b) => a.name.localeCompare(b.name, 'pt'));
        const missing = chars().filter(n => !list.some(x => norm(x.name) === norm(n)));
        const nameIn = h('input.input', { placeholder: 'Nome do personagem', list: 'vc-names', onkeydown: (e) => { if (e.key === 'Enter') add(); } });
        const add = () => { const n = nameIn.value.trim(); if (!n) { nameIn.focus(); return; } newVoice(pid, n); nameIn.value = ''; };
        v.replaceChildren(
          h('div.vc-head', h('div', h('h2', 'Biblioteca de vozes'), h('p.muted', 'Suba um áudio seu falando como cada personagem fala. Depois, no texto, clique no nome dele para ouvir e lembrar como ele soa. Os áudios ficam guardados neste computador (no navegador); em outro computador, suba de novo.'))),
          h('div.vc-add.glass', icon('person'), nameIn, h('datalist#vc-names', missing.map(n => h('option', { value: n }))), h('button.btn.primary', { type: 'button', onclick: add }, icon('plus'), 'Adicionar personagem')),
          missing.length ? h('div.vc-sugg', h('span.muted', 'Da sua Wiki: '), missing.slice(0, 12).map(n => h('button.chip', { type: 'button', onclick: () => newVoice(pid, n) }, '+ ' + n))) : null,
          list.length ? h('div.vc-grid', list.map(card)) : h('div.vc-empty.glass', h('b', 'Nenhuma voz ainda'), h('span', 'Adicione um personagem acima e suba um áudio (MP3, M4A, WAV, OGG ou WEBM).')));
      }
      function card(vc){
        const page = vc.page && S().get(vc.page);
        const upd = (patch) => { const list = listOf(pid); const x = list.find(y => y.id === vc.id); if (!x) return; Object.assign(x, patch); saveList(pid, list); };
        const note = h('textarea.input.vc-note', { rows: 2, placeholder: 'Como ele fala: sotaque, ritmo, manias, palavras que repete…', value: vc.note || '', onchange: (e) => upd({ note: e.target.value }) });
        const alias = h('input.input.vc-alias', { placeholder: 'Apelidos (separe por vírgula)', value: (vc.aliases || []).join(', '), onchange: (e) => upd({ aliases: e.target.value.split(',').map(x => x.trim()).filter(Boolean) }) });
        return h('div.vc-card.glass',
          h('div.vc-top',
            page?.meta?.portrait ? h('img.vc-por', { src: T.Assets.url(page.meta.portrait), alt: '' }) : h('div.vc-por.ph', (vc.name || '?').slice(0, 1).toUpperCase()),
            h('div.grow', h('input.vc-name', { value: vc.name, 'aria-label': 'Nome', onchange: (e) => { const n = e.target.value.trim(); if (n) upd({ name: n }); } }), h('div.muted', { style: { fontSize: '12px' } }, (vc.clips || []).length ? (vc.clips.length + (vc.clips.length === 1 ? ' áudio' : ' áudios')) : 'sem áudio ainda')),
            (vc.clips || []).length ? h('button.vc-play' + (T.Voices.isPlaying(vc.id) ? '.on' : ''), { type: 'button', title: 'Ouvir', onclick: () => { if (T.Voices.isPlaying(vc.id)) stop(); else play(vc); } }, icon(T.Voices.isPlaying(vc.id) ? 'pause' : 'play')) : null),
          (vc.clips || []).length ? h('div.vc-clips', vc.clips.map((c, i) => h('div.vc-clip',
            h('button.icon-btn', { type: 'button', title: 'Ouvir este', onclick: () => { if (playingId === vc.id + ':' + i) stop(); else play(vc, i); } }, icon(playingId === vc.id + ':' + i ? 'pause' : 'play')),
            h('input.vc-clipname', { value: c.name || ('Áudio ' + (i + 1)), onchange: (e) => { const list = listOf(pid); const x = list.find(y => y.id === vc.id); x.clips[i].name = e.target.value; saveList(pid, list); } }),
            c.ref?.local ? h('span.chip.gray', 'neste computador') : null,
            h('button.icon-btn', { type: 'button', title: 'Apagar este áudio', onclick: async () => { if (!(await T.confirm('Apagar este áudio?', c.name || '', 'Apagar', true))) return; const list = listOf(pid); const x = list.find(y => y.id === vc.id); const [gone] = x.clips.splice(i, 1); saveList(pid, list); if (gone?.ref && !gone.ref.local) T.Assets.remove(gone.ref); } }, icon('trash'))))) : null,
          h('div.vc-actions',
            h('button.btn.sm', { type: 'button', onclick: () => upload(pid, vc.id) }, icon('upload'), (vc.clips || []).length ? 'Subir outro áudio' : 'Subir áudio'),
            h('button.btn.sm', { type: 'button', onclick: () => record(pid, vc.id) }, icon('voice'), 'Gravar'),
            page ? h('button.btn.sm', { type: 'button', onclick: () => T.Shell.open({ kind: 'page', ref: page.id }, { side: true }) }, icon('book'), 'Página') : null,
            h('span.grow'),
            h('button.icon-btn.danger', { type: 'button', title: 'Tirar da biblioteca', onclick: async () => { if (!(await T.confirm('Tirar ' + vc.name + ' da biblioteca?', 'Os áudios dele também saem.', 'Tirar', true))) return; saveList(pid, listOf(pid).filter(y => y.id !== vc.id)); } }, icon('trash'))),
          alias, note);
      }
      render();
      const typing = () => v.contains(document.activeElement) && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement !== v.querySelector('.vc-add input');
      const offs = [T.on('voices-changed', (e) => { if (e?.pid === pid && !typing()) render(); }), T.on('voices-playing', () => { if (!typing()) render(); })];
      return { destroy(){ offs.forEach(f => f()); } };
    },
  };
})();
