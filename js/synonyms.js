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
      const k = keyOf(word) + '|' + (sentence || '').slice(0, 160).toLowerCase();
      const k0 = keyOf(word);
      if (cache.has(k)) return cache.get(k);
      if (T.Store.prefs().noClaude) throw { code: 'private' };
      if (T.STANDALONE) throw { code: 'standalone' };
      const s = await ready(); if (!s) throw { code: 'not_granted' };
      const prompt = 'Você é um dicionário de sinônimos do português brasileiro para escritores de ficção.\n' +
        'Palavra ou expressão: "' + word + '"\n' + (sentence ? 'Frase em que ela aparece: "' + sentence + '"\n' : '') +
        'Dê sinônimos que possam substituir a palavra NESTA frase, já flexionados no mesmo tempo, número e gênero (ex.: "perguntou" → "indagou", "questionou"). ' +
        'Agrupe por sentido ou nuance (no máximo 4 grupos, até 8 palavras por grupo, as mais próximas primeiro). Se fizer sentido, inclua também 3 antônimos.\n' +
        'Responda SÓ com JSON: {"grupos":[{"sentido":"nuance curta","palavras":["..."]}],"antonimos":["..."]}';
      const out = await s.json(prompt, { modelTier: 'quick' });
      const val = { grupos: (out?.grupos || []).filter(g => g && Array.isArray(g.palavras) && g.palavras.length).slice(0, 4), antonimos: (out?.antonimos || []).slice(0, 5) };
      cache.set(k, val); if (!cache.has(k0)) cache.set(k0, val); store();
      return val;
    },
    // painel com os sinônimos; onPick(palavra) troca no texto
    panel(anchorRect, word, sentence, onPick){
      document.querySelector('.syn-pop')?.remove();
      const body = h('div.syn-body', h('div.syn-wait', h('span.syn-spin'), 'Procurando sinônimos de “' + word + '”…'));
      const pop = h('div.syn-pop.glass.glass-strong', { role: 'dialog', 'aria-label': 'Sinônimos de ' + word },
        h('div.syn-h', icon('replace'), h('b.grow', word), T.iconBtn('x', 'Fechar', () => close(), '.sm')), body);
      pop.addEventListener('mousedown', (e) => { if (!e.target.closest('input')) e.preventDefault(); });
      document.body.appendChild(pop);
      const place = () => { const w = pop.offsetWidth, hh = pop.offsetHeight; let x = anchorRect.left + anchorRect.width / 2 - w / 2, y = anchorRect.bottom + 10; if (y + hh > innerHeight - 10) y = Math.max(10, anchorRect.top - hh - 10); pop.style.left = T.clamp(x, 10, innerWidth - w - 10) + 'px'; pop.style.top = y + 'px'; };
      place();
      const close = () => { pop.remove(); document.removeEventListener('mousedown', outside, true); document.removeEventListener('keydown', esc, true); };
      const outside = (e) => { if (!pop.contains(e.target)) close(); };
      const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
      setTimeout(() => { document.addEventListener('mousedown', outside, true); document.addEventListener('keydown', esc, true); }, 0);
      const chip = (w) => h('button.syn-w', { type: 'button', title: 'Trocar por “' + w + '”', onclick: () => { onPick(w); close(); } }, w);
      T.Syn.get(word, sentence).then(r => {
        if (!pop.isConnected) return;
        if (!r.grupos.length) { body.replaceChildren(h('p.muted.syn-msg', 'Não encontrei sinônimos para “' + word + '”.')); place(); return; }
        body.replaceChildren(...r.grupos.map(g => h('div.syn-g', g.sentido ? h('div.syn-s', g.sentido) : null, h('div.syn-ws', g.palavras.map(chip)))),
          r.antonimos.length ? h('div.syn-g.ant', h('div.syn-s', 'contrários'), h('div.syn-ws', r.antonimos.map(chip))) : null,
          h('p.syn-foot', 'Clique para trocar no texto. Ctrl+Z desfaz.'));
        place();
      }).catch((e) => {
        if (!pop.isConnected) return;
        body.replaceChildren(h('p.muted.syn-msg', e?.code === 'private' ? 'O modo privado está ligado: seu texto não é enviado ao Claude, por isso os sinônimos ficam desligados. Dá para mudar em Ajustes › Privacidade.' : e?.code === 'not_granted' ? 'Os sinônimos usam o Claude e precisam da sua permissão. Abra o site pelo claude.ai e aceite o pedido para usar o Claude.' : e?.code === 'rate_limited' ? 'Muitos pedidos seguidos. Espere um pouquinho e tente de novo.' : 'Não consegui buscar os sinônimos agora. Tente de novo em instantes.'));
        place();
      });
      return pop;
    },
  };
})();
