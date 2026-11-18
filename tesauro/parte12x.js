// PARTE 12 — aprofundamento: marcas na fala e mais exemplos
(function(){
const P=GUIA.partes[12];
P.campos=[
 {k:"som",l:"Como essa emoção soa na fala",t:"texto"},
 {k:"baixa",l:"Intensidade baixa (contida, baixinho)",t:"chips"},
 {k:"media",l:"Intensidade média",t:"chips"},
 {k:"alta",l:"Intensidade alta (voz alta, explosão)",t:"chips"},
 {k:"marcas",l:"Marcas na própria fala (pontuação, palavras, ritmo)",t:"lista"},
 {k:"gestos",l:"Ações que podem substituir o verbo",t:"lista"},
 {k:"ex",l:"Exemplos",t:"paras"},
 {k:"frases",l:"Mais exemplos",t:"paras"},
 {k:"rel",l:"Emoções ligadas (parte 1)",t:"links",p:1},
 {k:"dica",l:"Dica de escrita",t:"dica"}
];
const iErr=P.teoria.findIndex(t=>t.t==="Erros comuns");
P.teoria.splice(iErr,0,
{t:"Fala, verbo e gesto juntos",html:`
<p>A emoção de uma fala pode estar em quatro lugares: ==nas palavras, na pontuação, no verbo e no gesto==. Você raramente precisa de todos ao mesmo tempo.</p>
<div class="tab-wrap"><table><thead><tr><th>Onde está a emoção</th><th>Exemplo (raiva)</th></tr></thead><tbody>
<tr><td>Só nas palavras</td><td>— Você mentiu para mim. De novo — disse ela.</td></tr>
<tr><td>Na pontuação</td><td>— Você mentiu?! Para mim?!</td></tr>
<tr><td>No verbo</td><td>— Você mentiu para mim — sibilou ela.</td></tr>
<tr><td>No gesto</td><td>— Você mentiu para mim. — Ela largou o copo na pia sem lavar.</td></tr>
<tr><td>Tudo junto (excesso)</td><td><s>— Você mentiu?! — berrou ela, furiosa, batendo na mesa com raiva.</s></td></tr>
</tbody></table></div>
<p>Escolha ==um ou dois lugares== para cada fala. Varie ao longo da cena para manter o ritmo.</p>`},
{t:"Quando a personagem não fala oralmente",html:`
<p>Personagens que se comunicam em Libras, pela escrita, por aplicativos de voz ou por gestos também precisam de verbos variados: sinalizou, soletrou, digitou, apontou, escreveu, o tablet disse. A parte 16 traz uma tabela completa e mostra como a emoção aparece no tamanho e na velocidade dos sinais.</p>`},
{t:"Banco de verbos por som",html:`
<p>Uma lista extra, organizada pelo tipo de som, para quando você precisar de precisão:</p>
<div class="tab-wrap"><table><thead><tr><th>Tipo de som</th><th>Verbos</th></tr></thead><tbody>
<tr><td>Ar e respiração</td><td>suspirou, ofegou, arquejou, bufou, soprou, sussurrou</td></tr>
<tr><td>Garganta</td><td>rosnou, grunhiu, pigarreou, engasgou, gemeu, resmungou</td></tr>
<tr><td>Agudo</td><td>guinchou, ganiu, esganiçou-se, gritou, berrou</td></tr>
<tr><td>Grave</td><td>trovejou, retumbou, bradou, vociferou</td></tr>
<tr><td>Ritmo partido</td><td>gaguejou, balbuciou, titubeou, hesitou</td></tr>
<tr><td>Ritmo corrido</td><td>tagarelou, disparou, despejou, desembestou a falar</td></tr>
<tr><td>Riso e choro</td><td>riu, gargalhou, soluçou, choramingou, fungou</td></tr>
<tr><td>Musicais</td><td>cantarolou, entoou, recitou, salmodiou</td></tr>
</tbody></table></div>`});
P.notaEntradas="em oito grupos, com marcas na fala e mais exemplos";
const A=(nome,marcas,frases)=>{for(const g of P.grupos)for(const e of g.itens)if(e.nome===nome){e.marcas=marcas;e.frases=frases;return}console.warn("faltou",nome)};
A("Dizer e falar","Frases completas e sem marcas especiais|O conteúdo da fala carrega a emoção","— Vou sair — disse Paulo. — Não me espere para o jantar.|— A gente precisa conversar — falou a mãe, e todo mundo na mesa parou de mastigar.");
A("Perguntar","Ponto de interrogação|Inversões (“E você, vai?”)|Perguntas curtas em sequência|“Né?”, “hein?”, “será?”","— E aí? — perguntou Lia, sem tirar os olhos do celular.|— Será que ele vem? — quis saber a avó, pela quarta vez.");
A("Responder","Respostas curtas (sim, não, tá)|Respostas que devolvem a pergunta|Respostas atrasadas por uma pausa","— Por quê? — perguntou a filha.|— Porque sim — retrucou o pai.|Ele demorou tanto para responder que ela já tinha entendido.");
A("Continuar, completar e interromper","Reticências na fala cortada|Travessão no fim da fala interrompida|“Mas”, “e”, “aliás” no começo da fala seguinte","— Eu só acho que... — começou ele.|— Você acha demais — cortou ela.|— E tem mais — continuou ele, já sem fôlego. — O carro também é meu.");
A("Raiva","Frases curtas, secas|Imperativos (“Sai.”, “Para.”)|Repetição de palavras|Xingamentos, se a personagem xinga|Ponto final onde caberia exclamação (raiva fria)","— Eu. Disse. Não. — Cada palavra caiu como uma pedra.|— Some daqui — rosnou o irmão, e fechou a porta antes de ouvir a resposta.|— Ótimo. Perfeito. Muito obrigada — disse ela, num tom que fez o garçom recuar.");
A("Irritação","Suspiros escritos (“Ai, ai.”)|Respostas monossilábicas|Ironia leve|“De novo?”, “Sério?”","— Sério? — bufou Tiago. — Sério mesmo?|— Tá. Tá bom. Faz como quiser — resmungou, e virou para a parede.");
A("Fúria","Exclamações em sequência|Frases quebradas no meio|Palavras repetidas|Letras maiúsculas (use com muita moderação)","— Você... você não tem... COMO você teve coragem?! — berrou ela, e a voz falhou no fim.|— Fora! Fora! — repetia o pai, e cada “fora” era mais alto que o anterior.");
A("Indignação","Perguntas retóricas|“Como assim?”, “Não é possível”|Argumentos enumerados","— Como assim, cancelado? Eu paguei, eu vim, eu esperei duas horas! — protestou o passageiro.|— É um absurdo — bradou a vereadora. — E vocês sabem que é.");
A("Desprezo e deboche","Diminutivos irônicos (“que bonitinho”)|Repetição da fala do outro em tom de zombaria|Aspas na voz (“seu ‘projeto’”)","— Ah, que lindo, o “artista” resolveu aparecer — debochou o primo.|— Nossa, que medo — zombou ela, sem levantar os olhos do livro.");
A("Impaciência","“Anda”, “vai”, “logo”|Frases sem verbo (“E aí?”, “Então?”)|Perguntas repetidas","— E então? — apressou ele. — Vai ou não vai?|— Resume — cortou a chefe, antes do segundo slide.");
A("Ciúme","Perguntas aparentemente casuais|Ironia leve|Silêncios longos depois da resposta","— Quem era no telefone? — perguntou ela, num tom leve demais.|— Ah, a “colega de trabalho” — alfinetou Renata, e foi lavar a louça que já estava lavada.");
A("Medo","Reticências|Frases interrompidas|Repetição de nomes (“Ana? Ana?”)|Palavras de súplica (“por favor”)","— Ana? Ana, é você? — sussurrou ela para o corredor escuro.|— Tem... tem alguém ali — balbuciou o menino, apontando o mato.");
A("Nervosismo","Reticências e hesitações (“é...”, “tipo...”)|Frases recomeçadas|Riso nervoso escrito (“haha”)","— Então, é... a gente estava pensando, quer dizer, eu estava pensando... — gaguejou Pedro.|— Haha, não, imagina, tudo certo — disse ela, rápido demais.");
A("Ansiedade","Perguntas em cadeia|“E se...?”|Frases longas, sem pausa","— E se a gente se atrasar? E se fechar? E se não tiver mais vaga? — insistiu Lia.|— Eu só preciso saber se está tudo bem, só isso, só me diz que está tudo bem — repetiu ele.");
A("Pavor","Palavras soltas|Frases sem verbo|Súplicas curtas","— Não. Não. Não — ofegou Caio, recuando.|— Corre! — Foi tudo o que ela conseguiu gritar.");
A("Insegurança","“Acho que”, “talvez”, “sei lá”|Pedidos de desculpa desnecessários|Frases que terminam em pergunta","— Desculpa, mas... será que a gente podia tentar de outro jeito? — arriscou Nina.|— Não sei se é bobagem, mas... — começou ela, e parou.");
A("Desconfiança","Perguntas indiretas|Repetir a resposta do outro em tom de dúvida|“Engraçado...”, “Curioso...”","— Ah, foi trânsito? — repetiu Rui. — Trânsito às duas da manhã?|— Curioso você saber disso — observou a delegada.");
A("Tristeza","Frases curtas|Pausas longas (marcadas com parágrafos ou reticências)|Pouca pontuação expressiva","— Tudo bem — disse ela. E não estava.|— Eu só queria que ele tivesse ligado — murmurou Clara, depois de muito tempo.");
A("Mágoa","Lembretes de fatos passados|“Você sempre”, “você nunca”|Ironia triste","— Você nunca foi a nenhuma apresentação minha. Nenhuma — lembrou Sofia.|— Tudo bem, eu já estou acostumada — disse ela, e as duas sabiam que não estava tudo bem.");
A("Desespero","Repetição de súplicas|Exclamações|Frases incompletas","— Por favor, por favor, por favor — implorava Teresa ao telefone mudo.|— Alguém! Qualquer um! — gritou ele para a estrada vazia.");
A("Luto","Verbos no passado e correções (“ela gosta... gostava”)|Frases práticas no meio da dor|Silêncios","— Ela gosta de... gostava de café sem açúcar — corrigiu-se Júlio, e parou.|— Alguém precisa avisar a escola — disse a mãe, a voz firme demais.");
A("Decepção","Frases curtas e factuais|“Achei que...”, “Pensei que...”|Ausência de exclamação","— Achei que você vinha — disse ela, só isso.|— Ah. Tá — respondeu o filho, e guardou o desenho na mochila.");
A("Resignação","“Tanto faz”, “tá”, “fazer o quê”|Frases que encerram a conversa","— Fazer o quê — suspirou o pai, e desligou a TV.|— Tá. Pode ser — cedeu ela, sem levantar os olhos.");
A("Arrependimento","Futuro do pretérito (“eu devia”, “se eu tivesse”)|Pedidos de desculpa|Frases que começam e não terminam","— Se eu tivesse ido junto... — murmurou Fábio, e não terminou.|— Eu sinto muito. Eu sinto muito mesmo — repetiu ela.");
A("Vergonha","Frases curtas e baixas|Desculpas|Tentativas de minimizar (“não foi nada”)","— Desculpa. Fui eu — confessou Duda, olhando para o chão.|— Não foi nada, sério, esquece — balbuciou ele, vermelho até as orelhas.");
A("Culpa","Explicações longas demais|“Eu não quis”, “não era minha intenção”|Repetição de justificativas","— Eu não quis, juro que não quis, eu só achei que... — justificou-se André, atropelando as palavras.|— Se eu soubesse, eu nunca teria deixado — repetia a mãe.");
A("Felicidade","Exclamações|Repetições alegres (“passei, passei!”)|Risos escritos|Apelidos carinhosos","— Eu consegui! Mãe, eu consegui! — gritou Larissa da porta.|— Que dia lindo, gente — comentou a tia, a ninguém em especial.");
A("Empolgação","Frases longas encadeadas com “e”|Exclamações|Interrupções da própria fala","— E aí a gente vai pra praia, e depois tem show, e depois... — tagarelava Theo.|— Você não sabe! Você não vai acreditar! — exclamou ela, já tirando o casaco.");
A("Diversão e brincadeira","Apelidos|Exageros|Perguntas provocativas|Risos escritos com moderação","— Vai sair assim, de pijama de oncinha? — provocou a irmã.|— Claro que eu sei cozinhar — gracejou ele, olhando o macarrão grudado.");
A("Alívio","Interjeições (“ufa”, “graças a Deus”)|Frases curtas depois de uma longa tensão","— Ufa — suspirou ela, encostando na parede.|— Graças a Deus. Graças a Deus — repetia a mãe, abraçando o filho.");
A("Orgulho","Primeira pessoa enfática (“eu que fiz”)|Detalhes do feito|Comparações","— Fui eu que fiz tudo. Sozinha — contou Rafa, mostrando o bolo.|— Primeiro lugar, viu? — anunciou o avô para a rua inteira.");
A("Triunfo","“Eu disse”|Exclamações|Provocações","— Eu disse! Eu disse que ia dar certo! — comemorou Mariana.|— Quem ri por último... — provocou ele, erguendo a taça.");
A("Gratidão","“Obrigada” repetido|Frases curtas e emocionadas|Pausas","— Obrigada. De verdade. Obrigada — murmurou ela, segurando as mãos da enfermeira.|— Eu não sei nem como agradecer — reconheceu Lucas.");
A("Esperança","“Quem sabe”, “talvez”, “e se”|Futuro e condicional","— Quem sabe esse ano, né? — arriscou a mãe.|— E se der certo? — perguntou ele, baixinho, como quem tem medo de assustar a ideia.");
A("Surpresa","Interjeições (“Nossa!”, “Caramba!”)|Perguntas curtas|Repetição do que ouviu","— Grávida?! — exclamou Gabi. — Grávida grávida?|— Nossa — foi tudo o que ele conseguiu dizer.");
A("Amor","Frases curtas e diretas|Apelidos|Nome da pessoa no meio da frase","— Fica, Bia — pediu ele.|— Eu te amo, tá? Mesmo quando eu tô chato — disse o pai na porta da escola.");
A("Ternura","Diminutivos|Apelidos|Frases calmas e repetidas","— Pronto, meu bem, pronto — acalmou a avó.|— Vem cá, pequena — chamou a mãe, abrindo os braços.");
A("Compaixão e consolo","Frases de presença (“tô aqui”)|Pouca pergunta|Ofertas concretas","— Tô aqui. Não precisa falar nada — ofereceu Lúcia.|— Quer um café? Eu faço — disse o vizinho, já entrando.");
A("Desejo e flerte","Perguntas com duplo sentido|Frases incompletas|Pausas","— Você vai ficar mais um pouco? — perguntou ela, e não era bem uma pergunta.|— Depende — respondeu ele. — Você quer que eu fique?");
A("Saudade","“Lembra?”|Verbos no passado|Detalhes concretos","— Lembra do cheiro da casa da vó? — recordou Beto.|— Eu ainda guardo aquele bilhete — confessou ela.");
A("Determinação","Futuro (“vou”, “vai”)|Frases afirmativas|Nenhum “talvez”","— Eu vou. Com ou sem vocês — afirmou Iara.|— Isso não acaba aqui — garantiu o advogado.");
A("Confiança","Frases simples e afirmativas|Nenhuma justificativa longa","— Pode deixar — garantiu o mecânico.|— Vai dar certo — afirmou ela, e pareceu verdade.");
A("Arrogância","Correções|“Na verdade”, “obviamente”|Termos técnicos para humilhar","— Na verdade, não é assim que se fala — corrigiu o gerente.|— Obviamente, você não leu o relatório — sentenciou ela.");
A("Autoridade e comando","Imperativos|Frases curtas|Sem “por favor”","— Todos para fora. Agora — ordenou a diretora.|— Ninguém toca em nada — determinou o perito.");
A("Ameaça e aviso","Condicionais (“se você...”)|Tom calmo e baixo|Repetição do nome do outro","— Se você chegar perto dela de novo, Marcos... — advertiu ele, sem terminar.|— Eu não vou avisar duas vezes — disse ela, baixo.");
A("Aceitação","“Tudo bem”, “você tem razão”|Frases curtas e calmas","— Tudo bem. Você tem razão — admitiu Breno.|— Tá certo. Vamos fazer do seu jeito — concordou a sócia.");
A("Calma","Frases pausadas|Explicações em etapas|Tom baixo","— Primeiro, respira. Depois a gente vê o resto — ponderou Sérgio.|— Uma coisa de cada vez — disse a médica.");
A("Persuasão e pedido","Argumentos enumerados|Promessas|Apelo à emoção ou à culpa","— Só dessa vez. Eu prometo. Eu juro — insistiu Mateus.|— Pensa nas crianças — apelou a irmã.");
A("Dúvida","“Será?”, “tem certeza?”|Frases que terminam em pergunta","— Será que é por aqui? — hesitou Laís.|— Tem certeza? Absoluta? — questionou o pai.");
A("Confusão","Repetição da fala do outro|“Como assim?”|Perguntas curtas em sequência","— Como assim, mudou? Mudou pra onde? Quando? — estranhou Vera.|— Espera. Volta. Quem é quem? — pediu ele.");
A("Curiosidade","Perguntas em sequência|“E depois?”, “e aí?”","— E aí? E depois? E ela? — quis saber Joca.|— O que tem nessa caixa? — perguntou a menina, já sacudindo.");
A("Ceticismo","Ironia|“Ah, claro”|Pedidos de prova","— Ah, claro. E eu sou o Papa — ironizou Bárbara.|— Me mostra — duvidou ele. — Aí eu acredito.");
A("Relutância","Reticências antes do sim|“Tá, mas...”|Condições","— Tá... mas só uma hora — cedeu Vítor.|— Eu vou, mas não vou gostar — avisou ela.");
A("Timidez","Frases muito curtas|Volume baixo|Pausas","— Oi — sussurrou ela, e foi tudo.|— Eu... também — arriscou Clara.");
A("Constrangimento","Mudança de assunto|Risos nervosos|Frases cortadas","— Ah, isso? Não, nada, era... enfim. E o tempo, hein? — desconversou Rodrigo.|— Haha. Pois é. Então — gaguejou ela.");
})();
