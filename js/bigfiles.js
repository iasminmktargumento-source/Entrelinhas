/* Tinteiro — arquivos grandes: reduzir imagens, comprimir vídeos, ou guardar só neste computador */
(function(T){
  const { h, icon } = T;
  const MB = 1024 * 1024, TARGET = 18 * MB;
  const fmt = (b) => (b / MB).toFixed(1).replace('.', ',') + ' MB';
  /* ----- IndexedDB: arquivos guardados só neste navegador ----- */
  let dbp = null; const urls = new Map();
  const idb = () => dbp || (dbp = new Promise((res, rej) => { try { const r = indexedDB.open('tinteiro-arquivos', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const put = async (id, blob) => { const d = await idb(); return new Promise((res, rej) => { const tx = d.transaction('f', 'readwrite'); tx.objectStore('f').put(blob, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); };
  const get = async (id) => { const d = await idb(); return new Promise((res) => { const rq = d.transaction('f').objectStore('f').get(id); rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null); }); };

  /* ----- imagem: reduzir até caber ----- */
  async function shrinkImage(file){
    const bmp = await createImageBitmap(file);
    for (const [max, q] of [[4000, .9], [3200, .86], [2400, .82], [1800, .78]]) {
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
      cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
      const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', q));
      if (blob && blob.size < TARGET) return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
    return null;
  }
  /* ----- vídeo: regravar menor no próprio navegador ----- */
  function compressVideo(file, onProgress, cancelRef){
    return new Promise((resolve, reject) => {
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.src = URL.createObjectURL(file);
      v.onerror = () => reject(new Error('formato'));
      v.onloadedmetadata = () => {
        const dur = v.duration || 0; if (!dur || !isFinite(dur)) return reject(new Error('duração'));
        const maxDur = Math.min(dur, 240);
        const bps = Math.max(600e3, Math.min(4e6, TARGET * 8 / maxDur * .92));
        const k = Math.min(1, (bps > 2e6 ? 1920 : bps > 1.2e6 ? 1280 : 960) / Math.max(v.videoWidth, v.videoHeight));
        const cv = document.createElement('canvas'); cv.width = Math.round(v.videoWidth * k / 2) * 2; cv.height = Math.round(v.videoHeight * k / 2) * 2;
        const cx = cv.getContext('2d');
        const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
        if (!mime) return reject(new Error('sem gravador'));
        const rec = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: bps });
        const parts = []; rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
        rec.onstop = () => { URL.revokeObjectURL(v.src); if (cancelRef.cancel) return reject(new Error('cancelado')); const blob = new Blob(parts, { type: mime.split(';')[0] }); resolve({ file: new File([blob], file.name.replace(/\.[^.]+$/, '') + (mime.includes('webm') ? '.webm' : '.mp4'), { type: mime.split(';')[0] }), cut: maxDur < dur, maxDur }); };
        let raf; const draw = () => { cx.drawImage(v, 0, 0, cv.width, cv.height); onProgress(Math.min(1, v.currentTime / maxDur)); if (cancelRef.cancel || v.currentTime >= maxDur || v.ended) { cancelAnimationFrame(raf); v.pause(); if (rec.state !== 'inactive') rec.stop(); return; } raf = requestAnimationFrame(draw); };
        rec.start(1000); v.play().then(draw).catch(reject);
      };
    });
  }

  T.BigFiles = {
    cached: (id) => urls.get(id),
    async url(id){ if (urls.has(id)) return urls.get(id); try { const b = await get(id); if (!b) return ''; const u = URL.createObjectURL(b); urls.set(id, u); return u; } catch (e) { return ''; } },
    async saveLocal(file){ const id = 'idb-' + T.id(); await put(id, file); urls.set(id, URL.createObjectURL(file)); return { id, local: true, kind: (file.type || '').split('/')[0], name: file.name }; },
    // decide o que fazer com um arquivo acima de 20 MB; devolve { file } (para enviar), { local } ou null
    async handle(file, cloud){
      const isVid = (file.type || '').startsWith('video'), isImg = (file.type || '').startsWith('image');
      if (isImg) {
        T.toast('Imagem grande (' + fmt(file.size) + '). Reduzindo para caber…');
        try { const f = await shrinkImage(file); if (f) { T.toast('Imagem reduzida para ' + fmt(f.size) + ', sem perder qualidade visível.'); return { file: f }; } } catch (e) {}
      }
      return new Promise((resolve) => {
        T.modal((box, close) => {
          const done = (v) => { close(); resolve(v); };
          const local = async () => { try { const ref = await T.BigFiles.saveLocal(file); T.toast('Guardado neste computador.'); done({ local: ref }); } catch (e) { T.toast('Não há espaço neste navegador para um arquivo desse tamanho.'); done(null); } };
          const comp = async () => {
            box.innerHTML = ''; const bar = h('i'); const pct = h('b.num', '0%'); const cancelRef = {};
            box.append(h('h2', 'Comprimindo o vídeo…'), h('p.sub', 'O vídeo é regravado num tamanho menor. Isso leva mais ou menos o tempo de duração dele; deixe esta aba aberta.'), h('div.prog', { style: { height: '10px' } }, bar), h('p', pct),
              h('div.modal-foot', h('button.btn', { onclick: () => { cancelRef.cancel = true; } }, 'Cancelar')));
            try {
              const r = await compressVideo(file, (p) => { bar.style.width = Math.round(p * 100) + '%'; pct.textContent = Math.round(p * 100) + '%'; }, cancelRef);
              if (r.file.size > 19.5 * MB) { T.toast('Mesmo comprimido ficou grande demais. Guardando só neste computador.'); return local(); }
              T.toast('Vídeo comprimido: ' + fmt(file.size) + ' → ' + fmt(r.file.size) + (r.cut ? ' (só os primeiros 4 minutos)' : '') + '.');
              done({ file: r.file });
            } catch (e) { if (String(e.message) !== 'cancelado') T.toast('Não consegui comprimir este vídeo neste navegador.'); done(null); }
          };
          box.append(h('h2', 'Arquivo grande: ' + fmt(file.size)),
            h('p.sub', 'A nuvem do site aceita até 20 MB por arquivo (esse limite é da hospedagem, não dá para aumentar). Escolha como guardar este:'),
            h('div.stack',
              isVid && cloud ? h('button.big-opt', { onclick: comp }, icon('download'), h('div', h('b', 'Comprimir e guardar na nuvem'), h('span', 'O vídeo fica mais leve e abre em qualquer computador. Ideal para fundos em loop. Vídeos com mais de 4 minutos ficam só com o começo.'))) : null,
              h('button.big-opt', { onclick: local }, icon('archive'), h('div', h('b', 'Guardar só neste computador, no tamanho original'), h('span', 'Sem limite de tamanho além do espaço do navegador. Só aparece neste computador e neste navegador, e some se você limpar os dados do navegador.')))),
            h('div.modal-foot', h('button.btn', { onclick: () => done(null) }, 'Cancelar')));
        }, { sticky: true });
      });
    },
  };
})(window.T);
