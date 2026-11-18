// PARTE 1 — EMOÇÕES (configuração, introdução e emoções de A)
window.E1=(nome,def,fis,int,men,agu,rep,evo,reg,ver,dica,nota)=>({nome,def,nota,fis,int,men,agu,rep,evo,reg,ver,dica});
GUIA.add({
n:1,
chamada:"94 emoções com os sinais do corpo, as sensações por dentro e os pensamentos de quem sente. Para escrever a emoção sem precisar dizer o nome dela.",
campos:[
 {k:"def",l:"Definição",t:"texto"},
 {k:"nota",l:"Notas",t:"texto"},
 {k:"fis",l:"Sinais físicos e comportamentos",t:"lista"},
 {k:"int",l:"Sensações internas",t:"lista"},
 {k:"men",l:"Reações mentais",t:"lista"},
 {k:"agu",l:"Sinais de emoção aguda ou prolongada",t:"lista"},
 {k:"rep",l:"Sinais de emoção reprimida",t:"lista"},
 {k:"evo",l:"Pode evoluir para",t:"links",p:1},
 {k:"reg",l:"Pode regredir para",t:"links",p:1},
 {k:"ver",l:"Verbos de ação associados",t:"chips"},
 {k:"dica",l:"Dica de escrita",t:"dica"}
],
tituloEntradas:"As 94 emoções",
notaEntradas:"em ordem alfabética",
teoria:[
{t:"Por que mostrar, e não contar",html:`
<p>Quando um texto diz “ela ficou com raiva”, o leitor recebe uma informação. Quando o texto mostra a mão que aperta a alça da bolsa até os dedos ficarem brancos, o leitor vive a cena. Essa é a diferença entre <mark>contar</mark> e <mark>mostrar</mark>: no primeiro caso a autora faz o trabalho pelo leitor; no segundo, o leitor junta as pistas e chega sozinho à conclusão. É esse pequeno esforço que cria envolvimento.</p>
<p>O diálogo ajuda, porque revela o que a personagem pensa e quer. Mas ninguém diz tudo o que sente. A maior parte da emoção humana escapa pelo corpo, pelo silêncio, pelo que a pessoa faz com as mãos enquanto fala. Uma cena só com falas fica plana. ==A emoção completa precisa da comunicação não verbal.==</p>
<div class="quadro"><span class="q">Teste rápido</span><p>Procure no seu rascunho palavras como <em>triste, nervosa, irritada, feliz, com medo</em>. Cada uma é um convite para trocar a etiqueta por um gesto, uma sensação ou um pensamento. Nem sempre vale a troca, mas toda vez vale a pergunta.</p></div>`},
{t:"As três camadas de uma emoção",html:`
<p>Cada entrada deste guia organiza a emoção em três camadas. Usar só uma delas deixa a cena repetitiva; combinar duas costuma bastar.</p>
<h4>1. Sinais físicos e comportamentos</h4>
<p>Tudo o que outra pessoa poderia observar: postura, expressão, voz, ritmo da fala, o que a personagem faz com objetos, como ocupa o espaço. Quanto mais forte a emoção, mais o corpo reage e ==menos a pessoa consegue controlar o que mostra==. E como cada personagem tem seu jeito, as combinações possíveis são praticamente infinitas.</p>
<h4>2. Sensações internas (respostas viscerais)</h4>
<p>O que só a personagem sente: coração acelerado, estômago que afunda, calor no rosto, pernas moles. São as reações mais poderosas, porque todo leitor as reconhece no próprio corpo. Por isso mesmo pedem cuidado.</p>
<ul><li>==Use pouco.== Em excesso, viram melodrama.</li><li>O repertório é limitado (o coração só consegue acelerar de tantos jeitos), então caem fácil no clichê.</li><li>Funcionam melhor em primeira pessoa ou terceira pessoa próxima. Se a cena é narrada pelos olhos de outra personagem, fique nos sinais físicos.</li></ul>
<h4>3. Reações mentais (pensamentos)</h4>
<p>Mostram como a personagem enxerga o mundo e como pessoas, lugares e fatos mexem com ela. Pensamentos de verdade nem sempre são racionais: pulam de um assunto a outro, exageram, se contradizem. É a camada que mais constrói ==a voz do narrador==.</p>`},
{t:"Como ler cada entrada",html:`
<p>Todas as emoções seguem a mesma estrutura, para você achar rápido o que precisa:</p>
<div class="tab-wrap"><table><thead><tr><th>Campo</th><th>Para que serve</th></tr></thead><tbody>
<tr><td>Definição</td><td>Situa a emoção e a separa das vizinhas. Às vezes vem com uma nota.</td></tr>
<tr><td>Sinais físicos e comportamentos</td><td>Gestos, expressões, falas e atitudes observáveis. É a lista mais longa.</td></tr>
<tr><td>Sensações internas</td><td>O que acontece dentro do corpo.</td></tr>
<tr><td>Reações mentais</td><td>Pensamentos, impulsos e distorções de percepção.</td></tr>
<tr><td>Aguda ou prolongada</td><td>O que aparece quando a emoção fica muito intensa ou dura muito tempo.</td></tr>
<tr><td>Reprimida</td><td>Sinais de quem tenta esconder o que sente. Ótimo para subtexto.</td></tr>
<tr><td>Pode evoluir para</td><td>Para onde a emoção vai se a situação piora ou se prolonga.</td></tr>
<tr><td>Pode regredir para</td><td>Para onde ela vai quando ==perde força==. Pode ser um estado mais brando e bom (admiração que vira contentamento) ou o que sobra quando ela se desfaz (adoração que esfria em decepção).</td></tr>
<tr><td>Verbos de ação</td><td>Um banco de verbos para escrever a cena sem nomear o sentimento.</td></tr>
<tr><td>Dica de escrita</td><td>Uma orientação prática, às vezes sobre a emoção, às vezes sobre a cena.</td></tr>
</tbody></table></div>
<p>Os nomes coloridos em “Pode evoluir para” e “Pode regredir para” são links. Siga-os para planejar a <mark>curva emocional</mark> de uma cena inteira.</p>`},
{t:"Calibrar a intensidade",html:`
<p>A mesma emoção pode ser um incômodo de dois segundos ou algo que domina a semana inteira. Antes de escolher os sinais, pergunte:</p>
<ul><li><b>Quanto a personagem tem em jogo?</b> Quanto maior o risco, maior a reação.</li><li><b>Ela é expansiva ou contida?</b> Uma pessoa contida e uma expansiva demonstram a mesma raiva de jeitos muito diferentes.</li><li><b>Quem está olhando?</b> Muita gente mostra uma coisa na frente do chefe e outra sozinha no carro.</li><li><b>Há quanto tempo isso dura?</b> Emoções prolongadas mudam o corpo e a rotina: sono, apetite, cuidado com a aparência.</li></ul>
<div class="quadro"><span class="q">Escada emocional</span><p>Emoções crescem por degraus. Pular de irritação direto para fúria, sem provocação que justifique, soa falso. Para uma cena convincente, suba um degrau por vez: <em>irritação → frustração → raiva → fúria</em>. Os campos “Pode evoluir para” ajudam a montar essa escada.</p></div>`},
{t:"A emoção escondida",html:`
<p>Na vida real, passamos boa parte do tempo controlando o que mostramos. Personagens também. A emoção reprimida é uma das ferramentas mais ricas da ficção, porque cria <mark>subtexto</mark>: o leitor percebe o que as outras personagens não percebem.</p>
<p>Para mostrar uma emoção escondida, combine um exterior controlado com uma pista que vaza:</p>
<ul><li>A fala é calma, mas a perna não para de balançar debaixo da mesa.</li><li>O sorriso aparece um segundo atrasado.</li><li>A personagem muda de assunto rápido demais.</li><li>Um pensamento contradiz o que ela acabou de dizer em voz alta.</li></ul>
<p>==Ninguém disfarça cem por cento.== O controle sempre falha em algum ponto, e é esse ponto que o leitor precisa ver.</p>`},
{t:"Emoções vizinhas",html:`
<p>Algumas emoções do guia são parecidas. Escolher a palavra exata ajuda a escolher os sinais certos. Estas são as famílias mais próximas:</p>
<div class="tab-wrap"><table><thead><tr><th>Família</th><th>A diferença</th></tr></thead><tbody>
<tr><td>Apreensão · Inquietação · Cautela · Temor</td><td><b>Inquietação</b> é um desconforto vago, sem causa clara. <b>Apreensão</b> é o receio de que algo específico dê errado. <b>Cautela</b> é a atitude de se proteger, mais racional. <b>Temor</b> é o pavor antecipado de algo que parece inevitável.</td></tr>
<tr><td>Irritação · Aborrecimento · Raiva · Fúria</td><td><b>Aborrecimento</b> e <b>irritação</b> são incômodos pequenos (o primeiro mais cansado, o segundo mais espinhoso). <b>Raiva</b> é a reação plena a uma ofensa. <b>Fúria</b> é a raiva fora de controle.</td></tr>
<tr><td>Arrependimento · Remorso · Culpa</td><td><b>Arrependimento</b> é desejar ter feito diferente. <b>Culpa</b> é saber que errou com alguém. <b>Remorso</b> é a culpa que corrói e não dá trégua, quase sempre com desejo de reparação.</td></tr>
<tr><td>Arrogância · Presunção · Orgulho</td><td><b>Orgulho</b> pode ser saudável. <b>Presunção</b> é a satisfação convencida de quem acha que já ganhou. <b>Arrogância</b> é a superioridade imposta aos outros.</td></tr>
<tr><td>Desdém · Desprezo · Nojo · Ódio</td><td><b>Desdém</b> é desconsiderar. <b>Desprezo</b> é rebaixar alguém por julgá-lo indigno. <b>Nojo</b> é repulsa física ou moral. <b>Ódio</b> é aversão intensa e duradoura, com desejo de que o outro sofra.</td></tr>
<tr><td>Dúvida · Incerteza · Indecisão · Ambivalência</td><td><b>Dúvida</b> é não acreditar por completo. <b>Incerteza</b> é não saber o que vai acontecer. <b>Indecisão</b> é não conseguir escolher. <b>Ambivalência</b> é sentir duas coisas opostas ao mesmo tempo.</td></tr>
<tr><td>Tristeza · Desânimo · Depressão · Luto</td><td><b>Tristeza</b> é a dor da perda ou da frustração. <b>Desânimo</b> é a falta de energia para seguir. <b>Depressão</b>, aqui, é o estado de tristeza profunda e prolongada. <b>Luto</b> é a dor específica da perda de alguém ou de algo essencial.</td></tr>
</tbody></table></div>`},
{t:"Erros comuns",html:`
<ul>
<li><b>Nomear e mostrar ao mesmo tempo.</b> “Ela ficou nervosa e roeu as unhas.” O gesto já disse tudo; corte a etiqueta.</li>
<li><b>Repetir os mesmos sinais.</b> Se todo mundo no livro “prende a respiração”, o leitor nota. Varie entre as três camadas e dê a cada personagem os seus tiques.</li>
<li><b>Reações desproporcionais.</b> Desmaiar por causa de um susto pequeno só funciona se o leitor sabe por que aquela personagem reage assim.</li>
<li><b>Visceral demais.</b> Coração disparado, estômago revirado e garganta fechada na mesma frase é excesso. Escolha um.</li>
<li><b>Esquecer o ponto de vista.</b> Se a narração está na cabeça da Ana, você não pode mostrar o que o Pedro sente por dentro, só o que ela observa nele.</li>
<li><b>Emoção sem gatilho.</b> O leitor precisa ver o que provocou a reação, mesmo que seja uma pista sutil.</li>
</ul>
<div class="quadro"><span class="q">Lembrete</span><p>Este guia é ponto de partida, não fórmula. O melhor sinal é sempre o que só a <em>sua</em> personagem faria.</p></div>`}
],
grupos:[{nome:"A",itens:[]},{nome:"C",itens:[]},{nome:"D",itens:[]},{nome:"E a F",itens:[]},{nome:"G a I",itens:[]},{nome:"L a O",itens:[]},{nome:"P a R",itens:[]},{nome:"S a V",itens:[]}]
});

GUIA.partes[1].grupos[0].itens.push(
E1("Aborrecimento","Incômodo cansado diante de algo repetitivo, chato ou que atrapalha, sem chegar a ser raiva.",
"Suspirar alto, de propósito|Revirar os olhos discretamente|Apoiar o queixo na mão|Responder com monossílabos|Tamborilar os dedos na mesa|Olhar o celular no meio da conversa|Bocejar sem disfarçar|Fazer “aham” sem ouvir de verdade|Arrastar os pés ao andar|Soltar o ar pelo nariz|Encostar a cabeça na parede ou no vidro do ônibus|Repetir a mesma frase com tom mais seco|Fazer careta de canto de boca|Largar o que está fazendo com um baque leve|Desligar a TV ou fechar o notebook com força",
"Peso nas pálpebras|Leve tensão na testa|Vontade de se espreguiçar|Inquietação nas pernas",
"*De novo isso?*|Contar mentalmente quanto falta para acabar|Fantasiar estar em outro lugar|Implicar com detalhes que antes nem notava|Achar todo mundo mais lento do que o normal",
"Explodir por um motivo pequeno|Sair do lugar sem se despedir|Passar a evitar a pessoa ou a situação|Ironia constante",
"Sorriso educado e travado|Dizer *tudo bem, sem problema* com voz monótona|Concordar rápido para encerrar o assunto|Ocupar as mãos com qualquer coisa",
"Irritação|Impaciência|Frustração|Tédio","Indiferença|Calma",
"bufar, resmungar, revirar, encostar, bocejar, arrastar, desligar, interromper, cortar, ignorar",
"Aborrecimento é ótimo para mostrar a ==personalidade== de quem sente. Repare no que irrita a sua personagem: o vizinho que arrasta móveis, a colega que fala alto no telefone. O que aborrece alguém revela o que essa pessoa valoriza."),

E1("Aceitação","Parar de lutar contra uma realidade e reconhecê-la como ela é, com mais paz do que derrota.",
"Respirar fundo e soltar devagar|Assentir com a cabeça, sem pressa|Ombros que relaxam aos poucos|Olhar direto para o problema, sem desviar|Parar de discutir|Guardar objetos ligados ao que passou|Falar do assunto com voz firme e baixa|Pedir conselhos sobre os próximos passos|Fazer planos práticos|Ser honesta com os outros sobre o que aconteceu|Retomar pequenas rotinas|Ajudar quem ainda está abalado|Sorrir de leve ao lembrar|Assinar, entregar ou devolver algo que vinha adiando",
"Sensação de peso saindo do peito|Respiração mais lenta e profunda|Cansaço calmo, como depois de chorar|Corpo mais leve",
"*É o que é.*|Pensar no que ainda depende dela|Lembrar do passado sem se ferir tanto|Perdoar a si ou ao outro|Redefinir prioridades",
"Serenidade que surpreende quem está em volta|Mudanças concretas de vida|Disposição para recomeçar|Ajudar outras pessoas a passar pelo mesmo",
"Dizer que está tudo bem antes de estar|Calma que parece ensaiada|Evitar o assunto em público mas falar dele sozinha",
"Calma|Contentamento|Gratidão|Determinação","Resignação|Dúvida|Relutância|Arrependimento",
"assentir, soltar, aceitar, entregar, recomeçar, planejar, perdoar, organizar, respirar, seguir",
"Não confunda aceitação com ==resignação==. Na resignação a personagem desiste; na aceitação ela para de brigar com a realidade para conseguir agir. Mostre a diferença pelo que ela faz em seguida."),

E1("Admiração","Respeito caloroso por alguém ou algo considerado excepcional.",
"Olhar fixo e atento|Inclinar o corpo na direção da pessoa admirada|Sorriso que aparece sem querer|Balançar a cabeça devagar, concordando|Fazer perguntas sobre como a pessoa conseguiu|Guardar frases dela para repetir depois|Imitar um gesto, uma roupa ou um jeito de falar|Pedir uma foto ou um autógrafo|Seguir a pessoa nas redes e ler tudo|Anotar no caderno algo que ela disse|Falar dela com brilho nos olhos|Defendê-la quando alguém critica",
"Calor subindo pelo peito|Arrepio ao presenciar um feito marcante|Leveza, uma espécie de entusiasmo calmo|Vontade de se mover, de fazer algo",
"Comparar-se com a pessoa|*Um dia eu quero fazer isso*|Rever as próprias metas|Notar detalhes que outros não percebem",
"Idealização: não enxergar defeitos|Copiar escolhas de vida da pessoa|Comparações frequentes: *ela faria diferente*|Convites insistentes para estar por perto",
"Elogio seco ou disfarçado de piada|Desviar o olhar quando a pessoa percebe|Fingir indiferença diante dos colegas|Acompanhar tudo de longe",
"Adoração|Amor|Inveja|Determinação","Contentamento|Curiosidade|Satisfação",
"observar, elogiar, imitar, seguir, aprender, defender, homenagear, estudar, citar, aplaudir",
"A admiração mostra ==quem a personagem quer ser==. Use o objeto da admiração como espelho: o que ela admira no outro é o que sente falta em si."),

E1("Adoração","Afeto intenso e devoto, com encantamento, por uma pessoa ou por algo.",
"Olhos brilhando, sorriso largo e demorado|Tocar a pessoa sempre que pode|Acompanhar cada movimento dela com os olhos|Voz mais suave ou cantada|Rir de tudo o que a pessoa diz|Guardar lembranças: bilhetes, ingressos, fotos|Falar dela em toda conversa|Comprar presentes sem data especial|Reorganizar a rotina para estar perto|Defender com unhas e dentes|Suspirar ao ouvir o nome|Decorar gostos e manias do outro|Cuidar de um objeto amado com zelo exagerado",
"Calor no peito|Frio na barriga|Sensação de plenitude|Coração que acelera quando a pessoa chega",
"Achar encantadores até os defeitos|Imaginar o futuro junto|Querer agradar o tempo todo|Ciúme de qualquer atenção dividida",
"Perder a noção de limites|Abrir mão de outras relações|Devoção quase obsessiva|Sofrimento intenso com qualquer afastamento",
"Observar de longe|Ficar vermelha ao ouvir o nome|Fingir desinteresse e depois procurar notícias|Guardar lembranças escondidas",
"Amor|Desejo|Ciúme|Saudade","Admiração|Ambivalência|Decepção|Constrangimento",
"contemplar, mimar, presentear, guardar, idolatrar, proteger, acariciar, seguir, suspirar, venerar",
"O alvo da adoração pode ser uma pessoa, um animal, uma banda, um time ou um objeto. Quando é um objeto, mostre o ==ritual de cuidado==: o jeito de limpar, guardar, exibir."),

E1("Agitação","Perturbação física e mental que impede a personagem de ficar quieta ou pensar com clareza.",
"Andar de um lado para o outro|Balançar a perna, tamborilar os dedos|Passar a mão no cabelo várias vezes|Falar rápido e atropelado|Começar frases e não terminar|Derrubar ou esquecer coisas|Levantar e sentar de novo|Mexer em objetos sem motivo|Abanar-se, afrouxar a gola|Olhar para todos os lados|Responder antes de ouvir a pergunta inteira|Tropeçar nas palavras e corrigir|Abrir e fechar a mesma gaveta|Mudar de ideia no meio da ação",
"Energia sobrando nos músculos|Respiração curta|Calor no rosto e no pescoço|Pulsação nas têmporas",
"Pensamentos saltando de um assunto a outro|Dificuldade de focar|*Calma, calma*|Irritação com barulhos e demoras|Um erro puxando outro",
"Explosões repentinas|Sair do ambiente sem explicação|Insônia|Brigas com quem tenta acalmar",
"Mãos presas entre os joelhos|Mandíbula travada|Sorriso tenso|Respostas curtas demais",
"Ansiedade|Irritação|Frustração|Raiva","Inquietação|Calma",
"andar, balançar, tamborilar, derrubar, atropelar, levantar, gesticular, tropeçar, interromper, remexer",
"Para intensificar a agitação, ==coloque obstáculos pequenos== no caminho: a chave que não entra, a fila que não anda, o celular sem sinal. Cada tropeço aumenta a pressão."),

E1("Alívio","Descarga de tensão quando uma ameaça, dúvida ou peso deixa de existir.",
"Soltar o ar longamente|Ombros que descem de uma vez|Fechar os olhos por um instante|Encostar-se na parede ou sentar de repente|Risada nervosa|Choro inesperado|Levar a mão ao peito|Abraçar a primeira pessoa que aparece|Rir de algo que nem tem graça|Agradecer várias vezes|Ligar para alguém contando a notícia|Tirar o sapato, afrouxar a roupa|Comer com vontade depois de dias sem fome",
"Pernas bambas|Coração desacelerando aos poucos|Sensação de peso saindo das costas|Leve tontura",
"*Acabou.*|Repassar o que poderia ter dado errado|Gratidão repentina|Vontade de comemorar",
"Desabar de cansaço|Dormir por horas|Chorar sem parar|Prometer mudar de vida",
"Soltar o ar só pelo nariz|Relaxar só as mãos|Mudar de assunto rápido|Disfarçar o sorriso",
"Gratidão|Felicidade|Euforia|Calma","Contentamento|Calma",
"suspirar, desabar, soltar, sentar, rir, chorar, abraçar, agradecer, relaxar, respirar",
"O alívio só tem força se o leitor sentiu a ==tensão antes==. Se a cena anterior foi leve, o alívio não convence. Construa a pressão primeiro."),

E1("Amargura","Ressentimento antigo e cristalizado, misturado com desencanto.",
"Boca curvada para baixo|Riso curto e sem alegria|Comentários ácidos|Braços cruzados|Olhar de esguelha|Recusar ajuda e gentilezas|Reclamar do passado|Desmerecer a alegria dos outros|Prever sempre o pior|Tom de voz sarcástico|Guardar mágoas antigas e citá-las|Afastar-se de comemorações",
"Gosto amargo na boca|Peso constante no peito|Cansaço que não passa|Tensão na mandíbula",
"Remoer injustiças antigas|Esperar o pior das pessoas|*Ninguém faz nada de graça*|Comparar a própria sorte com a dos outros",
"Isolamento|Hostilidade aberta|Sabotar a felicidade alheia|Doenças ligadas ao estresse",
"Sorriso forçado|Elogios vazios|Silêncio longo antes de responder|Ironia disfarçada de brincadeira",
"Ressentimento|Desprezo|Ódio|Solidão","Mágoa|Tristeza|Resignação",
"resmungar, criticar, desdenhar, recusar, remoer, ironizar, afastar, desconfiar, rebaixar, culpar",
"Amargura quase sempre tem ==raízes no passado==. Uma única cena de lembrança, bem colocada, pode explicar anos de amargura e gerar compaixão do leitor."),

E1("Ambivalência","Sentir duas emoções opostas ao mesmo tempo sobre a mesma coisa.",
"Começar uma ação e parar no meio|Sorriso que se desfaz rápido|Aproximar-se e recuar|Responder “sim, mas…”|Morder o lábio|Gestos contraditórios|Ler a mesma mensagem várias vezes sem responder|Fazer listas de prós e contras|Pedir opinião a todo mundo|Mudar de ideia de um dia para o outro",
"Nó no estômago|Sensação de ser puxada em duas direções|Tensão difusa",
"Culpa por não sentir “o certo”|Discussões internas|*Eu quero e não quero*",
"Paralisia|Insônia|Irritação com quem pressiona",
"*Tanto faz*|Risada evasiva|Mudar de assunto",
"Indecisão|Ansiedade|Frustração|Resignação","Dúvida|Incerteza",
"hesitar, oscilar, recuar, adiar, ponderar, vacilar, alternar, consultar, empacar, duvidar",
"A ambivalência é perfeita para ==conflito interno==. Mostre as duas emoções em ações concretas: a mão que segura o convite de casamento do ex e, ao mesmo tempo, procura a lixeira."),

E1("Amor","Afeto profundo e duradouro, com desejo de bem-estar e de proximidade do outro.",
"Olhar demorado e suave|Toques espontâneos e confortáveis|Corpo voltado para a pessoa, mesmo em grupo|Sorrir ao ouvir a voz dela|Pequenos cuidados: servir primeiro, ajeitar a gola|Lembrar de detalhes do dia do outro|Sincronizar passos e gestos|Fazer sacrifícios sem alarde|Guardar o melhor pedaço para a pessoa|Defender diante de críticas|Ligar só para saber se chegou bem|Dividir planos de futuro",
"Calor no peito|Calma e segurança na presença do outro|Saudade física quando a pessoa está longe",
"Priorizar a felicidade do outro|Imaginar um futuro junto|Preocupação com o bem-estar dele",
"Disposição para arriscar tudo|Medo constante de perder|Dificuldade de existir sem o outro",
"Cuidado disfarçado de implicância|Gestos de afeto “por acaso”|Observar de longe",
"Ternura|Ciúme|Saudade|Luto","Ternura|Contentamento|Gratidão",
"cuidar, abraçar, proteger, acariciar, escutar, perdoar, dividir, apoiar, acompanhar, confiar",
"Amor se mostra melhor nos ==gestos pequenos e repetidos== do que nas declarações. Um café feito do jeito exato que o outro gosta diz mais que “eu te amo”."),

E1("Angústia","Sofrimento opressivo e difuso, como um aperto sem saída clara.",
"Mão no peito ou na garganta|Respiração entrecortada|Olhar perdido|Encolher-se, abraçar os joelhos|Voz que falha|Andar sem rumo|Olhar o celular esperando notícia|Não conseguir comer|Chorar baixinho|Ligar para alguém só para ouvir uma voz",
"Aperto no peito, como se faltasse espaço|Nó na garganta|Estômago revirado",
"Pensamentos circulares sem solução|Sensação de que algo terrível vai acontecer|Dificuldade de se distrair",
"Crise com sensação de sufocamento|Incapacidade de agir|Noites sem dormir",
"Ocupar-se compulsivamente|Sorriso vazio|Silêncio prolongado",
"Desespero|Ansiedade|Tristeza|Depressão","Preocupação|Inquietação",
"apertar, encolher, vagar, esperar, sufocar, chorar, tremer, segurar, ligar, rezar",
"A angústia tem a ver com ==o que ainda não se resolveu==. Mantenha a fonte em aberto (um resultado de exame, uma notícia que não chega) para que ela pese na cena."),

E1("Ansiedade","Apreensão persistente diante de algo incerto ou que ainda vai acontecer.",
"Roer unhas ou cutículas|Checar o celular, o relógio, a porta|Pernas inquietas|Esfregar as mãos suadas na roupa|Falar demais ou de menos|Pigarrear|Fazer a mesma pergunta duas vezes|Revisar a bolsa várias vezes|Chegar muito cedo aos compromissos|Ensaiar falas em voz baixa|Ir ao banheiro com frequência",
"Coração acelerado|Frio no estômago|Ombros e pescoço tensos|Boca seca",
"*E se…?* em looping|Ensaiar conversas mentalmente|Antecipar o pior|Dificuldade de dormir",
"Crise de pânico|Evitar situações|Perda de apetite|Sobrecarga",
"Riso nervoso|Perfeccionismo|Excesso de controle|Perguntas “só para confirmar”",
"Medo|Paranoia|Pavor|Sobrecarga","Preocupação|Nervosismo|Inquietação",
"checar, roer, ensaiar, antecipar, repassar, esfregar, conferir, perguntar, adiar, controlar",
"Ansiedade é sobre ==o futuro==. Deixe a personagem viver na cabeça o cenário que ainda não aconteceu, e corte para a realidade, que quase sempre é diferente."),

E1("Antecipação","Expectativa energizada por algo que está prestes a acontecer.",
"Olhar a porta, o relógio, o celular|Sorriso contido|Esfregar as mãos|Ficar na ponta dos pés|Arrumar-se mais de uma vez|Contar nos dedos|Deixar a mala pronta dias antes|Atualizar a página várias vezes|Comentar o assunto com todo mundo",
"Frio na barriga|Formigamento nas mãos|Tempo que parece andar devagar",
"Imaginar como vai ser|Planejar o que dizer|Dificuldade de focar no presente",
"Não dormir, não comer|Contar os minutos|Irritar-se com qualquer atraso",
"Fingir calma|*Que horas são?* como quem não quer nada",
"Empolgação|Ansiedade|Euforia|Decepção","Curiosidade|Esperança",
"esperar, contar, imaginar, preparar, planejar, conferir, arrumar, atualizar, aguardar, sonhar",
"Para estender a antecipação, ==adie o acontecimento== com pequenos atrasos. O leitor sente junto a demora."),

E1("Apatia","Ausência de interesse, energia ou reação emocional.",
"Olhar vazio|Postura caída|Respostas monossilábicas|Descuido com a aparência|Deixar tarefas pela metade|Ficar muito tempo na mesma posição|Comer sem sentir gosto|Ignorar mensagens|Deixar a louça acumular",
"Corpo pesado|Dormência emocional|Cansaço constante",
"*Tanto faz.*|*Pra quê?*|Dificuldade com decisões simples|Tempo passando sem registro",
"Negligência de si e das obrigações|Isolamento total|Perder vínculos",
"Cumprir tarefas no automático|Entusiasmo encenado|Sorriso protocolar",
"Desânimo|Depressão|Solidão|Resignação","Tédio|Indiferença",
"largar, ignorar, arrastar, deitar, adiar, encarar, abandonar, calar, desistir, esquecer",
"Apatia é difícil de escrever porque ==é ausência==. Mostre pelo contraste: o que antes a personagem amava e agora deixa de lado."),

E1("Apreensão","Receio cauteloso de que algo específico dê errado.",
"Testa franzida|Olhar rápido em volta|Hesitar antes de entrar ou falar|Segurar a alça da bolsa com força|Passos curtos|Engolir em seco|Perguntar detalhes|Conferir a saída",
"Estômago contraído|Arrepio na nuca|Respiração presa",
"Prever cenários ruins|Procurar sinais de perigo|Questionar a própria decisão",
"Recusar-se a seguir|Pedir para alguém ir junto",
"Perguntas casuais demais|Tom leve com olhos atentos",
"Ansiedade|Medo|Temor|Desconfiança","Cautela|Alívio",
"hesitar, conferir, vigiar, recuar, perguntar, segurar, avaliar, espiar, desconfiar, engolir",
"A apreensão é ótima para ==prenúncio==. Se a personagem sente que algo vai dar errado, o leitor também fica atento."),

E1("Arrependimento","Desejo doloroso de ter agido de outra forma.",
"Cobrir o rosto com as mãos|Balançar a cabeça negativamente|Ombros curvados|Esfregar a testa|Pedir desculpas várias vezes|Reler a mensagem enviada|Tentar desfazer o que fez|Evitar a pessoa afetada",
"Peso no estômago|Garganta apertada|Calor de vergonha no rosto",
"*Se eu tivesse…*|Reviver a cena|Procurar formas de reparar",
"Autopunição|Perder o sono|Não conseguir seguir em frente",
"Justificar-se demais|Gentileza exagerada com quem prejudicou",
"Remorso|Culpa|Tristeza|Determinação","Aceitação|Resignação",
"lamentar, desculpar, reparar, rever, reescrever, consertar, voltar, recuar, apagar, confessar",
"O arrependimento fica mais forte quando ==a chance de consertar ainda existe==, mas custa caro. Isso obriga a personagem a escolher."),

E1("Arrogância","Senso inflado da própria superioridade, imposto aos outros.",
"Queixo erguido|Sorriso condescendente|Interromper e corrigir|Ocupar espaço com o corpo|Revirar os olhos|Falar alto|Explicar o óbvio para os outros|Ignorar opiniões|Atribuir fracassos a terceiros",
"Sensação de controle|Irritação quando contrariada|Prazer em ser admirada",
"Desprezar opiniões alheias|*Eu sei mais*|Buscar reconhecimento",
"Humilhar em público|Recusar qualquer crítica|Isolar-se de iguais",
"Falsa modéstia|Elogios com ressalvas",
"Desprezo|Defensividade|Humilhação","Presunção|Confiança",
"interromper, corrigir, menosprezar, exibir, desdenhar, ordenar, impor, ignorar, gabar, ridicularizar",
"A arrogância costuma esconder ==insegurança==. Um momento em que a máscara cai, mesmo breve, deixa a personagem tridimensional."),

E1("Assombro","Espanto maravilhado diante de algo grandioso ou inexplicável.",
"Boca entreaberta|Olhos arregalados|Parar no meio do caminho|Mão na boca ou no peito|Sussurrar|Esticar o pescoço para ver melhor|Exclamações curtas: *meu Deus*, *olha isso*|Sacar o celular para gravar|Olhar em volta para ver se os outros também estão vendo|Ficar em silêncio por um tempo",
"Arrepio pelo corpo inteiro|Respiração suspensa|Sensação de pequenez diante do mundo",
"Esquecer o que estava fazendo|Tentar guardar cada detalhe|Rever crenças",
"Lágrimas|Experiência que muda a vida|Perder a noção do tempo",
"Fingir naturalidade, mas os olhos se arregalam antes|Comentário técnico para disfarçar",
"Admiração|Curiosidade|Gratidão|Medo","Curiosidade|Contentamento",
"contemplar, sussurrar, parar, olhar, gravar, apontar, emudecer, maravilhar, estremecer, absorver",
"Use um ==objeto do cenário== para carregar o assombro: a primeira vez que a personagem vê o mar, um céu sem poluição no sertão, uma catedral."),

E1("Avidez","Desejo intenso e impaciente de conseguir ou fazer algo, já.",
"Inclinar-se para a frente|Mãos que se estendem|Falar rápido|Interromper para perguntar|Chegar antes de todo mundo|Ser a primeira a se oferecer|Olhos fixos no que quer|Pegar antes de ser oferecido|Comer depressa",
"Energia elétrica|Salivação|Coração acelerado",
"*Agora, agora*|Pular etapas|Desconsiderar riscos",
"Atropelar pessoas|Agir sem pensar|Obsessão",
"Fingir desinteresse e olhar de canto|Cruzar as mãos para segurar o impulso",
"Empolgação|Impaciência|Desejo|Frustração","Antecipação|Curiosidade",
"agarrar, pegar, avançar, pular, atropelar, oferecer, devorar, correr, insistir, apressar",
"A avidez costuma levar a ==erros por pressa==. É um bom gatilho para um tropeço que complica a trama.")
);
