/* Tinteiro — narração: vozes do Claude ou do aparelho, uma voz por personagem (com reconhecimento de quem fala)
   e gravações da própria autora por cena */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const CLAUDE_NAMES = { buttery: 'Aveludada', airy: 'Leve', glassy: 'Cristalina', rounded: 'Encorpada' };
  let claudeVoices = Object.keys(CLAUDE_NAMES);
  // cada voz ganha variações de ritmo (as vozes do Claude não mudam de tom); as do aparelho ganham tom e ritmo
  const C_VARS = [[1, ''], [.82, ' · calma e lenta'], [.92, ' · pausada'], [1.12, ' · ágil'], [1.28, ' · acelerada, nervosa']];
  const B_VARS = [[1, 1, ''], [.7, .92, ' · grave'], [.5, .85, ' · bem grave e lenta'], [1.3, 1.05, ' · aguda'], [1.6, 1.15, ' · bem aguda e rápida'], [.85, 1.2, ' · grave e rápida'], [1.15, .85, ' · suave e lenta']];
  const cName = (v) => CLAUDE_NAMES[v] || (v ? v[0].toUpperCase() + v.slice(1) : 'Padrão');
  const SPEECH_VERBS = 'disse|diz|perguntou|pergunta|respondeu|responde|gritou|grita|sussurrou|sussurra|murmurou|murmura|falou|fala|exclamou|exclama|retrucou|retruca|continuou|continua|insistiu|insiste|completou|completa|explicou|explica|pediu|pede|chamou|chama|riu|ri|suspirou|suspira|interrompeu|interrompe|repetiu|repete|avisou|avisa|declarou|declara|admitiu|admite|resmungou|resmunga|berrou|berra|implorou|implora|ordenou|ordena|acrescentou|acrescenta|concordou|concorda|rebateu|rebate|murmurou';
  let tts, cur = null;
  const isDialogue = (t) => /^\s*[—–“"«]/.test(t);
  const cfg = () => Object.assign({ engine: 'auto', narrator: 'buttery', dialogue: 'airy', split: true, rate: 1, bNarrator: '', bDialogue: '', useRec: true, nr: 1, dr: 1, bnp: 1, bnr: 1, bdp: 1, bdr: 1 }, S().prefs().narr || {});
  async function ttsReady(){ if (tts === undefined) { try { tts = (window.claude && claude.use) ? await Promise.race([claude.use('tts'), new Promise(r => setTimeout(() => r(null), 11000))]) : null; if (tts && tts.voices) { try { const vs = await tts.voices(); if (vs && vs.length) claudeVoices = vs; } catch (e) {} } } catch (e) { tts = null; } } return tts; }
  ttsReady();
  const browserVoices = () => ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
  const ptVoices = () => { const all = browserVoices(); const pt = all.filter(v => /^pt/i.test(v.lang)); return pt.length ? pt : all; };
  const chunks = (text) => { const out = []; let t = text.trim(); while (t.length > 1800) { let k = t.lastIndexOf('. ', 1800); if (k < 600) k = 1800; out.push(t.slice(0, k + 1)); t = t.slice(k + 1).trim(); } if (t) out.push(t); return out; };
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /* ----- elenco: vozes por personagem (por livro) ----- */
  const cast = (pid) => Object.assign({}, S().get(pid)?.meta?.cast || {});
  const setCast = (pid, c) => S().update(pid, { meta: { cast: c } });
  // nomes que a narração conhece: personagens da wiki (com apelidos) + nomes adicionados à mão
  function knownNames(pid){
    const out = new Map(); // nome em minúsculas -> chave do elenco
    T.Ent.pages(pid).filter(p => p.meta?.tpl === 'personagem').forEach(p => {
      const key = p.title.trim(); out.set(key.toLowerCase(), key);
      (p.meta?.aliases || '').split(',').map(a => a.trim()).filter(a => a.length > 1).forEach(a => out.set(a.toLowerCase(), key));
    });
    Object.keys(cast(pid)).forEach(k => { if (!out.has(k.toLowerCase())) out.set(k.toLowerCase(), k); });
    return out;
  }
  // divide um parágrafo de diálogo em pedaços de fala e de narração ("— Oi — disse Vera. — Tudo bem?")
  function segments(text){
    const t = text.trim();
    if (/^[—–]/.test(t)) {
      const parts = t.replace(/^[—–]\s*/, '').split(/\s+[—–]\s+/);
      return parts.map((x, i) => ({ text: x.trim(), speech: i % 2 === 0 })).filter(x => x.text);
    }
    if (/^[“"«]/.test(t)) {
      const out = []; const re = /([“"«])([^”"»]*)([”"»])|([^“"«]+)/g; let m;
      while ((m = re.exec(t))) { if (m[2] != null) out.push({ text: m[2].trim(), speech: true }); else if (m[4] && m[4].trim()) out.push({ text: m[4].trim(), speech: false }); }
      return out.filter(x => x.text);
    }
    return [{ text: t, speech: false }];
  }
  // quem fala neste parágrafo? procura o nome na parte narrada ("disse Vera", "Vera respondeu") e depois no parágrafo todo
  function speakerOf(text, names){
    if (!names.size) return null;
    const segs = segments(text); const narr = segs.filter(s => !s.speech).map(s => s.text).join(' ');
    const alt = [...names.keys()].sort((a, b) => b.length - a.length).map(esc).join('|');
    const near = new RegExp('(?:(?:' + SPEECH_VERBS + ')\\s+(?:a\\s+|o\\s+)?(' + alt + '))|(?:(' + alt + ')\\s+(?:' + SPEECH_VERBS + '))', 'iu');
    let m = narr.match(near) || text.match(near);
    if (m) return names.get((m[1] || m[2]).toLowerCase());
    const any = new RegExp('(?<![\\p{L}])(' + alt + ')(?![\\p{L}])', 'iu');
    m = narr.match(any);
    return m ? names.get(m[1].toLowerCase()) : null;
  }
  // atribui falantes a uma sequência de parágrafos; falas sem nome alternam entre as duas últimas pessoas da conversa
  function assignSpeakers(pid, paras){
    const names = knownNames(pid); const out = []; let last = [], streak = 0;
    paras.forEach(p => {
      const t = p.textContent || p;
      if (!isDialogue(t)) { out.push(null); streak = 0; return; }
      let who = speakerOf(t, names);
      if (!who && last.length === 2 && streak > 0) who = last[0] === last[1] ? null : (last[1] === out[out.length - 1] ? last[0] : last[1]);
      if (who) { if (last[last.length - 1] !== who) { last.push(who); if (last.length > 2) last.shift(); } }
      out.push(who); streak++;
    });
    return out;
  }
  T.Narr = { assignSpeakers, segments };

  /* ----- leitura ----- */
  T.Narr.read = async function(paras, { pid, onPara, onEnd }){
    const c = cfg(); const t = await ttsReady();
    const useClaude = t && c.engine !== 'browser' && !S().prefs().noClaude;
    const cs = cast(pid); const who = c.split ? assignSpeakers(pid, paras) : paras.map(() => null);
    // devolve { v: voz, r: ritmo, p: tom }
    const voiceFor = (i, seg) => {
      if (!c.split || !seg.speech) return useClaude ? { v: c.narrator, r: c.nr } : { v: c.bNarrator, r: c.bnr, p: c.bnp };
      const ent = who[i] && cs[who[i]];
      if (ent) return useClaude ? { v: ent.voice || c.dialogue, r: ent.r ?? c.dr } : { v: ent.bvoice ?? c.bDialogue, r: ent.br ?? c.bdr, p: ent.bp ?? c.bdp };
      return useClaude ? { v: c.dialogue, r: c.dr } : { v: c.bDialogue, r: c.bdr, p: c.bdp };
    };
    cur = { stop: null, onEnd };
    const parts = []; // {text, voice, i}
    paras.forEach((p, i) => { const segs = isDialogue(p.textContent) && c.split ? segments(p.textContent) : [{ text: p.textContent, speech: false }]; segs.forEach(sg => chunks(sg.text).forEach(x => parts.push({ text: x, voice: voiceFor(i, sg), i }))); });
    if (!parts.length) { cur = null; onEnd(); return; }
    if (useClaude) {
      const lines = parts.map(pt => ({ text: pt.text, voice: pt.voice.v, language: 'pt-BR', id: 'p' + pt.i, rate: T.clamp(c.rate * (pt.voice.r || 1), .7, 1.5) }));
      const offL = t.onLine(({ id }) => { const k = +String(id || '').slice(1); onPara(paras[k]); });
      const finish = () => { offL(); if (cur) { cur = null; onEnd(); } };
      cur.stop = () => { t.stop().catch(() => {}); finish(); };
      try { await t.speak(lines.slice(0, 100)); for (let k = 100; k < lines.length && cur; k += 100) await t.add(lines.slice(k, k + 100)); }
      catch (e) {
        if (e && e.code === 'no_gesture') T.toast('Toque no texto e tente de novo.');
        else if (e && (e.code === 'not_granted' || e.code === 'unavailable')) T.toast('As vozes do Claude não estão disponíveis aqui. Escolha “vozes do aparelho” em Vozes da narração.');
        else if (e && e.code === 'rate_limited') T.toast('Muita leitura em pouco tempo. Espere um pouco e tente de novo.');
      }
      finish(); return;
    }
    if (!('speechSynthesis' in window)) { T.toast('Este navegador não tem leitura em voz alta.'); cur = null; onEnd(); return; }
    const vs = browserVoices(); const def = ptVoices()[0];
    let k = 0, stopped = false;
    cur.stop = () => { stopped = true; speechSynthesis.cancel(); if (cur) { cur = null; onEnd(); } };
    const next = () => {
      if (stopped || k >= parts.length) { if (cur) { cur = null; onEnd(); } return; }
      const pt = parts[k]; onPara(paras[pt.i]);
      const u = new SpeechSynthesisUtterance(pt.text); u.lang = 'pt-BR'; const v = vs.find(x => x.voiceURI === pt.voice.v) || def; if (v) u.voice = v; u.rate = T.clamp(c.rate * (pt.voice.r || 1), .5, 2); u.pitch = T.clamp(pt.voice.p || 1, 0, 2);
      u.onend = () => { k++; next(); }; u.onerror = () => { if (cur) { cur = null; onEnd(); } };
      speechSynthesis.speak(u);
    };
    next();
  };
  T.Narr.stop = () => { if (cur && cur.stop) cur.stop(); recStop(); };

  /* ----- gravações da autora (uma por cena) ----- */
  let player = null;
  function recStop(){ if (player) { player.audio.pause(); player.el.remove(); player = null; } }
  T.Narr.hasRec = (it) => !!it?.meta?.rec;
  T.Narr.playRec = async function(it, onEnd){
    recStop();
    const url = await T.Assets.resolve(it.meta.rec);
    if (!url) { T.toast('Esta gravação foi guardada em outro computador. Suba de novo aqui.'); onEnd && onEnd(); return; }
    const audio = h('audio', { src: url, controls: true, autoplay: true });
    const sp = h('select.select', { style: { width: 'auto', padding: '4px 8px' }, 'aria-label': 'Velocidade' }, [.8, 1, 1.2, 1.5].map(r => h('option', { value: r, selected: r === 1 }, String(r).replace('.', ',') + '×'))); sp.onchange = () => audio.playbackRate = +sp.value;
    const el = h('div.rec-player.glass.glass-strong', h('b', icon('voice'), ' Sua voz · ' + (it.title || 'cena')), audio, sp, T.iconBtn('x', 'Fechar', () => { recStop(); onEnd && onEnd(); }, '.sm'));
    document.body.appendChild(el);
    audio.onended = () => { recStop(); onEnd && onEnd(); };
    audio.play().catch(() => {});
    player = { el, audio };
  };
  T.Narr.recModal = function(it, after){
    T.modal((box, close) => {
      const draw = () => {
        const x = S().get(it.id); box.innerHTML = '';
        box.append(h('h2', 'Sua voz em “' + (x.title || 'cena') + '”'),
          h('p.sub', 'Grave você mesma lendo esta cena (no celular ou no gravador do computador) e suba o áudio aqui. Quando a cena tiver uma gravação sua, “Ler em voz alta” toca a sua voz em vez das vozes sintéticas.'),
          x.meta?.rec ? h('div.stack', h('div.row', icon('voice'), h('b.grow', x.meta.rec.name || 'gravação'), x.meta.rec.local ? h('span.chip.gray', 'neste computador') : h('span.chip', 'na nuvem')),
            h('div.row', h('button.btn.sm', { onclick: () => { close(); T.Narr.playRec(x); } }, icon('play'), 'Ouvir'),
              h('button.btn.sm', { onclick: pick }, icon('upload'), 'Trocar gravação'),
              h('button.btn.sm.danger', { onclick: () => { S().update(x.id, { meta: { rec: null } }); draw(); } }, icon('trash'), 'Tirar'))) :
            h('button.big-opt', { onclick: pick }, icon('upload'), h('div', h('b', 'Subir uma gravação'), h('span', 'MP3, M4A, WAV, OGG ou WEBM. Gravações grandes ficam guardadas neste computador.'))),
          h('div.modal-foot', h('button.btn.primary', { onclick: () => { close(); after && after(); } }, 'Pronto')));
      };
      async function pick(){
        const f = await T.pickFile('audio/*,.m4a,.mp3,.wav,.ogg,.webm'); if (!f) return;
        let ref = null;
        if (f.size < 19.5 * 1024 * 1024) { T.toast('Enviando ' + f.name + '…'); const a = await T.Assets.ready(); if (a) { try { const r = await a.upload(f); ref = { id: r.id, url: r.url || ('/_blob/' + r.id), kind: 'audio', name: f.name }; } catch (e) { ref = null; } } }
        if (!ref) { try { ref = await T.BigFiles.saveLocal(f); T.toast('Gravação guardada neste computador.'); } catch (e) { T.toast('Não consegui guardar a gravação.'); return; } }
        S().update(it.id, { meta: { rec: ref } }); draw();
      }
      draw();
    });
  };

  /* ----- janela de configurações ----- */
  T.Narr.settings = async function(pid, sampleParas){
    const t = await ttsReady();
    T.modal((box, close) => {
      const draw = () => {
        const c = cfg(); box.innerHTML = '';
        const set = (patch) => { S().setPrefs({ narr: Object.assign({}, cfg(), patch) }); draw(); };
        const engine = c.engine === 'browser' || !t || S().prefs().noClaude ? 'browser' : 'claude';
        const seg = h('div.seg', ...[t && !S().prefs().noClaude ? h('button' + (engine === 'claude' ? '.on' : ''), { type: 'button', onclick: () => set({ engine: 'claude' }) }, 'Vozes do Claude') : null, h('button' + (engine === 'browser' ? '.on' : ''), { type: 'button', onclick: () => set({ engine: 'browser' }) }, 'Vozes do aparelho')].filter(Boolean));
        // seletores com variações: valor "voz|ritmo" (Claude) ou "voz|tom|ritmo" (aparelho)
        const near = (x, y) => Math.abs((x ?? 1) - y) < .001;
        const claudeSel = (spec, onPick) => {
          const sl = h('select.select', claudeVoices.map(v => h('optgroup', { label: cName(v) }, C_VARS.map(([r, l]) => h('option', { value: v + '|' + r, selected: spec.v === v && near(spec.r, r) }, cName(v) + l)))));
          sl.onchange = () => { const [v, r] = sl.value.split('|'); onPick({ v, r: +r }); }; return sl; };
        const browserSel = (spec, onPick) => {
          const vs = [{ voiceURI: '', name: 'Padrão do aparelho', lang: '' }, ...ptVoices()];
          const sl = h('select.select', vs.map(v => h('optgroup', { label: v.name + (v.lang ? ' (' + v.lang + ')' : '') }, B_VARS.map(([pp, r, l]) => h('option', { value: v.voiceURI + '|' + pp + '|' + r, selected: (spec.v || '') === v.voiceURI && near(spec.p, pp) && near(spec.r, r) }, v.name + l)))));
          sl.onchange = () => { const [v, pp, r] = sl.value.split('|'); onPick({ v, p: +pp, r: +r }); }; return sl; };
        const testBtn = (spec, sample) => h('button.btn.sm', { title: 'Ouvir', onclick: async () => {
          if (engine === 'claude') { try { await t.speak(sample, { voice: spec.v, language: 'pt-BR', rate: T.clamp(c.rate * (spec.r || 1), .7, 1.5) }); } catch (e) {} }
          else { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(sample); u.lang = 'pt-BR'; const v = browserVoices().find(x => x.voiceURI === spec.v); if (v) u.voice = v; u.rate = T.clamp(c.rate * (spec.r || 1), .5, 2); u.pitch = spec.p || 1; speechSynthesis.speak(u); }
        } }, icon('play'));
        const nSpec = engine === 'claude' ? { v: c.narrator, r: c.nr } : { v: c.bNarrator, p: c.bnp, r: c.bnr };
        const dSpec = engine === 'claude' ? { v: c.dialogue, r: c.dr } : { v: c.bDialogue, p: c.bdp, r: c.bdr };
        const pickSpec = (spec, onPick) => engine === 'claude' ? claudeSel(spec, onPick) : browserSel(spec, onPick);
        const setN = (x) => set(engine === 'claude' ? { narrator: x.v, nr: x.r } : { bNarrator: x.v, bnp: x.p, bnr: x.r });
        const setD = (x) => set(engine === 'claude' ? { dialogue: x.v, dr: x.r } : { bDialogue: x.v, bdp: x.p, bdr: x.r });
        const rate = h('input.range', { type: 'range', min: .7, max: 1.5, step: .05, value: c.rate, id: 'narr-rate' }); rate.onchange = () => set({ rate: +rate.value });
        const split = h('input', { type: 'checkbox', id: 'narr-split', checked: c.split }); split.onchange = () => set({ split: split.checked });
        const useRec = h('input', { type: 'checkbox', id: 'narr-rec', checked: c.useRec }); useRec.onchange = () => set({ useRec: useRec.checked });
        // elenco
        const cs = cast(pid);
        const chars = [...new Set([...T.Ent.pages(pid).filter(p => p.meta?.tpl === 'personagem').map(p => p.title.trim()), ...Object.keys(cs)])];
        let detected = new Map();
        if (sampleParas && sampleParas.length) assignSpeakers(pid, sampleParas).forEach(w => { if (w) detected.set(w, (detected.get(w) || 0) + 1); });
        const castRows = chars.map(name => {
          const e = cs[name] || {};
          const upd = (patch) => { const all = cast(pid); all[name] = Object.assign({}, all[name], patch); setCast(pid, all); draw(); };
          const spec = engine === 'claude' ? { v: e.voice || c.dialogue, r: e.r ?? c.dr } : { v: e.bvoice ?? c.bDialogue, p: e.bp ?? c.bdp, r: e.br ?? c.bdr };
          return h('div.cast-row', h('b', name), detected.get(name) ? h('span.chip', detected.get(name) + (detected.get(name) === 1 ? ' fala aqui' : ' falas aqui')) : h('span'),
            pickSpec(spec, (x) => upd(engine === 'claude' ? { voice: x.v, r: x.r } : { bvoice: x.v, bp: x.p, br: x.r })),
            testBtn(spec, '— Eu sou ' + name + '. Esta é a minha voz.'),
            !T.Ent.pages(pid).some(p => p.title.trim() === name) ? T.iconBtn('trash', 'Tirar este nome', () => { const all = cast(pid); delete all[name]; setCast(pid, all); draw(); }, '.sm') : h('span'));
        });
        box.append(h('h2', 'Vozes da narração'),
          h('p.sub', 'Escolha quem lê o texto: uma voz para a narração e uma voz para cada personagem. O Entrelinhas reconhece quem está falando pelo nome perto da fala (“— Oi — disse Beatriz”, “Beatriz respondeu”). Nas falas sem nome, ele alterna entre as duas pessoas da conversa.'),
          h('div.stack', seg,
            h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Narração'), h('div.row', pickSpec(nSpec, setN), testBtn(nSpec, 'A chuva caía mais pesada do que eu lembrava.'))),
            h('label.row', { for: 'narr-split', style: { gap: '8px', fontSize: '13px' } }, split, 'Usar vozes diferentes nas falas dos personagens'),
            c.split ? h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Falas sem personagem reconhecido'), h('div.row', pickSpec(dSpec, setD), testBtn(dSpec, '— Você ouviu isso? Era o sino de novo.'))) : null,
            c.split ? h('div.field', h('b', { style: { fontSize: '12.5px' } }, 'Voz de cada personagem'),
              castRows.length ? h('div.cast', castRows) : h('p.muted', { style: { margin: 0, fontSize: '12.5px' } }, 'Crie páginas de personagem na wiki ou adicione um nome abaixo.'),
              h('div.row', h('button.btn.sm', { onclick: async () => { const n = await T.ask('Nome do personagem', { text: 'Use o nome como aparece no texto. Personagens da wiki já entram sozinhos, com os apelidos.', ok: 'Adicionar' }); if (n) { const all = cast(pid); all[n.trim()] = all[n.trim()] || {}; setCast(pid, all); draw(); } } }, icon('plus'), 'Adicionar nome'))) : null,
            h('label.field', { for: 'narr-rate' }, 'Velocidade: ' + String(c.rate).replace('.', ',') + '×', rate),
            h('label.row', { for: 'narr-rec', style: { gap: '8px', fontSize: '13px' } }, useRec, 'Quando a cena tiver uma gravação minha, tocar a minha voz'),
            h('div.banner.glass', { style: { margin: 0, display: 'block', fontSize: '12.5px', color: 'var(--ink-2)' } },
              h('b', 'Sua própria voz: '), 'o site não consegue imitar a sua voz a partir de um áudio (isso pediria um serviço de clonagem de voz de fora, e a hospedagem bloqueia conexões externas). O que dá para fazer: gravar você lendo cada cena e subir o áudio em Ferramentas ▾ › “Minha voz nesta cena”. ',
              engine === 'claude' ? 'O Claude tem ' + claudeVoices.length + ' vozes, cada uma em 5 ritmos (' + (claudeVoices.length * C_VARS.length) + ' combinações). Em português elas podem soar parecidas; para mudar também o tom (grave ou agudo), use as vozes do aparelho, que vêm em 7 variações cada. ' : 'Para ter mais vozes do aparelho, instale vozes em português nas configurações do sistema (Windows: Configurações › Hora e idioma › Fala; Mac: Ajustes › Acessibilidade › Conteúdo falado) e recarregue a página.')),
          h('div.modal-foot', h('button.btn.primary', { onclick: () => { if (t) t.stop().catch(() => {}); if ('speechSynthesis' in window) speechSynthesis.cancel(); close(); } }, 'Pronto')));
      };
      draw();
      if ('speechSynthesis' in window && !browserVoices().length) speechSynthesis.onvoiceschanged = () => draw();
    }, { wide: true });
  };
})(window.T);
