/* Tinteiro — mapa em 3D: maquete do terreno com água, nuvens e pincel direto no relevo (WebGL) */
(function(T){
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  /* ---------- matrizes 4x4 (coluna) ---------- */
  const M4 = {
    persp(fy, asp, n, f){ const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); },
    look(e, c, u){
      let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2]; let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
      let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
    },
    mul(a, b){ const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
    inv(m){
      const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
      const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
      const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      let d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!d) return null; d = 1 / d;
      return new Float32Array([
        (a11 * b11 - a12 * b10 + a13 * b09) * d, (a02 * b10 - a01 * b11 - a03 * b09) * d, (a31 * b05 - a32 * b04 + a33 * b03) * d, (a22 * b04 - a21 * b05 - a23 * b03) * d,
        (a12 * b08 - a10 * b11 - a13 * b07) * d, (a00 * b11 - a02 * b08 + a03 * b07) * d, (a32 * b02 - a30 * b05 - a33 * b01) * d, (a20 * b05 - a22 * b02 + a23 * b01) * d,
        (a10 * b10 - a11 * b08 + a13 * b06) * d, (a01 * b08 - a00 * b10 - a03 * b06) * d, (a30 * b04 - a31 * b02 + a33 * b00) * d, (a21 * b02 - a20 * b04 - a23 * b00) * d,
        (a11 * b07 - a10 * b09 - a12 * b06) * d, (a00 * b09 - a01 * b07 + a02 * b06) * d, (a31 * b01 - a30 * b03 - a32 * b00) * d, (a20 * b03 - a21 * b01 + a22 * b00) * d]);
    },
    xf(m, v){ const o = [0, 0, 0, 0]; for (let r = 0; r < 4; r++) o[r] = m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r] * v[3]; return o; },
  };

  const VS = `attribute vec3 aP; attribute vec3 aN; attribute vec2 aU; uniform mat4 uVP; uniform float uOff; varying vec3 vN; varying vec2 vU; varying vec3 vP;
void main(){ vN=aN; vU=aU; vP=aP+aN*uOff; gl_Position=uVP*vec4(vP,1.); }`;
  const FS_TERRAIN = `precision mediump float; uniform sampler2D uT; uniform vec3 uL; uniform vec3 uEye; uniform float uSea; varying vec3 vN; varying vec2 vU; varying vec3 vP;
void main(){ vec3 n=normalize(vN); vec3 b=pow(texture2D(uT,vU).rgb,vec3(2.2));
  float lam=max(dot(n,uL),0.); float sky=.5+.5*n.y;
  vec3 col=b*(vec3(1.,.95,.88)*lam*1.35+vec3(.4,.47,.62)*sky*.6);
  if(vP.y<uSea){ float d=clamp((uSea-vP.y)*22.,0.,1.); col=mix(col,col*vec3(.3,.5,.65),d); }
  float fog=clamp(length(vP-uEye)*.18-.25,0.,.4); col=mix(col,vec3(.72,.78,.88),fog*.45);
  gl_FragColor=vec4(pow(col,vec3(1./2.2)),1.); }`;
  const FS_SIDE = `precision mediump float; uniform vec3 uL; varying vec3 vN; varying vec2 vU; varying vec3 vP;
void main(){ vec3 n=normalize(vN); float lam=max(dot(n,uL),0.)*.8+.35;
  float band=.5+.5*sin(vP.y*160.+sin(vP.x*30.+vP.z*30.)*1.5);
  vec3 c=mix(vec3(.2,.14,.1),vec3(.38,.28,.19),band); c*=.55+.45*clamp(vP.y*12.+.6,0.,1.);
  if(vP.y<-.035) c=vec3(.12,.09,.07);
  gl_FragColor=vec4(c*lam,1.); }`;
  const FS_WATER = `precision mediump float; uniform vec3 uL; uniform vec3 uEye; uniform float uTime; uniform float uA; varying vec3 vN; varying vec2 vU; varying vec3 vP;
void main(){ vec3 v=normalize(uEye-vP); vec3 n=normalize(vN+vec3(sin(vP.x*61.+vP.z*23.+uTime*1.3)*.006+sin(vP.x*137.-vP.z*91.-uTime*1.7)*.004,0.,cos(vP.z*57.-vP.x*31.+uTime*1.1)*.006+cos(vP.z*149.+vP.x*83.+uTime*2.)*.004));
  float fr=pow(1.-max(dot(n,v),0.),3.);
  vec3 c=mix(vec3(.04,.2,.32),vec3(.55,.72,.84),fr);
  float sp=pow(max(dot(reflect(-uL,n),v),0.),90.)*1.2;
  gl_FragColor=vec4(c+sp,uA+fr*.25); }`;
  const FS_CLOUD = `precision mediump float; uniform sampler2D uT; uniform float uTime; uniform vec3 uL; varying vec2 vU;
void main(){ float a=texture2D(uT,vU*1.3+vec2(uTime*.006,uTime*.002)).a; a*=texture2D(uT,vU*.7-vec2(uTime*.003,0.)+.3).a*1.6;
  gl_FragColor=vec4(vec3(1.,.99,.97)*(.85+.15*uL.y),clamp(a,0.,.8)); }`;

  function prog(gl, fs){
    const mk = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn('[mapa 3D]', gl.getShaderInfoLog(o)); return null; } return o; };
    const v = mk(gl.VERTEX_SHADER, VS), f = mk(gl.FRAGMENT_SHADER, fs); if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.bindAttribLocation(p, 0, 'aP'); gl.bindAttribLocation(p, 1, 'aN'); gl.bindAttribLocation(p, 2, 'aU'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('[mapa 3D]', gl.getProgramInfoLog(p)); return null; }
    const u = {}; ['uVP', 'uT', 'uL', 'uEye', 'uSea', 'uTime', 'uA', 'uOff'].forEach(k => u[k] = gl.getUniformLocation(p, k));
    return { p, u };
  }

  T.Map3D = {
    mount(host, M, opts){
      const cv = document.createElement('canvas'); cv.className = 'mp-gl'; host.prepend(cv);
      const gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
      if (!gl) { cv.remove(); return null; }
      const P = { t: prog(gl, FS_TERRAIN), s: prog(gl, FS_SIDE), w: prog(gl, FS_WATER), c: prog(gl, FS_CLOUD) };
      if (!P.t || !P.s || !P.w || !P.c) { cv.remove(); return null; }
      const W = M.W, H = M.H, AR = M.AR, n = W * H;
      let VS_ = .16 * M.exag, sea = M.sea, az = M.light, clouds = M.clouds;
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; pos[i * 3] = (x / (W - 1) - .5) * AR; pos[i * 3 + 2] = y / (H - 1) - .5; uv[i * 2] = x / (W - 1); uv[i * 2 + 1] = y / (H - 1); }
      const idx = new Uint16Array((W - 1) * (H - 1) * 6); let k = 0;
      for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) { const i = y * W + x; idx[k++] = i; idx[k++] = i + W; idx[k++] = i + 1; idx[k++] = i + 1; idx[k++] = i + W; idx[k++] = i + W + 1; }
      const bPos = gl.createBuffer(), bNor = gl.createBuffer(), bUv = gl.createBuffer(), bIdx = gl.createBuffer();
      const A = M.Hm;
      const dx = AR / (W - 1), dz = 1 / (H - 1);
      function calc(x0, y0, x1, y1){
        x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W - 1, x1); y1 = Math.min(H - 1, y1);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const i = y * W + x; pos[i * 3 + 1] = A[i] * VS_;
          const hl = A[y * W + Math.max(0, x - 1)], hr = A[y * W + Math.min(W - 1, x + 1)], hu = A[Math.max(0, y - 1) * W + x], hd = A[Math.min(H - 1, y + 1) * W + x];
          let nx = (hl - hr) * VS_ / (2 * dx), ny = 1, nz = (hu - hd) * VS_ / (2 * dz); const l = Math.hypot(nx, ny, nz); nor[i * 3] = nx / l; nor[i * 3 + 1] = ny / l; nor[i * 3 + 2] = nz / l;
        }
      }
      calc(0, 0, W - 1, H - 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bNor); gl.bufferData(gl.ARRAY_BUFFER, nor, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bUv); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      // laterais da maquete e da água
      const bSide = { p: gl.createBuffer(), n: gl.createBuffer(), u: gl.createBuffer(), count: 0 };
      const bWS = { p: gl.createBuffer(), n: gl.createBuffer(), u: gl.createBuffer(), count: 0 };
      const BOT = -.045;
      function perimeter(){ const out = []; for (let x = 0; x < W; x++) out.push([x, 0, 0, 0, -1]); for (let y = 0; y < H; y++) out.push([W - 1, y, 1, 0, 0]); for (let x = W - 1; x >= 0; x--) out.push([x, H - 1, 0, 0, 1]); for (let y = H - 1; y >= 0; y--) out.push([0, y, -1, 0, 0]); return out; }
      const PER = perimeter();
      function buildSides(){
        const p = [], nn = [], u = [], wp = [], wn = [], wu = [];
        for (let i = 0; i < PER.length - 1; i++) {
          const a = PER[i], b = PER[i + 1]; if (a[2] !== b[2] || a[4] !== b[4]) continue;
          const ia = a[1] * W + a[0], ib = b[1] * W + b[0];
          const ax = pos[ia * 3], az_ = pos[ia * 3 + 2], bx = pos[ib * 3], bz = pos[ib * 3 + 2];
          const ay = pos[ia * 3 + 1], by = pos[ib * 3 + 1];
          const quad = (arr, narr, uarr, y0a, y1a, y0b, y1b) => { arr.push(ax, y0a, az_, bx, y0b, bz, ax, y1a, az_, ax, y1a, az_, bx, y0b, bz, bx, y1b, bz); for (let q = 0; q < 6; q++) { narr.push(a[2], a[3], a[4]); uarr.push(0, 0); } };
          quad(p, nn, u, BOT, ay, BOT, by);
          const sy = sea * VS_; if (ay < sy || by < sy) quad(wp, wn, wu, BOT, Math.max(sy, ay * 0 + sy), BOT, sy);
        }
        const up = (B, P_, N_, U_) => { gl.bindBuffer(gl.ARRAY_BUFFER, B.p); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(P_), gl.DYNAMIC_DRAW); gl.bindBuffer(gl.ARRAY_BUFFER, B.n); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N_), gl.DYNAMIC_DRAW); gl.bindBuffer(gl.ARRAY_BUFFER, B.u); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(U_), gl.DYNAMIC_DRAW); B.count = P_.length / 3; };
        up(bSide, p, nn, u); up(bWS, wp, wn, wu);
      }
      buildSides();
      // água e nuvens: planos
      const bWater = { p: gl.createBuffer(), n: gl.createBuffer(), u: gl.createBuffer(), count: 6 };
      const bCloud = { p: gl.createBuffer(), n: gl.createBuffer(), u: gl.createBuffer(), count: 6 };
      function plane(B, y, ext){ const x = AR / 2 * ext, z = .5 * ext; const p = [-x, y, -z, -x, y, z, x, y, -z, x, y, -z, -x, y, z, x, y, z]; const nn = []; for (let i = 0; i < 6; i++) nn.push(0, 1, 0); const u = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
        gl.bindBuffer(gl.ARRAY_BUFFER, B.p); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p), gl.DYNAMIC_DRAW); gl.bindBuffer(gl.ARRAY_BUFFER, B.n); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nn), gl.STATIC_DRAW); gl.bindBuffer(gl.ARRAY_BUFFER, B.u); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(u), gl.STATIC_DRAW); }
      plane(bWater, sea * VS_, 1); plane(bCloud, VS_ * 1.35 + .02, 1);
      // texturas
      const tex = gl.createTexture(); const cloudTex = gl.createTexture();
      const setTex = (t, src) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); };
      if (opts.texture) setTex(tex, opts.texture);
      { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const im = x.createImageData(256, 256);
        const hsh = (a, b) => { let n = Math.imul(a, 374761393) ^ Math.imul(b, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
        const vn = (px, py, per) => { const ix = Math.floor(px), iy = Math.floor(py), fx = px - ix, fy = py - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); const g = (a, b) => hsh(((a % per) + per) % per, ((b % per) + per) % per); const a = g(ix, iy), b = g(ix + 1, iy), cc = g(ix, iy + 1), d = g(ix + 1, iy + 1); return a + (b - a) * ux + (cc - a) * uy + (a - b - cc + d) * ux * uy; };
        for (let y = 0; y < 256; y++) for (let xx = 0; xx < 256; xx++) { let s = 0, am = .5, f = 4; for (let o = 0; o < 5; o++) { s += am * vn(xx / 256 * f, y / 256 * f, f); am *= .5; f *= 2; } const a = clamp((s - .5) * 3.4, 0, 1); const i = (y * 256 + xx) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = a * 255; }
        x.putImageData(im, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, cloudTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); }

      /* ----- câmera ----- */
      const cam = { yaw: .5, pitch: .78, dist: 1.5 * Math.max(AR, 1.1), tx: 0, tz: 0 };
      let VP = null, eye = [0, 0, 0], dirty = true, raf = 0, destroyed = false, t0 = performance.now();
      function resize(){ const dpr = Math.min(2, devicePixelRatio || 1); cv.width = host.clientWidth * dpr; cv.height = host.clientHeight * dpr; dirty = true; }
      function camera(){
        const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
        eye = [cam.tx + Math.sin(cam.yaw) * cp * cam.dist, sp * cam.dist + .02, cam.tz + Math.cos(cam.yaw) * cp * cam.dist];
        const pr = M4.persp(.72, cv.width / Math.max(1, cv.height), .02, 30);
        VP = M4.mul(pr, M4.look(eye, [cam.tx, .03, cam.tz], [0, 1, 0]));
      }
      function L(){ const a = az * Math.PI / 180; const v = [Math.sin(a) * .7, .72, -Math.cos(a) * .7]; const l = Math.hypot(...v); return v.map(x => x / l); }
      function bind(B){ gl.bindBuffer(gl.ARRAY_BUFFER, B.p); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ARRAY_BUFFER, B.n); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ARRAY_BUFFER, B.u); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0); }
      function common(pp, time){ gl.useProgram(pp.p); gl.uniformMatrix4fv(pp.u.uVP, false, VP); gl.uniform3fv(pp.u.uL, L()); gl.uniform3fv(pp.u.uEye, eye); gl.uniform1f(pp.u.uSea, sea * VS_); gl.uniform1f(pp.u.uTime, time); gl.uniform1f(pp.u.uOff, 0); }
      function render(){
        const time = (performance.now() - t0) / 1000;
        camera(); gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST); gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2);
        common(P.t, time); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(P.t.u.uT, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ARRAY_BUFFER, bNor); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ARRAY_BUFFER, bUv); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        common(P.s, time); bind(bSide); gl.drawArrays(gl.TRIANGLES, 0, bSide.count);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        common(P.w, time); gl.uniform1f(P.w.u.uA, .6); bind(bWater); gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.uniform1f(P.w.u.uA, .45); gl.uniform1f(P.w.u.uOff, .0015); bind(bWS); gl.drawArrays(gl.TRIANGLES, 0, bWS.count);
        if (clouds) { common(P.c, time); gl.bindTexture(gl.TEXTURE_2D, cloudTex); gl.uniform1i(P.c.u.uT, 0); bind(bCloud); gl.drawArrays(gl.TRIANGLES, 0, 6); }
        gl.depthMask(true); gl.disable(gl.BLEND);
        opts.onFrame && opts.onFrame();
      }
      const loop = () => { if (destroyed) return; raf = requestAnimationFrame(loop); if (!host.clientWidth) return; if (dirty || clouds || auto) { if (auto && !dragging) { cam.yaw += .0015; } render(); dirty = false; } };
      let auto = false, dragging = false;
      resize(); raf = requestAnimationFrame(loop);
      const ro = new ResizeObserver(() => resize()); ro.observe(host);

      /* ----- raio do mouse até o relevo ----- */
      function hAt(px, pz){ const gx = (px / AR + .5) * (W - 1), gy = (pz + .5) * (H - 1); if (gx < 0 || gy < 0 || gx > W - 1 || gy > H - 1) return null; return M.hAt(gx, gy) * VS_; }
      function pick(sx, sy){
        const iv = M4.inv(VP); if (!iv) return null;
        const nx = sx / host.clientWidth * 2 - 1, ny = 1 - sy / host.clientHeight * 2;
        const a = M4.xf(iv, [nx, ny, -1, 1]), b = M4.xf(iv, [nx, ny, 1, 1]);
        const p0 = [a[0] / a[3], a[1] / a[3], a[2] / a[3]], p1 = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
        const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]; const len = Math.hypot(...d); d[0] /= len; d[1] /= len; d[2] /= len;
        let t = 0, prev = null; const step = cam.dist / 500;
        for (let i = 0; i < 1600; i++) { const p = [p0[0] + d[0] * t, p0[1] + d[1] * t, p0[2] + d[2] * t]; const hh = hAt(p[0], p[2]);
          if (hh != null && p[1] <= hh) { let lo = prev ?? t - step, hi = t; for (let j = 0; j < 8; j++) { const m = (lo + hi) / 2; const q = [p0[0] + d[0] * m, p0[1] + d[1] * m, p0[2] + d[2] * m]; const hq = hAt(q[0], q[2]); if (hq != null && q[1] <= hq) hi = m; else lo = m; } const q = [p0[0] + d[0] * hi, p0[1] + d[1] * hi, p0[2] + d[2] * hi]; return [(q[0] / AR + .5) * (W - 1), (q[2] + .5) * (H - 1)]; }
          prev = t; t += step; if (p[1] < BOT - .1) break; }
        return null;
      }

      /* ----- mouse ----- */
      let drag = null;
      cv.addEventListener('pointerdown', (e) => {
        cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top;
        const rotate = e.button === 2 || e.shiftKey || !opts.wantsPaint();
        if (!rotate && e.button === 0) { const g = pick(sx, sy); if (g && opts.paint(g[0], g[1], true)) { drag = { kind: 'paint' }; dirty = true; return; } }
        drag = { kind: e.button === 1 || e.ctrlKey ? 'pan' : 'rot', x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch, tx: cam.tx, tz: cam.tz }; dragging = true;
      });
      cv.addEventListener('pointermove', (e) => {
        if (!drag) return; const r = cv.getBoundingClientRect();
        if (drag.kind === 'paint') { const g = pick(e.clientX - r.left, e.clientY - r.top); if (g) { opts.paint(g[0], g[1], false); dirty = true; } return; }
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (drag.kind === 'rot') { cam.yaw = drag.yaw - dx * .008; cam.pitch = clamp(drag.pitch + dy * .006, .12, 1.5); }
        else { const s = cam.dist * .0016, c = Math.cos(cam.yaw), sn = Math.sin(cam.yaw); cam.tx = clamp(drag.tx - c * dx * s - sn * dy * s, -AR / 2, AR / 2); cam.tz = clamp(drag.tz + sn * dx * s - c * dy * s, -.5, .5); }
        dirty = true;
      });
      const up = () => { if (drag && drag.kind === 'paint') opts.paintEnd(); drag = null; dragging = false; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('contextmenu', (e) => e.preventDefault());
      cv.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = clamp(cam.dist * Math.exp(e.deltaY * .0012), .25, 6); dirty = true; }, { passive: false });
      const ctl = document.createElement('div'); ctl.className = 'mp-3dctl glass';
      const mkb = (txt, title, fn) => { const b = document.createElement('button'); b.className = 'btn sm'; b.textContent = txt; b.title = title; b.onclick = fn; ctl.appendChild(b); return b; };
      const autoB = mkb('Girar sozinho', 'Gira a maquete devagar', () => { auto = !auto; autoB.classList.toggle('on', auto); });
      mkb('Vista de cima', 'Olhar o mapa de cima', () => { cam.pitch = 1.45; cam.yaw = 0; dirty = true; });
      mkb('Vista em ângulo', 'Voltar ao ângulo de maquete', () => { cam.pitch = .78; cam.yaw = .5; cam.tx = 0; cam.tz = 0; cam.dist = 1.5 * Math.max(AR, 1.1); dirty = true; });
      host.appendChild(ctl);

      return {
        texture(c){ setTex(tex, c); dirty = true; },
        heights(x0, y0, x1, y1){
          calc(x0 - 1, y0 - 1, x1 + 1, y1 + 1);
          const r0 = Math.max(0, y0 - 1), r1 = Math.min(H - 1, y1 + 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferSubData(gl.ARRAY_BUFFER, r0 * W * 12, pos.subarray(r0 * W * 3, (r1 + 1) * W * 3));
          gl.bindBuffer(gl.ARRAY_BUFFER, bNor); gl.bufferSubData(gl.ARRAY_BUFFER, r0 * W * 12, nor.subarray(r0 * W * 3, (r1 + 1) * W * 3));
          if (x0 <= 1 || y0 <= 1 || x1 >= W - 2 || y1 >= H - 2) buildSides();
          dirty = true;
        },
        sea(v){ sea = v; plane(bWater, sea * VS_, 1); buildSides(); dirty = true; },
        light(v){ az = v; dirty = true; },
        exag(v){ VS_ = .16 * v; calc(0, 0, W - 1, H - 1); gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW); gl.bindBuffer(gl.ARRAY_BUFFER, bNor); gl.bufferData(gl.ARRAY_BUFFER, nor, gl.DYNAMIC_DRAW); plane(bWater, sea * VS_, 1); plane(bCloud, VS_ * 1.35 + .02, 1); buildSides(); dirty = true; },
        clouds(on){ clouds = on; dirty = true; },
        project(nx, ny){
          if (!VP) return null; const x = (nx - .5) * AR, z = ny - .5; const hh = hAt(x, z); const y = Math.max(hh ?? 0, sea * VS_);
          const c = M4.xf(VP, [x, y, z, 1]); if (c[3] <= 0) return { behind: true };
          return { x: (c[0] / c[3] + 1) / 2 * host.clientWidth, y: (1 - c[1] / c[3]) / 2 * host.clientHeight, scale: clamp(1.4 / c[3], .5, 1.6) };
        },
        resize(){ resize(); },
        destroy(){ destroyed = true; cancelAnimationFrame(raf); ro.disconnect(); ctl.remove(); const ext = gl.getExtension('WEBGL_lose_context'); ext && ext.loseContext(); cv.remove(); },
      };
    }
  };
})(window.T);
