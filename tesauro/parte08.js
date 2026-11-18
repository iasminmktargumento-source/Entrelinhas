// PARTE 8 — CONFLITOS, VOLUME 1 (configuração e introdução)
window.E8=(nome,ex,menor,desastre,emo,luta,neg,nec,posit,result,nota)=>({nome,nota,ex,menor,desastre,emo,luta,neg,nec,posit,result});
window.CAMPOS_CONFLITO=[
 {k:"nota",l:"Notas",t:"texto"},
 {k:"ex",l:"Exemplos",t:"lista"},
 {k:"menor",l:"Complicações menores",t:"lista"},
 {k:"desastre",l:"Consequências potencialmente desastrosas",t:"lista"},
 {k:"emo",l:"Emoções resultantes",t:"links",p:1},
 {k:"luta",l:"Possíveis lutas internas",t:"lista"},
 {k:"neg",l:"Defeitos que podem piorar a situação",t:"links",p:2},
 {k:"nec",l:"Impacto nas necessidades básicas",t:"paras"},
 {k:"posit",l:"Qualidades que ajudam a lidar",t:"links",p:3},
 {k:"result",l:"Resultados positivos",t:"dica"}
];
const ENREDOS=()=>{const f=[["Da miséria à riqueza","M10 70 C60 66 110 30 150 12",0],["Da riqueza à ruína","M10 12 C60 16 110 52 150 70",30],["O buraco","M10 20 C50 76 110 76 150 20",60],["Ícaro","M10 70 C50 0 110 0 150 70",130],["Cinderela","M10 60 C35 20 55 20 75 60 S120 0 150 12",200],["Édipo","M10 20 C35 70 55 70 75 30 S120 80 150 70",280]];
 let s=`<svg viewBox="0 0 540 250" width="540" role="img" aria-label="Seis formatos de enredo" style="font-family:var(--display)">`;
 f.forEach(([t,d,h],i)=>{const x=(i%3)*180,y=Math.floor(i/3)*125;
  s+=`<g transform="translate(${x+10} ${y+8})"><rect width="160" height="110" rx="12" style="fill:hsl(${h} 80% var(--Lf));stroke:hsl(${h} 60% var(--Lm))"/><g transform="translate(0 20)"><path d="${d}" style="fill:none;stroke:hsl(${h} 70% 50%);stroke-width:4;stroke-linecap:round"/></g><text x="80" y="104" text-anchor="middle" style="fill:hsl(${h} 70% var(--L1));font-size:13px;font-weight:700">${t}</text></g>`;});
 return `<div class="diagrama">${s}</svg></div>`};
GUIA.add({
n:8,
chamada:"Atritos, erros, dilemas morais, deveres, prazos e escolhas impossíveis. Os obstáculos que bloqueiam a personagem por fora e a obrigam a crescer por dentro.",
campos:CAMPOS_CONFLITO,
tituloEntradas:"Os conflitos",
notaEntradas:"em seis grupos",
teoria:[
{t:"O papel do conflito: moldar personagens",html:`
<p>Na vida real, fugimos do conflito. Na ficção, não nos cansamos dele. O livro deixa o leitor sentir o perigo em segurança, e é isso que torna a leitura tão envolvente.</p>
<p>O que dá sabor à vitória é saber ==quanto ela custou==. Uma personagem que consegue tudo sem esforço não emociona ninguém.</p>
<p>O <b>conflito externo</b> move a trama. O <b>conflito interno</b> põe a personagem diante de uma escolha: continuar vivendo com medo ou mudar com coragem. Ganhando ou perdendo, quem ela é no começo não é quem ela é no fim.</p>`},
{t:"A combinação de trama e conflito",html:`
<p>Pesquisas sobre milhares de histórias identificaram poucos formatos básicos de enredo, desenhados pela sorte da personagem ao longo do tempo:</p>
${ENREDOS()}
<p>Os formatos são poucos, mas ==o conflito é o que torna cada história nova==. Duas histórias “da miséria à riqueza” podem não ter nada em comum, porque os obstáculos são outros.</p>
<h4>As formas clássicas de conflito</h4>
<ul><li>Personagem contra personagem.</li><li>Contra a sociedade.</li><li>Contra a natureza.</li><li>Contra a tecnologia.</li><li>Contra o sobrenatural.</li><li>Contra si mesma.</li></ul>
<p>Toda história mistura várias, mas tem um <mark>conflito central</mark>.</p>`},
{t:"Conflito é embate",html:`
<p>O conflito interno é a disputa entre ==necessidade, desejo, medo e crença falsa==. A personagem precisa de amor, mas acredita que não merece. Quer o emprego, mas tem medo de falhar.</p>
<p>Cada conflito externo pede uma escolha, e cada escolha muda a visão de mundo da personagem. O resultado de um conflito deixa marcas para o próximo: uma vitória fortalece, um golpe gera desconfiança.</p>
<div class="cena">No estacionamento do supermercado, uma senhora pede ajuda para carregar as compras. Bruna ajuda. Quando volta para o carro, a bolsa sumiu do banco. Na semana seguinte, um rapaz pede informação na rua e ela atravessa sem responder.</div>
<p>Varie os tipos de conflito e misture formas. A originalidade está na combinação.</p>`},
{t:"As categorias de conflito",html:`
<div class="tab-wrap"><table><thead><tr><th>Categoria</th><th>O que ela põe à prova</th></tr></thead><tbody>
<tr><td><b>Atritos nos relacionamentos</b></td><td>Ninguém vive sozinho. A teia de conexões faz um atrito puxar outros.</td></tr>
<tr><td><b>Fracassos e erros</b></td><td>Depois do erro há dois caminhos: o pânico ou o aprendizado.</td></tr>
<tr><td><b>Dilemas morais e tentações</b></td><td>No dilema, a escolha é entre dois valores. Na tentação, entre certo e errado. As zonas cinzentas atraem o leitor.</td></tr>
<tr><td><b>Dever e responsabilidade</b></td><td>O choque entre trabalho e casa, e a culpa de deixar alguém na mão.</td></tr>
<tr><td><b>Pressão e contagem regressiva</b></td><td>A pressão revela quem a personagem é. Pode vir de fora ou de dentro.</td></tr>
<tr><td><b>Cenários sem saída</b></td><td>Escolhas impossíveis que viram feridas (parte 6). O caminho da cura é perceber que fez o melhor possível com o que sabia.</td></tr>
</tbody></table></div>`},
{t:"Riscos: o ingrediente indispensável",html:`
<p>O leitor só se importa quando ==algo valioso está em jogo==.</p>
<ul><li><b>Riscos amplos:</b> atingem muita gente (uma cidade, um país).</li><li><b>Riscos morais:</b> a personagem pode perder a integridade.</li><li><b>Riscos primais:</b> ligados à “morte” de algo: inocência, relação, sonho, reputação, vida.</li><li><b>Riscos pessoais:</b> o que importa só para ela.</li></ul>
<p>Mesmo quando o risco é coletivo, dê à personagem algo pessoal a perder. O fim do mundo emociona menos do que a filha dela presa do outro lado da ponte.</p>
<p>Mais do que simpática, a personagem precisa ter um mundo interior com o qual o leitor se identifique.</p>`},
{t:"Conflito interno em profundidade",html:`
<p>Conflito externo vem de fora: uma tempestade, uma rejeição, o carro quebrado. Conflito interno é a personagem ==querendo coisas que se contradizem==. Os dois costumam estar ligados, e o interno é o que mais conecta o leitor.</p>
<h4>No nível da história</h4>
<p>Uma fórmula útil: <b>A quer B por causa de Y</b>. A é a personagem, B o objetivo, Y a motivação interna. O conflito interno bloqueia justamente Y, quase sempre ligado à autoestima ou à realização.</p>
<h4>Como identificar o conflito interno central</h4>
<ul><li>O maior medo.</li><li>As crenças morais.</li><li>Questões existenciais.</li><li>Desejo contra necessidade.</li><li>Segredos.</li></ul>
<h4>No nível da cena</h4>
<p>Toda cena tem um objetivo ligado ao objetivo maior, e toda cena precisa de conflito. Para fortalecê-la, acrescente um elemento interno.</p>
<div class="cena"><b>Só externo:</b> Patrícia precisa terminar o bolo do concurso de confeitaria antes do tempo acabar, e o forno da bancada esquenta demais.<br><b>Com interno:</b> o júri inclui a chef que a demitiu anos atrás dizendo que ela “não tinha mão”. Cada vez que olha para a mesa dos jurados, Patrícia erra uma medida.</div>
<h4>Como o conflito interno aparece</h4>
<ul><li><b>Por dentro:</b> pensamentos obsessivos, evitação, oscilar entre opções, insegurança.</li><li><b>Por fora:</b> compensar para mais ou para menos, distração, instabilidade emocional, erros, crenças que mudam aos poucos.</li></ul>
<p>Em arcos estáticos e cenas de muita ação, o conflito interno aparece menos, mas pequenos momentos de dúvida ainda humanizam.</p>`},
{t:"Lições do fracasso",html:`
<p>O <b>defeito fatal</b> é o jeito antigo e ineficaz de lidar com a vida, o ponto cego da personagem. O fracasso tem três funções:</p>
<ol><li>Destaca o defeito.</li><li>Mostra que é preciso mudar.</li><li>Empurra a personagem para métodos novos.</li></ol>
<p>O padrão costuma ser ==um passo à frente, dois para trás==: fracassos totais, depois vitórias parciais e, só no fim, a vitória completa.</p>`},
{t:"Conflito, escolhas e consequências",html:`
<p>O <mark>ciclo dos três Cs</mark>: o conflito exige uma resposta, a escolha define o próximo passo e a consequência gera novos problemas. Não escolher também é uma escolha.</p>
<h4>Tipos de escolha</h4>
<div class="tab-wrap"><table><thead><tr><th>Tipo</th><th>Como funciona</th></tr></thead><tbody>
<tr><td>Simples</td><td>Uma opção é claramente melhor.</td></tr>
<tr><td>Ganha-ganha</td><td>Só funciona na ficção se houver um preço escondido.</td></tr>
<tr><td>Ganha-perde</td><td>Ganhar algo implica perder outra coisa.</td></tr>
<tr><td>Dilema</td><td>Duas opções de valor parecido.</td></tr>
<tr><td>Pegar ou largar</td><td>Uma única opção, ou nada.</td></tr>
<tr><td>Escolha impossível</td><td>Duas opções terríveis.</td></tr>
<tr><td>Falsa escolha</td><td>Os dois caminhos levam ao mesmo fim.</td></tr>
<tr><td>Escolha moral</td><td>O certo contra o conveniente.</td></tr>
<tr><td>Agir ou não agir</td><td>Intervir ou ficar de fora.</td></tr>
</tbody></table></div>
<h4>Como complicar a escolha</h4>
<ul><li>Ponha frente a frente coisas equivalentes (dois medos, duas necessidades) ou opostas (medo contra necessidade, dever contra liberdade).</li><li>Esconda consequências.</li><li>Tire uma informação importante.</li><li>Exija um sacrifício.</li><li>Ofereça a tentação do caminho errado.</li></ul>
<p><b>A terceira via:</b> às vezes a melhor saída é criativa e inesperada. O leitor adora quando a personagem encontra uma opção que ninguém viu.</p>`},
{t:"Adversários na ficção",html:`
<div class="tab-wrap"><table><thead><tr><th>Tipo</th><th>O que o define</th></tr></thead><tbody>
<tr><td>Competidor</td><td>Quer a mesma coisa, sem ser pessoal.</td></tr>
<tr><td>Rival</td><td>A disputa é pessoal.</td></tr>
<tr><td>Antagonista</td><td>Opõe-se ao objetivo da protagonista.</td></tr>
<tr><td>Força antagônica</td><td>Natureza, sistema, tecnologia ou a própria personagem.</td></tr>
<tr><td>Vilão</td><td>Tem intenção de ferir.</td></tr>
<tr><td>Inimigo</td><td>Rótulo que depende do ponto de vista.</td></tr>
<tr><td>Falso amigo</td><td>Parece aliado e não é.</td></tr>
<tr><td>Invejoso</td><td>Quer o que ela tem.</td></tr>
<tr><td>Valentão</td><td>Usa força ou status para intimidar.</td></tr>
<tr><td>Intrometido</td><td>Atrapalha sem má intenção.</td></tr>
<tr><td>Nêmesis</td><td>O adversário que a define.</td></tr>
<tr><td>Desafiante</td><td>Ameaça uma situação confortável.</td></tr>
</tbody></table></div>
<p>Todo adversário precisa de ==um porquê convincente==, mesmo que o leitor não aprove os métodos.</p>`},
{t:"Onde buscar conflito",html:`
<ul>
<li><b>Comece pelo elenco:</b> pessoas são a maior fonte de atrito.</li>
<li><b>Deixe as personagens falarem:</b> interromper, falta de tato, não ouvir; mentir, ameaçar, desviar o assunto, expor um segredo, insinuar, fazer piada ofensiva; motivações opostas na mesma conversa.</li>
<li><b>Explore o cenário</b> (partes 4 e 5): lugares com valor emocional, clima, falta de transporte, plateia, símbolos, prazos.</li>
<li><b>O local de trabalho</b> (parte 7).</li>
<li><b>O conflito interno</b> de cada personagem.</li>
<li><b>Observe a vida real:</b> conversas no ônibus, notícias, histórias da família.</li>
</ul>
<div class="quadro"><span class="q">Regra de ouro</span><p>O conflito precisa servir à história, não encher páginas.</p></div>`}
],
grupos:[{nome:"Atritos nos relacionamentos",itens:[]},{nome:"Fracassos e erros",itens:[]},{nome:"Dilemas morais e tentações",itens:[]},{nome:"Dever e responsabilidade",itens:[]},{nome:"Pressão e contagem regressiva",itens:[]},{nome:"Cenários sem saída",itens:[]}]
});
