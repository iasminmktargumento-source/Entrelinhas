// PARTE 4 — CENÁRIOS RURAIS E PESSOAIS (configuração e introdução)
window.E4=(nome,ve,sons,cheiros,sabores,tato,conf,pessoas,rel,notas,ex,tec,efe)=>({nome,ve,sons,cheiros,sabores,tato,conf,pessoas,rel,notas,ex,tec,efe});
window.CAMPOS_CENARIO=[
 {k:"ve",l:"O que se vê",t:"lista"},
 {k:"sons",l:"Sons",t:"lista"},
 {k:"cheiros",l:"Cheiros",t:"lista"},
 {k:"sabores",l:"Sabores",t:"lista"},
 {k:"tato",l:"Texturas e sensações",t:"lista"},
 {k:"conf",l:"Fontes possíveis de conflito",t:"lista"},
 {k:"pessoas",l:"Pessoas comumente encontradas",t:"chips"},
 {k:"rel",l:"Cenários relacionados",t:"links"},
 {k:"notas",l:"Notas e dicas",t:"texto"},
 {k:"ex",l:"Exemplo de descrição",t:"dica"},
 {k:"tec",l:"Técnicas usadas",t:"chips"},
 {k:"efe",l:"Efeitos alcançados",t:"chips"}
];
GUIA.add({
n:4,
chamada:"Lugares de casa, da escola, do campo e da natureza, descritos pelos cinco sentidos, com o que pode dar errado em cada um. Universais e brasileiros.",
campos:CAMPOS_CENARIO,
tituloEntradas:"Os cenários",
notaEntradas:"organizados em quatro grupos",
teoria:[
{t:"Mais do que pano de fundo",html:`
<p>O cenário costuma ser tratado como o palco onde a história acontece. Mas ele pode fazer muito mais: <mark>criar clima, revelar quem a personagem é, carregar símbolos, mover a trama e despertar emoções</mark>. Um quintal não é só um quintal. É o lugar onde a personagem aprendeu a andar de bicicleta, onde o pai foi embora, onde ela escondeu a carta.</p>
<p>O leitor só entra num lugar pelos sentidos. Se ele sente o cheiro de terra molhada e ouve as cigarras, ele está lá. É por isso que cada entrada desta parte é organizada pelos cinco sentidos.</p>
<div class="quadro"><span class="q">Como esta parte foi adaptada</span><p>Os cenários reúnem lugares universais (cozinha, praia, caverna) e lugares muito nossos: laje, casa de vó, almoço de domingo, vaquejada, casa de farinha, cerrado, caatinga, Pantanal. Alguns cenários típicos dos Estados Unidos ficaram de fora porque raramente aparecem em histórias brasileiras.</p></div>`},
{t:"Cenários que criam conexão emocional",html:`
<p>Pense nos lugares de livros que você nunca esqueceu. Eles não eram apenas bem descritos: ==significavam algo para alguém==. O leitor quer voltar a um cenário quando sente o que a personagem sente ali.</p>
<ul><li>Mostre o lugar pelos olhos de quem tem uma relação com ele.</li><li>Escolha detalhes que só aquele lugar teria.</li><li>Deixe o lugar mudar ao longo da história, junto com a personagem.</li></ul>`},
{t:"O cenário como fonte de conflito",html:`
<h4>Obstáculos físicos</h4><p>Uma estrada de terra que vira lama na chuva, uma ponte caída, um rio cheio. O lugar pode bloquear o caminho de forma literal.</p>
<h4>Espelhos de um passado doloroso</h4><p>Voltar ao lugar da ferida (a casa da infância, a escola onde sofreu bullying) obriga a personagem a encarar o que evitava. Aqui esta parte conversa com a parte 6, de feridas.</p>
<h4>Pessoas que criam problemas</h4><p>Todo lugar tem gente. O vizinho intrometido, a diretora rígida, o capataz.</p>
<h4>Disfunção familiar</h4><p>==Os cenários de casa são os mais carregados de conflito==, porque concentram histórias, mágoas e papéis antigos. Um almoço de domingo pode ser mais tenso que uma cena de ação.</p>`},
{t:"O cenário e o clima da cena",html:`
<h4>Tempo e estações</h4><p>Chuva, seca, calor e frio mexem com o humor. Evite o clichê (chuva sempre que alguém está triste) e prefira o contraste ou o detalhe inesperado. Descreva o tempo quando ele importar, não por hábito.</p>
<h4>Luz e sombra</h4><p>A luz da tarde entrando pela janela da cozinha cria aconchego. A lâmpada piscando no corredor cria inquietação. Use a iluminação para guiar o sentimento do leitor.</p>
<h4>A escolha do narrador</h4><p>==O mesmo lugar muda conforme quem olha.== A sala de aula é prisão para quem odeia a escola e refúgio para quem apanha em casa.</p>
<div class="cena">Para Marina, a cozinha da avó cheirava a café e bolo de milho. Para o primo Lucas, que passou ali o verão em que os pais se separaram, cheirava a gordura velha e silêncio.</div>
<h4>Contraste</h4><p>Uma tragédia num dia lindo de sol pesa mais do que numa noite de tempestade.</p>
<h4>Estilo</h4><p>Frases curtas aceleram. Frases longas desaceleram. Palavras ásperas ou macias também mudam o clima.</p>
<h4>Prenúncio</h4><p>Um detalhe do cenário pode anunciar o que vem: a cerca quebrada, o cachorro que não para de latir, a nuvem escura no horizonte.</p>`},
{t:"O cenário e o rumo da história",html:`
<ul><li><b>Necessidades:</b> o lugar pode expor o que falta à personagem. Uma casa sempre vazia mostra a necessidade de pertencimento.</li><li><b>Testes:</b> o lugar pode pôr a personagem à prova. A trilha que exige coragem, a festa que exige enfrentar a família.</li><li><b>Reflexão:</b> lugares seguros e com significado pessoal (o banco da praça, a beira do rio) são bons para os momentos em que ela pensa e decide.</li></ul>`},
{t:"Linguagem figurada",html:`
<h4>Comparação e metáfora</h4><p>A comparação usa “como”: <em>o pasto seco era como um tapete gasto</em>. A metáfora afirma diretamente: <em>o pasto era um tapete gasto</em>. Escolha imagens que façam sentido ==para a personagem==: uma costureira compara coisas a tecidos, um mecânico a motores.</p>
<h4>Simbolismo</h4><p>Alguns símbolos são universais (a porta como passagem, o rio como tempo). Outros são pessoais: o pé de manga que o pai plantou.</p>
<h4>Motivos</h4><p>Um símbolo que volta várias vezes ao longo do livro reforça o tema. O mesmo pé de manga florido no começo, seco no meio e brotando no fim.</p>
<h4>Hipérbole</h4><p>O exagero proposital, ótimo para humor ou para mostrar emoção intensa: <em>aquela estrada tinha mais buraco que asfalto</em>.</p>
<h4>Personificação</h4><p>Dar ações humanas a coisas: <em>a casa velha gemia a cada passo</em>. Ajuda a dar vida e clima ao lugar.</p>`},
{t:"Problemas comuns",html:`
<ul>
<li><b>Descrição longa demais:</b> parágrafos inteiros de paisagem fazem o leitor pular. Espalhe os detalhes pela ação.</li>
<li><b>Confusão de tempo:</b> se a cena começa de manhã, o leitor precisa saber quando anoiteceu.</li>
<li><b>Flashbacks e sonhos:</b> marque bem a entrada e a saída, para o leitor não se perder.</li>
<li><b>Mostrar ou contar:</b> nem tudo precisa ser mostrado. Lugares de passagem podem ser só nomeados. Guarde a descrição rica para os lugares que importam.</li>
</ul>`},
{t:"Cuidados com cenários rurais e de natureza",html:`
<ul>
<li><b>Pesquise:</b> que plantas existem naquela região, que bichos, em que época chove. O leitor do interior percebe quando a autora inventou.</li>
<li><b>Coloque ação na descrição:</b> a personagem atravessa o rio, sobe a serra, espanta os mosquitos.</li>
<li><b>Use contraste para mostrar escala:</b> uma pessoa pequena diante da chapada, um barco minúsculo no rio largo.</li>
<li><b>Fuja do óbvio:</b> em vez do pôr do sol, o cheiro do curral ou o barulho do gerador.</li>
<li><b>Dê atenção aos lugares comuns:</b> até o banheiro da casa pode ser memorável se tiver um detalhe certo.</li>
</ul>`},
{t:"Como ler as entradas",html:`
<p>Cada cenário traz os cinco sentidos, as fontes de conflito, quem costuma estar ali, cenários relacionados (links), notas e um ==exemplo de descrição== original, seguido das técnicas usadas e dos efeitos alcançados. O exemplo mostra na prática uma das técnicas da introdução.</p>
<p>Quando um lugar não tem sabores próprios, a entrada sugere apostar nos outros quatro sentidos.</p>`}
],
grupos:[{nome:"Em casa",itens:[]},{nome:"Na escola",itens:[]},{nome:"Paisagens rurais",itens:[]},{nome:"Natureza e relevo",itens:[]}]
});
