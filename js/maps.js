/* Tinteiro — mapas: terreno esculpido, mapas de cidade por imagem, pins, zonas, caminhos, nomes e trilhas das jornadas */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const SEA = .45;

  /* ================= ruído ================= */
  function hash(ix, iy, seed){ let n = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041); n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
  function vnoise(x, y, seed){
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed), c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }
  function fbm(x, y, seed, oct = 5){ let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f, seed + i * 17); n += a; a *= .5; f *= 2.03; } return s / n; }
  function ridge(x, y, seed, oct = 4){ let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { let v = 1 - Math.abs(vnoise(x * f, y * f, seed + i * 31) * 2 - 1); v *= v; s += a * v; n += a; a *= .5; f *= 2.1; } return s / n; }

  /* ================= biomas, estilos, ícones ================= */
  const BIOMES = [
    { id: 0, name: 'Automático' },
    { id: 1, name: 'Planície', c: [143, 172, 92] },
    { id: 2, name: 'Floresta', c: [76, 116, 56], sym: 'tree' },
    { id: 3, name: 'Selva', c: [44, 100, 50], sym: 'palm' },
    { id: 4, name: 'Savana', c: [186, 168, 92], sym: 'grass' },
    { id: 5, name: 'Deserto', c: [224, 196, 136], sym: 'dune' },
    { id: 6, name: 'Tundra', c: [158, 164, 138] },
    { id: 7, name: 'Neve', c: [238, 241, 245], sym: 'mount' },
    { id: 8, name: 'Pântano', c: [94, 112, 80], sym: 'marsh' },
    { id: 9, name: 'Montanha', c: [136, 126, 116], sym: 'mount' },
    { id: 10, name: 'Vulcânico', c: [72, 58, 56], sym: 'volcano' },
    { id: 11, name: 'Floresta mágica', c: [116, 92, 168], sym: 'tree' },
    { id: 12, name: 'Campos cultivados', c: [182, 176, 96], sym: 'field' },
    { id: 13, name: 'Praia', c: [222, 204, 154] },
  ];
  const STYLES = { atlas: 'Atlas colorido', antigo: 'Mapa antigo', relevo: 'Relevo realista' };
  const PATH_TYPES = {
    rio: { name: 'Rio', icon: 'river' }, estrada: { name: 'Estrada', icon: 'route' }, rua: { name: 'Rua', icon: 'route' },
    muralha: { name: 'Muralha', icon: 'shield' }, fronteira: { name: 'Fronteira', icon: 'zone' }, rota: { name: 'Rota marítima', icon: 'route' },
  };
  const LABEL_KINDS = { reino: 'Reino ou país', regiao: 'Região', cidade: 'Cidade ou lugar', mar: 'Mar, lago ou rio', livre: 'Texto livre' };
  const PIN_ICONS = {
    castelo: 'M4 20V9l2 1V7l2 1V5l2 1V4h4v2l2-1v3l2-1v3l2-1v11zM10 20v-4a2 2 0 0 1 4 0v4',
    cidade: 'M3 20V10l5-3v13M8 20V5l6-2v17M14 20V9l7 2v9M10 8h2M10 12h2M17 13h2',
    vila: 'M3 20v-7l5-4 5 4v7zM13 20v-5l4-3 4 3v5M7 20v-3h2v3',
    torre: 'M8 21V9h8v12M7 9V5h2v2h2V5h2v2h2V5h2v4M11 13h2',
    ruina: 'M4 20h16M6 20V9l2 2V8M12 20v-7l2-2V7l2 3v10M18 20v-5',
    caverna: 'M3 20c0-8 4-14 9-14s9 6 9 14M9 20c0-4 1-7 3-7s3 3 3 7',
    templo: 'M3 9l9-5 9 5M5 9v9M9 9v9M15 9v9M19 9v9M3 20h18',
    porto: 'M12 4v14M8 8h8M5 13c0 4 3 7 7 7s7-3 7-7M12 4a1.5 1.5 0 1 0 0 .1',
    batalha: 'M4 4l10 10M14 14l3-1 1 3-3 1zM20 4L10 14M10 14l-3-1-1 3 3 1',
    estrela: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
    perigo: 'M12 4l9 16H3zM12 10v4M12 17h.01',
    tesouro: 'M4 10h16v9H4zM4 10a8 4 0 0 1 16 0M12 13v3',
    casa: 'M4 11l8-6 8 6v9H4zM10 20v-5h4v5',
    taverna: 'M6 8h9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM15 10h2a2 2 0 0 1 0 4h-2M6 8c0-2 2-3 4.5-3S15 6 15 8',
    floresta: 'M12 3l5 7h-3l4 6h-5v4h-2v-4H6l4-6H7z',
    portal: 'M7 21V9a5 5 0 0 1 10 0v12M5 21h14M12 9v.01',
    personagem: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  };
  const PIN_NAMES = { castelo: 'Castelo', cidade: 'Cidade', vila: 'Vila', torre: 'Torre', ruina: 'Ruína', caverna: 'Caverna', templo: 'Templo', porto: 'Porto', batalha: 'Batalha', estrela: 'Destaque', perigo: 'Perigo', tesouro: 'Tesouro', casa: 'Casa', taverna: 'Taverna', floresta: 'Bosque', portal: 'Portal', personagem: 'Personagem' };
  const P2D = {}; const path2d = (k) => P2D[k] || (P2D[k] = new Path2D(PIN_ICONS[k] || PIN_ICONS.estrela));

  /* ================= compressão das alturas ================= */
  function b64(u8){ let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s){ const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  async function pack(u8){
    if (!window.CompressionStream) return 'r:' + b64(u8);
    const st = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate'));
    return 'd:' + b64(new Uint8Array(await new Response(st).arrayBuffer()));
  }
  async function unpack(str){
    if (!str) return null; const k = str.slice(0, 2), u8 = unb64(str.slice(2));
    if (k === 'r:') return u8;
    const st = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(st).arrayBuffer());
  }

  /* ================= geração ================= */
  function generate(W, H, type, seed){
    const Hm = new Float32Array(W * H); const AR = W / H;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / H;
      const wx = fbm(nx * 2 * AR + 5, ny * 2, seed + 7, 3) - .5, wy = fbm(nx * 2 * AR, ny * 2 + 9, seed + 9, 3) - .5;
      const px = nx * AR + wx * .4, py = ny + wy * .4;
      const fr = type === 'ilhas' ? 5.2 : 3.1;
      const e = fbm(px * fr, py * fr, seed, type === 'ilhas' ? 4 : 5);
      const r = ridge(px * fr * 1.25, py * fr * 1.25, seed + 101, 4);
      const dx = (nx - .5) * 2, dy = (ny - .5) * 2; const d = Math.sqrt(dx * dx * .8 + dy * dy * 1.2);
      let v;
      if (type === 'ilhas') v = e * .95 + r * .14 - d * .3;
      else if (type === 'pangeia') v = e * .72 + r * .38 * e - d * d * .3;
      else if (type === 'vazio') v = e;
      else v = e * .75 + r * .34 * e - d * d * .55;
      Hm[y * W + x] = v;
    }
    const n = W * H; const so = Float32Array.from(Hm).sort();
    if (type === 'vazio') { for (let i = 0; i < n; i++) Hm[i] = .18 + (Hm[i] - so[0]) / (so[n - 1] - so[0] + 1e-6) * .14; return Hm; }
    const q = so[Math.floor(n * (type === 'ilhas' ? .72 : type === 'pangeia' ? .42 : .57))], mn = so[0], mx = so[n - 1];
    for (let i = 0; i < n; i++) { const v = Hm[i]; Hm[i] = v < q ? SEA * (v - mn) / (q - mn) : SEA + (1 - SEA) * Math.pow((v - q) / (mx - q), 1.2); }
    return Hm;
  }
  function autoBiome(hh, m, ny, sea){
    const e = (hh - sea) / (1 - sea); const lat = Math.abs(ny - .5) * 2;
    if (e > .8) return 7;
    if (e > .6) return 9;
    if (lat > .9) return 7;
    if (lat > .76 || (lat > .62 && e > .3)) return 6;
    if (e < .03) return 13;
    if (m < .38) return lat < .55 ? 5 : 4;
    if (m < .46) return 4;
    if (m > .64) return e < .12 ? 8 : (lat < .3 ? 3 : 2);
    return m > .54 ? 2 : 1;
  }

  /* ================= modelo ================= */
  class MapModel {
    constructor(item){ this.id = item.id; this.pid = item.pid; this.load(item); }
    load(item){
      const m = item.meta || {};
      this.kind = m.kind || 'world'; this.W = m.W || 256; this.H = m.H || 160; this.seed = m.seed || 1;
      this.style = m.style || (this.kind === 'world' ? 'atlas' : 'antigo');
      this.sea = m.sea ?? SEA; this.light = m.light ?? 315; this.symbols = m.symbols !== false; this.clouds = !!m.clouds;
      this.exag = m.exag ?? 1; this.tone = m.tone || 'original';
      this.paths = (m.paths || []).map(x => Object.assign({}, x, { pts: x.pts.map(p => p.slice()) }));
      this.labels = (m.labels || []).map(x => Object.assign({}, x));
      this.pins = (m.pins || []).map(x => Object.assign({}, x));
      this.zones = (m.zones || []).map(x => Object.assign({}, x, { pts: x.pts.map(p => p.slice()) }));
      this.trails = (m.trails || []).map(x => Object.assign({}, x, { pts: x.pts.map(p => Object.assign({}, p)) }));
      this.hide = Object.assign({}, m.hide || {});
      this.stamps = (m.stamps || []).map(x => Object.assign({}, x)); this.frame = m.frame || ''; this.texture = m.texture || ''; this.texStr = m.texStr ?? .35;
      this.img = m.img || null; this.imgAR = m.imgAR || 1.6; this.parent = m.parent || null;
      this.Hm = null; this.B = null;
      this.AR = this.kind === 'world' ? this.W / this.H : this.imgAR;
      this.AW = 1600; this.AH = Math.round(this.AW / this.AR);
    }
    async ready(item){
      if (this.kind !== 'world') return this;
      const m = item.meta || {};
      const n = this.W * this.H;
      const hz = await unpack(m.hz).catch(() => null), bz = await unpack(m.bz).catch(() => null);
      if (hz && hz.length === n * 2) { const u16 = new Uint16Array(hz.buffer, hz.byteOffset, n); this.Hm = new Float32Array(n); for (let i = 0; i < n; i++) this.Hm[i] = u16[i] / 65535; }
      else this.Hm = generate(this.W, this.H, m.gen || 'continente', this.seed);
      this.B = bz && bz.length === n ? new Uint8Array(bz) : new Uint8Array(n);
      return this;
    }
    hAt(gx, gy){ // altura com interpolação, em coordenadas de grade
      const W = this.W, H = this.H; gx = clamp(gx, 0, W - 1.001); gy = clamp(gy, 0, H - 1.001);
      const x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, i = y0 * W + x0, A = this.Hm;
      return lerp(lerp(A[i], A[i + 1], fx), lerp(A[i + W], A[i + W + 1], fx), fy);
    }
    moist(x, y){ return fbm(x / this.W * 3 * this.AR + 50, y / this.H * 3, this.seed + 500, 4); }
    biomeAt(x, y){ const i = y * this.W + x; return this.B[i] || autoBiome(this.Hm[i], this.moist(x, y), y / this.H, this.sea); }
    async serialize(){
      const out = {
        kind: this.kind, W: this.W, H: this.H, seed: this.seed, style: this.style, sea: this.sea, light: this.light, symbols: this.symbols, clouds: this.clouds, exag: this.exag, tone: this.tone,
        paths: this.paths, labels: this.labels, pins: this.pins, zones: this.zones, trails: this.trails, hide: this.hide, stamps: this.stamps, frame: this.frame, texture: this.texture, texStr: this.texStr, img: this.img, imgAR: this.imgAR, parent: this.parent,
      };
      if (this.kind === 'world' && this.Hm) {
        const n = this.W * this.H; const u16 = new Uint16Array(n); for (let i = 0; i < n; i++) u16[i] = Math.round(clamp(this.Hm[i], 0, 1) * 65535);
        out.hz = await pack(new Uint8Array(u16.buffer)); out.bz = await pack(this.B);
      }
      return out;
    }
  }

  /* ================= pintura do terreno ================= */
  const WATER = {
    atlas: { deep: [34, 70, 110], shallow: [96, 150, 184], coast: [70, 92, 110] },
    relevo: { deep: [16, 42, 72], shallow: [46, 104, 134], coast: [0, 0, 0] },
    antigo: { deep: [196, 180, 140], shallow: [218, 204, 166], coast: [86, 64, 40] },
  };
  const PAPER = [234, 217, 178];
  function cellColors(M, flat){
    const W = M.W, H = M.H, A = M.Hm, st = M.style; const C = new Float32Array(W * H * 3); const SH = new Float32Array(W * H);
    const az = M.light * Math.PI / 180; const L = [Math.sin(az) * .7, -Math.cos(az) * .7, .72]; const ll = Math.hypot(...L); L[0] /= ll; L[1] /= ll; L[2] /= ll;
    const K = W * (st === 'relevo' ? 1.25 : 1.1) * M.exag;
    const shadeK = flat ? 0 : st === 'relevo' ? .85 : st === 'antigo' ? .45 : .6;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const xl = x > 0 ? i - 1 : i, xr = x < W - 1 ? i + 1 : i, yu = y > 0 ? i - W : i, yd = y < H - 1 ? i + W : i;
      const gx = (A[xr] - A[xl]) * K * .5, gy = (A[yd] - A[yu]) * K * .5;
      const nl = Math.hypot(gx, gy, 1); const s = ((-gx * L[0] - gy * L[1] + L[2]) / nl) / L[2];
      const sh = 1 + (clamp(s, .2, 1.7) - 1) * shadeK;
      const b = A[i] < M.sea ? 13 : M.biomeAt(x, y);
      let c = BIOMES[b].c;
      const e = clamp((A[i] - M.sea) / (1 - M.sea), 0, 1);
      let r = c[0], g = c[1], bl = c[2];
      if (st === 'relevo') { const k = e * .35; r = lerp(r * .92, 150, k); g = lerp(g * .92, 138, k); bl = lerp(bl * .9, 122, k); if (e > .72 && b !== 5) { const sn = clamp((e - .72) / .12, 0, 1); r = lerp(r, 244, sn); g = lerp(g, 246, sn); bl = lerp(bl, 250, sn); } }
      else if (st === 'antigo') { r = lerp(PAPER[0], r, .28); g = lerp(PAPER[1], g, .28); bl = lerp(PAPER[2], bl, .22); }
      else { r = lerp(r, 236, e * e * .5); g = lerp(g, 230, e * e * .5); bl = lerp(bl, 220, e * e * .5); }
      C[i * 3] = r; C[i * 3 + 1] = g; C[i * 3 + 2] = bl * (st === 'antigo' ? .97 : 1); SH[i] = sh;
    }
    // suaviza a luz um pouco e as bordas entre biomas (desfoque 3x3, separável)
    { const S2 = Float32Array.from(SH); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; SH[i] = S2[i] * .5 + (S2[i - 1] + S2[i + 1] + S2[i - W] + S2[i + W]) * .125; } }
    const T2 = new Float32Array(C.length);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const xl = Math.max(0, x - 1), xr = Math.min(W - 1, x + 1); for (let c = 0; c < 3; c++) T2[(y * W + x) * 3 + c] = (C[(y * W + xl) * 3 + c] + C[(y * W + x) * 3 + c] * 2 + C[(y * W + xr) * 3 + c]) / 4; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const yu = Math.max(0, y - 1), yd = Math.min(H - 1, y + 1); const sh = SH[y * W + x]; for (let c = 0; c < 3; c++) C[(y * W + x) * 3 + c] = (T2[(yu * W + x) * 3 + c] + T2[(y * W + x) * 3 + c] * 2 + T2[(yd * W + x) * 3 + c]) / 4 * sh; }
    return C;
  }
  // desenha a base (sem símbolos) numa ImageData, só na região pedida (em pixels da arte)
  function paintBase(M, img, C, x0, y0, x1, y1){
    const AW = M.AW, AH = M.AH, W = M.W, H = M.H, k = AW / W, A = M.Hm, d = img.data, sea = M.sea, st = M.style; const wc = WATER[st];
    x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0); x1 = Math.min(AW, Math.ceil(x1)); y1 = Math.min(AH, Math.ceil(y1));
    const coastW = .0035;
    for (let py = y0; py < y1; py++) {
      const gy = clamp((py + .5) / k - .5, 0, H - 1.001); const iy = gy | 0, fy = gy - iy;
      for (let px = x0; px < x1; px++) {
        const gx = clamp((px + .5) / k - .5, 0, W - 1.001); const ix = gx | 0, fx = gx - ix;
        const i = iy * W + ix;
        const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        const hh = A[i] * w00 + A[i + 1] * w10 + A[i + W] * w01 + A[i + W + 1] * w11;
        let r, g, b;
        if (hh < sea) {
          const dp = clamp((sea - hh) / sea, 0, 1); const t = Math.sqrt(dp) * 1.25;
          r = lerp(wc.shallow[0], wc.deep[0], clamp(t, 0, 1)); g = lerp(wc.shallow[1], wc.deep[1], clamp(t, 0, 1)); b = lerp(wc.shallow[2], wc.deep[2], clamp(t, 0, 1));
          if (st === 'antigo') { const band = (dp * 26) % 1; if (dp < .2 && band < .14) { const a = (1 - dp / .2) * .55; r = lerp(r, wc.coast[0], a); g = lerp(g, wc.coast[1], a); b = lerp(b, wc.coast[2], a); } }
          else if (dp < .025) { const a = (1 - dp / .025) * .35; r = lerp(r, 210, a); g = lerp(g, 230, a); b = lerp(b, 235, a); }
        } else {
          const j = i * 3, jW = (i + W) * 3;
          r = C[j] * w00 + C[j + 3] * w10 + C[jW] * w01 + C[jW + 3] * w11;
          g = C[j + 1] * w00 + C[j + 4] * w10 + C[jW + 1] * w01 + C[jW + 4] * w11;
          b = C[j + 2] * w00 + C[j + 5] * w10 + C[jW + 2] * w01 + C[jW + 5] * w11;
        }
        if (st !== 'relevo' && Math.abs(hh - sea) < coastW) { const a = (1 - Math.abs(hh - sea) / coastW) * (st === 'antigo' ? .95 : .6); r = lerp(r, wc.coast[0], a); g = lerp(g, wc.coast[1], a); b = lerp(b, wc.coast[2], a); }
        if (st === 'antigo') { const n = hash(px, py, 7) * .07 + .955; r *= n; g *= n; b *= n; }
        else if (hh >= sea) { const n = .955 + .09 * vnoise(px / 7, py / 7, 11) * (.6 + .4 * hash(px, py, 8)); r *= n; g *= n; b *= n; }
        const o = (py * AW + px) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
      }
    }
  }
  // símbolos de mapa: montanhas, árvores, dunas…
  function paintSymbols(M, ctx){
    const AW = M.AW, AH = M.AH, k = AW / M.W, st = M.style; if (st === 'relevo' || !M.symbols) return;
    const ink = st === 'antigo' ? 'rgba(82,60,38,.9)' : 'rgba(40,40,36,.55)';
    const sp = 12; const items = [];
    for (let gy = sp / 2; gy < AH; gy += sp) for (let gx = sp / 2; gx < AW; gx += sp) {
      const jx = gx + (hash(gx, gy, 3) - .5) * sp * .8, jy = gy + (hash(gx, gy, 4) - .5) * sp * .8;
      const cx = jx / k, cy = jy / k; const hh = M.hAt(cx, cy); if (hh < M.sea + .006) continue;
      const e = (hh - M.sea) / (1 - M.sea); const b = M.biomeAt(clamp(Math.round(cx), 0, M.W - 1), clamp(Math.round(cy), 0, M.H - 1));
      const r = hash(gx, gy, 9);
      let type = null;
      if (e > .56 || b === 9 || b === 10) { if (r < (e > .7 ? .6 : .4) || b === 9) type = b === 10 && r < .25 ? 'volcano' : 'mount'; else if (e < .62) continue; }
      else { const sym = BIOMES[b].sym; if (sym === 'tree' && r < .8) type = 'tree'; else if (sym === 'palm' && r < .8) type = 'palm'; else if (sym === 'grass' && r < .25) type = 'grass'; else if (sym === 'dune' && r < .3) type = 'dune'; else if (sym === 'marsh' && r < .4) type = 'marsh'; else if (sym === 'field' && r < .35) type = 'field'; else if (sym === 'mount' && r < .5) type = 'mount'; }
      if (type) items.push({ x: jx, y: jy, type, e, b, r });
    }
    items.sort((a, b) => a.y - b.y);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const it of items) {
      const { x, y } = it;
      if (it.type === 'mount' || it.type === 'volcano') {
        const s = 5 + it.e * 9 + it.r * 3; const hgt = s * (1.05 + it.r * .35);
        ctx.beginPath(); ctx.moveTo(x - s, y + 2); ctx.lineTo(x - s * .15, y - hgt); ctx.lineTo(x + s * .1, y - hgt * .82); ctx.lineTo(x + s, y + 2); ctx.closePath();
        if (st === 'antigo') { ctx.fillStyle = 'rgba(238,224,190,.95)'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); for (let k2 = 1; k2 <= 3; k2++) { const t = k2 / 4; ctx.moveTo(lerp(x - s * .1, x + s, t * .9), lerp(y - hgt * .82, y + 2, t)); ctx.lineTo(lerp(x - s * .1, x + s, t * .9) - s * .25, lerp(y - hgt * .82, y + 2, t) + 1); } ctx.lineWidth = .8; ctx.stroke(); }
        else { const snow = it.e > .7 || it.b === 7;
          ctx.fillStyle = 'rgba(150,140,128,.95)'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(x - s * .15, y - hgt); ctx.lineTo(x + s * .1, y - hgt * .82); ctx.lineTo(x + s, y + 2); ctx.lineTo(x + s * .05, y + 2); ctx.closePath(); ctx.fillStyle = 'rgba(96,88,80,.9)'; ctx.fill();
          if (snow) { ctx.beginPath(); ctx.moveTo(x - s * .45, y - hgt * .55); ctx.lineTo(x - s * .15, y - hgt); ctx.lineTo(x + s * .1, y - hgt * .82); ctx.lineTo(x + s * .35, y - hgt * .5); ctx.lineTo(x, y - hgt * .62); ctx.closePath(); ctx.fillStyle = 'rgba(250,250,252,.95)'; ctx.fill(); }
          ctx.beginPath(); ctx.moveTo(x - s, y + 2); ctx.lineTo(x - s * .15, y - hgt); ctx.lineTo(x + s * .1, y - hgt * .82); ctx.lineTo(x + s, y + 2); ctx.strokeStyle = 'rgba(60,54,48,.55)'; ctx.lineWidth = .8; ctx.stroke(); }
        if (it.type === 'volcano') { ctx.beginPath(); ctx.arc(x - s * .05, y - hgt * .95, 2.2, 0, 7); ctx.fillStyle = st === 'antigo' ? 'rgba(140,50,30,.8)' : 'rgba(220,80,30,.9)'; ctx.fill(); }
      } else if (it.type === 'tree' || it.type === 'palm') {
        const s = 3.2 + it.r * 1.6; const magic = it.b === 11;
        ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y - s); ctx.strokeStyle = st === 'antigo' ? ink : 'rgba(60,44,30,.7)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); if (it.type === 'palm') { ctx.ellipse(x, y - s - 1, s * 1.1, s * .7, 0, 0, 7); } else ctx.arc(x, y - s - 1, s, 0, 7);
        if (st === 'antigo') { ctx.fillStyle = 'rgba(214,200,160,.95)'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = .9; ctx.stroke(); }
        else { ctx.fillStyle = magic ? 'rgba(96,70,150,.95)' : it.type === 'palm' ? 'rgba(34,84,40,.95)' : 'rgba(46,86,40,.95)'; ctx.fill();
          ctx.beginPath(); ctx.arc(x - s * .35, y - s - 1 - s * .35, s * .4, 0, 7); ctx.fillStyle = magic ? 'rgba(180,150,230,.6)' : 'rgba(140,180,100,.45)'; ctx.fill(); }
      } else if (it.type === 'grass') {
        ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x - 3, y - 3); ctx.moveTo(x, y); ctx.lineTo(x, y - 4); ctx.moveTo(x + 2, y); ctx.lineTo(x + 3, y - 3); ctx.strokeStyle = ink; ctx.lineWidth = .8; ctx.stroke();
      } else if (it.type === 'dune') {
        ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.quadraticCurveTo(x - 1, y - 4, x + 5, y); ctx.strokeStyle = st === 'antigo' ? ink : 'rgba(150,110,60,.6)'; ctx.lineWidth = .9; ctx.stroke();
      } else if (it.type === 'marsh') {
        ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x - 2, y - 1); ctx.lineTo(x - 3, y - 4); ctx.moveTo(x + 1, y - 1); ctx.lineTo(x + 1, y - 5); ctx.moveTo(x + 3, y - 1); ctx.lineTo(x + 4.5, y - 4); ctx.strokeStyle = st === 'antigo' ? ink : 'rgba(40,70,60,.6)'; ctx.lineWidth = .8; ctx.stroke();
      } else if (it.type === 'field') {
        ctx.save(); ctx.translate(x, y); ctx.rotate((it.r - .5) * 1.2); ctx.strokeStyle = st === 'antigo' ? ink : 'rgba(120,100,40,.5)'; ctx.lineWidth = .7; ctx.beginPath(); for (let k2 = -2; k2 <= 2; k2++) { ctx.moveTo(-5, k2 * 2); ctx.lineTo(5, k2 * 2); } ctx.stroke(); ctx.restore();
      }
    }
    ctx.restore();
  }
  function paintFrame(M, ctx){ // moldura e vinheta do mapa antigo
    if (M.style !== 'antigo') return;
    const AW = M.AW, AH = M.AH;
    const g = ctx.createRadialGradient(AW / 2, AH / 2, Math.min(AW, AH) * .35, AW / 2, AH / 2, Math.max(AW, AH) * .72);
    g.addColorStop(0, 'rgba(120,80,40,0)'); g.addColorStop(1, 'rgba(110,70,30,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, AW, AH);
    ctx.strokeStyle = 'rgba(82,60,38,.85)'; ctx.lineWidth = 3; ctx.strokeRect(10, 10, AW - 20, AH - 20); ctx.lineWidth = 1; ctx.strokeRect(17, 17, AW - 34, AH - 34);
    rose(ctx, AW - 110, AH - 120, 62, 'rgba(82,60,38,.85)');
  }
  function rose(ctx, x, y, r, ink){
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, 7); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, L = i % 2 ? r * .55 : r; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(r * .1, 0); ctx.lineTo(0, r * .1); ctx.closePath(); i % 2 ? ctx.stroke() : ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(-r * .1, 0); ctx.lineTo(0, r * .1); ctx.closePath(); ctx.stroke(); ctx.restore(); }
    ctx.font = '600 ' + (r * .3) + 'px "IM Fell English SC", serif'; ctx.textAlign = 'center'; ctx.fillText('N', 0, -r - 6);
    ctx.restore();
  }

  /* ================= desenho por cima (pins, zonas, caminhos, nomes, trilhas) ================= */
  function smoothPath(ctx, pts){
    if (pts.length < 2) return; ctx.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 2) { ctx.lineTo(pts[1][0], pts[1][1]); return; }
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
  }
  function spaced(ctx, text, x, y, spacing, mode){ // texto com letras espaçadas, centrado
    const chars = [...text]; const ws = chars.map(c => ctx.measureText(c).width); const total = ws.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let cx = x - total / 2;
    chars.forEach((c, i) => { if (mode === 'stroke') ctx.strokeText(c, cx + ws[i] / 2, y); else ctx.fillText(c, cx + ws[i] / 2, y); cx += ws[i] + spacing; });
    return total;
  }
  function labelStyle(M, L, z){
    const base = (L.size || 1) * z;
    const anti = M.style === 'antigo' || M.kind !== 'world';
    const ink = anti ? '#4a3524' : '#262420';
    switch (L.kind) {
      case 'reino': return { font: `700 ${26 * base}px Cinzel, serif`, sp: 9 * base, up: true, ink, halo: !anti };
      case 'regiao': return { font: `italic ${19 * base}px "IM Fell English", serif`, sp: 5 * base, up: true, ink: anti ? '#5a4330' : '#3d3a33', halo: !anti };
      case 'mar': return { font: `italic ${20 * base}px "IM Fell English", serif`, sp: 6 * base, up: false, ink: anti ? '#3f5368' : '#1f3f5f', halo: false };
      case 'cidade': return { font: `${15 * base}px "IM Fell English", serif`, sp: .5 * base, up: false, ink, halo: true };
      default: return { font: `${16 * base}px "IM Fell English", serif`, sp: 1 * base, up: false, ink, halo: true };
    }
  }

  /* ================= vista de lista de mapas ================= */
  const thumbs = new Map();
  T.Maps = {
    BIOMES, PIN_ICONS, generate, MapModel,
    list(pid){ return S().all(pid).filter(i => i.type === 'map').sort(S().byOrder); },
    pinsFor(pid, pageId){ const out = []; T.Maps.list(pid).forEach(m => (m.meta?.pins || []).forEach(p => { if (p.page === pageId) out.push({ map: m, pin: p }); })); return out; },
    async create(pid, opts){
      const kind = opts.kind || 'world';
      const meta = { kind, gen: opts.gen || 'continente', seed: (Math.random() * 1e6) | 0, W: opts.big ? 320 : 256, H: opts.big ? 200 : 160, style: opts.style || (kind === 'world' ? 'atlas' : 'antigo'), parent: opts.parent || null };
      if (kind === 'image') { meta.img = opts.img; meta.imgAR = opts.imgAR || 1.6; }
      if (kind === 'blank') { meta.imgAR = opts.imgAR || 1.5; }
      if (kind === 'world') {
        const M = new MapModel({ id: 'tmp', pid, meta }); M.Hm = generate(meta.W, meta.H, meta.gen, meta.seed); M.B = new Uint8Array(meta.W * meta.H);
        Object.assign(meta, await M.serialize());
      }
      const it = S().create({ pid, type: 'map', area: 'world', title: opts.title || 'Novo mapa', meta });
      T.emit('tree-changed'); return it;
    },
    newDialog(pid, after, parent){
      T.modal((box, close) => {
        let pick = 'continente';
        const name = h('input.input', { placeholder: 'Nome do mapa (ex.: Continente de Aëlir)', value: '' });
        const opts = [
          ['continente', 'Continente', 'Terra gerada com montanhas, florestas e costa. Você esculpe por cima.', 'mountain'],
          ['ilhas', 'Arquipélago', 'Várias ilhas espalhadas pelo mar.', 'globe'],
          ['pangeia', 'Supercontinente', 'Uma massa de terra enorme com mares internos.', 'map'],
          ['vazio', 'Oceano vazio', 'Comece do zero e erga a terra com o pincel.', 'brush'],
          ['image', 'A partir de uma imagem', 'Envie a ilustração de uma cidade, região ou planta de castelo.', 'image'],
          ['blank', 'Folha de pergaminho', 'Folha em branco para desenhar uma cidade com ruas, muralhas e bairros.', 'feather'],
        ];
        const grid = h('div.mp-new-grid');
        const draw = () => { grid.innerHTML = ''; opts.forEach(([k, n, d, ic]) => grid.appendChild(h('button.mp-new-opt' + (pick === k ? '.on' : ''), { type: 'button', onclick: () => { pick = k; draw(); } }, icon(ic), h('b', n), h('span', d)))); };
        draw();
        const big = h('label.mp-chk', h('input', { type: 'checkbox' }), 'Mapa maior (mais detalhe, arquivo mais pesado)');
        const go = async () => {
          const title = name.value.trim() || 'Novo mapa';
          let it;
          if (pick === 'image') {
            const f = await T.pickFile('image/*'); if (!f) return;
            T.toast('Enviando a imagem…');
            const ref = await T.Assets.upload(f); if (!ref) return;
            const url = await T.Assets.resolve(ref); const ar = await new Promise(r => { const im = new Image(); im.onload = () => r(im.naturalWidth / im.naturalHeight || 1.6); im.onerror = () => r(1.6); im.src = url; });
            it = await T.Maps.create(pid, { kind: 'image', img: ref, imgAR: ar, title, parent });
          } else if (pick === 'blank') it = await T.Maps.create(pid, { kind: 'blank', title, parent });
          else it = await T.Maps.create(pid, { kind: 'world', gen: pick, big: big.querySelector('input').checked, title, parent });
          close(); after ? after(it) : T.Shell.open({ kind: 'map', ref: it.id });
        };
        box.append(h('h2', 'Novo mapa'), h('p.sub', 'Escolha como começar. Tudo pode ser editado depois.'), name, grid, big,
          h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Cancelar'), h('button.btn.primary', { onclick: go }, 'Criar mapa')));
      }, { wide: true });
    },
    async thumb(item){
      const key = item.id + ':' + (item.updated || 0); if (thumbs.has(key)) return thumbs.get(key);
      const M = new MapModel(item); await M.ready(item);
      const cv = document.createElement('canvas'); cv.width = 320; cv.height = Math.round(320 / M.AR); const c = cv.getContext('2d');
      if (M.kind === 'world') {
        const small = Object.create(M); small.AW = 320; small.AH = cv.height;
        const img = c.createImageData(small.AW, small.AH); paintBase(small, img, cellColors(M), 0, 0, small.AW, small.AH); c.putImageData(img, 0, 0);
      } else if (M.kind === 'image') { const u = await T.Assets.resolve(M.img); await new Promise(r => { const im = new Image(); im.onload = () => { c.drawImage(im, 0, 0, cv.width, cv.height); r(); }; im.onerror = r; im.src = u; }); }
      else { c.fillStyle = '#ead9b2'; c.fillRect(0, 0, cv.width, cv.height); }
      const k = cv.width;
      (M.zones || []).forEach(z => { c.beginPath(); z.pts.forEach((p, i) => i ? c.lineTo(p[0] * k, p[1] * cv.height) : c.moveTo(p[0] * k, p[1] * cv.height)); c.closePath(); c.fillStyle = `hsla(${z.hue || 0},70%,50%,.2)`; c.fill(); });
      (M.paths || []).forEach(p => { c.beginPath(); smoothPath(c, p.pts.map(q => [q[0] * k, q[1] * cv.height])); c.strokeStyle = p.type === 'rio' ? '#3f6f9f' : '#7a5a3a'; c.lineWidth = 1.2; c.stroke(); });
      (M.pins || []).forEach(p => { c.beginPath(); c.arc(p.x * k, p.y * cv.height, 3, 0, 7); c.fillStyle = `hsl(${p.hue ?? 350} 70% 50%)`; c.fill(); });
      const url = cv.toDataURL('image/jpeg', .8); thumbs.set(key, url); return url;
    },
  };

  T.Views.maps = {
    icon: 'map', title: () => 'Mapas',
    mount(root, tab, ctx){
      const pid = ctx.pid;
      const v = h('div.view.view-pad.mp-gal'); root.appendChild(v);
      function render(){
        const maps = T.Maps.list(pid);
        v.innerHTML = '';
        v.append(h('div.mp-gal-head', h('div', h('h1', 'Mapas'), h('p.muted', 'Continentes esculpidos em 3D, cidades a partir das suas ilustrações e mapas dentro de mapas.')),
          h('button.btn.primary', { onclick: () => T.Maps.newDialog(pid) }, icon('plus'), 'Novo mapa')));
        if (!maps.length) { v.append(h('div.mp-empty.glass', icon('map'), h('h2', 'Nenhum mapa ainda'), h('p', 'Crie o primeiro: um continente gerado para esculpir, ou a ilustração de uma cidade.'), h('button.btn.primary', { onclick: () => T.Maps.newDialog(pid) }, 'Criar um mapa'))); return; }
        const grid = h('div.mp-gal-grid');
        maps.forEach(m => {
          const th = h('div.mp-th'); T.Maps.thumb(m).then(u => { th.style.backgroundImage = `url("${u}")`; }).catch(() => {});
          const meta = m.meta || {};
          const kindName = meta.kind === 'image' ? 'Ilustração' : meta.kind === 'blank' ? 'Pergaminho' : 'Terreno';
          const par = meta.parent ? S().get(meta.parent) : null;
          const card = h('div.mp-card-g.glass', { role: 'button', tabindex: '0', onclick: () => T.Shell.open({ kind: 'map', ref: m.id }) }, th,
            h('div.mp-cg-b', h('b', m.title || 'Mapa'), h('span.muted', kindName + ' · ' + (meta.pins || []).length + ' pins · ' + (meta.trails || []).length + ' trilhas' + (par ? ' · dentro de ' + par.title : ''))),
            h('button.icon-btn.sm.mp-cg-menu', { title: 'Opções', onclick: (e) => { e.stopPropagation(); T.menuAt(e.currentTarget, [
              { label: 'Abrir', icon: 'map', fn: () => T.Shell.open({ kind: 'map', ref: m.id }) },
              { label: 'Renomear', icon: 'edit', fn: async () => { const t = await T.ask('Nome do mapa', { value: m.title }); if (t) { S().update(m.id, { title: t }); T.emit('tree-changed'); render(); } } },
              '-', { label: 'Apagar mapa', icon: 'trash', danger: true, fn: async () => { if (await T.confirm('Apagar “' + m.title + '”?', 'O mapa, seus pins, zonas e trilhas somem. As páginas da wiki continuam.', 'Apagar', true)) { S().remove(m.id); T.emit('tree-changed'); render(); } } },
            ]); } }, icon('dots')));
          grid.appendChild(card);
        });
        v.appendChild(grid);
      }
      render();
      const off = T.on('items', (e) => { if (e?.item?.type === 'map' || e?.kind === 'remove') renderD(); });
      const renderD = T.debounce(render, 300);
      return { destroy(){ off(); } };
    }
  };

  /* ================= editor de mapa ================= */
  T.Views.map = {
    icon: 'map', title: (tab) => S().get(tab.ref)?.title || 'Mapa',
    mount(root, tab, ctx){
      const pid = ctx.pid; const item = S().get(tab.ref);
      if (!item) { root.appendChild(h('div.pane-empty', 'Este mapa foi apagado.')); return { destroy(){} }; }
      const M = new MapModel(item);
      const wrap = h('div.mp'); root.appendChild(wrap);
      const cv = h('canvas.mp-cv'); const host3 = h('div.mp-3d'); const ov3 = h('canvas.mp-ov3');
      host3.appendChild(ov3);
      const bar = h('div.mp-bar.glass.lg'); const opt = h('div.mp-opt.glass'); const card = h('div.mp-side.glass.glass-strong.off');
      const hint = h('div.mp-hint'); const play = h('div.mp-play.glass.hidden'); const loading = h('div.mp-loading', 'Abrindo o mapa…');
      const vs = h('div.mp-sb.v', h('i')), hs = h('div.mp-sb.hz', h('i'));
      wrap.append(cv, host3, bar, opt, card, hint, play, loading, vs, hs);
      if (tab.clean) wrap.classList.add('mp-clean');
      // painéis que dá para arrastar e encolher
      function dragPanel(panel, grip, key){
        grip.addEventListener('pointerdown', (e) => {
          if (e.target.closest('button, input, select, textarea')) return; e.preventDefault();
          const wr = wrap.getBoundingClientRect(), r = panel.getBoundingClientRect(); const ox = e.clientX - r.left, oy = e.clientY - r.top;
          const mv = (ev) => { const x = clamp(ev.clientX - wr.left - ox, 0, wr.width - 60), y = clamp(ev.clientY - wr.top - oy, 0, wr.height - 30); Object.assign(panel.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto', transform: 'none' }); tab[key] = [x, y]; };
          const upp = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', upp); persistTab(); };
          addEventListener('pointermove', mv); addEventListener('pointerup', upp);
        });
      }
      function placePanel(panel, key){ const p = tab[key]; if (p) Object.assign(panel.style, { left: p[0] + 'px', top: p[1] + 'px', right: 'auto', bottom: 'auto', transform: 'none' }); }
      function panelGrip(panel, key, miniKey, label){
        const g = h('div.mp-grip', { title: 'Arraste para mover este painel' }, h('span.mp-dots', '⠿'), h('span.grow', label || ''),
          h('button.icon-btn.sm', { type: 'button', title: 'Voltar ao lugar de antes', onclick: () => { delete tab[key]; Object.assign(panel.style, { left: '', top: '', right: '', bottom: '', transform: '' }); persistTab(); } }, icon('focus')),
          h('button.icon-btn.sm', { type: 'button', title: 'Encolher ou abrir o painel', onclick: () => { tab[miniKey] = !tab[miniKey]; panel.classList.toggle('mp-mini', !!tab[miniKey]); persistTab(); } }, icon(tab[miniKey] ? 'down' : 'up')));
        dragPanel(panel, g, key); panel.classList.toggle('mp-mini', !!tab[miniKey]); return g;
      }
      // barras de rolagem
      function updScroll(){
        if (!vw || view3) { vs.classList.add('off'); hs.classList.add('off'); return; }
        const pad = 80;
        const axis = (el, vp, a0, len) => { const lo = Math.min(0, a0 - pad), hi = Math.max(vp, a0 + len + pad); const tot = hi - lo; const fr = vp / tot; el.classList.toggle('off', fr >= .995); const th = el.firstChild; const track = el === vs ? el.clientHeight : el.clientWidth; const sz = Math.max(28, track * fr); const pos = (0 - lo) / tot * (track - sz) / Math.max(1e-6, 1 - fr); if (el === vs) { th.style.height = sz + 'px'; th.style.top = clamp(pos, 0, track - sz) + 'px'; } else { th.style.width = sz + 'px'; th.style.left = clamp(pos, 0, track - sz) + 'px'; } el._m = { tot, track, sz, fr }; };
        axis(vs, CH(), vw.oy, M.AH * vw.z); axis(hs, CW(), vw.ox, M.AW * vw.z);
      }
      [vs, hs].forEach(el => el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation(); const vert = el === vs; const th = el.firstChild; const m = el._m; if (!m) return;
        const onThumb = e.target === th; const k = m.tot / Math.max(1, m.track - m.sz) * (1 - m.fr);
        if (!onThumb) { const r = el.getBoundingClientRect(); const at = vert ? e.clientY - r.top : e.clientX - r.left; const cur = vert ? parseFloat(th.style.top) : parseFloat(th.style.left); const d = (at - cur - m.sz / 2) * k; if (vert) vw.oy -= d; else vw.ox -= d; requestDraw(); persistTab(); }
        const s0 = vert ? e.clientY : e.clientX, o0 = vert ? vw.oy : vw.ox;
        const mv = (ev) => { const d = ((vert ? ev.clientY : ev.clientX) - s0) * k; if (vert) vw.oy = o0 - d; else vw.ox = o0 - d; requestDraw(); };
        const upp = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', upp); persistTab(); };
        addEventListener('pointermove', mv); addEventListener('pointerup', upp);
      }));
      function toggleClean(){ tab.clean = !tab.clean; wrap.classList.toggle('mp-clean', tab.clean); buildBar(); persistTab(); if (tab.clean) T.toast('Painéis escondidos. Toque no olho (ou H) para mostrar de novo.'); }
      const place = () => { wrap.style.setProperty('--mp-top', (bar.offsetTop + bar.offsetHeight + 8) + 'px'); };
      const roBar = new ResizeObserver(place); roBar.observe(bar);
      const c2 = cv.getContext('2d');
      let destroyed = false, view3 = tab.view === '3d', tool = tab.tool || 'mover';
      let brush = Object.assign({ size: 10, power: .5, sculpt: 'elevar', biome: 2, path: 'rio', label: 'cidade', stamp: 'montanha', stampCat: 'montanhas', stampSize: 60, scatter: false, density: .5, vary: .25, stampTint: null, spread: 70 }, tab.brush || {});
      let actions = []; // pilha de desfazer: 'terrain' ou { stamps: [ids] }
      let vw = null; // {ox, oy, z}
      let base = null, baseImg = null, art = null, artC = null, C = null, imgEl = null;
      let sel = null; // {type, id}
      let drawing = null; // caminho/zona/trilha em andamento
      let undo = [], redo = [];
      let three = null;
      let pb = { on: false, t: 0, last: 0 };
      let cloudT = 0, raf = 0;

      /* ----- persistência ----- */
      const save = T.debounce(async () => { if (destroyed && !save._final) return; const meta = await M.serialize(); S().update(M.id, { meta }); }, 900);
      const touch = () => { save(); requestDraw(); };
      const persistTab = T.debounce(() => { Object.assign(tab, { view: view3 ? '3d' : '2d', tool, brush, vw }); T.emit('tab-changed', tab); }, 500);

      /* ----- arte do terreno ----- */
      function rebuildArt(){
        if (M.kind === 'world') {
          if (!base) { base = document.createElement('canvas'); base.width = M.AW; base.height = M.AH; baseImg = base.getContext('2d').createImageData(M.AW, M.AH); }
          C = cellColors(M); paintBase(M, baseImg, C, 0, 0, M.AW, M.AH); base.getContext('2d').putImageData(baseImg, 0, 0);
        }
        if (!art) { art = document.createElement('canvas'); art.width = M.AW; art.height = M.AH; artC = art.getContext('2d'); }
        artC.clearRect(0, 0, M.AW, M.AH);
        if (M.kind === 'world') { artC.drawImage(base, 0, 0); if (!M.hide.symbols) paintSymbols(M, artC); paintFrame(M, artC); }
        else if (M.kind === 'blank') { artC.fillStyle = '#ead9b2'; artC.fillRect(0, 0, M.AW, M.AH); const im = artC.getImageData(0, 0, M.AW, M.AH); const d = im.data; for (let i = 0; i < d.length; i += 4) { const n = hash(i, 3, 5) * .06 + .955; d[i] *= n; d[i + 1] *= n; d[i + 2] *= n; } artC.putImageData(im, 0, 0); paintFrame(Object.assign(Object.create(M), { style: 'antigo' }), artC); }
        if (three && view3) three.texture(textureCanvas());
        requestDraw();
      }
      function patchArt(x0, y0, x1, y1){ // atualiza só a região pintada
        C = cellColors(M);
        paintBase(M, baseImg, C, x0, y0, x1, y1);
        const bx = Math.max(0, x0 | 0), by = Math.max(0, y0 | 0), bw = Math.min(M.AW, Math.ceil(x1)) - bx, bh = Math.min(M.AH, Math.ceil(y1)) - by;
        if (bw > 0 && bh > 0) { base.getContext('2d').putImageData(baseImg, 0, 0, bx, by, bw, bh); artC.drawImage(base, bx, by, bw, bh, bx, by, bw, bh); }
        requestDraw();
      }
      const finishArt = T.debounce(() => rebuildArt(), 350);
      function textureCanvas(){ // textura do 3D: base + zonas + caminhos
        const t = document.createElement('canvas'); t.width = M.AW; t.height = M.AH; const c = t.getContext('2d');
        if (M.kind === 'world' && M.Hm) { const im = c.createImageData(M.AW, M.AH); paintBase(M, im, cellColors(M, true), 0, 0, M.AW, M.AH); c.putImageData(im, 0, 0); } else c.drawImage(art, 0, 0);
        const z = 1; drawZones(c, { ox: 0, oy: 0, z }, true); drawPaths(c, { ox: 0, oy: 0, z });
        return t;
      }

      /* ----- vista (zoom e arrasto) ----- */
      const CW = () => wrap.clientWidth || 800, CH = () => wrap.clientHeight || 600;
      function fit(){ const z = Math.min(CW() / M.AW, (CH() - 70) / M.AH) * .94; vw = { z, ox: (CW() - M.AW * z) / 2, oy: (CH() - M.AH * z) / 2 + 24 }; }
      const toWorld = (sx, sy) => [(sx - vw.ox) / vw.z, (sy - vw.oy) / vw.z];
      const toScreen = (wx, wy) => [wx * vw.z + vw.ox, wy * vw.z + vw.oy];
      const nToS = (nx, ny) => toScreen(nx * M.AW, ny * M.AH);
      const sToN = (sx, sy) => { const [wx, wy] = toWorld(sx, sy); return [wx / M.AW, wy / M.AH]; };

      /* ----- desenho ----- */
      let drawQ = false;
      function requestDraw(){ if (drawQ) return; drawQ = true; requestAnimationFrame(() => { drawQ = false; draw(); }); }
      function resize(){ const dpr = Math.min(2, devicePixelRatio || 1); cv.width = CW() * dpr; cv.height = CH() * dpr; cv.style.width = CW() + 'px'; cv.height && c2.setTransform(dpr, 0, 0, dpr, 0, 0); ov3.width = CW() * dpr; ov3.height = CH() * dpr; ov3.style.width = CW() + 'px'; ov3.style.height = CH() + 'px'; if (three) three.resize(); requestDraw(); }
      const ro = new ResizeObserver(() => resize()); ro.observe(wrap);

      function drawZones(c, v, flat){
        if (M.hide.zones) return;
        M.zones.forEach(zn => {
          if (zn.pts.length < 3) return;
          c.beginPath(); zn.pts.forEach((p, i) => { const x = p[0] * M.AW * v.z + v.ox, y = p[1] * M.AH * v.z + v.oy; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
          c.fillStyle = `hsla(${zn.hue ?? 0},70%,50%,${flat ? .22 : .16})`; c.fill();
          c.setLineDash([7 * Math.max(.6, v.z), 4 * Math.max(.6, v.z)]); c.strokeStyle = `hsla(${zn.hue ?? 0},65%,38%,.85)`; c.lineWidth = Math.max(1, 1.6 * v.z); c.stroke(); c.setLineDash([]);
          if (!flat && zn.name) { let cx = 0, cy = 0; zn.pts.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= zn.pts.length; cy /= zn.pts.length; const [sx, sy] = [cx * M.AW * v.z + v.ox, cy * M.AH * v.z + v.oy];
            c.font = `italic ${Math.max(11, 15 * v.z)}px "IM Fell English", serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = `hsla(${zn.hue ?? 0},55%,28%,.95)`; spaced(c, zn.name.toUpperCase(), sx, sy, 3 * v.z); }
          if (sel && sel.type === 'zone' && sel.id === zn.id && !flat) handles(c, zn.pts, v);
        });
      }
      function drawPaths(c, v){
        if (M.hide.paths) return;
        const anti = M.style === 'antigo' || M.kind !== 'world';
        M.paths.forEach(p => {
          const pts = p.pts.map(q => [q[0] * M.AW * v.z + v.ox, q[1] * M.AH * v.z + v.oy]); if (pts.length < 2) return;
          const z = Math.max(.75, v.z); c.lineCap = 'round'; c.lineJoin = 'round';
          const stroke = (w, col, dash) => { c.beginPath(); smoothPath(c, pts); c.lineWidth = w; c.strokeStyle = col; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); };
          if (p.type === 'rio') { const col = anti ? 'rgba(64,92,120,.9)' : 'rgba(60,112,165,.95)';
            stroke(1.3 * z, col);
            for (let i = 0; i < pts.length - 1; i++) { const t = (i + 1) / (pts.length - 1); c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.lineWidth = (.9 + t * 2.6) * z; c.strokeStyle = col; c.stroke(); }
          } else if (p.type === 'estrada') { stroke(3.2 * z, anti ? 'rgba(234,217,178,.9)' : 'rgba(250,240,220,.85)'); stroke(1.6 * z, anti ? 'rgba(92,66,40,.9)' : 'rgba(120,80,40,.9)', [7 * z, 4 * z]); }
          else if (p.type === 'rua') { stroke(5 * z, anti ? 'rgba(92,66,40,.75)' : 'rgba(80,70,60,.6)'); stroke(3.4 * z, anti ? 'rgba(240,226,192,1)' : 'rgba(250,246,236,1)'); }
          else if (p.type === 'muralha') { stroke(4.2 * z, anti ? 'rgba(70,52,36,.95)' : 'rgba(70,66,62,.95)'); stroke(1.6 * z, anti ? 'rgba(180,160,120,.9)' : 'rgba(170,166,160,.9)', [3 * z, 3 * z]); }
          else if (p.type === 'fronteira') stroke(2 * z, 'rgba(150,40,50,.8)', [8 * z, 4 * z, 2 * z, 4 * z]);
          else if (p.type === 'rota') stroke(1.6 * z, anti ? 'rgba(70,60,50,.8)' : 'rgba(30,50,80,.75)', [5 * z, 6 * z]);
          if (p.name) { const mid = pts[Math.floor(pts.length / 2)], nx = pts[Math.min(pts.length - 1, Math.floor(pts.length / 2) + 1)];
            const ang = Math.atan2(nx[1] - mid[1], nx[0] - mid[0]); c.save(); c.translate(mid[0], mid[1]); c.rotate(Math.abs(ang) > Math.PI / 2 ? ang + Math.PI : ang);
            c.font = `italic ${Math.max(10, 12 * v.z)}px "IM Fell English", serif`; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillStyle = p.type === 'rio' ? '#2f4f6f' : '#4a3524'; spaced(c, p.name, 0, -4 * z, 1.5 * v.z); c.restore(); }
          if (sel && sel.type === 'path' && sel.id === p.id) handles(c, p.pts, v);
        });
      }
      function handles(c, pts, v){ pts.forEach(p => { const x = p[0] * M.AW * v.z + v.ox, y = p[1] * M.AH * v.z + v.oy; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = 'hsl(var(--hue,230) 70% 50%)'; c.strokeStyle = '#5b4fd8'; c.lineWidth = 2; c.stroke(); }); }
      const stampStyle = () => M.kind === 'world' ? M.style : 'antigo';
      function drawStamps(c, v){
        if (M.hide.stamps || !T.MapStamps) return;
        const st = stampStyle();
        M.stamps.forEach(o => { const [x, y] = [o.x * M.AW * v.z + v.ox, o.y * M.AH * v.z + v.oy]; const sz = (o.s || 60) * v.z; if (sz < 1.5) return; T.MapStamps.draw(c, o, x, y, sz, st, sel && sel.type === 'stamp' && sel.id === o.id); });
      }
      function drawTexture(c, v){
        if (!M.texture || !T.MapStamps) return;
        const tex = T.MapStamps.texture(M.texture); const pat = c.createPattern(tex, 'repeat');
        c.save(); c.beginPath(); c.rect(v.ox, v.oy, M.AW * v.z, M.AH * v.z); c.clip();
        c.translate(v.ox, v.oy); c.scale(Math.max(.5, v.z), Math.max(.5, v.z));
        c.globalCompositeOperation = 'multiply'; c.globalAlpha = M.texStr; c.fillStyle = pat; c.fillRect(0, 0, M.AW * v.z / Math.max(.5, v.z), M.AH * v.z / Math.max(.5, v.z));
        if (M.texture === 'pergaminho') { c.globalCompositeOperation = 'multiply'; c.globalAlpha = M.texStr * .8; const W = M.AW * v.z / Math.max(.5, v.z), H = M.AH * v.z / Math.max(.5, v.z); const gr = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(120,80,30,.9)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
        c.restore();
      }
      function drawFrame(c, v){
        if (!M.frame) return;
        const x = v.ox, y = v.oy, W = M.AW * v.z, H = M.AH * v.z, k = v.z; const ink = M.style === 'atlas' && M.kind === 'world' ? '#2b2620' : '#4a3520';
        c.save(); c.strokeStyle = ink; c.fillStyle = ink;
        if (M.frame === 'simples') { c.lineWidth = 3 * k; c.strokeRect(x + 10 * k, y + 10 * k, W - 20 * k, H - 20 * k); }
        else if (M.frame === 'antiga') {
          const m = 22 * k; c.lineWidth = 3 * k; c.strokeRect(x + m * .4, y + m * .4, W - m * .8, H - m * .8); c.lineWidth = 1.2 * k; c.strokeRect(x + m, y + m, W - m * 2, H - m * 2);
          const step = 40 * k; for (let i = x + m; i < x + W - m; i += step * 2) { c.fillRect(i, y + m * .4, step, m * .6); c.fillRect(i, y + H - m, step, m * .6); }
          for (let j = y + m; j < y + H - m; j += step * 2) { c.fillRect(x + m * .4, j, m * .6, step); c.fillRect(x + W - m, j, m * .6, step); }
        } else if (M.frame === 'ornamentada') {
          const m = 30 * k; c.lineWidth = 6 * k; c.strokeRect(x + m * .3, y + m * .3, W - m * .6, H - m * .6); c.lineWidth = 1.5 * k; c.strokeRect(x + m * .75, y + m * .75, W - m * 1.5, H - m * 1.5);
          const corner = (cx, cy, sx, sy) => { c.save(); c.translate(cx, cy); c.scale(sx, sy); c.lineWidth = 2 * k; c.beginPath(); c.arc(m * 1.2, m * 1.2, m * .55, 0, 7); c.stroke(); c.beginPath(); c.moveTo(m * .3, m * 1.9); c.quadraticCurveTo(m * .4, m * .4, m * 1.9, m * .3); c.stroke(); c.beginPath(); c.arc(m * 1.2, m * 1.2, m * .2, 0, 7); c.fill(); c.restore(); };
          corner(x, y, 1, 1); corner(x + W, y, -1, 1); corner(x, y + H, 1, -1); corner(x + W, y + H, -1, -1);
        }
        c.restore();
      }
      function arcText(c, txt, sp, curve, mode){
        const chars = [...txt]; const ws = chars.map(ch => c.measureText(ch).width + sp); const total = ws.reduce((a, b) => a + b, 0) - sp;
        const theta = curve / 100 * Math.PI; const R = total / Math.abs(theta); const dir = theta > 0 ? 1 : -1;
        let s0 = -total / 2;
        chars.forEach((ch, i) => { const mid = s0 + (ws[i] - sp) / 2; const a = mid / R; c.save(); c.translate(Math.sin(a) * R, dir * (R - Math.cos(a) * R)); c.rotate(a * dir); if (mode === 'stroke') c.strokeText(ch, 0, 0); else c.fillText(ch, 0, 0); c.restore(); s0 += ws[i]; });
        return total;
      }
      function drawLabels(c, v){
        if (M.hide.labels) return;
        M.labels.forEach(L => {
          const [x, y] = [L.x * M.AW * v.z + v.ox, L.y * M.AH * v.z + v.oy]; const st = labelStyle(M, L, v.z);
          c.save(); c.translate(x, y); c.rotate((L.rot || 0) * Math.PI / 180); c.font = st.font; c.textAlign = 'center'; c.textBaseline = 'middle';
          const txt = st.up ? (L.text || '').toUpperCase() : (L.text || '');
          const cu = L.curve || 0;
          if (st.halo) { c.lineWidth = 3.5; c.strokeStyle = M.style === 'antigo' || M.kind !== 'world' ? 'rgba(236,222,186,.85)' : 'rgba(255,255,255,.75)'; c.lineJoin = 'round'; if (cu) arcText(c, txt, st.sp, cu, 'stroke'); else spaced(c, txt, 0, 0, st.sp, 'stroke'); }
          c.fillStyle = st.ink; const w = cu ? arcText(c, txt, st.sp, cu) : spaced(c, txt, 0, 0, st.sp);
          L._bb = { x, y, w: w + 10, hgt: parseFloat(st.font.match(/(\d+(\.\d+)?)px/)[1]) * 1.3, rot: L.rot || 0 };
          if (sel && sel.type === 'label' && sel.id === L.id) { c.strokeStyle = '#5b4fd8'; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeRect(-L._bb.w / 2, -L._bb.hgt / 2, L._bb.w, L._bb.hgt); c.setLineDash([]); }
          c.restore();
        });
      }
      function drawPin(c, x, y, p, selected, scale = 1){
        const hue = p.hue ?? 350; const r = 12 * scale;
        c.save(); c.translate(x, y);
        c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-r * .3, -r * .7, -r, -r * 1.1, -r, -r * 1.8); c.arc(0, -r * 1.8, r, Math.PI, 0); c.bezierCurveTo(r, -r * 1.1, r * .3, -r * .7, 0, 0);
        c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 6; c.shadowOffsetY = 2; c.fillStyle = `hsl(${hue} 65% ${selected ? 42 : 48}%)`; c.fill(); c.shadowColor = 'transparent';
        c.lineWidth = selected ? 3 : 1.6; c.strokeStyle = selected ? '#fff' : 'rgba(255,255,255,.9)'; c.stroke();
        c.save(); c.translate(-r * .62, -r * 1.8 - r * .62); c.scale(r * 1.24 / 24, r * 1.24 / 24); c.strokeStyle = '#fff'; c.lineWidth = 2.1; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(path2d(p.icon || 'estrela')); c.restore();
        if (p.map) { c.beginPath(); c.arc(r * .8, -r * 2.5, 4.5 * scale, 0, 7); c.fillStyle = '#fff'; c.fill(); c.fillStyle = `hsl(${hue} 65% 40%)`; c.font = `700 ${7 * scale}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('›', r * .8, -r * 2.5); }
        c.restore();
        if (!M.hide.pinNames && p.title) { c.font = `600 ${12 * scale}px "Instrument Sans", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineJoin = 'round'; c.strokeText(p.title, x, y + 4); c.fillStyle = '#26232e'; c.fillText(p.title, x, y + 4); }
      }
      function drawPins(c, v){ if (M.hide.pins) return; M.pins.forEach(p => { const [x, y] = [p.x * M.AW * v.z + v.ox, p.y * M.AH * v.z + v.oy]; drawPin(c, x, y, p, sel && sel.type === 'pin' && sel.id === p.id); }); }
      function trailPos(tr, t){ // posição na trilha para a fração t (0..1) por comprimento
        const pts = tr.pts; if (!pts.length) return null; if (pts.length === 1) return { x: pts[0].x, y: pts[0].y, i: 0 };
        const seg = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++) { const d = Math.hypot((pts[i + 1].x - pts[i].x) * M.AR, pts[i + 1].y - pts[i].y); seg.push(d); tot += d; }
        let dd = clamp(t, 0, 1) * tot; for (let i = 0; i < seg.length; i++) { if (dd <= seg[i] || i === seg.length - 1) { const f = seg[i] ? clamp(dd / seg[i], 0, 1) : 0; return { x: lerp(pts[i].x, pts[i + 1].x, f), y: lerp(pts[i].y, pts[i + 1].y, f), i: f > .98 ? i + 1 : i }; } dd -= seg[i]; }
        return null;
      }
      function datedRange(){
        const c = T.Cal?.cfg(pid); if (!c) return null;
        const ts = M.trails.filter(tr => tr.pts.length > 1 && !M.hide['tr_' + tr.id]);
        if (!ts.length || !ts.every(tr => tr.pts.every(p => p.date))) return null;
        let lo = Infinity, hi = -Infinity; ts.forEach(tr => tr.pts.forEach(p => { const a = T.Cal.abs(c, p.date); lo = Math.min(lo, a); hi = Math.max(hi, a); }));
        return hi > lo ? { c, lo, hi } : null;
      }
      function trailPosDated(tr, A, c){
        const as = tr.pts.map(p => T.Cal.abs(c, p.date));
        if (A <= as[0]) return { x: tr.pts[0].x, y: tr.pts[0].y, i: 0, before: A < as[0] };
        for (let i = 0; i < as.length - 1; i++) if (A <= as[i + 1]) { const f = as[i + 1] > as[i] ? (A - as[i]) / (as[i + 1] - as[i]) : 1; return { x: lerp(tr.pts[i].x, tr.pts[i + 1].x, f), y: lerp(tr.pts[i].y, tr.pts[i + 1].y, f), i: f > .98 ? i + 1 : i, frac: (i + f) / (as.length - 1) }; }
        const L = tr.pts[tr.pts.length - 1]; return { x: L.x, y: L.y, i: tr.pts.length - 1, after: true };
      }
      function drawTrails(c, v){
        if (M.hide.trails) return;
        const dr = pb.on || pb.t > 0 ? datedRange() : null; const A = dr ? lerp(dr.lo, dr.hi, pb.t) : 0;
        M.trails.forEach(tr => {
          if (M.hide['tr_' + tr.id]) return;
          const hue = tr.hue ?? 210; const pts = tr.pts.map(p => [p.x * M.AW * v.z + v.ox, p.y * M.AH * v.z + v.oy]);
          const playing = pb.on || pb.t > 0;
          let pos = null; if (playing) pos = dr ? trailPosDated(tr, A, dr.c) : trailPos(tr, pb.t);
          c.lineCap = 'round'; c.lineJoin = 'round';
          if (pts.length > 1) {
            c.beginPath(); smoothPath(c, pts); c.strokeStyle = `hsla(${hue},70%,45%,${playing ? .25 : .9})`; c.lineWidth = 3; c.setLineDash([1, 7]); c.stroke(); c.setLineDash([]);
            if (playing && pos) { const upto = pts.slice(0, pos.i + 1); upto.push([pos.x * M.AW * v.z + v.ox, pos.y * M.AH * v.z + v.oy]); c.beginPath(); smoothPath(c, upto); c.strokeStyle = `hsla(${hue},75%,45%,.95)`; c.lineWidth = 3.5; c.setLineDash([1, 7]); c.stroke(); c.setLineDash([]); }
          }
          pts.forEach((p, i) => { c.beginPath(); c.arc(p[0], p[1], i === 0 ? 5 : 3.6, 0, 7); c.fillStyle = i === 0 ? `hsl(${hue} 70% 45%)` : '#fff'; c.fill(); c.strokeStyle = `hsl(${hue} 70% 40%)`; c.lineWidth = 1.8; c.stroke();
            const lbl = tr.pts[i].label; if (lbl && (!playing || (pos && pos.i >= i))) { c.font = `italic 12px "IM Fell English", serif`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.8)'; c.strokeText(lbl, p[0] + 8, p[1]); c.fillStyle = `hsl(${hue} 60% 28%)`; c.fillText(lbl, p[0] + 8, p[1]); } });
          if (sel && sel.type === 'trail' && sel.id === tr.id) handles(c, tr.pts.map(p => [p.x, p.y]), v);
          if (playing && pos && !pos.before) {
            const [x, y] = [pos.x * M.AW * v.z + v.ox, pos.y * M.AH * v.z + v.oy];
            const who = tr.who ? S().get(tr.who) : null; const ini = ((who?.title || tr.name || '?').trim()[0] || '?').toUpperCase();
            c.beginPath(); c.arc(x, y, 14, 0, 7); c.fillStyle = `hsla(${hue},80%,55%,.25)`; c.fill();
            c.beginPath(); c.arc(x, y, 10, 0, 7); c.fillStyle = `hsl(${hue} 70% 45%)`; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
            c.fillStyle = '#fff'; c.font = '700 11px "Instrument Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ini, x, y + .5);
          }
        });
      }
      function drawDrawing(c, v){
        if (!drawing) return;
        const pts = drawing.pts.map(q => [q[0] * M.AW * v.z + v.ox, q[1] * M.AH * v.z + v.oy]); if (drawing.hover) pts.push(drawing.hover);
        c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (drawing.type === 'zone' && pts.length > 2) c.closePath();
        c.strokeStyle = '#5b4fd8'; c.lineWidth = 2; c.setLineDash([5, 4]); c.stroke(); c.setLineDash([]);
        pts.forEach(p => { c.beginPath(); c.arc(p[0], p[1], 3.5, 0, 7); c.fillStyle = '#5b4fd8'; c.fill(); });
      }
      function drawClouds(c, v){
        if (!M.clouds || M.kind !== 'world') return;
        if (!drawClouds.tex) { const t = document.createElement('canvas'); t.width = 512; t.height = 320; const x = t.getContext('2d'); const im = x.createImageData(512, 320);
          for (let y = 0; y < 320; y++) for (let xx = 0; xx < 512; xx++) { const n = fbm(xx / 512 * 6, y / 320 * 4, 77, 5); const a = clamp((n - .52) * 3.2, 0, 1); const o = (y * 512 + xx) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = 255; im.data[o + 3] = a * 210; }
          x.putImageData(im, 0, 0); drawClouds.tex = t; }
        const t = drawClouds.tex; const W = M.AW * v.z, H = M.AH * v.z; const off = (cloudT * 6) % W;
        c.save(); c.beginPath(); c.rect(v.ox, v.oy, W, H); c.clip();
        c.globalAlpha = .18; c.filter = 'blur(6px) brightness(0)';
        for (let k = -1; k <= 1; k++) c.drawImage(t, v.ox + off + k * W + 14, v.oy + 18, W, H);
        c.filter = 'none'; c.globalAlpha = .75;
        for (let k = -1; k <= 1; k++) c.drawImage(t, v.ox + off + k * W, v.oy, W, H);
        c.restore(); c.globalAlpha = 1;
      }
      function draw(){
        if (destroyed || !vw) return;
        c2.clearRect(0, 0, CW(), CH());
        if (view3) { draw3Overlay(); return; }
        c2.save(); c2.imageSmoothingQuality = 'high';
        if (M.kind === 'image' && imgEl) {
          c2.filter = M.tone === 'antigo' ? 'sepia(.55) contrast(1.05) saturate(.9)' : M.tone === 'noite' ? 'brightness(.55) saturate(.7) hue-rotate(190deg)' : M.tone === 'desbotado' ? 'saturate(.55) brightness(1.06)' : 'none';
          c2.drawImage(imgEl, vw.ox, vw.oy, M.AW * vw.z, M.AH * vw.z); c2.filter = 'none';
        } else if (art) c2.drawImage(art, vw.ox, vw.oy, M.AW * vw.z, M.AH * vw.z);
        c2.restore();
        if (M.hide.grid !== false && M.showGrid) {}
        updScroll(); drawTexture(c2, vw); drawZones(c2, vw); drawPaths(c2, vw); drawStamps(c2, vw); drawClouds(c2, vw); drawLabels(c2, vw); drawTrails(c2, vw); drawPins(c2, vw); drawDrawing(c2, vw); drawFrame(c2, vw);
        if (brushPos && tool === 'carimbo' && brush.scatter) { c2.beginPath(); c2.arc(brushPos[0], brushPos[1], brush.spread, 0, 7); c2.strokeStyle = 'rgba(255,255,255,.9)'; c2.lineWidth = 1.5; c2.setLineDash([5, 4]); c2.stroke(); c2.setLineDash([]); }
        if (brushPos && (tool === 'esculpir' || tool === 'bioma') && M.kind === 'world') { const r = brush.size * (M.AW / M.W) * vw.z; c2.beginPath(); c2.arc(brushPos[0], brushPos[1], r, 0, 7); c2.strokeStyle = 'rgba(255,255,255,.9)'; c2.lineWidth = 1.5; c2.stroke(); c2.beginPath(); c2.arc(brushPos[0], brushPos[1], r, 0, 7); c2.strokeStyle = 'rgba(0,0,0,.35)'; c2.setLineDash([4, 4]); c2.stroke(); c2.setLineDash([]); }
      }
      function draw3Overlay(){
        const o = ov3.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1); o.setTransform(dpr, 0, 0, dpr, 0, 0); o.clearRect(0, 0, CW(), CH());
        if (!three) return;
        const pr = (nx, ny) => three.project(nx, ny);
        if (!M.hide.labels) M.labels.forEach(L => { const s = pr(L.x, L.y); if (!s || s.behind) return; const st = labelStyle(M, L, .8 * s.scale); o.font = st.font; o.textAlign = 'center'; o.textBaseline = 'middle'; const txt = st.up ? (L.text || '').toUpperCase() : L.text || ''; o.lineWidth = 3.5; o.strokeStyle = 'rgba(255,255,255,.8)'; spaced(o, txt, s.x, s.y - 10, st.sp, 'stroke'); o.fillStyle = st.ink; spaced(o, txt, s.x, s.y - 10, st.sp); });
        if (!M.hide.trails) M.trails.forEach(tr => { if (M.hide['tr_' + tr.id]) return; const ps = tr.pts.map(p => pr(p.x, p.y)).filter(Boolean); if (ps.length < 2) return; o.beginPath(); ps.forEach((s, i) => i ? o.lineTo(s.x, s.y) : o.moveTo(s.x, s.y)); o.strokeStyle = `hsla(${tr.hue ?? 210},75%,50%,.95)`; o.lineWidth = 3; o.setLineDash([1, 7]); o.lineCap = 'round'; o.stroke(); o.setLineDash([]); });
        if (!M.hide.pins) M.pins.forEach(p => { const s = pr(p.x, p.y); if (!s || s.behind) return; drawPin(o, s.x, s.y, p, false, clamp(s.scale, .6, 1.2)); });
      }

      /* ----- ferramentas: pincéis ----- */
      let brushPos = null, stroking = false, flatTarget = .5, lastApply = null;
      function pushUndo(){ if (M.kind !== 'world') return; actions.push('terrain'); undo.push({ H: Float32Array.from(M.Hm), B: Uint8Array.from(M.B) }); if (undo.length > 25) undo.shift(); redo = []; }
      function applyBrush(gx, gy){
        const W = M.W, H = M.H, R = brush.size, A = M.Hm, B = M.B; const pw = brush.power;
        const x0 = Math.max(0, Math.floor(gx - R)), x1 = Math.min(W - 1, Math.ceil(gx + R)), y0 = Math.max(0, Math.floor(gy - R)), y1 = Math.min(H - 1, Math.ceil(gy + R));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const d = Math.hypot(x - gx, y - gy) / R; if (d > 1) continue;
          const f = Math.pow(1 - d * d, 2); const i = y * W + x;
          if (tool === 'bioma') { if (d < .82 + hash(x, y, 13) * .18) { B[i] = brush.biome; if (brush.biome === 9) A[i] = Math.min(1, A[i] + .012 * f * pw); if (brush.biome === 10) A[i] = Math.min(1, A[i] + .008 * f * pw); } continue; }
          const s = brush.sculpt;
          if (s === 'elevar') A[i] = Math.min(1, A[i] + .022 * f * pw);
          else if (s === 'rebaixar') A[i] = Math.max(0, A[i] - .022 * f * pw);
          else if (s === 'suavizar') { let sum = 0, n = 0; for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) { const X = x + xx, Y = y + yy; if (X >= 0 && X < W && Y >= 0 && Y < H) { sum += A[Y * W + X]; n++; } } A[i] = lerp(A[i], sum / n, f * pw * .6); }
          else if (s === 'achatar') A[i] = lerp(A[i], flatTarget, f * pw * .25);
          else if (s === 'rugoso') A[i] = clamp(A[i] + (fbm(x * .35, y * .35, M.seed + 900, 3) - .5) * .03 * f * pw, 0, 1);
          else if (s === 'mar') A[i] = lerp(A[i], M.sea - .06, f * pw * .3);
        }
        const k = M.AW / W; const pad = 2;
        if (view3) { three && three.heights(x0, y0, x1, y1); }
        else patchArt((x0 - pad) * k, (y0 - pad) * k, (x1 + pad + 1) * k, (y1 + pad + 1) * k);
      }
      function strokeAt(gx, gy){
        if (!lastApply) { applyBrush(gx, gy); lastApply = [gx, gy]; return; }
        const d = Math.hypot(gx - lastApply[0], gy - lastApply[1]); const stp = Math.max(.6, brush.size * .3);
        if (d < stp) return;
        const n = Math.ceil(d / stp); for (let i = 1; i <= n; i++) applyBrush(lerp(lastApply[0], gx, i / n), lerp(lastApply[1], gy, i / n));
        lastApply = [gx, gy];
      }
      function endStroke(){ if (!stroking) return; stroking = false; lastApply = null; if (view3) { rebuildArt(); } else finishArt(); save(); }
      function doUndo(){ const top = actions[actions.length - 1]; if (top && top.stamps) { actions.pop(); const ids = new Set(top.stamps); M.stamps = M.stamps.filter(x => !ids.has(x.id)); if (sel && ids.has(sel.id)) { sel = null; closeCard(); } touch(); return; } if (top === 'terrain') actions.pop(); const u = undo.pop(); if (!u) return T.toast('Nada para desfazer no terreno.'); redo.push({ H: Float32Array.from(M.Hm), B: Uint8Array.from(M.B) }); M.Hm.set(u.H); M.B.set(u.B); if (three) three.heights(0, 0, M.W - 1, M.H - 1); rebuildArt(); save(); }
      function doRedo(){ const u = redo.pop(); if (!u) return; undo.push({ H: Float32Array.from(M.Hm), B: Uint8Array.from(M.B) }); M.Hm.set(u.H); M.B.set(u.B); if (three) three.heights(0, 0, M.W - 1, M.H - 1); rebuildArt(); save(); }

      /* ----- rio automático: desce o terreno até o mar ----- */
      function autoRiver(nx, ny){
        let gx = nx * M.W, gy = ny * M.H; if (M.hAt(gx, gy) < M.sea) return T.toast('Clique em terra firme, de preferência numa montanha.');
        const pts = [[nx, ny]]; let lastH = M.hAt(gx, gy), stuck = 0;
        for (let s = 0; s < 900; s++) {
          let best = null, bh = Infinity; for (let a = 0; a < 16; a++) { const ang = a / 16 * Math.PI * 2; const tx = gx + Math.cos(ang) * 1.2, ty = gy + Math.sin(ang) * 1.2; const hh = M.hAt(tx, ty) + (hash(Math.round(tx * 3), Math.round(ty * 3), 5) - .5) * .002; if (hh < bh) { bh = hh; best = [tx, ty]; } }
          if (!best) break;
          if (bh >= lastH) { stuck++; if (stuck > 25) break; } else stuck = 0;
          gx = best[0]; gy = best[1]; lastH = Math.min(lastH, bh);
          if (s % 3 === 0) pts.push([gx / M.W, gy / M.H]);
          if (bh < M.sea - .004) { pts.push([gx / M.W, gy / M.H]); break; }
          if (gx < 1 || gy < 1 || gx > M.W - 2 || gy > M.H - 2) break;
        }
        if (pts.length < 3) return T.toast('Não achei um caminho para a água daqui. Tente mais alto.');
        const p = { id: T.id(), type: 'rio', name: '', pts }; M.paths.push(p); sel = { type: 'path', id: p.id }; openCard(); touch();
      }

      /* ----- seleção e acerto de cliques ----- */
      function hit(sx, sy){
        if (!M.hide.pins) for (let i = M.pins.length - 1; i >= 0; i--) { const p = M.pins[i]; const [x, y] = nToS(p.x, p.y); if (Math.hypot(sx - x, sy - (y - 22)) < 14) return { type: 'pin', id: p.id }; }
        if (!M.hide.trails) for (const tr of M.trails) for (let i = 0; i < tr.pts.length; i++) { const [x, y] = nToS(tr.pts[i].x, tr.pts[i].y); if (Math.hypot(sx - x, sy - y) < 8) return { type: 'trail', id: tr.id, pi: i }; }
        if (sel && (sel.type === 'path' || sel.type === 'zone')) { const o = (sel.type === 'path' ? M.paths : M.zones).find(x => x.id === sel.id); if (o) for (let i = 0; i < o.pts.length; i++) { const [x, y] = nToS(o.pts[i][0], o.pts[i][1]); if (Math.hypot(sx - x, sy - y) < 8) return { type: sel.type, id: o.id, vi: i }; } }
        if (!M.hide.labels) for (const L of M.labels) { const b = L._bb; if (!b) continue; const a = -(b.rot || 0) * Math.PI / 180; const dx = sx - b.x, dy = sy - b.y; const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a); if (Math.abs(rx) < b.w / 2 && Math.abs(ry) < b.hgt / 2) return { type: 'label', id: L.id }; }
        if (!M.hide.stamps) for (let i = M.stamps.length - 1; i >= 0; i--) { const o = M.stamps[i]; const [x, y] = nToS(o.x, o.y); const r = Math.max(8, (o.s || 60) * vw.z * .45); if (Math.abs(sx - x) < r && Math.abs(sy - y) < r) return { type: 'stamp', id: o.id }; }
        if (!M.hide.paths) for (const p of M.paths) { const pts = p.pts.map(q => nToS(q[0], q[1])); for (let i = 0; i < pts.length - 1; i++) if (segDist(sx, sy, pts[i], pts[i + 1]) < 6) return { type: 'path', id: p.id }; }
        if (!M.hide.zones) for (let i = M.zones.length - 1; i >= 0; i--) { const z = M.zones[i]; if (inPoly(sToN(sx, sy), z.pts)) return { type: 'zone', id: z.id }; }
        return null;
      }
      const segDist = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1), 0, 1); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
      const inPoly = (p, pts) => { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
      const objOf = (s) => !s ? null : s.type === 'stamp' ? M.stamps.find(x => x.id === s.id) : s.type === 'pin' ? M.pins.find(x => x.id === s.id) : s.type === 'label' ? M.labels.find(x => x.id === s.id) : s.type === 'zone' ? M.zones.find(x => x.id === s.id) : s.type === 'path' ? M.paths.find(x => x.id === s.id) : M.trails.find(x => x.id === s.id);

      /* ----- ponteiro ----- */
      let drag = null;
      cv.addEventListener('pointerdown', (e) => {
        if (e.button === 2) return;
        const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top; const [nx, ny] = sToN(sx, sy);
        cv.setPointerCapture(e.pointerId);
        if (e.button === 1 || e.altKey || (tool === 'mover' && !e.shiftKey)) {
          const hh = tool === 'mover' ? hit(sx, sy) : null;
          if (hh) { sel = { type: hh.type, id: hh.id }; const o = objOf(sel); drag = { kind: 'obj', hit: hh, o, sx, sy, moved: false, start: [nx, ny] }; openCard(); requestDraw(); return; }
          drag = { kind: 'pan', sx, sy, ox: vw.ox, oy: vw.oy, moved: false }; return;
        }
        if ((tool === 'esculpir' || tool === 'bioma') && M.kind === 'world') { pushUndo(); stroking = true; flatTarget = M.hAt(nx * M.W, ny * M.H); strokeAt(nx * M.W, ny * M.H); return; }
        if (tool === 'caminho') {
          if (brush.path === 'auto') return autoRiver(nx, ny);
          if (!drawing) drawing = { type: 'path', pts: [[nx, ny]], free: true }; else drawing.pts.push([nx, ny]);
          drag = { kind: 'free', sx, sy, moved: false }; requestDraw(); return;
        }
        if (tool === 'zona') { if (!drawing) drawing = { type: 'zone', pts: [] };
          if (drawing.pts.length > 2) { const [fx, fy] = nToS(...drawing.pts[0]); if (Math.hypot(sx - fx, sy - fy) < 10) return finishDrawing(); }
          drawing.pts.push([nx, ny]); requestDraw(); return; }
        if (tool === 'carimbo') {
          if (!T.MapStamps.get(brush.stamp)) brush.stamp = 'montanha';
          if (!brush.scatter) { const o = newStamp(nx, ny); M.stamps.push(o); actions.push({ stamps: [o.id] }); touch(); return; }
          drag = { kind: 'scatter', sx, sy, last: [sx, sy], ids: [] }; scatterAt(sx, sy, 3); return;
        }
        if (tool === 'pin') { const p = { id: T.id(), x: nx, y: ny, icon: 'cidade', hue: 350, title: 'Novo lugar' }; M.pins.push(p); sel = { type: 'pin', id: p.id }; openCard(true); touch(); return; }
        if (tool === 'nome') { T.ask('Texto do nome', { placeholder: brush.label === 'reino' ? 'Reino de Valmor' : brush.label === 'mar' ? 'Mar das Brumas' : 'Nome' }).then(t => { if (!t) return; const L = { id: T.id(), x: nx, y: ny, text: t, kind: brush.label, size: 1, rot: 0 }; M.labels.push(L); sel = { type: 'label', id: L.id }; openCard(); touch(); }); return; }
        if (tool === 'trilha') {
          let tr = sel && sel.type === 'trail' ? M.trails.find(x => x.id === sel.id) : null;
          if (!tr) { tr = { id: T.id(), name: 'Jornada ' + (M.trails.length + 1), hue: [210, 140, 30, 280, 350, 180][M.trails.length % 6], pts: [] }; M.trails.push(tr); sel = { type: 'trail', id: tr.id }; }
          tr.pts.push({ x: nx, y: ny }); openCard(); touch(); return;
        }
      });
      cv.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top; const [nx, ny] = sToN(sx, sy);
        brushPos = [sx, sy];
        if (drawing && !drag) { drawing.hover = [sx, sy]; requestDraw(); }
        if (stroking) { strokeAt(nx * M.W, ny * M.H); return; }
        if (!drag) { if (tool === 'esculpir' || tool === 'bioma' || tool === 'carimbo') requestDraw(); cv.style.cursor = tool === 'mover' ? (hit(sx, sy) ? 'pointer' : 'grab') : 'crosshair'; return; }
        if (Math.hypot(sx - drag.sx, sy - drag.sy) > 3) drag.moved = true;
        if (drag.kind === 'scatter') { const d = Math.hypot(sx - drag.last[0], sy - drag.last[1]); const gap = Math.max(6, brush.stampSize * vw.z * (1.25 - brush.density)); if (d >= gap) { drag.last = [sx, sy]; scatterAt(sx, sy, 1 + Math.round(brush.density * 2)); } requestDraw(); return; }
        if (drag.kind === 'pan') { vw.ox = drag.ox + sx - drag.sx; vw.oy = drag.oy + sy - drag.sy; requestDraw(); persistTab(); }
        else if (drag.kind === 'free' && drag.moved && drawing) { const L = drawing.pts[drawing.pts.length - 1]; const [lx, ly] = nToS(L[0], L[1]); if (Math.hypot(sx - lx, sy - ly) > 7) drawing.pts.push([nx, ny]); drawing.dragged = true; requestDraw(); }
        else if (drag.kind === 'obj' && drag.moved) {
          const hh = drag.hit, o = drag.o; if (!o) return;
          if (hh.type === 'pin' || hh.type === 'label') { o.x = nx; o.y = ny; }
          else if (hh.type === 'stamp') { if (!drag.off) drag.off = [o.x - drag.start[0], o.y - drag.start[1]]; o.x = nx + drag.off[0]; o.y = ny + drag.off[1]; }
          else if (hh.type === 'trail' && hh.pi != null) { o.pts[hh.pi].x = nx; o.pts[hh.pi].y = ny; }
          else if (hh.vi != null) { o.pts[hh.vi] = [nx, ny]; }
          else if (hh.type === 'zone' || hh.type === 'path') { const dx = nx - drag.start[0], dy = ny - drag.start[1]; o.pts.forEach(p => { p[0] += dx; p[1] += dy; }); drag.start = [nx, ny]; }
          requestDraw();
        }
      });
      const up = () => {
        if (stroking) endStroke();
        if (drag) {
          if (drag.kind === 'obj' && drag.moved) touch();
          if (drag.kind === 'scatter') { if (drag.ids.length) actions.push({ stamps: drag.ids }); touch(); }
          if (drag.kind === 'pan' && !drag.moved && tool === 'mover') { sel = null; closeCard(); requestDraw(); }
          if (drag.kind === 'free' && drawing && drawing.dragged) finishDrawing();
        }
        drag = null;
      };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('pointerleave', () => { brushPos = null; requestDraw(); });
      cv.addEventListener('dblclick', (e) => { if (drawing) { e.preventDefault(); if (drawing.pts.length > 1 && drawing.type === 'path') drawing.pts.pop(); finishDrawing(); } else if (tool === 'mover') { const r = cv.getBoundingClientRect(); const hh = hit(e.clientX - r.left, e.clientY - r.top); if (hh?.type === 'pin') { const p = objOf(hh); if (p?.map && S().get(p.map)) T.Shell.open({ kind: 'map', ref: p.map }); } } });
      cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top;
        if ((tool === 'esculpir' || tool === 'bioma') && (e.ctrlKey || e.metaKey) === false && e.shiftKey) { brush.size = clamp(brush.size + (e.deltaY > 0 ? -1 : 1), 1, 60); buildOpt(); requestDraw(); return; }
        const f = Math.exp(-e.deltaY * .0015); const z2 = clamp(vw.z * f, .08, 12); const [wx, wy] = toWorld(sx, sy); vw.z = z2; vw.ox = sx - wx * z2; vw.oy = sy - wy * z2; requestDraw(); persistTab(); }, { passive: false });
      cv.addEventListener('contextmenu', (e) => { e.preventDefault(); if (drawing) { finishDrawing(); return; } });
      function finishDrawing(){
        const d = drawing; drawing = null; if (!d) return requestDraw();
        if (d.type === 'path' && d.pts.length > 1) { const p = { id: T.id(), type: brush.path === 'auto' ? 'rio' : brush.path, name: '', pts: d.pts }; M.paths.push(p); sel = { type: 'path', id: p.id }; openCard(); touch(); }
        else if (d.type === 'zone' && d.pts.length > 2) { const z = { id: T.id(), name: 'Nova zona', hue: [30, 140, 200, 280, 350, 60][M.zones.length % 6], pts: d.pts }; M.zones.push(z); sel = { type: 'zone', id: z.id }; openCard(true); touch(); }
        requestDraw();
      }
      const onKey = (e) => {
        if (!wrap.isConnected || e.target.closest('input, textarea, [contenteditable="true"], select')) return;
        if (e.key === 'Escape') { if (drawing) { drawing = null; requestDraw(); } else if (sel) { sel = null; closeCard(); requestDraw(); } }
        else if (e.key === 'Enter' && drawing) finishDrawing();
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); }
        else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); deleteSel(); }
        else if (!e.ctrlKey && !e.metaKey && !e.altKey) { if (e.key.toLowerCase() === 'h' && wrap.matches(':hover')) { toggleClean(); return; }
          const k = { s: 'carimbo', v: 'mover', e: 'esculpir', b: 'bioma', c: 'caminho', n: 'nome', p: 'pin', z: 'zona', t: 'trilha' }[e.key.toLowerCase()]; if (k && wrap.matches(':hover')) setTool(k); }
      };
      document.addEventListener('keydown', onKey);

      function newStamp(nx, ny){
        const vary = brush.vary; const sz = brush.stampSize * (1 + (Math.random() * 2 - 1) * vary * .6);
        return { id: T.id(), k: brush.stamp, x: nx, y: ny, s: Math.round(sz), r: Math.round((Math.random() * 2 - 1) * vary * 14), f: vary > 0 && Math.random() < vary ? 1 : 0, t: brush.stampTint };
      }
      function scatterAt(sx, sy, n){
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * brush.spread; const px = sx + Math.cos(a) * rr, py = sy + Math.sin(a) * rr;
          const [nx, ny] = sToN(px, py); if (nx < 0 || ny < 0 || nx > 1 || ny > 1) continue;
          // não deixa empilhar demais no mesmo lugar
          const minD = brush.stampSize * .55 / M.AW; if (M.stamps.some(o => o.k === brush.stamp && Math.hypot((o.x - nx) * M.AR, o.y - ny) < minD)) continue;
          const o = newStamp(nx, ny); M.stamps.push(o); drag.ids.push(o.id);
        }
        // de cima para baixo: o que está mais embaixo fica na frente
        M.stamps.sort((a, b) => (a.z || 0) - (b.z || 0) || a.y - b.y);
      }
      function deleteSel(){
        const s = sel; if (!s) return; const list = { pin: M.pins, label: M.labels, zone: M.zones, path: M.paths, trail: M.trails, stamp: M.stamps }[s.type];
        const i = list.findIndex(x => x.id === s.id); if (i < 0) return; const [gone] = list.splice(i, 1); sel = null; closeCard(); touch();
        T.toast('Apagado.', { action: { label: 'Desfazer', fn: () => { list.splice(i, 0, gone); touch(); } } });
      }

      /* ----- ficha deslizante ----- */
      function closeCard(){ card.classList.add('off'); wrap.classList.remove('side-open'); }
      function pageSelect(value, onChange, tpl){
        const pages = T.Ent.pages(pid).filter(p => !tpl || p.meta?.tpl === tpl || !p.meta?.tpl);
        const s = h('select.select', h('option', { value: '' }, '— nenhuma —'), ...pages.sort((a, b) => (a.title || '').localeCompare(b.title || '')).map(p => h('option', { value: p.id }, p.title)));
        s.value = value || ''; s.onchange = () => onChange(s.value || null); return s;
      }
      const cardAdd = (...xs) => card.append(...xs.filter(Boolean));
      function openCard(focusTitle){
        const o = objOf(sel); if (!o) return closeCard();
        card.innerHTML = ''; card.classList.remove('off'); wrap.classList.add('side-open'); card.appendChild(panelGrip(card, 'cardPos', 'cardMini', 'Ficha')); placePanel(card, 'cardPos');
        const head = (ic, t) => h('div.mp-side-h', icon(ic), h('b.grow', t), h('button.icon-btn.sm', { title: 'Apagar (Delete)', onclick: deleteSel }, icon('trash')), h('button.icon-btn.sm', { title: 'Fechar', onclick: () => { sel = null; closeCard(); requestDraw(); } }, icon('x')));
        const field = (label, el) => h('label.mp-f', h('span', label), el);
        const txt = (v, fn, ph) => { const i = h('input.input', { value: v || '', placeholder: ph || '' }); i.oninput = () => { fn(i.value); requestDraw(); save(); }; return i; };
        const area = (v, fn, ph) => { const i = h('textarea.textarea', { placeholder: ph || '', rows: 3 }); i.value = v || ''; i.oninput = () => { fn(i.value); save(); }; return i; };
        const hueRow = (cur, fn) => T.swatches(cur, (hh) => { fn(hh); touch(); });
        if (sel.type === 'pin') {
          const title = txt(o.title, v => o.title = v, 'Nome do lugar');
          const icons = h('div.mp-icons', Object.keys(PIN_ICONS).map(k => { const b = h('button.mp-ic' + (o.icon === k ? '.on' : ''), { type: 'button', title: PIN_NAMES[k], onclick: () => { o.icon = k; touch(); openCard(); } }); const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('viewBox', '0 0 24 24'); sv.innerHTML = `<path d="${PIN_ICONS[k]}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`; b.appendChild(sv); return b; }));
          const page = o.page ? S().get(o.page) : null;
          const pageRow = h('div.mp-row', pageSelect(o.page, v => { o.page = v; touch(); openCard(); }),
            h('button.btn.sm', { title: 'Criar uma página da wiki para este lugar', onclick: () => { const p = T.Wiki.create(pid, T.WIKI_TPL.lugar ? 'lugar' : 'livre', o.title); o.page = p.id; touch(); openCard(); } }, icon('plus'), 'Criar'));
          const imgBox = h('div.mp-img');
          const setImg = async () => { imgBox.innerHTML = ''; if (o.img) { const u = await T.Assets.resolve(o.img); if (u) imgBox.appendChild(h('img', { src: u, alt: '' })); imgBox.appendChild(h('button.btn.sm', { onclick: () => { o.img = null; touch(); setImg(); } }, 'Tirar imagem')); } else imgBox.appendChild(h('button.btn.sm', { onclick: async () => { const f = await T.pickFile('image/*'); if (!f) return; const ref = await T.Assets.upload(f); if (ref) { o.img = ref; touch(); setImg(); } } }, icon('image'), 'Pôr imagem')); };
          setImg();
          const sub = o.map ? S().get(o.map) : null;
          const subRow = h('div.mp-row', sub ? h('button.btn.sm.primary', { onclick: () => T.Shell.open({ kind: 'map', ref: sub.id }) }, icon('enter'), 'Entrar em ' + sub.title) : null,
            h('select.select', { onchange: (e) => { const v = e.target.value; if (v === '__new') { T.Maps.newDialog(pid, (it) => { o.map = it.id; touch(); openCard(); T.Shell.open({ kind: 'map', ref: it.id }); }, M.id); e.target.value = o.map || ''; return; } o.map = v || null; if (o.map) { const mm = S().get(o.map); if (mm && !mm.meta?.parent) S().update(mm.id, { meta: { parent: M.id } }); } touch(); openCard(); } },
              h('option', { value: '' }, sub ? '— desligar —' : 'Mapa dentro deste lugar…'), ...T.Maps.list(pid).filter(m => m.id !== M.id).map(m => h('option', { value: m.id, selected: o.map === m.id }, m.title)), h('option', { value: '__new' }, '＋ Criar mapa encaixado…')));
          cardAdd(head('pin', PIN_NAMES[o.icon] || 'Lugar'), field('Nome', title), field('Ícone', icons), field('Cor', hueRow(o.hue ?? 350, v => o.hue = v)),
            field('Página da wiki', pageRow), page ? h('button.btn.sm', { onclick: () => T.Shell.open({ kind: 'page', ref: page.id }, { side: true }) }, icon('book'), 'Abrir ' + page.title) : null,
            field('Mapa encaixado', subRow), field('Imagem', imgBox), field('Notas', area(o.note, v => o.note = v, 'O que acontece aqui, quem vive aqui…')));
          if (focusTitle) setTimeout(() => { title.focus(); title.select(); }, 30);
        } else if (sel.type === 'label') {
          const kind = h('select.select', Object.entries(LABEL_KINDS).map(([k, n]) => h('option', { value: k, selected: o.kind === k }, n))); kind.onchange = () => { o.kind = kind.value; touch(); };
          const size = h('input', { type: 'range', min: .4, max: 4, step: .05, value: o.size || 1 }); size.oninput = () => { o.size = +size.value; touch(); };
          const rotI = h('input', { type: 'range', min: -90, max: 90, step: 1, value: o.rot || 0 }); rotI.oninput = () => { o.rot = +rotI.value; touch(); };
          const cuI = h('input', { type: 'range', min: -100, max: 100, step: 1, value: o.curve || 0 }); cuI.oninput = () => { o.curve = Math.abs(+cuI.value) < 4 ? 0 : +cuI.value; touch(); };
          cardAdd(head('text', 'Nome no mapa'), field('Texto', txt(o.text, v => o.text = v)), field('Estilo', kind), field('Tamanho', size), field('Inclinação', rotI), field('Curva (para seguir rios e montanhas)', cuI));
        } else if (sel.type === 'stamp') {
          const d = T.MapStamps.get(o.k) || { name: 'Carimbo' };
          const rg = (min, max, step, val, fn) => { const r = h('input', { type: 'range', min, max, step, value: val }); r.oninput = () => { fn(+r.value); requestDraw(); save(); }; return r; };
          const tints = h('div.mp-row', h('button.btn.sm' + (o.t == null ? '.on' : ''), { onclick: () => { o.t = null; touch(); openCard(); } }, 'Cor natural'), T.swatches(o.t ?? 200, (hh) => { o.t = hh; touch(); openCard(); }));
          cardAdd(head('tree', d.name),
            h('div.mp-row', h('span.mp-st-th', T.MapStamps.thumb(o.k, stampStyle(), 56)), h('p.mp-tip', 'Arraste para mover. Delete apaga, Ctrl+Z desfaz o último carimbo.')),
            field('Tamanho', rg(10, 400, 1, o.s || 60, v => o.s = v)), field('Girar', rg(-180, 180, 1, o.r || 0, v => o.r = v)), field('Transparência', rg(.15, 1, .05, o.o ?? 1, v => o.o = v)),
            field('Cor', tints),
            h('div.mp-row', { style: { flexWrap: 'wrap', gap: '6px' } },
              h('button.btn.sm', { onclick: () => { o.f = o.f ? 0 : 1; touch(); } }, '⇋ Espelhar'),
              h('button.btn.sm', { onclick: () => { const c = Object.assign({}, o, { id: T.id(), x: o.x + .02, y: o.y + .02 }); M.stamps.push(c); actions.push({ stamps: [c.id] }); sel = { type: 'stamp', id: c.id }; touch(); openCard(); } }, icon('copy'), 'Duplicar'),
              h('button.btn.sm', { onclick: () => { M.stamps = M.stamps.filter(x => x !== o); M.stamps.push(o); o.z = (Math.max(0, ...M.stamps.map(x => x.z || 0))) + 1; touch(); } }, 'Para a frente'),
              h('button.btn.sm', { onclick: () => { M.stamps = M.stamps.filter(x => x !== o); M.stamps.unshift(o); o.z = (Math.min(0, ...M.stamps.map(x => x.z || 0))) - 1; touch(); } }, 'Para trás')));
        } else if (sel.type === 'zone') {
          cardAdd(head('zone', 'Zona'), field('Nome', txt(o.name, v => o.name = v, 'Reino, território, bairro…')), field('Cor', hueRow(o.hue ?? 30, v => o.hue = v)),
            field('Página da wiki', pageSelect(o.page, v => { o.page = v; touch(); })), field('Notas', area(o.note, v => o.note = v)), h('p.mp-tip', 'Arraste os pontos brancos para ajustar a borda, ou arraste a zona inteira.'));
        } else if (sel.type === 'path') {
          const type = h('select.select', Object.entries(PATH_TYPES).map(([k, t]) => h('option', { value: k, selected: o.type === k }, t.name))); type.onchange = () => { o.type = type.value; touch(); };
          cardAdd(head(PATH_TYPES[o.type]?.icon || 'route', PATH_TYPES[o.type]?.name || 'Caminho'), field('Nome', txt(o.name, v => o.name = v, 'Rio Lethis, Estrada Real…')), field('Tipo', type), h('p.mp-tip', 'Arraste os pontos brancos para mudar o traçado.'));
        } else if (sel.type === 'trail') {
          const c = T.Cal ? T.Cal.cfg(pid) : null;
          const who = pageSelect(o.who, v => { o.who = v; if (v && (!o.name || /^Jornada \d+$/.test(o.name))) o.name = 'Jornada de ' + S().get(v).title; touch(); openCard(); }, 'personagem');
          const list = h('div.mp-tpts');
          o.pts.forEach((p, i) => {
            const lab = h('input.input', { value: p.label || '', placeholder: i === 0 ? 'Partida' : 'Parada ' + (i + 1) }); lab.oninput = () => { p.label = lab.value; requestDraw(); save(); };
            const scs = T.MS ? T.MS.flat(pid) : [];
            const sc = h('select.select', h('option', { value: '' }, 'Cena…'), ...scs.map(s => h('option', { value: s.id, selected: p.scene === s.id }, s.title || 'Sem título'))); sc.onchange = () => { p.scene = sc.value || null; save(); };
            list.appendChild(h('div.mp-tpt', h('span.mp-tn', String(i + 1)), h('div.grow', lab, c ? T.Cal.datePicker(c, p.date, (v) => { p.date = v; save(); }, { clear: true }) : null, sc,
              p.scene ? h('button.btn.sm', { onclick: () => T.Shell.open({ kind: 'doc', ref: p.scene }, { side: true }) }, icon('scene'), 'Abrir cena') : null),
              h('button.icon-btn.sm', { title: 'Tirar esta parada', onclick: () => { o.pts.splice(i, 1); touch(); openCard(); } }, icon('x'))));
          });
          cardAdd(head('route', 'Trilha'), field('Nome', txt(o.name, v => o.name = v)), field('Personagem', who), field('Cor', hueRow(o.hue ?? 210, v => o.hue = v)),
            h('div.mp-row', h('button.btn.sm' + (tool === 'trilha' ? '.primary' : ''), { onclick: () => setTool('trilha') }, icon('plus'), 'Adicionar paradas'), h('button.btn.sm', { onclick: () => { startPlay(); } }, icon('play'), 'Reproduzir')),
            h('p.mp-tip', 'Com a ferramenta Trilha, cada clique no mapa vira uma parada. Ponha datas do calendário para os personagens andarem juntos no tempo certo.'), list);
        }
      }

      /* ----- barra de ferramentas ----- */
      const TOOLS = [
        ['mover', 'hand', 'Mover e escolher (V)'], ['esculpir', 'mountain', 'Esculpir o terreno (E)'], ['bioma', 'brush', 'Pintar biomas (B)'], ['carimbo', 'tree', 'Carimbos: montanhas, árvores, castelos, navios… (S)'],
        ['caminho', 'river', 'Rios, estradas e muralhas (C)'], ['nome', 'text', 'Escrever nomes (N)'], ['pin', 'pin', 'Pôr um pin (P)'], ['zona', 'zone', 'Desenhar zona (Z)'], ['trilha', 'route', 'Trilha de jornada (T)'],
      ];
      function setTool(t){ if (drawing && t !== tool) finishDrawing(); tool = t; buildBar(); buildOpt(); persistTab(); requestDraw(); hintFor(); }
      function hintFor(){
        const H = {
          mover: 'Arraste para andar pelo mapa, role para aproximar. Clique em algo para editar; arraste pins, nomes e pontos. Duplo clique num pin com ›: entrar no mapa dele.',
          esculpir: 'Pinte para mudar o relevo. Shift + rolar muda o tamanho do pincel. Ctrl+Z desfaz.',
          bioma: 'Pinte florestas, desertos, neve… Montanha também ergue o terreno.',
          caminho: brush.path === 'auto' ? 'Clique numa montanha: o rio desce sozinho até o mar.' : 'Arraste para desenhar à mão livre, ou clique ponto a ponto e dê duplo clique (ou Enter) para terminar.',
          nome: 'Clique onde o nome deve ficar. Depois dá para arrastar, girar e mudar o tamanho.',
          pin: 'Clique para pôr um pin. A ficha abre ao lado para ligar à wiki, a uma imagem ou a um mapa encaixado.',
          zona: 'Clique para marcar os cantos. Clique no primeiro ponto, dê duplo clique ou Enter para fechar.',
          carimbo: brush.scatter ? 'Arraste para espalhar carimbos (como um pincel). Bom para florestas e cordilheiras. Ctrl+Z desfaz.' : 'Clique para carimbar. Depois, com Mover, clique num carimbo para mudar tamanho, girar, espelhar ou pintar.',
          trilha: 'Cada clique é uma parada da jornada. Escolha a trilha na ficha para continuar uma que já existe.',
        };
        hint.textContent = view3 ? (tool === 'esculpir' || tool === 'bioma' ? 'No 3D: pinte direto no relevo. Arraste com o botão direito (ou Shift) para girar.' : 'Arraste para girar, role para aproximar. Esculpir e Bioma funcionam aqui também.') : (H[tool] || '');
      }
      function buildBar(){
        bar.innerHTML = '';
        bar.appendChild(h('button.icon-btn.mp-clean-btn' + (tab.clean ? '.on' : ''), { type: 'button', title: tab.clean ? 'Mostrar os painéis (H)' : 'Esconder os painéis para ver o mapa inteiro (H)', onclick: toggleClean }, icon(tab.clean ? 'eye' : 'eyeoff')));
        const par = M.parent ? S().get(M.parent) : null;
        if (par) bar.appendChild(h('button.btn.sm', { title: 'Voltar para o mapa de fora', onclick: () => T.Shell.open({ kind: 'map', ref: par.id }) }, icon('back'), par.title));
        bar.appendChild(h('button.mp-title', { title: 'Renomear', onclick: async () => { const t = await T.ask('Nome do mapa', { value: S().get(M.id)?.title }); if (t) { S().update(M.id, { title: t }); T.emit('tab-title', tab); T.emit('tree-changed'); buildBar(); } } }, S().get(M.id)?.title || 'Mapa'));
        if (M.kind === 'world') bar.appendChild(h('div.seg', h('button' + (!view3 ? '.on' : ''), { onclick: () => set3(false) }, 'Mapa'), h('button' + (view3 ? '.on' : ''), { onclick: () => set3(true) }, icon('cube'), '3D')));
        const tg = h('div.mp-tools');
        TOOLS.forEach(([k, ic, t]) => { if (M.kind !== 'world' && (k === 'esculpir' || k === 'bioma')) return; if (view3 && !['mover', 'esculpir', 'bioma'].includes(k)) return; tg.appendChild(h('button.icon-btn' + (tool === k ? '.on' : ''), { title: t, 'aria-label': t, onclick: () => setTool(k) }, icon(ic))); });
        bar.appendChild(tg);
        if (M.kind === 'world') bar.appendChild(h('button.icon-btn', { title: 'Desfazer no terreno (Ctrl+Z)', onclick: doUndo }, icon('undo')));
        bar.appendChild(T.menuButton('wand', 'Estilo', 'Estilo, luz, nível do mar e nuvens', (b) => styleMenu(b)));
        bar.appendChild(T.menuButton('layers', 'Camadas', 'Mostrar ou esconder e achar coisas no mapa', (b) => layersMenu(b)));
        if (M.trails.length) bar.appendChild(h('button.btn.sm', { title: 'Reproduzir as trilhas', onclick: () => pb.on ? stopPlay() : startPlay() }, icon(pb.on ? 'pause' : 'play'), 'Jornadas'));
        bar.appendChild(T.menuButton('dots', '', 'Mais', (b) => T.menuAt(b, [
          M.kind === 'world' ? { label: 'Gerar outro terreno…', icon: 'dice', fn: regen } : null,
          M.kind === 'image' ? { label: 'Trocar a imagem…', icon: 'image', fn: swapImage } : null,
          { label: 'Enquadrar o mapa', icon: 'focus', fn: () => { fit(); requestDraw(); persistTab(); } },
          { label: 'Baixar como imagem (PNG)', icon: 'download', fn: exportPNG },
          '-', { label: 'Todos os mapas', icon: 'map', fn: () => T.Shell.open({ kind: 'maps', ref: 'maps' }) },
        ])));
      }
      function buildOpt(){
        opt.innerHTML = ''; opt.appendChild(panelGrip(opt, 'optPos', 'optMini', { esculpir: 'Pincel de relevo', bioma: 'Biomas', caminho: 'Caminhos', nome: 'Nomes', carimbo: 'Carimbos' }[tool] || '')); placePanel(opt, 'optPos'); opt.classList.toggle('hidden', !['esculpir', 'bioma', 'caminho', 'nome', 'carimbo'].includes(tool)); opt.classList.toggle('mp-opt-st', tool === 'carimbo');
        const rng = (label, key, min, max, step) => { const r = h('input', { type: 'range', min, max, step, value: brush[key] }); r.oninput = () => { brush[key] = +r.value; persistTab(); requestDraw(); }; return h('label.mp-rng', h('span', label), r); };
        if (tool === 'esculpir') {
          [['elevar', 'raise', 'Erguer'], ['rebaixar', 'lower', 'Rebaixar'], ['suavizar', 'smooth', 'Suavizar'], ['achatar', 'flat', 'Planalto'], ['rugoso', 'mountain', 'Rugoso'], ['mar', 'river', 'Afundar no mar']].forEach(([k, ic, n]) => opt.appendChild(h('button.btn.sm' + (brush.sculpt === k ? '.on' : ''), { onclick: () => { brush.sculpt = k; buildOpt(); persistTab(); } }, icon(ic), n)));
          opt.append(rng('Tamanho', 'size', 1, 60, 1), rng('Força', 'power', .05, 1, .05));
        } else if (tool === 'bioma') {
          BIOMES.forEach(b => { const c = b.c || [200, 200, 200]; const btn = h('button.mp-bio' + (brush.biome === b.id ? '.on' : ''), { title: b.name, onclick: () => { brush.biome = b.id; buildOpt(); persistTab(); } }, h('span.sw', { style: { background: b.id ? `rgb(${c.join(',')})` : 'conic-gradient(#8fae5d 0 25%, #e0c488 0 50%, #eef1f5 0 75%, #4f7a3a 0)' } }), b.name); opt.appendChild(btn); });
          opt.append(rng('Tamanho', 'size', 1, 60, 1));
        } else if (tool === 'caminho') {
          Object.entries(PATH_TYPES).forEach(([k, t]) => opt.appendChild(h('button.btn.sm' + (brush.path === k ? '.on' : ''), { onclick: () => { brush.path = k; buildOpt(); hintFor(); persistTab(); } }, icon(t.icon), t.name)));
          if (M.kind === 'world') opt.appendChild(h('button.btn.sm' + (brush.path === 'auto' ? '.on' : ''), { onclick: () => { brush.path = 'auto'; buildOpt(); hintFor(); persistTab(); } }, icon('wand'), 'Rio automático'));
          if (drawing) opt.appendChild(h('button.btn.sm.primary', { onclick: finishDrawing }, icon('check'), 'Terminar'));
        } else if (tool === 'carimbo') {
          const MS = T.MapStamps; const cats = h('div.seg.mp-st-cats', MS.CATS.map(([k, n]) => { const b = h('button', { type: 'button', onclick: () => { brush.stampCat = k; buildOpt(); persistTab(); } }, n); if (brush.stampCat === k) b.classList.add('on'); return b; }));
          const grid = h('div.mp-st-grid', MS.LIST.filter(x => x.cat === brush.stampCat).map(x => h('button.mp-st' + (brush.stamp === x.k ? '.on' : ''), { type: 'button', title: x.name, onclick: () => { brush.stamp = x.k; buildOpt(); persistTab(); } }, MS.thumb(x.k, stampStyle(), 42), h('span', x.name))));
          const mode = h('div.seg', [[false, 'Um por clique'], [true, 'Espalhar (pincel)']].map(([k, n]) => { const b = h('button', { type: 'button', onclick: () => { brush.scatter = k; buildOpt(); hintFor(); persistTab(); } }, n); if (brush.scatter === k) b.classList.add('on'); return b; }));
          const tint = h('div.mp-row', h('button.btn.sm' + (brush.stampTint == null ? '.on' : ''), { onclick: () => { brush.stampTint = null; buildOpt(); persistTab(); } }, 'Cor natural'), T.swatches(brush.stampTint ?? 200, (hh) => { brush.stampTint = hh; buildOpt(); persistTab(); }));
          opt.append(h('div.mp-st-top', cats, mode), grid, h('div.mp-st-ctl', rng('Tamanho', 'stampSize', 12, 260, 1), rng('Variação', 'vary', 0, 1, .05), brush.scatter ? rng('Área', 'spread', 15, 220, 1) : null, brush.scatter ? rng('Densidade', 'density', .1, 1, .05) : null, tint));
        } else if (tool === 'nome') {
          Object.entries(LABEL_KINDS).forEach(([k, n]) => opt.appendChild(h('button.btn.sm' + (brush.label === k ? '.on' : ''), { onclick: () => { brush.label = k; buildOpt(); persistTab(); } }, n)));
        }
      }
      function styleMenu(btn){
        const box = h('div.mp-pop');
        const row = (t, el) => h('div.mp-pop-r', h('b', t), el);
        if (M.kind === 'world') {
          box.appendChild(row('Estilo', h('div.seg', Object.entries(STYLES).map(([k, n]) => h('button' + (M.style === k ? '.on' : ''), { onclick: () => { M.style = k; rebuildArt(); save(); styleMenu(btn); } }, n)))));
          const sea = h('input', { type: 'range', min: .2, max: .7, step: .005, value: M.sea }); sea.oninput = () => { M.sea = +sea.value; finishArt(); if (three) three.sea(M.sea); save(); };
          const li = h('input', { type: 'range', min: 0, max: 359, step: 1, value: M.light }); li.oninput = () => { M.light = +li.value; finishArt(); if (three) three.light(M.light); save(); };
          const ex = h('input', { type: 'range', min: .3, max: 3, step: .05, value: M.exag }); ex.oninput = () => { M.exag = +ex.value; finishArt(); if (three) three.exag(M.exag); save(); };
          box.append(row('Nível do mar', sea), row('Direção da luz', li), row('Altura do relevo', ex),
            h('label.mp-chk', h('input', { type: 'checkbox', checked: !M.hide.symbols, onchange: (e) => { M.hide.symbols = !e.target.checked; rebuildArt(); save(); } }), 'Símbolos de montanha e floresta'),
            h('label.mp-chk', h('input', { type: 'checkbox', checked: M.clouds, onchange: (e) => { M.clouds = e.target.checked; if (three) three.clouds(M.clouds); loop(); save(); requestDraw(); } }), 'Nuvens passando'));
        } else if (M.kind === 'image') {
          box.appendChild(row('Tom da imagem', h('div.seg', [['original', 'Original'], ['antigo', 'Antigo'], ['desbotado', 'Desbotado'], ['noite', 'Noite']].map(([k, n]) => h('button' + (M.tone === k ? '.on' : ''), { onclick: () => { M.tone = k; requestDraw(); save(); styleMenu(btn); } }, n)))));
        }
        box.appendChild(row('Textura do papel', h('div.seg', [['', 'Nenhuma'], ['pergaminho', 'Pergaminho'], ['papel', 'Papel'], ['tecido', 'Tecido']].map(([k, n]) => h('button' + (M.texture === k ? '.on' : ''), { onclick: () => { M.texture = k; touch(); styleMenu(btn); } }, n)))));
        if (M.texture) { const ts = h('input', { type: 'range', min: .05, max: .8, step: .01, value: M.texStr }); ts.oninput = () => { M.texStr = +ts.value; touch(); }; box.appendChild(row('Força da textura', ts)); }
        box.appendChild(row('Moldura', h('div.seg', [['', 'Nenhuma'], ['simples', 'Simples'], ['antiga', 'Antiga'], ['ornamentada', 'Ornamentada']].map(([k, n]) => h('button' + (M.frame === k ? '.on' : ''), { onclick: () => { M.frame = k; touch(); styleMenu(btn); } }, n)))));
        box.appendChild(h('p.mp-tip', 'Os nomes usam letras de mapa antigo. Mude o estilo de cada nome clicando nele (dá até para curvar).'));
        T.popover(btn, box);
      }
      function layersMenu(btn){
        const box = h('div.mp-pop');
        const chk = (k, n) => h('label.mp-chk', h('input', { type: 'checkbox', checked: !M.hide[k], onchange: (e) => { M.hide[k] = !e.target.checked; requestDraw(); save(); } }), n);
        box.append(h('b', 'Mostrar'), h('div.mp-chks', chk('pins', 'Pins'), chk('pinNames', 'Nomes dos pins'), chk('labels', 'Nomes do mapa'), chk('stamps', 'Carimbos'), chk('paths', 'Rios, estradas e muralhas'), chk('zones', 'Zonas'), chk('trails', 'Trilhas')));
        const go = (s) => { sel = s; const o = objOf(s); const p = s.type === 'pin' || s.type === 'label' ? [o.x, o.y] : s.type === 'trail' ? [o.pts[0]?.x, o.pts[0]?.y] : o.pts[0]; if (p && p[0] != null) { const [sx, sy] = nToS(p[0], p[1]); vw.ox += CW() / 2 - sx; vw.oy += CH() / 2 - sy; } openCard(); requestDraw(); T.closePopover(); };
        const lst = (t, arr, type, name) => arr.length ? h('div.mp-lst', h('b', t), arr.map(o => h('button', { onclick: () => go({ type, id: o.id }) }, name(o)))) : null;
        box.append(...[lst('Pins', M.pins, 'pin', o => o.title || 'Pin'), lst('Zonas', M.zones, 'zone', o => o.name || 'Zona'),
          lst('Trilhas', M.trails, 'trail', o => h('span', h('label', { onclick: (e) => e.stopPropagation() }, h('input', { type: 'checkbox', checked: !M.hide['tr_' + o.id], onchange: (e) => { M.hide['tr_' + o.id] = !e.target.checked; requestDraw(); save(); } })), ' ', o.name || 'Trilha')),
          lst('Nomes', M.labels, 'label', o => o.text || 'Nome'), lst('Caminhos', M.paths, 'path', o => (o.name || PATH_TYPES[o.type]?.name || 'Caminho'))].filter(Boolean));
        T.popover(btn, box);
      }
      async function regen(){
        T.modal((box, close) => {
          let g = 'continente';
          const seg = h('div.seg', [['continente', 'Continente'], ['ilhas', 'Arquipélago'], ['pangeia', 'Supercontinente'], ['vazio', 'Oceano vazio']].map(([k, n]) => { const b = h('button' + (g === k ? '.on' : ''), { onclick: () => { g = k; seg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); } }, n); return b; }));
          box.append(h('h2', 'Gerar outro terreno'), h('p.sub', 'O relevo e os biomas pintados são trocados. Pins, nomes, zonas e trilhas ficam. Dá para desfazer com Ctrl+Z.'), seg,
            h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Cancelar'), h('button.btn.primary', { onclick: () => { pushUndo(); M.seed = (Math.random() * 1e6) | 0; M.Hm = generate(M.W, M.H, g, M.seed); M.B = new Uint8Array(M.W * M.H); if (three) three.heights(0, 0, M.W - 1, M.H - 1); rebuildArt(); save(); close(); } }, 'Gerar')));
        });
      }
      async function swapImage(){ const f = await T.pickFile('image/*'); if (!f) return; const ref = await T.Assets.upload(f); if (!ref) return; M.img = ref; await loadImg(); save(); requestDraw(); }
      async function exportPNG(){
        const out = document.createElement('canvas'); out.width = M.AW; out.height = M.AH; const c = out.getContext('2d');
        if (M.kind === 'image' && imgEl) c.drawImage(imgEl, 0, 0, M.AW, M.AH); else c.drawImage(art, 0, 0);
        const v = { ox: 0, oy: 0, z: 1 }; const keepSel = sel; sel = null; drawTexture(c, v); drawZones(c, v); drawPaths(c, v); drawStamps(c, v); drawLabels(c, v); drawTrails(c, v); drawPins(c, v); drawFrame(c, v); sel = keepSel;
        out.toBlob(async (b) => { const name = (S().get(M.id)?.title || 'mapa') + '.png'; const ok = await T.Download.save(name, b); if (ok === null) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); } }, 'image/png');
      }

      /* ----- reprodução das jornadas ----- */
      function startPlay(){ if (!M.trails.some(t => t.pts.length > 1)) return T.toast('Ponha pelo menos duas paradas numa trilha.'); if (view3) set3(false); pb.on = true; if (pb.t >= 1) pb.t = 0; pb.last = 0; play.classList.remove('hidden'); wrap.classList.add('playing'); buildPlay(); buildBar(); loop(); }
      function stopPlay(){ pb.on = false; buildPlay(); buildBar(); }
      function buildPlay(){
        play.innerHTML = '';
        const dr = datedRange();
        const sl = h('input', { type: 'range', min: 0, max: 1, step: .001, value: pb.t }); sl.oninput = () => { pb.t = +sl.value; requestDraw(); cap(); };
        const capEl = h('span.mp-play-cap');
        const cap = () => { if (dr) capEl.textContent = T.Cal.fmt(dr.c, T.Cal.fromAbs(dr.c, Math.round(lerp(dr.lo, dr.hi, pb.t)))); else capEl.textContent = Math.round(pb.t * 100) + '% do caminho'; };
        cap(); buildPlay.sync = () => { sl.value = pb.t; cap(); };
        play.append(h('button.icon-btn', { title: pb.on ? 'Pausar' : 'Reproduzir', onclick: () => pb.on ? stopPlay() : startPlay() }, icon(pb.on ? 'pause' : 'play')), sl, capEl,
          h('span.muted', dr ? 'pelas datas do calendário' : 'sem datas: todos no mesmo ritmo'),
          h('button.icon-btn', { title: 'Fechar', onclick: () => { pb.on = false; pb.t = 0; play.classList.add('hidden'); wrap.classList.remove('playing'); buildBar(); requestDraw(); } }, icon('x')));
      }
      function loop(){
        cancelAnimationFrame(raf);
        const step = (now) => {
          if (destroyed) return; let again = false;
          const dt = pb.last ? (now - pb.last) / 1000 : 0; pb.last = now;
          if (pb.on) { pb.t = Math.min(1, pb.t + dt / 14); if (pb.t >= 1) { pb.on = false; buildPlay(); buildBar(); } else again = true; buildPlay.sync && buildPlay.sync(); }
          if (M.clouds && !view3) { cloudT += dt || .016; again = true; }
          draw(); if (again) raf = requestAnimationFrame(step); else pb.last = 0;
        };
        raf = requestAnimationFrame(step);
      }

      /* ----- 3D ----- */
      function set3(on){
        if (on && !T.Map3D) return T.toast('O 3D não abriu neste navegador.');
        view3 = on; wrap.classList.toggle('is3d', on);
        if (on) {
          if (!['mover', 'esculpir', 'bioma'].includes(tool)) tool = 'mover';
          if (!three) three = T.Map3D.mount(host3, M, {
            texture: textureCanvas(),
            onFrame: () => draw3Overlay(),
            paint: (gx, gy, start) => { if (tool !== 'esculpir' && tool !== 'bioma') return false; if (start) { pushUndo(); stroking = true; flatTarget = M.hAt(gx, gy); } strokeAt(gx, gy); return true; },
            paintEnd: () => endStroke(),
            wantsPaint: () => tool === 'esculpir' || tool === 'bioma',
          });
          if (!three) { view3 = false; wrap.classList.remove('is3d'); return T.toast('O 3D não abriu neste navegador.'); }
          three.texture(textureCanvas());
        }
        buildBar(); buildOpt(); hintFor(); persistTab(); requestDraw();
      }

      async function loadImg(){ if (M.kind !== 'image') return; const u = await T.Assets.resolve(M.img); if (!u) { T.toast('A imagem deste mapa foi guardada em outro computador.'); return; } await new Promise(r => { const im = new Image(); im.onload = () => { imgEl = im; r(); }; im.onerror = r; im.src = u; }); }

      (async () => {
        await M.ready(item); if (destroyed) return;
        await loadImg();
        try { await document.fonts.load('20px "IM Fell English"'); await document.fonts.load('700 20px Cinzel'); } catch (e) {}
        loading.remove();
        resize(); if (tab.vw) vw = Object.assign({}, tab.vw); else fit();
        rebuildArt(); buildBar(); buildOpt(); hintFor();
        if (tab.focusPin) { const p = M.pins.find(x => x.id === tab.focusPin); if (p) { sel = { type: 'pin', id: p.id }; const [sx, sy] = nToS(p.x, p.y); vw.ox += CW() / 2 - sx; vw.oy += CH() / 2 - sy; openCard(); } delete tab.focusPin; }
        if (view3 && M.kind === 'world') { view3 = false; set3(true); }
        if (M.clouds) loop();
      })();

      return {
        destroy(){ destroyed = true; cancelAnimationFrame(raf); ro.disconnect(); roBar.disconnect(); document.removeEventListener('keydown', onKey); if (three) three.destroy(); save._final = true; save.flush && save.flush(); persistTab.flush && persistTab.flush(); },
      };
    }
  };
})(window.T);
