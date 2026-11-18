// PARTE 3 — QUALIDADES DE PERSONAGEM (configuração e introdução)
window.E3=(nome,cat,def,sem,causas,comp,pens,emo,pos,neg,lado,ex,conf,cen,nota,alias)=>({nome,cat,def,sem,causas,comp,pens,emo,pos,neg,lado,ex,conf,cen,nota,alias});
// Pirâmide das necessidades (Maslow) em cores do arco-íris, reaproveitada em outras partes
window.PIRAMIDE=(rotulos)=>{const n=[["Autorrealização","propósito, crescimento, verdade",290],["Estima e reconhecimento","respeito, valor, identidade",230],["Amor e pertencimento","afeto, amizade, aceitação",130],["Segurança","estabilidade, saúde, proteção",45],["Fisiológicas","comida, água, sono, abrigo",0]];
 const W=560,H=330;let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Pirâmide das necessidades humanas" style="font-family:var(--display)">`;
 n.forEach(([t,d,h],i)=>{const y0=10+i*62,y1=y0+58,top=W/2-(30+i*52),bot=W/2-(30+(i+1)*52);const tw=W/2-top,bw=W/2-bot;
  s+=`<path d="M${W/2-tw} ${y0} L${W/2+tw} ${y0} L${W/2+bw} ${y1} L${W/2-bw} ${y1}z" style="fill:hsl(${h} 72% 58%)"/>`;
  s+=`<text x="${W/2}" y="${y0+26}" text-anchor="middle" style="fill:#fff;font-weight:800;font-size:${i?15:13}px">${t}</text>`;
  s+=`<text x="${W/2}" y="${y0+44}" text-anchor="middle" style="fill:#fff;font-size:${i?12:10}px">${(rotulos&&rotulos[i])||d}</text>`;});
 return `<div class="diagrama">${s}</svg></div>`};

GUIA.add({
n:3,
chamada:"Qualidades que fazem o leitor torcer pela personagem, organizadas em quatro categorias, com os desafios que colocam cada força à prova.",
campos:[
 {k:"def",l:"Definição",t:"texto"},
 {k:"nota",l:"Notas",t:"texto"},
 {k:"cat",l:"Categorias",t:"chips"},
 {k:"sem",l:"Qualidades semelhantes",t:"chips"},
 {k:"causas",l:"Causas possíveis",t:"lista"},
 {k:"comp",l:"Comportamentos associados",t:"lista"},
 {k:"pens",l:"Pensamentos associados",t:"lista"},
 {k:"emo",l:"Emoções associadas",t:"links",p:1},
 {k:"pos",l:"Aspectos positivos",t:"texto"},
 {k:"neg",l:"Aspectos negativos",t:"texto"},
 {k:"lado",l:"Em excesso, pode virar",t:"links",p:2},
 {k:"ex",l:"Exemplos da ficção",t:"lista"},
 {k:"conf",l:"Traços em coadjuvantes que geram conflito",t:"links",p:2},
 {k:"cen",l:"Cenários desafiadores",t:"dica"}
],
tituloEntradas:"As qualidades",
notaEntradas:"inclui traços neutros, marcados na categoria",
teoria:[
{t:"O gancho definitivo",html:`
<p>Sofrimento gera simpatia. Mas simpatia não basta para o leitor atravessar trezentas páginas com uma personagem. O que cria <mark>empatia</mark> de verdade é ver nela ==uma qualidade que admiramos== (coragem, lealdade, senso de humor) colocada à prova.</p>
<p>Mostre essa qualidade cedo, de preferência nas primeiras páginas, e insinue o porquê dela. O leitor que entende de onde vem a força da personagem quer descobrir até onde ela vai.</p>
<div class="cena">Joana chega atrasada ao primeiro dia do estágio porque parou para ajudar um senhor que caiu no ponto de ônibus. Leva bronca do chefe e não se justifica.</div>`},
{t:"O que é uma qualidade",html:`
<p>Qualidades são traços que ajudam a personagem a crescer e a se relacionar de forma saudável, levando em conta o bem-estar dos outros. Os defeitos (parte 2) fazem o contrário.</p>
<p>Esta parte também inclui alguns <b>traços neutros</b>, como ser introvertida, extrovertida, reservada ou excêntrica. Eles não ajudam nem atrapalham por si, mas ajudam a definir quem a personagem é. Nas entradas, aparecem marcados como “neutro”.</p>
<div class="quadro"><span class="q">Força ou fraqueza?</span><p>Às vezes é difícil saber de que lado um traço está. A lealdade que protege o amigo pode encobrir um crime. Por isso cada entrada traz o campo “Em excesso, pode virar”, com o defeito vizinho.</p></div>`},
{t:"Necessidades e moral",html:`
<p>As qualidades nascem de dois lugares: daquilo que a personagem acredita ser certo (a <b>moral</b>) e daquilo de que ela precisa (as <b>necessidades</b>). O psicólogo Abraham Maslow organizou as necessidades humanas em cinco níveis. Quanto mais na base, mais urgente:</p>
${PIRAMIDE()}
<p>Quando uma necessidade da base é ameaçada, a personagem pode ==agir contra o próprio caráter==. A mulher honesta pode roubar comida para o filho. É nesse ponto de ruptura que a ficção fica interessante.</p>
<p>A moral é a base dos traços mais fortes. Uma personagem que valoriza justiça vai desenvolver qualidades ligadas a ela, e vai sofrer quando precisar escolher entre justiça e sobrevivência.</p>`},
{t:"As quatro categorias de qualidades",html:`
<div class="tab-wrap"><table><thead><tr><th>Categoria</th><th>O que reúne</th><th>Exemplos</th></tr></thead><tbody>
<tr><td><b>Morais</b></td><td>O que a personagem considera certo e justo.</td><td>Honestidade, lealdade, justiça, generosidade.</td></tr>
<tr><td><b>De realização</b></td><td>O que a ajuda a alcançar objetivos.</td><td>Disciplina, persistência, organização, engenhosidade.</td></tr>
<tr><td><b>Interativas</b></td><td>O que facilita a convivência. É a categoria com mais traços.</td><td>Paciência, cortesia, senso de humor, empatia.</td></tr>
<tr><td><b>De identidade</b></td><td>O que a define como indivíduo.</td><td>Criatividade, espiritualidade, introversão, curiosidade.</td></tr>
</tbody></table></div>
<p>==Toda protagonista deveria ter pelo menos uma qualidade de cada categoria.== Isso dá volume: ela tem princípios, sabe conquistar o que quer, se relaciona com os outros e tem algo só dela.</p>`},
{t:"Como as qualidades se desenvolvem",html:`
<ul><li><b>Genética e temperamento:</b> algumas tendências parecem vir de berço.</li><li><b>Ética e valores:</b> o que a família, a religião ou a comunidade ensinou.</li><li><b>Criação e cuidadores:</b> o que foi elogiado e o que foi cobrado.</li><li><b>Experiências negativas:</b> ==a dor também gera qualidades==. Quem passou fome pode se tornar generosa.</li><li><b>Ambiente físico:</b> crescer no sertão, na beira do rio ou num apartamento pequeno molda hábitos.</li><li><b>Amigos e colegas:</b> o grupo reforça certos traços.</li></ul>`},
{t:"Qualidades e o arco da personagem",html:`
<p>Na parte 2 vimos o caminho ferida → mentira → defeito. As qualidades entram do outro lado da balança. Muitas vezes a personagem ==enxerga suas qualidades como defeitos==: acha que a sensibilidade a torna fraca, que a gentileza a torna boba.</p>
<p>No clímax, é justamente essa qualidade que a faz vencer o defeito fatal. A sensibilidade que ela escondia é o que a faz perceber a mentira do vilão. É por isso que a qualidade precisa estar presente desde o início, mesmo quando abafada.</p>`},
{t:"Construindo do zero",html:`
<p>Há duas portas de entrada:</p>
<ul><li><b>Se você parte da trama:</b> que qualidades a personagem precisa para enfrentar esta história? E qual defeito vai atrapalhar?</li><li><b>Se você parte da personagem:</b> quem ela é, o que viveu, o que valoriza? Que trama colocaria tudo isso à prova?</li></ul>
<h4>Recursos</h4>
<ul><li><b>Use as quatro categorias</b> para não esquecer nenhum lado dela.</li><li><b>Disfarce uma força como fraqueza.</b> Ela acha que a teimosia a atrapalha, e descobre que é o que a salva.</li><li><b>Escolha algo inesperado.</b> A segurança de boate que é delicada com flores. O motoboy que escreve poesia.</li><li><b>Saiba quanto é demais.</b> Uma qualidade principal, duas ou três de apoio. Mais do que isso e a personagem fica perfeita, e perfeita é chata.</li></ul>`},
{t:"Qualidades e vilões",html:`
<ul><li><b>Investigue o passado do vilão</b> e dê a ele um arco completo, com ferida, mentira e motivações.</li><li><b>Faça-o forte.</b> Quanto maior o adversário, maior a vitória da heroína. Dê a ele qualidades reais: inteligência, disciplina, carisma.</li><li><b>Dê dimensões.</b> Vilões também têm moral, só que distorcida. Muitas vezes a qualidade que os define é ==de realização ou de identidade==, não moral: são persistentes, engenhosos, visionários.</li></ul>`},
{t:"O que saber sobre as qualidades da sua personagem",html:`
<ul><li><b>Comportamentos e atitudes:</b> a mesma qualidade aparece diferente conforme os outros traços. A generosidade de uma pessoa tímida é discreta; a de uma extrovertida, festiva.</li><li><b>Pensamentos que contradizem as ações:</b> ela ajuda reclamando por dentro.</li><li><b>Amplitude emocional:</b> quanto ela mostra e quanto esconde.</li><li><b>O lado negativo:</b> toda qualidade tem um custo.</li></ul>`},
{t:"Como mostrar as qualidades",html:`
<ul><li><b>Ações e manias:</b> a personagem organizada que alinha os talheres na mesa do restaurante.</li><li><b>Relações:</b> o que os outros dizem dela e como a tratam.</li><li><b>Pensamentos:</b> o que ela pensa ao ver alguém em dificuldade.</li><li><b>Crises e escolhas:</b> ==é sob pressão que a qualidade se prova==.</li><li><b>Evolução:</b> os defeitos mudam ao longo da história; as qualidades se mantêm e se fortalecem.</li></ul>`},
{t:"Quando o leitor não se interessa",html:`
<div class="tab-wrap"><table><thead><tr><th>Armadilha</th><th>O que acontece</th><th>Saída</th></tr></thead><tbody>
<tr><td>Personagem irreal</td><td>A autora não a conhece a fundo, a voz não é única ou a emoção soa falsa.</td><td>Escreva a história de vida dela, mesmo que nada entre no livro.</td></tr>
<tr><td>Herói sem defeitos</td><td>Não há arco porque não há o que mudar.</td><td>Dê um defeito fatal ligado a uma ferida.</td></tr>
<tr><td>Personagem plana</td><td>Estereótipo, um traço só, ou passividade.</td><td>Use as quatro categorias e dê a ela escolhas ativas.</td></tr>
<tr><td>Riscos insuficientes</td><td>Nada importante pode ser perdido.</td><td>Ligue os riscos às necessidades básicas, crie um prazo e aumente os obstáculos.</td></tr>
<tr><td>Vilão insignificante</td><td>A vitória não vale nada.</td><td>Dê ao vilão qualidades reais e um objetivo compreensível.</td></tr>
</tbody></table></div>`}
],
grupos:[{nome:"A a B",itens:[]},{nome:"C",itens:[]},{nome:"D a I",itens:[]},{nome:"J a P",itens:[]},{nome:"R a V",itens:[]}]
});
