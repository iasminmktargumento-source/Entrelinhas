/* Tinteiro — estrutura: tela inicial, projeto, barra lateral, abas, painéis, janelas flutuantes */
(function(T){
  const { h, icon } = T;
  const S = () => T.Store;
  const app = () => document.getElementById('app');

  const Shell = T.Shell = {
    pid: null, layout: null, mounted: new Map(), floats: [], openState: {}, sprint: null,
  };

  /* ---------- tema ---------- */
  Shell.applyTheme = function(){
    const p = S().prefs();
    const hostTheme = document.documentElement.getAttribute('data-theme');
    const dark = p.theme === 'dark' || (p.theme !== 'light' && (hostTheme ? hostTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches));
    document.body.dataset.mode = dark ? 'dark' : 'light';
    document.body.classList.toggle('solid', !!p.solid);
    const chromium = !!(navigator.userAgentData && navigator.userAgentData.brands && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand)));
    document.body.classList.toggle('refract', chromium && p.refract !== false && !p.solid);
    const hue = Shell.pid ? (S().get(Shell.pid)?.meta?.hue ?? 268) : (p.homeHue ?? 268);
    document.documentElement.style.setProperty('--hue', hue);
    T.Atmo.set(hue, dark);
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => Shell.applyTheme());

  /* ================= TELA INICIAL ================= */
  Shell.home = async function(){
    Shell.teardown();
    Shell.pid = null; Shell.applyTheme(); Shell.applyWalls();
    const root = app(); root.innerHTML = '';
    const projects = (await S().loadProjects()).sort((a, b) => (b.meta?.opened || b.updated) - (a.meta?.opened || a.updated));
    const showArch = Shell._showArchived;
    const active = projects.filter(p => !p.meta?.archived), archived = projects.filter(p => p.meta?.archived);
    const hr = new Date().getHours();
    const greet = hr < 5 ? 'Boa noite' : hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
    const home = h('div.home.hx');
    // fundo: aurora em movimento + pautas de caderno ("entre linhas")
    home.append(h('div.hx-sky', { 'aria-hidden': 'true' }, h('i.b1'), h('i.b2'), h('i.b3'), h('i.b4'), h('i.b5')), h('div.hx-lines', { 'aria-hidden': 'true' }), h('div.hx-grain', { 'aria-hidden': 'true' }));
    // números de todos os livros juntos
    const hist = {}; projects.forEach(p => { const hh = p.meta?.history || {}; for (const k in hh) hist[k] = (hist[k] || 0) + hh[k]; (p.meta?.tallies || []).forEach(t => { hist[t.d] = (hist[t.d] || 0) + (+t.n || 0); }); });
    const todayW = hist[T.today()] || 0;
    let streak = 0; { const d = new Date(); if (!(hist[T.dayKey(d)] > 0)) d.setDate(d.getDate() - 1); while (hist[T.dayKey(d)] > 0) { streak++; d.setDate(d.getDate() - 1); } }
    const week = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); week.push([d, hist[T.dayKey(d)] || 0]); }
    const weekSum = week.reduce((a, x) => a + x[1], 0);
    let prevSum = 0; for (let i = 13; i >= 7; i--) { const d = new Date(); d.setDate(d.getDate() - i); prevSum += hist[T.dayKey(d)] || 0; }
    const goalDay = Math.max(0, ...active.map(p => p.meta?.targets?.session || 0)) || 1000;
    const weekMax = Math.max(goalDay * 1.15, ...week.map(x => x[1]));
    const daysMet = week.filter(x => x[1] >= goalDay).length;
    const weekPanel = () => {
      const wdn = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
      const delta = prevSum ? Math.round((weekSum - prevSum) / prevSum * 100) : null;
      const tip = h('div.hx-wtip');
      const bars = h('div.hx-bars', { style: { '--goalf': String(goalDay / weekMax) } },
        h('div.hx-goal', h('span', 'meta ' + T.fmt(goalDay))),
        week.map(([d, v], i) => { const today = i === 6; const el = h('div.hx-day' + (v > 0 ? '.on' : '') + (v >= goalDay ? '.met' : '') + (today ? '.today' : ''),
          h('div.hx-col', v > 0 ? h('b.hx-v.num', v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'k' : String(v)) : null, h('i', { style: { height: v > 0 ? Math.max(4, v / weekMax * 100) + '%' : '3px' } })),
          h('span', today ? 'hoje' : wdn[d.getDay()]));
          el.addEventListener('mouseenter', () => { tip.textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ': ' + T.fmt(v) + ' palavras' + (v >= goalDay ? ' · meta batida ✓' : ''); tip.classList.add('on'); });
          el.addEventListener('mouseleave', () => tip.classList.remove('on'));
          return el; }));
      return h('div.hx-week',
        h('div.hx-wh', h('div', h('div.hx-wk', 'Últimos 7 dias'), h('div.hx-wsum', h('b.num', T.fmt(weekSum)), ' palavras')),
          h('div.hx-wmeta', delta != null ? h('span.hx-delta' + (delta >= 0 ? '.up' : '.down'), (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '% vs. semana anterior') : null,
            h('span', daysMet + (daysMet === 1 ? ' dia' : ' dias') + ' com a meta batida'))),
        bars, tip);
    };
    const allWords = active.reduce((a, p) => a + (p.meta?.words || 0), 0);
    const last = active[0];
    const wd = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const PROMPTS = [['Uma palavra após a outra após a outra é poder.', 'Margaret Atwood'], ['Se há um livro que você quer ler e ainda não foi escrito, você deve escrevê-lo.', 'Toni Morrison'], ['Não há agonia maior do que carregar uma história não contada dentro de você.', 'Maya Angelou'], ['Você não esgota a criatividade. Quanto mais usa, mais você tem.', 'Maya Angelou'], ['Comece a escrever, não importa o quê. A água não corre até a torneira ser aberta.', 'Louis L’Amour'], ['Você pode editar uma página ruim. Não pode editar uma página em branco.', 'Jodi Picoult'], ['Escrevo para descobrir o que estou pensando.', 'Joan Didion'], ['Escreva a frase mais verdadeira que você conhece.', 'Ernest Hemingway'], ['O primeiro rascunho de qualquer coisa é uma porcaria.', 'Ernest Hemingway'], ['Tudo no mundo começou com um sim.', 'Clarice Lispector'], ['A arte existe porque a vida não basta.', 'Ferreira Gullar'], ['Ler é sonhar pela mão de outrem.', 'Fernando Pessoa'], ['Livros não mudam o mundo. Quem muda o mundo são as pessoas. Os livros só mudam as pessoas.', 'Mario Quintana'], ['O que a memória ama fica eterno.', 'Adélia Prado'], ['Se você quer ser escritor, precisa ler muito e escrever muito.', 'Stephen King'], ['Amadores esperam pela inspiração; o resto de nós simplesmente levanta e vai trabalhar.', 'Stephen King'], ['Livros são uma magia singularmente portátil.', 'Stephen King'], ['A inspiração existe, mas precisa te encontrar trabalhando.', 'Pablo Picasso'], ['Tudo o que você pode imaginar é real.', 'Pablo Picasso'], ['Não dá para esperar pela inspiração. É preciso ir atrás dela com um porrete.', 'Jack London'], ['Escrevemos para provar a vida duas vezes.', 'Anaïs Nin'], ['Faça arte boa.', 'Neil Gaiman'], ['O mundo sempre parece mais brilhante quando você acabou de fazer algo que não existia antes.', 'Neil Gaiman'], ['A imaginação é mais importante que o conhecimento.', 'Albert Einstein'], ['Todo artista foi primeiro um amador.', 'Ralph Waldo Emerson'], ['A melhor maneira de ter uma boa ideia é ter muitas ideias.', 'Linus Pauling'], ['A vida é breve, a arte é longa.', 'Hipócrates'], ['Escrever é uma forma de terapia.', 'Graham Greene']];
    const dayN = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    let pi = dayN % PROMPTS.length;
    const promptEl = h('figure.hx-prompt-t', h('blockquote', '“' + PROMPTS[pi][0] + '”'), h('figcaption', '— ' + PROMPTS[pi][1]));
    const showQ = () => { promptEl.replaceChildren(h('blockquote', '“' + PROMPTS[pi][0] + '”'), h('figcaption', '— ' + PROMPTS[pi][1])); };
    const hero = h('section.hx-hero',
      h('div.hx-brand',
        h('h1.home-title.hx-title', { 'aria-label': 'Entrelinhas' }, h('span.hx-rule'), h('span.hx-word', h('span', 'Entre'), h('i', 'linhas')), h('span.hx-rule.b')),
        h('p.home-greet.hx-greet', active.length ? 'Qual história vamos escrever hoje?' : 'Vamos começar o primeiro livro?'),
        h('div.home-actions.hx-actions',
          h('button.btn.primary.hx-cta', { onclick: () => Shell.projectModal() }, icon('plus'), 'Novo livro'),
          last ? h('button.btn.hx-ghost', { onclick: () => Shell.openProject(last.id) }, icon('pen'), 'Continuar “' + (last.title || 'Sem título') + '”') : null,
          h('button.btn.hx-ghost', { onclick: (e) => T.menuAt(e.currentTarget, [{ head: 'Importar (abre a pasta Downloads quando o navegador deixa)' }, { label: 'Livro de outro programa (Word, Google Docs, .txt, .md)…', icon: 'doc', fn: () => T.Importer.pick() }, { label: 'Backup do Entrelinhas (.json)…', icon: 'download', fn: () => importBackup() }]), title: 'Importar um livro do Word/Google Docs ou um backup do Entrelinhas' }, icon('upload'), 'Importar ▾'),
          T.Full.btn('.hx-ic'), T.iconBtn('gear', 'Ajustes', () => Shell.settings(), '.hx-ic')),
        T.STANDALONE ? h('div.hx-solo.glass', icon('home'), h('div', h('b', 'Versão independente do Entrelinhas'), h('p', 'Seus livros ficam guardados neste navegador, neste aparelho. Para trazer os livros do Claude: lá, abra Ajustes › Backup › “Backup de todos os livros”; aqui, toque em Importar. Faça backups de vez em quando (o lembrete avisa). Sinônimos, gerador de nomes e outras funções que usam o Claude só funcionam na versão do claude.ai.'))) : null),
      );
    const side = h('div.hx-side',
        h('div.hx-stats',
          h('div.hx-stat', h('b.num', T.fmt(todayW)), h('span', 'palavras hoje')),
          h('div.hx-stat', h('b.num', String(streak)), h('span', streak === 1 ? 'dia seguido' : 'dias seguidos'))),
        weekPanel(),
        h('div.hx-prompt', h('div.hx-prompt-h', icon('spark'), 'Frase do dia', h('button.hx-next', { type: 'button', title: 'Outra frase', 'aria-label': 'Outra frase', onclick: () => { pi = (pi + 1) % PROMPTS.length; showQ(); promptEl.classList.remove('in'); void promptEl.offsetWidth; promptEl.classList.add('in'); } }, '↻')), promptEl));
    home.append(hero);

    if (!projects.length) {
      home.append(h('div.home-section', h('div.empty-hero.hx-empty',
        h('h2', 'Seu primeiro livro'),
        h('p', 'Crie um projeto para cada livro. Dentro dele ficam o manuscrito, as pesquisas, as ideias, a wiki, os mapas, a timeline e o resto do seu mundo.'),
        h('div.row', h('button.btn.primary.hx-cta', { onclick: () => Shell.projectModal() }, icon('plus'), 'Criar meu livro'), h('button.btn.hx-ghost', { onclick: () => Shell.createProject({ title: 'Livro de exemplo', description: 'Um projeto de teste para explorar a plataforma.', hue: 198, template: 'tres-atos', sample: true }) }, 'Abrir um exemplo')))));
    }
    const shelf = h('div.shelf.hx-shelf');
    (showArch ? archived : active).forEach(p => shelf.appendChild(bookCard(p)));
    if (!showArch) shelf.appendChild(h('div.book-card.new', { onclick: () => Shell.projectModal(), role: 'button', tabindex: '0' }, h('div', icon('plus'), h('div', 'Novo livro'))));
    if (projects.length) home.append(h('div.home-section.hx-shelf-wrap', h('div.row', h('h2.grow', showArch ? 'Arquivados' : 'Sua estante'),
      archived.length || showArch ? h('button.btn.sm.hx-ghost', { onclick: () => { Shell._showArchived = !showArch; Shell.home(); } }, icon('archive'), showArch ? 'Ver livros ativos' : 'Ver arquivados (' + archived.length + ')') : null), shelf, h('div.hx-plank', { 'aria-hidden': 'true' })));
    home.append(h('div.home-section.hx-dash-wrap', h('h2', 'Seu ritmo'), side));
    // espaços de trabalho recentes
    const ws = [];
    projects.forEach(p => { (p.meta?.workspaces || []).forEach(w => ws.push({ p, w })); });
    ws.sort((a, b) => (b.w.at || 0) - (a.w.at || 0));
    if (ws.length) home.append(h('div.home-section', h('h2', 'Espaços de trabalho recentes'),
      h('div.ws-list', ws.slice(0, 6).map(({ p, w }) => h('div.ws-card.glass', { onclick: () => Shell.openProject(p.id, w.layout), style: { borderLeft: `4px solid hsl(${p.meta?.hue ?? 268} 80% 60%)` } }, h('b', w.name), h('span', p.title + ' · ' + T.relTime(w.at)))))));

    root.appendChild(home);
  };

  function bookCard(p){
    const hue = p.meta?.hue ?? 268;
    const card = h('div.book-card', { role: 'button', tabindex: '0', onclick: (e) => { if (!e.target.closest('.menu-btn')) Shell.openProject(p.id); } });
    card.style.setProperty('--h', hue);
    if (p.meta?.cover) card.appendChild(h('img.cover', { src: T.Assets.url(p.meta.cover), alt: '' }));
    card.append(h('div.shade'),
      h('button.icon-btn.sm.menu-btn', { title: 'Opções do livro', onclick: (e) => { e.stopPropagation(); T.menuAt(e.currentTarget, [
        { label: 'Abrir', icon: 'book', fn: () => Shell.openProject(p.id) },
        { label: 'Editar capa e informações', icon: 'edit', fn: () => Shell.projectModal(p) },
        { label: 'Baixar backup', icon: 'download', fn: () => Shell.backupProject(p.id) },
        { label: p.meta?.archived ? 'Desarquivar' : 'Arquivar', icon: 'archive', fn: () => { S().update(p.id, { meta: { archived: !p.meta?.archived } }); setTimeout(() => Shell.home(), 50); } },
        '-', { label: 'Apagar livro', icon: 'trash', danger: true, fn: async () => { if (await T.confirm('Apagar “' + p.title + '”?', 'Tudo o que está dentro dele será apagado para sempre. Se quiser guardar, baixe um backup antes.', 'Apagar para sempre', true)) { await S().removeProject(p.id); Shell.home(); } } },
      ]); } }, icon('dots')),
      h('div.t', p.title || 'Sem título'),
      p.meta?.description ? h('div.d', p.meta.description) : null,
      h('div.m', h('span.num', T.fmt(p.meta?.words || 0) + ' palavras'), h('span', T.relTime(p.meta?.opened || p.updated))),
      h('div.bk-prog', { title: Math.round((p.meta?.words || 0) / Math.max(1, p.meta?.targets?.book || 90000) * 100) + '% da meta do livro' }, h('i', { style: { width: Math.min(100, (p.meta?.words || 0) / Math.max(1, p.meta?.targets?.book || 90000) * 100) + '%' } })));
    card.prepend(h('span.spine-l', { 'aria-hidden': 'true' }));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') Shell.openProject(p.id); });
    return card;
  }

  /* ---------- criar/editar projeto ---------- */
  const TEMPLATES = {
    simples: { name: 'Romance simples', desc: 'Capítulos e cenas, do jeito que vier.' },
    'tres-atos': { name: 'Três atos', desc: 'Apresentação, confronto e resolução.' },
    heroi: { name: 'Jornada do herói', desc: 'Os 12 passos de Campbell e Vogler.' },
    savethecat: { name: 'Save the Cat', desc: 'As 15 batidas de Blake Snyder.' },
    multipov: { name: 'Vários narradores', desc: 'Cenas alternando pontos de vista.' },
  };
  Shell.projectModal = function(p){
    const editing = !!p;
    let hue = p?.meta?.hue ?? T.HUES[Math.floor(Math.random() * T.HUES.length)];
    let tpl = 'simples', cover = p?.meta?.cover || null;
    T.modal((box, close) => {
      const title = h('input.input', { value: p?.title || '', placeholder: 'ex.: Livro 1', id: 'pm-title', autofocus: true });
      const desc = h('textarea.textarea', { placeholder: 'Uma frase sobre o livro (aparece na capa da estante).', id: 'pm-desc' }); desc.value = p?.meta?.description || '';
      const author = h('input.input', { value: p?.meta?.author || '', placeholder: 'Seu nome como vai na capa', id: 'pm-author' });
      let uploading = false;
      const prev = h('div', cover ? h('img.cover-prev', { src: T.Assets.url(cover), alt: 'Capa atual' }) : null);
      const coverBtn = h('button.btn', { type: 'button', onclick: async () => {
        const f = await T.pickFile('image/*'); if (!f) return;
        uploading = true; coverBtn.textContent = 'Enviando…'; saveBtn.disabled = true;
        const ref = await T.Assets.upload(f);
        uploading = false; saveBtn.disabled = false;
        if (ref) { cover = ref; coverBtn.textContent = 'Trocar capa'; prev.replaceChildren(h('img.cover-prev', { src: T.Assets.url(ref), alt: 'Nova capa' })); }
        else coverBtn.textContent = 'Escolher imagem de capa';
      } }, cover ? 'Trocar capa' : 'Escolher imagem de capa');
      const rmCover = h('button.btn.sm', { type: 'button', onclick: () => { cover = null; prev.replaceChildren(); } }, 'Sem capa');
      const saveBtn = h('button.btn.primary', { onclick: () => save() }, editing ? 'Salvar' : 'Criar livro');
      const tplGrid = h('div.tpl-grid', Object.entries(TEMPLATES).map(([k, t]) => { const b = h('button.tpl' + (k === tpl ? '.on' : ''), { type: 'button', onclick: () => { tpl = k; tplGrid.querySelectorAll('.tpl').forEach(x => x.classList.remove('on')); b.classList.add('on'); } }, h('b', t.name), h('span', t.desc)); return b; }));
      const save = async () => {
        if (uploading) { T.toast('Espere a capa terminar de enviar.'); return; }
        const t = title.value.trim() || 'Livro sem título';
        if (editing) {
          S().update(p.id, { title: t, meta: { description: desc.value.trim(), hue, author: author.value.trim(), cover } });
          close(); if (Shell.pid === p.id) { Shell.applyTheme(); Shell.renderTop(); Shell.renderSide(); } else Shell.home();
        } else { close(); Shell.createProject({ title: t, description: desc.value.trim(), hue, author: author.value.trim(), cover, template: tpl }); }
      };
      box.append(h('h2', editing ? 'Informações do livro' : 'Novo livro'), h('p.sub', editing ? 'Nome, cor e capa deste projeto.' : 'Cada livro é um projeto separado, com tudo o que é dele.'),
        h('div.stack', h('label.field', { for: 'pm-title' }, 'Título', title), h('label.field', { for: 'pm-desc' }, 'Descrição', desc),
          h('label.field', { for: 'pm-author' }, 'Autora', author),
          h('div.field', h('span', { style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' } }, 'Cor do projeto (tinge o vidro e os detalhes)'), T.swatches(hue, (x) => { hue = x; document.documentElement.style.setProperty('--hue', x); })),
          h('div.field', h('span', { style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' } }, 'Capa'), h('div.row', prev, coverBtn, rmCover)),
          editing ? null : h('div.field', h('span', { style: { fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' } }, 'Começar com qual estrutura?'), tplGrid)),
        h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Cancelar'), saveBtn));
      title.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
    }, { onClose: () => Shell.applyTheme() });
  };

  Shell.createProject = function({ title, description, hue, author, cover, template, sample }, opts = {}){
    const p = S().create({ type: 'project', title, meta: { sample: !!sample, description, hue, author, cover, targets: { book: 90000, session: 1000, deadline: '', days: [1, 2, 3, 4, 5] } } });
    const pid = p.id; let o = 1000;
    const mk = (type, title, parent, meta = {}, body = '') => S().create({ pid, type, area: 'ms', parent, title, order: (o += 1000), meta: Object.assign({ status: 'rascunho' }, meta), body });
    const chapterWithScene = (part, title, syn) => { const c = mk('chapter', title, part, { synopsis: syn }); mk('scene', 'Cena 1', c.id); return c; };
    if (template === 'tres-atos') {
      const acts = [['Ato I · Apresentação', [['O mundo comum', 'Quem é a protagonista antes de tudo mudar? O que ela quer e o que lhe falta?'], ['O incidente', 'O acontecimento que tira a vida do eixo e não deixa voltar atrás.']]],
        ['Ato II · Confronto', [['Novas regras', 'Ela entra num mundo ou situação desconhecida e tenta se adaptar.'], ['Ponto médio', 'Uma revelação ou virada muda o objetivo ou o jogo.'], ['Tudo dá errado', 'O plano falha; as perdas se acumulam até o ponto mais baixo.']]],
        ['Ato III · Resolução', [['O clímax', 'O confronto final, em que ela usa o que aprendeu.'], ['O novo normal', 'Como o mundo e ela ficaram depois de tudo.']]]];
      acts.forEach(([at, chs]) => { const part = mk('part', at, null); chs.forEach(([t, s]) => chapterWithScene(part.id, t, s)); });
    } else if (template === 'heroi') {
      [['Mundo comum', 'A vida da heroína antes da aventura.'], ['Chamado à aventura', 'Surge o problema ou convite.'], ['Recusa do chamado', 'Medo ou dúvida a fazem hesitar.'], ['Encontro com o mentor', 'Alguém lhe dá conselho, treino ou um objeto.'], ['Travessia do primeiro limiar', 'Ela deixa o mundo conhecido.'], ['Testes, aliados e inimigos', 'Aprende as regras do mundo novo.'], ['Aproximação da caverna oculta', 'Prepara-se para o maior desafio.'], ['Provação', 'Enfrenta a morte, real ou simbólica.'], ['Recompensa', 'Conquista o que buscava.'], ['Caminho de volta', 'As consequências a perseguem.'], ['Ressurreição', 'O teste final transforma a heroína.'], ['Retorno com o elixir', 'Volta para casa mudada, trazendo algo de valor.']]
        .forEach(([t, s]) => chapterWithScene(null, t, s));
    } else if (template === 'savethecat') {
      const beats = [['Ato 1', [['Imagem de abertura', 'Um retrato do mundo e da protagonista antes da mudança.'], ['Tema declarado', 'Alguém diz, sem querer, a lição que ela precisa aprender.'], ['Preparação', 'A vida dela, seus defeitos e o que está em jogo.'], ['Catalisador', 'O acontecimento que muda tudo.'], ['Debate', 'Ela hesita: deve seguir em frente?']]],
        ['Ato 2', [['Virada para o Ato 2', 'Ela escolhe entrar no mundo novo.'], ['História B', 'Uma relação nova que carrega o tema.'], ['Diversão e jogos', 'A promessa da premissa: o que o leitor veio ver.'], ['Ponto médio', 'Vitória falsa ou derrota falsa; as apostas sobem.'], ['Os vilões se aproximam', 'Pressões de fora e de dentro apertam.'], ['Tudo está perdido', 'O ponto mais baixo; algo ou alguém morre.'], ['Noite escura da alma', 'Ela encara a derrota e o que precisa mudar.']]],
        ['Ato 3', [['Virada para o Ato 3', 'A solução aparece, unindo as histórias A e B.'], ['Final', 'Ela age com o que aprendeu.'], ['Imagem final', 'O espelho da abertura, mostrando a transformação.']]]];
      beats.forEach(([at, chs]) => { const part = mk('part', at, null); chs.forEach(([t, s]) => chapterWithScene(part.id, t, s)); });
    } else if (template === 'multipov') {
      for (let i = 1; i <= 3; i++) { const c = mk('chapter', 'Capítulo ' + i, null); mk('scene', 'Cena · Narrador A', c.id, { pov: 'Narrador A' }); mk('scene', 'Cena · Narrador B', c.id, { pov: 'Narrador B' }); }
    } else {
      const c = mk('chapter', 'Capítulo 1', null); mk('scene', 'Cena 1', c.id);
    }
    const f = S().create({ pid, type: 'folder', area: 'res', parent: null, title: 'Pesquisa', order: 1000 });
    S().create({ pid, type: 'doc', area: 'res', parent: f.id, title: 'Notas do mundo', order: 2000, body: '' });
    if (sample) {
      const first = T.MS.flat(pid).find(i => i.type === 'scene');
      const body = '<p>A chuva caía mais pesada do que eu lembrava. Não sei exatamente quando tudo aconteceu, só que a minha cabeça se recusa a acreditar que aconteceu.</p><p>— Você ouviu isso? — perguntou Vera, sem tirar os olhos da janela.</p><p>Eu tinha ouvido. Um sino, longe, tocando três vezes onde nenhum sino deveria existir.</p>';
      if (first) S().update(first.id, { body, meta: { words: T.words(body), pov: 'Iris', synopsis: 'Iris e Vera ouvem o sino impossível na noite de chuva.' } });
      S().create({ pid, type: 'idea', area: 'ideas', title: 'E se a lua vermelha for um olho?', body: '<p>E se a lua vermelha for um olho?</p>' });
    }
    if (!opts.noOpen) Shell.openProject(pid);
    return p;
  };

  /* ================= PROJETO ================= */
  Shell.openProject = async function(pid, layout){
    Shell.teardown();
    Shell.pid = pid;
    const root = app(); root.innerHTML = '';
    root.appendChild(h('div.boot.glass', h('div.boot-mark', S().get(pid)?.title || 'Abrindo…'), h('div.boot-sub', 'Carregando o livro…')));
    await S().loadProject(pid);
    if (Shell.pid !== pid) return;
    const p = S().get(pid); if (!p) { Shell.home(); return; }
    S().update(pid, { meta: { opened: Date.now() } }, { delay: 3000, silent: true });
    Shell.openState = Object.assign({}, p.meta?.openState || {});
    Shell.applyTheme();
    root.innerHTML = '';
    const shell = h('div.shell');
    Shell.el = shell;
    Shell.topEl = h('header.top.glass.lg');
    Shell.sideEl = h('aside.side.glass', { 'aria-label': 'Pastas do projeto' });
    Shell.mainEl = h('main.main');
    shell.append(Shell.topEl, Shell.sideEl, Shell.mainEl);
    root.appendChild(shell);
    if (innerWidth < 860) shell.classList.add('side-closed');
    Shell.renderTop(); Shell.renderSide();
    setTimeout(() => { if (Shell.pid === pid && T.GDocs?.askOnOpen && !T.STANDALONE) T.GDocs.askOnOpen(pid); }, 1400);
    setTimeout(() => { if (Shell.pid === pid && !document.querySelector('.scrim')) Shell.backupRemind(pid); }, 4500);
    // ideias rápidas
    const fab = h('div.fabs', h('button.fab.glass.glass-strong', { onclick: () => Shell.openTesauro(), title: 'Abrir o Tesauro da Escrita ao lado do texto' }, icon('feather'), 'Tesauro'),
      h('button.fab.glass.glass-strong', { onclick: quickIdea, title: 'Anotar uma ideia rápida' }, icon('spark'), 'Ideia'));
    root.appendChild(fab);
    Shell.layout = normalizeLayout(layout || p.meta?.layout);
    if (!Shell.layout.panes.some(pn => pn.tabs.length)) {
      const firstDoc = T.MS.flat(pid).find(i => i.type === 'scene' || i.type === 'chapter');
      Shell.layout.panes[0].tabs.push(firstDoc ? { id: T.id(), kind: 'doc', ref: firstDoc.id } : { id: T.id(), kind: 'overview', ref: 'overview' });
      Shell.layout.panes[0].active = Shell.layout.panes[0].tabs[0].id;
    }
    Shell.renderPanes();
    backupReminder();
  };

  function normalizeLayout(l){
    const base = { n: 1, focus: 0, panes: [{ tabs: [], active: null }] };
    if (!l || !l.panes) return base;
    const lay = JSON.parse(JSON.stringify(l));
    const upgrade = { wiki: { kind: 'wiki', ref: 'wiki' }, tree: { kind: 'tree', ref: 'tree' }, web: { kind: 'web', ref: 'web' }, dict: { kind: 'lang', ref: 'langs' }, cal: { kind: 'cal', ref: 'cal' }, timeline: { kind: 'timeline', ref: 'timeline' }, maps: { kind: 'maps', ref: 'maps' }, mood: { kind: 'moods', ref: 'moods' }, radio: { kind: 'radio', ref: 'radio' }, mockup: { kind: 'mockup', ref: 'mockup' }, compile: { kind: 'compile', ref: 'compile' }, tension: { kind: 'tension', ref: 'tension' }, thesaurus: { kind: 'tesauro', ref: 'tesauro' } };
    lay.panes.forEach(pn => (pn.tabs || []).forEach(t => { if (t.kind === 'soon' && upgrade[t.ref]) Object.assign(t, upgrade[t.ref]); }));
    // abas antigas de teia, árvore, calendário, timeline, metas… passam a abrir dentro das telas que juntam ferramentas
    if (T.Hubs) lay.panes.forEach(pn => (pn.tabs || []).forEach(t => { const r = T.Hubs.route(t); if (r) { const old = Object.assign({}, t); for (const k in t) if (k !== 'id') delete t[k]; Object.assign(t, { kind: 'hub', ref: r.ref, sub: r.sub, subs: { [r.sub]: Object.assign(old, { id: T.id() }) } }); } }));
    lay.panes = lay.panes.slice(0, 4).map(pn => ({ tabs: (pn.tabs || []).filter(t => validTab(t)).map(t => Object.assign({}, t, { id: t.id || T.id() })), active: pn.active }));
    lay.n = T.clamp(lay.n || lay.panes.length, 1, 4);
    while (lay.panes.length < lay.n) lay.panes.push({ tabs: [], active: null });
    lay.panes = lay.panes.slice(0, lay.n);
    lay.panes.forEach(pn => { if (!pn.tabs.find(t => t.id === pn.active)) pn.active = pn.tabs[0]?.id || null; });
    lay.focus = T.clamp(lay.focus || 0, 0, lay.n - 1);
    if (lay.arr === 'custom' && !(lay.custom && Array.isArray(lay.custom.at) && lay.custom.at.length === lay.n)) { lay.arr = null; lay.custom = null; }
    return lay;
  }
  function validTab(t){
    if (!t || (!T.Views[t.kind] && t.kind !== 'doc')) return false;
    if (t.kind === 'doc' || t.kind === 'page') return !!S().get(t.ref);
    if (t.kind === 'lang' && t.ref !== 'langs') return !!S().get(t.ref);
    if (t.kind === 'cork' && !['ms', 'res'].includes(t.ref)) return !!S().get(t.ref);
    return true;
  }
  const persistLayout = T.debounce(() => {
    if (!Shell.pid || !Shell.layout) return;
    const lay = { n: Shell.layout.n, arr: isCustom() ? 'custom' : arrOf(), custom: isCustom() ? Shell.layout.custom : undefined, focus: Shell.layout.focus, panes: Shell.layout.panes.map(pn => ({ active: pn.active, tabs: pn.tabs.map(t => ({ id: t.id, kind: t.kind, ref: t.ref, mode: t.mode })) })) };
    S().update(Shell.pid, { meta: { layout: lay } }, { delay: 1500, silent: true });
  }, 800);
  T.on('tab-changed', () => persistLayout());

  Shell.teardown = function(){
    Shell.mounted.forEach(m => { try { m.inst.destroy(); } catch (e) {} });
    Shell.mounted.clear();
    Shell.floats.forEach(f => { try { f.inst.destroy(); } catch (e) {} f.el.remove(); }); Shell.floats = [];
    if (Shell.sprint) { clearInterval(Shell.sprint.timer); spSave(); Shell.sprint = null; }
    document.querySelectorAll('.fabs, .fab, .idea-pop, .sel-pop, .layout-bar').forEach(e => e.remove());
    document.body.classList.remove('layout-edit');
    T.closeMenu();
  };
  Shell.flushEditors = function(){ Shell.mounted.forEach(m => m.inst.flush && m.inst.flush()); Shell.floats.forEach(f => f.inst.flush && f.inst.flush()); };

  /* ---------- barra de cima ---------- */
  let saveDot = null;
  Shell.renderTop = function(){
    if (!Shell.sprint && Shell.pid) Shell.restoreSprint();
    const p = S().get(Shell.pid); const top = Shell.topEl; top.innerHTML = '';
    const n = Shell.layout ? Shell.layout.n : 1;
    const menuBtn = (ic, label, title, items) => h('button.btn.sm.top-menu', { type: 'button', title, onclick: (e) => T.menuAt(e.currentTarget, items()) }, icon(ic), h('span.lbl', label), h('span.caret', { style: { fontSize: '10px', opacity: .6 } }, '▾'));
    saveDot = h('span.save-st', h('i.sv-dot'), h('span.lbl'));
    const sess = h('span.session-pill.num#session-pill');
    const dark = document.body.dataset.mode === 'dark';
    top.append(
      h('span.brand', { title: 'Voltar para a estante', onclick: () => { Shell.flushEditors(); Shell.home(); } }, 'Entrelinhas'),
      T.iconBtn('sidebar', 'Mostrar ou esconder a barra lateral (Ctrl+\\)', () => toggleSide()),
      h('button.btn.sm.proj-name', { onclick: () => Shell.projectModal(S().get(Shell.pid)), title: 'Informações e capa do livro' }, p.meta?.cover ? h('img.proj-cover', { src: T.Assets.url(p.meta.cover), alt: '' }) : h('span.dot'), p.title),
      h('span.spacer'), saveDot, sess,
      h('span.radio-slot', T.Radio ? T.Radio.pill() : null),
      Shell.sprint ? sprintPill() : h('button.btn.sm', { onclick: (e) => sprintMenu(e.currentTarget), title: 'Sprint de escrita' }, icon('clock'), h('span.lbl', 'Sprint')),
      menuBtn('layout' + n, 'Painéis', 'Quantos painéis e espaços de trabalho', () => [
        { head: 'Como arrumar os painéis' },
        ...Object.entries(ARR).map(([k, a]) => ({ label: (arrOf() === k ? '● ' : '') + a.name, svg: Shell.arrIcon(k), fn: () => setArr(k) })),
        '-', { label: 'Editar layout (arrastar e esticar)…', icon: 'focus', fn: () => Shell.layoutEdit(true) },
        { label: 'Espaços de trabalho…', icon: 'grid', fn: () => workspaceMenu(top.querySelector('.top-menu')) },
      ]),
      menuBtn('wall', 'Visual', 'Papéis de parede, claro ou escuro, ajustes', () => [
        { label: 'Papéis de parede…', icon: 'wall', fn: () => Shell.wallModal() },
        { label: dark ? 'Mudar para modo claro' : 'Mudar para modo escuro', icon: dark ? 'sun' : 'moon', fn: () => { S().setPrefs({ theme: dark ? 'light' : 'dark' }); Shell.applyTheme(); Shell.renderTop(); T.toast(dark ? 'Modo claro.' : 'Modo escuro.'); } },
        { label: T.Full.on() ? 'Sair da tela cheia' : 'Tela cheia', icon: 'focus', fn: () => T.Full.toggle() },
        { label: (S().prefs().autoFull ? '✓ ' : '') + 'Abrir sempre em tela cheia (no primeiro clique)', icon: 'focus', fn: () => { const v = !S().prefs().autoFull; S().setPrefs({ autoFull: v }); T.toast(v ? 'Combinado: ao abrir o Entrelinhas, o primeiro clique já deixa tudo em tela cheia.' : 'Tela cheia automática desligada.'); if (v && !T.Full.on()) T.Full.toggle(); } },
        '-', { label: 'Ajustes e backup…', icon: 'gear', fn: () => Shell.settings() },
      ]), T.Full.btn());
    updateSession(); updateSave();
  };
  function updateSession(){
    const el = document.getElementById('session-pill'); if (!el || !Shell.pid) return;
    const p = S().get(Shell.pid); const t = T.Session.today(Shell.pid); const g = p.meta?.targets?.session || 0;
    el.replaceChildren(h('span.sp-x', 'hoje '), T.fmt(t) + (g ? ' / ' + T.fmt(g) : ''), h('span.sp-x', ' palavras'));
    el.title = 'Hoje: ' + T.fmt(t) + ' palavras' + (g ? ' de ' + T.fmt(g) : '');
    el.style.setProperty('--pc', g ? Math.min(100, t / g * 100) + '%' : '0%'); el.classList.toggle('has-goal', !!g);
  }
  T.on('session', updateSession);
  function updateSave(st){
    if (!saveDot) return;
    st = st || { saving: S().busy ? 1 : 0, failed: false, mode: S().mode };
    const txt = S().mode !== 'cloud' ? 'no navegador' : st.failed ? 'erro ao salvar' : (st.saving || S().busy) ? 'salvando…' : 'salvo';
    saveDot.lastChild.textContent = txt; saveDot.title = S().mode !== 'cloud' ? 'Salvo neste navegador' : txt.charAt(0).toUpperCase() + txt.slice(1);
    saveDot.dataset.st = st.failed ? 'bad' : (st.saving || S().busy) ? 'busy' : 'ok';
  }
  T.on('save-status', updateSave);
  setInterval(() => updateSave(), 2500);
  // atualiza a contagem de palavras do projeto (aparece na estante)
  T.on('doc-saved', T.debounce(({ pid }) => { const w = T.MS.words(pid); if (S().get(pid)?.meta?.words !== w) S().update(pid, { meta: { words: w } }, { delay: 4000, silent: true }); Shell.renderSideCounts && Shell.renderSideCounts(); }, 700));

  function toggleSide(){
    if (innerWidth < 860) Shell.el.classList.toggle('side-closed'); else Shell.el.classList.toggle('no-side');
    setTimeout(() => Shell.placeHandles(), 30);
  }

  /* ---------- barra lateral ---------- */
  Shell.renderSide = function(){
    const pid = Shell.pid; const side = Shell.sideEl; side.innerHTML = '';
    const search = h('input.input', { placeholder: 'Procurar textos, funções, mapas…', 'aria-label': 'Procurar no livro e nas funções', value: Shell._filter || '' });
    const body = h('div.side-body');
    side.append(h('div.side-head', h('div.side-search', icon('search'), search)), body,
      h('div.side-foot', T.iconBtn('home', 'Estante de livros', () => { Shell.flushEditors(); Shell.home(); }), T.iconBtn('download', 'Baixar backup do livro', () => Shell.backupProject(pid)), T.iconBtn('gear', 'Personalizar a barra lateral: esconder ferramentas que você não usa', () => Shell.sideCustomize()), h('span.grow'), Shell.bkChip(pid)));
    search.oninput = () => { Shell._filter = search.value; draw(); };
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { search.value = ''; Shell._filter = ''; draw(); }
      if (e.key === 'Enter') { const first = body.querySelector('.sr-hit'); if (first) first.click(); }
      if (e.key === 'ArrowDown') { const first = body.querySelector('.sr-hit'); if (first) { e.preventDefault(); first.focus(); } }
    });
    function draw(){
      body.innerHTML = '';
      const f = (Shell._filter || '').toLowerCase();
      if (f.trim()) { body.appendChild(searchResults(pid, f.trim())); return; }
      const isOpen = (k, def = true) => f ? true : (Shell.openState[k] ?? def);
      const flip = (k, def = true) => { Shell.openState[k] = !isOpen(k, def); persistOpen(); draw(); };
      // cabeçalho de seção que abre e fecha
      const sec = (key, label, opts = {}) => {
        const open = isOpen(key);
        const tw = h('button.sec-tw' + (open ? '.open' : ''), { title: open ? 'Fechar ' + label : 'Abrir ' + label, 'aria-label': (open ? 'Fechar ' : 'Abrir ') + label, 'aria-expanded': String(open), onclick: (e) => { e.stopPropagation(); flip(key); } }, icon('chev'));
        const head = h('div.side-sec-h', tw, h('span.grow', { onclick: opts.onTitle || (() => flip(key)), title: opts.title || (open ? 'Fechar' : 'Abrir') }, label), opts.add || null);
        return { open, el: h('div.side-sec' + (open ? '' : '.folded'), head) };
      };
      // linha de ferramenta com filhos que abrem e fecham
      const foldRow = (key, ic, label, fn, extra, kids) => {
        const has = kids && kids.length; const open = isOpen(key);
        const r = toolRow(ic, label, fn, extra);
        if (has) { const tw = r.querySelector('.tw'); tw.classList.toggle('open', open); tw.classList.add('fold'); tw.appendChild(icon('chev')); tw.firstChild.style.cssText = 'width:12px;height:12px'; tw.title = open ? 'Esconder a lista' : 'Mostrar a lista';
          tw.onclick = (e) => { e.stopPropagation(); flip(key); }; }
        return [r, has && open ? h('div.tree-kids', kids) : null];
      };
      const addBtn = (label, items) => h('button.icon-btn', { title: 'Adicionar', 'aria-label': 'Adicionar em ' + label, onclick: (e) => T.menuAt(e.currentTarget, items) }, icon('plus'));
      // Manuscrito
      const ms = sec('sec:ms', 'Manuscrito', { onTitle: () => Shell.open({ kind: 'cork', ref: 'ms' }), title: 'Abrir quadro de fichas', add: addBtn('Manuscrito', [
        { label: 'Nova parte', icon: 'part', fn: () => newItem('part', null, 'ms') },
        { label: 'Novo capítulo', icon: 'chapter', fn: () => newItem('chapter', null, 'ms') },
        { label: 'Quadro de fichas do livro', icon: 'cork', fn: () => Shell.open({ kind: 'cork', ref: 'ms' }) },
      ]) });
      body.appendChild(ms.el); if (ms.open) { body.appendChild(tree(pid, null, 'ms', f)); body.appendChild(toolRow('search', 'Localizar e substituir no livro', () => Shell.open({ kind: 'find', ref: 'find' })));
        if (T.GDocs) { const gs = T.GDocs.status(pid); body.appendChild(toolRow('download', 'Backup no Docs', () => T.GDocs.panel(pid), h('span.chip.gd-chip' + (gs.err ? '.bad' : gs.on ? '.ok' : '.gray'), { title: gs.err || (gs.last ? 'Último backup ' + T.relTime(gs.last) : '') }, gs.running ? 'salvando…' : gs.err ? 'atenção' : gs.on ? (gs.last ? T.relTime(gs.last) : 'ligado') : 'desligado'))); } }
      const rs = S().prefs().showResearch !== true ? null : sec('sec:res', 'Pesquisa', { onTitle: () => Shell.open({ kind: 'cork', ref: 'res' }), title: 'Abrir quadro de fichas', add: addBtn('Pesquisa', [
        { label: 'Nova pasta', icon: 'folder', fn: () => newItem('folder', null, 'res') },
        { label: 'Novo documento', icon: 'doc', fn: () => newItem('doc', null, 'res') },
      ]) });
      if (rs) { body.appendChild(rs.el); if (rs.open) body.appendChild(tree(pid, null, 'res', f)); }
      const ideas = S().all(pid).filter(i => i.type === 'idea').length;
      const hid = new Set(S().prefs().sideHidden || []); const V = (k, el) => hid.has(k) ? null : el;
      const VV = (k, arr) => hid.has(k) ? [] : arr;
      const tl = sec('sec:tools', 'Escrever');
      if (tl.open) tl.el.append(...[
        V('ideias', toolRow('idea', 'Ideias', () => Shell.open({ kind: 'ideas', ref: 'ideas' }), ideas ? h('span.chip.gray.num', String(ideas)) : null)),
        V('progresso', toolRow('target', 'Metas e progresso', () => Shell.open({ kind: 'hub', ref: 'progresso' }))),
        V('aquecimento', toolRow('flame', 'Aquecimento (exercícios)', () => Shell.open({ kind: 'warmup', ref: 'warmup' }))),
        V('nomes', toolRow('person', 'Gerador de nomes', () => Shell.open({ kind: 'names', ref: 'names' }))),
        V('tesauro', toolRow('feather', 'Tesauro da Escrita', () => Shell.open({ kind: 'tesauro', ref: 'tesauro' }))),
        V('radio', toolRow('radio', 'Rádio literária', () => Shell.open({ kind: 'radio', ref: 'radio' }), T.Radio?.on ? h('span.chip.gray', 'tocando') : null))].filter(Boolean));
      body.appendChild(tl.el);
      const bk = sec('sec:book', 'Livro pronto');
      if (bk.open) bk.el.append(...[
        V('compilar', toolRow('download', 'Compilar (PDF, ePub, .docx)', () => Shell.open({ kind: 'compile', ref: 'compile' }))),
        V('mockup', toolRow('cube', 'Mockup 3D do livro', () => Shell.open({ kind: 'mockup', ref: 'mockup' }))),
        V('leitor', toolRow('book', 'Modo leitor', () => Shell.open({ kind: 'reader', ref: 'reader' })))].filter(Boolean));
      body.appendChild(bk.el);
      const pages = T.Ent.pages(pid);
      const langs = S().all(pid).filter(i => i.type === 'lang').sort(S().byOrder);
      const maps = (T.Maps ? T.Maps.list(pid) : []).filter(m => !f || (m.title || '').toLowerCase().includes(f));
      const moods = (T.Moods ? T.Moods.list(pid) : []).filter(m => !f || (m.title || '').toLowerCase().includes(f));
      const wd = sec('sec:world', 'Mundo', { onTitle: () => Shell.open({ kind: 'wiki', ref: 'wiki' }), title: 'Abrir a wiki', add: h('button.icon-btn', { title: 'Nova página da wiki', 'aria-label': 'Nova página da wiki', onclick: (e) => T.Wiki.newMenu(e.currentTarget, pid) }, icon('plus')) });
      if (wd.open) {
        const wt = wikiTree(pid, pages, f);
        wd.el.append(
          ...VV('wiki', foldRow('fold:wiki', 'book', 'Wiki do mundo', () => Shell.open({ kind: 'wiki', ref: 'wiki' }), pages.length ? h('span.chip.gray.num', String(pages.length)) : null, [...wt.childNodes])).filter(Boolean),
          V('conexoes', toolRow('web', 'Conexões (teia, grafo, árvore)', () => Shell.open({ kind: 'hub', ref: 'conexoes' }))),
          V('tempo', toolRow('cal', 'Tempo (calendário e timeline)', () => Shell.open({ kind: 'hub', ref: 'tempo' }), (() => { const n = S().all(pid).filter(i => i.type === 'event').length; return n ? h('span.chip.gray.num', String(n)) : null; })())),
          ...VV('mapas', foldRow('fold:maps', 'map', 'Mapas', () => Shell.open({ kind: 'maps', ref: 'maps' }), maps.length ? h('span.chip.gray.num', String(maps.length)) : null,
            maps.map(m => h('div.tree-row', { 'data-id': m.id, role: 'button', tabindex: '0', onclick: () => Shell.open({ kind: 'map', ref: m.id }) }, h('span.tw'), icon('map', 'ic'), h('span.lbl', m.title || 'Mapa'))))).filter(Boolean),
          ...VV('moods', foldRow('fold:moods', 'moodboard', 'Moodboards', () => Shell.open({ kind: 'moods', ref: 'moods' }), moods.length ? h('span.chip.gray.num', String(moods.length)) : null,
            moods.map(m => h('div.tree-row', { 'data-id': m.id, role: 'button', tabindex: '0', onclick: () => Shell.open({ kind: 'mood', ref: m.id }) }, h('span.tw'), icon('moodboard', 'ic'), h('span.lbl', m.title || 'Moodboard'))))).filter(Boolean),
          ...VV('dicionario', foldRow('fold:dict', 'dict', 'Dicionário', () => Shell.open({ kind: 'lang', ref: 'langs' }), langs.length ? h('span.chip.gray.num', String(langs.length)) : null,
            langs.map(l => h('div.tree-row', { 'data-id': l.id, role: 'button', tabindex: '0', onclick: () => Shell.open({ kind: 'lang', ref: l.id }) }, h('span.tw'), icon('dict', 'ic'), h('span.lbl', l.title))))).filter(Boolean));
      }
      body.appendChild(wd.el);
      const pend = T.MODULES.filter(m => m.stage >= 6);
      if (pend.length) { const nx = sec('sec:next', 'Próximas etapas'); if (nx.open) nx.el.append(...pend.map(m => toolRow(m.icon, m.name, () => Shell.open({ kind: 'soon', ref: m.id }), h('span.chip.soon', 'etapa ' + m.stage)))); body.appendChild(nx.el); }
      markActive();
    }
    Shell.redrawTree = draw;
    draw();
  };
  const SIDE_ITEMS = [
    ['Escrever', [['ideias', 'Ideias'], ['progresso', 'Metas e progresso (metas, estatísticas, curva de tensão)'], ['aquecimento', 'Aquecimento'], ['nomes', 'Gerador de nomes'], ['tesauro', 'Tesauro da Escrita'], ['radio', 'Rádio literária']]],
    ['Mundo', [['wiki', 'Wiki do mundo'], ['conexoes', 'Conexões (teia, grafo, árvore de relações)'], ['tempo', 'Tempo (calendário e timeline)'], ['mapas', 'Mapas'], ['moods', 'Moodboards'], ['dicionario', 'Dicionário']]],
    ['Livro pronto', [['compilar', 'Compilar'], ['mockup', 'Mockup 3D'], ['leitor', 'Modo leitor']]],
  ];
  Shell.sideCustomize = function(){
    T.modal((box, close) => {
      const hid = new Set(S().prefs().sideHidden || []);
      const save = () => { S().setPrefs({ sideHidden: [...hid] }); Shell.redrawTree && Shell.redrawTree(); };
      box.append(h('h2', 'Personalizar a barra lateral'), h('p.sub', 'Desmarque o que você não usa para a barra ficar mais curta. Nada é apagado: as ferramentas escondidas continuam na busca (lupa no topo da barra) e voltam quando você marcar de novo.'),
        h('div.side-cust', SIDE_ITEMS.map(([g, list]) => h('div.side-cust-g', h('b', g), ...list.map(([k, n]) => { const cb = h('input', { type: 'checkbox', checked: !hid.has(k) }); cb.onchange = () => { if (cb.checked) hid.delete(k); else hid.add(k); save(); }; return h('label.row', { style: { gap: '8px', fontSize: '13.5px' } }, cb, n); })))),
        h('div.modal-foot', h('button.btn', { onclick: () => { hid.clear(); save(); close(); T.toast('Todas as ferramentas voltaram para a barra.'); } }, 'Mostrar tudo'), h('span.grow'), h('button.btn.primary', { onclick: () => close() }, 'Pronto')));
    });
  };
  Shell.renderSideCounts = T.debounce(() => { if (Shell.redrawTree && !Shell.sideEl.contains(document.activeElement)) Shell.redrawTree(); }, 500);
  T.on('tree-changed', () => Shell.redrawTree && Shell.redrawTree());
  T.on('meta-changed', () => Shell.renderSideCounts && Shell.renderSideCounts());
  T.on('cal-changed', () => Shell.renderSideCounts && Shell.renderSideCounts());
  T.on('gdocs-status', () => Shell.renderSideCounts && Shell.renderSideCounts());

  /* ---------- busca na barra lateral: funções do site + tudo o que tem nome no livro ---------- */
  const nrm = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const FUNCS = [
    ['Ideias', 'idea', 'ideias pastas notas rapidas', () => Shell.open({ kind: 'ideas', ref: 'ideas' })],
    ['Conexões: teia, grafo e árvore de relações', 'web', 'conexoes teia grafo arvore relacoes familia obsidian', () => Shell.open({ kind: 'hub', ref: 'conexoes' })],
    ['Tempo: calendário e timeline', 'cal', 'tempo calendario timeline linha do tempo eventos datas', () => Shell.open({ kind: 'hub', ref: 'tempo' })],
    ['Personalizar a barra lateral', 'gear', 'personalizar esconder ferramentas barra lateral limpar', () => Shell.sideCustomize()],
    ['Metas e visão geral', 'target', 'metas objetivos prazo progresso graficos trackbear ritmo palavras por dia sequencia', () => Shell.open({ kind: 'overview', ref: 'overview' })],
    ['Estatísticas', 'chart', 'estatisticas palavras repetidas vicios contagem', () => Shell.open({ kind: 'stats', ref: 'stats' })],
    ['Localizar e substituir', 'search', 'localizar substituir buscar trocar texto', () => Shell.open({ kind: 'find', ref: 'find' })],
    ['Aquecimento: exercícios de escrita', 'flame', 'aquecimento exercicio prompt escrita livre cronometro desafio inspiracao', () => Shell.open({ kind: 'warmup', ref: 'warmup' })],
    ['Gerador de nomes', 'person', 'gerador nomes nome personagem lugar especie criatura cidade reino planeta nave sobrenome', () => Shell.open({ kind: 'names', ref: 'names' })],
    ['Tesauro da Escrita', 'feather', 'tesauro emocoes defeitos qualidades cenarios verbos sinonimos guia', () => Shell.open({ kind: 'tesauro', ref: 'tesauro' })],
    ['Rádio literária', 'radio', 'radio musica som ambiente chuva estacoes', () => Shell.open({ kind: 'radio', ref: 'radio' })],
    ['Compilar (PDF, ePub, .docx)', 'download', 'compilar exportar pdf epub docx word manuscrito imprimir', () => Shell.open({ kind: 'compile', ref: 'compile' })],
    ['Mockup 3D do livro', 'cube', 'mockup 3d capa livro impresso', () => Shell.open({ kind: 'mockup', ref: 'mockup' })],
    ['Curva de tensão', 'chart', 'curva tensao ritmo arco grafico', () => Shell.open({ kind: 'tension', ref: 'tension' })],
    ['Modo leitor', 'book', 'leitor ler livro inteiro leitura', () => Shell.open({ kind: 'reader', ref: 'reader' })],
    ['Wiki do mundo', 'book', 'wiki personagens lugares faccoes criaturas itens paginas worldbuilding', () => Shell.open({ kind: 'wiki', ref: 'wiki' })],
    ['Árvore de relações', 'tree', 'arvore relacoes familia genealogia personagens', () => Shell.open({ kind: 'tree', ref: 'tree' })],
    ['Teia da história', 'web', 'teia historia enredo plot conexoes mundo', () => Shell.open({ kind: 'web', ref: 'web' })],
    ['Grafo do livro (estilo Obsidian)', 'web', 'grafo obsidian mapa mental conexoes links wiki personagens eventos', () => Shell.open({ kind: 'web', ref: 'web', mode: 'all' })],
    ['Calendário', 'cal', 'calendario datas meses luas eras festivais', () => Shell.open({ kind: 'cal', ref: 'cal' })],
    ['Timeline', 'timeline', 'timeline linha do tempo eventos cronologia', () => Shell.open({ kind: 'timeline', ref: 'timeline' })],
    ['Mapas', 'map', 'mapas mapa terreno continente cidade reino jornada trilha', () => Shell.open({ kind: 'maps', ref: 'maps' })],
    ['Moodboards', 'moodboard', 'moodboard mural imagens inspiracao paleta cores', () => Shell.open({ kind: 'moods', ref: 'moods' })],
    ['Dicionário (línguas inventadas)', 'dict', 'dicionario lingua idioma palavras alfabeto gerador de nomes', () => Shell.open({ kind: 'lang', ref: 'langs' })],
    ['Quadro de fichas do manuscrito', 'cork', 'quadro fichas cortica cenas organizar manuscrito', () => Shell.open({ kind: 'cork', ref: 'ms' })],
    ['Backup no Google Docs', 'download', 'backup google docs drive copia seguranca documento', () => { if (T.GDocs && Shell.pid) T.GDocs.panel(Shell.pid); else T.toast('Abra um livro primeiro.'); }],
    ['Companheiro de escrita (joguinho)', 'spark', 'jogo joguinho companheiro bichinho moedas loja gamificar sprint', () => T.Buddy && T.Buddy.open()],
    ['Sprint de escrita', 'clock', 'sprint cronometro tempo escrever rapido', () => { const b = Shell.topEl.querySelector('button[title="Sprint de escrita"]'); if (b) b.click(); else T.toast('O sprint está rodando: veja na barra de cima.'); }],
    ['Editar layout dos painéis', 'layout2', 'layout paineis dividir janelas arrumar tela', () => Shell.layoutEdit(true)],
    ['Papéis de parede', 'wall', 'papel de parede fundo imagem visual', () => Shell.wallModal()],
    ['Modo foco', 'focus', 'foco esconder distracao tela', () => T.emit('focus-mode')],
    ['Ajustes e backup', 'gear', 'ajustes configuracoes backup tema escuro claro volume', () => Shell.settings()],
    ['Baixar backup do livro', 'download', 'backup baixar salvar copia seguranca', () => Shell.backupProject(Shell.pid)],
    ['Estante de livros (início)', 'home', 'inicio estante livros home', () => { Shell.flushEditors(); Shell.home(); }],
  ];
  const TYPE_L = { part: ['Parte', 'part'], chapter: ['Capítulo', 'chapter'], scene: ['Cena', 'scene'], doc: ['Documento', 'doc'], folder: ['Pasta', 'folder'], page: ['Wiki', 'book'], map: ['Mapa', 'map'], mood: ['Moodboard', 'moodboard'], lang: ['Língua', 'dict'], word: ['Palavra', 'dict'], event: ['Evento', 'timeline'], idea: ['Ideia', 'idea'], board: ['Árvore', 'tree'] };
  function openItem(it){
    const t = it.type;
    if (t === 'page') return Shell.open({ kind: 'page', ref: it.id });
    if (t === 'map') return Shell.open({ kind: 'map', ref: it.id });
    if (t === 'mood') return Shell.open({ kind: 'mood', ref: it.id });
    if (t === 'lang') return Shell.open({ kind: 'lang', ref: it.id });
    if (t === 'word') return Shell.open({ kind: 'lang', ref: it.parent || 'langs' });
    if (t === 'event') return T.Cal && T.Cal.editEvent(Shell.pid, it, null);
    if (t === 'idea') return Shell.open({ kind: 'ideas', ref: 'ideas' });
    if (t === 'board') return Shell.open({ kind: 'tree', ref: it.id });
    if (t === 'folder') return Shell.open({ kind: 'cork', ref: it.id });
    return Shell.open({ kind: 'doc', ref: it.id });
  }
  function searchResults(pid, q){
    const nq = nrm(q); const words = nq.split(/\s+/).filter(Boolean);
    const hitTxt = (t) => { const n = nrm(t); return words.every(w => n.includes(w)); };
    const wrap = h('div.sr');
    const hit = (ic, label, sub, fn) => { const b = h('button.tree-row.sr-hit', { type: 'button', onclick: fn }, h('span.tw'), icon(ic, 'ic'), h('span.lbl', label), sub ? h('span.sr-sub', sub) : null);
      b.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); let n = b.nextElementSibling; while (n && !n.classList.contains('sr-hit')) n = n.nextElementSibling; if (!n) { const all = [...wrap.querySelectorAll('.sr-hit')]; n = all[all.indexOf(b) + 1]; } if (n) n.focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); const all = [...wrap.querySelectorAll('.sr-hit')]; const p = all[all.indexOf(b) - 1]; (p || Shell.sideEl.querySelector('.side-search input')).focus(); } });
      return b; };
    const fn = FUNCS.filter(([l, , k]) => hitTxt(l + ' ' + k));
    const items = S().all(pid).filter(it => TYPE_L[it.type] && (it.type !== 'board' || it.meta?.kind === 'rel'));
    const KIDS = { 'Mapas': 'map', 'Moodboards': 'mood', 'Dicionário (línguas inventadas)': 'lang', 'Árvore de relações': 'board', 'Wiki do mundo': 'page' };
    if (fn.length) { wrap.append(h('div.sr-h', 'Funções')); fn.forEach(([l, ic, , go]) => {
      wrap.append(hit(ic, l, null, go));
      const kt = KIDS[l]; if (!kt || fn.length > 3) return;
      const ks = items.filter(it => it.type === kt).slice(0, 8);
      ks.forEach(it => { const b = hit(TYPE_L[kt][1], it.type === 'board' && T.Rel ? T.Rel.nameOf(it) : (it.title || 'Sem título'), null, () => openItem(it)); b.classList.add('sr-kid'); wrap.append(b); });
    }); }
    const named = items.filter(it => hitTxt(it.type === 'idea' ? T.htmlToText(it.body) : (it.title || (it.type === 'board' && T.Rel ? T.Rel.nameOf(it) : ''))));
    const order = ['chapter', 'scene', 'part', 'doc', 'folder', 'page', 'map', 'mood', 'event', 'board', 'lang', 'word', 'idea'];
    named.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || (a.title || '').localeCompare(b.title || '', 'pt'));
    if (named.length) wrap.append(h('div.sr-h', 'No livro'), ...named.slice(0, 60).map(it => { const [tl, ic] = TYPE_L[it.type]; const label = it.type === 'idea' ? T.htmlToText(it.body).slice(0, 60) : it.type === 'board' && T.Rel ? T.Rel.nameOf(it) : (it.title || 'Sem título'); return hit(ic, label, tl, () => openItem(it)); }));
    // trechos dentro dos textos
    const inText = items.filter(it => ['scene', 'chapter', 'doc', 'page'].includes(it.type) && !named.includes(it) && hitTxt(T.htmlToText(it.body))).slice(0, 12);
    if (inText.length) wrap.append(h('div.sr-h', 'Aparece dentro de'), ...inText.map(it => { const [tl, ic] = TYPE_L[it.type]; return hit(ic, it.title || 'Sem título', tl, () => Shell.open(it.type === 'page' ? { kind: 'page', ref: it.id } : { kind: 'doc', ref: it.id, find: q })); }));
    if (!wrap.childNodes.length) wrap.append(h('p.muted.sr-none', 'Nada encontrado para “' + q + '”.'));
    wrap.append(h('button.btn.sm.sr-find', { type: 'button', onclick: () => Shell.open({ kind: 'find', ref: 'find', q }) }, icon('search'), 'Procurar “' + q + '” em todos os textos'));
    return wrap;
  }
  function wikiTree(pid, pages, filter){
    const wrap = h('div.tree-kids');
    Object.entries(T.WIKI_TPL).forEach(([k, t]) => {
      const ps = pages.filter(p => (p.meta?.tpl || 'livre') === k && (!filter || (p.title || '').toLowerCase().includes(filter))).sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pt'));
      if (!ps.length) return;
      const key = 'cat:' + k; const open = filter ? true : (Shell.openState[key] ?? ps.length <= 6);
      const tw = h('span.tw' + (open ? '.open' : ''), icon('chev')); tw.firstChild.style.cssText = 'width:12px;height:12px';
      wrap.appendChild(h('div.tree-row', { role: 'button', tabindex: '0', onclick: () => { Shell.openState[key] = !open; persistOpen(); Shell.redrawTree(); } }, tw, icon(t.icon, 'ic'), h('span.lbl', t.plural), h('span.wc.num', String(ps.length))));
      if (open) wrap.appendChild(h('div.tree-kids', ps.map(p => {
        const r = h('div.tree-row', { 'data-id': p.id, role: 'button', tabindex: '0', onclick: () => Shell.open({ kind: 'page', ref: p.id }) },
          h('span.tw'), p.meta?.portrait ? h('img.side-por', { src: T.Assets.url(p.meta.portrait), alt: '' }) : icon(t.icon, 'ic'), h('span.lbl', p.title || 'Sem título'));
        r.oncontextmenu = (e) => { e.preventDefault(); T.menu(e.clientX, e.clientY, [
          { label: 'Abrir', icon: 'pen', fn: () => Shell.open({ kind: 'page', ref: p.id }) },
          { label: 'Abrir ao lado', icon: 'split', fn: () => Shell.open({ kind: 'page', ref: p.id }, { side: true }) },
          { label: 'Abrir em janela flutuante', icon: 'pop', fn: () => Shell.float({ id: T.id(), kind: 'page', ref: p.id }) },
          '-', { label: 'Apagar página', icon: 'trash', danger: true, fn: async () => { if (await T.confirm('Apagar “' + p.title + '”?', null, 'Apagar', true)) { closeTabsFor(p.id); S().remove(p.id); T.emit('tree-changed'); } } },
        ]); };
        return r;
      })));
    });
    return wrap;
  }
  function secHead(label, onTitle, menuItems){
    return h('div.side-sec', h('div.side-sec-h', h('span.grow', { onclick: onTitle, title: 'Abrir quadro de fichas' }, label),
      h('button.icon-btn', { title: 'Adicionar', 'aria-label': 'Adicionar em ' + label, onclick: (e) => T.menuAt(e.currentTarget, menuItems) }, icon('plus'))));
  }
  function toolRow(ic, label, fn, extra){
    const r = h('div.tree-row.tool-row', { role: 'button', tabindex: '0', onclick: fn }, h('span.tw'), icon(ic, 'ic'), h('span.lbl', label), extra || null);
    r.addEventListener('keydown', e => { if (e.key === 'Enter') fn(); });
    return r;
  }
  const TYPE_ICON = { part: 'part', chapter: 'chapter', scene: 'scene', folder: 'folder', doc: 'doc' };
  const CONTAINERS = { part: 1, chapter: 1, folder: 1 };
  let dragId = null;
  function tree(pid, parent, area, filter){
    const wrap = h('div' + (parent ? '.tree-kids' : ''));
    S().children(pid, parent, area).filter(i => TYPE_ICON[i.type]).forEach(it => {
      const kids = S().children(pid, it.id).filter(k => TYPE_ICON[k.type]);
      const match = !filter || (it.title || '').toLowerCase().includes(filter) || S().descendants(it.id).some(d => (d.title || '').toLowerCase().includes(filter));
      if (!match) return;
      const open = filter ? true : Shell.openState[it.id] ?? (it.type !== 'chapter');
      const words = it.type === 'scene' || it.type === 'doc' ? (it.meta?.words || 0) : T.MS.docs(it).reduce((a, d) => a + (d.meta?.words || 0), 0);
      const tw = h('span.tw' + (open ? '.open' : ''), kids.length ? icon('chev') : null);
      tw.firstChild && (tw.firstChild.style.cssText = 'width:12px;height:12px');
      const row = h('div.tree-row', { draggable: 'true', 'data-id': it.id, role: 'treeitem', tabindex: '0', 'aria-expanded': kids.length ? String(open) : null },
        tw, icon(TYPE_ICON[it.type], 'ic'),
        h('span.lbl', it.title || 'Sem título'),
        it.meta?.pov ? (() => { const s = h('span.pov', it.meta.pov.slice(0, 10)); s.style.setProperty('--ph', T.povHue(it.meta.pov)); return s; })() : null,
        it.type !== 'folder' && words ? h('span.wc.num', words >= 1000 ? (words / 1000).toFixed(1).replace('.', ',') + 'k' : String(words)) : null,
        it.type === 'scene' ? h('span.stat', { style: { background: T.STATUS_COLORS[it.meta?.status || 'rascunho'] }, title: it.meta?.status || 'rascunho' }) : null,
        // ações rápidas (aparecem ao passar o mouse): criar dentro e o menu com renomear, apagar…
        (() => { const ct = { part: 'chapter', chapter: 'scene', folder: 'doc' }[it.type]; const nm = { chapter: 'Novo capítulo dentro de', scene: 'Nova cena dentro de', doc: 'Novo documento dentro de' }[ct];
          return h('span.row-acts',
            ct ? h('button.ra', { type: 'button', title: nm + ' “' + (it.title || 'sem título') + '”', 'aria-label': nm + ' ' + (it.title || ''), onclick: (e) => { e.stopPropagation(); newItem(ct, it.id, it.area); Shell.openState[it.id] = true; persistOpen(); } }, icon('plus')) : null,
            h('button.ra', { type: 'button', title: 'Renomear, apagar, criar e mais (ou clique com o botão direito)', 'aria-label': 'Mais opções de ' + (it.title || ''), onclick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setTimeout(() => rowMenu(it, r.left, r.bottom + 4), 0); } }, h('b', '⋯'))); })());
      tw.onclick = (e) => { e.stopPropagation(); Shell.openState[it.id] = !open; persistOpen(); Shell.redrawTree(); };
      row.onclick = () => { if (it.type === 'folder') { Shell.openState[it.id] = !open; persistOpen(); Shell.open({ kind: 'cork', ref: it.id }); Shell.redrawTree(); } else Shell.open({ kind: 'doc', ref: it.id }); };
      row.ondblclick = (e) => { e.preventDefault(); rename(it, row); };
      row.oncontextmenu = (e) => { e.preventDefault(); rowMenu(it, e.clientX, e.clientY); };
      row.onkeydown = (e) => { if (e.key === 'Enter') row.onclick(); if (e.key === 'F2') rename(it, row); };
      row.ondragstart = (e) => { dragId = it.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', it.id); };
      row.ondragend = () => { dragId = null; document.querySelectorAll('.drop-before,.drop-after,.drop-inside').forEach(x => x.classList.remove('drop-before', 'drop-after', 'drop-inside')); };
      row.ondragover = (e) => {
        if (!dragId || dragId === it.id || S().descendants(dragId).some(d => d.id === it.id)) return;
        e.preventDefault();
        const r = row.getBoundingClientRect(); const y = (e.clientY - r.top) / r.height;
        row.classList.remove('drop-before', 'drop-after', 'drop-inside');
        row.classList.add(CONTAINERS[it.type] && y > .28 && y < .72 ? 'drop-inside' : y < .5 ? 'drop-before' : 'drop-after');
      };
      row.ondragleave = () => row.classList.remove('drop-before', 'drop-after', 'drop-inside');
      row.ondrop = (e) => {
        e.preventDefault(); if (!dragId) return;
        const zone = row.classList.contains('drop-inside') ? 'in' : row.classList.contains('drop-before') ? 'before' : 'after';
        moveItem(dragId, it, zone); dragId = null;
      };
      wrap.appendChild(row);
      if (kids.length && open) wrap.appendChild(tree(pid, it.id, null, filter));
    });
    return wrap;
  }
  function moveItem(id, target, zone){
    const it = S().get(id); if (!it) return;
    let parent, list;
    if (zone === 'in') { parent = target.id; list = S().children(target.pid, parent).filter(x => x.id !== id); list.push(it); Shell.openState[target.id] = true; }
    else { parent = target.parent || null; list = S().children(target.pid, parent, target.area).filter(x => x.id !== id); const at = list.findIndex(x => x.id === target.id); list.splice(zone === 'before' ? at : at + 1, 0, it); }
    S().update(id, { parent, area: target.area });
    list.forEach((x, i) => { if (x.order !== (i + 1) * 1000) S().update(x.id, { order: (i + 1) * 1000 }, { silent: true }); });
    T.emit('tree-changed');
  }
  const persistOpen = T.debounce(() => { if (Shell.pid) S().update(Shell.pid, { meta: { openState: Shell.openState } }, { delay: 2000, silent: true }); }, 600);
  function markActive(){
    const pane = Shell.layout?.panes[Shell.layout.focus]; const t = pane?.tabs.find(x => x.id === pane.active);
    Shell.sideEl?.querySelectorAll('.tree-row.active').forEach(r => r.classList.remove('active'));
    if (t && t.ref) { const r = Shell.sideEl?.querySelector('.tree-row[data-id="' + t.ref + '"]'); if (r) r.classList.add('active'); }
  }
  async function rename(it, row){
    const lbl = row.querySelector('.lbl');
    const inp = h('input.input', { value: it.title || '', style: { padding: '2px 6px', height: '24px' } });
    lbl.replaceWith(inp); inp.focus(); inp.select();
    const done = (ok) => { if (ok && inp.value.trim() !== it.title) { S().update(it.id, { title: inp.value.trim() || 'Sem título' }); } Shell.redrawTree(); refreshTabTitles(); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); e.stopPropagation(); };
    inp.onblur = () => done(true);
    inp.onclick = (e) => e.stopPropagation();
  }
  function newItem(type, parent, area){
    const names = { part: 'Nova parte', chapter: 'Capítulo ' + (T.MS.flat(Shell.pid).filter(i => i.type === 'chapter').length + 1), scene: 'Nova cena', folder: 'Nova pasta', doc: 'Novo documento' };
    const it = S().create({ pid: Shell.pid, type, area, parent, title: names[type], order: Date.now(), meta: type === 'scene' ? { status: 'rascunho' } : {} });
    if (parent) Shell.openState[parent] = true;
    if (type === 'chapter') S().create({ pid: Shell.pid, type: 'scene', area, parent: it.id, title: 'Cena 1', order: Date.now() + 1, meta: { status: 'rascunho' } });
    T.emit('tree-changed');
    if (type !== 'folder' && type !== 'part') Shell.open({ kind: 'doc', ref: type === 'chapter' ? S().children(Shell.pid, it.id)[0].id : it.id });
    setTimeout(() => { const row = Shell.sideEl.querySelector('.tree-row[data-id="' + it.id + '"]'); if (row) rename(S().get(it.id), row); }, 60);
    return it;
  }
  function rowMenu(it, x, y){
    const childType = { part: 'chapter', chapter: 'scene', folder: 'doc' }[it.type];
    const childName = { chapter: 'Novo capítulo aqui dentro', scene: 'Nova cena aqui dentro', doc: 'Novo documento aqui dentro' }[childType];
    T.menu(x, y, [
      it.type !== 'folder' ? { label: 'Abrir', icon: 'pen', fn: () => Shell.open({ kind: 'doc', ref: it.id }) } : null,
      it.type !== 'folder' ? { label: 'Abrir ao lado', icon: 'split', fn: () => Shell.open({ kind: 'doc', ref: it.id }, { side: true }) } : null,
      it.type !== 'folder' ? { label: 'Abrir em janela flutuante', icon: 'pop', fn: () => Shell.float({ id: T.id(), kind: 'doc', ref: it.id }) } : null,
      CONTAINERS[it.type] ? { label: 'Quadro de fichas', icon: 'cork', fn: () => Shell.open({ kind: 'cork', ref: it.id }) } : null,
      childType ? { label: childName, icon: TYPE_ICON[childType], fn: () => newItem(childType, it.id, it.area) } : null,
      it.type === 'chapter' ? { label: 'Novo capítulo (no mesmo nível)', icon: TYPE_ICON.chapter, fn: () => newItem('chapter', it.parent, it.area) } : null,
      it.type === 'part' ? { label: 'Nova parte', icon: TYPE_ICON.part, fn: () => newItem('part', it.parent, it.area) } : null,
      it.type === 'scene' ? { label: 'Nova cena (no mesmo capítulo)', icon: TYPE_ICON.scene, fn: () => newItem('scene', it.parent, it.area) } : null,
      it.type === 'folder' ? { label: 'Nova subpasta', icon: 'folder', fn: () => newItem('folder', it.id, it.area) } : null,
      '-',
      { label: 'Renomear', icon: 'edit', fn: () => { const row = Shell.sideEl.querySelector('.tree-row[data-id="' + it.id + '"]'); if (row) rename(it, row); } },
      it.type === 'scene' ? { label: 'Juntar com a próxima cena', icon: 'merge', fn: () => joinNext(it) } : null,
      { label: 'Apagar', icon: 'trash', danger: true, fn: async () => {
        const n = S().descendants(it.id).filter(d => d.type !== 'snapshot').length;
        if (await T.confirm('Apagar “' + (it.title || 'sem título') + '”?', n ? 'Junto vão ' + n + ' itens que estão dentro.' : 'Não dá para desfazer.', 'Apagar', true)) { closeTabsFor(it.id); S().remove(it.id); T.emit('tree-changed'); }
      } },
    ]);
  }
  async function joinNext(it){
    const sibs = S().children(it.pid, it.parent); const i = sibs.findIndex(s => s.id === it.id); const nx = sibs[i + 1];
    if (!nx || nx.type !== 'scene') { T.toast('Não há uma cena logo depois desta.'); return; }
    if (!await T.confirm('Juntar “' + it.title + '” com “' + nx.title + '”?', 'O texto da segunda cena vai para o fim da primeira.', 'Juntar')) return;
    Shell.flushEditors();
    const body = (S().get(it.id).body || '') + '<hr>' + (S().get(nx.id).body || '');
    S().update(it.id, { body, meta: { words: T.words(body) } });
    closeTabsFor(nx.id); S().remove(nx.id); T.emit('tree-changed'); Shell.open({ kind: 'doc', ref: it.id });
  }

  /* ---------- painéis e abas ---------- */
  /* arranjos de painéis: colunas × linhas e onde cada painel fica [colIni, colFim, linIni, linFim] */
  const ARR = {
    one:   { n: 1, name: 'Um painel', cols: 1, rows: 1, at: [[1, 2, 1, 2]] },
    cols2: { n: 2, name: 'Dois lado a lado', cols: 2, rows: 1, at: [[1, 2, 1, 2], [2, 3, 1, 2]] },
    rows2: { n: 2, name: 'Dois empilhados (um em cima do outro)', cols: 1, rows: 2, at: [[1, 2, 1, 2], [1, 2, 2, 3]] },
    L3:    { n: 3, name: 'Um grande à esquerda + dois empilhados', cols: 2, rows: 2, at: [[1, 2, 1, 3], [2, 3, 1, 2], [2, 3, 2, 3]] },
    R3:    { n: 3, name: 'Dois empilhados + um grande à direita', cols: 2, rows: 2, at: [[2, 3, 1, 3], [1, 2, 1, 2], [1, 2, 2, 3]] },
    T3:    { n: 3, name: 'Um largo em cima + dois embaixo', cols: 2, rows: 2, at: [[1, 3, 1, 2], [1, 2, 2, 3], [2, 3, 2, 3]] },
    B3:    { n: 3, name: 'Dois em cima + um largo embaixo', cols: 2, rows: 2, at: [[1, 2, 1, 2], [2, 3, 1, 2], [1, 3, 2, 3]] },
    cols3: { n: 3, name: 'Três colunas', cols: 3, rows: 1, at: [[1, 2, 1, 2], [2, 3, 1, 2], [3, 4, 1, 2]] },
    rows3: { n: 3, name: 'Três empilhados', cols: 1, rows: 3, at: [[1, 2, 1, 2], [1, 2, 2, 3], [1, 2, 3, 4]] },
    grid4: { n: 4, name: 'Quatro em grade', cols: 2, rows: 2, at: [[1, 2, 1, 2], [2, 3, 1, 2], [1, 2, 2, 3], [2, 3, 2, 3]] },
    cols4: { n: 4, name: 'Quatro colunas', cols: 4, rows: 1, at: [[1, 2, 1, 2], [2, 3, 1, 2], [3, 4, 1, 2], [4, 5, 1, 2]] },
  };
  Shell.ARR = ARR;
  const DEF_ARR = { 1: 'one', 2: 'cols2', 3: 'L3', 4: 'grid4' };
  const arrOf = () => { const l = Shell.layout; return (l && ARR[l.arr] && ARR[l.arr].n === l.n) ? l.arr : DEF_ARR[l?.n || 1]; };
  // arranjo livre (painéis divididos à mão): { cols, rows, at }
  const isCustom = () => { const l = Shell.layout; return !!(l && l.arr === 'custom' && l.custom && l.custom.at && l.custom.at.length === l.n); };
  const defOf = () => isCustom() ? Shell.layout.custom : ARR[arrOf()];
  const keyOf = () => { if (!isCustom()) return arrOf(); const c = Shell.layout.custom; return 'x' + c.cols + 'x' + c.rows + ':' + c.at.map(a => a.join(',')).join(';'); };
  // divide o painel i: 'right' (ao lado) ou 'below' (embaixo); o novo painel nasce vazio
  Shell.splitPane = function(i, dir){
    const lay = Shell.layout; if (lay.n >= 4) { T.toast('O máximo são 4 painéis. Use janelas flutuantes para abrir mais.'); return; }
    Shell.flushEditors();
    const a0 = defOf(); const f0 = frOf(keyOf(), a0);
    const d = { cols: a0.cols, rows: a0.rows, at: a0.at.map(x => x.slice()) };
    const f = { c: f0.c.slice(), r: f0.r.slice() };
    const [c0, c1, r0, r1] = d.at[i];
    let neu;
    if (dir === 'below') {
      if (r1 - r0 >= 2) { const mid = r0 + Math.floor((r1 - r0) / 2); d.at[i] = [c0, c1, r0, mid]; neu = [c0, c1, mid, r1]; }
      else { const ri = r0 - 1, fr = f.r[ri]; f.r.splice(ri, 1, fr / 2, fr / 2); d.rows++; d.at = d.at.map(([a, b, x, y]) => [a, b, x > r0 ? x + 1 : x, y > r0 ? y + 1 : y]); d.at[i] = [c0, c1, r0, r0 + 1]; neu = [c0, c1, r0 + 1, r0 + 2]; }
    } else {
      if (c1 - c0 >= 2) { const mid = c0 + Math.floor((c1 - c0) / 2); d.at[i] = [c0, mid, r0, r1]; neu = [mid, c1, r0, r1]; }
      else { const ci = c0 - 1, fr = f.c[ci]; f.c.splice(ci, 1, fr / 2, fr / 2); d.cols++; d.at = d.at.map(([a, b, x, y]) => [a > c0 ? a + 1 : a, b > c0 ? b + 1 : b, x, y]); d.at[i] = [c0, c0 + 1, r0, r1]; neu = [c0 + 1, c0 + 2, r0, r1]; }
    }
    d.at.splice(i + 1, 0, neu);
    lay.panes.splice(i + 1, 0, { tabs: [], active: null });
    lay.n++; lay.arr = 'custom'; lay.custom = d; lay.focus = i + 1;
    const z = Shell.sizes(); z.fr[keyOf()] = f; saveSizes();
    Shell.renderPanes(); Shell.renderTop(); persistLayout();
    if (document.body.classList.contains('layout-edit')) Shell.layoutEdit(true);
  };
  // mini desenho do arranjo para os menus
  Shell.arrIcon = (k) => { const a = ARR[k]; const W = 22, H = 16, g = 1.5;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + a.at.map(([c0, c1, r0, r1]) => { const x = (c0 - 1) / a.cols * W, w = (c1 - c0) / a.cols * W, y = (r0 - 1) / a.rows * H, hh = (r1 - r0) / a.rows * H; return '<rect x="' + (x + g / 2) + '" y="' + (y + g / 2) + '" width="' + (w - g) + '" height="' + (hh - g) + '" rx="2" fill="currentColor" opacity=".55"/>'; }).join('') + '</svg>'; };
  function setArr(k){
    const a = ARR[k]; if (!a) return;
    Shell.flushEditors();
    const lay = Shell.layout; const n = a.n;
    if (n < lay.n) { const extra = lay.panes.splice(n); extra.forEach(pn => lay.panes[n - 1].tabs.push(...pn.tabs)); }
    while (lay.panes.length < n) lay.panes.push({ tabs: [], active: null });
    lay.n = n; lay.arr = k; lay.custom = null; lay.focus = Math.min(lay.focus, n - 1);
    Shell.renderPanes(); Shell.renderTop(); persistLayout();
    if (document.body.classList.contains('layout-edit')) Shell.layoutEdit(true);
  }
  Shell.setArr = setArr;
  function setLayout(n){ setArr(Shell.layout && Shell.layout.n === n ? arrOf() : DEF_ARR[n]); }
  // menu com todos os arranjos
  Shell.arrMenu = (btn) => T.menuAt(btn, [{ head: 'Como arrumar os painéis' }, ...Object.entries(ARR).map(([k, a]) => ({ label: (arrOf() === k ? '● ' : '') + a.name, fn: () => setArr(k), svg: Shell.arrIcon(k) }))]);
  Shell.renderPanes = function(){
    T.closePopover();
    Shell.mounted.forEach(m => { try { m.inst.destroy(); } catch (e) {} }); Shell.mounted.clear();
    const main = Shell.mainEl; main.innerHTML = ''; main.dataset.layout = Shell.layout.n;
    Shell.layout.panes.forEach((pn, i) => main.appendChild(paneEl(pn, i)));
    markActive(); Shell.applyWalls(); Shell.applySizes(); Shell.placeHandles();
  };

  /* ---------- tamanhos: arrastar divisórias ---------- */
  // um único objeto vivo com os tamanhos do projeto aberto
  // tamanhos: largura da barra lateral + frações de colunas e linhas por arranjo
  Shell.sizes = () => { if (!Shell._z || Shell._zPid !== Shell.pid) { const m = S().get(Shell.pid)?.meta?.sizes || {}; Shell._z = { side: m.side || 280, fr: Object.assign({}, m.fr || {}) }; Shell._zPid = Shell.pid; } return Shell._z; };
  const frOf = (k, a) => { const z = Shell.sizes(); a = a || ARR[k]; let f = z.fr[k];
    if (!f || f.c?.length !== a.cols || f.r?.length !== a.rows) { f = z.fr[k] = { c: Array(a.cols).fill(1 / a.cols), r: Array(a.rows).fill(1 / a.rows) }; if (k === 'L3') f.c = [.58, .42]; if (k === 'R3') f.c = [.42, .58]; if (k === 'T3') f.r = [.58, .42]; if (k === 'B3') f.r = [.42, .58]; }
    return f; };
  Shell.applySizes = function(){
    if (!Shell.el || !Shell.mainEl || !Shell.layout) return;
    const z = Shell.sizes(); const k = keyOf(); const a = defOf(); const f = frOf(k, a);
    Shell.el.style.setProperty('--side-w', z.side + 'px');
    const m = Shell.mainEl;
    m.style.gridTemplateColumns = f.c.map(x => x + 'fr').join(' ');
    m.style.gridTemplateRows = f.r.map(x => x + 'fr').join(' ');
    m.querySelectorAll(':scope > .pane').forEach((pe, i) => { const at = a.at[i]; if (at) pe.style.gridArea = at[2] + ' / ' + at[0] + ' / ' + at[3] + ' / ' + at[1]; });
  };
  const saveSizes = T.debounce(() => { const z = Shell.sizes(); S().update(Shell.pid, { meta: { sizes: { side: z.side, fr: JSON.parse(JSON.stringify(z.fr)) } } }, { delay: 800, silent: true }); }, 300);
  Shell.resetSizes = () => { const z = Shell.sizes(); z.side = 280; delete z.fr[keyOf()]; if (isCustom()) { const c = Shell.layout.custom; z.fr[keyOf()] = { c: Array(c.cols).fill(1 / c.cols), r: Array(c.rows).fill(1 / c.rows) }; } saveSizes(); Shell.applySizes(); Shell.placeHandles(); };
  Shell.placeHandles = function(){
    if (!Shell.el || !Shell.mainEl || !Shell.layout || document.body.classList.contains('rz-dragging')) return;
    Shell.el.querySelectorAll('.rz').forEach(x => x.remove());
    const z = Shell.sizes(); const k = keyOf(); const a = defOf(); const f = frOf(k, a); const GAP = 10;
    const sh = () => Shell.el.getBoundingClientRect();
    const mr = () => Shell.mainEl.getBoundingClientRect();
    const handles = [];
    const placeAll = (except) => handles.forEach(([el, place]) => { if (el !== except) place(el); });
    const mk = (cls, place, onDrag, label) => {
      const el = h('div.rz.' + cls, { title: label, role: 'separator', 'aria-label': label });
      place(el);
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('drag'); document.body.classList.add('rz-dragging');
        const tag = h('div.size-tag'); Shell.el.appendChild(tag);
        const mv = (ev) => { const txt = onDrag(ev); Shell.applySizes(); place(el); placeAll(el); if (txt) { tag.textContent = txt; const r = sh(); tag.style.left = (ev.clientX - r.left + 12) + 'px'; tag.style.top = (ev.clientY - r.top + 12) + 'px'; } };
        const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.classList.remove('drag'); document.body.classList.remove('rz-dragging'); tag.remove(); saveSizes(); Shell.placeHandles(); };
        el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
      });
      el.addEventListener('dblclick', () => Shell.resetSizes());
      Shell.el.appendChild(el); handles.push([el, place]); return el;
    };
    // posição (px, relativa à área principal) do fim da coluna i / linha i
    const edge = (fr, i, total) => { const free = total - GAP * (fr.length - 1); let x = 0; for (let j = 0; j <= i; j++) x += fr[j] * free; return x + GAP * i + GAP / 2; };
    const span = (fr, i0, i1, total) => { const s0 = i0 === 0 ? 0 : edge(fr, i0 - 1, total) + GAP / 2; const s1 = i1 >= fr.length - 1 ? total : edge(fr, i1, total) - GAP / 2; return [s0, s1]; };
    // barra lateral
    if (!Shell.el.classList.contains('no-side') && !Shell.el.classList.contains('focus')) {
      const place = (el) => { const s = sh(), m = mr(); el.style.left = (m.left - s.left - 5) + 'px'; el.style.top = (m.top - s.top) + 'px'; el.style.height = m.height + 'px'; el.style.width = ''; };
      mk('rz-v', place, (ev) => { z.side = Math.round(T.clamp(ev.clientX - sh().left - 10, 190, Math.min(560, sh().width * .5))); return z.side + ' px'; }, 'Arraste para mudar a largura da barra lateral (duplo clique volta ao normal)');
    }
    // divisória entre a coluna i e i+1, só nas linhas em que há painéis dos dois lados
    const resize = (fr, i, pos, total) => { const free = total - GAP * (fr.length - 1); const pair = fr[i] + fr[i + 1]; let before = 0; for (let j = 0; j < i; j++) before += fr[j]; const x = (pos - GAP * i - GAP / 2) / free - before; const minf = Math.min(.12, pair / 3); fr[i] = T.clamp(x, minf, pair - minf); fr[i + 1] = pair - fr[i]; return fr.map(v => Math.round(v * 100) + '%').join(' | '); };
    for (let i = 0; i < a.cols - 1; i++) {
      const rows = new Set(); a.at.forEach(([c0, c1, r0, r1]) => { if (c1 === i + 2) for (let r = r0; r < r1; r++) rows.add(r - 1); });
      if (!rows.size) continue; const rs = [...rows].sort(); const r0 = rs[0], r1 = rs[rs.length - 1];
      const place = (el) => { const s = sh(), m = mr(); const [y0, y1] = span(f.r, r0, r1, m.height); el.style.left = (m.left - s.left + edge(f.c, i, m.width)) + 'px'; el.style.top = (m.top - s.top + y0) + 'px'; el.style.height = (y1 - y0) + 'px'; };
      mk('rz-v', place, (ev) => resize(f.c, i, ev.clientX - mr().left, mr().width), 'Arraste para mudar a largura dos painéis');
    }
    for (let i = 0; i < a.rows - 1; i++) {
      const cols = new Set(); a.at.forEach(([c0, c1, r0, r1]) => { if (r1 === i + 2) for (let c = c0; c < c1; c++) cols.add(c - 1); });
      if (!cols.size) continue; const cs = [...cols].sort(); const c0 = cs[0], c1 = cs[cs.length - 1];
      const place = (el) => { const s = sh(), m = mr(); const [x0, x1] = span(f.c, c0, c1, m.width); el.style.left = (m.left - s.left + x0) + 'px'; el.style.width = (x1 - x0) + 'px'; el.style.top = (m.top - s.top + edge(f.r, i, m.height)) + 'px'; };
      mk('rz-h', place, (ev) => resize(f.r, i, ev.clientY - mr().top, mr().height), 'Arraste para mudar a altura dos painéis');
    }
  };
  window.addEventListener('resize', T.debounce(() => Shell.placeHandles && Shell.placeHandles(), 120));

  /* ---------- modo de edição do layout ---------- */
  Shell.layoutEdit = function(on){
    on = on ?? !document.body.classList.contains('layout-edit');
    document.body.classList.toggle('layout-edit', on);
    document.querySelector('.layout-bar')?.remove();
    if (!on) return;
    const views = [['overview', 'Metas e visão geral', 'target'], ['ideas', 'Ideias', 'idea'], ['wiki', 'Wiki do mundo', 'book'], ['tree', 'Árvore de relações', 'tree'], ['web', 'Teia', 'web'], ['cal', 'Calendário', 'cal'], ['timeline', 'Timeline', 'timeline'], ['maps', 'Mapas', 'map'], ['moods', 'Moodboards', 'moodboard'], ['radio', 'Rádio', 'radio'], ['tension', 'Curva de tensão', 'chart'], ['reader', 'Modo leitor', 'book'], ['mockup', 'Mockup 3D', 'cube'], ['compile', 'Compilar', 'download'], ['lang', 'Dicionário', 'dict'], ['stats', 'Estatísticas', 'chart'], ['find', 'Localizar', 'search']];
    const refOf = (k) => k === 'lang' ? 'langs' : k;
    const grip = h('span.lb-grip', { title: 'Arraste para mover este painel para onde quiser', 'aria-label': 'Mover o painel de edição' }, '⠿');
    const bar = h('div.layout-bar.glass.glass-strong',
      grip,
      h('b', 'Editando o layout'), h('span.muted', 'Arraste as divisórias para mudar largura e altura. Duplo clique numa divisória volta ao normal.'),
      T.menuButton('layout2', 'Arranjo', 'Painéis lado a lado, empilhados ou misturados', (btn) => Shell.arrMenu(btn)),
      h('button.btn.sm', { title: 'Divide o painel selecionado em dois, lado a lado', onclick: () => Shell.splitPane(Shell.layout.focus, 'right') }, h('span.lb-ic', '⇆'), 'Painel ao lado'),
      h('button.btn.sm', { title: 'Divide o painel selecionado em dois, um em cima do outro (aí dá para esticar a altura)', onclick: () => Shell.splitPane(Shell.layout.focus, 'below') }, h('span.lb-ic', '⇅'), 'Painel embaixo'),
      T.menuButton('pop', 'Janela flutuante', 'Abrir qualquer função numa janela que você move e estica', (btn) => T.menuAt(btn, views.map(([k, l, ic]) => ({ label: l, icon: ic, fn: () => Shell.float({ id: T.id(), kind: k, ref: refOf(k) }) })))),
      h('button.btn.sm', { onclick: () => Shell.resetSizes() }, icon('history'), 'Tamanhos originais'),
      h('button.btn.sm.primary', { onclick: () => Shell.layoutEdit(false) }, icon('check'), 'Concluir'));
    bar.append(T.iconBtn('down', 'Encolher / abrir este painel', () => { bar.classList.toggle('mini'); S().setPrefs({ layoutBarMini: bar.classList.contains('mini') }); }, '.sm.lb-mini'));
    document.body.appendChild(bar);
    if (S().prefs().layoutBarMini) bar.classList.add('mini');
    // arrastar o painel de edição para qualquer lugar
    const placeBar = (x, y) => { const r = bar.getBoundingClientRect(); x = T.clamp(x, 6, innerWidth - r.width - 6); y = T.clamp(y, 6, innerHeight - r.height - 6); bar.style.left = x + 'px'; bar.style.top = y + 'px'; bar.style.transform = 'none'; return [x, y]; };
    const saved = S().prefs().layoutBarPos; if (saved) requestAnimationFrame(() => placeBar(saved[0] * innerWidth, saved[1] * innerHeight));
    const startDrag = (e) => {
      if (e.button !== 0 || e.target.closest('button, input, select, a')) return;
      e.preventDefault(); const r = bar.getBoundingClientRect(); const dx = e.clientX - r.left, dy = e.clientY - r.top;
      bar.classList.add('dragging'); bar.setPointerCapture(e.pointerId);
      const mv = (ev) => placeBar(ev.clientX - dx, ev.clientY - dy);
      const up = () => { bar.classList.remove('dragging'); bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); const q = bar.getBoundingClientRect(); S().setPrefs({ layoutBarPos: [q.left / innerWidth, q.top / innerHeight] }); };
      bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up);
    };
    bar.addEventListener('pointerdown', startDrag);
    grip.addEventListener('dblclick', () => { bar.style.left = ''; bar.style.top = ''; bar.style.transform = ''; S().setPrefs({ layoutBarPos: null }); });
    Shell.placeHandles();
  };
  function paneEl(pn, i){
    const el = h('section.pane.glass' + (i === Shell.layout.focus ? '.focused' : ''), { 'data-pane': i });
    const bar = h('div.tabbar.hscroll', { role: 'tablist' });
    const body = h('div.pane-body');
    el.append(h('div.pane-wall', { 'aria-hidden': 'true' }), bar, body,
      h('div.pane-split.glass.glass-strong', h('span.muted', 'Painel ' + (i + 1)),
        h('button.btn.sm', { type: 'button', title: 'Dividir este painel em dois, lado a lado', onclick: (e) => { e.stopPropagation(); Shell.splitPane(i, 'right'); } }, h('span.lb-ic', '⇆'), 'Dividir ao lado'),
        h('button.btn.sm', { type: 'button', title: 'Dividir este painel em dois, um em cima do outro', onclick: (e) => { e.stopPropagation(); Shell.splitPane(i, 'below'); } }, h('span.lb-ic', '⇅'), 'Dividir embaixo'),
        Shell.layout.n > 1 ? h('button.btn.sm', { type: 'button', title: 'Fechar este painel (as abas vão para o painel vizinho)', onclick: (e) => { e.stopPropagation(); closePane(i); } }, icon('x'), 'Fechar') : null));
    el.addEventListener('mousedown', () => { if (Shell.layout.focus !== i) { Shell.layout.focus = i; Shell.mainEl.querySelectorAll('.pane').forEach((p, k) => p.classList.toggle('focused', k === i)); markActive(); } }, true);
    pn.tabs.forEach(t => bar.appendChild(tabEl(t, pn, i)));
    bar.appendChild(h('div.tab-tools', T.iconBtn('wall', 'Papel de parede desta função', (e) => wallPop(e.currentTarget, i), '.sm'), T.iconBtn('plus', 'Abrir…', (e) => openMenu(e.currentTarget, i), '.sm'),
      Shell.layout.n > 1 ? T.iconBtn('x', 'Fechar este painel', () => { closePane(i); }, '.sm') : null));
    // receber abas arrastadas
    el.addEventListener('dragover', (e) => { if (Shell._dragTab) { e.preventDefault(); el.classList.add('pane-drop'); } });
    el.addEventListener('dragleave', (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('pane-drop'); });
    el.addEventListener('drop', (e) => { el.classList.remove('pane-drop'); const d = Shell._dragTab; if (!d) return; e.preventDefault(); moveTab(d.tab, d.from, i); Shell._dragTab = null; });
    mountActive(pn, body, i);
    return el;
  }
  function tabTitle(t){
    if (t.kind === 'doc') { const it = S().get(t.ref); return it ? (it.title || 'Sem título') : 'Apagado'; }
    const v = T.Views[t.kind]; return v ? v.title(t) : t.kind;
  }
  function tabIcon(t){ if (t.kind === 'doc') return TYPE_ICON[S().get(t.ref)?.type] || 'doc'; if (t.kind === 'page') return T.tplOf(S().get(t.ref)).icon; return T.Views[t.kind]?.icon || 'doc'; }
  function tabEl(t, pn, i){
    const el = h('div.tab' + (t.id === pn.active ? '.on' : ''), { role: 'tab', draggable: 'true', 'aria-selected': String(t.id === pn.active), 'data-tab': t.id, title: tabTitle(t) },
      icon(tabIcon(t), 'ti'), h('span.tl', tabTitle(t)),
      h('button.x', { title: 'Fechar aba', 'aria-label': 'Fechar aba', onclick: (e) => { e.stopPropagation(); closeTab(t, i); } }, icon('x')));
    el.onclick = () => { if (pn.active !== t.id) { Shell.flushEditors(); pn.active = t.id; Shell.layout.focus = i; rerenderPane(i); persistLayout(); } };
    el.onauxclick = (e) => { if (e.button === 1) closeTab(t, i); };
    el.oncontextmenu = (e) => { e.preventDefault(); T.menu(e.clientX, e.clientY, [
      { label: 'Abrir num painel ao lado', icon: 'split', fn: () => { const to = Shell.layout.n === 1 ? (setLayout(2), 1) : (i + 1) % Shell.layout.n; moveTab(t, i, to); } },
      { label: 'Janela flutuante', icon: 'pop', fn: () => { closeTab(t, i, true); Shell.float(t); } },
      ...Shell.layout.panes.map((_, k) => k !== i ? { label: 'Mover para o painel ' + (k + 1), icon: 'layout' + Shell.layout.n, fn: () => moveTab(t, i, k) } : null),
      '-', { label: 'Fechar', icon: 'x', fn: () => closeTab(t, i) },
    ]); };
    el.ondragstart = (e) => { Shell._dragTab = { tab: t, from: i }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.id); };
    el.ondragend = () => { Shell._dragTab = null; };
    return el;
  }
  function mountActive(pn, body, i){
    const key = 'p' + i;
    const old = Shell.mounted.get(key); if (old) { try { old.inst.destroy(); } catch (e) {} Shell.mounted.delete(key); }
    body.innerHTML = '';
    const t = pn.tabs.find(x => x.id === pn.active);
    if (!t) { body.appendChild(h('div.pane-empty', h('div', h('div.big', 'Painel vazio'), h('p', 'Arraste uma aba para cá ou escolha algo na barra lateral.')))); return; }
    const inst = mountTab(t, body);
    Shell.mounted.set(key, { inst, tab: t });
  }
  function mountTab(t, body){
    const ctx = { pid: Shell.pid };
    try {
      if (t.kind === 'doc') return T.Editor.mount(body, t, ctx);
      return T.Views[t.kind].mount(body, t, ctx);
    } catch (e) { console.error(e); body.appendChild(h('div.pane-empty', 'Algo deu errado ao abrir esta aba: ' + e.message)); return { destroy(){} }; }
  }
  function rerenderPane(i){
    T.closePopover();
    const el = Shell.mainEl.querySelector('.pane[data-pane="' + i + '"]'); if (!el) return Shell.renderPanes();
    const neu = paneEl(Shell.layout.panes[i], i);
    el.replaceWith(neu);
    Shell.mainEl.querySelectorAll('.pane').forEach((p, k) => p.classList.toggle('focused', k === Shell.layout.focus));
    markActive(); Shell.applyWalls();
  }
  function refreshTabTitles(){ document.querySelectorAll('.tab[data-tab]').forEach(el => { const t = findTab(el.dataset.tab); if (t) { el.querySelector('.tl').textContent = tabTitle(t); el.title = tabTitle(t); } }); }
  T.on('items', (ev) => { if (ev.patch && 'title' in ev.patch) refreshTabTitles(); });
  function findTab(id){ for (const pn of Shell.layout?.panes || []) { const t = pn.tabs.find(x => x.id === id); if (t) return t; } return null; }
  function closeTab(t, i, keepMounted){
    Shell.flushEditors();
    const pn = Shell.layout.panes[i]; const k = pn.tabs.indexOf(t); if (k < 0) return;
    pn.tabs.splice(k, 1);
    if (pn.active === t.id) pn.active = (pn.tabs[k] || pn.tabs[k - 1])?.id || null;
    rerenderPane(i); persistLayout();
  }
  function closeTabsFor(ref){
    Shell.layout.panes.forEach((pn, i) => { const ts = pn.tabs.filter(t => t.ref === ref || (t.kind === 'doc' && S().descendants(ref).some(d => d.id === t.ref))); ts.forEach(t => closeTab(t, i)); });
  }
  Shell.closeTabsFor = (ref) => closeTabsFor(ref);
  function closePane(i){
    Shell.flushEditors();
    const lay = Shell.layout; const [gone] = lay.panes.splice(i, 1); lay.panes[Math.max(0, i - 1)].tabs.push(...gone.tabs);
    lay.n--; lay.focus = Math.min(lay.focus, lay.n - 1); lay.arr = DEF_ARR[lay.n]; lay.custom = null;
    Shell.renderPanes(); Shell.renderTop(); persistLayout();
  }
  function moveTab(t, from, to){
    if (from === to) return;
    Shell.flushEditors();
    const a = Shell.layout.panes[from], b = Shell.layout.panes[to];
    a.tabs = a.tabs.filter(x => x !== t); if (a.active === t.id) a.active = a.tabs[0]?.id || null;
    b.tabs.push(t); b.active = t.id; Shell.layout.focus = to;
    Shell.renderPanes(); persistLayout();
  }
  function openMenu(btn, i){
    Shell.layout.focus = i;
    T.menuAt(btn, [
      { label: 'Metas e visão geral', icon: 'target', fn: () => Shell.open({ kind: 'overview', ref: 'overview' }) },
      { label: 'Quadro de fichas do livro', icon: 'cork', fn: () => Shell.open({ kind: 'cork', ref: 'ms' }) },
      { label: 'Ideias', icon: 'idea', fn: () => Shell.open({ kind: 'ideas', ref: 'ideas' }) },
      { label: 'Estatísticas', icon: 'chart', fn: () => Shell.open({ kind: 'stats', ref: 'stats' }) },
      { label: 'Localizar e substituir', icon: 'search', fn: () => Shell.open({ kind: 'find', ref: 'find' }) },
      '-',
      { label: 'Wiki do mundo', icon: 'book', fn: () => Shell.open({ kind: 'wiki', ref: 'wiki' }) },
      { label: 'Árvore de relações', icon: 'tree', fn: () => Shell.open({ kind: 'tree', ref: 'tree' }) },
      { label: 'Teia da história', icon: 'web', fn: () => Shell.open({ kind: 'web', ref: 'web' }) },
      { label: 'Dicionário', icon: 'dict', fn: () => Shell.open({ kind: 'lang', ref: 'langs' }) },
      { label: 'Calendário', icon: 'cal', fn: () => Shell.open({ kind: 'cal', ref: 'cal' }) },
      { label: 'Timeline', icon: 'timeline', fn: () => Shell.open({ kind: 'timeline', ref: 'timeline' }) },
      { label: 'Mapas', icon: 'map', fn: () => Shell.open({ kind: 'maps', ref: 'maps' }) },
      { label: 'Moodboards', icon: 'moodboard', fn: () => Shell.open({ kind: 'moods', ref: 'moods' }) },
      '-',
      { label: 'Rádio literária', icon: 'radio', fn: () => Shell.open({ kind: 'radio', ref: 'radio' }) },
      { label: 'Curva de tensão', icon: 'chart', fn: () => Shell.open({ kind: 'tension', ref: 'tension' }) },
      { label: 'Modo leitor', icon: 'book', fn: () => Shell.open({ kind: 'reader', ref: 'reader' }) },
      { label: 'Mockup 3D do livro', icon: 'cube', fn: () => Shell.open({ kind: 'mockup', ref: 'mockup' }) },
      { label: 'Compilar o livro', icon: 'download', fn: () => Shell.open({ kind: 'compile', ref: 'compile' }) },
    ]);
  }

  // Abrir algo numa aba: {kind, ref, find?, q?}
  Shell.open = function(spec, opts = {}){
    if (!Shell.layout) return;
    if (opts.replace && opts.replace._hubSwap) { opts.replace._hubSwap(spec); return; }
    if (!opts.raw && T.Hubs) { const r = T.Hubs.route(spec); if (r) spec = r; }
    Shell.flushEditors();
    const lay = Shell.layout;
    if (opts.replace) {
      for (let i = 0; i < lay.panes.length; i++) { const pn = lay.panes[i]; const k = pn.tabs.indexOf(opts.replace); if (k >= 0) { const nt = Object.assign({ id: T.id() }, spec); pn.tabs[k] = nt; pn.active = nt.id; rerenderPane(i); persistLayout(); return; } }
    }
    // já está aberta?
    if (!opts.side) for (let i = 0; i < lay.panes.length; i++) {
      const t = lay.panes[i].tabs.find(x => x.kind === spec.kind && x.ref === spec.ref);
      if (t) { Object.assign(t, { sub: spec.sub || t.sub, subSpec: spec.subSpec, mode: spec.mode || t.mode, find: spec.find, q: spec.q || t.q, word: spec.word || t.word, focus: spec.focus || t.focus, focusPin: spec.focusPin }); lay.panes[i].active = t.id; lay.focus = i; rerenderPane(i); if (spec.find) setTimeout(() => T.emit('find-focus', { tab: t, text: spec.find }), 80); persistLayout(); return; }
    }
    let target = lay.focus;
    if (opts.side) { if (lay.n === 1) { setLayout(2); } target = (lay.focus + 1) % lay.n; }
    const t = Object.assign({ id: T.id() }, spec);
    lay.panes[target].tabs.push(t); lay.panes[target].active = t.id; lay.focus = target;
    rerenderPane(target); persistLayout();
    if (innerWidth < 860) Shell.el.classList.add('side-closed');
  };

  /* ---------- papéis de parede por função ---------- */
  const WALL_KEYS = { default: 'Fundo geral do livro', doc: 'Escrita', cork: 'Quadro de fichas', overview: 'Metas', stats: 'Estatísticas', find: 'Localizar', ideas: 'Ideias', wiki: 'Wiki', tree: 'Árvore de relações', web: 'Teia', lang: 'Dicionário', cal: 'Calendário', timeline: 'Timeline', tesauro: 'Tesauro' };
  const wallKey = (kind) => kind === 'page' ? 'wiki' : (WALL_KEYS[kind] && kind !== 'default' ? kind : 'default');
  Shell.walls = () => Object.assign({ blur: 14, strength: 70 }, S().get(Shell.pid)?.meta?.walls || {});
  Shell.applyWalls = function(){
    const g = document.getElementById('wall'); if (!g) return;
    const w = Shell.pid ? Shell.walls() : {};
    if (Shell.pid && w.default) { g.style.backgroundImage = 'url("' + T.Assets.url(w.default) + '")'; g.style.setProperty('--wb', w.blur + 'px'); g.style.opacity = String(w.strength / 100); g.classList.add('on'); }
    else { g.classList.remove('on'); g.style.backgroundImage = ''; }
    Shell.mainEl?.querySelectorAll('.pane').forEach(pe => {
      const pn = Shell.layout?.panes[+pe.dataset.pane]; const t = pn?.tabs.find(x => x.id === pn.active);
      const key = t ? wallKey(t.kind) : 'default'; const ref = key !== 'default' ? w[key] : null; const el = pe.querySelector('.pane-wall'); if (!el) return;
      if (ref) { el.style.backgroundImage = 'url("' + T.Assets.url(ref) + '")'; el.style.setProperty('--wb', w.blur + 'px'); el.style.opacity = String(w.strength / 100); pe.classList.add('has-wall'); }
      else { el.style.backgroundImage = ''; pe.classList.remove('has-wall'); }
    });
  };
  function wallPop(btn, i){
    const pn = Shell.layout.panes[i]; const t = pn.tabs.find(x => x.id === pn.active); const key = t ? wallKey(t.kind) : 'default';
    const setW = (patch) => { S().update(Shell.pid, { meta: { walls: Object.assign({}, Shell.walls(), patch) } }); Shell.applyWalls(); };
    const lib = () => S().get(Shell.pid)?.meta?.wallLib || [];
    const choose = async (k) => { const f = await T.pickFile('image/*'); if (!f) return; T.toast('Enviando ' + f.name + '…'); const ref = await T.Assets.upload(f); if (!ref) return; S().update(Shell.pid, { meta: { wallLib: [...lib(), { ref, name: f.name }].slice(-24) } }); setW({ [k]: ref }); pop.remove(); wallPop(btn, i); };
    const w = Shell.walls();
    const row = (k, label) => h('div.tp-row', h('span.tp-l', label), h('div.row', { style: { gap: '6px' } }, h('button.btn.sm', { onclick: () => choose(k) }, icon('image'), w[k] ? 'Trocar' : 'Escolher imagem'), w[k] ? h('button.btn.sm', { onclick: () => { setW({ [k]: null }); pop.remove(); wallPop(btn, i); } }, 'Remover') : null));
    const blur = h('input.range', { type: 'range', min: 0, max: 40, value: w.blur, 'aria-label': 'Desfoque' }); blur.oninput = () => setW({ blur: +blur.value });
    const str = h('input.range', { type: 'range', min: 15, max: 100, value: w.strength, 'aria-label': 'Intensidade' }); str.oninput = () => setW({ strength: +str.value });
    const pop = T.popover(btn, h('div.type-panel', { style: { width: '340px' } }, h('b', { style: { fontSize: '13px' } }, 'Papel de parede'),
      h('p.muted', { style: { margin: 0, fontSize: '12px' } }, 'Cada função do livro pode ter a sua imagem de fundo. O fundo geral aparece atrás de tudo.'),
      key !== 'default' ? row(key, WALL_KEYS[key]) : null,
      row('default', 'Fundo geral'),
      lib().length ? h('div.field', h('span.tp-l', 'Imagens que você já subiu' + (key !== 'default' ? ' (clique para usar em ' + WALL_KEYS[key] + ')' : '')), h('div.wall-lib', lib().slice().reverse().map(x => h('button', { type: 'button', title: x.name, onclick: () => { setW({ [key]: x.ref }); pop.remove(); wallPop(btn, i); } }, h('img', { src: T.Assets.url(x.ref), alt: x.name }))))) : null,
      h('div.tp-row', h('span.tp-l', 'Desfoque'), blur), h('div.tp-row', h('span.tp-l', 'Intensidade'), str),
      h('button.btn.sm', { onclick: () => { pop.remove(); Shell.wallModal(); } }, icon('grid'), 'Ver todos os fundos do livro')));
  }
  // Gerenciador com todas as funções de uma vez
  Shell.wallModal = function(){
    if (!Shell.pid) return;
    const setW = (patch) => { S().update(Shell.pid, { meta: { walls: Object.assign({}, Shell.walls(), patch) } }); Shell.applyWalls(); };
    const lib = () => S().get(Shell.pid)?.meta?.wallLib || [];
    T.modal((box, close) => {
      function draw(){
        box.innerHTML = '';
        const w = Shell.walls();
        const rows = h('div.wall-rows', Object.entries(WALL_KEYS).map(([k, label]) => h('div.wall-row',
          w[k] ? h('img.wall-thumb', { src: T.Assets.url(w[k]), alt: '' }) : h('div.wall-thumb', 'sem fundo'),
          h('div', h('b', label), h('br'), h('span', k === 'default' ? 'Aparece atrás de tudo, em todas as funções' : 'Aparece atrás do painel quando ' + label.toLowerCase() + ' está aberta')),
          h('div.row', { style: { gap: '6px' } },
            h('button.btn.sm', { onclick: async () => { const f = await T.pickFile('image/*'); if (!f) return; T.toast('Enviando ' + f.name + '…'); const ref = await T.Assets.upload(f); if (!ref) return; S().update(Shell.pid, { meta: { wallLib: [...lib(), { ref, name: f.name }].slice(-24) } }); setW({ [k]: ref }); draw(); } }, icon('upload'), w[k] ? 'Trocar' : 'Subir imagem'),
            lib().length ? h('button.btn.sm', { title: 'Usar uma imagem que você já subiu', onclick: (e) => T.menuAt(e.currentTarget, lib().slice().reverse().map(x => ({ label: x.name, icon: 'image', fn: () => { setW({ [k]: x.ref }); draw(); } }))) }, 'Já subidas') : null,
            w[k] ? h('button.btn.sm', { onclick: () => { setW({ [k]: null }); draw(); } }, 'Remover') : null))));
        const blur = h('input.range', { type: 'range', min: 0, max: 40, value: w.blur, id: 'wm-blur' }); blur.oninput = () => setW({ blur: +blur.value });
        const str = h('input.range', { type: 'range', min: 15, max: 100, value: w.strength, id: 'wm-str' }); str.oninput = () => setW({ strength: +str.value });
        box.append(h('h2', 'Papéis de parede'), h('p.sub', 'Escolha uma imagem para cada função deste livro. Também dá para trocar pelo ícone de imagem no canto de cada painel.'), rows,
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' } }, h('label.field', { for: 'wm-blur' }, 'Desfoque', blur), h('label.field', { for: 'wm-str' }, 'Intensidade', str)),
          h('div.modal-foot', h('button.btn.primary', { onclick: () => close() }, 'Pronto')));
      }
      draw();
    }, { wide: true });
  };

  /* ---------- janelas flutuantes ---------- */
  // abre o tesauro numa janela flutuante (ou fecha, se já estiver aberto); usa a palavra selecionada como busca
  Shell.openTesauro = function(){
    const open = Shell.floats.find(f => f.tab.kind === 'tesauro');
    if (open) { open.close(); return; }
    const sel = getSelection().toString().trim();
    Shell.float({ id: T.id(), kind: 'tesauro', ref: 'tesauro', q: sel && sel.length < 40 ? sel : '' }, { w: Math.min(560, innerWidth - 40), h: Math.min(innerHeight - 120, 760) });
  };
  Shell.float = function(t, opts = {}){
    const body = h('div.fw-body');
    const win = h('div.float-win.glass.glass-strong', h('div.fw-head', icon(tabIcon(t), 'ti'), h('span.grow', tabTitle(t)),
      T.iconBtn('layout1', 'Voltar para um painel', () => { close(); Shell.open({ kind: t.kind, ref: t.ref }); }, '.sm'),
      T.iconBtn('x', 'Fechar janela', () => close(), '.sm')), body);
    const n = Shell.floats.length;
    if (opts.w) { win.style.width = opts.w + 'px'; win.style.height = opts.h + 'px'; }
    win.style.left = Math.max(10, innerWidth - (opts.w || 420) - 40 - n * 24) + 'px'; win.style.top = (80 + n * 24) + 'px';
    document.getElementById('layer-float').appendChild(win);
    const inst = mountTab(t, body);
    const rec = { el: win, inst, tab: t };
    Shell.floats.push(rec);
    const head = win.querySelector('.fw-head');
    head.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = win.getBoundingClientRect(); const ox = e.clientX - r.left, oy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId);
      const mv = (ev) => { win.style.left = T.clamp(ev.clientX - ox, 0, innerWidth - 120) + 'px'; win.style.top = T.clamp(ev.clientY - oy, 0, innerHeight - 40) + 'px'; };
      const up = () => { head.removeEventListener('pointermove', mv); head.removeEventListener('pointerup', up); };
      head.addEventListener('pointermove', mv); head.addEventListener('pointerup', up);
    });
    function close(){ try { inst.destroy(); } catch (e) {} win.remove(); Shell.floats = Shell.floats.filter(f => f !== rec); }
    rec.close = close;
  };

  /* ---------- espaços de trabalho ---------- */
  function workspaceMenu(btn){
    const p = S().get(Shell.pid); const ws = p.meta?.workspaces || [];
    T.menuAt(btn, [
      { head: 'Espaços de trabalho' },
      ...ws.map(w => ({ label: w.name, icon: 'grid', fn: () => { Shell.flushEditors(); Shell.layout = normalizeLayout(w.layout); w.at = Date.now(); S().update(Shell.pid, { meta: { workspaces: ws } }); Shell.renderPanes(); Shell.renderTop(); persistLayout(); } })),
      ws.length ? '-' : null,
      { label: 'Salvar o arranjo atual…', icon: 'plus', fn: async () => {
        const name = await T.ask('Nome do espaço de trabalho', { placeholder: 'ex.: Escrevendo, Planejando', ok: 'Salvar' }); if (!name) return;
        const lay = { n: Shell.layout.n, arr: isCustom() ? 'custom' : arrOf(), custom: isCustom() ? Shell.layout.custom : undefined, focus: Shell.layout.focus, panes: Shell.layout.panes.map(pn => ({ active: pn.active, tabs: pn.tabs.map(t => ({ id: t.id, kind: t.kind, ref: t.ref, mode: t.mode })) })) };
        S().update(Shell.pid, { meta: { workspaces: [...ws.filter(w => w.name !== name), { id: T.id(), name, layout: lay, at: Date.now() }] } });
        T.toast('Espaço “' + name + '” salvo. Ele aparece também na estante.');
      } },
      ws.length ? { label: 'Apagar um espaço…', icon: 'trash', fn: () => T.menuAt(btn, ws.map(w => ({ label: 'Apagar “' + w.name + '”', icon: 'trash', danger: true, fn: () => S().update(Shell.pid, { meta: { workspaces: ws.filter(x => x !== w) } }) }))) } : null,
    ]);
  }

  /* ---------- tela cheia (esconde a barra do Claude e a do navegador) ---------- */
  T.Full = {
    on: () => !!document.fullscreenElement,
    async toggle(){
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else { const de = document.documentElement; if (!de.requestFullscreen) throw new Error('sem suporte'); await de.requestFullscreen({ navigationUI: 'hide' }); }
      } catch (e) { T.toast('O navegador não deixou abrir em tela cheia aqui. No computador, a tecla F11 também deixa tudo em tela cheia.'); }
    },
    SOLO_URL: 'https://iasminmktargumento-source.github.io/Entrelinhas/',
    // dentro do Claude: escolher entre tela cheia total ou abrir a versão independente numa aba comum
    choose(anchor){
      if (T.Full.on() || T.STANDALONE) { T.Full.toggle(); return; }
      const box = h('div.stack.full-pop', { style: { width: '320px' } },
        h('b', 'Como você quer ver o Entrelinhas?'),
        h('button.btn.full-opt', { onclick: () => { T.closePopover && T.closePopover(); T.Full.toggle(); } }, icon('focus'), h('span', h('b', 'Tela cheia'), h('small', 'Esconde a barra do Claude e também a do navegador e do computador. Esc para sair.'))),
        h('a.btn.full-opt', { href: T.Full.SOLO_URL, target: '_blank', rel: 'noopener' }, icon('pop'), h('span', h('b', 'Numa aba comum, sem o Claude'), h('small', 'Abre a versão independente: abas e barra do computador continuam à mão. Os livros de lá ficam no navegador (traga com backup › Importar), e sinônimos, nomes e backup no Google Docs só funcionam aqui.'))),
        h('p.muted', { style: { fontSize: '11.5px', margin: 0 } }, 'Dentro do claude.ai, o navegador não deixa um site esconder a barra do Claude sem entrar em tela cheia.'));
      T.popover(anchor, box);
    },
    btn(cls = ''){ const on = T.Full.on(); const b = T.iconBtn('focus', on ? 'Sair da tela cheia (Esc)' : 'Expandir: tela cheia ou abrir numa aba comum, sem o Claude', () => T.Full.choose(b), '.full-btn' + (on ? '.on' : '') + cls); return b; },
  };
  document.addEventListener('fullscreenchange', () => { T.closePopover && T.closePopover();
    document.body.classList.toggle('is-full', T.Full.on());
    document.querySelectorAll('.full-btn').forEach(b => { b.classList.toggle('on', T.Full.on()); b.title = T.Full.on() ? 'Sair da tela cheia (Esc)' : 'Expandir: tela cheia ou abrir numa aba comum, sem o Claude'; });
  });
  // opção: entrar em tela cheia sozinho no primeiro toque (o navegador só deixa depois de um clique)
  const armAutoFull = () => { if (!S().prefs().autoFull) return; const go = (e) => { if (S().prefs().autoFull && !T.Full.on() && !e.target.closest('.full-btn')) T.Full.toggle(); }; document.addEventListener('pointerdown', go, { capture: true, once: true }); };
  setTimeout(armAutoFull, 500);

  /* ---------- sprints (até 2 horas, com pausa e estatísticas) ---------- */
  const SPKEY = 'tinteiro-sprint';
  const spSave = () => { const s = Shell.sprint; try { if (!s) localStorage.removeItem(SPKEY); else { const { timer, ...rest } = s; localStorage.setItem(SPKEY, JSON.stringify(rest)); } } catch (e) {} };
  const spElapsed = (s) => s.acc + (s.runAt ? Date.now() - s.runAt : 0);
  const spWords = (s) => Math.max(0, T.Session.today(s.pid) - s.startWords);
  const fmtLeft = (ms) => { const t = Math.max(0, Math.round(ms / 1000)); const hh = Math.floor(t / 3600), mm = Math.floor(t / 60) % 60, ss = t % 60; return (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm).padStart(2, '0')) + ':' + String(ss).padStart(2, '0'); };
  const fmtMin = (m) => m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + Math.round(m % 60) + ' min' : '') : Math.round(m) + ' min';
  function sprintMenu(btn){
    const custom = async () => { const v = await T.ask('Quantos minutos? (de 1 a 120)', { value: '40' }); const n = Math.round(+String(v || '').replace(',', '.')); if (!n) return; startSprint(T.clamp(n, 1, 120)); };
    const bd = T.Buddy && T.Buddy.prefs();
    T.menuAt(btn, [{ head: 'Sprint de escrita' }, ...[10, 15, 25, 30, 45, 60, 90, 120].map(m => ({ label: fmtMin(m), icon: 'clock', fn: () => startSprint(m) })), '-', { label: 'Outro tempo…', icon: 'edit', fn: custom },
      bd ? '-' : null,
      bd ? { head: 'Joguinho: ' + bd.name } : null,
      bd ? { label: T.Buddy.isOpen() ? 'Guardar o ' + bd.name + ' (fechar o joguinho)' : 'Jogar com o ' + bd.name + ' agora', icon: 'spark', fn: () => { if (T.Buddy.isOpen()) T.Buddy.toggle(); else { T.Buddy.open(); T.toast(bd.name + ' está no canto da tela. Escreva no manuscrito para ele escrever junto e ganhar moedas. Dá para arrastar a janelinha.'); } } } : null,
      bd ? { label: (bd.sprint !== false ? '✓ ' : '') + 'Aparecer sozinho quando eu começar um sprint', icon: 'clock', fn: () => { T.Buddy.set({ sprint: bd.sprint === false }); T.toast(bd.sprint === false ? bd.name + ' vai aparecer nos seus sprints.' : bd.name + ' não aparece mais sozinho nos sprints.'); } } : null,
      bd ? { label: 'Loja do companheiro (' + T.fmt(bd.coins) + ' moedas)', icon: 'gem', fn: () => T.Buddy.shop() } : null,
      (S().get(Shell.pid)?.meta?.sprints || []).length ? { label: 'Ver sprints anteriores', icon: 'chart', fn: () => Shell.open({ kind: 'overview', ref: 'overview' }) } : null]);
  }
  function startSprint(min){
    T.Sound.unlock();
    const pid = Shell.pid;
    if (Shell.sprint) clearInterval(Shell.sprint.timer);
    Shell.sprint = { min, pid, startWords: T.Session.today(pid), acc: 0, runAt: Date.now(), pauses: [], samples: [{ e: 0, w: 0 }], startedAt: Date.now() };
    Shell.sprint.timer = setInterval(tickSprint, 1000); spSave();
    Shell.renderTop(); T.toast('Sprint de ' + fmtMin(min) + ' começou. Só escreva!');
    try { T.Buddy?.onSprintStart(); } catch (e) {}
  }
  function pauseSprint(){
    const s = Shell.sprint; if (!s) return;
    if (s.runAt) { s.acc += Date.now() - s.runAt; s.runAt = null; s.pauses.push({ at: Date.now(), e: s.acc }); T.toast('Sprint pausado. O tempo parou; o que você escreveu continua contando.'); }
    else { const p = s.pauses[s.pauses.length - 1]; if (p && !p.end) p.end = Date.now(); s.runAt = Date.now(); T.toast('Sprint retomado.'); }
    spSave(); Shell.renderTop();
  }
  function sprintPill(){
    const s = Shell.sprint; const left = s.min * 60000 - spElapsed(s);
    return h('span.sprint-pill' + (s.runAt ? '' : '.paused'),
      T.iconBtn(s.runAt ? 'pause' : 'play', s.runAt ? 'Pausar sprint' : 'Continuar sprint', pauseSprint, '.sm'),
      h('button.sp-time', { title: 'Ver como está indo', onclick: (e) => sprintLive(e.currentTarget) }, h('span.num#sprint-time', fmtLeft(left)), h('span.sp-w#sprint-words', '+' + T.fmt(spWords(s)))),
      T.iconBtn('stop', 'Encerrar sprint', () => endSprint(true), '.sm'));
  }
  function sprintStats(s){
    const words = spWords(s), act = Math.max(1, spElapsed(s)) / 60000;
    const pausedMs = s.pauses.reduce((a, p) => a + ((p.end || Date.now()) - p.at), 0);
    const block = s.min <= 30 ? 5 : s.min <= 90 ? 10 : 15;
    const samples = [...s.samples, { e: spElapsed(s), w: words }];
    const blocks = [];
    for (let b0 = 0; b0 < act; b0 += block) {
      const at = (m) => { m *= 60000; let prev = samples[0]; for (const x of samples) { if (x.e >= m) { const f = x.e > prev.e ? (m - prev.e) / (x.e - prev.e) : 1; return prev.w + (x.w - prev.w) * f; } prev = x; } return prev.w; };
      blocks.push({ from: b0, to: Math.min(act, b0 + block), w: Math.max(0, Math.round(at(Math.min(act, b0 + block)) - at(b0))) });
    }
    return { words, act, perMin: words / act, perHour: words / act * 60, pausedMin: pausedMs / 60000, pauses: s.pauses.length, blocks, block };
  }
  function statsView(st, opts = {}){
    const max = Math.max(1, ...st.blocks.map(b => b.w));
    const best = st.blocks.reduce((a, b) => b.w > (a?.w ?? -1) ? b : a, null);
    const cell = (n, l) => h('div.sp-stat', h('b.num', n), h('span', l));
    return h('div.sp-view',
      h('div.sp-stats', cell(T.fmt(st.words), 'palavras'), cell(st.perMin < 10 ? st.perMin.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : T.fmt(Math.round(st.perMin)), 'por minuto'), cell(T.fmt(Math.round(st.perHour)), 'por hora (no ritmo)'), cell(fmtMin(st.act), 'escrevendo'),
        cell(st.pauses ? String(st.pauses) : '0', st.pauses === 1 ? 'pausa (' + fmtMin(st.pausedMin) + ')' : 'pausas' + (st.pauses ? ' (' + fmtMin(st.pausedMin) + ')' : ''))),
      st.blocks.length > 1 ? h('div.sp-chart', h('div.sp-chart-h', 'Palavras a cada ' + st.block + ' minutos'), h('div.sp-bars', st.blocks.map(b => h('div.sp-bar' + (b === best && b.w ? '.best' : ''), { title: Math.round(b.from) + '–' + Math.round(b.to) + ' min: ' + b.w + ' palavras' }, h('i', { style: { height: Math.max(3, b.w / max * 100) + '%' } }), h('span.num', String(b.w)), h('em', Math.round(b.from) + '′'))))) : null,
      best && best.w && st.blocks.length > 1 ? h('p.sp-note', 'Seu melhor trecho foi dos ' + Math.round(best.from) + ' aos ' + Math.round(best.to) + ' minutos, com ' + T.fmt(best.w) + ' palavras.') : null);
  }
  function sprintLive(btn){
    const s = Shell.sprint; if (!s) return;
    const box = h('div.sp-live');
    const draw = () => { if (!Shell.sprint) { T.closePopover(); return; } box.innerHTML = ''; const left = s.min * 60000 - spElapsed(s);
      box.append(h('div.sp-live-h', h('b', 'Sprint de ' + fmtMin(s.min)), h('span.chip' + (s.runAt ? '' : '.gray'), s.runAt ? 'faltam ' + fmtLeft(left) : 'pausado · faltam ' + fmtLeft(left))), statsView(sprintStats(s)),
        h('div.modal-foot', h('button.btn.sm', { onclick: () => { pauseSprint(); draw(); } }, T.icon(s.runAt ? 'pause' : 'play'), s.runAt ? 'Pausar' : 'Continuar'), h('button.btn.sm.primary', { onclick: () => { T.closePopover(); endSprint(true); } }, T.icon('stop'), 'Encerrar'))); };
    draw(); const pop = T.popover(btn, box); const iv = setInterval(() => { if (!pop.isConnected) return clearInterval(iv); draw(); }, 2000);
  }
  function tickSprint(){
    const s = Shell.sprint; if (!s) return;
    const el = document.getElementById('sprint-time'); if (el) el.textContent = fmtLeft(s.min * 60000 - spElapsed(s));
    const wl = document.getElementById('sprint-words'); if (wl) wl.textContent = '+' + T.fmt(spWords(s));
    if (s.runAt) { const e = spElapsed(s); const last = s.samples[s.samples.length - 1]; if (e - last.e >= 20000) { s.samples.push({ e, w: spWords(s) }); if (s.samples.length > 400) s.samples.splice(1, 1); spSave(); } }
    if (spElapsed(s) >= s.min * 60000) endSprint(false);
  }
  function endSprint(early){
    const s = Shell.sprint; if (!s) return; clearInterval(s.timer);
    if (s.runAt) { s.acc += Date.now() - s.runAt; s.runAt = null; }
    const pl = s.pauses[s.pauses.length - 1]; if (pl && !pl.end) pl.end = Date.now();
    Shell.sprint = null; spSave();
    try { T.Buddy?.onSprintEnd(early); } catch (e) {}
    Shell.flushEditors();
    setTimeout(() => {
      const st = sprintStats(Object.assign({}, s, { runAt: null }));
      const mins = Math.max(1, Math.round(st.act));
      const p = S().get(s.pid); if (p) S().update(s.pid, { meta: { sprints: [...(p.meta?.sprints || []).slice(-49), { at: Date.now(), min: mins, words: st.words, plan: s.min, pauses: st.pauses, pausedMin: Math.round(st.pausedMin), perHour: Math.round(st.perHour), blocks: st.blocks.map(b => b.w), block: st.block }] } });
      if (!early) T.Sound.chime();
      Shell.renderTop();
      T.modal((box, close) => box.append(h('h2', early ? 'Sprint encerrado' : 'Tempo!'), h('p.sub', 'Você escreveu'), h('div', { style: { fontFamily: 'var(--font-display)', fontSize: '72px', lineHeight: 1 } }, h('span.num', T.fmt(st.words))),
        h('p', { style: { color: 'var(--ink-2)' } }, 'palavras em ' + fmtMin(st.act) + ' de escrita' + (st.pauses ? ', com ' + st.pauses + (st.pauses === 1 ? ' pausa' : ' pausas') : '') + '.'),
        statsView(st),
        h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Fechar'), h('button.btn.primary', { onclick: () => { close(); startSprint(s.min); } }, 'Outro sprint de ' + fmtMin(s.min)))), { wide: true });
    }, 800);
  }
  Shell.restoreSprint = function(){
    if (Shell.sprint) return; let s = null; try { s = JSON.parse(localStorage.getItem(SPKEY) || 'null'); } catch (e) {}
    if (!s || s.pid !== Shell.pid) return;
    Shell.sprint = s; s.timer = setInterval(tickSprint, 1000);
    if (spElapsed(s) >= s.min * 60000) { s.acc = s.min * 60000; s.runAt = null; endSprint(false); }
  };

  /* ---------- ideias rápidas ---------- */
  function quickIdea(){
    const old = document.querySelector('.idea-pop'); if (old) { old.remove(); return; }
    const ta = h('textarea.textarea', { placeholder: 'Anote antes que fuja… (Ctrl+Enter salva)', 'aria-label': 'Ideia rápida' });
    const folders = T.Ideas.folders(Shell.pid);
    let folder = S().prefs().lastIdeaFolder || ''; if (folder && !folders.some(f => f.id === folder)) folder = '';
    const save = () => {
      const t = ta.value.trim(); if (!t) { pop.remove(); return; }
      T.Ideas.create(Shell.pid, t, folder); S().setPrefs({ lastIdeaFolder: folder }); pop.remove();
      const f = T.Ideas.folders(Shell.pid).find(x => x.id === folder);
      T.toast(f ? 'Ideia guardada em “' + f.name + '”.' : 'Ideia guardada.', { action: { label: 'Ver ideias', fn: () => Shell.open({ kind: 'ideas', ref: 'ideas' }) } }); T.emit('tree-changed');
    };
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save(); if (e.key === 'Escape') pop.remove(); });
    const pop = h('div.idea-pop.glass.glass-strong', h('div.row', { style: { marginBottom: '8px' } }, h('b.grow', 'Ideia rápida'), T.iconBtn('x', 'Fechar', () => pop.remove(), '.sm')), ta,
      h('div.if-label', 'Guardar na pasta'), T.Ideas.picker(Shell.pid, folder, (id) => { folder = id; setTimeout(() => ta.focus(), 0); }),
      h('div.row', { style: { marginTop: '10px', justifyContent: 'flex-end' } }, h('button.btn.primary.sm', { onclick: save }, 'Guardar')));
    document.body.appendChild(pop); setTimeout(() => ta.focus(), 20);
  }

  /* ---------- ajustes ---------- */
  Shell.settings = function(){
    const p = S().prefs();
    T.modal((box, close) => {
      const themeSeg = h('div.seg', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { S().setPrefs({ theme: k }); Shell.applyTheme(); themeSeg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); } }, l); if ((p.theme || 'auto') === k) b.classList.add('on'); return b; }));
      const modeSeg = h('div.seg', [['normal', 'Normal'], ['tw', 'Máquina'], ['book', 'Livro']].map(([k, l]) => { const b = h('button', { type: 'button', onclick: () => { S().setPrefs({ defaultMode: k }); modeSeg.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); } }, l); if ((p.defaultMode || 'normal') === k) b.classList.add('on'); return b; }));
      const tg = (key, label, def, after) => { const c = h('input', { type: 'checkbox', id: 'pref-' + key, checked: p[key] ?? def }); c.onchange = () => { S().setPrefs({ [key]: c.checked }); after && after(); }; return h('label.row', { for: 'pref-' + key, style: { gap: '8px' } }, c, label); };
      const vol = h('input.range', { type: 'range', min: 0, max: 100, value: Math.round((p.volume ?? .6) * 100), id: 'pref-vol' });
      vol.oninput = () => { T.Sound.volume(vol.value / 100); }; vol.onchange = () => { S().setPrefs({ volume: vol.value / 100 }); T.Sound.key(); };
      const last = p.lastBackup ? T.relTime(p.lastBackup) : 'nunca';
      box.append(h('h2', 'Ajustes'), h('p.sub', 'Valem para todos os livros.'),
        h('div.stack',
          h('div.field', h('b', 'Aparência'), themeSeg),
          tg('solid', 'Reduzir transparência (painéis sólidos, mais fáceis de ler)', false, () => Shell.applyTheme()),
          tg('refract', 'Vidro com distorção nas bordas (Chrome e Edge)', true, () => Shell.applyTheme()),
          h('div.field', h('b', 'Modo de escrita ao abrir um texto'), modeSeg),
          tg('twSound', 'Som de máquina de escrever no modo Máquina', true),
          tg('showResearch', 'Mostrar a seção Pesquisa na barra lateral (pastas e documentos de pesquisa)', false, () => Shell.renderSide && Shell.renderSide()),
          Shell.pid ? h('div.row', h('button.btn', { onclick: () => { close(); Shell.wallModal(); } }, icon('wall'), 'Papéis de parede do livro…')) : null,
          h('label.field', { for: 'pref-vol' }, 'Volume dos sons', vol),
          h('div.panel.glass', { style: { marginTop: '6px' } }, h('h3', 'Privacidade'),
            h('p', { style: { margin: '0 0 10px', color: 'var(--ink-2)', fontSize: '13px' } }, 'Seus livros ficam guardados só para você: ninguém mais abre este site sem você compartilhar. O texto só sai daqui quando você usa os sinônimos ou a narração com as vozes do Claude, e isso não é usado para escrever por você. Com o modo privado ligado, nem isso acontece: sinônimos desligam e a narração usa só as vozes do aparelho.'),
            tg('noClaude', 'Modo privado: nunca enviar meu texto ao Claude', false)),
          h('div.panel.glass', { style: { marginTop: '6px' } }, h('h3', 'Backup'),
            h('p', { style: { margin: '0 0 10px', color: 'var(--ink-2)' } }, S().mode === 'cloud' ? 'Seus textos ficam salvos na nuvem, ligados à sua conta. O backup em arquivo é uma cópia extra de segurança.' : 'Neste aparelho os textos ficam salvos só no navegador. Faça backups com frequência.', ' Último backup: ', h('b', last), '.'),
            h('div.row', { style: { flexWrap: 'wrap' } },
              Shell.pid ? h('button.btn', { onclick: () => Shell.backupProject(Shell.pid) }, icon('download'), 'Backup deste livro') : null,
              h('label.row', { style: { gap: '8px', fontSize: '13px', flexBasis: '100%' } }, 'Lembrar de fazer backup a cada', (() => { const sel = h('select.select', { style: { width: 'auto' } }, [[3, '3 dias'], [7, '7 dias'], [14, '14 dias'], [30, '30 dias'], [0, 'nunca lembrar']].map(([v, n]) => h('option', { value: v, selected: (S().prefs().backupDays ?? 7) === v }, n))); sel.onchange = () => { S().setPrefs({ backupDays: +sel.value }); Shell.updBkChip && Shell.updBkChip(); }; return sel; })()),
              Shell.pid && T.GDocs ? h('button.btn.primary', { onclick: () => { close(); T.GDocs.panel(Shell.pid); } }, icon('doc'), 'Backup no Google Docs…') : null,
              h('button.btn', { onclick: () => Shell.backupAll() }, icon('download'), 'Backup de todos os livros'),
              h('button.btn', { onclick: () => { close(); importBackup(); } }, icon('upload'), 'Importar backup')))),
        h('div.modal-foot', h('button.btn.primary', { onclick: () => close() }, 'Pronto')));
    });
  };

  /* ---------- backup ---------- */
  async function deliver(filename, obj){
    const json = JSON.stringify(obj);
    const ok = await T.Download.save(filename, json);
    const pids = [...new Set((obj.items || []).filter(i => i.type === 'project').map(i => i.id))];
    const mark = () => { const now = Date.now(); S().setPrefs({ lastBackup: now }); pids.forEach(id => { if (S().get(id)) S().update(id, { meta: { lastBackup: now } }, { silent: true }); }); Shell.updBkChip && Shell.updBkChip(); document.querySelector('.bk-remind')?.remove(); };
    if (ok === true) { mark(); T.toast('Backup baixado: ' + filename); return; }
    if (ok === false) return;
    T._bkMark = mark;
    T.modal((box, close) => {
      const ta = h('textarea.textarea', { readonly: true, style: { minHeight: '200px', fontFamily: 'monospace', fontSize: '11px' } }); ta.value = json;
      box.append(h('h2', 'Copie o backup'), h('p.sub', 'Não consegui baixar o arquivo aqui. Copie o texto abaixo e cole num arquivo chamado ' + filename + '.'), ta,
        h('div.modal-foot', h('button.btn', { onclick: () => close() }, 'Fechar'), h('button.btn.primary', { onclick: async () => { try { await navigator.clipboard.writeText(json); T._bkMark && T._bkMark(); S().setPrefs({ lastBackup: Date.now() }); T.toast('Copiado.'); } catch (e) { ta.select(); T.toast('Selecione e copie com Ctrl+C.'); } } }, icon('copy'), 'Copiar')));
    }, { wide: true });
  }
  const slug = (s) => (s || 'livro').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  /* ---------- lembrete de backup ---------- */
  Shell.bkChip = function(pid){ const lb = Shell.lastBackupOf(pid); const d = lb ? Math.floor((Date.now() - lb) / 864e5) : -1; const lim = S().prefs().backupDays ?? 7; const late = d < 0 || (lim && d >= lim); return h('button.bk-chip' + (late ? '.late' : ''), { type: 'button', title: (S().mode === 'cloud' ? 'Seus textos estão salvos na nuvem. ' : 'Seus textos estão salvos neste navegador. ') + (lb ? 'Último backup: ' + new Date(lb).toLocaleString('pt-BR') : 'Ainda sem backup') + '. Toque para fazer um agora.', onclick: () => Shell.backupRemind(pid, true) }, d < 0 ? 'sem backup' : d === 0 ? 'backup hoje' : 'backup há ' + d + 'd'); };
  Shell.updBkChip = function(){ const old = document.querySelector('.side-foot .bk-chip'); if (old && Shell.pid) old.replaceWith(Shell.bkChip(Shell.pid)); };
  T.on('gdocs-status', () => setTimeout(() => Shell.updBkChip && Shell.updBkChip(), 50));
  Shell.lastBackupOf = function(pid){
    const p = S().get(pid); if (!p) return 0;
    const g = T.GDocs ? T.GDocs.cfg(pid) : null;
    return Math.max(p.meta?.lastBackup || 0, g && g.on && !g.err ? (g.last || 0) : 0);
  };
  const bookWords = (pid) => S().all(pid).filter(i => i.area === 'ms' && i.body).reduce((a, i) => a + T.countWords(T.htmlToText(i.body)), 0);
  Shell.backupRemind = function(pid, force){
    const days = S().prefs().backupDays ?? 7; if (!days && !force) return;
    const p = S().get(pid); if (!p || p.meta?.sample) return;
    const last = Shell.lastBackupOf(pid), now = Date.now();
    if (!force) {
      if ((p.meta?.backupSnooze || 0) > now) return;
      if (last && now - last < days * 864e5) return;
      if (bookWords(pid) < 200) return;
    }
    document.querySelector('.bk-remind')?.remove();
    const ago = last ? Math.max(1, Math.round((now - last) / 864e5)) : 0;
    const g = T.GDocs ? T.GDocs.cfg(pid) : null;
    const card = h('div.bk-remind.glass.glass-strong', { role: 'status' },
      h('div.row', icon('download'), h('b.grow', last ? 'Seu último backup foi há ' + ago + (ago === 1 ? ' dia' : ' dias') : 'Este livro ainda não tem backup'), T.iconBtn('x', 'Fechar', () => card.remove(), '.sm')),
      h('p', '“' + (p.title || 'Este livro') + '” está guardado aqui, mas uma cópia fora do site protege seu texto se algo der errado (navegador limpo, conta trocada, erro). Leva um clique.'),
      h('div.row', { style: { flexWrap: 'wrap', gap: '6px' } },
        h('button.btn.sm.primary', { onclick: () => Shell.backupProject(pid) }, icon('download'), 'Baixar backup agora'),
        T.GDocs && !T.STANDALONE ? h('button.btn.sm', { onclick: () => { card.remove(); if (g && g.url) T.GDocs.run(pid, true); else T.GDocs.panel(pid); } }, icon('doc'), g && g.url ? 'Backup no Google Docs agora' : 'Ligar o Google Docs') : null,
        h('button.btn.sm.ghost', { onclick: () => { S().update(pid, { meta: { backupSnooze: now + 864e5 } }, { silent: true }); card.remove(); } }, 'Lembrar amanhã')),
      h('p.muted', { style: { fontSize: '11.5px', margin: 0 } }, 'Para restaurar um backup baixado: Ajustes › Backup › Importar backup. A frequência deste lembrete também fica em Ajustes.'));
    document.body.appendChild(card);
  };
  Shell.backupProject = async function(pid){
    Shell.flushEditors(); await S().loadProject(pid);
    const p = S().get(pid);
    deliver('tinteiro-' + slug(p.title) + '-' + T.today() + '.json', { app: 'tinteiro', version: 1, exported: Date.now(), items: [p, ...S().all(pid)] });
  };
  Shell.backupAll = async function(){
    Shell.flushEditors();
    const ps = await S().loadProjects(); const items = [];
    for (const p of ps) { await S().loadProject(p.id); items.push(p, ...S().all(p.id)); }
    deliver('tinteiro-tudo-' + T.today() + '.json', { app: 'tinteiro', version: 1, exported: Date.now(), items });
  };
  async function importBackup(){
    const f = await T.pickFile('.json,application/json', { startIn: 'downloads' }); if (!f) return;
    let data; try { data = JSON.parse(await f.text()); } catch (e) { T.toast('Este arquivo não é um backup do Entrelinhas.'); return; }
    if (!data || data.app !== 'tinteiro' || !Array.isArray(data.items)) { T.toast('Este arquivo não é um backup do Entrelinhas.'); return; }
    const projs = data.items.filter(i => i.type === 'project');
    const clash = projs.filter(p => S().get(p.id));
    if (clash.length && !await T.confirm('Substituir livros existentes?', clash.map(c => '“' + c.title + '”').join(', ') + ' já existe aqui. O backup vai substituir a versão atual.', 'Substituir', true)) return;
    S().importItems(data.items.filter(i => i.type !== 'prefs'));
    T.toast(projs.length + (projs.length === 1 ? ' livro importado.' : ' livros importados.'));
    setTimeout(() => Shell.home(), 400);
  }
  function backupReminder(){
    const p = S().prefs(); const words = S().get(Shell.pid)?.meta?.words || 0;
    if (words > 500 && (!p.lastBackup || Date.now() - p.lastBackup > 7 * 864e5)) {
      setTimeout(() => T.toast(p.lastBackup ? 'Faz mais de uma semana desde o último backup.' : 'Que tal fazer o primeiro backup do livro?', { ms: 9000, action: { label: 'Fazer backup', fn: () => Shell.backupProject(Shell.pid) } }), 2500);
    }
  }

  // roda do mouse rola as barras horizontais
  document.addEventListener('wheel', (e) => {
    const bar = e.target.closest && e.target.closest('.hscroll'); if (!bar || e.ctrlKey) return;
    if (bar.scrollWidth > bar.clientWidth + 2 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { bar.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });

  /* ---------- atalhos e modo foco ---------- */
  T.on('focus-mode', () => {
    if (!Shell.el) return;
    const on = !Shell.el.classList.contains('focus');
    Shell.el.classList.toggle('focus', on);
    let exit = document.getElementById('focus-exit');
    if (on && !exit) { exit = h('button.btn.glass.sm#focus-exit', { style: { position: 'fixed', bottom: '14px', left: '14px', zIndex: 30 }, onclick: () => T.emit('focus-mode') }, icon('focus'), 'Sair do foco (Esc)'); document.body.appendChild(exit); }
    if (!on && exit) exit.remove();
    document.querySelector('.fabs')?.classList.toggle('hidden', on);
    setTimeout(() => Shell.placeHandles(), 30);
    T.emit('focus-changed', on);
  });
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!Shell.pid) return;
    if (mod && e.key.toLowerCase() === 'f' && !e.shiftKey) { e.preventDefault(); const sel = getSelection().toString().trim(); Shell.open({ kind: 'find', ref: 'find', q: sel.length < 60 ? sel : '' }); }
    if (mod && e.key === '\\') { e.preventDefault(); toggleSide(); }
    if (e.key === 'Escape' && Shell.el?.classList.contains('focus') && !document.querySelector('.scrim, .compose')) T.emit('focus-mode');
  });
})(window.T);
