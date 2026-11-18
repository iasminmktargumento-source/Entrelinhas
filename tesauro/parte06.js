// PARTE 6 — FERIDAS EMOCIONAIS (configuração e introdução)
window.E6=(nome,nota,ex,nec,crencas,medos,resp,tracos,gat,sup)=>({nome,nota,ex,nec,crencas,medos,resp,tracos,gat,sup});
GUIA.add({
n:6,
chamada:"Situações dolorosas comuns à experiência humana e o que deixam para trás: crenças falsas, medos, mudanças de personalidade e caminhos de cura.",
campos:[
 {k:"nota",l:"Notas",t:"texto"},
 {k:"ex",l:"Exemplos",t:"lista"},
 {k:"nec",l:"Necessidades básicas comprometidas",t:"chips"},
 {k:"crencas",l:"Crenças falsas que a personagem pode adotar",t:"lista"},
 {k:"medos",l:"A personagem pode temer…",t:"lista"},
 {k:"resp",l:"Respostas e consequências possíveis",t:"lista"},
 {k:"tracos",l:"Traços que podem surgir",t:"links"},
 {k:"gat",l:"Gatilhos que podem reabrir a ferida",t:"lista"},
 {k:"sup",l:"Oportunidades para enfrentar a ferida",t:"dica"}
],
tituloEntradas:"As feridas",
notaEntradas:"em sete grupos",
teoria:[
{t:"Antes de começar: cuide de você",html:`
<p>Esta parte trata de experiências dolorosas: perdas, violência, abandono, traição. O objetivo é ajudar a entender como uma ferida molda ==qualquer personagem do elenco==, da protagonista ao vilão, passando pela mentora e pelo interesse amoroso.</p>
<div class="quadro"><span class="q">Aviso importante</span><p>Este guia é uma ferramenta de escrita e não substitui ajuda psicológica. Ler e escrever sobre trauma pode mexer com as suas próprias feridas. Faça pausas, escreva em dias em que estiver bem e procure apoio se precisar. No Brasil, o CVV atende de graça pelo telefone 188, 24 horas por dia, e também pelo site cvv.org.br.</p></div>
<p>Os temas mais pesados (violência sexual, abuso na infância, violência doméstica) estão descritos ==pelos efeitos na personagem==, nunca pelos atos. É isso que serve à escrita.</p>`},
{t:"A ficção como espelho",html:`
<p>Histórias não servem só para entreter. Elas mostram como outras pessoas atravessam o medo, a dúvida e a mudança. Quando uma personagem carrega uma dor parecida com a nossa e encontra um caminho, o leitor ganha <mark>contexto e esperança</mark>.</p>
<p>De todas as jornadas possíveis, a que mais conecta é a da personagem que vai de ferida a inteira. ==Todo mundo carrega alguma dor==, e por isso todo mundo reconhece essa jornada.</p>`},
{t:"O que é uma ferida emocional",html:`
<p>Uma ferida é uma experiência negativa que causa dor em nível psicológico profundo e deixa memórias que a personagem não quer reviver. Pode nascer de três formas:</p>
<ul><li><b>Um acontecimento único:</b> um acidente, uma traição.</li><li><b>Episódios repetidos:</b> críticas constantes de um pai, bullying diário.</li><li><b>Uma situação prolongada:</b> pobreza, negligência, doença na família.</li></ul>
${FLUXO([["Ferida","a dor"],["Mentira","o porquê falso"],["Medo","não de novo"],["Armadura","as defesas"],["Vazio","o que falta"]])}
<h4>A mentira</h4><p>Depois da dor, a mente procura uma explicação. Como não pode controlar os outros nem mudar o passado, ela olha para dentro e encontra um “defeito”: <em>aconteceu porque eu sou fraca, porque confiei demais, porque não sou suficiente</em>. A mentira pode ser sobre si (*há algo errado comigo*) ou sobre o mundo (*todo mundo mente*).</p>
<h4>O medo</h4><p>A personagem passa a temer que aquilo se repita. Esse medo filtra todas as decisões dela (a parte 11 trata dos medos em detalhe).</p>
<h4>A armadura emocional</h4><p>Para se proteger, ela abandona qualidades que agora parecem perigosas (a confiança, a abertura) e adota defeitos que parecem proteger (a desconfiança, a frieza). ==A armadura protege, mas também prende.==</p>`},
{t:"As consequências da ferida",html:`
<ul>
<li><b>Como ela se vê:</b> a autoestima encolhe.</li>
<li><b>Mudanças de personalidade:</b> qualidades abandonadas por parecerem fraquezas e, às vezes, qualidades novas (quem perdeu tudo pode ficar mais grata, mais compassiva).</li>
<li><b>O que passa a importar:</b> segurança vira prioridade; outras coisas são sacrificadas.</li>
<li><b>Relações e comunicação:</b> distância, controle, silêncio.</li>
<li><b>Sensibilidades emocionais:</b> emoções que ela evita e emoções que a atingem com força desproporcional (veja a parte 1).</li>
<li><b>Código moral:</b> a ferida pode endurecer ou afrouxar o que a personagem considera aceitável.</li>
</ul>`},
{t:"Estudo de caso: Rita",html:`
<div class="cena">Aos catorze anos, Rita apresentou um poema no sarau da escola, em Anápolis. Um grupo de colegas gravou, editou com risadas e espalhou. Durante meses ela foi “a poetisa”.</div>
<ul>
<li><b>Mentira:</b> <em>se eu mostrar o que sinto, vão rir de mim</em>.</li>
<li><b>Medo:</b> humilhação pública.</li>
<li><b>Armadura:</b> virou a pessoa sarcástica, que ri primeiro de tudo. Nunca mais escreveu nada que não fosse relatório.</li>
<li><b>Relações:</b> namoros curtos, amizades que não passam da superfície.</li>
<li><b>Vazio:</b> aos trinta anos, trabalha numa agência de publicidade, é ótima no que faz e sente que ninguém a conhece. A necessidade não atendida é de ==pertencimento e de autorrealização==.</li>
<li><b>A virada:</b> a agência precisa de alguém para escrever o texto de uma campanha de saúde mental. O chefe lembra de um poema que viu num caderno dela.</li>
</ul>`},
{t:"O gatilho da mudança: necessidades não atendidas",html:`
${PIRAMIDE()}
<p>Quando uma necessidade fica sem resposta por muito tempo, o vazio cresce. A personagem pode sacrificar uma necessidade por outra (abrir mão de amor para ter segurança), mas em algum momento chega ao ==ponto de ruptura==: o vazio fica maior do que o medo, e ela age.</p>
<p>É esse ponto que move a história. Cada entrada desta parte indica quais necessidades a ferida costuma comprometer.</p>`},
{t:"O arco de personagem",html:`
<h4>Três tipos de arco</h4>
<ul><li><b>Arco de mudança:</b> a personagem enfrenta a ferida, solta a mentira e cresce.</li><li><b>Arco estático:</b> ela já é inteira e ajuda os outros a mudar.</li><li><b>Arco fracassado:</b> ela não consegue soltar a ferida e regride. É o caminho de muitos anti-heróis e tragédias.</li></ul>
<h4>Os quatro pilares</h4>
<p>Motivação externa (o que ela quer), motivação interna (por que quer), conflito externo (o que se opõe) e conflito interno (o medo e a mentira).</p>
<h4>A jornada de soltar</h4>
<ol><li>Pequenas vitórias mostram que outro caminho é possível.</li><li>O fundo do poço: o jeito antigo falha de vez.</li><li>A personagem enxerga a ferida com outros olhos.</li><li>Troca a mentira por uma crença que fortalece.</li></ol>
<h4>Práticas que ajudam na cura</h4>
<ul>
<li><b>Assumir a responsabilidade</b> pelo próprio caminho e imaginar outra realidade.</li>
<li><b>Metas pequenas e alcançáveis:</b> cada vitória fortalece a autoestima.</li>
<li><b>Bons hábitos:</b> cuidar do corpo, afastar-se de pessoas tóxicas, buscar atividades novas, fazer terapia.</li>
<li><b>Um paraquedas para os tropeços:</b> perceber a espiral negativa, lembrar do que deu certo, dar um tempo, ajudar alguém, desabafar, usar o humor.</li>
<li><b>Um plano de ação</b> mantido mesmo quando fica difícil.</li>
</ul>`},
{t:"A jornada do vilão",html:`
<p>O vilão também tem ferida, mentira, medo e armadura. As diferenças:</p>
<ul><li>Ele ==convive com a necessidade não atendida== em vez de enfrentá-la.</li><li>Culpa os outros ou mergulha na autoaversão.</li><li>Persegue a motivação errada, e seus limites morais ficam muito mais distantes que os da heroína.</li><li>O arco dele quase nunca se completa dentro da história.</li></ul>
<p>Quando há redenção, ela costuma ser rápida e envolver um sacrifício.</p>`},
{t:"Como escolher a ferida da personagem",html:`
<h4>Pistas para investigar</h4>
<p>Pessoas que a marcaram, memórias ruins, defeitos, medos, necessidades não atendidas, segredos, inseguranças, preconceitos, compensações exageradas e comportamentos que a prejudicam. Cada uma aponta para uma ferida.</p>
<h4>As sete categorias</h4>
<div class="tab-wrap"><table><thead><tr><th>Categoria</th><th>Efeito típico</th></tr></thead><tbody>
<tr><td>Crime e vitimização</td><td>Sensação de ter sido violada; o mundo deixa de ser seguro.</td></tr>
<tr><td>Deficiências e marcas físicas</td><td>Sensação de “ser menos”.</td></tr>
<tr><td>Fracassos e erros</td><td>“Eu errei” vira “eu sou um erro”.</td></tr>
<tr><td>Injustiça e dificuldades</td><td>Desilusão com o mundo e com as instituições.</td></tr>
<tr><td>Confiança traída</td><td>Desconfiança do próprio julgamento.</td></tr>
<tr><td>Feridas da infância</td><td>As mais profundas, porque moldam a base da personalidade.</td></tr>
<tr><td>Acontecimentos traumáticos</td><td>Perguntas sem resposta: por quê?</td></tr>
</tbody></table></div>
<div class="quadro"><span class="q">Sobre o TEPT</span><p>O transtorno de estresse pós-traumático é uma condição real, que se manifesta de forma diferente em cada pessoa. Se a sua personagem tiver TEPT, pesquise com seriedade e evite atalhos dramáticos.</p></div>
<p>Escolha ==uma ferida central==, o gargalo da dor. Outras feridas podem existir, mas uma orienta o planejamento.</p>`},
{t:"Fatores que aprofundam a ferida",html:`
<ul><li>A personalidade anterior da personagem.</li><li>A proximidade física com o acontecimento.</li><li>A responsabilidade, real ou imaginada. A culpa real pode reduzir a empatia do leitor, então mostre o arrependimento.</li><li>A rede de apoio, ou a falta dela.</li><li>A repetição.</li><li>Acontecimentos que se somam.</li><li>Quanto o ataque foi pessoal.</li><li>A proximidade emocional com quem causou o dano.</li><li>O estado emocional no momento.</li><li>Se houve justiça ou não.</li></ul>`},
{t:"Como revelar a ferida",html:`
<h4>Três estratégias</h4>
<ul><li><b>A grande revelação:</b> mostrar tudo de uma vez, num flashback ou numa conversa.</li><li><b>O grande mistério:</b> espalhar pistas até a revelação final.</li><li><b>A trilha de migalhas:</b> pequenas pistas ao longo da história. Combine com as outras.</li></ul>
<h4>Migalhas possíveis</h4>
<ul><li>Medo e evitação de certos lugares ou pessoas.</li><li>Insegurança em situações específicas.</li><li>Reações exageradas ou fracas demais para o jeito da personagem.</li><li>Gatilhos sensoriais.</li><li>Emoções negadas.</li><li>Obsessões.</li><li><b>Diálogo:</b> quem sofreu a ferida costuma ser a pior fonte sobre ela. As pessoas próximas sabem mais.</li><li><b>Cenário:</b> objetos, lugares, estações e clima ligados à ferida (veja as partes 4 e 5).</li></ul>
<h4>Mecanismos de defesa</h4>
<div class="tab-wrap"><table><thead><tr><th>Mecanismo</th><th>Como aparece</th></tr></thead><tbody>
<tr><td>Negação</td><td>Recusa o que aconteceu e fica agressiva quando insistem.</td></tr>
<tr><td>Racionalização</td><td>Convence a si e aos outros de que “não foi tão grave”.</td></tr>
<tr><td>Atuação</td><td>Reações exageradas ou fora do habitual, porque não consegue expressar o que sente.</td></tr>
<tr><td>Regressão</td><td>Volta a comportamentos de outra fase da vida diante de um gatilho.</td></tr>
<tr><td>Dissociação</td><td>Desliga-se do corpo ou das emoções; lacunas de memória.</td></tr>
<tr><td>Projeção</td><td>Vê nos outros os rótulos que recebeu.</td></tr>
<tr><td>Deslocamento</td><td>Desconta em alguém “mais seguro” o que sente por outra pessoa.</td></tr>
<tr><td>Repressão</td><td>Apaga ou distorce memórias.</td></tr>
<tr><td>Compensação</td><td>Exagera uma força para provar que a fraqueza não existe.</td></tr>
</tbody></table></div>
<p>Escolha ==um mecanismo principal== e use-o de forma consistente, para o leitor ligar os pontos.</p>`},
{t:"Problemas a evitar",html:`
<ul>
<li><b>Despejo de informação:</b> parar a história para contar o passado. Enxugue ao essencial e revele uma peça por vez, combinando diálogo, gatilho e emoção.</li>
<li><b>Flashback mal posicionado:</b> cedo demais, interrompe uma história em que o leitor ainda não entrou. Ancore-o numa cena crítica do presente.</li>
<li><b>Prólogo mal usado:</b> verifique se a revelação não pode vir depois; crie empatia antes da tragédia; suavize o salto de tempo dentro do texto.</li>
<li><b>Ferida pouco convincente:</b> ela precisa estar ligada ao defeito fatal, motivar escolhas e atrapalhar várias áreas da vida.</li>
<li><b>Cura rápida demais:</b> a superação deve atravessar a história inteira.</li>
</ul>
<div class="quadro"><span class="q">Traumas pesados</span><p>Em temas como violência sexual, pistas antecipadas e um ponto de vista mais distante protegem leitores que viveram algo parecido. Respeito com quem lê também é técnica.</p></div>`}
],
grupos:[{nome:"Crime e vitimização",itens:[]},{nome:"Deficiências e marcas físicas",itens:[]},{nome:"Fracassos e erros",itens:[]},{nome:"Injustiça e dificuldades",itens:[]},{nome:"Confiança traída",itens:[]},{nome:"Feridas da infância",itens:[]},{nome:"Acontecimentos traumáticos",itens:[]}]
});
