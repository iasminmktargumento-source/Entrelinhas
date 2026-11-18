/* Entrelinhas — carimbos de mapa (montanhas, árvores, castelos, navios, monstros…) desenhados à mão no canvas.
   Cada carimbo é desenhado centrado em (0,0), com altura ~ s, na base em y = s/2. */
(() => {
  const CATS = [
    ['montanhas', 'Montanhas'], ['florestas', 'Florestas'], ['lugares', 'Construções'], ['mar', 'Mar'], ['fantasia', 'Fantasia'], ['enfeites', 'Enfeites'],
  ];
  // paletas: tinta (mapa antigo) e cor (atlas)
  function palette(style, tint){
    const ink = style === 'atlas' || style === 'relevo' ? '#2b2620' : '#4a3520';
    const P = style === 'atlas' || style === 'relevo'
      ? { ink, rock: '#9c8f7f', rockD: '#6f6355', snow: '#f6f7fb', tree: '#3f7f45', treeD: '#2c5d33', trunk: '#6b4a2b', wall: '#d9cdb5', roof: '#b4473b', water: '#4f86b8', sand: '#e7cf96', fire: '#e8582f', gold: '#e2b13c', paper: '#f3e7c8', dark: '#3a3340', green: '#5f9e4f', purple: '#7a5ab8' }
      : { ink, rock: '#d8c39a', rockD: '#a98d62', snow: '#f4ecd8', tree: '#a8a06a', treeD: '#7d7548', trunk: '#6b4a2b', wall: '#e8d8b0', roof: '#a5603c', water: '#9fb1a4', sand: '#e2cc98', fire: '#c46a3a', gold: '#c49a4a', paper: '#efe0b9', dark: '#5a4630', green: '#9aa06a', purple: '#8a6a8a' };
    if (tint != null) { const t = (l, s = 55) => `hsl(${tint} ${s}% ${l}%)`; Object.assign(P, { rock: t(62, 30), rockD: t(45, 30), tree: t(42), treeD: t(30), wall: t(80, 30), roof: t(45), water: t(55), green: t(48), purple: t(50), fire: t(52, 70), gold: t(55, 70) }); }
    return P;
  }
  const L = (g, w) => { g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; };
  function poly(g, pts, fill, stroke){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.stroke(); } }
  function peak(g, x, w, hgt, s, P, snow){
    const b = s / 2;
    poly(g, [[x - w / 2, b], [x - w * .08, b - hgt], [x + w / 2, b]], P.rock, null);
    poly(g, [[x - w * .08, b - hgt], [x + w / 2, b], [x + w * .05, b]], P.rockD, null);
    if (snow) poly(g, [[x - w * .08, b - hgt], [x - w * .22, b - hgt * .62], [x - w * .1, b - hgt * .7], [x + w * .02, b - hgt * .58], [x + w * .14, b - hgt * .66]], P.snow, null);
    g.beginPath(); g.moveTo(x - w / 2, b); g.lineTo(x - w * .08, b - hgt); g.lineTo(x + w / 2, b); g.strokeStyle = P.ink; g.stroke();
    g.beginPath(); for (let i = 1; i < 4; i++) { const t = i / 4; g.moveTo(x - w * .08 + w * .3 * t, b - hgt + hgt * t); g.lineTo(x - w * .08 + w * .3 * t + w * .08, b - hgt + hgt * t + hgt * .12); } g.stroke();
  }
  function tree(g, x, y, r, P){ // árvore redonda
    g.fillStyle = P.trunk; g.fillRect(x - r * .12, y - r * .2, r * .24, r * .7);
    g.beginPath(); g.arc(x, y - r * .55, r * .6, 0, 7); g.fillStyle = P.tree; g.fill(); g.strokeStyle = P.ink; g.stroke();
    g.beginPath(); g.arc(x + r * .2, y - r * .45, r * .32, 0, Math.PI); g.fillStyle = P.treeD; g.fill();
  }
  function pine(g, x, y, r, P){
    g.fillStyle = P.trunk; g.fillRect(x - r * .08, y - r * .15, r * .16, r * .4);
    poly(g, [[x, y - r * 1.25], [x - r * .45, y - r * .1], [x + r * .45, y - r * .1]], P.tree, P.ink);
    poly(g, [[x, y - r * 1.25], [x + r * .45, y - r * .1], [x + r * .08, y - r * .1]], P.treeD, null);
  }
  function house(g, x, y, w, P){
    g.fillStyle = P.wall; g.fillRect(x - w / 2, y - w * .6, w, w * .6); g.strokeStyle = P.ink; g.strokeRect(x - w / 2, y - w * .6, w, w * .6);
    poly(g, [[x - w * .62, y - w * .58], [x, y - w * 1.05], [x + w * .62, y - w * .58]], P.roof, P.ink);
    g.fillStyle = P.ink; g.fillRect(x - w * .1, y - w * .3, w * .2, w * .3);
  }
  function tower(g, x, y, w, hgt, P){
    g.fillStyle = P.wall; g.fillRect(x - w / 2, y - hgt, w, hgt); g.strokeStyle = P.ink; g.strokeRect(x - w / 2, y - hgt, w, hgt);
    for (let i = 0; i < 3; i++) { g.fillStyle = P.wall; g.fillRect(x - w / 2 + i * w / 2.5, y - hgt - w * .22, w / 4, w * .22); g.strokeRect(x - w / 2 + i * w / 2.5, y - hgt - w * .22, w / 4, w * .22); }
    g.fillStyle = P.ink; g.fillRect(x - w * .1, y - hgt * .7, w * .2, w * .3);
  }
  const D = {
    // ----- montanhas
    montanha: { cat: 'montanhas', name: 'Montanha', draw(g, s, P){ L(g, s * .035); peak(g, 0, s * 1.1, s * .95, s, P, false); } },
    neve: { cat: 'montanhas', name: 'Pico nevado', draw(g, s, P){ L(g, s * .035); peak(g, 0, s * 1.1, s, s, P, true); } },
    cordilheira: { cat: 'montanhas', name: 'Cordilheira', draw(g, s, P){ L(g, s * .03); peak(g, -s * .45, s * .8, s * .6, s, P, false); peak(g, s * .45, s * .8, s * .7, s, P, false); peak(g, 0, s * .95, s, s, P, true); } },
    colina: { cat: 'montanhas', name: 'Colina', draw(g, s, P){ L(g, s * .035); g.beginPath(); g.moveTo(-s * .6, s * .5); g.quadraticCurveTo(-s * .1, -s * .2, s * .6, s * .5); g.closePath(); g.fillStyle = P.green; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.beginPath(); g.moveTo(-s * .1, s * .2); g.quadraticCurveTo(s * .15, s * .1, s * .3, s * .35); g.stroke(); } },
    vulcao: { cat: 'montanhas', name: 'Vulcão', draw(g, s, P){ L(g, s * .035); poly(g, [[-s * .6, s * .5], [-s * .15, -s * .35], [s * .15, -s * .35], [s * .6, s * .5]], P.rockD, P.ink); poly(g, [[-s * .15, -s * .35], [s * .15, -s * .35], [s * .05, -s * .1], [-s * .05, -s * .05]], P.fire, null); g.beginPath(); g.moveTo(0, -s * .38); g.bezierCurveTo(-s * .2, -s * .55, s * .2, -s * .6, 0, -s * .75); g.strokeStyle = P.ink; g.stroke(); } },
    rochas: { cat: 'montanhas', name: 'Rochas', draw(g, s, P){ L(g, s * .04); [[-.28, .18, .3], [.12, .1, .38], [.38, .3, .22]].forEach(([x, y, r]) => poly(g, [[s * (x - r), s * .5], [s * (x - r * .6), s * (y - r * .2)], [s * x, s * (y - r * .6)], [s * (x + r * .8), s * (y)], [s * (x + r), s * .5]], P.rock, P.ink)); } },
    // ----- florestas
    arvore: { cat: 'florestas', name: 'Árvore', draw(g, s, P){ L(g, s * .04); tree(g, 0, s * .45, s * .9, P); } },
    pinheiro: { cat: 'florestas', name: 'Pinheiro', draw(g, s, P){ L(g, s * .04); pine(g, 0, s * .45, s * .8, P); } },
    floresta: { cat: 'florestas', name: 'Bosque', draw(g, s, P){ L(g, s * .025); [[-.35, .25], [.3, .28], [0, .1], [-.15, .45], [.2, .48], [.45, .5], [-.45, .5]].forEach(([x, y]) => tree(g, s * x, s * y, s * .45, P)); } },
    pinheiral: { cat: 'florestas', name: 'Pinheiral', draw(g, s, P){ L(g, s * .025); [[-.35, .3], [.3, .3], [0, .15], [-.15, .5], [.18, .5], [.45, .5], [-.45, .5]].forEach(([x, y]) => pine(g, s * x, s * y, s * .45, P)); } },
    palmeira: { cat: 'florestas', name: 'Palmeira', draw(g, s, P){ L(g, s * .04); g.beginPath(); g.moveTo(0, s * .5); g.quadraticCurveTo(-s * .08, 0, s * .06, -s * .3); g.strokeStyle = P.trunk; g.lineWidth = s * .07; g.stroke(); L(g, s * .03); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .6; g.beginPath(); g.moveTo(s * .06, -s * .3); g.quadraticCurveTo(s * .06 + Math.cos(a) * s * .3, -s * .3 + Math.sin(a) * s * .25 - s * .08, s * .06 + Math.cos(a) * s * .45, -s * .3 + Math.sin(a) * s * .2 + s * .1); g.strokeStyle = P.tree; g.lineWidth = s * .08; g.stroke(); } } },
    seca: { cat: 'florestas', name: 'Árvore seca', draw(g, s, P){ L(g, s * .05); g.strokeStyle = P.ink; g.beginPath(); g.moveTo(0, s * .5); g.lineTo(0, -s * .1); g.lineTo(-s * .25, -s * .4); g.moveTo(0, -s * .1); g.lineTo(s * .22, -s * .35); g.moveTo(0, s * .15); g.lineTo(s * .2, -s * .02); g.moveTo(-s * .12, -s * .26); g.lineTo(-s * .1, -s * .45); g.stroke(); } },
    cogumelos: { cat: 'florestas', name: 'Cogumelos gigantes', draw(g, s, P){ L(g, s * .03); [[-.25, .35, .3], [.2, .25, .4]].forEach(([x, y, r]) => { g.fillStyle = P.paper; g.fillRect(s * x - s * r * .15, s * (y - r * .5), s * r * .3, s * (.5 - y + r * .5)); g.strokeStyle = P.ink; g.strokeRect(s * x - s * r * .15, s * (y - r * .5), s * r * .3, s * (.5 - y + r * .5)); g.beginPath(); g.arc(s * x, s * (y - r * .5), s * r * .6, Math.PI, 0); g.closePath(); g.fillStyle = P.roof; g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(s * x - s * r * .2, s * (y - r * .75), s * r * .08, 0, 7); g.fill(); }); } },
    // ----- construções
    castelo: { cat: 'lugares', name: 'Castelo', draw(g, s, P){ L(g, s * .03); tower(g, -s * .32, s * .5, s * .22, s * .65, P); tower(g, s * .32, s * .5, s * .22, s * .65, P); g.fillStyle = P.wall; g.fillRect(-s * .22, s * .1, s * .44, s * .4); g.strokeStyle = P.ink; g.strokeRect(-s * .22, s * .1, s * .44, s * .4); tower(g, 0, s * .2, s * .26, s * .55, P); poly(g, [[-s * .16, -s * .38], [0, -s * .62], [s * .16, -s * .38]], P.roof, P.ink); g.fillStyle = P.ink; g.beginPath(); g.arc(0, s * .42, s * .08, Math.PI, 0); g.lineTo(s * .08, s * .5); g.lineTo(-s * .08, s * .5); g.fill(); g.beginPath(); g.moveTo(0, -s * .62); g.lineTo(0, -s * .78); g.stroke(); poly(g, [[0, -s * .78], [s * .14, -s * .73], [0, -s * .68]], P.roof, null); } },
    torre: { cat: 'lugares', name: 'Torre', draw(g, s, P){ L(g, s * .035); tower(g, 0, s * .5, s * .3, s * .8, P); poly(g, [[-s * .2, -s * .3], [0, -s * .58], [s * .2, -s * .3]], P.roof, P.ink); } },
    vila: { cat: 'lugares', name: 'Vila', draw(g, s, P){ L(g, s * .03); house(g, -s * .3, s * .3, s * .3, P); house(g, s * .28, s * .35, s * .32, P); house(g, 0, s * .5, s * .36, P); } },
    cidade: { cat: 'lugares', name: 'Cidade murada', draw(g, s, P){ L(g, s * .025); g.beginPath(); g.ellipse(0, s * .28, s * .6, s * .24, 0, 0, 7); g.fillStyle = P.paper; g.fill(); g.strokeStyle = P.ink; g.lineWidth = s * .05; g.stroke(); L(g, s * .025); house(g, -s * .3, s * .3, s * .2, P); house(g, s * .3, s * .32, s * .2, P); house(g, -s * .05, s * .4, s * .22, P); tower(g, s * .08, s * .18, s * .16, s * .5, P); poly(g, [[-s * .02, -s * .32], [s * .08, -s * .48], [s * .18, -s * .32]], P.roof, P.ink); } },
    ruina: { cat: 'lugares', name: 'Ruínas', draw(g, s, P){ L(g, s * .035); [[-.35, .55], [-.12, .8], [.12, .4], [.35, .65]].forEach(([x, hh]) => { g.fillStyle = P.wall; g.fillRect(s * x - s * .07, s * .5 - s * hh, s * .14, s * hh); g.strokeStyle = P.ink; g.strokeRect(s * x - s * .07, s * .5 - s * hh, s * .14, s * hh); }); g.fillStyle = P.wall; g.fillRect(-s * .42, s * .02 - s * .33, s * .44, s * .08); g.strokeRect(-s * .42, s * .02 - s * .33, s * .44, s * .08); poly(g, [[-s * .5, s * .5], [-s * .3, s * .42], [s * .2, s * .46], [s * .5, s * .5]], P.rockD, P.ink); } },
    templo: { cat: 'lugares', name: 'Templo', draw(g, s, P){ L(g, s * .03); poly(g, [[-s * .5, -s * .1], [0, -s * .45], [s * .5, -s * .1]], P.roof, P.ink); g.fillStyle = P.wall; g.fillRect(-s * .45, -s * .1, s * .9, s * .08); g.strokeStyle = P.ink; g.strokeRect(-s * .45, -s * .1, s * .9, s * .08); for (let i = 0; i < 5; i++) { const x = -s * .38 + i * s * .19; g.fillStyle = P.wall; g.fillRect(x - s * .04, -s * .02, s * .08, s * .44); g.strokeRect(x - s * .04, -s * .02, s * .08, s * .44); } g.fillStyle = P.wall; g.fillRect(-s * .52, s * .42, s * 1.04, s * .08); g.strokeRect(-s * .52, s * .42, s * 1.04, s * .08); } },
    farol: { cat: 'lugares', name: 'Farol', draw(g, s, P){ L(g, s * .035); poly(g, [[-s * .16, s * .5], [-s * .1, -s * .25], [s * .1, -s * .25], [s * .16, s * .5]], '#f3efe6', P.ink); for (let i = 0; i < 3; i++) { g.fillStyle = P.roof; const y = s * .3 - i * s * .22; g.fillRect(-s * .14 + i * .01 * s, y, s * .28 - i * .02 * s, s * .08); } g.fillStyle = P.gold; g.fillRect(-s * .12, -s * .4, s * .24, s * .15); g.strokeRect(-s * .12, -s * .4, s * .24, s * .15); poly(g, [[-s * .15, -s * .4], [0, -s * .52], [s * .15, -s * .4]], P.roof, P.ink); g.strokeStyle = P.gold; g.lineWidth = s * .02; g.beginPath(); g.moveTo(s * .15, -s * .33); g.lineTo(s * .5, -s * .45); g.moveTo(s * .15, -s * .3); g.lineTo(s * .5, -s * .2); g.stroke(); } },
    moinho: { cat: 'lugares', name: 'Moinho', draw(g, s, P){ L(g, s * .03); poly(g, [[-s * .16, s * .5], [-s * .1, -s * .15], [s * .1, -s * .15], [s * .16, s * .5]], P.wall, P.ink); poly(g, [[-s * .14, -s * .15], [0, -s * .3], [s * .14, -s * .15]], P.roof, P.ink); for (let i = 0; i < 4; i++) { g.save(); g.translate(0, -s * .15); g.rotate(i * Math.PI / 2 + .4); g.fillStyle = P.paper; g.fillRect(-s * .04, -s * .45, s * .08, s * .4); g.strokeStyle = P.ink; g.strokeRect(-s * .04, -s * .45, s * .08, s * .4); g.restore(); } } },
    acampamento: { cat: 'lugares', name: 'Acampamento', draw(g, s, P){ L(g, s * .035); poly(g, [[-s * .45, s * .45], [-s * .15, -s * .1], [s * .15, s * .45]], P.roof, P.ink); poly(g, [[0, s * .45], [s * .25, s * .05], [s * .5, s * .45]], P.paper, P.ink); g.strokeStyle = P.ink; g.beginPath(); g.moveTo(-s * .15, -s * .1); g.lineTo(-s * .15, -s * .25); g.stroke(); poly(g, [[-s * .15, -s * .25], [-s * .02, -s * .2], [-s * .15, -s * .15]], P.fire, null); } },
    caverna: { cat: 'lugares', name: 'Caverna', draw(g, s, P){ L(g, s * .035); g.beginPath(); g.moveTo(-s * .55, s * .5); g.quadraticCurveTo(-s * .4, -s * .3, 0, -s * .35); g.quadraticCurveTo(s * .45, -s * .3, s * .55, s * .5); g.closePath(); g.fillStyle = P.rock; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.beginPath(); g.moveTo(-s * .2, s * .5); g.quadraticCurveTo(-s * .18, s * .02, 0, 0); g.quadraticCurveTo(s * .18, s * .02, s * .2, s * .5); g.fillStyle = P.dark; g.fill(); } },
    ponte: { cat: 'lugares', name: 'Ponte', draw(g, s, P){ L(g, s * .035); g.beginPath(); g.moveTo(-s * .6, s * .1); g.quadraticCurveTo(0, -s * .25, s * .6, s * .1); g.lineTo(s * .6, s * .25); g.quadraticCurveTo(0, -s * .1, -s * .6, s * .25); g.closePath(); g.fillStyle = P.wall; g.fill(); g.strokeStyle = P.ink; g.stroke(); for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * s * .2, s * .07 - Math.abs(i) * -.02 * s - s * .1 + (Math.abs(i) * s * .05)); g.lineTo(i * s * .2, s * .45); g.stroke(); } } },
    // ----- mar
    navio: { cat: 'mar', name: 'Navio', draw(g, s, P){ L(g, s * .03); g.beginPath(); g.moveTo(-s * .5, s * .15); g.lineTo(s * .5, s * .15); g.lineTo(s * .35, s * .38); g.lineTo(-s * .38, s * .38); g.closePath(); g.fillStyle = P.trunk; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.beginPath(); g.moveTo(0, s * .15); g.lineTo(0, -s * .5); g.moveTo(-s * .28, s * .15); g.lineTo(-s * .28, -s * .25); g.stroke(); poly(g, [[s * .02, -s * .45], [s * .35, -s * .1], [s * .02, s * .08]], P.paper, P.ink); poly(g, [[-s * .26, -s * .22], [-s * .02, -s * .02], [-s * .26, s * .1]], P.paper, P.ink); poly(g, [[0, -s * .5], [s * .14, -s * .45], [0, -s * .4]], P.roof, null); g.beginPath(); for (let x = -s * .6; x < s * .6; x += s * .2) { g.moveTo(x, s * .46); g.quadraticCurveTo(x + s * .05, s * .41, x + s * .1, s * .46); } g.stroke(); } },
    ondas: { cat: 'mar', name: 'Ondas', draw(g, s, P){ L(g, s * .045); g.strokeStyle = P.ink; for (let r = 0; r < 3; r++) { g.beginPath(); const y = -s * .2 + r * s * .25, x0 = -s * .5 + (r % 2) * s * .15; for (let x = x0; x < s * .4; x += s * .25) { g.moveTo(x, y); g.quadraticCurveTo(x + s * .06, y - s * .1, x + s * .14, y); g.quadraticCurveTo(x + s * .18, y + s * .03, x + s * .22, y - s * .02); } g.stroke(); } } },
    baleia: { cat: 'mar', name: 'Baleia', draw(g, s, P){ L(g, s * .03); g.beginPath(); g.moveTo(-s * .55, s * .1); g.quadraticCurveTo(-s * .4, -s * .3, s * .15, -s * .2); g.quadraticCurveTo(s * .45, -s * .12, s * .4, s * .12); g.quadraticCurveTo(0, s * .3, -s * .55, s * .1); g.fillStyle = P.water; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.beginPath(); g.moveTo(s * .38, s * .05); g.lineTo(s * .62, -s * .18); g.lineTo(s * .58, s * .08); g.lineTo(s * .62, s * .25); g.closePath(); g.fillStyle = P.water; g.fill(); g.stroke(); g.fillStyle = P.ink; g.beginPath(); g.arc(-s * .35, -s * .02, s * .03, 0, 7); g.fill(); g.beginPath(); g.moveTo(-s * .25, -s * .25); g.quadraticCurveTo(-s * .3, -s * .45, -s * .4, -s * .5); g.moveTo(-s * .25, -s * .25); g.quadraticCurveTo(-s * .2, -s * .45, -s * .1, -s * .5); g.stroke(); } },
    serpente: { cat: 'mar', name: 'Serpente marinha', draw(g, s, P){ L(g, s * .03); g.fillStyle = P.green; g.strokeStyle = P.ink; [[-.35, .14], [.05, .16], [.38, .1]].forEach(([x, r]) => { g.beginPath(); g.arc(s * x, s * .3, s * r, Math.PI, 0); g.fill(); g.stroke(); }); g.beginPath(); g.moveTo(-s * .52, s * .3); g.quadraticCurveTo(-s * .6, -s * .2, -s * .4, -s * .3); g.lineTo(-s * .25, -s * .2); g.quadraticCurveTo(-s * .42, -s * .1, -s * .38, s * .3); g.fill(); g.stroke(); g.fillStyle = P.ink; g.beginPath(); g.arc(-s * .4, -s * .22, s * .025, 0, 7); g.fill(); g.beginPath(); for (let x = -s * .6; x < s * .6; x += s * .2) { g.moveTo(x, s * .32); g.quadraticCurveTo(x + s * .05, s * .27, x + s * .1, s * .32); } g.stroke(); } },
    ilhota: { cat: 'mar', name: 'Ilhota', draw(g, s, P){ L(g, s * .03); g.beginPath(); g.ellipse(0, s * .3, s * .5, s * .16, 0, 0, 7); g.fillStyle = P.sand; g.fill(); g.strokeStyle = P.ink; g.stroke(); tree(g, -s * .12, s * .3, s * .4, P); tree(g, s * .15, s * .32, s * .32, P); } },
    // ----- fantasia
    dragao: { cat: 'fantasia', name: 'Dragão', draw(g, s, P){ L(g, s * .03); g.strokeStyle = P.ink; g.fillStyle = P.roof; g.beginPath(); g.moveTo(-s * .05, s * .05); g.lineTo(-s * .35, -s * .45); g.lineTo(-s * .2, -s * .1); g.lineTo(-s * .5, -s * .2); g.lineTo(-s * .15, s * .1); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.ellipse(0, s * .12, s * .3, s * .1, -.1, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(s * .25, s * .05); g.quadraticCurveTo(s * .4, -s * .2, s * .45, -s * .25); g.lineTo(s * .58, -s * .2); g.lineTo(s * .46, -s * .14); g.quadraticCurveTo(s * .38, 0, s * .28, s * .14); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-s * .28, s * .15); g.quadraticCurveTo(-s * .5, s * .35, -s * .6, s * .2); g.stroke(); g.fillStyle = P.ink; g.beginPath(); g.arc(s * .48, -s * .21, s * .02, 0, 7); g.fill(); } },
    cristal: { cat: 'fantasia', name: 'Cristais', draw(g, s, P){ L(g, s * .03); [[-.22, .55, -.25], [0, .9, 0], [.22, .6, .25]].forEach(([x, hh, a]) => { g.save(); g.translate(s * x, s * .5); g.rotate(a); poly(g, [[-s * .09, 0], [-s * .09, -s * hh * .75], [0, -s * hh], [s * .09, -s * hh * .75], [s * .09, 0]], P.purple, P.ink); poly(g, [[0, -s * hh], [s * .09, -s * hh * .75], [s * .09, 0], [0, 0]], 'rgba(255,255,255,.25)', null); g.restore(); }); } },
    portal: { cat: 'fantasia', name: 'Portal', draw(g, s, P){ L(g, s * .04); g.beginPath(); g.ellipse(0, 0, s * .32, s * .45, 0, 0, 7); g.fillStyle = P.purple; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = s * .02; for (let i = 1; i < 4; i++) { g.beginPath(); g.ellipse(0, 0, s * .32 * i / 4, s * .45 * i / 4, i, 0, 5); g.stroke(); } [-1, 1].forEach(d => { g.fillStyle = P.rock; g.fillRect(d * s * .4 - s * .06, -s * .5, s * .12, s); g.strokeStyle = P.ink; g.lineWidth = s * .03; g.strokeRect(d * s * .4 - s * .06, -s * .5, s * .12, s); }); } },
    caveira: { cat: 'fantasia', name: 'Perigo (caveira)', draw(g, s, P){ L(g, s * .035); g.beginPath(); g.arc(0, -s * .08, s * .3, Math.PI * .85, Math.PI * .15); g.lineTo(s * .16, s * .3); g.lineTo(-s * .16, s * .3); g.closePath(); g.fillStyle = P.paper; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.fillStyle = P.ink; [-1, 1].forEach(d => { g.beginPath(); g.arc(d * s * .12, -s * .06, s * .08, 0, 7); g.fill(); }); g.beginPath(); g.moveTo(0, s * .04); g.lineTo(-s * .04, s * .13); g.lineTo(s * .04, s * .13); g.fill(); g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(i * s * .07, s * .2); g.lineTo(i * s * .07, s * .3); } g.stroke(); } },
    olho: { cat: 'fantasia', name: 'Olho que tudo vê', draw(g, s, P){ L(g, s * .035); g.beginPath(); g.moveTo(-s * .5, 0); g.quadraticCurveTo(0, -s * .45, s * .5, 0); g.quadraticCurveTo(0, s * .45, -s * .5, 0); g.fillStyle = P.paper; g.fill(); g.strokeStyle = P.ink; g.stroke(); g.beginPath(); g.arc(0, 0, s * .16, 0, 7); g.fillStyle = P.fire; g.fill(); g.stroke(); g.fillStyle = P.ink; g.beginPath(); g.arc(0, 0, s * .06, 0, 7); g.fill(); } },
    anciao: { cat: 'fantasia', name: 'Árvore anciã', draw(g, s, P){ L(g, s * .035); g.fillStyle = P.trunk; g.beginPath(); g.moveTo(-s * .12, s * .5); g.quadraticCurveTo(-s * .05, 0, -s * .2, -s * .15); g.lineTo(s * .2, -s * .15); g.quadraticCurveTo(s * .05, 0, s * .12, s * .5); g.fill(); g.strokeStyle = P.ink; g.stroke(); [[-.25, -.3, .25], [.22, -.32, .26], [0, -.48, .3]].forEach(([x, y, r]) => { g.beginPath(); g.arc(s * x, s * y, s * r, 0, 7); g.fillStyle = P.purple; g.fill(); g.stroke(); }); for (let i = 0; i < 5; i++) { g.fillStyle = '#fff6a8'; g.beginPath(); g.arc(s * (-.3 + i * .15), s * (-.35 + (i % 2) * .15), s * .025, 0, 7); g.fill(); } } },
    // ----- enfeites
    rosa: { cat: 'enfeites', name: 'Rosa dos ventos', draw(g, s, P){ L(g, s * .02); const r = s * .48; g.strokeStyle = P.ink; g.beginPath(); g.arc(0, 0, r * .62, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, r * .7, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, big = i % 2 === 0, R = big ? r : r * .6, w = big ? r * .13 : r * .09; g.save(); g.rotate(a); poly(g, [[0, -R], [w, 0], [0, 0]], i === 0 ? P.roof : P.ink, P.ink); poly(g, [[0, -R], [-w, 0], [0, 0]], P.paper, P.ink); g.restore(); } g.fillStyle = P.ink; g.font = `700 ${s * .14}px serif`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText('N', 0, -r - s * .01); } },
    estrela: { cat: 'enfeites', name: 'Estrela', draw(g, s, P){ L(g, s * .03); const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, R = i % 2 ? s * .2 : s * .48; pts.push([Math.cos(a) * R, Math.sin(a) * R]); } poly(g, pts, P.gold, P.ink); } },
    bandeira: { cat: 'enfeites', name: 'Faixa para nome', draw(g, s, P){ L(g, s * .025); g.fillStyle = P.paper; g.strokeStyle = P.ink; poly(g, [[-s * .75, -s * .08], [-s * .9, s * .08], [-s * .75, s * .24], [-s * .55, s * .24], [-s * .55, -s * .08]], P.rockD, P.ink); poly(g, [[s * .75, -s * .08], [s * .9, s * .08], [s * .75, s * .24], [s * .55, s * .24], [s * .55, -s * .08]], P.rockD, P.ink); g.beginPath(); g.moveTo(-s * .62, -s * .2); g.quadraticCurveTo(0, -s * .3, s * .62, -s * .2); g.lineTo(s * .62, s * .12); g.quadraticCurveTo(0, s * .02, -s * .62, s * .12); g.closePath(); g.fill(); g.stroke(); } },
    escala: { cat: 'enfeites', name: 'Escala', draw(g, s, P){ L(g, s * .02); for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? P.paper : P.ink; g.fillRect(-s * .6 + i * s * .3, -s * .04, s * .3, s * .08); } g.strokeStyle = P.ink; g.strokeRect(-s * .6, -s * .04, s * 1.2, s * .08); g.fillStyle = P.ink; g.font = `600 ${s * .1}px serif`; g.textAlign = 'center'; g.textBaseline = 'top'; ['0', '50', '100', '150', '200 léguas'].forEach((t, i) => g.fillText(t, -s * .6 + i * s * .3, s * .08)); } },
    cartela: { cat: 'enfeites', name: 'Cartela decorada', draw(g, s, P){ L(g, s * .025); g.fillStyle = P.paper; g.strokeStyle = P.ink; g.beginPath(); const w = s * .8, hh = s * .4; g.moveTo(-w, -hh + s * .1); g.quadraticCurveTo(-w, -hh, -w + s * .1, -hh); g.lineTo(w - s * .1, -hh); g.quadraticCurveTo(w, -hh, w, -hh + s * .1); g.lineTo(w, hh - s * .1); g.quadraticCurveTo(w, hh, w - s * .1, hh); g.lineTo(-w + s * .1, hh); g.quadraticCurveTo(-w, hh, -w, hh - s * .1); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.rect(-w + s * .06, -hh + s * .06, (w - s * .06) * 2, (hh - s * .06) * 2); g.stroke(); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { g.beginPath(); g.arc(a * (w - s * .06), b * (hh - s * .06), s * .05, 0, 7); g.fillStyle = P.roof; g.fill(); g.stroke(); }); } },
  };
  const LIST = Object.entries(D).map(([k, v]) => Object.assign({ k }, v));
  // grandes demais para ficar ao lado de outros iguais quando espalhados
  T.MapStamps = {
    CATS, LIST, get: (k) => D[k],
    draw(g, st, x, y, sz, style, sel){
      const d = D[st.k]; if (!d) return;
      g.save(); g.translate(x, y); g.rotate((st.r || 0) * Math.PI / 180); if (st.f) g.scale(-1, 1);
      g.globalAlpha = st.o == null ? 1 : st.o;
      try { d.draw(g, sz, palette(style, st.t)); } catch (e) {}
      g.globalAlpha = 1;
      if (sel) { g.strokeStyle = '#5b4fd8'; g.setLineDash([4, 3]); g.lineWidth = 1.5; g.strokeRect(-sz * .62, -sz * .62, sz * 1.24, sz * 1.24); g.setLineDash([]); }
      g.restore();
    },
    thumb(k, style, px = 44){
      const c = document.createElement('canvas'); const d = Math.min(2, devicePixelRatio || 1); c.width = px * d; c.height = px * d; c.style.width = c.style.height = px + 'px';
      const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); T.MapStamps.draw(g, { k }, px / 2, px / 2, px * .72, style); return c;
    },
  };

  // texturas de papel para pôr por cima do mapa (geradas uma vez)
  const TEX = {};
  T.MapStamps.texture = (kind) => {
    if (TEX[kind]) return TEX[kind];
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const img = g.createImageData(256, 256); const d = img.data;
    let s = kind === 'tecido' ? 7 : kind === 'papel' ? 3 : 11;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4; let v;
      if (kind === 'tecido') v = 128 + ((x % 4 < 2) ^ (y % 4 < 2) ? 18 : -18) + (rnd() - .5) * 30;
      else if (kind === 'papel') v = 128 + (rnd() - .5) * 46;
      else v = 128 + (rnd() - .5) * 26 + Math.sin(x / 9 + Math.sin(y / 23) * 2) * 10 + Math.sin(y / 31) * 8;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return (TEX[kind] = c);
  };
})();
