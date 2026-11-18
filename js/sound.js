/* Tinteiro — sons sintetizados (máquina de escrever, sino, avisos). Nada vem de fora. */
(function(T){
  let ac = null, master = null, noiseBuf = null, vol = 0.6;
  function ctx(){
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = vol; master.connect(ac.destination);
        noiseBuf = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  function noise(t, dur, freq, q, gain, type = 'bandpass'){
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = .8 + Math.random() * .5;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
  }
  function tone(t, freq, dur, gain, type = 'sine'){
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
    return o;
  }
  const S = {
    volume(v){ vol = v; if (master) master.gain.value = v; },
    key(){
      if (!ctx()) return; const t = ac.currentTime, v = .75 + Math.random() * .5;
      noise(t, .028, 2600 + Math.random() * 1400, 1.4, .55 * v);     // tec metálico da tipo
      noise(t + .004, .05, 900 + Math.random() * 300, 2, .32 * v);   // corpo da tecla
      const o = tone(t, 150 + Math.random() * 40, .06, .28 * v, 'triangle'); o.frequency.exponentialRampToValueAtTime(70, t + .05); // batida no rolo
    },
    space(){ if (!ctx()) return; const t = ac.currentTime; noise(t, .07, 700, 1.2, .5); const o = tone(t, 110, .09, .3, 'triangle'); o.frequency.exponentialRampToValueAtTime(55, t + .08); },
    back(){ if (!ctx()) return; const t = ac.currentTime; noise(t, .025, 1800, 2, .3); },
    ret(){ // retorno do carro: catraca + pancada
      if (!ctx()) return; const t = ac.currentTime;
      for (let i = 0; i < 9; i++) noise(t + i * .028, .02, 1500 + i * 120, 3, .22);
      noise(t, .32, 500, .7, .18, 'lowpass');
      noise(t + .27, .09, 1100, 1.5, .55); const o = tone(t + .27, 120, .12, .35, 'triangle'); o.frequency.exponentialRampToValueAtTime(60, t + .38);
    },
    bell(){ if (!ctx()) return; const t = ac.currentTime; tone(t, 2093, 1.4, .22); tone(t, 3140, 1.0, .09); tone(t, 4186, .6, .04); },
    chime(){ if (!ctx()) return; const t = ac.currentTime; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(t + i * .14, f, 1.4, .16)); },
    unlock(){ ctx(); },
    // página virando: papel deslizando + estalos + a folha assentando
    page(){
      if (!ctx()) return; const t = ac.currentTime;
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.playbackRate.value = .9;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .9; f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(2600, t + .28); f.frequency.exponentialRampToValueAtTime(900, t + .55);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .09); g.gain.exponentialRampToValueAtTime(.12, t + .3); g.gain.exponentialRampToValueAtTime(0.0005, t + .6);
      src.connect(f); f.connect(g); g.connect(master); src.start(t, Math.random() * .3); src.stop(t + .65);
      for (let i = 0; i < 7; i++) noise(t + .04 + Math.random() * .34, .015 + Math.random() * .02, 3000 + Math.random() * 3500, 2, .05 + Math.random() * .05);
      noise(t + .5, .1, 260, .8, .22, 'lowpass');
    },
    // sons de digitação em vários estilos
    KITS: { maquina: 'Máquina de escrever', mecanico: 'Teclado mecânico', suave: 'Teclado silencioso', caneta: 'Caneta no papel', lapis: 'Lápis', gotas: 'Gotas d’água' },
    type(kit, kind){
      if (!kit || kit === 'off' || !ctx()) return;
      const t = ac.currentTime, v = .8 + Math.random() * .4;
      if (kit === 'maquina') { kind === 'enter' ? S.ret() : kind === 'space' ? S.space() : kind === 'back' ? S.back() : S.key(); return; }
      if (kit === 'mecanico') {
        if (kind === 'space') { noise(t, .06, 380, 1.1, .42 * v); const o = tone(t, 140, .07, .25, 'triangle'); o.frequency.exponentialRampToValueAtTime(70, t + .06); noise(t + .012, .03, 2200, 2, .12); return; }
        noise(t, .012, 4200 + Math.random() * 1500, 2.5, (kind === 'back' ? .25 : .42) * v); tone(t, 2400 + Math.random() * 300, .012, .05, 'square');
        noise(t + .006, .045, 520 + Math.random() * 160, 1.4, .3 * v); const o = tone(t + .006, 190, .05, .16 * v, 'triangle'); o.frequency.exponentialRampToValueAtTime(95, t + .05);
        if (kind === 'enter') { noise(t + .02, .09, 300, 1, .4); } return;
      }
      if (kit === 'suave') { noise(t, .022, kind === 'space' ? 700 : 1200 + Math.random() * 300, .8, (kind === 'space' ? .3 : .2) * v); const o = tone(t, kind === 'space' ? 95 : 125, .035, .1 * v, 'sine'); o.frequency.exponentialRampToValueAtTime(60, t + .03); return; }
      if (kit === 'caneta' || kit === 'lapis') {
        const hi = kit === 'lapis' ? 5200 : 3600; const d = kind === 'enter' ? .22 : kind === 'space' ? .02 : .045 + Math.random() * .04;
        const s2 = ac.createBufferSource(); s2.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = kit === 'lapis' ? 1.8 : 3; f.frequency.setValueAtTime(hi * (.8 + Math.random() * .4), t); f.frequency.linearRampToValueAtTime(hi * (.7 + Math.random() * .5), t + d);
        const g = ac.createGain(); const peak = (kit === 'lapis' ? .22 : .16) * v * (kind === 'space' ? .4 : 1); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .008); g.gain.exponentialRampToValueAtTime(0.0005, t + d);
        s2.connect(f); f.connect(g); g.connect(master); s2.start(t, Math.random() * .5); s2.stop(t + d + .03);
        if (kind === 'enter' && kit === 'caneta') tone(t + .2, 180, .05, .05, 'triangle'); return;
      }
      if (kit === 'gotas') { const sc = [0, 2, 4, 7, 9, 12, 14]; const f0 = kind === 'space' ? 420 : 620 * Math.pow(2, sc[Math.floor(Math.random() * sc.length)] / 12); const o = tone(t, f0 * 1.6, kind === 'enter' ? .3 : .16, .12 * v, 'sine'); o.frequency.exponentialRampToValueAtTime(f0, t + .03); if (kind === 'enter') { const o2 = tone(t + .12, f0 * 1.2, .25, .08, 'sine'); o2.frequency.exponentialRampToValueAtTime(f0 * .75, t + .16); } return; }
    },
  };
  T.Sound = S;
})(window.T);

/* escolha do som da digitação (vale para todos os modos) */
(function(T){
  const { h } = T;
  T.typeKit = (mode, compose) => {
    const p = T.Store?.prefs?.() || {};
    if (p.typeKit) return p.typeKit;
    if (mode === 'tw') return p.twSound === false ? 'off' : 'maquina';
    if (compose && p.composeSound) return 'maquina';
    return 'off';
  };
  T.soundPanel = (btn, mode, after) => {
    const box = h('div.snd-panel');
    const draw = () => {
      const p = T.Store.prefs(); const cur = T.typeKit(mode);
      box.replaceChildren(
        h('b', 'Som da digitação'), h('p.mp-tip', 'Vale para os modos Normal, Máquina, Livro e Composição. Clique para ouvir.'),
        h('div.snd-kits', [['off', 'Sem som'], ...Object.entries(T.Sound.KITS)].map(([k, n]) => h('button.snd-kit' + (cur === k ? '.on' : ''), { type: 'button', onclick: () => {
          T.Store.setPrefs({ typeKit: k, twSound: k !== 'off' }); T.Sound.unlock();
          if (k !== 'off') ['key', 'key', 'space', 'key', 'key', 'enter'].forEach((kind, i) => setTimeout(() => T.Sound.type(k, kind), i * 120));
          draw(); after && after();
        } }, n))),
        h('label.mp-rng', h('span', 'Volume'), (() => { const r = h('input', { type: 'range', min: 0, max: 1, step: .05, value: p.typeVol ?? .6 }); r.oninput = () => { T.Sound.volume(+r.value); T.Store.setPrefs({ typeVol: +r.value }); }; r.onchange = () => T.Sound.type(T.typeKit(mode) === 'off' ? 'maquina' : T.typeKit(mode), 'key'); return r; })()),
        h('label.mp-chk', h('input', { type: 'checkbox', checked: p.pageSound !== false, onchange: (e) => { T.Store.setPrefs({ pageSound: e.target.checked }); if (e.target.checked) T.Sound.page(); } }), 'Som de página virando no modo Livro'));
    };
    draw(); T.popover(btn, box);
  };
  setTimeout(() => { try { const v = T.Store?.prefs?.().typeVol; if (v != null) T.Sound.volume(v); } catch (e) {} }, 1500);
})(window.T);
