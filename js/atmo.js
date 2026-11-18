/* Tinteiro — céu de atmosfera atrás do vidro (pintado em baixa resolução, bem leve) */
(function(T){
  const cv = document.getElementById('atmo');
  const ctx = cv.getContext('2d');
  let hue = 268, dark = false, t = Math.random() * 100, raf = 0, last = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blobs = Array.from({ length: 7 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: .35 + Math.random() * .35, dh: [-40, 0, 30, 60, -70, 15, 120][i], sp: .02 + Math.random() * .03, ph: Math.random() * 6 }));
  let grain = null;

  function makeGrain(){
    const g = document.createElement('canvas'); g.width = g.height = 128;
    const gc = g.getContext('2d'); const id = gc.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14; }
    gc.putImageData(id, 0, 0); return g;
  }
  function size(){ const s = 0.25; cv.width = Math.max(64, innerWidth * s | 0); cv.height = Math.max(64, innerHeight * s | 0); }
  function draw(){
    const W = cv.width, H = cv.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (dark) { g.addColorStop(0, `hsl(${hue + 10} 45% 12%)`); g.addColorStop(1, `hsl(${hue - 30} 50% 7%)`); }
    else { g.addColorStop(0, `hsl(${hue - 20} 70% 86%)`); g.addColorStop(1, `hsl(${hue + 25} 55% 80%)`); }
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = dark ? 'screen' : 'soft-light';
    blobs.forEach(b => {
      const x = (b.x + Math.sin(t * b.sp + b.ph) * .12) * W, y = (b.y + Math.cos(t * b.sp * .8 + b.ph) * .1) * H, r = b.r * Math.max(W, H);
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      const hh = hue + b.dh;
      rg.addColorStop(0, dark ? `hsl(${hh} 80% 45% / .55)` : `hsl(${hh} 95% 65% / .9)`);
      rg.addColorStop(1, `hsl(${hh} 80% 50% / 0)`);
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    });
    ctx.globalCompositeOperation = 'source-over';
    if (!grain) grain = makeGrain();
    ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);
  }
  function loop(now){
    raf = requestAnimationFrame(loop);
    if (now - last < 66) return; // ~15 quadros por segundo bastam
    last = now; t += .066; draw();
  }
  T.Atmo = {
    set(h, d){ hue = h; dark = d; draw(); },
    start(){ size(); draw(); if (!reduce && !raf) raf = requestAnimationFrame(loop); },
    pause(){ cancelAnimationFrame(raf); raf = 0; },
  };
  addEventListener('resize', () => { size(); draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) T.Atmo.pause(); else T.Atmo.start(); });
})(window.T);
