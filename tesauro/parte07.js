// PARTE 7 — PROFISSÕES (configuração e introdução)
window.E7=(nome,visao,form,hab,tracos,atrito,pessoas,nec,estereo,porque)=>({nome,visao,form,hab,tracos,atrito,pessoas,nec,estereo,porque});
GUIA.add({
n:7,
chamada:"Profissões comuns e inusitadas, adaptadas à realidade brasileira, com o que cada uma revela sobre quem a escolheu e os conflitos que ela traz para a trama.",
campos:[
 {k:"visao",l:"Visão geral",t:"texto"},
 {k:"form",l:"Formação necessária",t:"texto"},
 {k:"hab",l:"Habilidades e talentos úteis",t:"chips"},
 {k:"tracos",l:"Traços que ajudam",t:"links",p:3},
 {k:"atrito",l:"Fontes de atrito",t:"lista"},
 {k:"pessoas",l:"Pessoas com quem interage",t:"chips"},
 {k:"nec",l:"Como a profissão afeta as necessidades da personagem",t:"paras"},
 {k:"estereo",l:"Subvertendo o estereótipo",t:"dica"},
 {k:"porque",l:"A personagem pode ter escolhido esta profissão porque…",t:"lista"}
],
tituloEntradas:"As profissões",
notaEntradas:"em nove áreas",
teoria:[
{t:"Tudo está nos detalhes",html:`
<p>A profissão da personagem costuma ser escolhida às pressas, só para ela ter o que fazer durante o dia. É uma oportunidade perdida. O trabalho é um ==atalho para o leitor conhecer a personagem==: todo mundo tem associações com profissões, e essas associações fazem metade do trabalho de caracterização.</p>
<p>Uma profissão bem escolhida caracteriza, move a trama, gera conflito, revela feridas e abre caminho para o arco. E, como na vida real, a escolha deve ter <mark>um motivo por trás</mark>.</p>`},
{t:"As motivações por trás da escolha",html:`
<p>Motivação é o porquê de uma escolha. Quase sempre nasce de uma necessidade básica ou de uma ferida não resolvida.</p>
${PIRAMIDE(["propósito, valores, liberdade, deixar um legado","prestígio, provar a capacidade, reconhecimento","ficar perto da família, seguir alguém querido","estabilidade, proteger a família","sobreviver: qualquer trabalho serve"])}
<ul>
<li><b>Fisiológicas:</b> aceitar qualquer trabalho para pôr comida na mesa, mesmo um que faça mal.</li>
<li><b>Segurança:</b> escolher o concurso público, a carteira assinada, a profissão que “nunca falta emprego”.</li>
<li><b>Amor e pertencimento:</b> assumir o negócio da família, seguir os passos da mãe, trabalhar com os amigos.</li>
<li><b>Estima:</b> buscar uma profissão de prestígio, provar a quem duvidou.</li>
<li><b>Autorrealização:</b> trabalhar com o que acredita, ter liberdade, ajudar os outros, criar.</li>
</ul>
<h4>A ferida também escolhe</h4>
<p>A ferida pode empurrar a personagem para uma profissão (a filha de um homem preso injustamente que vira defensora pública) ou afastá-la do trabalho dos sonhos (o rapaz que gagueja e desiste de ser professor). Aqui esta parte conversa com a parte 6.</p>`},
{t:"Profissões que caracterizam",html:`
<p>Ao saber o que a personagem faz, o leitor tira conclusões sobre:</p>
<ul><li>traços de personalidade;</li><li>talentos e habilidades;</li><li>hobbies e paixões;</li><li>aparência física e roupas;</li><li>preferências e rotina;</li><li>ideais e crenças;</li><li>condição econômica.</li></ul>
<p>Use essas associações a seu favor, mas com cuidado: ==a profissão precisa combinar com a personagem== ou, se não combinar, essa contradição precisa ser o ponto.</p>`},
{t:"O trabalho como fonte de tensão e conflito",html:`
<h4>Conflitos nas relações</h4>
<ul><li><b>Desequilíbrio de poder:</b> chefe abusivo, nepotismo, preconceito, um colega novo que conhece um segredo seu.</li><li><b>Romances no trabalho</b> e os términos que vêm depois.</li><li><b>Problemas em casa:</b> turnos de madrugada, salário baixo, carreiras que competem dentro do casal.</li></ul>
<h4>Conflitos morais</h4>
<ul><li>Colegas com limites éticos diferentes.</li><li>A ladeira escorregadia do “só desta vez”.</li><li>Dever contra consciência.</li></ul>
<h4>Conflitos pessoais</h4>
<ul><li>Escolhas da vida privada que respingam no trabalho.</li><li>O sacrifício pessoal, e o que sobra quando a carreira acaba.</li><li>O “emprego dos sonhos” que decepciona.</li><li>Uma ameaça à segurança que destrói até um trabalho amado.</li></ul>
<h4>Fatores fora do controle</h4>
<p>Tecnologia que substitui a função, fusões, crises econômicas, novos donos, escândalos, mudanças sociais. No Brasil cabem muito bem a troca da carteira assinada pelo trabalho por aplicativo, a informalidade, o fechamento de uma fábrica que sustentava a cidade.</p>
<h4>Conflitos do home office</h4>
<p>Interrupções, horários que se misturam, segredos que aparecem na câmera, o cachorro latindo na reunião com o cliente.</p>
<div class="quadro"><span class="q">Regra</span><p>Todo conflito no trabalho precisa ter uma função na cena, de preferência ==provocar uma revelação== sobre a personagem.</p></div>`},
{t:"O trabalho a serviço da estrutura e do arco",html:`
<ul>
<li><b>Para abrir a história:</b> o local de trabalho apresenta a protagonista, o mundo dela e o que está fora do lugar, e já levanta perguntas. Por que uma advogada atende no fundo de um salão de beleza?</li>
<li><b>Mostrar a insatisfação</b> e depois dar pistas do porquê daquela escolha.</li>
<li><b>O trabalho como despertador:</b> ele faz a personagem perceber o que falta.</li>
<li><b>Gatilhos de revelação:</b> um colega no caminho errado, outro no caminho certo, uma experiência boa que muda a perspectiva.</li>
<li><b>Profissões que ajudam ou atrapalham o objetivo.</b> Às vezes o trabalho “seguro” é uma forma de autopunição.</li>
<li><b>Escolha e consequência:</b> no arco de mudança, o conflito no trabalho empurra para o crescimento; no arco fracassado, reforça a negação.</li>
</ul>`},
{t:"A profissão como recurso temático",html:`
<p>Se o tema da história é sacrifício, uma enfermeira de UTI carrega isso no dia a dia. Se é medo, um bombeiro. A profissão pode ==simbolizar o tema== e reforçá-lo cena a cena.</p>
<ul><li><b>Ligação com a ferida:</b> autossabotagem (a pessoa que escolhe um trabalho que a diminui) e obsessão (a que se mata de trabalhar para provar algo).</li><li><b>Contraste proposital:</b> a corrupção acontecendo com uma bibliotecária, não com um político, surpreende e faz pensar.</li><li><b>Desencanto:</b> a personagem que perde a fé na própria carreira.</li></ul>`},
{t:"Como escolher a profissão da personagem",html:`
<h4>Pontos de partida</h4><p>As exigências da trama, o tema, a motivação, e os traços, habilidades e interesses dela.</p>
<h4>Oportunidades e circunstâncias</h4><p>Proximidade (trabalhar no que tem na cidade), pressão da família, familiaridade com o ramo, nepotismo e obstáculos (preconceito, falta de estudo, antecedentes criminais, falta de dinheiro para a faculdade).</p>
<h4>O duelo de profissões</h4><p>Faça duas listas: os trabalhos ideais para a personagem e os opostos. Se o arco é de mudança, ela pode começar num da lista errada e terminar num da certa.</p>`},
{t:"Outras dicas",html:`
<h4>Pule a parte chata</h4>
<p>Em vez de explicar a profissão, mostre a personagem trabalhando.</p>
<div class="cena">Às 5h40, Josi já tinha feito três escovas. Atendia a cliente da cadeira dois enquanto respondia áudio de fornecedor, com o celular preso entre o ombro e a orelha. Quando a dona do salão pediu para ela cobrir o turno de sábado de novo, Josi disse sim antes de pensar no aniversário da filha.</div>
<p>Em quatro linhas, o leitor sabe que ela é competente, sobrecarregada, que não sabe dizer não e que a família fica em segundo plano.</p>
<h4>Desmonte estereótipos</h4>
<p>Dê um traço inesperado, um hobby surpreendente, quebre expectativas de gênero. A mecânica que faz crochê no intervalo. O segurança que estuda filosofia.</p>
<h4>Seja específica</h4>
<p>Não só “professora”: professora de educação especial numa escola ribeirinha do Pará.</p>
<h4>Carreiras fixas e abertas</h4>
<p>Algumas profissões são previsíveis e estáveis (concursada, eletricista, motorista de ônibus); outras são arriscadas e criativas (freelancer, artista, empreendedora). Combine com a personalidade: alguém que precisa de segurança sofre numa carreira aberta, e vice-versa.</p>`}
],
grupos:[{nome:"Saúde e cuidado",itens:[]},{nome:"Educação e ciência",itens:[]},{nome:"Comércio e serviços",itens:[]},{nome:"Segurança e justiça",itens:[]},{nome:"Arte, mídia e comunicação",itens:[]},{nome:"Trabalho manual e técnico",itens:[]},{nome:"Campo e natureza",itens:[]},{nome:"Serviço público e comunidade",itens:[]},{nome:"Profissões incomuns",itens:[]}]
});
