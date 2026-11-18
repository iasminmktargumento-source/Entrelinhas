// PARTE 16 — aprofundamento: vocabulário, verbos, descrição do corpo, frases e novas entradas
(function(){
const P=GUIA.partes[16];
// novos campos, na ordem de leitura
P.campos=[
 {k:"def",l:"O que é",t:"texto"},
 {k:"termos",l:"Termos adequados",t:"chips"},
 {k:"evitar",l:"Evite",t:"lista"},
 {k:"vocab",l:"Palavras e expressões para descrever",t:"chips"},
 {k:"verbos",l:"Verbos de comunicação e movimento",t:"chips"},
 {k:"corpo",l:"Descrevendo o corpo, o movimento e as ferramentas",t:"lista"},
 {k:"cotidiano",l:"Como aparece no dia a dia",t:"lista"},
 {k:"cena",l:"Como mostrar na cena",t:"lista"},
 {k:"ex",l:"Exemplos",t:"paras"},
 {k:"frases",l:"Mais frases de exemplo",t:"paras"},
 {k:"barreiras",l:"Barreiras do mundo (fontes de conflito)",t:"lista"},
 {k:"dica",l:"Dica de escrita",t:"dica"}
];
P.notaEntradas="em seis grupos, com vocabulário e exemplos para cada uma";
// teoria nova, inserida depois de "A linguagem"
const nova=[
{t:"Descrever sem reduzir",html:`
<p>A mesma ação pode ser descrita de forma neutra ou carregada de pena, medo ou espanto. ==As palavras que você escolhe dizem ao leitor como enxergar a personagem.==</p>
<div class="tab-wrap"><table><thead><tr><th>Carregado (evite)</th><th>Neutro ou vivo (prefira)</th></tr></thead><tbody>
<tr><td>arrastava-se penosamente pelo corredor</td><td>mancava pelo corredor, um passo longo e um curto</td></tr>
<tr><td>a pobre moça presa à cadeira</td><td>a moça girou a cadeira e foi até a janela</td></tr>
<tr><td>olhos vazios, olhos mortos</td><td>olhos que não procuravam o rosto de ninguém</td></tr>
<tr><td>emitia sons estranhos</td><td>falava devagar, com um ritmo que pedia atenção</td></tr>
<tr><td>gesticulava freneticamente</td><td>sinalizava rápido, com a raiva nas mãos</td></tr>
<tr><td>infelizmente, ele não podia ouvir</td><td>ele não ouvia; a campainha da casa piscava</td></tr>
<tr><td>apesar da deficiência, ela se formou</td><td>ela se formou em julho, com a turma inteira gritando o nome-sinal dela</td></tr>
</tbody></table></div>
<p>Três perguntas para revisar cada descrição:</p>
<ul><li><b>Quem está olhando?</b> Uma narradora com deficiência descreve a própria vida com naturalidade; um narrador sem deficiência pode ter preconceitos, e a história pode mostrar isso.</li><li><b>Estou descrevendo uma ação ou um espetáculo?</b> O corpo da personagem não é paisagem.</li><li><b>Eu descreveria assim uma personagem sem deficiência?</b> Se a resposta for não, pense de novo.</li></ul>`},
{t:"Verbos para quem não fala oralmente",html:`
<p>Assim como a parte 12 tem verbos de elocução para cada emoção, personagens que se comunicam por outros meios também precisam de verbos variados e precisos.</p>
<div class="tab-wrap"><table><thead><tr><th>Forma de comunicação</th><th>Verbos e expressões</th></tr></thead><tbody>
<tr><td>Libras e outras línguas de sinais</td><td>sinalizou, respondeu em Libras, soletrou, datilologou, fez o sinal de, perguntou com as mãos, repetiu o sinal, sinalizou baixinho (sinais pequenos), sinalizou alto (sinais grandes e rápidos)</td></tr>
<tr><td>Escrita</td><td>escreveu, rabiscou, sublinhou, virou o bloquinho, mostrou a tela, digitou</td></tr>
<tr><td>Aplicativo ou aparelho de voz (CAA)</td><td>digitou, tocou na prancha, o tablet disse, a voz sintética anunciou, respondeu pelo aplicativo, apertou o botão do “sim”</td></tr>
<tr><td>Gestos e olhar</td><td>apontou, acenou, balançou a cabeça, ergueu o polegar, desviou o olhar, fixou o olhar no objeto, deu de ombros</td></tr>
<tr><td>Toque (surdocegueira)</td><td>sinalizou na mão dela, escreveu na palma, apertou o braço duas vezes, guiou a mão</td></tr>
</tbody></table></div>
<h4>A emoção nas mãos</h4>
<p>Em língua de sinais, o tamanho, a velocidade e a força do movimento funcionam como o volume e o tom da voz: ==raiva tem sinais bruscos e grandes; segredo, sinais pequenos e escondidos; cansaço, sinais lentos e preguiçosos==. Use isso como você usaria “sussurrou” ou “gritou”.</p>
<div class="cena">Os sinais dela foram ficando maiores, mais rápidos, a mão quase batendo no peito dele. Ninguém no restaurante entendia Libras, mas todo mundo entendeu que era uma briga.</div>`},
{t:"Nomear ou mostrar?",html:`
<p>Nem sempre é preciso dizer o diagnóstico. Muitas vezes é mais interessante ==mostrar primeiro e nomear depois==, ou nunca nomear, se a personagem não pensa na própria condição com aquele nome.</p>
<ul><li><b>Mostre as ferramentas e a rotina</b> antes de explicar: a bengala, o aplicativo, a rampa, a escadinha.</li><li><b>Use os termos que a personagem usaria.</b> Uma mulher de 70 anos pode dizer “meu problema de vista”; uma jovem ativista, “sou PcD”.</li><li><b>Evite o parágrafo de prontuário</b>, aquele que para a cena para explicar a condição com termos médicos.</li><li><b>Volte ao detalhe</b> ao longo do livro, de forma natural, sem esquecer que a deficiência existe quando a trama não precisa dela.</li></ul>`}
];
const iLing=P.teoria.findIndex(t=>t.t==="A linguagem");
P.teoria.splice(iLing+1,0,...nova);

const A=(nome,o)=>{for(const g of P.grupos)for(const e of g.itens)if(e.nome===nome){Object.assign(e,o);return}console.warn("faltou",nome)};

A("Pessoa surda que usa Libras",{
vocab:"mãos ágeis|sinal amplo|sinal contido|expressão facial marcada|sobrancelhas erguidas|olhar atento ao rosto|espaço de sinalização|nome-sinal|datilologia|regionalismos da Libras|sinais pequenos (como um sussurro)|sinais grandes (como um grito)",
verbos:"sinalizou|respondeu em Libras|soletrou|datilologou|fez o sinal de|perguntou com as mãos|repetiu o sinal|interrompeu acenando|chamou com um toque no ombro|bateu na mesa para chamar|piscou a luz|riu",
corpo:"Os sinais acontecem no espaço à frente do peito e do rosto: o tamanho do movimento mostra a emoção|Raiva: sinais rápidos, secos, perto do outro|Segredo: sinais pequenos, perto do corpo, escondidos atrás de um cardápio ou de uma bolsa|Pergunta: sobrancelhas, olhos e inclinação da cabeça fazem parte da frase|Ênfase: o sinal se repete ou fica mais lento e marcado|Com as mãos ocupadas (comendo, carregando sacolas), a pessoa sinaliza com uma mão só|A Libras funciona através de vidros e à distância, uma vantagem em muitas cenas|Pessoas surdas riem, choram e gritam com som, como qualquer pessoa",
frases:"— *Não* — sinalizou ela, e a mão cortou o ar como uma porta batendo.|Do outro lado do vidro do ônibus, Caio sinalizou *te ligo*. Os dois riram: ele ia mandar vídeo, como sempre.|Na sala de espera lotada, as duas comentavam em Libras o bigode do médico. Ele nem desconfiava.|Soletrou o próprio nome devagar, com a cara de quem já tinha feito aquilo mil vezes para ouvintes.|Os sinais da amiga ficaram menores e mais lentos. Ana conhecia aquele jeito: ela estava cansada de explicar.|Bateu duas vezes na mesa. A vibração chegou até o outro lado, e o irmão finalmente levantou os olhos do celular."
});
A("Pessoa com deficiência auditiva oralizada",{
vocab:"aparelho atrás da orelha|processador do implante|ouvido bom|ouvido ruim|olhar fixo nos lábios|cabeça inclinada|microfonia|pilha acabando|som metálico|chiado|voz com timbre próprio",
verbos:"pediu para repetir|leu nos lábios|inclinou-se para ouvir|ajustou o aparelho|desligou o aparelho|fingiu entender|respondeu outra coisa|perguntou de novo|aproximou-se",
corpo:"Vira o lado que ouve melhor para quem fala|Prefere sentar de costas para a parede e de frente para o grupo|Pode falar um pouco mais alto ou mais baixo do que percebe|O som pelo aparelho pode ser metálico, com chiado, e misturar vozes em lugares barulhentos|Tirar o aparelho pode ser descanso, ou uma forma de sair de uma briga",
frases:"O aparelho apitou bem no meio do discurso do chefe. Lívia nem tentou disfarçar.|Sempre escolhia a cadeira da ponta, com o ouvido bom virado para a mesa.|— Hein? — E, antes que repetissem: — Deixa, depois você me conta.|Desligou o aparelho no meio da discussão. A mãe continuou falando, e ele continuou concordando com a cabeça.|Lia lábios tão bem que sabia o que diziam dela do outro lado do restaurante."
});
A("Pessoa cega",{
evitar:"“Ceguinho”|Puxar a pessoa pelo braço sem perguntar|Fazer carinho no cão-guia sem permissão|Superaudição mágica|Tocar o rosto das pessoas para “vê-las” (raro na vida real)|“Olhos vazios”, “olhos mortos”, “olhar perdido” como descrição padrão",
vocab:"bengala longa|bengala dobrável|ponteira|varredura|toque no chão|cão-guia|arreio|mão no cotovelo de quem guia|olhos que não fixam o rosto|óculos escuros (nem sempre)|ponta dos dedos no braile|voz acelerada do leitor de tela|mapa mental|referências de som e cheiro",
verbos:"tateou|varreu o chão com a bengala|contou os passos|reconheceu pela voz|ouviu o eco|segurou o cotovelo do guia|passou os dedos pelo braile|pediu que descrevessem|orientou-se pelo som|parou para escutar",
corpo:"A bengala tem som e ritmo próprios: batidas, arrastar, toques no meio-fio|Descreva o espaço por som, eco, temperatura, vento e cheiro, sem transformar isso em superpoder|Na guia humana, a pessoa cega segura o braço ou o cotovelo de quem guia, não o contrário|Cão-guia com arreio está trabalhando e não deve ser distraído|O olhar pode não se dirigir ao rosto de quem fala, e isso não precisa ser descrito como estranho",
frases:"A bengala encontrou o meio-fio antes dela, com um toque seco.|— Você mudou de perfume — disse Clara, antes que a amiga dissesse oi.|Sabia que tinha chegado à praça pelo eco que sumia de repente, como se o mundo abrisse.|O cão parou na beira da escada e esperou. Ela agradeceu baixinho, como sempre.|— Me lê o cardápio inteiro, sem resumir — pediu ele. — Eu quero escolher, não adivinhar.|O leitor de tela falava tão rápido que a sobrinha achou que o celular estava quebrado. Para ele, estava devagar."
});
A("Pessoa com baixa visão",{
vocab:"aproximar o rosto|apertar os olhos|lupa|letra ampliada|alto contraste|ofuscamento|visão em túnel|centro borrado|manchas|vultos|cores lavadas|depende da luz",
verbos:"aproximou o celular do rosto|ampliou a tela|inclinou a cabeça para achar o ângulo|reconheceu pelo vulto|tropeçou no degrau|pediu que lessem|semicerrou os olhos",
corpo:"Cada condição muda o que se vê (só o centro, só as bordas, manchas, vultos): escolha uma e seja coerente|Luz forte pode atrapalhar tanto quanto pouca luz|A personagem pode ler um livro de perto e não ver o degrau à frente, o que gera desconfiança dos outros|Muitas pessoas com baixa visão usam bengala só em alguns lugares",
frases:"Lia a mensagem com o celular a um palmo do nariz, e mesmo assim confundia o 3 com o 8.|Reconheceu o pai pelo jeito de andar muito antes de ver o rosto.|Degrau cinza em chão cinza: para ela, era um buraco no mundo.|— Mas ontem você leu a placa! — Ontem tinha sol.|Virava o rosto um pouco para o lado para ver a pessoa à frente, e todo mundo achava que ela estava desconfiada."
});
A("Pessoa surdocega",{
vocab:"mãos sobre mãos|Libras tátil|escrita na palma|toques combinados|vibração|guia-intérprete|braile|cheiro e temperatura como referência",
verbos:"sinalizou na mão dela|escreveu na palma|apertou o braço duas vezes|sentiu a vibração|tateou|guiou a mão|respondeu com as mãos",
corpo:"A conversa acontece pelo contato: mostre o ritmo e a pressão das mãos|Sinais combinados no corpo (um toque no ombro: alguém chegou)|O riso, a música e os passos podem chegar pela vibração do chão e da mesa",
frases:"Dois toques no ombro: alguém tinha chegado. Um apertão no braço: alguém de quem ela gostava.|As letras na palma vinham rápidas e tortas. A guia estava animada.|Sentiu a música pelo chão de madeira antes de saber que era uma festa."
});
A("Pessoa que não fala",{
termos:"pessoa não falante|pessoa não oralizada|usuária de CAA|usuária de comunicação alternativa|pessoa muda (algumas pessoas usam; outras não gostam)",
vocab:"prancha de comunicação|símbolos|tablet com voz|voz sintética|voz escolhida no aplicativo|bloquinho|letra de forma|olhar que aponta|gestos próprios|tempo de digitação",
verbos:"digitou|apontou|tocou na prancha|escreveu|mostrou a tela|o aplicativo leu|o tablet anunciou|respondeu com um aceno|balançou a cabeça|sinalizou|ergueu o polegar|sublinhou|apagou e reescreveu",
corpo:"No diálogo com CAA, a fala pode ser atribuída ao aparelho (disse o tablet) ou à pessoa (disse Teo, pelo tablet): escolha e mantenha|A pausa é de digitação, não de dúvida: mostre os outros mudando de assunto enquanto ela escreve|Humor, ironia e grosseria também cabem: a personalidade está nas escolhas de palavras",
frases:"— Não — disse Teo, pelo tablet. E apertou de novo, no volume máximo: — NÃO.|Digitou, apagou, digitou de novo. Quando a voz do aplicativo finalmente disse “Eu concordo com a Bia”, a conversa já estava em outro assunto.|Respondeu com o polegar para cima e uma sobrancelha erguida, o que na língua dele queria dizer “talvez”.|O bloquinho tinha três palavras em letra de forma: VOCÊ ESTÁ ERRADO.|A neta trocou a voz do aplicativo por uma de criança, de brincadeira. Ele ficou uma semana sem falar com ela. Literalmente."
});
A("Gagueira",{
vocab:"bloqueio|repetição de sílaba|prolongamento de som|tensão no rosto|piscar|pausa|palavra trocada|fluência que vem e vai",
verbos:"gaguejou|travou|bloqueou|repetiu|prolongou|respirou e recomeçou|trocou a palavra|desistiu da frase|terminou a frase com firmeza",
corpo:"Na escrita: repetição com hífen (q-q-quero), prolongamento (sssim), bloqueio com reticências (— Eu... eu preciso)|Use pouco: duas ou três marcas por cena|Mostre as estratégias: trocar palavras, gesticular, mandar mensagem em vez de ligar|A gagueira pode aumentar com cansaço, pressa e telefone",
frases:"— P-p... — Ele parou, respirou e escolheu outra palavra: — O moço da padaria.|A palavra emperrou no meio do caminho, como um carro que não pega. Ela esperou. Ele esperou. Saiu.|Ao telefone, gaguejava o dobro. Por isso mandava áudio, e regravava quatro vezes."
});
A("Afasia",{
vocab:"palavra na ponta da língua|troca de palavras|fala telegráfica|frases curtas|gestos que completam|compreensão preservada (em muitos casos)|frustração",
verbos:"procurou a palavra|trocou|gesticulou|apontou|desenhou|repetiu|bufou|desistiu|completou com as mãos",
corpo:"Mostre a ideia inteira na cabeça e a palavra que não chega|Gestos e desenhos completam o que falta|Há tipos diferentes de afasia: em alguns, a compreensão também é afetada. Pesquise o caso da sua personagem",
frases:"— Me dá o... o... — e fez um círculo no ar. A filha entregou o prato. Era isso.|Dizia “sim” quando queria dizer “não”, e se irritava antes de todo mundo perceber o erro.|A fala dele ficou curta: “Café. Não. Quente.” Mas o olhar continuava o mesmo, inteiro."
});
A("Usuária de cadeira de rodas",{
vocab:"cadeira manual|cadeira motorizada|aros de propulsão|rodas|freio|apoio de pés|almofada|cadeira sob medida|joystick|transferência|empinar (equilibrar nas rodas de trás)|luvas sem dedo|mãos calejadas|ombros fortes|adesivos na cadeira",
verbos:"tocou a cadeira|impulsionou|girou|freou|empinou|deslizou|manobrou|desceu a rampa|se transferiu|encostou ao lado|rodou até|acelerou|andou (muitos cadeirantes usam “andar” normalmente)",
corpo:"Use verbos de movimento da cadeira com a mesma naturalidade que usaria “andar”|Mostre a altura do olhar: a conversa com quem está em pé, os balcões altos|A cadeira diz muito sobre a personagem: cor, adesivos, desgaste, se é emprestada ou sob medida|Na cadeira motorizada, o ritmo é outro: o zumbido do motor, o joystick, a bateria",
frases:"Girou a cadeira num movimento só e saiu da sala antes que ele terminasse a frase.|Empinou nas rodas de trás para descer o meio-fio, com a tranquilidade de quem fazia isso desde os nove anos.|— Vamos andando? — disse ela, já tocando a cadeira para a porta.|As luvas sem dedo estavam gastas na palma, de tanto empurrar subida.|Encostou a cadeira ao lado do sofá e se transferiu com um impulso dos braços.|A bateria da cadeira estava no fim, e o shopping ainda tinha dois andares."
});
A("Pessoa amputada ou com ausência de membro",{
vocab:"membro residual|coto (algumas pessoas usam, outras preferem membro residual)|prótese|encaixe|liner|joelho mecânico|pé de fibra de carbono|manga dobrada|dor fantasma|sensação fantasma|muletas",
verbos:"ajustou a prótese|encaixou|tirou o liner|apoiou-se|pulou num pé só|equilibrou-se|calçou|massageou a perna",
corpo:"A prótese tem som (clique, estalo) e exige cuidados (encaixe, pele irritada, ajuste)|Em casa, muitas pessoas preferem ficar sem a prótese|Dor e coceira fantasmas são comuns: a pessoa sente o membro que não existe mais",
frases:"O clique do joelho mecânico marcava o ritmo dos passos dele no corredor.|Dobrava a manga vazia da blusa com um alfinete, sempre do mesmo jeito, sempre na altura do cotovelo.|À noite, sem a prótese, pulava num pé só até a cozinha, segurando nos móveis.|Coçou o pé que não tinha. Fazia dez anos e ainda acontecia."
});
A("Pessoa com paralisia cerebral",{
vocab:"espasticidade|movimentos involuntários|músculos rígidos|andar na ponta dos pés|joelhos que se encostam|fala com articulação própria|andador|órteses|controle que muda com cansaço, frio ou emoção",
verbos:"firmou a mão|apoiou-se|falou devagar e claro|esperou o corpo responder|segurou com as duas mãos|ajustou a órtese|digitou com um dedo",
corpo:"O corpo pode responder de forma diferente em dias de frio, nervosismo ou cansaço|A fala pode ser difícil de entender para quem não tem paciência, e fácil para quem convive|Mostre a inteligência e o humor pela fala, não só pelo corpo",
frases:"Quando ficava nervoso, o braço direito tinha vida própria. Paulo o segurava com a outra mão e continuava falando.|Escrevia no celular com um dedo só, mais rápido que muita gente com dez.|A fala dela tinha um ritmo próprio, e quem tinha paciência de ouvir descobria a pessoa mais engraçada da turma."
});
A("Pessoa com nanismo",{
vocab:"baixa estatura|braços e pernas mais curtos|escadinha portátil|pedais adaptados|roupas ajustadas|erguer o olhar|olhares de cima",
verbos:"subiu na escadinha|esticou-se|pulou para sentar|puxou a cadeira|olhou para cima|encarou",
corpo:"Mostre o mundo na altura dela: maçanetas, balcões, prateleiras|Mostre as soluções práticas com naturalidade|Evite descrever o corpo como engraçado",
frases:"Carregava uma escadinha dobrável na mochila e a abria com a destreza de quem saca uma arma.|Subiu no banco do bar com um impulso só e pediu a cerveja olhando o garçom nos olhos.|Na foto da formatura, insistiu para ficar no meio, e não na frente “porque é baixinha”."
});
A("Pessoa que usa muletas, bengala ou andador",{
vocab:"muletas canadenses|muletas axilares|bengala de apoio|andador com rodas|ponteira de borracha|passo apoiado|ritmo em três tempos|perna boa|perna ruim|sentar para descansar",
verbos:"apoiou-se|avançou|firmou a bengala|parou para descansar|encostou as muletas|subiu degrau por degrau|arrastou o andador",
corpo:"Muletas e bengala têm som: toques no chão, ritmo regular|Na escada, muita gente usa a regra “a perna boa sobe primeiro, a ruim desce primeiro”|Mostre o cansaço nos braços, não só nas pernas",
frases:"Toc, passo, toc, passo: as muletas anunciavam a chegada dela no corredor.|Encostou a bengala na mesa com cuidado, como quem apoia um guarda-chuva caro.|Subia a escada degrau por degrau. “A boa sobe, a ruim desce”, repetia baixinho, como a fisioterapeuta ensinou."
});
A("Pessoa com síndrome de Down",{
vocab:"tônus muscular mais baixo|fala com ritmo próprio (em algumas pessoas)|traços faciais característicos (descreva com o mesmo cuidado que qualquer rosto)|humor|opinião forte|vontade própria",
verbos:"discordou|decidiu|protestou|explicou|negociou|insistiu|escolheu",
corpo:"Prefira verbos de decisão e vontade, que mostram autonomia|Descreva o rosto como descreveria qualquer outro, sem reduzir a pessoa aos traços da síndrome",
frases:"Rafa não gostava de abraço de estranhos e dizia isso com todas as letras: “Não. Aperto de mão.”|Era a melhor goleira do time e a pior perdedora da família.|Escolheu sozinha o vestido da formatura, e brigou com a mãe por causa dele, como qualquer filha."
});
A("Pessoa com deficiência intelectual",{
vocab:"aprende de outro jeito|precisa de mais tempo|explicações concretas|rotina visual|apoio com dinheiro e horários|memória forte para o que ama",
verbos:"perguntou de novo|repetiu para lembrar|conferiu na lista|pediu ajuda|insistiu|entendeu do jeito dele",
corpo:"Mostre as ferramentas de apoio: listas, desenhos, alarmes|Mostre o que a personagem domina, não só o que não consegue",
frases:"Na geladeira, a rotina da semana em desenhos: segunda, ônibus azul; terça, ônibus amarelo.|Não sabia calcular o troco, mas sabia exatamente quem na rua estava triste.|— Fala de novo, mais devagar — pediu ela, sem vergonha nenhuma. E dessa vez entendeu."
});
A("Pessoa autista",{
vocab:"hiperfoco|stimming (balançar, bater as mãos, girar objetos)|fones abafadores|óculos escuros|contato visual difícil (para algumas pessoas)|fala literal|ecolalia|crise (meltdown)|desligamento (shutdown)|mascaramento|rotina|sensibilidade a texturas, luzes e sons",
verbos:"explicou em detalhes|corrigiu|perguntou literalmente|repetiu|balançou|bateu as mãos|colocou os fones|saiu da sala|ficou em silêncio|falou sem parar sobre",
corpo:"O stimming pode ser alegria, foco ou forma de se acalmar: descreva sem tratar como algo estranho|Em uma crise, mostre o ambiente como gatilho (barulho, luz, gente) e o que ajuda|Nem toda pessoa autista evita o olhar ou fala de forma literal: escolha traços para a sua personagem, não para o estereótipo",
frases:"Bateu as mãos duas vezes, rápido, quando viu o resultado. Quem conhecia sabia: era alegria pura.|Colocou os fones abafadores, e o shopping virou um aquário: gente se mexendo sem som.|— Você disse “volto em cinco minutos”. Faz doze.|Cortava as etiquetas de todas as roupas no dia em que comprava. Todas."
});
A("Dor crônica e fadiga",{
vocab:"dia bom|dia ruim|crise|colheres (energia)|rigidez de manhã|bolsa térmica|remédio no bolso|sentar sempre que pode|rosto que disfarça",
verbos:"cancelou|desmarcou|sentou|respirou fundo|disfarçou|apoiou-se|massageou|tomou o remédio escondido|sorriu por cima da dor",
corpo:"Mostre o esforço escondido: a mão apertando a bolsa, o sorriso que demora|Mostre o cálculo de energia antes de cada compromisso",
frases:"Sorriu na foto. Ninguém percebeu que ela contava os segundos até poder sentar.|Desmarcou o aniversário da amiga pela terceira vez e reescreveu a mensagem cinco vezes, tentando não parecer desculpa.|Acordava e testava o corpo como quem olha o tempo pela janela: hoje, nublado."
});
A("Epilepsia",{
vocab:"aura (aviso antes da crise, em algumas pessoas)|crise de ausência (olhar parado por segundos)|crise convulsiva|pós-crise (confusão, cansaço, dor)|remédio de horário|pulseira de identificação",
verbos:"avisou que vinha uma crise|deitou-se|ficou ausente|voltou a si|perguntou o que tinha acontecido|dormiu",
corpo:"Existem tipos diferentes de crise: nem toda crise é convulsão|O depois da crise costuma ser mais interessante para a cena do que a crise",
frases:"No meio da frase, ela parou, olhando para nada. Três segundos depois, continuou de onde tinha parado, sem perceber.|Depois da crise, sentia o corpo como se tivesse corrido uma maratona de que não lembrava.|Sentiu o cheiro de queimado que não existia, o aviso, e teve tempo de sentar no chão."
});
A("Próteses e implantes",{frases:"O braço mecânico era lindo, mas fazia barulho quando ela tentava ser discreta.|A atualização do implante chegou de madrugada. Ele acordou ouvindo em outro tom.|Quando a empresa faliu, ninguém mais consertava aquele modelo de perna."});
A("Curas mágicas e tecnológicas",{frases:"A curandeira ofereceu devolver a visão dela. Ela perguntou o preço antes de perguntar como.|Todos no reino comemoraram a cura do príncipe. Ele passou a noite sozinho, aprendendo a andar num corpo que não conhecia mais."});
A("Habilidades especiais e deficiência",{frases:"Conseguia ouvir pensamentos, mas não ouvia a campainha. As duas coisas eram verdade ao mesmo tempo.|A magia dela não curava a perna. Só a fazia flutuar alguns minutos por dia, e ela escolhia com cuidado quando usar."});
A("Mundos acessíveis",{frases:"Na capital, todos os anúncios oficiais eram feitos em sinais, projetados no céu.|Os elfos não construíam escadas. Diziam que um caminho que nem todos podem usar não é caminho."});

// NOVAS ENTRADAS
const N=(g,a,o)=>{const e=E16(...a);Object.assign(e,o);P.grupos[g].itens.push(e);};
N(2,["Pessoa que manca","Mancar (ou claudicar) é andar com uma passada desigual. Pode vir de lesão, cirurgia, diferença no tamanho das pernas, dor, prótese, condição neurológica ou do nascimento. Pode ser temporário ou permanente.","pessoa que manca|pessoa com marcha irregular|pessoa com mobilidade reduzida","“O manco” como apelido ou rótulo (ofensivo em muitos contextos)|“Aleijado”|Mancar como sinal de vilania, fraqueza ou velhice|Descrever sempre com pena","Escolher caminhos planos|Sapato com palmilha ou calço|Dores nas costas e no quadril|Subir escadas pelo lado do corrimão|Mancar mais no fim do dia","Use o ritmo dos passos como marca da personagem|Mostre o reconhecimento à distância pelo jeito de andar|Mostre como o mancar muda com cansaço, frio, chuva e escadas","O passo dele tinha um ritmo próprio, um longo e um curto, como uma valsa errada que ela reconheceria em qualquer corredor.","Escadas e calçadas irregulares|Pressa dos outros|Piadas e apelidos|Distâncias longas","Decida a causa do mancar, mesmo que não conte ao leitor: ela muda o ritmo, as dores e o que a personagem evita."],{
vocab:"passada desigual|ritmo quebrado|um passo longo e um curto|puxar a perna|arrastar o pé|pisar de lado|pender o corpo|apoiar o peso na perna boa|perna dura|joelho que não dobra|quadril que sobe|sola gasta de um lado só|calço no sapato",
verbos:"mancou|coxeou|claudicou|puxou a perna|arrastou o pé|apoiou-se|pendeu para um lado|firmou o passo|parou para descansar|apressou o passo desigual",
corpo:"Mostre o som: passo e arrasto, passo e arrasto|Mostre os apoios: mesa, parede, corrimão, o braço de alguém|Mostre os objetos: o sapato gasto de um lado, o calço, a joelheira|Nem toda cena precisa mencionar o mancar: volte a ele quando houver escada, pressa, cansaço ou chuva",
frases:"Nos dias de chuva, a perna esquerda doía mais, e o mancar ficava visível até para quem não sabia.|Puxou a perna até a janela, apoiando na mesa, na cadeira, no batente.|O sapato direito sempre gastava primeiro, do lado de fora.|Correu como podia, puxando a perna, e chegou ao ônibus no instante em que a porta fechava.|Ninguém percebia que ele mancava, até a festa acabar e ele ter que subir a ladeira de casa."});
N(2,["Pessoa com lesão medular","Lesão na medula espinhal, geralmente por acidente, que afeta movimentos e sensibilidade abaixo do ponto da lesão. Na paraplegia, as pernas são afetadas; na tetraplegia, também os braços e as mãos, em graus variados.","pessoa com lesão medular|pessoa com paraplegia|pessoa com tetraplegia|cadeirante","“Inválido”|Achar que toda lesão é igual|Tratar a vida depois da lesão como fim da vida|Ignorar a sexualidade e os afetos","Cadeira de rodas manual ou motorizada|Fisioterapia|Adaptações em casa e no carro|Cuidados com a pele e a circulação|Espasmos|Sensibilidade diferente","Mostre o antes e o depois, se a lesão for recente|Mostre a adaptação, as ferramentas e a rotina|Mostre a personagem vivendo, trabalhando, namorando","Três anos depois do acidente, Diego dirigia um carro adaptado com controles nas mãos, e ainda reclamava do trânsito como antes.","Acessibilidade|Custo de equipamentos|Preconceito no trabalho|Relações que mudam","Pesquise o nível da lesão da sua personagem: ele define o que ela consegue ou não fazer com as mãos e os braços."],{
vocab:"nível da lesão|cadeira motorizada|joystick|controle com o queixo ou com a boca (em algumas tetraplegias)|carro adaptado|espasmos|sensibilidade alterada|mãos com movimento parcial|cuidador|assistente",
verbos:"guiou a cadeira|manobrou|comandou por voz|pediu ajuda|ajustou o apoio|sentiu (ou não sentiu)|se transferiu",
corpo:"Na tetraplegia, a tecnologia (comando por voz, joystick) é parte da autonomia|Mostre a relação com cuidadores: confiança, conflito, intimidade|O corpo continua sentindo emoções; a sensibilidade física é que muda",
frases:"Pediu à assistente virtual que apagasse a luz. Depois, pediu que tocasse aquela música de quando ainda andava, e mudou de ideia no meio.|A perna teve um espasmo no meio da reunião. Ela continuou a apresentação sem olhar para baixo."});
N(2,["Pessoa com sequelas de AVC","Depois de um AVC (derrame), a pessoa pode ter fraqueza ou paralisia em um lado do corpo (hemiparesia ou hemiplegia), dificuldade na fala (afasia) e outras mudanças.","pessoa com sequelas de AVC|pessoa com hemiparesia","“Ficou inválido”|Falar dela como se não estivesse presente|Achar que a inteligência foi embora","Um lado do corpo mais fraco|Uso de bengala ou andador|Reabilitação|Adaptações com uma mão só","Mostre a adaptação do dia a dia com um lado do corpo|Mostre a reabilitação como esforço diário, não milagre","Aprendeu a amarrar o sapato com uma mão. Levou dois meses e treze vídeos na internet.","Impaciência da família|Perda de autonomia|Depressão","Pesquise: as sequelas variam muito de pessoa para pessoa."],{
vocab:"lado bom|lado afetado|braço junto ao corpo|mão fechada|pé que arrasta|boca levemente caída de um lado|fala mais lenta",
verbos:"arrastou o pé|apoiou-se no lado bom|segurou com uma mão|treinou|tentou de novo|pediu paciência",
frases:"Comia com a mão esquerda agora. A comida caía às vezes, e ele ria antes que alguém tivesse pena.|Levava o braço direito junto ao corpo, a mão fechada, como quem guarda alguma coisa."});
N(0,["Pessoa com visão monocular","Pessoa que enxerga com um olho só. No Brasil, a visão monocular é reconhecida como deficiência visual pela Lei 14.126/2021.","pessoa com visão monocular|pessoa com deficiência visual","Achar que não faz diferença|Piadas sobre piratas|Prótese ocular como algo assustador","Girar mais a cabeça|Dificuldade com profundidade (degraus, servir líquidos)|Esbarrar em coisas do lado que não vê|Prótese ocular ou tampão (em alguns casos)","Mostre o lado cego como fonte de surpresa e susto|Mostre os ajustes: sentar de um lado específico, virar o rosto","Sentava sempre à direita das pessoas, para não perder ninguém do lado cego.","Direção de veículos em algumas situações|Trabalhos que exigem noção de profundidade|Preconceito","É uma deficiência pouco conhecida: o conflito com quem acha que ela “não existe” é rico."],{
vocab:"lado cego|olho bom|girar a cabeça|noção de profundidade|prótese ocular|tampão",
verbos:"virou o rosto|girou a cabeça|calculou a distância|esbarrou|sentou-se à direita",
frases:"Errou o copo por dois centímetros e o suco caiu na toalha. — Profundidade — explicou, sem drama.|Quem chegava pelo lado esquerdo sempre a assustava. Os amigos aprenderam a chegar pela direita."});
N(0,["Pessoa com albinismo","Condição genética que reduz a produção de melanina: pele, cabelos e olhos muito claros, e quase sempre baixa visão, sensibilidade à luz e movimentos involuntários dos olhos (nistagmo).","pessoa com albinismo","Personagens com albinismo como vilões, seres mágicos ou sinistros (um tropo muito comum)|“Branquelo”, apelidos|Ignorar a baixa visão","Protetor solar alto|Roupas de manga|Chapéu|Óculos escuros|Lupas e ampliação de tela|Risco maior de câncer de pele","Mostre o cuidado com o sol como parte da rotina|Mostre a baixa visão e as adaptações|Em pessoas negras com albinismo, o preconceito pode ser duplo","Passava protetor como quem escova os dentes: sem pensar, três vezes por dia.","Sol forte no Brasil|Preconceito|Falta de acessibilidade visual","O tropo do “albino sinistro” é muito usado em fantasia. Fuja dele."],{
vocab:"pele muito clara|cabelo branco ou loiro muito claro|cílios claros|olhos claros|nistagmo|sensibilidade à luz|chapéu de aba larga",
verbos:"protegeu os olhos|semicerrou os olhos|aproximou o livro|procurou a sombra",
frases:"No verão de Salvador, vivia de chapéu, manga comprida e a sombra de qualquer árvore.|Os olhos dela se mexiam de leve, o tempo todo, mesmo quando estava parada, e ela lia assim desde sempre."});
N(1,["Pessoa com fissura labiopalatina","Condição de nascimento em que o lábio e/ou o céu da boca não se fecham completamente durante a gestação. Geralmente é corrigida com cirurgias na infância, e pode deixar cicatriz e alterações na fala.","pessoa com fissura labiopalatina|pessoa com fissura","“Lábio leporino” (muitas pessoas consideram pejorativo: leporino quer dizer “de lebre”)|Piadas|Usar a cicatriz como marca de vilão","Cirurgias ao longo da infância|Fonoaudiologia|Cicatriz no lábio superior|Fala anasalada em alguns casos","Mostre a cicatriz como detalhe, não como centro|Mostre a história das cirurgias, se fizer sentido","Tinha uma cicatriz fina subindo do lábio até o nariz, e passava o dedo nela quando pensava.","Bullying na infância|Acesso ao tratamento","Descreva a cicatriz como descreveria qualquer outra marca da parte 14."],{
vocab:"cicatriz no lábio superior|fala anasalada|cirurgias|fonoaudiologia",
verbos:"tocou a cicatriz|falou|sorriu",
frases:"Nas fotos de bebê, a fissura aparecia inteira. Ela gostava de mostrar as fotos para quem achava que sabia tudo sobre ela."});
N(4,["Doenças neuromusculares e progressivas","Condições como esclerose múltipla, esclerose lateral amiotrófica (ELA) e distrofias musculares, que afetam movimentos e força, muitas vezes de forma progressiva ou em surtos.","pessoa com esclerose múltipla|pessoa com ELA|pessoa com distrofia muscular","Tratar a personagem como alguém que só espera o fim|Ignorar a vida que continua","Mudanças ao longo do tempo|Fadiga|Surtos (na esclerose múltipla)|Equipamentos que mudam (bengala, cadeira, respirador)|Luto antecipado","Mostre a adaptação contínua: o que muda, o que fica|Mostre a relação com o tempo e o futuro","Marcava as fases da doença pelos objetos: primeiro a bengala, depois a cadeira, depois o aplicativo de voz. Em todos, um adesivo do time.","Custo do tratamento|Mudanças no trabalho|Medo do futuro","O tempo é o grande tema: use-o com delicadeza."],{
vocab:"surto|fadiga|fraqueza|tremor|perda de força|formigamento|respirador",
verbos:"adaptou-se|descansou|tentou de novo|planejou|aceitou ajuda",
frases:"Na semana do surto, não conseguia segurar a caneta. Na seguinte, assinou o contrato.|Gravou a própria voz falando as frases favoritas, enquanto ainda podia. O aplicativo usaria depois."});
A("Pessoa com sequelas de AVC",{corpo:"Mostre o lado afetado em ação: o braço que fica junto ao corpo, o pé que arrasta na passada|Mostre as adaptações: tudo com a mão boa, abrir potes com os dentes ou entre os joelhos|A fala pode estar afetada (veja Afasia): descreva a frustração sem infantilizar"});
A("Pessoa com visão monocular",{corpo:"Mostre o giro de cabeça para compensar o lado que não vê|Mostre os erros de distância (servir líquidos, estacionar, degraus)|Se houver prótese ocular, descreva com naturalidade, como qualquer outro detalhe do rosto"});
A("Pessoa com albinismo",{corpo:"Descreva a pele, o cabelo e os olhos com a mesma riqueza de qualquer outra personagem (parte 14)|Mostre a relação com a luz: procurar sombra, semicerrar os olhos, aproximar a leitura|O nistagmo (olhos que se movem levemente) pode aumentar com cansaço ou nervosismo"});
A("Pessoa com fissura labiopalatina",{corpo:"A cicatriz pode ser fina ou marcada, e mudar com o sorriso|A fala pode ter um tom anasalado, mais forte em algumas letras|Mostre a cicatriz em gestos (tocar, esconder, mostrar) quando revelar emoção"});
A("Doenças neuromusculares e progressivas",{corpo:"Mostre a mudança ao longo do livro: o que ela fazia no capítulo 1 e não faz mais, e o que inventou para continuar|Fadiga: o corpo pesado, o tempo de recuperação|Tremores e fraqueza nas mãos: a xícara, a assinatura, o botão da camisa"});
A("Pessoa com lesão medular",{});
})();
