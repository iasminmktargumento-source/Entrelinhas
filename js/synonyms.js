/* Entrelinhas — sinônimos da palavra selecionada (pergunta ao Claude, com cache) */
(() => {
  const { h, icon } = T;
  let sample; const cache = new Map();
  async function ready(){
    if (sample === undefined) { try { sample = (window.claude && claude.use) ? await Promise.race([claude.use('sample'), new Promise(r => setTimeout(() => r(null), 11000))]) : null; } catch (e) { sample = null; } }
    return sample;
  }
  const keyOf = (w) => w.toLowerCase().trim();
  function load(){ try { const j = JSON.parse(localStorage.getItem('entrelinhas-syn') || '{}'); for (const k in j) cache.set(k, j[k]); } catch (e) {} }
  function store(){ try { const o = {}; [...cache.entries()].slice(-300).forEach(([k, v]) => o[k] = v); localStorage.setItem('entrelinhas-syn', JSON.stringify(o)); } catch (e) {} }
  load();
  // ajudante comum para pedir algo ao Claude (respeita o modo privado)
  T.AI = {
    async json(prompt, opts = {}){
      if (T.Store.prefs().noClaude) throw { code: 'private' };
      if (T.STANDALONE) throw { code: 'standalone' };
      const s = await ready(); if (!s) throw { code: 'not_granted' };
      return s.json(prompt, Object.assign({ modelTier: 'quick' }, opts));
    },
    errText(e){ return e?.code === 'standalone' ? 'Esta função usa o Claude, então só funciona no Entrelinhas aberto pelo claude.ai. Nesta versão independente ela fica desligada.' : e?.code === 'private' ? 'O modo privado está ligado (Ajustes › Privacidade): nada do seu texto é enviado ao Claude, por isso esta função fica desligada.' : e?.code === 'not_granted' ? 'Esta função usa o Claude e precisa da sua permissão. Abra o site pelo claude.ai e aceite o pedido.' : e?.code === 'rate_limited' ? 'Muitos pedidos seguidos. Espere um pouquinho e tente de novo.' : 'Não consegui uma resposta agora. Tente de novo em instantes.'; },
  };
  T.Syn = {
    async get(word, sentence){
      const k = 'v2|' + keyOf(word) + '|' + (sentence || '').slice(0, 160).toLowerCase();
      const k0 = 'v2|' + keyOf(word);
      if (cache.has(k)) return cache.get(k);
      if (T.Store.prefs().noClaude) throw { code: 'private' };
      if (T.STANDALONE) throw { code: 'standalone' };
      const s = await ready(); if (!s) throw { code: 'not_granted' };
      const prompt = 'Você é um dicionário de sinônimos do português brasileiro para escritores de ficção.\n' +
        'Palavra ou expressão: "' + word + '"\n' + (sentence ? 'Frase em que ela aparece: "' + sentence + '"\n' : '') +
        'Dê sinônimos que possam substituir a palavra NESTA frase, já flexionados no mesmo tempo, número e gênero (ex.: "perguntou" → "indagou", "questionou"). ' +
        'Agrupe por sentido ou nuance (até 6 grupos, de 8 a 14 palavras por grupo, as mais próximas primeiro; inclua palavras comuns, literárias e regionais do Brasil quando couber). Se fizer sentido, inclua também até 8 antônimos.\n' +
        'Responda SÓ com JSON: {"grupos":[{"sentido":"nuance curta","palavras":["..."]}],"antonimos":["..."]}';
      const out = await s.json(prompt, { modelTier: 'quick' });
      const val = { grupos: (out?.grupos || []).filter(g => g && Array.isArray(g.palavras) && g.palavras.length).slice(0, 6), antonimos: (out?.antonimos || []).slice(0, 8) };
      cache.set(k, val); if (!cache.has(k0)) cache.set(k0, val); store();
      return val;
    },
    async more(word, sentence, have){
      const s = await ready(); if (!s) throw { code: 'not_granted' };
      if (T.Store.prefs().noClaude) throw { code: 'private' }; if (T.STANDALONE) throw { code: 'standalone' };
      const out = await s.json('Dicionário de sinônimos do português brasileiro para escritores. Palavra: "' + word + '"' + (sentence ? ' na frase: "' + sentence + '"' : '') + '. Já listei: ' + have.join(', ') + '. Dê OUTROS 15 a 25 sinônimos ou expressões equivalentes que NÃO estejam na lista (mais raros, literários, coloquiais, regionais), já flexionados para caber na frase. Responda SÓ com JSON: {"palavras":["..."]}', { modelTier: 'quick' });
      const seen = new Set(have.map(x => x.toLowerCase()));
      return (out?.palavras || []).filter(w => w && !seen.has(String(w).toLowerCase())).slice(0, 25);
    },
    async dict(word, sentence){
      const k = 'dict|' + keyOf(word) + '|' + (sentence || '').slice(0, 120).toLowerCase();
      if (cache.has(k)) return cache.get(k);
      if (T.Store.prefs().noClaude) throw { code: 'private' }; if (T.STANDALONE) throw { code: 'standalone' };
      const s = await ready(); if (!s) throw { code: 'not_granted' };
      const out = await s.json('Você é um dicionário completo do português brasileiro (como Houaiss/Aulete), escrevendo para uma escritora de ficção.\n' +
        'Palavra ou expressão: "' + word + '"\n' + (sentence ? 'Frase em que aparece: "' + sentence + '"\n' : '') +
        'Explique: a forma de dicionário (infinitivo/masculino singular), classe gramatical, separação silábica com a tônica em MAIÚSCULAS, o sentido NESTA frase, as principais acepções (até 6, cada uma com um exemplo de uso em frase literária curta), regência ou como se usa (preposições, registro: formal/coloquial/literário/regional), expressões comuns com a palavra, origem (etimologia curta) e uma observação útil (confusões comuns, grafia, plural, crase…). Seja preciso; se não tiver certeza de algo, deixe vazio.\n' +
        'Responda SÓ com JSON: {"lema":"","classe":"","silabas":"","nesta_frase":"","acepcoes":[{"sentido":"","exemplo":""}],"uso":"","expressoes":["..."],"origem":"","observacao":""}', { modelTier: 'quick' });
      const val = out && typeof out === 'object' ? out : null; if (val) { cache.set(k, val); store(); }
      return val;
    },
    // painel com os sinônimos; onPick(palavra) troca no texto
    panel(anchorRect, word, sentence, onPick, opts = {}){
      document.querySelector('.syn-pop')?.remove();
      const body = h('div.syn-body');
      const tabs = h('div.syn-tabs', h('button.syn-tab', { type: 'button', 'data-t': 'syn', onclick: () => show('syn') }, icon('replace'), 'Sinônimos'), h('button.syn-tab', { type: 'button', 'data-t': 'dict', onclick: () => show('dict') }, icon('book'), 'Dicionário'));
      const pop = h('div.syn-pop.glass.glass-strong', { role: 'dialog', 'aria-label': 'Sinônimos e dicionário: ' + word },
        h('div.syn-h', h('b.grow', word), tabs, T.iconBtn('x', 'Fechar', () => close(), '.sm')), body);
      pop.addEventListener('mousedown', (e) => { if (!e.target.closest('input')) e.preventDefault(); });
      document.body.appendChild(pop);
      const place = () => { const w = pop.offsetWidth, hh = pop.offsetHeight; let x = anchorRect.left + anchorRect.width / 2 - w / 2, y = anchorRect.bottom + 10; if (y + hh > innerHeight - 10) y = Math.max(10, anchorRect.top - hh - 10); pop.style.left = T.clamp(x, 10, innerWidth - w - 10) + 'px'; pop.style.top = y + 'px'; };
      place();
      const close = () => { pop.remove(); document.removeEventListener('mousedown', outside, true); document.removeEventListener('keydown', esc, true); };
      const outside = (e) => { if (!pop.contains(e.target)) close(); };
      const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
      setTimeout(() => { document.addEventListener('mousedown', outside, true); document.addEventListener('keydown', esc, true); }, 0);
      const chip = (w) => h('button.syn-w', { type: 'button', title: 'Trocar por “' + w + '”', onclick: () => { onPick(w); close(); } }, w);
      const errMsg = (e) => h('p.muted.syn-msg', e?.code === 'private' ? 'O modo privado está ligado: seu texto não é enviado ao Claude, por isso esta função fica desligada. Dá para mudar em Ajustes › Privacidade.' : T.AI.errText(e));
      let cur = null;
      function show(t){
        cur = t; tabs.querySelectorAll('.syn-tab').forEach(b => b.classList.toggle('on', b.dataset.t === t));
        if (t === 'dict') return showDict();
        body.replaceChildren(h('div.syn-wait', h('span.syn-spin'), 'Procurando sinônimos de “' + word + '”…')); place();
        T.Syn.get(word, sentence).then(r => {
          if (!pop.isConnected || cur !== 'syn') return;
          if (!r.grupos.length) { body.replaceChildren(h('p.muted.syn-msg', 'Não encontrei sinônimos para “' + word + '”.')); place(); return; }
          const all = r.grupos.flatMap(g => g.palavras).concat(r.antonimos);
          const extra = h('div.syn-g.extra');
          const moreBtn = h('button.btn.sm', { type: 'button', onclick: async () => { moreBtn.disabled = true; moreBtn.textContent = 'Buscando mais…'; try { const ws = await T.Syn.more(word, sentence, all); if (!pop.isConnected) return; extra.replaceChildren(h('div.syn-s', 'mais opções'), h('div.syn-ws', ws.map(chip))); all.push(...ws); moreBtn.textContent = 'Mais sinônimos'; moreBtn.disabled = false; place(); } catch (e) { moreBtn.textContent = 'Não consegui buscar mais'; } } }, icon('plus'), 'Mais sinônimos');
          body.replaceChildren(h('p.syn-count.muted', all.length + ' opções'), ...r.grupos.map(g => h('div.syn-g', g.sentido ? h('div.syn-s', g.sentido) : null, h('div.syn-ws', g.palavras.map(chip)))),
            r.antonimos.length ? h('div.syn-g.ant', h('div.syn-s', 'contrários'), h('div.syn-ws', r.antonimos.map(chip))) : null,
            extra, h('div.syn-foot', moreBtn, h('span', 'Clique numa palavra para trocar no texto. Ctrl+Z desfaz.')));
          place();
        }).catch((e) => { if (!pop.isConnected) return; body.replaceChildren(errMsg(e)); place(); });
      }
      function showDict(){
        body.replaceChildren(h('div.syn-wait', h('span.syn-spin'), 'Abrindo o dicionário em “' + word + '”…')); place();
        T.Syn.dict(word, sentence).then(d => {
          if (!pop.isConnected || cur !== 'dict') return;
          if (!d) { body.replaceChildren(h('p.muted.syn-msg', 'Não encontrei “' + word + '” no dicionário.')); place(); return; }
          const row = (label, val) => val ? h('div.dc-row', h('div.dc-l', label), h('div.dc-v', val)) : null;
          body.replaceChildren(h('div.dc',
            h('div.dc-head', h('b.dc-lema', d.lema || word), d.classe ? h('span.dc-cls', d.classe) : null, d.silabas ? h('span.dc-sil', d.silabas) : null),
            d.nesta_frase ? h('div.dc-here', h('span', 'Nesta frase'), d.nesta_frase) : null,
            (d.acepcoes || []).length ? h('ol.dc-acs', (d.acepcoes || []).map(a => h('li', h('div', a.sentido || ''), a.exemplo ? h('div.dc-ex', '“' + a.exemplo.replace(/^[“"]|[”"]$/g, '') + '”') : null))) : null,
            row('Como se usa', d.uso),
            (d.expressoes || []).length ? row('Expressões', d.expressoes.join(' · ')) : null,
            row('Origem', d.origem),
            row('Atenção', d.observacao),
            h('p.syn-foot', h('span', 'Explicação feita pelo Claude: confira num dicionário quando for algo importante.'))));
          place();
        }).catch((e) => { if (!pop.isConnected) return; body.replaceChildren(errMsg(e)); place(); });
      }
      show(opts.tab === 'dict' ? 'dict' : 'syn');
      return pop;
    },
  };
})();
