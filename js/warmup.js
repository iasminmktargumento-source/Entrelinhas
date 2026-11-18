/* Entrelinhas — exercícios de aquecimento: um prompt, um tempo curto, escrita livre */
(() => {
  const { h, icon } = T;
  const S = () => T.Store;

  const CATS = {
    sentidos: { name: 'Sentidos', hue: 150 },
    personagem: { name: 'Personagem', hue: 330 },
    dialogo: { name: 'Diálogo', hue: 45 },
    cenario: { name: 'Cenário', hue: 200 },
    ese: { name: 'E se…', hue: 268 },
    emocao: { name: 'Emoção', hue: 0 },
    scifan: { name: 'Sci-fantasia', hue: 285 },
    restricao: { name: 'Desafio de estilo', hue: 22 },
    mundo: { name: 'Seu mundo', hue: 175 },
  };
  const P = [
    ['sentidos', 'Descreva um lugar só pelos cheiros. Não use nada que se veja.'],
    ['sentidos', 'Um som acorda alguém no meio da noite. Escreva os dez segundos seguintes.'],
    ['sentidos', 'Escreva sobre uma comida que lembra alguém que já foi embora.'],
    ['sentidos', 'Uma mão toca uma superfície que não deveria estar quente.'],
    ['sentidos', 'Descreva a chuva para alguém que nunca viu chuva.'],
    ['sentidos', 'O gosto de metal na boca depois de uma má notícia.'],
    ['sentidos', 'Um mercado cheio, contado só pelo que se ouve.'],
    ['sentidos', 'A luz da manhã entrando num quarto onde alguém não dormiu.'],
    ['sentidos', 'Um tecido, uma textura, e a lembrança que ela traz.'],
    ['sentidos', 'Escreva o silêncio de uma casa logo depois de uma briga.'],
    ['personagem', 'Sua personagem esvazia os bolsos. O que tem lá dentro, e por quê?'],
    ['personagem', 'Escreva a mentira que sua personagem conta para si mesma toda manhã.'],
    ['personagem', 'Uma personagem faz algo gentil e ninguém vê.'],
    ['personagem', 'Descreva alguém pelo jeito como entra num lugar.'],
    ['personagem', 'O objeto que sua personagem salvaria de um incêndio.'],
    ['personagem', 'Escreva o pior dia de alguém, contado por ela como se fosse um dia comum.'],
    ['personagem', 'Uma personagem ensaia uma conversa difícil em frente ao espelho.'],
    ['personagem', 'O que sua vilã acha que está fazendo de certo?'],
    ['personagem', 'Alguém volta para a cidade onde cresceu e ninguém a reconhece.'],
    ['personagem', 'Escreva um hábito estranho de alguém e de onde ele veio.'],
    ['personagem', 'A primeira vez que sua personagem sentiu medo de verdade.'],
    ['personagem', 'Duas pessoas que se odeiam precisam dividir um guarda-chuva.'],
    ['dialogo', 'Uma conversa em que ninguém diz o que realmente quer dizer.'],
    ['dialogo', 'Escreva só falas, sem narração: duas pessoas, uma carta, um segredo.'],
    ['dialogo', '“Você não devia estar aqui.” Continue.'],
    ['dialogo', 'Uma discussão sobre algo pequeno que, na verdade, é sobre algo enorme.'],
    ['dialogo', 'Alguém pede desculpas da pior forma possível.'],
    ['dialogo', 'Uma criança faz uma pergunta que um adulto não sabe responder.'],
    ['dialogo', '“Eu sei o que você fez.” “Qual das coisas?”'],
    ['dialogo', 'Duas personagens negociam algo, e uma delas está blefando.'],
    ['dialogo', 'Uma despedida em que os dois fingem que vão se ver amanhã.'],
    ['dialogo', 'Um interrogatório em que quem pergunta tem mais medo.'],
    ['cenario', 'Uma cidade que só existe à noite.'],
    ['cenario', 'Descreva uma ruína e deixe o leitor adivinhar o que ela foi.'],
    ['cenario', 'Uma estação de trem abandonada, cinco minutos antes do último trem.'],
    ['cenario', 'Um quarto que conta a vida de quem mora nele sem mostrar a pessoa.'],
    ['cenario', 'Uma floresta onde as árvores crescem para baixo.'],
    ['cenario', 'Uma biblioteca em que um livro está faltando.'],
    ['cenario', 'O topo de uma torre em um dia de vento forte.'],
    ['cenario', 'Uma taverna na fronteira entre dois reinos em guerra.'],
    ['cenario', 'Um farol cujo guardião sumiu, mas a luz continua acesa.'],
    ['cenario', 'O fundo do mar visto por alguém que não precisa respirar.'],
    ['ese', 'E se as sombras das pessoas pudessem ir embora?'],
    ['ese', 'E se toda mentira deixasse uma marca na pele?'],
    ['ese', 'E se você acordasse com a memória de outra pessoa?'],
    ['ese', 'E se o tempo andasse mais devagar perto de quem está triste?'],
    ['ese', 'E se as estrelas fossem janelas, e alguém do outro lado acenasse?'],
    ['ese', 'E se um mapa mostrasse um lugar que ainda não existe?'],
    ['ese', 'E se cada pessoa nascesse com uma única palavra mágica?'],
    ['ese', 'E se a cidade inteira esquecesse o seu nome, menos uma pessoa?'],
    ['ese', 'E se os sonhos fossem um lugar e desse para se perder lá?'],
    ['ese', 'E se a morte tivesse fila, e alguém furasse?'],
    ['emocao', 'Escreva saudade sem usar a palavra saudade.'],
    ['emocao', 'Mostre raiva só pelas mãos de alguém.'],
    ['emocao', 'Um momento de alegria que dura menos de um minuto.'],
    ['emocao', 'Vergonha: o segundo exato em que alguém percebe o erro.'],
    ['emocao', 'Escreva alívio depois de muito tempo esperando.'],
    ['emocao', 'Inveja de alguém que a personagem ama.'],
    ['emocao', 'O medo de ser feliz e perder tudo.'],
    ['emocao', 'Um luto que ninguém mais entende.'],
    ['emocao', 'A coragem que vem do cansaço, não da força.'],
    ['scifan', 'Uma nave que funciona com orações.'],
    ['scifan', 'Um mago descobre que a magia dele é, na verdade, uma tecnologia esquecida.'],
    ['scifan', 'O último dragão vive numa estação espacial.'],
    ['scifan', 'Uma IA aprende a sentir saudade lendo cartas antigas.'],
    ['scifan', 'Um feitiço tem efeito colateral: apaga uma lembrança qualquer.'],
    ['scifan', 'Uma cidade flutua sobre um oceano de nuvens e o motor está falhando.'],
    ['scifan', 'Alguém contrabandeia sementes de um planeta morto.'],
    ['scifan', 'Uma profecia foi escrita com erros de digitação.'],
    ['scifan', 'Um robô guardião de templo recebe o primeiro visitante em mil anos.'],
    ['scifan', 'A lua tem dono, e ele quer cobrar aluguel.'],
    ['scifan', 'Um portal se abre na cozinha toda terça-feira às 15h.'],
    ['scifan', 'Uma bruxa com uma loja de conserto de relógios que voltam no tempo.'],
    ['restricao', 'Escreva uma cena inteira em frases de no máximo cinco palavras.'],
    ['restricao', 'Uma cena em uma frase só, longa, sem ponto final até o fim.'],
    ['restricao', 'Escreva sem usar a letra “a”.'],
    ['restricao', 'Conte uma história em segunda pessoa: “você entra…”.'],
    ['restricao', 'Comece pelo fim e vá voltando no tempo.'],
    ['restricao', 'Escreva uma cena sem nenhum adjetivo.'],
    ['restricao', 'Use exatamente três cores, e que cada uma signifique algo.'],
    ['restricao', 'Uma cena com um único verbo de ação forte em cada parágrafo.'],
    ['restricao', 'Escreva como se fosse uma carta encontrada cem anos depois.'],
    ['restricao', 'Escreva como um verbete de enciclopédia do seu mundo.'],
    ['restricao', 'Escreva uma lista que, sem querer, conta uma história.'],
    ['restricao', 'Uma cena em tempo real: cada parágrafo é um minuto.'],
  ];
  // usam nomes da sua wiki quando ela tem páginas
  const MINE = [
    ['{P} encontra algo que perdeu há muitos anos. Escreva o que sente.', 'P'],
    ['{P} precisa pedir ajuda para {Q}, e odeia isso.', 'PQ'],
    ['Escreva um dia comum na vida de {P}, antes de tudo começar.', 'P'],
    ['{P} tem um sonho recorrente. Conte o sonho.', 'P'],
    ['Um segredo que {P} nunca contou para {Q}.', 'PQ'],
    ['{P} chega em {L} pela primeira vez. O que chama a atenção?', 'PL'],
    ['Descreva {L} numa noite de tempestade.', 'L'],
    ['Uma lenda que contam sobre {L} para assustar as crianças.', 'L'],
    ['{P} escreve uma carta que nunca vai mandar.', 'P'],
    ['Como {P} reage quando é chamada de covarde?', 'P'],
    ['{P} e {Q} presos no mesmo lugar por uma hora.', 'PQ'],
    ['O cheiro de {L} quando alguém volta depois de muito tempo.', 'L'],
  ];
  const TIMES = [3, 5, 10, 15];

  T.Views.warmup = {
    icon: 'flame', title: () => 'Aquecimento',
    mount(root, tab, ctx){
      const pid = ctx.pid; const v = h('div.view.view-pad.wu-view'); root.appendChild(v);
      const pref = Object.assign({ min: 5, cats: [], mine: true }, S().prefs().warmup || {});
      const keep = () => S().setPrefs({ warmup: Object.assign({}, pref) });
      let cur = null, timer = null, endAt = 0, left = 0, running = false, ta = null, recent = [];
      const pages = () => T.Ent?.pages ? T.Ent.pages(pid) : [];
      function pickPrompt(){
        const ps = pages();
        const chars = ps.filter(p => p.meta?.tpl === 'personagem' && p.title), places = ps.filter(p => p.meta?.tpl === 'lugar' && p.title);
        let pool = P.map(([c, t]) => ({ c, t }));
        if (pref.cats.length) pool = pool.filter(x => pref.cats.includes(x.c));
        if (pref.mine && (!pref.cats.length || pref.cats.includes('mundo'))) {
          MINE.forEach(([t, need]) => {
            if (need.includes('P') && !chars.length) return; if (need.includes('Q') && chars.length < 2) return; if (need.includes('L') && !places.length) return;
            pool.push({ c: 'mundo', t, tpl: true });
          });
        }
        if (!pool.length) pool = P.map(([c, t]) => ({ c, t }));
        const fresh = pool.filter(x => !recent.includes(x.t)); const list = fresh.length ? fresh : pool;
        const x = Object.assign({}, list[Math.floor(Math.random() * list.length)]);
        recent = [x.t, ...recent].slice(0, 25);
        if (x.tpl) {
          const sh = [...chars].sort(() => Math.random() - .5);
          x.text = x.t.replace('{P}', sh[0]?.title || '').replace('{Q}', sh[1]?.title || '').replace('{L}', places[Math.floor(Math.random() * places.length)]?.title || '');
        } else x.text = x.t;
        return x;
      }
      const fmtT = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
      const words = () => T.countWords(ta ? ta.value : '');
      const history = () => S().get(pid)?.meta?.warmups || [];

      function draw(){
        v.innerHTML = '';
        if (!cur) cur = pickPrompt();
        const cat = CATS[cur.c] || CATS.sentidos;
        v.append(h('div.view-h', h('div.grow', h('h1', 'Aquecimento'), h('p', 'Um prompt, pouco tempo, nada de corrigir. Só para soltar a mão antes de escrever o livro.'))));
        const card = h('div.wu-card.glass', { style: { '--wh': cat.hue } },
          h('div.row', h('span.wu-cat', cat.name), h('span.grow'), !running ? h('button.btn.sm', { title: 'Sortear outro prompt', onclick: () => { cur = pickPrompt(); draw(); } }, icon('dice'), 'Outro prompt') : null),
          h('p.wu-prompt', cur.text));
        v.appendChild(card);
        if (!running && !ta?.value) {
          const catsRow = h('div.nm-chips', Object.entries(CATS).map(([k, c]) => h('button.if-chip' + (pref.cats.includes(k) ? '.on' : ''), { type: 'button', onclick: () => { pref.cats = pref.cats.includes(k) ? pref.cats.filter(x => x !== k) : [...pref.cats, k]; keep(); cur = pickPrompt(); draw(); } }, c.name)));
          const timeSeg = h('div.seg', TIMES.map(m => { const b = h('button', { type: 'button', onclick: () => { pref.min = m; keep(); draw(); } }, m + ' min'); if (pref.min === m) b.classList.add('on'); return b; }));
          const mine = h('label.row', { style: { gap: '8px', fontSize: '13px' } }, (() => { const cb = h('input', { type: 'checkbox', checked: pref.mine }); cb.onchange = () => { pref.mine = cb.checked; keep(); }; return cb; })(), 'Incluir prompts com nomes da minha wiki (personagens e lugares)');
          v.append(h('div.wu-opts.glass',
            h('div.field', h('span.muted', 'Tipos de prompt (nenhum marcado = todos)'), catsRow), mine,
            h('div.row', { style: { gap: '12px', flexWrap: 'wrap' } }, h('span.muted', 'Tempo'), timeSeg, h('span.grow'),
              h('button.btn.primary', { onclick: start }, icon('play'), 'Começar ' + pref.min + ' min'))));
          const hist = history();
          if (hist.length) {
            const tot = hist.reduce((a, x) => a + (x.w || 0), 0);
            v.append(h('div.wu-hist', h('b', hist.length + (hist.length === 1 ? ' aquecimento feito' : ' aquecimentos feitos')), h('span.muted', ' · ' + T.fmt(tot) + ' palavras soltas no total')));
          }
          return;
        }
        // escrevendo (ou acabou)
        const clock = h('div.wu-clock' + (running ? '' : '.done'), running ? fmtT(left) : 'Tempo!');
        const wc = h('span.wu-wc', T.fmt(words()) + ' palavras');
        const bar = h('div.wu-bar', h('i', { style: { width: (running ? 100 - left / (pref.min * 600) : 100) + '%' } }));
        if (!ta) { ta = h('textarea.wu-ta', { placeholder: 'Escreva sem parar. Sem apagar, sem pensar demais…', spellcheck: 'true' }); }
        ta.oninput = () => { wc.textContent = T.fmt(words()) + ' palavras'; };
        v.append(h('div.wu-run', h('div.row', clock, bar, wc), ta,
          h('div.row', { style: { gap: '8px', flexWrap: 'wrap' } },
            running ? h('button.btn', { onclick: () => finish(true) }, icon('stop'), 'Parar agora') : null,
            !running ? h('button.btn.primary', { onclick: () => saveIt() }, icon('idea'), 'Guardar em Ideias') : null,
            !running ? h('button.btn', { onclick: () => { ta = null; cur = pickPrompt(); draw(); } }, icon('dice'), 'Outro aquecimento') : null,
            !running ? h('button.btn.ghost', { onclick: async () => { if (!ta.value.trim() || await T.confirm('Descartar este texto?', 'O que você escreveu no aquecimento vai sumir.', 'Descartar', true)) { ta = null; draw(); } } }, icon('trash'), 'Descartar') : null,
            h('span.grow'), h('span.muted', { style: { fontSize: '12px' } }, 'O aquecimento fica só aqui até você guardar.'))));
        if (running) requestAnimationFrame(() => ta.focus());
      }
      function start(){
        running = true; ta = null; endAt = Date.now() + pref.min * 60000; left = pref.min * 60000;
        draw();
        clearInterval(timer);
        timer = setInterval(() => {
          left = endAt - Date.now();
          const c = v.querySelector('.wu-clock'); if (c) c.textContent = fmtT(left);
          const b = v.querySelector('.wu-bar i'); if (b) b.style.width = Math.min(100, 100 - left / (pref.min * 600)) + '%';
          if (left <= 0) finish(false);
        }, 250);
      }
      function finish(early){
        if (!running) return;
        running = false; clearInterval(timer);
        const w = words();
        const p = S().get(pid); S().update(pid, { meta: { warmups: [...(p.meta?.warmups || []), { at: Date.now(), w, min: pref.min, early: !!early }].slice(-200) } }, { silent: true });
        try { T.Sound?.chime ? T.Sound.chime() : null; } catch (e) {}
        T.toast(early ? 'Aquecimento encerrado: ' + T.fmt(w) + ' palavras.' : 'Tempo! Você soltou ' + T.fmt(w) + ' palavras.');
        const val = ta?.value; draw(); if (ta && val != null) ta.value = val;
      }
      function saveIt(){
        const txt = (ta?.value || '').trim(); if (!txt) { T.toast('Não há nada escrito para guardar.'); return; }
        let folders = T.Ideas.folders(pid); let fd = folders.find(z => /aquec/i.test(z.name));
        if (!fd) { fd = { id: T.id(), name: 'Aquecimentos', hue: 22 }; T.Ideas.save(pid, [...folders, fd]); }
        T.Ideas.create(pid, 'Aquecimento: ' + cur.text + '\n\n' + txt, fd.id);
        T.toast('Guardado em Ideias › Aquecimentos.'); ta = null; draw();
      }
      draw();
      return { destroy(){ clearInterval(timer); } };
    }
  };
})();
