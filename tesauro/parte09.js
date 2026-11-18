// PARTE 9 — CONFLITOS, VOLUME 2
const PREDIO=()=>{const and=["Terraço: o objetivo","Andar 4: cena","Andar 3: cena","Andar 2: cena","Térreo: incidente incitante"];
 let s=`<svg viewBox="0 0 420 300" width="420" role="img" aria-label="Prédio de conflitos: cada andar é uma cena" style="font-family:var(--display)">`;
 and.forEach((t,i)=>{const y=10+i*56;const h=[290,236,212,190,170][i];s+=`<rect x="60" y="${y}" width="300" height="50" rx="8" style="fill:hsl(${h} 75% ${48+i*5}%)"/><text x="210" y="${y+31}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:15px">${t}</text>`;});
 s+=`<path d="M380 270 V30" style="stroke:hsl(var(--h) 60% 45%);stroke-width:4;fill:none"/><path d="M372 42 l8 -12 l8 12" style="stroke:hsl(var(--h) 60% 45%);stroke-width:4;fill:none;stroke-linejoin:round"/><text x="30" y="290" style="fill:var(--suave);font-size:12px">conflito interno em todos os andares</text>`;
 return `<div class="diagrama">${s}</svg></div>`};
GUIA.add({
n:9,
chamada:"Disputas de poder, feridas no ego, perigos, perda de controle e de vantagem. A continuação direta do volume 1, no mesmo formato.",
campos:CAMPOS_CONFLITO,
tituloEntradas:"Os conflitos do volume 2",
notaEntradas:"em seis grupos",
teoria:[
{t:"O conflito molda a trama",html:`
<p>Pense na história de pescador que o tio conta no churrasco de domingo: “fui ao Araguaia e peguei um peixe”. Ninguém presta atenção. Agora: “o motor do barco morreu, a piranha cortou a linha duas vezes, começou a chover e, quando eu já ia desistir…”. A mesa inteira para de comer. ==A diferença é o conflito.==</p>
<h4>A fórmula objetivo, motivação e conflito</h4>
<p>A personagem quer algo (objetivo), por um motivo (motivação), mas algo se opõe (conflito). Se uma premissa não sustenta as três partes, ela ainda não é uma história.</p>
<div class="quadro"><span class="q">Ficha rápida</span><p><b>Minha personagem quer</b> ______ <b>porque</b> ______ <b>, mas</b> ______.</p></div>`},
{t:"Os quatro níveis de conflito",html:`
<ul><li><b>Central:</b> o embate principal, numa das seis formas clássicas (veja a parte 8).</li><li><b>Da história:</b> problemas grandes que levam tempo para resolver.</li><li><b>Da cena:</b> obstáculos imediatos. O fracasso faz parte.</li><li><b>Interno:</b> presente nos dois níveis anteriores.</li></ul>
${PREDIO()}
<p>Imagine um prédio: cada andar é uma cena com seu obstáculo, o vilão espera no terraço e o conflito interno sobe junto pela escada. Pôr a protagonista ==em desvantagem== (menos recursos, terreno desconhecido) aumenta a tensão.</p>`},
{t:"As categorias de conflito",html:`
<div class="tab-wrap"><table><thead><tr><th>Categoria</th><th>O que ameaça</th></tr></thead><tbody>
<tr><td><b>Perda de controle</b></td><td>Quebra a ilusão de que dá para controlar tudo.</td></tr>
<tr><td><b>Disputas de poder</b></td><td>Surgem de desigualdade de status ou de objetivos opostos, inclusive entre pessoas que se amam.</td></tr>
<tr><td><b>Perda de vantagem</b></td><td>Tira o que a personagem conquistou, testa o compromisso e revela objetivos falsos.</td></tr>
<tr><td><b>Conflitos do ego</b></td><td>Atacam a autoestima e geram lutar, fugir ou congelar.</td></tr>
<tr><td><b>Perigos e ameaças</b></td><td>Atacam a segurança: vêm de pessoas, do lugar ou da própria personagem.</td></tr>
<tr><td><b>Desafios diversos</b></td><td>Doenças, fobias, mudanças de plano, crises de fé.</td></tr>
</tbody></table></div>`},
{t:"Manter o conflito central em destaque",html:`
<p>Equilibre conflito interno e externo conforme o gênero: um suspense pede mais ação; um romance, mais interioridade.</p>
<p><b>Subtramas</b> têm começo, meio e fim e ==sempre servem à trama principal==: aprofundam o tema, testam a personagem por outro lado ou funcionam como pista falsa. Se uma subtrama poderia ser cortada sem que nada mudasse, corte.</p>`},
{t:"O fio de ouro do conflito",html:`
<p>O conflito atravessa a estrutura inteira: incidente incitante, momento em que tudo parece perdido, noite escura da alma e clímax. Ele:</p>
<ul><li>desenvolve a personagem, às vezes por um caminho mais sombrio;</li><li>fortalece ou derruba a autoestima;</li><li>revela valores e crenças;</li><li>abre janelas para o passado sem travar o ritmo;</li><li>expõe as crenças falsas;</li><li>convida o leitor a refletir sobre questões morais.</li></ul>
<h4>O conflito gera tensão</h4>
<p><b>Conflito</b> é a força que se opõe à personagem. <b>Tensão</b> é a expectativa do leitor sobre o que vai acontecer. A tensão funciona como ==puxa e solta==: cresce com perguntas, chega ao pico, se resolve, e o ciclo recomeça.</p>
<div class="cena">Num jantar de quatro amigos, Aline percebe que o marido e a amiga trocam um olhar rápido demais. Pergunta: o que foi isso? Ninguém responde. O garçom traz a conta. Aline paga sem dizer nada e chama um carro só para ela.</div>
<p>Quase toda tensão gira em torno de algo desconhecido: em quem confiar, quem vai pagar o preço, como o outro vai reagir. Também existe ==tensão positiva==: a expectativa de um beijo, de um reencontro.</p>
<h4>O conflito gera emoção</h4>
<p>Maior nem sempre é melhor. Um choque enorme provoca uma emoção só. Uma cadeia de pequenos conflitos faz a emoção ir mudando, de preocupação para alívio e depois para culpa, como a pimenta que esquenta aos poucos.</p>
<h4>O conflito empurra a história</h4>
<p>Sem conflito não há urgência. Complicações e prazos obrigam a personagem a melhorar suas respostas, e assim trama e arco avançam juntos.</p>`},
{t:"Formas de intensificar o conflito",html:`
<ul>
<li><b>Deixe o resultado incerto:</b> desvantagem, ou uma vitória fácil que esconde uma armadilha.</li>
<li><b>Tire o que ela precisa:</b> informação, dinheiro, mentora, remédio, sinal de celular.</li>
<li><b>Torne os riscos pessoais:</b> ameace o que ela mais ama.</li>
<li><b>Crie uma situação sem saída</b> (parte 8).</li>
<li><b>Mantenha a personagem em movimento:</b> o lugar seguro que esconde perigos.</li>
<li><b>Abale a equipe:</b> egos, rivalidades, mal-entendidos.</li>
<li><b>Aperte o prazo.</b> Com pressa, a personagem erra.</li>
<li><b>Acione um gatilho:</b> ponha-a diante da ferida (parte 6).</li>
<li><b>Exija um sacrifício.</b></li>
<li><b>Use o gênero:</b> as limitações de época, tecnologia ou sociedade.</li>
<li><b>Não recorra sempre à violência.</b> Use só quando serve à história, nunca como atalho.</li>
<li><b>Use o conflito silencioso:</b> aliciar alguém do outro lado, alianças improváveis, burocracia, vazamento de informação, intimidação.</li>
</ul>`},
{t:"O vilão em cena",html:`
<ul>
<li>O vilão ==quer causar dano==; o antagonista apenas se opõe.</li>
<li>Segue um código moral próprio, distorcido mas coerente. Muitas vezes se vê como herói.</li>
<li>Tem um objetivo oposto ao da protagonista: só um dos dois pode vencer.</li>
<li>Os riscos dele também são altos.</li>
<li>É bem construído, com qualidades e defeitos, de preferência com a força que falta à heroína.</li>
<li>Tem um passado que a autora conhece (parte 6).</li>
<li>É temível: recursos, aliados e capacidade de inspirar medo.</li>
<li>Tem ligação com a protagonista: história em comum, espelhamento ou objetivo compartilhado.</li>
<li>Pode ou não ser redimível.</li>
</ul>`},
{t:"O clímax",html:`
<p>O clímax é o confronto final, geralmente na segunda metade do terceiro ato. Ele precisa de quatro elementos:</p>
<ol><li>Confronto definitivo, com vencedor claro.</li><li>Espelhar o catalisador do início.</li><li>A heroína usar o que aprendeu.</li><li>Quem vence alcançar o objetivo.</li></ol>
<ul><li><b>Clímax silenciosos</b> funcionam: uma conversa ou um gesto podem fechar a história.</li><li><b>Vencer sem alcançar o objetivo:</b> às vezes o objetivo era falso, e a verdade que ela encontra traz paz.</li><li><b>Força antagônica sem rosto:</b> dê a ela um representante (o gerente do banco, o fiscal).</li><li><b>Subtramas</b> se fecham antes ou junto do clímax principal.</li></ul>
<h4>Problemas comuns</h4>
<p>Resolver cedo demais; a cena que nunca acaba; previsibilidade; resultado ambíguo; clímax sem peso; e o <em>deus ex machina</em>, quando algo de fora resolve tudo e tira o protagonismo da heroína.</p>`},
{t:"Resolver conflitos nos relacionamentos sem pressa",html:`
<p>Quando as personagens resolvem tudo cedo e com maturidade demais, a tensão morre.</p>
<h4>Para manter o conflito em aberto</h4>
<ul><li>Mal-entendidos e frases ambíguas.</li><li>Recusa em assumir a própria parte.</li><li>Confrontar de cabeça quente.</li><li>Um problema novo bem quando tudo se ajeitava.</li><li>Choque de personalidades.</li><li>Mesmo objetivo, métodos incompatíveis.</li><li>Preconceitos e história entre os dois.</li><li>Pedidos de desculpa sem vontade.</li><li>Evitar o assunto, a reação mais realista de todas.</li></ul>
<h4>Para resolver só temporariamente</h4>
<p>Fazer piada, ganhar tempo, criar distração, mentir (até a teia de mentiras desabar).</p>`},
{t:"Protagonismo",html:`
<p>Há uma diferença entre a personagem ==a quem as coisas acontecem== e a que ==faz as coisas acontecerem==.</p>
<div class="cena"><b>Passiva:</b> Lia é demitida, a irmã oferece um quarto, ela aceita, conhece um vizinho que a indica para um emprego.<br><b>Ativa:</b> Lia é demitida, vende o carro para fazer um curso, insiste três vezes na mesma empresa e, na terceira, leva um projeto pronto debaixo do braço.</div>
<p>Para dar protagonismo: use o ciclo conflito, escolha e consequência; dê um objetivo a cada cena; ponha conflito em toda cena; garanta que a escolha seja dela.</p>`},
{t:"Impasses comuns",html:`
<ul>
<li><b>Conflito morno:</b> riscos baixos ou conflito forçado.</li>
<li><b>Ritmo:</b> conflito demais deixa a história episódica; introspecção demais trava. Uma referência é cerca de 80% de ação para 20% de reflexão, e dar à personagem algo para fazer enquanto pensa.</li>
<li><b>Melodrama:</b> conflitos escolhidos só pelo choque, ou reações desproporcionais. Suba a escada emocional degrau por degrau (parte 1).</li>
<li><b>Trama complicada demais:</b> corte subtramas e cenas que não servem à principal.</li>
</ul>`}
],
grupos:[{nome:"Perda de controle",itens:[]},{nome:"Disputas de poder",itens:[]},{nome:"Perda de vantagem",itens:[]},{nome:"Conflitos do ego",itens:[]},{nome:"Perigos e ameaças",itens:[]},{nome:"Desafios diversos",itens:[]}]
});
(function(){
const G=GUIA.partes[9].grupos;
G[0].itens.push(
E8("Arrombamento","Casa arrombada nas férias|Carro arrombado|Loja invadida","Boletim de ocorrência|Seguro que demora|Trocar fechaduras","Perder objetos de família|Ladrão volta|Sensação de insegurança permanente","Choque|Raiva|Medo|Inquietação","*Estou segura aqui?*|*Devo me mudar?*","Paranoico|Alarmista|Controlador","Segurança: o lar deixa de ser abrigo.","Resiliente|Prático|Calmo","Reorganizar a vida e reforçar laços com vizinhos."),
E8("Morte de um familiar","Morte súbita|Doença prolongada","Velório organizado às pressas|Inventário|Cartório","Briga por herança|Depressão","Luto|Tristeza|Raiva|Culpa","*Disse tudo o que queria?*","Rancoroso|Ganancioso","Pertencimento e segurança.","Resiliente|Compassivo","Valorizar quem fica."),
E8("Dívidas do parceiro","Cartão no rotativo|Apostas online|Empréstimo escondido","Contas atrasadas|Nome no Serasa","Perder a casa|Divórcio","Choque|Raiva|Medo","*Confio de novo?*","Controlador|Desconfiado","Segurança.","Prático|Assertivo","Reconstruir com transparência."),
E8("Crise econômica","Inflação|Desemprego|Fábrica que fecha","Cortes no supermercado|Bicos","Falência|Migração","Ansiedade|Medo","*Vamos sobreviver?*","Pessimista","Fisiológicas e segurança.","Engenhoso|Resiliente","Descobrir novas habilidades."),
E8("Gravidez inesperada","Adolescente|Recém-promovida|Família já com dificuldades","Contar à família|Enjoo","Perder oportunidades|Abandono","Choque|Medo|Esperança","*Estou pronta?*","Impulsivo|Inseguro","Segurança e pertencimento.","Responsável|Corajoso","Descobrir uma força nova.","No Brasil, a interrupção da gravidez só é legal em casos específicos, o que muda os dilemas possíveis. Trate o tema com neutralidade e cuidado."),
E8("Despejo","Aluguel atrasado|Reintegração de posse","Procurar casa","Morar na rua","Medo|Vergonha|Raiva","*Para onde vamos?*","Orgulhoso","Segurança.","Engenhoso|Resiliente","Buscar apoio coletivo."),
E8("Cair num golpe","Golpe do Pix|Falso sequestro por telefone","Ligações|Banco","Perder economias","Vergonha|Raiva","*Como caí?*","Crédulo","Segurança e estima.","Perspicaz","Alertar outros."),
E8("Crise de pânico","No trabalho|Em público","Constrangimento","Evitar sair de casa","Pavor|Vergonha","*O que está acontecendo comigo?*","Inseguro","Segurança.","Resiliente","Buscar ajuda profissional.","Retrate com pesquisa: crises de pânico são reais e tratáveis."),
E8("Perder uma criança em público","Shopping|Praia|Bloco de carnaval","Correria|Avisos no alto-falante","Desaparecimento","Pânico|Desespero|Alívio","*E se não encontrar?*","Distraído","Pertencimento.","Calmo|Decidido","Encontrar e reavaliar cuidados."),
E8("Enchente","Rua alagada|Casa inundada|Deslizamento de encosta","Perder móveis|Lama","Perder a casa|Mortes","Medo|Desespero","*Reconstruo ou mudo?*","Pessimista","Fisiológicas e segurança.","Solidário|Resiliente","Solidariedade da comunidade."),
E8("Morte de um animal de estimação","Atropelamento|Velhice|Doença","Silêncio em casa","Depressão","Tristeza|Luto","*Podia ter evitado?*","Culpa","Pertencimento.","Grato","Honrar a memória.")
);
G[1].itens.push(
E8("Ser presa","Prisão injusta|Erro do passado","Interrogatório|Advogado caro","Condenação","Medo|Indignação","*Quem acredita em mim?*","Explosivo","Segurança.","Persistente|Calmo","Provar a inocência."),
E8("Bullying","Escola|Trabalho|Internet","Piadas|Exclusão","Isolamento|Depressão","Vergonha|Raiva","*Reajo ou me escondo?*","Inseguro","Pertencimento e estima.","Resiliente|Corajoso","Encontrar aliados."),
E8("Falsa acusação","Assédio|Roubo|Plágio","Olhares","Demissão|Processo","Indignação|Medo","*Como provar?*","Explosivo","Estima.","Persistente|Íntegro","Limpar o nome."),
E8("Pressão da família","Casamento|Carreira|Religião","Cobranças no almoço de domingo","Ruptura","Culpa|Raiva","*Agrado ou sigo meu caminho?*","Conformista","Pertencimento.","Autêntico|Assertivo","Afirmar a própria escolha."),
E8("Sabotagem","No trabalho|Em competição","Erros misteriosos","Perder tudo","Raiva|Desconfiança","*Quem foi?*","Paranoico","Estima.","Perspicaz","Desmascarar o sabotador."),
E8("Processo judicial","Divórcio|Trabalho|Herança","Audiências","Ruína","Ansiedade|Raiva","*Faço acordo?*","Teimoso","Segurança.","Paciente|Racional","Encerrar o ciclo."),
E8("Discriminação","Racismo|Machismo|LGBTfobia","Comentários|Portas fechadas","Violência|Exclusão","Indignação|Mágoa","*Denuncio?*","Conformista","Estima.","Corajoso|Justo","Encontrar voz e comunidade."),
E8("Assédio","No trabalho|Na rua|Online","Mensagens|Olhares","Violência|Perder o emprego","Medo|Raiva","*Falo?*","Submisso","Segurança.","Corajoso|Assertivo","Romper o silêncio."),
E8("Nepotismo","Promoção dada ao filho do chefe","Injustiça diária","Demissão","Frustração|Raiva","*Fico ou saio?*","Ressentido","Estima.","Persistente","Buscar outro caminho.")
);
G[2].itens.push(
E8("Chegada de um concorrente","Nova loja na rua|Novo colega brilhante","Perda de clientes","Falência|Demissão","Ansiedade|Inveja","*Sou substituível?*","Invejoso","Segurança e estima.","Criativo|Adaptável","Inovar."),
E8("Lugar seguro comprometido","Casa invadida|Abrigo descoberto","Mudanças","Perigo constante","Medo|Raiva","*Para onde vou?*","Paranoico","Segurança.","Engenhoso","Criar um novo refúgio."),
E8("Ser expulsa de um grupo","Banda|Igreja|Grupo de amigos","Exclusão","Isolamento","Mágoa|Vergonha","*Onde errei?*","Rancoroso","Pertencimento.","Resiliente","Encontrar novo grupo."),
E8("Deixar a terra natal","Migração|Mudança forçada","Saudade|Adaptação","Perda de identidade","Saudade|Medo","*Quem sou longe de casa?*","Nostálgico","Pertencimento.","Adaptável","Construir um novo lar."),
E8("Perder uma testemunha","Testemunha some ou desiste","Investigação travada","Impunidade","Frustração|Raiva","*Desisto?*","Impaciente","Segurança.","Persistente","Buscar outras provas."),
E8("Perder financiamento","Bolsa cortada|Investidor desiste","Projetos parados","Fim do sonho","Frustração|Medo","*Continuo?*","Pessimista","Autorrealização.","Engenhoso","Buscar alternativas."),
E8("Mudança de regras","Novo edital|Nova lei","Adaptação","Perder o direito","Indignação|Frustração","*Luto?*","Inflexível","Segurança.","Adaptável","Reinventar-se."),
E8("Roubo de algo importante","Documentos|Notebook com o trabalho","Refazer tudo","Perder prazos","Raiva|Desespero","*Recomeço?*","Explosivo","Segurança.","Resiliente","Recomeçar melhor.")
);
G[3].itens.push(
E8("Perda de prestígio","Rebaixamento|Escândalo","Comentários","Isolamento","Vergonha|Raiva","*Quem sou sem isso?*","Orgulhoso","Estima.","Humilde","Descobrir valor próprio."),
E8("Ser cortada do time","Esporte|Projeto","Vergonha","Desistir do sonho","Decepção|Vergonha","*Tento de novo?*","Inseguro","Estima.","Persistente","Voltar mais forte."),
E8("Ser desacreditada","Relatar um problema e não ser ouvida","Descaso","Tragédia que poderia ser evitada","Frustração|Indignação","*Insisto?*","Resignado","Estima.","Persistente|Assertivo","Provar que tinha razão."),
E8("Crise de autoconfiança","Depois de um fracasso","Hesitações","Paralisia","Insegurança|Medo","*Sou capaz?*","Inseguro","Estima.","Resiliente","Reconstruir a confiança."),
E8("Descobrir que foi adotada","Documento|Revelação","Perguntas","Crise de identidade","Choque|Confusão","*Quem sou eu?*","Ressentido","Pertencimento.","Curioso|Maduro","Integrar as duas histórias."),
E8("Pedir dinheiro emprestado","Para amigo|Para a família","Vergonha","Dívida|Ruptura","Vergonha|Ansiedade","*Peço?*","Orgulhoso","Estima.","Humilde","Aceitar ajuda."),
E8("Humilhação pública","Vídeo|Discurso","Risadas","Cancelamento","Humilhação|Raiva","*Me escondo?*","Vingativo","Estima.","Resiliente","Superar."),
E8("Falar a verdade e não ser acreditada","Denúncia|Relato de violência","Dúvida dos outros","Isolamento","Indignação|Mágoa","*Desisto?*","Amargurado","Estima.","Persistente|Corajoso","Ser enfim ouvida.")
);
G[4].itens.push(
E8("Incêndio","Em casa|No trabalho","Fumaça|Fuga","Mortes|Perdas","Pavor|Desespero","*Salvo o quê?*","Impulsivo","Fisiológicas e segurança.","Corajoso|Calmo","Reconstruir."),
E8("Desastre natural","Enchente|Deslizamento|Seca","Falta de água e luz","Mortes|Perder a casa","Medo|Desespero","*Fico ou vou?*","Pessimista","Fisiológicas.","Solidário|Resiliente","Reconstrução coletiva."),
E8("Criminoso solto","Agressor libertado","Medo constante","Ataque","Medo|Raiva","*Mudo de cidade?*","Paranoico","Segurança.","Corajoso|Protetor","Recuperar o controle."),
E8("Ser envenenada","Comida contaminada|Ataque intencional","Sintomas","Morte","Medo|Paranoia","*Quem fez isso?*","Paranoico","Segurança.","Perspicaz","Descobrir a verdade."),
E8("Ficar presa","Elevador|Desabamento|Porta trancada","Pânico","Morte","Pavor|Desespero","*Vou sair?*","Alarmista","Fisiológicas.","Calmo|Engenhoso","Encontrar saída."),
E8("Enfrentar uma ameaça desarmada","Assalto|Animal","Fuga|Negociação","Ferimentos","Medo|Determinação","*Reajo?*","Imprudente","Segurança.","Calmo|Engenhoso","Sobreviver."),
E8("Guerra ou conflito armado","Viver em zona de conflito","Toque de recolher","Mortes","Medo|Desespero","*Fujo?*","Pessimista","Fisiológicas.","Resiliente|Protetor","Sobrevivência e solidariedade."),
E8("Intimidação de testemunha","Ameaças","Medo","Morte","Medo|Indignação","*Testemunho?*","Covarde","Segurança.","Corajoso|Justo","Fazer justiça.")
);
G[5].itens.push(
E8("Fobia","Medo de altura|De lugares fechados|De água","Evitações","Perder oportunidades","Medo|Vergonha","*Enfrento?*","Inseguro","Segurança.","Corajoso|Persistente","Administrar o medo."),
E8("Problema de saúde","Diagnóstico|Doença crônica","Consultas|Exames","Morte|Incapacidade","Medo|Raiva","*Por que eu?*","Pessimista","Fisiológicas.","Resiliente|Disciplinado","Reavaliar prioridades."),
E8("Memória reprimida que volta","Trauma esquecido","Pesadelos","Crise","Choque|Medo","*Foi real?*","Defensivo","Segurança.","Corajoso","Buscar ajuda e cura."),
E8("Plano que muda","Viagem cancelada|Casamento adiado","Reorganização","Frustração|Prejuízo","Frustração|Decepção","*E agora?*","Inflexível","Segurança.","Adaptável","Improvisar."),
E8("Crise de fé","Perda|Escândalo religioso","Dúvidas","Isolamento","Confusão|Tristeza","*Ainda acredito?*","Cínico","Autorrealização.","Espiritualizado|Curioso","Reconstruir crenças."),
E8("Poderes indesejados","Habilidade sobrenatural|Dom que assusta","Esconder","Exposição|Perigo","Medo|Curiosidade","*Uso ou escondo?*","Inseguro","Pertencimento.","Corajoso|Responsável","Aceitar quem é."),
E8("Infiltrar-se num grupo","Investigação|Missão","Mentiras","Ser descoberta","Ansiedade|Culpa","*Quem sou eu de verdade?*","Mentiroso","Segurança.","Perspicaz|Corajoso","Cumprir a missão sem se perder."),
E8("Exaustão física","Plantões|Trabalho pesado","Erros","Colapso","Cansaço|Frustração","*Paro?*","Viciado em trabalho","Fisiológicas.","Disciplinado","Aprender a descansar."),
E8("Pensamentos de desistir de tudo","Desesperança prolongada","Isolamento|Mudanças de comportamento","Risco à vida","Desespero|Solidão","*Alguém se importa?*","Pessimista","Todas as necessidades.","Resiliente","Pedir ajuda e ser acolhida.","Trate com muito cuidado: mostre sinais e caminhos de ajuda, nunca métodos. O CVV atende pelo 188, 24 horas.")
);
})();
