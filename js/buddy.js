/* Entrelinhas — companheiro de escrita: um bichinho de tinta que só escreve quando você escreve.
   Cada palavra vira uma moeda; com as moedas você compra lugares para ele trabalhar e acessórios. */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;

  const SCENES = [
    { id: 'mesa', name: 'Escrivaninha', price: 0, desc: 'Um cantinho com janela e lua.' },
    { id: 'cafe', name: 'Café num dia de chuva', price: 150, desc: 'Chuva no vidro e café quente.' },
    { id: 'arvore', name: 'Debaixo da árvore', price: 400, desc: 'Sombra, brisa e folhas caindo.' },
    { id: 'praia', name: 'Praia ao entardecer', price: 800, desc: 'Ondas e sol se pondo.' },
    { id: 'torre', name: 'Torre do mago', price: 1500, desc: 'Velas flutuando e céu estrelado.' },
    { id: 'ilha', name: 'Ilha flutuante', price: 2500, desc: 'Cachoeira caindo nas nuvens.' },
    { id: 'nave', name: 'Nave estelar', price: 4000, desc: 'Escrevendo entre os planetas.' },
    { id: 'castelo', name: 'Castelo com dragão', price: 6000, desc: 'Um dragão dá voltas no céu.' },
  ];
  const HATS = [
    { id: '', name: 'Nada', price: 0 },
    { id: 'oculos', name: 'Óculos redondos', price: 60 },
    { id: 'flor', name: 'Flor no cabelo', price: 90 },
    { id: 'palha', name: 'Chapéu de palha', price: 200 },
    { id: 'fones', name: 'Fones de ouvido', price: 300 },
    { id: 'bruxa', name: 'Chapéu de bruxa', price: 500 },
    { id: 'coroa', name: 'Coroa', price: 900 },
    { id: 'capacete', name: 'Capacete espacial', price: 1300 },
  ];
  const NECK = [
    { id: '', name: 'Nada', price: 0 },
    { id: 'cachecol', name: 'Cachecol', price: 120 },
    { id: 'gravata', name: 'Gravata-borboleta', price: 160 },
    { id: 'capa', name: 'Capa de herói', price: 700 },
  ];
  const PETS = [
    { id: '', name: 'Ninguém', price: 0 },
    { id: 'gato', name: 'Gatinho', price: 350 },
    { id: 'coruja', name: 'Coruja', price: 600 },
    { id: 'vagalume', name: 'Vaga-lumes', price: 250 },
  ];
  const COLORS = [
    { id: 'tinta', name: 'Tinta azul', c: '#2a3770', price: 0 },
    { id: 'sepia', name: 'Sépia', c: '#6b4426', price: 80 },
    { id: 'vinho', name: 'Vinho', c: '#6d1f3c', price: 80 },
    { id: 'musgo', name: 'Musgo', c: '#2f5a3a', price: 80 },
    { id: 'lilas', name: 'Lilás', c: '#6a4fa3', price: 150 },
    { id: 'ouro', name: 'Dourado', c: '#a77b12', price: 1000 },
  ];
  const DEF = { on: false, sprint: true, coins: 0, name: 'Nanquim', scene: 'mesa', hat: '', neck: '', pet: '', color: 'tinta', owned: ['mesa', 'h:', 'n:', 'p:', 'c:tinta'], pos: null, mini: false, total: 0, bonusDay: '' };
  const B = () => Object.assign({}, DEF, S().prefs().buddy || {});
  const setB = (patch) => { S().setPrefs({ buddy: Object.assign(B(), patch) }); };

  /* ---------- desenho ---------- */
  const lerp = (a, b, t) => a + (b - a) * t;
  function grad(g, y0, y1, stops){ const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
  function stars(g, W, H, t, n, seed){ for (let i = 0; i < n; i++) { const x = ((i * 97 + seed) % 1000) / 1000 * W, y = ((i * 57 + seed * 3) % 1000) / 1000 * H * .6; const a = .4 + .6 * Math.abs(Math.sin(t / 900 + i)); g.fillStyle = `rgba(255,255,240,${a})`; g.fillRect(x, y, 1.6, 1.6); } }
  const SCENE_DRAW = {
    mesa(g, W, H, t){
      g.fillStyle = grad(g, 0, H, [[0, '#f3d9b0'], [1, '#e2b98a']]); g.fillRect(0, 0, W, H);
      // janela
      const wx = W * .62, wy = H * .1, ww = W * .3, wh = H * .42;
      g.fillStyle = grad(g, wy, wy + wh, [[0, '#1d2550'], [1, '#3c4a8a']]); g.fillRect(wx, wy, ww, wh);
      stars(g, ww, wh * 1.4, t, 14, 7); g.save(); g.translate(wx, wy); stars(g, ww, wh * 1.5, t, 10, 3); g.restore();
      g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(wx + ww * .7, wy + wh * .3, 9, 0, 7); g.fill();
      g.strokeStyle = '#8a5a35'; g.lineWidth = 4; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke();
      // estante
      g.fillStyle = '#9a6a43'; g.fillRect(W * .06, H * .2, W * .3, 5); g.fillRect(W * .06, H * .42, W * .3, 5);
      ['#c0504d', '#4f81bd', '#9bbb59', '#8064a2', '#f79646', '#4bacc6'].forEach((c, i) => { g.fillStyle = c; g.fillRect(W * .07 + i * 11, H * .2 - 22 + (i % 2) * 3, 9, 22 - (i % 2) * 3); g.fillRect(W * .08 + i * 12, H * .42 - 20 + (i % 3) * 2, 10, 20 - (i % 3) * 2); });
    },
    cafe(g, W, H, t){
      g.fillStyle = grad(g, 0, H, [[0, '#6d5a52'], [1, '#3e302b']]); g.fillRect(0, 0, W, H);
      const wx = W * .08, wy = H * .08, ww = W * .84, wh = H * .5;
      g.fillStyle = grad(g, wy, wy + wh, [[0, '#7f95a8'], [1, '#b6c3cc']]); g.fillRect(wx, wy, ww, wh);
      g.fillStyle = 'rgba(40,50,70,.5)'; for (let i = 0; i < 6; i++) g.fillRect(wx + i * ww / 6 + 6, wy + wh * .45 - (i % 3) * 14, ww / 6 - 12, wh * .55 + (i % 3) * 14);
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1;
      for (let i = 0; i < 40; i++) { const x = wx + ((i * 37) % 100) / 100 * ww; const y = wy + ((t / 6 + i * 23) % wh); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 8); g.stroke(); }
      g.strokeStyle = '#2a201c'; g.lineWidth = 5; g.strokeRect(wx, wy, ww, wh);
      g.fillStyle = '#e9e2d6'; g.fillRect(W * .78, H * .62, 16, 14); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5;
      for (let i = 0; i < 2; i++) { g.beginPath(); const sx = W * .78 + 5 + i * 6; g.moveTo(sx, H * .6); g.quadraticCurveTo(sx + 5 * Math.sin(t / 400 + i), H * .54, sx, H * .48); g.stroke(); }
    },
    arvore(g, W, H, t){
      g.fillStyle = grad(g, 0, H, [[0, '#8fd3f4'], [1, '#d9f3ff']]); g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(W * .85, H * .16, 14, 0, 7); g.fill();
      g.fillStyle = '#6cbf5a'; g.beginPath(); g.ellipse(W * .5, H * 1.05, W * .8, H * .45, 0, 0, 7); g.fill();
      g.fillStyle = '#6b4a2b'; g.fillRect(W * .16, H * .25, 16, H * .55);
      g.fillStyle = '#3f8f45'; [[.1, .2, 34], [.24, .14, 38], [.36, .26, 30], [.18, .32, 32]].forEach(([x, y, r]) => { g.beginPath(); g.arc(W * x + Math.sin(t / 1300) * 2, H * y, r, 0, 7); g.fill(); });
      g.fillStyle = '#5aa84f'; [[.2, .18, 22], [.3, .2, 18]].forEach(([x, y, r]) => { g.beginPath(); g.arc(W * x, H * y, r, 0, 7); g.fill(); });
      for (let i = 0; i < 4; i++) { const p = ((t / 30 + i * 70) % (H + 40)) - 20; g.fillStyle = '#7fbf4a'; g.beginPath(); g.ellipse(W * (.3 + i * .12) + Math.sin(p / 20) * 10, p, 4, 2, p / 30, 0, 7); g.fill(); }
    },
    praia(g, W, H, t){
      g.fillStyle = grad(g, 0, H * .6, [[0, '#ff9a8b'], [.6, '#ffc58a'], [1, '#ffe3a3']]); g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff1a8'; g.beginPath(); g.arc(W * .7, H * .5, 24, Math.PI, 0); g.fill();
      for (let k = 0; k < 4; k++) { g.fillStyle = ['#3d7ab8', '#4b8cc7', '#5b9fd6', '#79b6e2'][k]; g.beginPath(); g.moveTo(0, H * .5 + k * 8); for (let x = 0; x <= W; x += 8) g.lineTo(x, H * .5 + k * 8 + Math.sin(x / 18 + t / 500 + k) * 2.5); g.lineTo(W, H); g.lineTo(0, H); g.fill(); }
      g.fillStyle = '#f2d39b'; g.beginPath(); g.moveTo(0, H * .78); g.quadraticCurveTo(W * .5, H * .7, W, H * .8); g.lineTo(W, H); g.lineTo(0, H); g.fill();
      g.strokeStyle = '#5a3d24'; g.lineWidth = 4; g.beginPath(); g.moveTo(W * .12, H * .8); g.quadraticCurveTo(W * .1, H * .45, W * .16, H * .25); g.stroke();
      g.fillStyle = '#2f7d4a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(W * .16 + Math.cos(i * 1.3) * 14, H * .25 + Math.sin(i * 1.3) * 5, 18, 5, i * 1.3, 0, 7); g.fill(); }
    },
    torre(g, W, H, t){
      g.fillStyle = grad(g, 0, H, [[0, '#1b1040'], [1, '#4b2a78']]); g.fillRect(0, 0, W, H); stars(g, W, H, t, 40, 11);
      g.fillStyle = '#e9e3ff'; g.beginPath(); g.arc(W * .18, H * .18, 12, 0, 7); g.fill(); g.fillStyle = '#1b1040'; g.beginPath(); g.arc(W * .2 + 5, H * .17, 11, 0, 7); g.fill();
      g.fillStyle = '#2a1b52'; g.fillRect(W * .76, H * .2, 34, H * .8); g.beginPath(); g.moveTo(W * .76 - 6, H * .2); g.lineTo(W * .76 + 17, H * .02); g.lineTo(W * .76 + 40, H * .2); g.fill();
      g.fillStyle = '#ffd36b'; g.fillRect(W * .76 + 12, H * .34, 10, 14);
      for (let i = 0; i < 4; i++) { const x = W * (.3 + i * .12), y = H * (.25 + (i % 2) * .1) + Math.sin(t / 700 + i) * 4; g.fillStyle = '#f3ead2'; g.fillRect(x, y, 4, 10); g.fillStyle = `rgba(255,200,90,${.6 + .4 * Math.sin(t / 150 + i)})`; g.beginPath(); g.ellipse(x + 2, y - 3, 2.5, 4, 0, 0, 7); g.fill(); }
    },
    ilha(g, W, H, t){
      g.fillStyle = grad(g, 0, H, [[0, '#a7d8ff'], [1, '#f3e8ff']]); g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.85)'; [[.15, .75, 40], [.4, .82, 50], [.75, .78, 46], [.95, .85, 36]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(W * x + Math.sin(t / 2000 + x * 9) * 6, H * y, r, r * .4, 0, 0, 7); g.fill(); });
      const iy = H * .3 + Math.sin(t / 900) * 3;
      g.fillStyle = '#7b5a3a'; g.beginPath(); g.moveTo(W * .62, iy); g.lineTo(W * .96, iy); g.lineTo(W * .82, iy + 40); g.fill();
      g.fillStyle = '#5cbf6a'; g.fillRect(W * .62, iy - 5, W * .34, 7);
      g.fillStyle = 'rgba(160,215,255,.9)'; g.fillRect(W * .88, iy, 5, H - iy);
      g.fillStyle = '#3f8f45'; g.beginPath(); g.arc(W * .7, iy - 16, 12, 0, 7); g.fill(); g.fillStyle = '#6b4a2b'; g.fillRect(W * .7 - 2, iy - 6, 4, 6);
    },
    nave(g, W, H, t){
      g.fillStyle = '#05060f'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) { const x = (W - ((t / (8 + i % 5 * 4)) + i * 53) % W); const y = (i * 31) % H; g.fillStyle = `rgba(255,255,255,${.3 + (i % 4) * .2})`; g.fillRect(x, y, 1.5 + (i % 3) * .5, 1.5); }
      g.fillStyle = grad(g, H * .1, H * .5, [[0, '#ff9b5c'], [1, '#b23a6e']]); g.beginPath(); g.arc(W * .78, H * .3, 26, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,220,180,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(W * .78, H * .3, 42, 9, -.3, 0, 7); g.stroke();
      g.strokeStyle = '#7d8aa6'; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#3a4258'; g.fillRect(0, H * .72, W, H * .28);
    },
    castelo(g, W, H, t){
      g.fillStyle = grad(g, 0, H, [[0, '#3b2c5e'], [.6, '#c2607a'], [1, '#f3a76b']]); g.fillRect(0, 0, W, H); stars(g, W, H * .5, t, 18, 5);
      g.fillStyle = '#251b38';
      g.fillRect(W * .55, H * .35, W * .38, H * .65); [[.55, 12], [.68, 10], [.8, 12], [.9, 9]].forEach(([x, w]) => { g.fillRect(W * x, H * .22, w, H * .2); g.beginPath(); g.moveTo(W * x - 3, H * .22); g.lineTo(W * x + w / 2, H * .1); g.lineTo(W * x + w + 3, H * .22); g.fill(); });
      g.fillStyle = '#ffcf6b'; [[.62, .5], [.74, .45], [.84, .55]].forEach(([x, y]) => g.fillRect(W * x, H * y, 5, 8));
      const a = t / 2200; const dx = W * .45 + Math.cos(a) * W * .3, dy = H * .22 + Math.sin(a * 2) * 12; const dir = -Math.sin(a) >= 0 ? 1 : -1; const flap = Math.sin(t / 120) * 8;
      g.save(); g.translate(dx, dy); g.scale(dir, 1); g.fillStyle = '#1a1226';
      g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(12, -2); g.lineTo(22, -6); g.lineTo(20, 0); g.fill();
      g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-24, 4, -30, -2); g.lineTo(-14, 2); g.fill();
      g.beginPath(); g.moveTo(-4, -2); g.lineTo(-10, -14 - flap); g.lineTo(6, -3); g.fill(); g.restore();
    },
  };

  // cores derivadas (clarear/escurecer um hex)
  function shade(hex, k){ const n = parseInt(hex.slice(1), 16); let r = n >> 16, g2 = (n >> 8) & 255, b = n & 255; const f = (c) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k)); return `rgb(${f(r)},${f(g2)},${f(b)})`; }
  function rr(g, x, y, w, h2, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h2, r); g.arcTo(x + w, y + h2, x, y + h2, r); g.arcTo(x, y + h2, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function drawBuddy(g, W, H, t, st){
    const b = st.cfg; const col = (COLORS.find(c => c.id === b.color) || COLORS[0]).c;
    const typing = t - st.lastType < 1200, sleeping = t - st.lastType > 9000 && !st.celebrate;
    const dy = H * .7; // tampo da mesa
    // luz ambiente da luminária
    const lampX = W * .86, lampY = dy - 40; const flick = .92 + Math.sin(t / 130) * .03 + Math.sin(t / 47) * .02;
    const glow = g.createRadialGradient(lampX, lampY + 6, 4, lampX, lampY + 10, W * .55); glow.addColorStop(0, `rgba(255,214,140,${.38 * flick})`); glow.addColorStop(1, 'rgba(255,214,140,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    // mesa
    const wood = g.createLinearGradient(0, dy, 0, H); wood.addColorStop(0, '#9a6a42'); wood.addColorStop(.18, '#7d5232'); wood.addColorStop(1, '#4e3220');
    g.fillStyle = wood; rr(g, W * .06, dy, W * .88, H - dy + 8, 8); g.fill();
    g.fillStyle = 'rgba(255,230,190,.28)'; g.fillRect(W * .06 + 6, dy + 1, W * .88 - 12, 1.5);
    g.strokeStyle = 'rgba(60,35,18,.25)'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); const yy = dy + 12 + i * 9; g.moveTo(W * .1, yy); g.bezierCurveTo(W * .35, yy - 3, W * .6, yy + 3, W * .9, yy - 1); g.stroke(); }
    // luminária
    g.fillStyle = '#3b3a44'; g.fillRect(lampX - 1.5, lampY - 2, 3, 42); rr(g, lampX - 9, dy - 4, 18, 5, 2); g.fill();
    g.fillStyle = '#e9d9b0'; g.beginPath(); g.moveTo(lampX - 13, lampY + 2); g.lineTo(lampX + 13, lampY + 2); g.lineTo(lampX + 8, lampY - 12); g.lineTo(lampX - 8, lampY - 12); g.closePath(); g.fill();
    g.fillStyle = `rgba(255,236,170,${.9 * flick})`; g.beginPath(); g.ellipse(lampX, lampY + 3, 9, 2.5, 0, 0, 7); g.fill();
    // pilha de folhas prontas
    const pages = Math.min(9, Math.floor(st.lines / 6));
    for (let i = 0; i < pages; i++) { const ox = Math.sin(i * 2.3) * 2; g.fillStyle = i % 2 ? '#efe7d4' : '#f8f3e6'; g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 2; rr(g, W * .1 + ox, dy - 3 - i * 2, 34, 3, 1); g.fill(); } g.shadowBlur = 0;
    // tinteiro
    const ix = W * .7, iy = dy;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(ix, iy + 1, 11, 2.5, 0, 0, 7); g.fill();
    const glass = g.createLinearGradient(ix - 10, 0, ix + 10, 0); glass.addColorStop(0, '#1b2140'); glass.addColorStop(.5, '#2f3a6e'); glass.addColorStop(1, '#141a33');
    g.fillStyle = glass; rr(g, ix - 10, iy - 15, 20, 15, 5); g.fill(); g.fillStyle = '#20263f'; rr(g, ix - 5, iy - 20, 10, 6, 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, ix - 7, iy - 13, 3, 9, 1.5); g.fill();
    // papel com escrita
    const px = W * .47, py = dy - 2;
    g.save(); g.translate(px, py); g.rotate(-.05);
    g.shadowColor = 'rgba(40,20,0,.25)'; g.shadowBlur = 4; g.shadowOffsetY = 1; g.fillStyle = '#fbf7ec'; rr(g, 0, -6, 52, 9, 2); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    // folha deitada em perspectiva: linhas de escrita como rabiscos
    g.strokeStyle = shade(col, -.1); g.lineWidth = .9; g.lineCap = 'round';
    const lines = st.lines % 6;
    for (let i = 0; i <= lines; i++) {
      const len = i < lines ? 42 : st.lineLen * 42; if (len < 1) continue; const y0 = -4.2 + i * 1.35;
      g.beginPath(); g.moveTo(5, y0); for (let x = 0; x <= len; x += 2) g.lineTo(5 + x, y0 + Math.sin(x * 1.7 + i * 3) * .35); g.stroke();
    }
    g.restore();
    // sombra do bichinho
    const bob = st.celebrate ? -Math.abs(Math.sin(t / 130)) * 12 : sleeping ? 0 : typing ? Math.sin(t / 85) * .8 : Math.sin(t / 700) * 1.2;
    const squash = st.celebrate ? 1 : sleeping ? 1 + Math.sin(t / 900) * .025 : typing ? 1 + Math.sin(t / 85) * .015 : 1 + Math.sin(t / 700) * .02;
    const cx = W * .37, base = dy + bob;
    g.fillStyle = 'rgba(30,15,5,.28)'; g.beginPath(); g.ellipse(cx, dy + 1, 22 - Math.min(8, -bob), 4, 0, 0, 7); g.fill();
    if (b.neck === 'capa') { const cg = g.createLinearGradient(cx - 30, 0, cx + 10, 0); cg.addColorStop(0, '#8e1f2a'); cg.addColorStop(1, '#d0434f'); g.fillStyle = cg; g.beginPath(); g.moveTo(cx - 14, base - 40); g.quadraticCurveTo(cx - 34 + Math.sin(t / 320) * 3, base - 18, cx - 26, base - 2); g.quadraticCurveTo(cx - 6, base + 2, cx + 6, base - 8); g.closePath(); g.fill(); }
    g.save(); g.translate(cx, base); g.scale(1 / squash, squash);
    // pezinhos
    g.fillStyle = shade(col, -.3); g.beginPath(); g.ellipse(-9, -2, 7, 3.6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(9, -2, 7, 3.6, 0, 0, 7); g.fill();
    // corpo em gota com sombreado
    const R = 25;
    const bodyG = g.createRadialGradient(-9, -34, 3, 0, -24, 34); bodyG.addColorStop(0, shade(col, .45)); bodyG.addColorStop(.45, col); bodyG.addColorStop(1, shade(col, -.45));
    g.fillStyle = bodyG; g.beginPath(); g.moveTo(0, -66); g.bezierCurveTo(6, -54, R, -42, R, -24); g.bezierCurveTo(R, -9, 13, 0, 0, 0); g.bezierCurveTo(-13, 0, -R, -9, -R, -24); g.bezierCurveTo(-R, -42, -6, -54, 0, -66); g.fill();
    // luz de borda
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(R - 3, -30); g.bezierCurveTo(R - 2, -14, 12, -3, 2, -2); g.stroke();
    // brilho
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-11, -38, 4, 7.5, -.45, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(-6, -49, 1.8, 0, 7); g.fill();
    // bochechas
    g.fillStyle = 'rgba(255,140,160,.38)'; g.beginPath(); g.ellipse(-14, -16, 4.5, 2.6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(14, -16, 4.5, 2.6, 0, 0, 7); g.fill();
    // olhos
    const blink = !sleeping && (t % 4300) < 120;
    const lookX = typing ? 2.2 : Math.sin(t / 1900) * 1.4, lookY = typing ? 1.6 : 0;
    if (sleeping || blink) { g.strokeStyle = shade(col, -.7); g.lineWidth = 1.8; g.lineCap = 'round'; [-8, 8].forEach(o => { g.beginPath(); g.arc(o, -22, 4, .25, Math.PI - .25); g.stroke(); }); }
    else [-8, 8].forEach(o => {
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(o, -23, 5.6, 6.6, 0, 0, 7); g.fill();
      g.fillStyle = '#1a1424'; g.beginPath(); g.ellipse(o + lookX, -22.5 + lookY, 3.5, 4, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(o + lookX - 1.3, -24.3 + lookY, 1.4, 0, 7); g.fill(); g.beginPath(); g.arc(o + lookX + 1.2, -21 + lookY, .7, 0, 7); g.fill();
    });
    // boca
    g.strokeStyle = shade(col, -.7); g.fillStyle = '#5a1f2e'; g.lineWidth = 1.5; g.lineCap = 'round';
    if (st.celebrate) { g.beginPath(); g.arc(0, -13, 4, 0, Math.PI); g.closePath(); g.fill(); }
    else if (sleeping) { g.beginPath(); g.ellipse(0, -12, 1.6, 1.2, 0, 0, 7); g.fill(); }
    else if (typing) { g.beginPath(); g.moveTo(-2, -12.5); g.quadraticCurveTo(0, -11.2, 2, -12.5); g.stroke(); }
    else { g.beginPath(); g.arc(0, -14.5, 3, .3, Math.PI - .3); g.stroke(); }
    // óculos e pescoço
    if (b.hat === 'oculos') { g.strokeStyle = '#2b2b33'; g.lineWidth = 1.4; [-8, 8].forEach(o => { g.beginPath(); g.arc(o, -23, 7, 0, 7); g.stroke(); }); g.beginPath(); g.moveTo(-1.5, -24); g.quadraticCurveTo(0, -25.5, 1.5, -24); g.stroke(); g.fillStyle = 'rgba(200,230,255,.18)'; [-8, 8].forEach(o => { g.beginPath(); g.arc(o, -23, 6.3, 0, 7); g.fill(); }); }
    if (b.neck === 'cachecol') { const sg = g.createLinearGradient(-20, 0, 20, 0); sg.addColorStop(0, '#c23a3a'); sg.addColorStop(1, '#e8665a'); g.fillStyle = sg; rr(g, -21, -8, 42, 7, 3.5); g.fill(); rr(g, 8, -5, 7, 13, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -16; i < 18; i += 6) g.fillRect(i, -8, 2, 7); }
    if (b.neck === 'gravata') { g.fillStyle = '#e04a6c'; g.beginPath(); g.moveTo(0, -5); g.quadraticCurveTo(-8, -10, -9, -4); g.quadraticCurveTo(-8, 1, 0, -3); g.quadraticCurveTo(8, 1, 9, -4); g.quadraticCurveTo(8, -10, 0, -5); g.fill(); g.fillStyle = '#b53252'; g.beginPath(); g.arc(0, -4, 2, 0, 7); g.fill(); }
    // chapéus
    const hy = -60;
    if (b.hat === 'palha') { const sg = g.createLinearGradient(0, hy - 10, 0, hy + 6); sg.addColorStop(0, '#f6d77a'); sg.addColorStop(1, '#d3a645'); g.fillStyle = sg; g.beginPath(); g.ellipse(0, hy + 6, 24, 5.5, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, hy + 2, 12, 10, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(-12, hy, 24, 3.2); g.strokeStyle = 'rgba(120,80,20,.35)'; g.lineWidth = .8; g.beginPath(); g.ellipse(0, hy + 6, 19, 3.6, 0, 0, 7); g.stroke(); }
    if (b.hat === 'coroa') { const cgd = g.createLinearGradient(0, hy - 8, 0, hy + 8); cgd.addColorStop(0, '#ffe48a'); cgd.addColorStop(1, '#d19a1c'); g.fillStyle = cgd; g.beginPath(); g.moveTo(-12, hy + 8); g.lineTo(-13, hy - 4); g.lineTo(-6, hy + 2); g.lineTo(0, hy - 8); g.lineTo(6, hy + 2); g.lineTo(13, hy - 4); g.lineTo(12, hy + 8); g.closePath(); g.fill(); [[-13, hy - 4], [0, hy - 8], [13, hy - 4]].forEach(([x, y]) => { g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }); g.fillStyle = '#e74c6c'; g.beginPath(); g.arc(0, hy + 4, 2.2, 0, 7); g.fill(); }
    if (b.hat === 'bruxa') { const wg = g.createLinearGradient(-12, 0, 12, 0); wg.addColorStop(0, '#5b3794'); wg.addColorStop(1, '#3a2262'); g.fillStyle = wg; g.beginPath(); g.ellipse(0, hy + 7, 23, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-12, hy + 6); g.quadraticCurveTo(-2, hy - 8, 10 + Math.sin(t / 500) * 2, hy - 24); g.quadraticCurveTo(6, hy - 6, 12, hy + 6); g.closePath(); g.fill(); g.fillStyle = '#f4c430'; g.fillRect(-11, hy + 2, 22, 2.6); g.fillStyle = '#ffe48a'; g.beginPath(); g.arc(10 + Math.sin(t / 500) * 2, hy - 24, 1.8, 0, 7); g.fill(); }
    if (b.hat === 'fones') { g.strokeStyle = '#2f3040'; g.lineWidth = 3.2; g.beginPath(); g.arc(0, -30, 23, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); [-1, 1].forEach(d => { const fg = g.createLinearGradient(0, -36, 0, -18); fg.addColorStop(0, '#ff7a8c'); fg.addColorStop(1, '#d6405a'); g.fillStyle = fg; rr(g, d * 24 - 4, -36, 8, 15, 3.5); g.fill(); }); }
    if (b.hat === 'flor') { const fx = 10, fy = hy + 18; g.fillStyle = '#ff9fc0'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(fx + Math.cos(i * 1.256) * 4, fy + Math.sin(i * 1.256) * 4, 3.2, 2.4, i * 1.256, 0, 7); g.fill(); } g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(fx, fy, 2.4, 0, 7); g.fill(); g.fillStyle = '#6fbf73'; g.beginPath(); g.ellipse(fx - 7, fy + 3, 4, 1.8, .6, 0, 7); g.fill(); }
    if (b.hat === 'capacete') { const hg = g.createRadialGradient(-10, -42, 4, 0, -30, 36); hg.addColorStop(0, 'rgba(255,255,255,.35)'); hg.addColorStop(1, 'rgba(170,215,255,.12)'); g.fillStyle = hg; g.strokeStyle = 'rgba(225,242,255,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(0, -30, 35, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-17, -46, 4, 9, .6, 0, 7); g.fill(); g.fillStyle = '#c9d3e6'; rr(g, -20, -4, 40, 6, 3); g.fill(); }
    g.restore();
    // braço que segura a pena
    const shoulder = { x: cx + 18, y: base - 18 };
    const tip = typing ? { x: px + 6 + st.lineLen * 40, y: py - 3 + (st.lines % 6) * 1.35 + Math.sin(t / 55) * 1.2 } : sleeping ? { x: px + 2, y: py - 1 } : { x: px + 4, y: py - 4 };
    g.strokeStyle = shade(col, -.15); g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(shoulder.x, shoulder.y); g.quadraticCurveTo((shoulder.x + tip.x) / 2, shoulder.y + 2, tip.x - 2, tip.y - 4); g.stroke();
    g.fillStyle = shade(col, -.05); g.beginPath(); g.arc(tip.x - 2, tip.y - 4, 3.4, 0, 7); g.fill();
    // braço apoiado
    g.strokeStyle = shade(col, -.25); g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 18, base - 16); g.quadraticCurveTo(cx - 24, base - 8, cx - 20, dy - 2); g.stroke();
    // pena
    const fa = -1.05 + (typing ? Math.sin(t / 55) * .06 : 0);
    g.save(); g.translate(tip.x, tip.y); g.rotate(fa);
    const fg = g.createLinearGradient(0, -4, 0, 4); fg.addColorStop(0, '#fffdf6'); fg.addColorStop(1, '#e6dcc4');
    g.fillStyle = fg; g.beginPath(); g.moveTo(4, 0); g.quadraticCurveTo(14, -6, 30, -2); g.quadraticCurveTo(18, 4, 4, 0); g.fill();
    g.strokeStyle = 'rgba(150,130,100,.5)'; g.lineWidth = .7; g.beginPath(); g.moveTo(0, 0); g.lineTo(30, -1.5); g.stroke();
    for (let i = 8; i < 28; i += 3) { g.beginPath(); g.moveTo(i, -.6); g.lineTo(i + 2.5, -3.6 + (i > 20 ? 1 : 0)); g.stroke(); }
    g.fillStyle = '#1c1c2a'; g.beginPath(); g.moveTo(0, 0); g.lineTo(5, -1); g.lineTo(5, 1); g.closePath(); g.fill();
    g.restore();
    if (typing) { g.fillStyle = shade(col, -.2); g.globalAlpha = .6; g.beginPath(); g.arc(tip.x + .5, tip.y + .5, .9, 0, 7); g.fill(); g.globalAlpha = 1; }
    // bichinhos
    if (b.pet === 'gato') { const gx = W * .6, gy = dy; const gc = '#7b7b8c', gd = '#5d5d6c'; g.fillStyle = 'rgba(30,15,5,.22)'; g.beginPath(); g.ellipse(gx, gy + 1, 11, 2.5, 0, 0, 7); g.fill(); g.strokeStyle = gd; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(gx + 8, gy - 3); g.quadraticCurveTo(gx + 20, gy - 6 + Math.sin(t / 420) * 4, gx + 15, gy - 17); g.stroke(); const bg2 = g.createRadialGradient(gx - 3, gy - 12, 2, gx, gy - 8, 13); bg2.addColorStop(0, '#9a9aab'); bg2.addColorStop(1, gd); g.fillStyle = bg2; g.beginPath(); g.ellipse(gx, gy - 8, 9.5, 8.5, 0, 0, 7); g.fill(); g.fillStyle = gc; g.beginPath(); g.arc(gx - 1, gy - 20, 7, 0, 7); g.fill(); g.beginPath(); g.moveTo(gx - 7, gy - 23); g.lineTo(gx - 6, gy - 31); g.lineTo(gx - 1.5, gy - 26); g.closePath(); g.moveTo(gx + 5, gy - 23); g.lineTo(gx + 4, gy - 31); g.lineTo(gx - .5, gy - 26); g.closePath(); g.fill(); g.fillStyle = '#f2a7b8'; g.beginPath(); g.moveTo(gx - 6, gy - 25); g.lineTo(gx - 5.5, gy - 29); g.lineTo(gx - 3, gy - 26); g.fill(); if (sleeping) { g.strokeStyle = '#2a2a33'; g.lineWidth = 1; [-4, 2].forEach(o => { g.beginPath(); g.arc(gx + o, gy - 20, 1.6, .2, Math.PI - .2); g.stroke(); }); } else { g.fillStyle = '#d8f06a'; [-4, 2].forEach(o => { g.beginPath(); g.ellipse(gx + o, gy - 20, 1.6, 1.9, 0, 0, 7); g.fill(); }); g.fillStyle = '#111'; [-4, 2].forEach(o => { g.fillRect(gx + o - .4, gy - 21.4, .8, 2.8); }); } }
    if (b.pet === 'coruja') { const ox = W * .16, oy = H * .38; const og = g.createRadialGradient(ox - 3, oy - 4, 2, ox, oy, 12); og.addColorStop(0, '#b08a62'); og.addColorStop(1, '#7a5a3a'); g.fillStyle = og; g.beginPath(); g.ellipse(ox, oy, 9, 11, 0, 0, 7); g.fill(); g.fillStyle = '#e9d6b0'; g.beginPath(); g.ellipse(ox, oy + 3, 5.5, 6.5, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; [-3.5, 3.5].forEach(o => { g.beginPath(); g.arc(ox + o, oy - 4, 3.3, 0, 7); g.fill(); }); g.fillStyle = '#1b1b1b'; [-3.5, 3.5].forEach(o => { g.beginPath(); g.arc(ox + o + Math.sin(t / 2000), oy - 4, 1.6, 0, 7); g.fill(); }); g.fillStyle = '#e8a33d'; g.beginPath(); g.moveTo(ox - 1.4, oy - 1); g.lineTo(ox + 1.4, oy - 1); g.lineTo(ox, oy + 1.6); g.fill(); g.fillStyle = '#6b4a2b'; g.fillRect(ox - 12, oy + 10, 24, 2.5); }
    if (b.pet === 'vagalume') { for (let i = 0; i < 7; i++) { const fx = W * (.12 + .12 * i) + Math.sin(t / 700 + i * 2) * 10, fy = H * (.22 + .09 * (i % 3)) + Math.cos(t / 900 + i) * 8; const a = .5 + .5 * Math.sin(t / 220 + i); const fgl = g.createRadialGradient(fx, fy, 0, fx, fy, 7); fgl.addColorStop(0, `rgba(255,245,150,${a})`); fgl.addColorStop(1, 'rgba(255,245,150,0)'); g.fillStyle = fgl; g.fillRect(fx - 7, fy - 7, 14, 14); } }
    // zzz
    if (sleeping) { g.textAlign = 'left'; for (let i = 0; i < 3; i++) { const k = ((t / 1000) + i / 3) % 1; const zx = cx + 18 + k * 18 + Math.sin(k * 6) * 2, zy = base - 62 - k * 24; g.globalAlpha = Math.min(1, (1 - k) * 1.6); g.font = `700 ${10 + k * 6}px "Instrument Sans", system-ui, sans-serif`; g.fillStyle = '#fff'; g.shadowColor = 'rgba(40,40,80,.6)'; g.shadowBlur = 3; g.fillText('z', zx, zy); } g.shadowBlur = 0; g.globalAlpha = 1; }
    // moedas subindo
    st.pops = st.pops.filter(p => t - p.t < 1300);
    st.pops.forEach(p => { const k = (t - p.t) / 1300; const y = p.y - k * 34; g.globalAlpha = 1 - k * k; const cg = g.createRadialGradient(p.x - 1.5, y - 1.5, .5, p.x, y, 6); cg.addColorStop(0, '#fff3b0'); cg.addColorStop(.6, '#f4c430'); cg.addColorStop(1, '#b8860b'); g.fillStyle = cg; g.beginPath(); g.arc(p.x, y, 5.5, 0, 7); g.fill(); g.font = '700 11px "Instrument Sans", system-ui, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#fff'; g.shadowColor = 'rgba(120,80,0,.7)'; g.shadowBlur = 3; g.fillText('+' + p.n, p.x + 8, y + 4); g.shadowBlur = 0; g.globalAlpha = 1; });
    // celebração: confetes
    if (st.celebrate) { for (let i = 0; i < 18; i++) { const k = ((t / 1400) + i / 18) % 1; const x = W * ((i * 37) % 100) / 100 + Math.sin(t / 300 + i) * 6; const y = k * H; g.fillStyle = `hsl(${(i * 47) % 360} 85% 62%)`; g.save(); g.translate(x, y); g.rotate(t / 200 + i); g.fillRect(-2, -1, 4, 2.4); g.restore(); } }
    // acabamento: vinheta suave
    const vg = g.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .35, W / 2, H * .55, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,5,20,.32)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }

  /* ---------- janela ---------- */
  let win = null, raf = 0, st = null, offs = [];
  function render(){
    if (!win) return; const cfg = B(); st.cfg = cfg;
    const cv = win.querySelector('canvas'); if (!cv || win.classList.contains('mini')) return;
    const d = devicePixelRatio || 1; const W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
    if (cv.width !== W * d) { cv.width = W * d; cv.height = H * d; }
    const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    const t = performance.now();
    if (t - st.lastType < 1200) { st.lineLen += .004; if (st.lineLen >= 1) { st.lineLen = 0; st.lines++; } }
    if (st.celebrate && t > st.celebrate) st.celebrate = 0;
    (SCENE_DRAW[cfg.scene] || SCENE_DRAW.mesa)(g, W, H, t);
    drawBuddy(g, W, H, t, st);
  }
  function loop(){ render(); raf = requestAnimationFrame(loop); }
  function progress(){
    const pid = T.Shell?.pid; const s = T.Shell?.sprint;
    if (s && s.pid === pid) {
      const el = s.acc + (s.runAt ? Date.now() - s.runAt : 0); const w = Math.max(0, T.Session.today(pid) - s.startWords);
      return { label: 'Sprint: +' + T.fmt(w) + ' palavras', pct: Math.min(100, el / (s.min * 600)), sub: Math.round(el / 60000) + ' de ' + s.min + ' min' };
    }
    if (!pid) return { label: 'Abra um livro para escrever', pct: 0, sub: '' };
    const p = S().get(pid); const t = T.Session.today(pid); const g = p?.meta?.targets?.session || 0;
    return g ? { label: T.fmt(t) + ' / ' + T.fmt(g) + ' palavras hoje', pct: Math.min(100, t / g * 100), sub: Math.round(Math.min(100, t / g * 100)) + '%' } : { label: T.fmt(t) + ' palavras hoje', pct: 0, sub: 'sem meta diária' };
  }
  function updateFoot(){
    if (!win) return; const p = progress(); const cfg = B();
    win.querySelector('.bd-coins').textContent = T.fmt(cfg.coins);
    win.querySelector('.bd-lbl').textContent = p.label; win.querySelector('.bd-sub').textContent = p.sub;
    win.querySelector('.bd-bar i').style.width = p.pct + '%';
  }
  function open(){
    if (win) return;
    const cfg = B();
    st = { lastType: -1e9, lines: 2, lineLen: .3, pops: [], celebrate: 0, cfg };
    const cv = h('canvas.bd-cv');
    win = h('div.bd-win.glass.glass-strong' + (cfg.mini ? '.mini' : ''),
      h('div.bd-head', h('b.bd-name', cfg.name), h('span.bd-money', { title: 'Moedas: cada palavra escrita vale uma' }, h('i.bd-coin'), h('span.bd-coins', T.fmt(cfg.coins))), h('span.grow'),
        T.iconBtn('spark', 'Loja: lugares e acessórios', () => shop(), '.sm'),
        T.iconBtn(cfg.mini ? 'up' : 'down', 'Encolher ou abrir', () => { const m = !win.classList.contains('mini'); win.classList.toggle('mini', m); setB({ mini: m }); }, '.sm.bd-min'),
        T.iconBtn('x', 'Fechar o companheiro', () => { close(); setB({ on: false }); T.toast('Companheiro guardado. Ele volta no próximo sprint (ou em Sprint › Companheiro).'); }, '.sm')),
      cv,
      h('div.bd-foot', h('div.row', h('span.bd-lbl'), h('span.grow'), h('span.bd-sub')), h('div.bd-bar', h('i'))));
    document.body.appendChild(win);
    const pos = cfg.pos; if (pos) { win.style.left = T.clamp(pos.x, 0, innerWidth - 120) + 'px'; win.style.top = T.clamp(pos.y, 0, innerHeight - 60) + 'px'; win.style.right = 'auto'; win.style.bottom = 'auto'; }
    // arrastar pela barra de cima
    const head = win.querySelector('.bd-head');
    head.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return; e.preventDefault();
      const r = win.getBoundingClientRect(); const ox = e.clientX - r.left, oy = e.clientY - r.top;
      const mv = (ev) => { win.style.left = T.clamp(ev.clientX - ox, 0, innerWidth - 80) + 'px'; win.style.top = T.clamp(ev.clientY - oy, 0, innerHeight - 40) + 'px'; win.style.right = 'auto'; win.style.bottom = 'auto'; };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); const rr = win.getBoundingClientRect(); setB({ pos: { x: rr.left, y: rr.top } }); };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    });
    const onKey = (e) => { const tg = e.target; if (!tg || !(tg.isContentEditable || tg.tagName === 'TEXTAREA')) return; if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') st.lastType = performance.now(); };
    document.addEventListener('keydown', onKey, true);
    const offW = T.on('words-delta', ({ delta }) => {
      if (!delta || delta < 0) return; const c = B(); const n = Math.min(delta, 50);
      const today = new Date().toISOString().slice(0, 10); let bonus = 0;
      const pid = T.Shell?.pid; const goal = pid ? S().get(pid)?.meta?.targets?.session || 0 : 0;
      if (goal && c.bonusDay !== today && T.Session.today(pid) >= goal) { bonus = 100; T.toast('Meta do dia batida! ' + c.name + ' ganhou 100 moedas de bônus.'); st.celebrate = performance.now() + 2500; }
      setB({ coins: c.coins + n + bonus, total: (c.total || 0) + n, bonusDay: bonus ? today : c.bonusDay });
      const cvr = cv.getBoundingClientRect(); st.pops.push({ t: performance.now(), n: n + bonus, x: cvr.width * .5 + (Math.random() - .5) * 30, y: cvr.height * .45 });
      updateFoot();
    });
    const iv = setInterval(updateFoot, 1000);
    offs = [() => document.removeEventListener('keydown', onKey, true), offW, () => clearInterval(iv)];
    updateFoot(); loop();
  }
  function close(){ cancelAnimationFrame(raf); offs.forEach(f => f()); offs = []; if (win) win.remove(); win = null; }

  /* ---------- loja ---------- */
  function shop(){
    let tabK = 'lugares';
    T.modal((box, closeM) => {
      const draw = () => {
        const c = B(); box.innerHTML = '';
        const nameIn = h('input.input', { value: c.name, 'aria-label': 'Nome do companheiro', style: { maxWidth: '180px' } }); nameIn.onchange = () => { const n = nameIn.value.trim() || 'Nanquim'; setB({ name: n }); if (win) win.querySelector('.bd-name').textContent = n; };
        box.append(h('div.row', h('h2.grow', 'Loja do ' + c.name), h('span.bd-money.lg', h('i.bd-coin'), T.fmt(c.coins) + ' moedas')),
          h('p.sub', 'Cada palavra que você escreve vira uma moeda. Bater a meta do dia dá 100 de bônus, e terminar um sprint dá 50.'),
          h('div.row', { style: { gap: '8px' } }, h('span.muted', 'Nome:'), nameIn));
        const tabs = [['lugares', 'Lugares'], ['chapeus', 'Na cabeça'], ['pescoco', 'No pescoço'], ['bichos', 'Amigos'], ['cores', 'Cor']];
        box.append(h('div.seg', tabs.map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { tabK = k; draw(); } }, l); if (k === tabK) b.classList.add('on'); return b; })));
        const map = { lugares: [SCENES, 'scene', ''], chapeus: [HATS, 'hat', 'h:'], pescoco: [NECK, 'neck', 'n:'], bichos: [PETS, 'pet', 'p:'], cores: [COLORS, 'color', 'c:'] };
        const [list, key, pre] = map[tabK];
        const grid = h('div.bd-shop');
        list.forEach(x => {
          const oid = pre + x.id; const owned = !x.price || c.owned.includes(oid); const on = c[key] === x.id;
          const th = h('canvas.bd-th');
          const card = h('div.bd-card' + (on ? '.on' : ''), th, h('b', x.name), x.desc ? h('span.muted', x.desc) : null,
            on ? h('span.chip', 'Usando') : owned ? h('button.btn.sm', { onclick: () => { setB({ [key]: x.id }); draw(); } }, 'Usar') :
              h('button.btn.sm.primary', { disabled: c.coins < x.price, title: c.coins < x.price ? 'Faltam ' + T.fmt(x.price - c.coins) + ' moedas' : '', onclick: () => { const cc = B(); if (cc.coins < x.price) return; setB({ coins: cc.coins - x.price, owned: [...cc.owned, oid], [key]: x.id }); T.toast('Comprado: ' + x.name + '!'); if (st) st.celebrate = performance.now() + 2000; updateFoot(); draw(); } }, h('i.bd-coin'), T.fmt(x.price)));
          grid.appendChild(card);
          requestAnimationFrame(() => { const d = devicePixelRatio || 1; const W = 300, H = 180; th.width = W * d; th.height = H * d; const g = th.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); const cfg2 = Object.assign({}, c, { [key]: x.id }); (SCENE_DRAW[cfg2.scene] || SCENE_DRAW.mesa)(g, W, H, 1000); drawBuddy(g, W, H, 2000, { cfg: cfg2, lastType: 1500, lines: 3, lineLen: .5, pops: [], celebrate: 0 }); });
        });
        box.append(grid, h('div.modal-foot', h('button.btn', { onclick: closeM }, 'Fechar')));
      };
      draw();
    }, { wide: true });
  }

  T.Buddy = {
    open(){ setB({ on: true }); open(); },
    close(){ close(); },
    toggle(){ if (win) { close(); setB({ on: false }); } else T.Buddy.open(); },
    isOpen: () => !!win,
    shop,
    onSprintStart(){ if (B().sprint !== false && !win) open(); },
    onSprintEnd(early){ if (!win) return; if (!early) { const c = B(); setB({ coins: c.coins + 50 }); st.celebrate = performance.now() + 3000; updateFoot(); } if (!B().on) setTimeout(() => { if (!T.Shell?.sprint) close(); }, early ? 1500 : 6000); },
    restore(){ if (B().on && !win) open(); },
    prefs: B, set: setB,
  };
  setTimeout(() => { try { if (B().on) open(); } catch (e) {} }, 1200);
})();
