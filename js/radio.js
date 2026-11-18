/* Tinteiro — rádio literária: FM com música gerada ao vivo por gênero, AM com sons ambientes, estações com suas músicas */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const R = Math.random;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ================= estações ================= */
  const FM = [
    { id: 'fantasia', lvl: 1, freq: 88.7, name: 'Rádio Fantasia', genre: 'Fantasia', hue: 268, desc: 'Harpa, sinos e cordas em tom maior, com eco de catedral.' },
    { id: 'scifi', lvl: 1.5, freq: 91.3, name: 'Órbita FM', genre: 'Ficção científica', hue: 190, desc: 'Sintetizadores em arpejo, baixo grave e ecos de nave.' },
    { id: 'terror', lvl: 2, freq: 93.9, name: 'Frequência Sombria', genre: 'Terror e gótico', hue: 350, desc: 'Drones dissonantes, batidas de coração e sinos distantes.' },
    { id: 'romance', lvl: 1.4, freq: 96.1, name: 'Serenata', genre: 'Romance', hue: 335, desc: 'Piano suave em acordes de sétima e cordas quentes.' },
    { id: 'noir', lvl: 0.95, freq: 98.5, name: 'Noir 98', genre: 'Mistério e noir', hue: 40, desc: 'Jazz de madrugada: contrabaixo andando, vassourinha e piano.' },
    { id: 'aventura', lvl: 0.85, freq: 101.1, name: 'Expedição', genre: 'Aventura', hue: 28, desc: 'Tambores, ostinato de cordas e metais heroicos.' },
    { id: 'distopia', lvl: 0.72, freq: 103.7, name: 'Setor 7', genre: 'Distopia', hue: 0, desc: 'Pulso industrial, metais batidos e névoa sintética.' },
    { id: 'calma', lvl: 2.2, freq: 106.3, name: 'Página em Branco', genre: 'Literário e contemplativo', hue: 160, desc: 'Piano ambiente, notas soltas e muito espaço.' },
  ];
  const AM = [
    { id: 'chuva', lvl: 0.45, freq: 610, name: 'Chuva na janela', hue: 210, desc: 'Chuva constante, gotas e trovões ao longe.' },
    { id: 'lareira', lvl: 0.6, freq: 760, name: 'Lareira', hue: 22, desc: 'Fogo estalando devagar.' },
    { id: 'cafe', lvl: 1.3, freq: 900, name: 'Café da esquina', hue: 30, desc: 'Conversa abafada, xícaras e máquina de café.' },
    { id: 'floresta', lvl: 3, freq: 1050, name: 'Floresta à noite', hue: 120, desc: 'Grilos, vento nas folhas e uma coruja de vez em quando.' },
    { id: 'mar', lvl: 0.48, freq: 1190, name: 'Mar', hue: 195, desc: 'Ondas chegando e voltando.' },
    { id: 'vento', lvl: 0.9, freq: 1340, name: 'Vento na montanha', hue: 220, desc: 'Rajadas que sobem e descem.' },
    { id: 'biblioteca', lvl: 1.8, freq: 1480, name: 'Biblioteca antiga', hue: 45, desc: 'Silêncio de sala grande, relógio e páginas virando.' },
  ];

  /* ================= motor de áudio ================= */
  let ctx = null, master, out, radioFx, dry, wet, staticG, staticSrc, reverb, delay, delayFb, musicBus, ambBus, layerBus;
  function impulse(sec, decay){ const n = ctx.sampleRate * sec; const b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  let noiseBuf = null; const noise = () => { if (noiseBuf) return noiseBuf; const n = ctx.sampleRate * 3; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = R() * 2 - 1; return noiseBuf; };
  let brownBuf = null; const brown = () => { if (brownBuf) return brownBuf; const n = ctx.sampleRate * 4; brownBuf = ctx.createBuffer(1, n, ctx.sampleRate); const d = brownBuf.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { l = (l + .02 * (R() * 2 - 1)) / 1.02; d[i] = l * 3.5; } return brownBuf; };
  let pinkBuf = null; const pink = () => { if (pinkBuf) return pinkBuf; const n = ctx.sampleRate * 4; pinkBuf = ctx.createBuffer(1, n, ctx.sampleRate); const d = pinkBuf.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; for (let i = 0; i < n; i++) { const w = R() * 2 - 1; b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; } return pinkBuf; };
  function loopSrc(buf, dest, gain = 1){ const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = R() * buf.duration * .5; const g = ctx.createGain(); g.gain.value = gain; s.connect(g); g.connect(dest); s.start(0, R() * buf.duration); return { s, g }; }
  function init(){
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createDynamicsCompressor(); out.threshold.value = -16; out.ratio.value = 3; out.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = .7;
    // efeito de rádio antigo: banda estreita + leve saturação
    radioFx = ctx.createBiquadFilter(); radioFx.type = 'bandpass'; radioFx.frequency.value = 1800; radioFx.Q.value = .5;
    const shp = ctx.createWaveShaper(); const cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; cv[i] = Math.tanh(x * 1.8); } shp.curve = cv;
    dry = ctx.createGain(); wet = ctx.createGain();
    master.connect(dry); dry.connect(out); master.connect(radioFx); radioFx.connect(shp); shp.connect(wet); wet.connect(out);
    reverb = ctx.createConvolver(); reverb.buffer = impulse(3.2, 2.6); const revG = ctx.createGain(); revG.gain.value = .55; reverb.connect(revG); revG.connect(master);
    delay = ctx.createDelay(1.5); delay.delayTime.value = .375; delayFb = ctx.createGain(); delayFb.gain.value = .35; const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 2400; delay.connect(dl); dl.connect(delayFb); delayFb.connect(delay); dl.connect(master);
    musicBus = ctx.createGain(); musicBus.connect(master); ambBus = ctx.createGain(); ambBus.connect(master); layerBus = ctx.createGain(); layerBus.gain.value = 0; layerBus.connect(master);
    staticG = ctx.createGain(); staticG.gain.value = 0; const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 2600; sf.Q.value = .4; staticSrc = loopSrc(noise(), sf, 1); sf.connect(staticG); staticG.connect(master);
    setVintage(Radio.vintage);
  }
  function setVintage(on){ if (!ctx) return; const t = ctx.currentTime; dry.gain.setTargetAtTime(on ? .25 : 1, t, .1); wet.gain.setTargetAtTime(on ? .9 : 0, t, .1); }
  // envelopes
  function env(g, t, a, peak, d, sustain, r, len){ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(sustain, t + a, d); g.gain.setTargetAtTime(0, t + Math.max(a, len), r); }
  function send(node, dryAmt, revAmt, delAmt, bus){ const g1 = ctx.createGain(); g1.gain.value = dryAmt; node.connect(g1); g1.connect(bus); if (revAmt) { const g2 = ctx.createGain(); g2.gain.value = revAmt; node.connect(g2); g2.connect(reverb); } if (delAmt) { const g3 = ctx.createGain(); g3.gain.value = delAmt; node.connect(g3); g3.connect(delay); } }
  const INST = {
    pad(t, notes, dur, o){ notes.forEach(m => { [-7, 0, 7].forEach(det => { const os = ctx.createOscillator(); os.type = o.wave || 'sawtooth'; os.frequency.value = mtof(m); os.detune.value = det + (R() - .5) * 4; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cut || 900; f.Q.value = .4; const g = ctx.createGain(); os.connect(f); f.connect(g); env(g, t, o.att || 1.2, (o.vol || .05) / notes.length, .8, (o.vol || .05) * .8 / notes.length, o.rel || 1.2, dur); send(g, .6, o.rev ?? .6, o.del || 0, musicBus); os.start(t); os.stop(t + dur + 6); }); }); },
    pluck(t, m, o){ const os = ctx.createOscillator(); os.type = o.wave || 'triangle'; os.frequency.value = mtof(m); const os2 = ctx.createOscillator(); os2.type = 'sine'; os2.frequency.value = mtof(m) * 2; const g = ctx.createGain(); const g2 = ctx.createGain(); g2.gain.value = .3; os.connect(g); os2.connect(g2); g2.connect(g); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.bright || 3200, t); f.frequency.exponentialRampToValueAtTime(500, t + (o.decay || 1.2)); g.connect(f); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol || .12, t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + (o.decay || 1.2)); send(f, .8, o.rev ?? .45, o.del || 0, musicBus); os.start(t); os2.start(t); os.stop(t + (o.decay || 1.2) + .1); os2.stop(t + (o.decay || 1.2) + .1); },
    piano(t, m, o){ const base = mtof(m); const g = ctx.createGain(); [[1, 1], [2, .35], [3, .12], [4.02, .06]].forEach(([r, a]) => { const os = ctx.createOscillator(); os.type = 'sine'; os.frequency.value = base * r; const ga = ctx.createGain(); ga.gain.value = a; os.connect(ga); ga.connect(g); os.start(t); os.stop(t + (o.decay || 3) + .2); }); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cut || 3000; g.connect(f); const v = (o.vol || .08) * (.7 + R() * .3); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(v * .35, t + .3); g.gain.exponentialRampToValueAtTime(.0004, t + (o.decay || 3)); send(f, .8, o.rev ?? .5, o.del || 0, musicBus); },
    bell(t, m, o){ const base = mtof(m); [[1, 1], [2.76, .45], [5.4, .2], [8.93, .1]].forEach(([r, a]) => { const os = ctx.createOscillator(); os.type = 'sine'; os.frequency.value = base * r; const g = ctx.createGain(); os.connect(g); const v = (o.vol || .05) * a; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .003); g.gain.exponentialRampToValueAtTime(.0003, t + (o.decay || 4) / r ** .3); send(g, .6, o.rev ?? .8, o.del || 0, musicBus); os.start(t); os.stop(t + (o.decay || 4) + .1); }); },
    bass(t, m, dur, o){ const os = ctx.createOscillator(); os.type = o.wave || 'triangle'; os.frequency.value = mtof(m); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cut || 600; const g = ctx.createGain(); os.connect(f); f.connect(g); const v = o.vol || .16; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.setTargetAtTime(v * .6, t + .02, .15); g.gain.setTargetAtTime(0, t + dur * .9, .06); send(g, 1, .1, 0, musicBus); os.start(t); os.stop(t + dur + .5); },
    lead(t, m, dur, o){ const os = ctx.createOscillator(); os.type = o.wave || 'sine'; os.frequency.value = mtof(m); const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2; const lg = ctx.createGain(); lg.gain.value = mtof(m) * .006; lfo.connect(lg); lg.connect(os.frequency); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cut || 2200; const g = ctx.createGain(); os.connect(f); f.connect(g); env(g, t, o.att || .08, o.vol || .06, .3, (o.vol || .06) * .8, .25, dur); send(g, .8, o.rev ?? .5, o.del || .2, musicBus); os.start(t); lfo.start(t); os.stop(t + dur + 2); lfo.stop(t + dur + 2); },
    kick(t, o){ const os = ctx.createOscillator(); os.frequency.setValueAtTime(o.f || 120, t); os.frequency.exponentialRampToValueAtTime(42, t + .18); const g = ctx.createGain(); g.gain.setValueAtTime(o.vol || .4, t); g.gain.exponentialRampToValueAtTime(.001, t + (o.decay || .4)); os.connect(g); send(g, 1, o.rev || .05, 0, musicBus); os.start(t); os.stop(t + .6); },
    noiseHit(t, o){ const s = ctx.createBufferSource(); s.buffer = noise(); const f = ctx.createBiquadFilter(); f.type = o.type || 'highpass'; f.frequency.value = o.f || 7000; f.Q.value = o.q || .7; const g = ctx.createGain(); s.connect(f); f.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol || .05, t + (o.att || .002)); g.gain.exponentialRampToValueAtTime(.0005, t + (o.decay || .08)); send(g, 1, o.rev || .1, 0, musicBus); s.start(t, R() * 2); s.stop(t + (o.decay || .08) + .2); },
    tom(t, m, o){ const os = ctx.createOscillator(); os.frequency.setValueAtTime(mtof(m) * 1.6, t); os.frequency.exponentialRampToValueAtTime(mtof(m), t + .08); const g = ctx.createGain(); g.gain.setValueAtTime(o.vol || .25, t); g.gain.exponentialRampToValueAtTime(.001, t + .5); os.connect(g); send(g, 1, .25, 0, musicBus); os.start(t); os.stop(t + .6); },
    drone(t, m, dur, o){ [0, .07].forEach(d => { const os = ctx.createOscillator(); os.type = o.wave || 'sawtooth'; os.frequency.value = mtof(m) * (1 + d / 100); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cut || 300; const lfo = ctx.createOscillator(); lfo.frequency.value = .07 + R() * .08; const lg = ctx.createGain(); lg.gain.value = (o.cut || 300) * .6; lfo.connect(lg); lg.connect(f.frequency); const g = ctx.createGain(); os.connect(f); f.connect(g); env(g, t, 3, o.vol || .06, 2, (o.vol || .06) * .9, 3, dur); send(g, .7, .7, 0, musicBus); os.start(t); lfo.start(t); os.stop(t + dur + 10); lfo.stop(t + dur + 10); }); },
  };

  /* ----- composição por gênero ----- */
  const SC = { maior: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], lidio: [0, 2, 4, 6, 7, 9, 11], dorico: [0, 2, 3, 5, 7, 9, 10], frigio: [0, 1, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10], penta: [0, 2, 4, 7, 9] };
  const deg = (root, scale, d) => { const n = scale.length; const o = Math.floor(d / n); return root + scale[((d % n) + n) % n] + 12 * o; };
  const chord = (root, scale, d, ext) => [deg(root, scale, d), deg(root, scale, d + 2), deg(root, scale, d + 4), ...(ext ? [deg(root, scale, d + 6)] : [])];
  const GEN = {
    fantasia: { bpm: 70, root: 62, scale: SC.lidio, prog: [0, 4, 5, 3], bars: 2, step(t, b, s, st, sp){ const c = chord(st.root, st.scale, st.prog[st.ci]);
      if (s === 0 && b === 0) { INST.pad(t, c.map(n => n - 12), sp * 16 * st.bars - .2, { wave: 'triangle', cut: 1400, vol: .05, att: 1.5, rev: .9 }); INST.bass(t, c[0] - 24, sp * 16 * st.bars, { wave: 'sine', vol: .12 }); }
      if (s % 2 === 0) { const pat = [0, 1, 2, 1, 3, 2, 1, 2]; const n = (c.concat(c.map(x => x + 12)))[pat[(s / 2) % 8] + (b % 2) * 2]; INST.pluck(t, n, { vol: .09, decay: 1.8, rev: .7, bright: 3600 }); }
      if (s === 8 && R() < .45) INST.bell(t, deg(st.root + 12, st.scale, Math.floor(R() * 7)), { vol: .035, decay: 5 }); } },
    scifi: { bpm: 96, root: 57, scale: SC.menor, prog: [0, 5, 2, 6], bars: 2, step(t, b, s, st, sp){ const c = chord(st.root, st.scale, st.prog[st.ci]);
      if (s === 0 && b === 0) { INST.pad(t, c, sp * 16 * st.bars, { wave: 'sawtooth', cut: 700, vol: .04, att: 2, rev: .8, del: .2 }); }
      const ar = [0, 1, 2, 3, 2, 1, 2, 3]; INST.pluck(t, c[ar[s % 4 + (b % 2) * 4] % 3] + 12 + (s % 8 > 5 ? 12 : 0), { wave: 'square', vol: .035, decay: .35, bright: 2400, rev: .3, del: .45 });
      if (s % 4 === 0) INST.bass(t, c[0] - 24, sp * 3.5, { wave: 'sawtooth', cut: 380, vol: .11 });
      if (s === 0 && R() < .3) INST.lead(t, deg(st.root + 12, st.scale, [0, 2, 4, 6][Math.floor(R() * 4)]), sp * 12, { wave: 'triangle', vol: .04, del: .5 }); } },
    terror: { bpm: 52, root: 41, scale: SC.frigio, prog: [0, 1, 0, 4], bars: 4, step(t, b, s, st, sp){
      if (s === 0 && b === 0) { INST.drone(t, st.root, sp * 64, { vol: .07, cut: 260 }); INST.drone(t, st.root + 6, sp * 64, { vol: .03, cut: 500, wave: 'triangle' }); }
      if ((s === 0 || s === 3) && b % 2 === 0) INST.kick(t, { f: 70, vol: .35, decay: .5, rev: .3 });
      if (R() < .03) { const n = st.root + 24 + [0, 1, 6, 11, 13][Math.floor(R() * 5)]; INST.bell(t, n, { vol: .03, decay: 6, rev: 1 }); }
      if (s === 8 && b === 3 && R() < .5) { const os = ctx.createOscillator(); os.type = 'sine'; os.frequency.setValueAtTime(1800, t); os.frequency.exponentialRampToValueAtTime(900, t + 4); const g = ctx.createGain(); env(g, t, 1.5, .012, 1, .01, 1.5, 3); os.connect(g); send(g, .5, 1, .4, musicBus); os.start(t); os.stop(t + 7); } } },
    romance: { bpm: 64, root: 53, scale: SC.maior, prog: [0, 5, 3, 4], bars: 2, step(t, b, s, st, sp){ const c = chord(st.root, st.scale, st.prog[st.ci], true);
      if (s === 0 && b === 0) { INST.pad(t, c.map(n => n), sp * 16 * st.bars, { wave: 'triangle', cut: 1100, vol: .035, att: 2, rev: .7 }); INST.bass(t, c[0] - 12, sp * 16 * st.bars * .9, { wave: 'sine', vol: .1 }); }
      if (s % 2 === 0) { const seq = [0, 2, 1, 3, 2, 1, 3, 2]; INST.piano(t, c[seq[(s / 2 + b * 4) % 8]] + 12, { vol: .07, decay: 3.5, rev: .6 }); }
      if (s === 6 && R() < .5) INST.piano(t, deg(st.root + 24, st.scale, Math.floor(R() * 7)), { vol: .05, decay: 3 }); } },
    noir: { bpm: 82, root: 48, scale: SC.dorico, prog: [0, 3, 1, 4], bars: 1, swing: .16, step(t, b, s, st, sp){ const c = chord(st.root, st.scale, st.prog[st.ci], true);
      if (s % 4 === 0) { const walk = [c[0], c[1], c[2], deg(st.root, st.scale, st.prog[(st.ci + 1) % 4]) - 1]; INST.bass(t, walk[s / 4] - 12, sp * 3.6, { wave: 'triangle', cut: 500, vol: .17 }); }
      if (s === 4 || s === 12) INST.noiseHit(t, { type: 'bandpass', f: 3500, q: .5, vol: .05, att: .02, decay: .25 });
      if (s % 2 === 0) INST.noiseHit(t, { f: 8000, vol: s % 4 ? .012 : .02, decay: .05 });
      if ((s === 2 || s === 10) && R() < .6) c.forEach(n => INST.piano(t + R() * .02, n + 12, { vol: .035, decay: 1.8, cut: 2200 }));
      if (s === 0 && R() < .35) INST.lead(t, deg(st.root + 12, st.scale, [4, 2, 6, 3][Math.floor(R() * 4)]), sp * 6, { wave: 'triangle', vol: .045, cut: 1400, rev: .6 }); } },
    aventura: { bpm: 108, root: 55, scale: SC.mixo, prog: [0, 6, 3, 0], bars: 2, step(t, b, s, st, sp){ const c = chord(st.root, st.scale, st.prog[st.ci]);
      if (s === 0 && b === 0) INST.pad(t, c, sp * 16 * st.bars, { wave: 'sawtooth', cut: 1300, vol: .035, att: .5, rev: .5 });
      INST.pluck(t, (s % 4 === 3 ? c[2] : s % 2 ? c[1] : c[0]) + 12, { wave: 'sawtooth', vol: .03, decay: .3, bright: 2000, rev: .2 });
      if ([0, 6, 8, 11].includes(s)) INST.tom(t, st.root - 12 + (s === 11 ? 7 : 0), { vol: .22 });
      if (s === 4 || s === 12) INST.noiseHit(t, { type: 'bandpass', f: 1800, vol: .05, decay: .18, rev: .3 });
      if (s === 0 && b === 1 && R() < .6) INST.lead(t, c[2] + 12, sp * 8, { wave: 'sawtooth', cut: 1600, vol: .03, att: .15 }); } },
    distopia: { bpm: 90, root: 40, scale: SC.frigio, prog: [0, 0, 1, 5], bars: 2, step(t, b, s, st, sp){ const c = chord(st.root, st.scale, st.prog[st.ci]);
      if (s === 0 && b === 0) INST.drone(t, c[0] + 12, sp * 32, { vol: .04, cut: 700 });
      INST.bass(t, c[0] - (s % 8 === 7 ? -12 : 0), sp * .8, { wave: 'sawtooth', cut: 260 + (s % 4) * 90, vol: .09 });
      if (s % 4 === 0) INST.kick(t, { vol: .3, decay: .25 });
      if (s === 6 || s === 14) INST.noiseHit(t, { type: 'bandpass', f: 4200 + R() * 2000, q: 8, vol: .05, decay: .35, rev: .5 });
      if (s === 10 && R() < .3) INST.bell(t, c[1] + 24 + 1, { vol: .02, decay: 2 }); } },
    calma: { bpm: 54, root: 60, scale: SC.penta, prog: [0, 3, 1, 4], bars: 4, step(t, b, s, st, sp){
      if (s === 0 && b === 0) INST.pad(t, [st.root - 12, st.root - 5, st.root + 4], sp * 64, { wave: 'sine', cut: 900, vol: .05, att: 4, rel: 4, rev: .9 });
      if (s % 4 === 0 && R() < .42) INST.piano(t, deg(st.root, st.scale, Math.floor(R() * 8)), { vol: .07, decay: 5, rev: .85, cut: 2400 });
      if (s === 8 && R() < .18) INST.bell(t, deg(st.root + 12, st.scale, Math.floor(R() * 5)), { vol: .02, decay: 6 }); } },
  };
  let seq = null;
  function startGen(id){
    stopGen(); const g = GEN[id]; if (!g) return;
    const st = { root: g.root + [0, 0, 2, -2, 5][Math.floor(R() * 5)] * (id === 'terror' ? 0 : 1), scale: g.scale, prog: g.prog.slice(), ci: 0, bars: g.bars };
    const sp = 60 / g.bpm / 4; let next = ctx.currentTime + .15, s = 0, b = 0;
    seq = { id, timer: setInterval(() => {
      while (next < ctx.currentTime + .25) {
        const sw = g.swing && s % 2 ? sp * g.swing : 0;
        try { g.step(next + sw, b, s, st, sp); } catch (e) { console.warn(e); }
        next += sp; s++; if (s >= 16) { s = 0; b++; if (b >= st.bars) { b = 0; st.ci = (st.ci + 1) % st.prog.length; if (st.ci === 0 && R() < .25) st.prog = st.prog.slice(1).concat(st.prog[0]); } }
      }
    }, 40) };
  }
  function stopGen(){ if (seq) { clearInterval(seq.timer); seq = null; } }

  /* ----- sons ambientes ----- */
  let amb = null;
  function startAmb(id, bus = ambBus, level = 1){
    const nodes = [], timers = [];
    const G = ctx.createGain(); G.gain.value = 0; G.connect(bus); G.gain.setTargetAtTime(level, ctx.currentTime, .6);
    const filt = (type, f, q) => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q) x.Q.value = q; return x; };
    const every = (fn, min, max) => { let alive = true; const tick = () => { if (!alive) return; fn(ctx.currentTime + .05); timers.push(setTimeout(tick, (min + R() * (max - min)) * 1000)); }; timers.push(setTimeout(tick, R() * min * 1000)); timers.push({ stop: () => alive = false }); };
    const burst = (t, f, q, vol, dec, type = 'bandpass', dest = G) => { const s = ctx.createBufferSource(); s.buffer = noise(); const x = filt(type, f, q); const g = ctx.createGain(); s.connect(x); x.connect(g); g.connect(dest); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .002); g.gain.exponentialRampToValueAtTime(.0004, t + dec); s.start(t, R() * 2); s.stop(t + dec + .1); };
    const swell = (src, x, min, max, rate) => { const lfo = ctx.createOscillator(); lfo.frequency.value = rate; const lg = ctx.createGain(); lg.gain.value = (max - min) / 2; const off = ctx.createConstantSource ? ctx.createConstantSource() : null; lfo.connect(lg); lg.connect(x.gain); x.gain.value = (max + min) / 2; lfo.start(); nodes.push(lfo); };
    if (id === 'chuva') {
      const a = loopSrc(pink(), (() => { const x = filt('lowpass', 5200); x.connect(G); return x; })(), .9); nodes.push(a.s);
      const b2 = loopSrc(noise(), (() => { const x = filt('highpass', 6000); const g = ctx.createGain(); g.gain.value = .08; x.connect(g); g.connect(G); return x; })(), 1); nodes.push(b2.s);
      every((t) => burst(t, 2500 + R() * 3000, 6, .04 + R() * .05, .03 + R() * .04), .03, .18);
      every((t) => { const s = ctx.createBufferSource(); s.buffer = brown(); const x = filt('lowpass', 160); const g = ctx.createGain(); s.connect(x); x.connect(g); g.connect(G); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.55, t + 1.2); g.gain.exponentialRampToValueAtTime(.001, t + 6); s.start(t, R()); s.stop(t + 7); }, 25, 60);
    } else if (id === 'lareira') {
      const a = loopSrc(brown(), (() => { const x = filt('lowpass', 500); x.connect(G); return x; })(), .8); nodes.push(a.s);
      every((t) => { const n = 1 + Math.floor(R() * 4); for (let i = 0; i < n; i++) burst(t + i * R() * .05, 1500 + R() * 4000, 2 + R() * 4, .05 + R() * .18, .01 + R() * .05); }, .08, .6);
      every((t) => burst(t, 600, 1, .25, .25, 'lowpass'), 3, 9);
    } else if (id === 'cafe') {
      for (let v = 0; v < 6; v++) { const s = loopSrc(pink(), (() => { const x = filt('bandpass', 350 + R() * 900, 3); const g = ctx.createGain(); g.gain.value = .12; x.connect(g); g.connect(G); swell(null, g, .02, .22, .3 + R() * .9); return x; })(), 1.2); nodes.push(s.s); }
      const r = loopSrc(brown(), (() => { const x = filt('lowpass', 300); x.connect(G); return x; })(), .25); nodes.push(r.s);
      every((t) => { const m = 88 + Math.floor(R() * 8); [[1, .02], [2.76, .01]].forEach(([k, v]) => { const os = ctx.createOscillator(); os.frequency.value = mtof(m) * k; const g = ctx.createGain(); os.connect(g); g.connect(G); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .002); g.gain.exponentialRampToValueAtTime(.0002, t + .5); os.start(t); os.stop(t + .6); }); }, 2.5, 8);
      every((t) => { const s = ctx.createBufferSource(); s.buffer = noise(); const x = filt('bandpass', 2400, 1.5); const g = ctx.createGain(); s.connect(x); x.connect(g); g.connect(G); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .5); g.gain.setTargetAtTime(0, t + 3, .6); s.start(t); s.stop(t + 6); }, 30, 70);
    } else if (id === 'floresta') {
      const w = loopSrc(pink(), (() => { const x = filt('bandpass', 700, .5); const g = ctx.createGain(); g.gain.value = .15; swell(null, g, .03, .2, .07); x.connect(g); g.connect(G); return x; })(), 1); nodes.push(w.s);
      for (let k = 0; k < 3; k++) { const os = ctx.createOscillator(); os.frequency.value = 4300 + k * 260 + R() * 100; const am = ctx.createGain(); am.gain.value = 0; const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 14 + R() * 8; const lg = ctx.createGain(); lg.gain.value = .006; lfo.connect(lg); lg.connect(am.gain); const slow = ctx.createGain(); slow.gain.value = .6; swell(null, slow, 0, 1, .2 + R() * .3); os.connect(am); am.connect(slow); slow.connect(G); os.start(); lfo.start(); nodes.push(os, lfo); }
      every((t) => { [0, .45].forEach((d, i) => { const os = ctx.createOscillator(); os.frequency.setValueAtTime(410, t + d); os.frequency.exponentialRampToValueAtTime(330, t + d + .35); const g = ctx.createGain(); os.connect(g); g.connect(G); g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(i ? .05 : .035, t + d + .05); g.gain.exponentialRampToValueAtTime(.0005, t + d + .4); os.start(t + d); os.stop(t + d + .5); }); }, 14, 35);
    } else if (id === 'mar') {
      const a = loopSrc(pink(), (() => { const x = filt('lowpass', 900); const g = ctx.createGain(); swell(null, g, .05, .9, .09); x.connect(g); g.connect(G); return x; })(), 1); nodes.push(a.s);
      const b2 = loopSrc(noise(), (() => { const x = filt('highpass', 3000); const g = ctx.createGain(); swell(null, g, 0, .12, .09); x.connect(g); g.connect(G); return x; })(), 1); nodes.push(b2.s);
    } else if (id === 'vento') {
      const s = ctx.createBufferSource(); s.buffer = pink(); s.loop = true; const x = filt('bandpass', 500, 3); const lfo = ctx.createOscillator(); lfo.frequency.value = .06; const lg = ctx.createGain(); lg.gain.value = 380; lfo.connect(lg); lg.connect(x.frequency); const g = ctx.createGain(); swell(null, g, .2, 1.1, .045); s.connect(x); x.connect(g); g.connect(G); s.start(); lfo.start(); nodes.push(s, lfo);
      const r = loopSrc(brown(), (() => { const y = filt('lowpass', 200); y.connect(G); return y; })(), .4); nodes.push(r.s);
    } else if (id === 'biblioteca') {
      const r = loopSrc(brown(), (() => { const y = filt('lowpass', 250); y.connect(G); return y; })(), .18); nodes.push(r.s);
      let tk = 0; every((t) => { burst(t, tk++ % 2 ? 3200 : 2600, 12, .045, .03); }, 1, 1);
      every((t) => { for (let i = 0; i < 3; i++) burst(t + i * .07, 1800 + R() * 2000, .8, .03, .18, 'bandpass'); }, 12, 30);
      every((t) => burst(t, 400, .7, .06, .6, 'lowpass'), 40, 90);
    }
    return { stop(){ const t = ctx.currentTime; G.gain.setTargetAtTime(0, t, .3); timers.forEach(x => x.stop ? x.stop() : clearTimeout(x)); setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); G.disconnect(); }, 1500); } };
  }

  /* ----- músicas enviadas ----- */
  let player = null;
  function startUser(st){
    stopUser(); if (!st.tracks?.length) return;
    const el = new Audio(); el.crossOrigin = 'anonymous'; let src = null; try { src = ctx.createMediaElementSource(el); src.connect(musicBus); } catch (e) {}
    let i = st.shuffle ? Math.floor(R() * st.tracks.length) : 0;
    const play = async () => { const tr = st.tracks[i]; const u = await T.Assets.resolve(tr.ref); if (!u) { T.toast('“' + (tr.name || 'música') + '” foi guardada em outro computador.'); return; } el.src = u; el.play().catch(() => {}); Radio.track = tr.name; T.emit('radio'); };
    const adv = () => { i = st.shuffle ? Math.floor(R() * st.tracks.length) : (i + 1) % st.tracks.length; };
    el.onended = () => { adv(); if (st.alt) { Radio.track = ''; T.emit('radio'); st.alt.gen(); altT = setTimeout(() => { st.alt.stopGen(); play(); }, 150000); } else play(); };
    let altT = null;
    player = { el, src, next: () => { clearTimeout(altT); if (st.alt) st.alt.stopGen(); adv(); play(); }, stop(){ clearTimeout(altT); el.pause(); el.src = ''; try { src && src.disconnect(); } catch (e) {} } };
    play();
  }
  function stopUser(){ if (player) { player.stop(); player = null; } Radio.track = ''; }

  /* ================= API do rádio ================= */
  const Radio = T.Radio = {
    on: false, band: 'FM', freq: 96.1, vol: .7, vintage: true, tintUI: true, layer: '', layerVol: .35, track: '',
    stations(){ const mine = (S().get(T.Shell?.pid)?.meta?.radio?.mine || []); return { FM: [...FM, ...mine.filter(m => m.band !== 'AM')].sort((a, b) => a.freq - b.freq), AM: [...AM, ...mine.filter(m => m.band === 'AM')].sort((a, b) => a.freq - b.freq) }; },
    current: null,
    extra(id){ const e = (S().get(T.Shell?.pid)?.meta?.radio?.extra || {})[id] || {}; return { tracks: e.tracks || [], mode: e.mode || 'ambas', shuffle: !!e.shuffle }; },
    load(){ const p = S().prefs().radio || {}; Object.assign(Radio, { band: p.band || 'FM', freq: p.freq || 96.1, vol: p.vol ?? .7, vintage: p.vintage ?? true, tintUI: p.tintUI ?? true, layer: p.layer || '', layerVol: p.layerVol ?? .35 }); },
    persist: T.debounce(() => S().setPrefs({ radio: { band: Radio.band, freq: Radio.freq, vol: Radio.vol, vintage: Radio.vintage, tintUI: Radio.tintUI, layer: Radio.layer, layerVol: Radio.layerVol } }), 600),
    power(on = !Radio.on){
      if (on) { init(); ctx.resume(); Radio.on = true; master.gain.setTargetAtTime(Radio.vol, ctx.currentTime, .2); Radio.tune(Radio.freq, true); Radio.setLayer(Radio.layer); }
      else { Radio.on = false; if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, .15); stopGen(); if (amb) { amb.stop(); amb = null; } if (lay) { lay.stop(); lay = null; } stopUser(); Radio.current = null; if (staticG) staticG.gain.setTargetAtTime(0, ctx.currentTime, .1); restoreHue(); }
      Radio.persist(); T.emit('radio');
    },
    nearest(band, freq){ const list = Radio.stations()[band]; let best = null, bd = Infinity; list.forEach(s => { const d = Math.abs(s.freq - freq); if (d < bd) { bd = d; best = s; } }); const tol = band === 'FM' ? .35 : 22; return { st: best, dist: bd, tol }; },
    tune(freq, force){
      Radio.freq = freq; Radio.persist();
      if (!Radio.on) { T.emit('radio'); return; }
      const { st, dist, tol } = Radio.nearest(Radio.band, freq);
      const clear = dist <= tol ? 1 - dist / tol : 0;
      staticG.gain.setTargetAtTime((1 - clear) * .09 + .004, ctx.currentTime, .05);
      const sig = clear > .15 ? st : null;
      const lvl = (st && st.lvl) || 1; musicBus.gain.setTargetAtTime(clear * lvl, ctx.currentTime, .05); ambBus.gain.setTargetAtTime(clear * lvl, ctx.currentTime, .05);
      if (sig && (force || !Radio.current || Radio.current.id !== sig.id)) {
        stopGen(); if (amb) { amb.stop(); amb = null; } stopUser();
        Radio.current = sig;
        const ex = Radio.extra(sig.id);
        const builtin = () => { if (FM.some(x => x.id === sig.id)) startGen(sig.id); else amb = startAmb(sig.id); };
        if (sig.tracks) startUser(sig);
        else if (ex.tracks.length && ex.mode === 'minhas') startUser({ tracks: ex.tracks, shuffle: ex.shuffle });
        else if (ex.tracks.length && ex.mode === 'ambas') startUser({ tracks: ex.tracks, shuffle: ex.shuffle, alt: { gen: builtin, stopGen: () => { stopGen(); if (amb) { amb.stop(); amb = null; } } } });
        else builtin();
        if (Radio.tintUI) setHue(sig.hue);
      } else if (!sig && Radio.current) { stopGen(); if (amb) { amb.stop(); amb = null; } stopUser(); Radio.current = null; restoreHue(); }
      T.emit('radio');
    },
    setBand(b){ Radio.band = b; const list = Radio.stations()[b]; Radio.freq = list[0]?.freq || (b === 'FM' ? 96.1 : 900); if (Radio.on) Radio.tune(Radio.freq, true); Radio.persist(); T.emit('radio'); },
    setVol(v){ Radio.vol = v; if (ctx && Radio.on) master.gain.setTargetAtTime(v, ctx.currentTime, .05); Radio.persist(); },
    setVintage(v){ Radio.vintage = v; setVintage(v); Radio.persist(); },
    setLayer(id){ Radio.layer = id; Radio.persist(); if (!ctx) return; if (lay) { lay.stop(); lay = null; } if (id && Radio.on) { layerBus.gain.setTargetAtTime(Radio.layerVol, ctx.currentTime, .3); lay = startAmb(id, layerBus, 1); } T.emit('radio'); },
    setLayerVol(v){ Radio.layerVol = v; if (layerBus) layerBus.gain.setTargetAtTime(v, ctx.currentTime, .1); Radio.persist(); },
    next(){ if (player) player.next(); },
    _probe(){ if (!ctx) return null; const an = ctx.createAnalyser(); an.fftSize = 2048; master.connect(an); return () => { const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; return Math.sqrt(s / d.length); }; },
  };
  let lay = null;
  function setHue(hh){ document.documentElement.style.setProperty('--hue', hh); }
  function restoreHue(){ const p = S().get(T.Shell?.pid); if (p) document.documentElement.style.setProperty('--hue', p.meta?.hue ?? 230); }
  Radio.load();

  /* ================= vista do rádio ================= */
  T.Views.radio = {
    icon: 'radio', title: () => 'Rádio literária',
    mount(root, tab, ctx2){
      const pid = ctx2.pid;
      const v = h('div.view.view-pad.rdo-view'); root.appendChild(v);
      let dragging = null, editSt = null;
      function fmtF(f, band){ return band === 'FM' ? f.toFixed(1).replace('.', ',') : String(Math.round(f)); }
      const range = (band) => band === 'FM' ? [87.5, 108] : [530, 1610];
      function render(){
        v.innerHTML = '';
        const band = Radio.band; const [lo, hi] = range(band);
        const list = Radio.stations()[band]; const cur = Radio.current;
        const pos = (f) => ((f - lo) / (hi - lo) * 100);
        const scale = h('div.rdo-scale');
        const step = band === 'FM' ? 2 : 100;
        for (let f = Math.ceil(lo / step) * step; f <= hi; f += step) scale.appendChild(h('span.rdo-tick', { style: { left: pos(f) + '%' } }, band === 'FM' ? String(f) : String(f / 10 | 0)));
        list.forEach(s => scale.appendChild(h('button.rdo-st' + (cur && cur.id === s.id ? '.on' : ''), { style: { left: pos(s.freq) + '%' }, title: s.name + ' · ' + fmtF(s.freq, band), onclick: () => { if (!Radio.on) Radio.power(true); Radio.tune(s.freq, true); } }, s.genre ? s.genre.split(' ')[0] : s.name.split(' ')[0])));
        const needle = h('i.rdo-needle', { style: { left: pos(Radio.freq) + '%' } });
        const dial = h('div.rdo-dial', h('div.rdo-band', band), scale, needle);
        dial.addEventListener('pointerdown', (e) => { dial.setPointerCapture(e.pointerId); dragging = true; const r = dial.getBoundingClientRect(); const f = lo + clamp((e.clientX - r.left) / r.width, 0, 1) * (hi - lo); if (!Radio.on) Radio.power(true); Radio.tune(band === 'FM' ? Math.round(f * 10) / 10 : Math.round(f / 10) * 10); });
        dial.addEventListener('pointermove', (e) => { if (!dragging) return; const r = dial.getBoundingClientRect(); const f = lo + clamp((e.clientX - r.left) / r.width, 0, 1) * (hi - lo); Radio.tune(band === 'FM' ? Math.round(f * 10) / 10 : Math.round(f / 10) * 10); });
        dial.addEventListener('pointerup', () => { dragging = false; const { st, dist, tol } = Radio.nearest(band, Radio.freq); if (st && dist < tol * 1.6) Radio.tune(st.freq); });
        const knob = (cls, val, title, onTurn) => { const k = h('div.rdo-knob.' + cls, { title, style: { '--a': (val * 270 - 135) + 'deg' } }, h('i')); k.style.setProperty('--a', (val * 270 - 135) + 'deg');
          k.addEventListener('wheel', (e) => { e.preventDefault(); onTurn(e.deltaY < 0 ? 1 : -1); }, { passive: false });
          let kd = null; k.addEventListener('pointerdown', (e) => { k.setPointerCapture(e.pointerId); kd = { y: e.clientY }; }); k.addEventListener('pointermove', (e) => { if (!kd) return; const d = kd.y - e.clientY; if (Math.abs(d) > 6) { onTurn(d > 0 ? 1 : -1); kd.y = e.clientY; } }); k.addEventListener('pointerup', () => kd = null); return k; };
        const tuneStep = (d) => { if (!Radio.on) Radio.power(true); const s = band === 'FM' ? .1 : 10; Radio.tune(clamp(Math.round((Radio.freq + d * s) * 10) / 10, lo, hi)); };
        const seek = (d) => { const l = list.slice().sort((a, b) => a.freq - b.freq); let s = d > 0 ? l.find(x => x.freq > Radio.freq + .01) : l.slice().reverse().find(x => x.freq < Radio.freq - .01); if (!s) s = d > 0 ? l[0] : l[l.length - 1]; if (!Radio.on) Radio.power(true); Radio.tune(s.freq, true); };
        const on = Radio.on;
        const now = on ? (cur ? h('div.rdo-now', h('b', cur.name), h('span', (cur.genre ? cur.genre + ' · ' : '') + (cur.desc || (cur.tracks ? cur.tracks.length + ' músicas' : ''))), Radio.track ? h('em', '♪ ' + Radio.track) : null) : h('div.rdo-now', h('b', 'Chiado…'), h('span', 'Gire o botão até achar uma estação.'))) : h('div.rdo-now', h('b', 'Desligado'), h('span', 'Ligue o rádio para escrever com música.'));
        const radio = h('div.rdo' + (on ? '.on' : ''), { style: cur ? { '--rh': cur.hue } : {} },
          h('div.rdo-top', h('span.rdo-brand', 'Entrelinhas'), h('span.rdo-model', 'rádio literária'), h('span.rdo-lamp')),
          h('div.rdo-face',
            h('div.rdo-grill', h('div.rdo-freq', on ? fmtF(Radio.freq, band) + (band === 'FM' ? ' MHz' : ' kHz') : '— —')),
            h('div.rdo-right', dial, now,
              h('div.rdo-ctl',
                h('div.rdo-k', knob('vol', Radio.vol, 'Volume (gire ou role)', (d) => { Radio.setVol(clamp(Radio.vol + d * .05, 0, 1)); render(); }), h('span', 'Volume')),
                h('div.rdo-k', h('div.rdo-bands', ['FM', 'AM'].map(b => h('button' + (band === b ? '.on' : ''), { onclick: () => { Radio.setBand(b); render(); } }, b))), h('span', 'Faixa')),
                h('div.rdo-k', h('div.rdo-seek', h('button', { title: 'Estação anterior', onclick: () => seek(-1) }, '◀◀'), h('button', { title: 'Próxima estação', onclick: () => seek(1) }, '▶▶')), h('span', 'Procurar')),
                h('div.rdo-k', knob('tune', (Radio.freq - lo) / (hi - lo), 'Sintonia (gire ou role)', tuneStep), h('span', 'Sintonia')),
                h('div.rdo-k', h('button.rdo-power' + (on ? '.on' : ''), { title: on ? 'Desligar' : 'Ligar', onclick: () => { Radio.power(); } }, icon('sound')), h('span', on ? 'Ligado' : 'Ligar'))))));
        // estações e opções
        const mine = S().get(pid)?.meta?.radio?.mine || [];
        const stList = h('div.rdo-list', ...list.map(s => { const ex = s.tracks ? null : Radio.extra(s.id);
          return h('div.rdo-lrow', h('button.rdo-li' + (cur && cur.id === s.id ? '.on' : ''), { style: { '--sh': s.hue }, onclick: () => { if (!Radio.on) Radio.power(true); Radio.tune(s.freq, true); editSt = s.tracks ? null : s.id; render(); } }, h('span.rdo-lf', fmtF(s.freq, band)), h('span.grow', h('b', s.name), h('span', s.genre || s.desc || (s.tracks ? s.tracks.length + ' músicas suas' : ''))), s.tracks ? h('span.chip.gray', 'sua') : (ex.tracks.length ? h('span.chip.gray', '♪ ' + ex.tracks.length) : null)),
            s.tracks ? null : h('button.icon-btn.sm.rdo-add', { title: 'Pôr suas músicas nesta estação', onclick: () => { editSt = s.id; render(); setTimeout(() => v.querySelector('.rdo-ex')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50); } }, icon('upload'))); }));
        const es = editSt ? [...FM, ...AM].find(x => x.id === editSt) : null;
        const exPanel = es ? (() => { const ex = Radio.extra(es.id);
          return h('div.panel.glass.rdo-ex', h('h3', 'Suas músicas em ' + es.name), h('p.mp-tip', 'Envie músicas do seu computador (mp3, m4a, ogg, wav) para tocar nesta estação.'),
            h('div.cp-r', h('b', 'O que toca'), h('div.seg', [['ambas', 'As duas, alternando'], ['minhas', 'Só as minhas'], ['gerada', 'Só a gerada']].map(([k, n]) => h('button' + (ex.mode === k ? '.on' : ''), { onclick: () => setExtra(es.id, { mode: k }) }, n)))),
            h('div.mp-row', h('button.btn.sm.primary', { onclick: () => addExtra(es.id) }, icon('upload'), 'Enviar músicas'), h('label.mp-chk', h('input', { type: 'checkbox', checked: ex.shuffle, onchange: (e) => setExtra(es.id, { shuffle: e.target.checked }) }), 'Ordem aleatória'), player && cur && cur.id === es.id ? h('button.btn.sm', { onclick: () => Radio.next() }, icon('play'), 'Próxima') : null),
            ex.tracks.length ? h('ol.rdo-tr', ex.tracks.map((t, i) => h('li', t.name, h('button.icon-btn.sm', { title: 'Tirar', onclick: () => setExtra(es.id, { tracks: ex.tracks.filter((_, k) => k !== i) }) }, icon('x'))))) : h('p.muted', 'Nenhuma música sua aqui ainda.'));
        })() : null;
        const layerSel = h('select.select', h('option', { value: '' }, 'Nenhum'), ...AM.map(a => h('option', { value: a.id, selected: Radio.layer === a.id }, a.name))); layerSel.onchange = () => { Radio.setLayer(layerSel.value); };
        const lv = h('input', { type: 'range', min: 0, max: 1, step: .05, value: Radio.layerVol }); lv.oninput = () => Radio.setLayerVol(+lv.value);
        v.append(h('div.mp-gal-head', h('div', h('h1', 'Rádio literária'), h('p.muted', 'Música criada ao vivo para cada gênero no FM, sons de ambiente no AM e estações com as suas músicas. A música continua tocando enquanto você escreve em outras abas.'))),
          radio,
          h('div.cp-grid',
            h('div.panel.glass', h('h3', band === 'FM' ? 'Estações de música' : 'Estações de ambiente'), h('p.mp-tip', 'Clique em ⇪ ao lado de uma estação para pôr as suas músicas nela.'), stList),
            exPanel,
            h('div.panel.glass', h('h3', 'Ajustes'),
              h('label.mp-chk', h('input', { type: 'checkbox', checked: Radio.vintage, onchange: (e) => Radio.setVintage(e.target.checked) }), 'Som de rádio antigo (mais abafado)'),
              h('label.mp-chk', h('input', { type: 'checkbox', checked: Radio.tintUI, onchange: (e) => { Radio.tintUI = e.target.checked; Radio.persist(); if (!e.target.checked) restoreHue(); else if (Radio.current) setHue(Radio.current.hue); } }), 'A cor da plataforma muda com a estação'),
              h('label.mp-f', h('span', 'Ambiente por baixo da música'), layerSel), h('label.mp-rng', h('span', 'Volume do ambiente'), lv),
              player ? h('button.btn.sm', { onclick: () => Radio.next() }, icon('play'), 'Pular música') : null),
            h('div.panel.glass', h('h3', 'Suas estações'), h('p.mp-tip', 'Crie uma estação e envie músicas do seu computador (mp3, m4a, ogg, wav). Elas tocam em sequência quando você sintoniza a estação.'),
              ...mine.map(m => h('div.rdo-mine', h('b', fmtF(m.freq, m.band) + ' ' + m.band + ' · ' + m.name), h('span.muted', m.tracks.length + ' músicas'),
                h('div.mp-row', h('button.btn.sm', { onclick: () => addTracks(m.id) }, icon('upload'), 'Pôr músicas'), h('label.mp-chk', h('input', { type: 'checkbox', checked: !!m.shuffle, onchange: (e) => editMine(m.id, { shuffle: e.target.checked }) }), 'Aleatório'), h('button.icon-btn.sm', { title: 'Apagar estação', onclick: () => delMine(m.id) }, icon('trash'))),
                m.tracks.length ? h('ol.rdo-tr', m.tracks.map((t, i) => h('li', t.name, h('button.icon-btn.sm', { title: 'Tirar', onclick: () => editMine(m.id, { tracks: m.tracks.filter((_, k) => k !== i) }) }, icon('x'))))) : null)),
              h('button.btn.sm.primary', { onclick: newMine }, icon('plus'), 'Nova estação'))));
      }
      const pr = () => S().get(pid)?.meta?.radio || {};
      const setExtra = (id, patch) => { const all = Object.assign({}, pr().extra || {}); all[id] = Object.assign({}, Radio.extra(id), patch); S().update(pid, { meta: { radio: Object.assign({}, pr(), { extra: all }) } }); if (Radio.current?.id === id) Radio.tune(Radio.freq, true); render(); };
      function addExtra(id){
        const inp = h('input', { type: 'file', accept: 'audio/*', multiple: true, style: { display: 'none' } });
        inp.onchange = async () => { const files = [...inp.files]; inp.remove(); if (!files.length) return; T.toast('Enviando ' + files.length + (files.length > 1 ? ' músicas…' : ' música…'));
          const add = []; for (const f of files) { const ref = await T.Assets.upload(f); if (ref) add.push({ ref, name: f.name.replace(/\.[^.]+$/, '') }); }
          setExtra(id, { tracks: [...Radio.extra(id).tracks, ...add] }); T.toast(add.length + (add.length === 1 ? ' música entrou' : ' músicas entraram') + ' na estação.'); };
        document.body.appendChild(inp); inp.click();
      }
      const saveMine = (mine) => { S().update(pid, { meta: { radio: Object.assign({}, pr(), { mine }) } }); render(); };
      const editMine = (id, patch) => { const mine = (pr().mine || []).map(m => m.id === id ? Object.assign({}, m, patch) : m); saveMine(mine); if (Radio.current?.id === id) Radio.tune(Radio.freq, true); };
      const delMine = async (id) => { if (!await T.confirm('Apagar esta estação?', 'As músicas enviadas continuam guardadas.', 'Apagar', true)) return; saveMine((pr().mine || []).filter(m => m.id !== id)); };
      async function newMine(){
        const name = await T.ask('Nome da estação', { placeholder: 'Ex.: Trilha da Vera, Batalhas, Cenas de amor' }); if (!name) return;
        const band = Radio.band; const used = Radio.stations()[band].map(s => s.freq);
        let f = band === 'FM' ? 89.5 : 680; const stp = band === 'FM' ? 1.3 : 70; while (used.some(u => Math.abs(u - f) < (band === 'FM' ? .9 : 50)) && f < (band === 'FM' ? 107.9 : 1600)) f = Math.round((f + stp) * 10) / 10;
        const m = { id: 'mine-' + T.id(), name, band, freq: f, hue: T.HUES ? T.HUES[(pr().mine || []).length % T.HUES.length] : 200, tracks: [], genre: 'Sua estação' };
        saveMine([...(pr().mine || []), m]); addTracks(m.id);
      }
      function addTracks(id){
        const inp = h('input', { type: 'file', accept: 'audio/*', multiple: true, style: { display: 'none' } });
        inp.onchange = async () => { const files = [...inp.files]; inp.remove(); if (!files.length) return; T.toast('Enviando ' + files.length + (files.length > 1 ? ' músicas…' : ' música…'));
          const add = []; for (const f of files) { const ref = await T.Assets.upload(f); if (ref) add.push({ ref, name: f.name.replace(/\.[^.]+$/, '') }); }
          const m = (pr().mine || []).find(x => x.id === id); if (m) editMine(id, { tracks: [...m.tracks, ...add] }); };
        document.body.appendChild(inp); inp.click();
      }
      render();
      const off = T.on('radio', () => { if (!dragging) render(); else { const nd = v.querySelector('.rdo-needle'); const [lo, hi] = range(Radio.band); if (nd) nd.style.left = ((Radio.freq - lo) / (hi - lo) * 100) + '%'; const fq = v.querySelector('.rdo-freq'); if (fq) fq.textContent = fmtF(Radio.freq, Radio.band) + (Radio.band === 'FM' ? ' MHz' : ' kHz'); } });
      return { destroy(){ off(); } };
    }
  };

  /* mini controle na barra de cima */
  T.Radio.pill = () => {
    if (!Radio.on) return h('button.btn.sm', { title: 'Rádio literária', onclick: () => T.Shell.open({ kind: 'radio', ref: 'radio' }) }, icon('radio'), h('span.lbl', 'Rádio'));
    const cur = Radio.current;
    return h('span.radio-pill', T.iconBtn('stop', 'Desligar o rádio', () => Radio.power(false), '.sm'),
      h('button.rp-name', { title: 'Abrir o rádio', onclick: () => T.Shell.open({ kind: 'radio', ref: 'radio' }) }, h('i.rp-eq', h('b'), h('b'), h('b')), h('span.rp-t', cur ? cur.name : 'Chiado…')));
  };
  T.on('radio', () => { const el = document.querySelector('.top .radio-slot'); if (el) el.replaceChildren(T.Radio.pill()); });
})(window.T);
