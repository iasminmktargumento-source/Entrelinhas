// PARTE 2 — DEFEITOS DE PERSONAGEM (configuração e introdução)
window.E2=(nome,def,sem,causas,comp,pens,emo,pos,neg,ex,sup,conf,nota)=>({nome,def,nota,sem,causas,comp,pens,emo,pos,neg,ex,sup,conf});
window.FLUXO=(etapas)=>{const w=150,g=34,H=110;const W=etapas.length*w+(etapas.length-1)*g;
 let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${etapas.map(e=>e[0]).join(", ")}" style="font-family:var(--display)">`;
 etapas.forEach(([t,d],i)=>{const x=i*(w+g);const L=[82,74,66,58,50,42][i]||50;
  s+=`<rect x="${x}" y="8" width="${w}" height="${H-16}" rx="14" style="fill:hsl(var(--h) 85% ${L}%)"/>`;
  s+=`<text x="${x+w/2}" y="44" text-anchor="middle" style="fill:${i<2?"hsl(var(--h) 60% 22%)":"#fff"};font-weight:800;font-size:16px">${t}</text>`;
  s+=`<text x="${x+w/2}" y="68" text-anchor="middle" style="fill:${i<2?"hsl(var(--h) 50% 25%)":"#fff"};font-size:12px">${d}</text>`;
  if(i<etapas.length-1) s+=`<path d="M${x+w+6} ${H/2} h${g-14} m-8 -7 l8 7 l-8 7" style="fill:none;stroke:hsl(var(--h) 60% 45%);stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>`;});
 return `<div class="diagrama">${s}</svg></div>`};

GUIA.add({
n:2,
chamada:"Cem defeitos de personagem, com as causas, os comportamentos, os pensamentos e o que cada um faz a personagem ganhar e perder. Para dar a ela algo a superar.",
campos:[
 {k:"def",l:"Definição",t:"texto"},
 {k:"nota",l:"Notas",t:"texto"},
 {k:"sem",l:"Defeitos semelhantes",t:"chips"},
 {k:"causas",l:"Causas possíveis",t:"lista"},
 {k:"comp",l:"Comportamentos e atitudes associados",t:"lista"},
 {k:"pens",l:"Pensamentos associados",t:"lista"},
 {k:"emo",l:"Emoções associadas",t:"links",p:1},
 {k:"pos",l:"Aspectos positivos",t:"texto"},
 {k:"neg",l:"Aspectos negativos",t:"texto"},
 {k:"ex",l:"Exemplos da ficção",t:"lista"},
 {k:"sup",l:"Superando o defeito",t:"dica"},
 {k:"conf",l:"Traços em coadjuvantes que geram conflito",t:"links",p:3}
],
tituloEntradas:"Os 100 defeitos",
notaEntradas:"em ordem alfabética",
teoria:[
{t:"Personagens com falhas, personagens humanas",html:`
<p>A gente lê para se reconhecer. Uma heroína sem defeitos é admirável por dois capítulos e depois fica distante, porque ninguém se vê nela. É o ciúme, a teimosia, a mania de controlar tudo que fazem o leitor pensar: <mark>eu também sou assim</mark>.</p>
<p>Defeitos também dão à história algo para resolver. Se a personagem já é perfeita, não tem para onde crescer. O defeito é o espaço entre quem ela é no começo e quem ela pode ser no fim.</p>
<div class="quadro"><span class="q">Emoção e personalidade</span><p>Emoções vêm e vão (são a parte 1 deste guia). A personalidade é estável: é o conjunto de traços que define como alguém costuma agir. ==Cada personagem é uma combinação única de qualidades e defeitos==, formada pela própria história de vida.</p></div>`},
{t:"O que é um defeito",html:`
<p>Um <b>traço</b> é qualquer atitude ou comportamento que ajuda a definir a personalidade. Os traços se dividem em três grupos:</p>
<ul><li><b>Qualidades</b> levam a crescimento e conquistas por meios saudáveis e fortalecem as relações. Estão na parte 3.</li><li><b>Defeitos</b> ==prejudicam as relações, ignoram o bem-estar dos outros e giram em torno de si==. São o assunto desta parte.</li><li><b>Traços neutros</b> não ajudam nem atrapalham por si (ser introvertida, por exemplo). Não entram aqui.</li></ul>
<div class="quadro"><span class="q">Defeito não é diagnóstico</span><p>Ser impulsiva, nervosa ou muito organizada não faz da personagem alguém com um transtorno. Um diagnóstico de saúde mental envolve sofrimento intenso e prejuízo sério na vida, e é feito por profissionais. Se a sua personagem tem uma condição clínica, pesquise com cuidado e evite estereótipos.</p></div>`},
{t:"De onde vêm os defeitos",html:`
<p>Ninguém nasce mesquinho ou desconfiado. Os defeitos se formam a partir de vários fatores, e saber de onde veio o defeito da sua personagem ajuda a escrevê-lo com verdade.</p>
<ul><li><b>Criação:</b> o que os pais ou cuidadores premiavam e puniam.</li><li><b>Modelos:</b> pessoas que a personagem admirou e imitou.</li><li><b>Ambiente:</b> pobreza, violência, excesso de conforto, rigidez religiosa, competição.</li><li><b>Temperamento:</b> tendências que parecem vir de berço.</li><li><b>Feridas do passado:</b> a origem mais rica para a ficção.</li></ul>
<h4>Ferida, mentira, defeito e máscara</h4>
<p>Quando algo doloroso acontece, a personagem tenta entender por quê. Muitas vezes chega a uma conclusão falsa sobre si mesma ou sobre o mundo, a <b>mentira</b>. Para nunca mais sentir aquela dor, ela adota comportamentos de proteção: os <b>defeitos</b>. E, para esconder esses defeitos dos outros, usa uma <b>máscara</b>, um papel que encena no dia a dia.</p>
${FLUXO([["Ferida","algo doloroso"],["Mentira","conclusão falsa"],["Defeito","escudo"],["Máscara","o papel encenado"]])}
<div class="cena">Lúcia viu o pai perder o emprego e a casa porque confiou num sócio. Concluiu que <em>quem confia é feito de bobo</em>. Virou uma adulta desconfiada e controladora, que confere cada recibo. Para os colegas, ela se apresenta como “a organizada do escritório”.</div>
<p>Repare que alguns defeitos são o ==lado sombrio de uma qualidade==: a confiança que vira soberba, o cuidado que vira controle, a beleza que vira vaidade. E o defeito principal de uma personagem quase sempre está ligado à sua ferida principal (a parte 6 trata das feridas em detalhe).</p>`},
{t:"Defeitos e o arco da personagem",html:`
<p>Toda personagem principal persegue algo. Esse objetivo tem duas camadas:</p>
<div class="tab-wrap"><table><thead><tr><th></th><th>O que é</th><th>Exemplo</th></tr></thead><tbody>
<tr><td><b>Motivação externa</b></td><td>O objetivo visível, que dá para medir.</td><td>Ganhar o concurso de confeitaria.</td></tr>
<tr><td><b>Conflito externo</b></td><td>O que se opõe a ela por fora.</td><td>Uma rival talentosa, um forno que quebra, o prazo.</td></tr>
<tr><td><b>Motivação interna</b></td><td>Por que ela quer isso, a necessidade por trás.</td><td>Provar à família que não é a filha fracassada.</td></tr>
<tr><td><b>Conflito interno</b></td><td>O que a sabota por dentro.</td><td>A crença de que, se errar, ninguém vai amá-la.</td></tr>
</tbody></table></div>
<p>O <mark>defeito fatal</mark> é aquele que impede a personagem de alcançar o que precisa. Enquanto ela não o enfrenta, não vence. É ele que precisa mudar ao longo da história.</p>
<p>Essa mudança não é uma linha reta. É um ==zigue-zague==: a personagem tenta, erra, recua, aprende um pouco, tropeça de novo. Ninguém muda por resolução de Ano-Novo. Ela só enfrenta o defeito quando fica encurralada, quando o jeito antigo para de funcionar. ==Cabe à autora criar esse motivo.==</p>`},
{t:"Defeitos que “funcionam”",html:`
<p>Se um defeito só trouxesse prejuízo, a personagem largaria dele rápido. Ela o mantém porque ele dá algum ganho: proteção, controle, atenção, conforto. O mentiroso evita brigas. A controladora se sente segura. O cínico nunca se decepciona.</p>
<p>Por isso cada entrada deste guia traz <b>aspectos positivos</b> e <b>negativos</b>. Entender o ganho escondido é o que torna o defeito ==convincente== e difícil de largar, e é isso que dá peso à mudança no fim.</p>`},
{t:"Defeitos nas relações",html:`
<p>Os defeitos aparecem mais nas relações, porque é ali que esbarram nas necessidades dos outros. O atrito tem três níveis:</p>
<div class="tab-wrap"><table><thead><tr><th>Nível</th><th>Como é</th></tr></thead><tbody>
<tr><td><b>Faíscas</b></td><td>Tensão por baixo da superfície: alfinetadas, olhares, silêncios. O leitor sente, mas ninguém briga.</td></tr>
<tr><td><b>Fogos de artifício</b></td><td>Discussão aberta, palavras que ferem, portas batidas.</td></tr>
<tr><td><b>Explosões</b></td><td>Ruptura. A confiança é destruída e a relação pode não ter volta.</td></tr>
</tbody></table></div>
<p>Pense na sua história como um <mark>termostato</mark>: você regula o calor do conflito cena a cena. Nem toda cena precisa explodir, mas toda relação importante precisa de alguma temperatura. O campo “Traços em coadjuvantes que geram conflito” de cada entrada mostra quais personalidades esquentam o ambiente.</p>`},
{t:"Construindo personagens do zero",html:`
<ul>
<li><b>Seja cruel com a personagem.</b> Escolha o defeito que mais vai atrapalhar o objetivo dela.</li>
<li><b>Sabote as qualidades.</b> Coloque-a numa situação em que justamente a força dela não ajuda.</li>
<li><b>Pense o passado de trás para frente.</b> Comece pelo defeito e pergunte: que experiência ensinaria alguém a agir assim?</li>
<li><b>Contraste os defeitos do elenco.</b> Uma personagem impulsiva ao lado de uma indecisa gera atrito natural.</li>
<li><b>Parta da sua experiência.</b> Os seus próprios defeitos são a fonte mais honesta que existe.</li>
<li><b>Escolha um defeito dominante.</b> Os outros ficam em segundo plano, para não confundir o leitor.</li>
</ul>`},
{t:"Vilões e seus defeitos",html:`
<ul>
<li><b>Respeite o antagonista.</b> Ele não existe só para atrapalhar. Ele também quer algo.</li>
<li><b>Dê motivações complexas.</b> Ninguém acorda querendo ser mau. Ele acredita que tem razão.</li>
<li><b>Cave o passado dele.</b> O vilão também tem ferida e mentira.</li>
<li><b>Escolha defeitos que ele vê como forças.</b> A crueldade, para ele, é eficiência. A manipulação é inteligência.</li>
<li><b>Use o vilão como espelho.</b> Muitas vezes ele mostra o que a heroína poderia virar se escolhesse o caminho errado.</li>
</ul>
<div class="quadro"><span class="q">Defeito fatal ou defeito trágico</span><p>O <b>defeito fatal</b> é superável e, quando a personagem o vence, ela conquista o objetivo. O <b>defeito trágico</b> é aquele que a personagem não supera, e que a leva à ruína. É o caminho de muitos vilões e anti-heróis.</p></div>
<h4>Estereótipos de vilão</h4>
<div class="tab-wrap"><table><thead><tr><th>Estereótipo</th><th>Problema</th><th>Saída</th></tr></thead><tbody>
<tr><td>Mau porque sim</td><td>Sem motivo, ninguém acredita.</td><td>Dê uma ferida e um objetivo compreensível.</td></tr>
<tr><td>Gênio infalível</td><td>Se nunca erra, não há suspense.</td><td>Dê a ele um ponto cego, quase sempre o seu defeito.</td></tr>
<tr><td>Vilão que explica o plano</td><td>Conveniente demais para a heroína.</td><td>Faça-o agir, não discursar.</td></tr>
<tr><td>Vilão caricato</td><td>Risada maligna e capa preta não assustam.</td><td>Ele parece uma pessoa comum, e por isso assusta.</td></tr>
<tr><td>Doença mental como causa</td><td>Reforça estigma contra pessoas reais.</td><td>A maldade vem de escolhas e crenças, não de um diagnóstico.</td></tr>
</tbody></table></div>`},
{t:"O que saber sobre os defeitos da sua personagem",html:`
<ul><li><b>Comportamentos e atitudes:</b> como o defeito aparece no dia a dia.</li><li><b>Pensamentos:</b> a lógica interna que o justifica.</li><li><b>Sensibilidades emocionais:</b> quais emoções o defeito protege e quais ele dispara. Aqui a parte 2 se conecta com a parte 1.</li></ul>`},
{t:"Como mostrar os defeitos",html:`
<p>Na vida real, ninguém narra os defeitos dos outros: a gente percebe pelo comportamento. Na ficção é igual.</p>
<ul>
<li><b>Comportamentos e manias:</b> a mesquinha que divide a conta do restaurante centavo por centavo.</li>
<li><b>Pontos sensíveis:</b> o assunto que tira a personagem do sério.</li>
<li><b>Defeitos como obstáculos:</b> mostre o defeito atrapalhando um objetivo concreto.</li>
<li><b>Evolução gradual:</b> o defeito deve diminuir aos poucos, com recaídas.</li>
<li><b>Relações:</b> como os outros reagem ao defeito diz muito sobre ele.</li>
<li><b>Evitação e gatilhos:</b> o que a personagem evita revela do que ela se protege.</li>
</ul>
<div class="cena">Na festa de aniversário da sobrinha, Ricardo reclama do som alto, da fila do bolo e do refrigerante quente. Quando a irmã pede ajuda para recolher os pratos, ele já foi embora.</div>
<p>Ninguém escreveu “Ricardo é egoísta e ranzinza”. Não precisou.</p>`},
{t:"Dificuldades comuns",html:`
<h4>Personagens antipáticas</h4>
<p>Defeitos demais afastam o leitor. Equilibre com pelo menos ==uma qualidade forte e admirável== e mostre-a cedo, nas primeiras páginas: um gesto de bondade, de coragem, de lealdade. Outra saída é a situação desesperadora: quando a personagem está num beco sem saída, o leitor torce até por quem é difícil de gostar.</p>
<h4>Motivação confusa</h4>
<p>Tenha clareza das duas motivações: o que a personagem quer (externa) e por que quer (interna, quase sempre ligada à autoestima). Toda cena deve empurrar a história nessa direção e funcionar como uma pequena história, com começo, meio e fim.</p>
<h4>Arco inconsistente</h4>
<p>Quando a personagem muda aos saltos ou não muda nada, as causas costumam ser três: a autora não sabe bem o que ela quer, não a conhece o bastante, ou não deu a ela uma motivação interna.</p>
<div class="quadro"><span class="q">Regra de ouro</span><p>Toda personagem importante precisa mudar, para melhor ou para pior, de forma gradual e coerente, até não caber mais no mundo do jeito que estava no começo.</p></div>`}
],
grupos:[{nome:"A a D",itens:[]},{nome:"E a H",itens:[]},{nome:"I",itens:[]},{nome:"M a P",itens:[]},{nome:"R a V",itens:[]}]
});
