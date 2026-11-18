// PARTE 15 — CLIMA, LUZ E HORA DO DIA
window.E15=(nome,ve,sons,cheiros,tato,corpo,emo,usos,cliches,ex)=>({nome,ve,sons,cheiros,tato,corpo,emo,usos,cliches,ex});
GUIA.add({
n:15,
chamada:"Chuva, neblina, calor, madrugada, pôr do sol, luz de vela e luz fluorescente: como o tempo, a luz e a hora mudam o clima de uma cena e amplificam o que a personagem sente.",
campos:[
 {k:"ve",l:"O que se vê",t:"lista"},
 {k:"sons",l:"Sons",t:"lista"},
 {k:"cheiros",l:"Cheiros",t:"lista"},
 {k:"tato",l:"Na pele e no corpo",t:"lista"},
 {k:"corpo",l:"Efeitos no humor e no comportamento",t:"lista"},
 {k:"emo",l:"Emoções que pode amplificar",t:"links",p:1},
 {k:"usos",l:"Usos na história",t:"lista"},
 {k:"cliches",l:"Clichês a evitar",t:"lista"},
 {k:"ex",l:"Exemplo",t:"dica"}
],
tituloEntradas:"O tempo, a luz e as horas",
notaEntradas:"em quatro grupos",
teoria:[
{t:"O céu também é personagem",html:`
<p>O mesmo diálogo muda completamente se acontece numa tarde de sol, numa madrugada de chuva ou sob a luz branca de um corredor de hospital. Clima, luz e hora do dia ==criam o tom da cena antes de qualquer fala==.</p>
<p>Eles são parentes próximos dos cenários (partes 4, 5 e 13) e dos amplificadores (parte 10): o calor deixa todo mundo mais irritado, a madrugada deixa os pensamentos mais sombrios, a chuva aproxima quem está debaixo do mesmo toldo.</p>`},
{t:"Espelho ou contraste",html:`
<p>Existem duas formas principais de usar o clima:</p>
<h4>Espelho</h4><p>O tempo reflete o que a personagem sente: chuva na tristeza, sol na alegria, tempestade no conflito. A crítica literária chama isso de <em>falácia patética</em>. Funciona, mas é fácil cair no óbvio.</p>
<h4>Contraste</h4><p>O tempo contradiz a emoção, e o choque aumenta a força da cena. Um enterro num dia lindo de céu azul. Um pedido de casamento debaixo de um temporal. ==O mundo não para por causa da dor da personagem==, e isso dói ainda mais.</p>
<div class="cena">O sol estava bonito demais no dia do enterro. Teresa achou uma falta de respeito.</div>`},
{t:"Luz é emoção",html:`
<p>Fotógrafos e diretores de cinema sabem: a luz decide o clima de uma imagem. Na escrita, vale o mesmo.</p>
<ul><li><b>Luz quente</b> (dourada, de vela, de fogueira): aconchego, intimidade, nostalgia.</li><li><b>Luz fria</b> (fluorescente, de tela, de lua): solidão, frieza, tensão.</li><li><b>Luz dura</b> (sol do meio-dia, holofote): exposição, verdade, desconforto.</li><li><b>Luz suave</b> (dia nublado, penumbra): melancolia, calma, segredo.</li><li><b>Pouca luz:</b> mistério, medo, intimidade.</li></ul>
<p>Pergunte: ==o que a luz mostra e o que ela esconde?==</p>`},
{t:"As horas do dia",html:`
<p>Cada hora tem seu próprio clima emocional:</p>
<div class="tab-wrap"><table><thead><tr><th>Hora</th><th>Clima</th></tr></thead><tbody>
<tr><td>Madrugada</td><td>Confissões, insônia, medo, pensamentos sombrios</td></tr>
<tr><td>Amanhecer</td><td>Recomeço, esperança, cansaço de quem não dormiu</td></tr>
<tr><td>Manhã</td><td>Pressa, rotina, energia</td></tr>
<tr><td>Meio-dia</td><td>Exposição, calor, impaciência</td></tr>
<tr><td>Tarde</td><td>Moleza, tédio, espera</td></tr>
<tr><td>Pôr do sol</td><td>Despedidas, nostalgia, fim de ciclo</td></tr>
<tr><td>Noite</td><td>Intimidade, encontros, perigo</td></tr>
</tbody></table></div>
<p>A hora também define o que é possível: quem está acordado, o que está aberto, quanto tempo falta.</p>`},
{t:"O clima do Brasil",html:`
<p>Muita ficção brasileira copia um clima que não é nosso: Natal com neve, outono com folhas vermelhas, inverno de casaco em cidades onde faz 28 °C em julho. ==Use o clima real do lugar da sua história==:</p>
<ul><li>A garoa e o frio úmido de São Paulo e Curitiba.</li><li>A chuva da tarde, com hora marcada, em Belém e Manaus.</li><li>A seca, o céu sem nuvens e a primeira chuva esperada no sertão.</li><li>O vento e o frio de geada no Sul.</li><li>O mormaço e a maresia do litoral.</li><li>A secura do ar em Brasília e no Centro-Oeste, com a fumaça das queimadas.</li></ul>
<p>E lembre: no Brasil, o Natal é no verão, e o “inverno” varia muito de região para região.</p>`},
{t:"Clima como fonte de conflito",html:`
<p>O tempo não só cria clima: ele ==atrapalha os planos==. Enchentes, quedas de energia, estradas fechadas, voos cancelados, calor que adoece. Uma tempestade pode prender duas personagens que se odeiam na mesma casa. Uma seca pode forçar uma família a migrar.</p>
<p>A crise climática também é um tema cada vez mais presente: ondas de calor, enchentes históricas, queimadas. Ele cabe em histórias realistas, distópicas e de ficção científica.</p>`},
{t:"Como usar sem exagerar",html:`
<ul><li><b>Um ou dois detalhes bastam.</b> Não descreva o céu a cada cena.</li><li><b>Prefira o efeito na personagem</b> ao boletim meteorológico: a camisa grudada nas costas diz mais que “fazia 35 graus”.</li><li><b>Evite abrir o livro com o tempo</b> (“Era uma manhã ensolarada...”), a não ser que o clima seja essencial.</li><li><b>Mantenha a continuidade:</b> se choveu às três, as ruas estão molhadas às quatro.</li><li><b>Use o tempo para marcar a passagem do tempo:</b> estações, temporadas de chuva, o primeiro frio.</li></ul>`}
],
grupos:[{nome:"Tempo e clima",itens:[]},{nome:"Luz",itens:[]},{nome:"Horas do dia",itens:[]},{nome:"Estações e épocas",itens:[]}]
});
(function(){
const G=GUIA.partes[15].grupos;
G[0].itens.push(
E15("Garoa","Chuva fina quase invisível|Vidros embaçados|Guarda-chuvas abertos sem certeza|Brilho nas calçadas","Quase nenhum som|Pneus no asfalto molhado","Asfalto molhado|Terra|Roupa úmida","Umidade que gruda na pele|Cabelo arrepiado|Frio leve","Nostalgia|Preguiça|Vontade de ficar em casa","Tristeza|Saudade|Solidão|Nostalgia","Encontro inesperado|Cena de despedida discreta|Atmosfera urbana","Garoa sempre triste","Era uma garoa tão fina que ela só percebeu quando os óculos ficaram cheios de pontinhos."),
E15("Chuva forte","Cortinas de água|Rua virando rio|Pessoas correndo|Janelas escorrendo","Batidas no telhado|Calhas transbordando|Trovões","Terra molhada|Chuva|Esgoto","Roupa encharcada|Frio|Pés molhados","Aproximação de estranhos|Isolamento|Interrupção de planos","Tristeza|Raiva|Alívio|Desejo","Prender personagens no mesmo lugar|Esconder sons|Atrasar ou impedir algo","Beijo na chuva como clímax obrigatório|Choro disfarçado pela chuva","A chuva batia tão alto no telhado de zinco que eles tiveram que gritar para brigar. Acabaram rindo antes de terminar."),
E15("Temporal de verão","Céu escurecendo de repente às quatro da tarde|Vento levantando poeira|Raios|Sol voltando meia hora depois","Trovões|Vento|Chuva pesada|Depois, pássaros","Terra quente molhada|Ozônio","Calor abafado antes|Alívio depois","Tensão antes|Alívio depois","Ansiedade|Alívio|Medo","Mudança súbita|Interrupção|Recomeço","Temporal como presságio óbvio","O céu ficou roxo em dez minutos. Todo mundo correu para tirar a roupa do varal ao mesmo tempo."),
E15("Neblina","Mundo apagado a poucos metros|Faróis que surgem do nada|Contornos borrados|Postes com halos","Sons abafados|Passos sem origem","Umidade|Mato|Frio","Gotículas no rosto|Frio úmido","Insegurança|Mistério|Isolamento","Medo|Inquietação|Confusão|Solidão","Suspense|Esconder alguém|Perder-se|Revelações graduais","Neblina como sinal automático de terror","A neblina engoliu a ponte inteira. Só se ouviam os passos de alguém do outro lado, cada vez mais perto."),
E15("Calor intenso","Ar tremendo sobre o asfalto|Pessoas na sombra|Ventiladores|Rostos vermelhos","Ventiladores|Ar-condicionado|Cigarras","Suor|Asfalto quente|Lixo","Suor escorrendo|Roupa grudada|Cansaço|Pele ardendo","Irritação|Impaciência|Moleza|Brigas","Irritação|Raiva|Impaciência|Sobrecarga","Aumentar conflitos|Cansar as personagens|Criar urgência","Calor apenas mencionado (“estava calor”)","No terceiro dia de quarenta graus, até a pessoa mais calma da repartição começou a responder atravessado."),
E15("Mormaço","Céu branco e baixo|Sol escondido mas presente|Ar parado","Silêncio pesado|Cigarras","Umidade|Mar (no litoral)","Calor úmido|Suor que não seca|Pele grudenta","Moleza|Sono|Irritação","Tédio|Irritação|Apatia","Tensão parada|Espera|Cenas de tédio","Ignorar a sensação do corpo","O mormaço deixava tudo pegajoso: as cartas do baralho, o copo, a paciência."),
E15("Seca","Terra rachada|Céu sem nuvens|Plantas secas|Açudes vazios|Poeira","Vento seco|Silêncio|Galhos estalando","Poeira|Folhas secas","Pele ressecada|Lábios rachados|Sede","Desânimo|Preocupação|Resistência","Desespero|Esperança|Resignação","Migração|Escassez|Resistência|Fé","Sertão só como lugar de sofrimento","Fazia oito meses que não chovia. A mãe ainda olhava o céu todo fim de tarde, como quem espera visita."),
E15("Primeira chuva depois da seca","Pingos grossos na terra seca|Crianças correndo para a rua|Gente olhando o céu","Pingos no telhado|Risos|Rezas","Cheiro de terra molhada (petricor)","Alívio|Frescor","Alegria coletiva|Fé|Celebração","Alívio|Felicidade|Esperança|Gratidão","Virada da história|Recomeço|Celebração","Chuva como solução mágica","Quando o primeiro pingo caiu, seu Antônio tirou o chapéu. Não para se proteger: para sentir."),
E15("Frio","Pessoas encolhidas|Fumaça saindo da boca|Casacos|Janelas fechadas","Vento|Dentes batendo","Café|Lareira|Fumaça","Mãos geladas|Nariz vermelho|Tremor","Aproximação física|Lentidão|Vontade de ficar em casa","Solidão|Ternura|Nostalgia","Aproximar personagens|Mostrar desigualdade (quem não tem abrigo)","Frio sempre romântico","O frio entrava pelas frestas da janela, e eles dormiram todos na mesma cama, como quando eram crianças."),
E15("Geada","Grama branca de manhã|Vidros congelados|Telhados prateados","Silêncio|Grama estalando","Ar gelado|Fumaça de chaminé","Frio cortante|Mãos doendo","Lentidão|Cuidado","Nostalgia|Calma|Solidão","Marcar o inverno do Sul|Perda de colheita|Beleza dura","Ignorar o impacto no campo","A geada queimou a horta inteira numa noite. A avó olhou, suspirou e começou a replantar."),
E15("Vento forte","Árvores curvadas|Roupas voando|Poeira|Cabelos bagunçados","Uivos|Portas batendo|Folhas","Poeira|Mar|Terra","Vento empurrando|Olhos ardendo","Agitação|Inquietação","Agitação|Ansiedade|Euforia","Mudança|Inquietação|Perda de objetos","Vento como “sinal de mudança” óbvio","O vento levou a carta da mão dela antes que ela terminasse de ler."),
E15("Céu nublado","Cinza uniforme|Luz sem sombra|Cores apagadas","Sons comuns, mais abafados","Umidade","Frescor","Nostalgia|Calma|Introspecção","Nostalgia|Tédio|Calma","Cenas reflexivas|Espera","Nublado = tristeza sempre","O céu estava tão cinza que parecia que alguém tinha esquecido de ligar o dia."),
E15("Céu limpo e sol","Azul intenso|Sombras nítidas|Cores fortes","Pássaros|Crianças|Movimento","Protetor solar|Grama","Calor no rosto|Luz nos olhos","Energia|Alegria|Exposição","Felicidade|Esperança|Choque","Contraste com tragédia|Celebrações","Dia lindo = final feliz","Era um dia tão bonito que parecia mentira. Mais tarde, ela lembraria disso."),
E15("Fumaça de queimadas","Céu alaranjado|Sol vermelho|Cinzas caindo|Horizonte apagado","Tosse|Sirenes","Fumaça|Queimado","Olhos ardendo|Garganta seca","Angústia|Revolta|Cansaço","Angústia|Indignação|Medo","Crise climática|Conflito ambiental|Clima apocalíptico","Tratar apenas como cenário bonito","O sol nasceu vermelho de novo. Já fazia uma semana que ninguém via o azul."),
E15("Enchente","Ruas alagadas|Água marrom|Móveis boiando|Barcos nas ruas","Água correndo|Gritos|Helicópteros","Lama|Esgoto","Água fria|Lama nos pés","Medo|Solidariedade|Perda","Desespero|Medo|Luto|Compaixão","Tragédia|Solidariedade|Perda|Migração","Enchente sem consequências","A água subiu até a segunda prateleira da estante. Lá estavam as fotos do casamento.")
);
G[1].itens.push(
E15("Luz dourada","Luz baixa e quente|Sombras longas|Poeira brilhando no ar","Sons do fim do dia","Fim de tarde","Calor suave","Nostalgia|Ternura|Calma","Nostalgia|Ternura|Saudade|Amor","Lembranças|Despedidas|Momentos de afeto","Luz dourada em todas as cenas românticas","A luz dourada entrava pela janela e deixava até a bagunça da sala bonita."),
E15("Sol do meio-dia","Luz branca e dura|Sombras curtas|Brilho que cega","Movimento|Calor","Asfalto quente","Calor forte|Olhos apertados","Exposição|Impaciência|Desconforto","Irritação|Vergonha|Impaciência","Cenas de verdade|Exposição|Confronto","Ignorar o desconforto do calor","Ao meio-dia não havia sombra para se esconder, nem dele, nem do que ela tinha feito."),
E15("Luz de vela","Chama tremendo|Sombras dançando|Rostos parcialmente iluminados","Silêncio|Estalo da chama","Cera|Fumaça","Calor perto da chama","Intimidade|Mistério|Recolhimento","Ternura|Amor|Medo|Luto","Romance|Rituais|Falta de energia|Velórios","Vela apenas como cenário romântico","Faltou luz e a família inteira se juntou em volta de uma única vela, contando histórias que não contava há anos."),
E15("Luz da lua","Prateado|Contornos visíveis|Cores sumindo","Grilos|Silêncio","Noite","Frescor","Mistério|Solidão|Romance","Solidão|Amor|Medo|Calma","Romance|Fuga|Cenas mágicas","Lua cheia sempre presente","A lua cheia iluminava a estrada inteira. Dava para fugir sem lanterna."),
E15("Escuridão total","Nada|Formas imaginadas","Respiração|Ruídos amplificados","Cheiros mais fortes","Mãos tateando|Tropeços","Medo|Vulnerabilidade|Intimidade","Medo|Pavor|Vulnerabilidade","Suspense|Revelações|Confissões","Escuridão só como terror","No escuro, ela finalmente conseguiu dizer o que não dizia olhando nos olhos."),
E15("Luz fluorescente","Branco frio|Piscando|Cores lavadas|Olheiras marcadas","Zumbido|Cliques","Desinfetante|Ar condicionado","Frio|Cansaço nos olhos","Desconforto|Tristeza|Tensão","Ansiedade|Solidão|Desânimo","Hospitais|Repartições|Madrugadas de trabalho","Luz sem efeito na emoção","Sob a luz fluorescente da sala de espera, todos pareciam doentes, até quem só tinha vindo acompanhar."),
E15("Neon e luz de tela","Cores artificiais|Reflexos|Rostos azulados","Música|Zumbido","Fritura|Rua","Olhos cansados","Agitação|Solidão urbana","Solidão|Euforia|Ansiedade","Cenas urbanas|Noite|Vício em telas","Neon só como estética","A única luz do quarto era a tela do celular. Ele ficou acordado até ela apagar sozinha."),
E15("Fogueira","Chamas|Faíscas|Rostos alaranjados|Escuridão em volta","Estalos|Conversas|Violão","Fumaça|Madeira","Calor no rosto|Frio nas costas","União|Confissões|Nostalgia","Ternura|Nostalgia|Calma","Festas juninas|Acampamentos|Rituais","Fogueira só como cenário","Na festa junina, a fogueira esquentava o rosto e deixava as costas geladas. Dava vontade de girar."),
E15("Réstia de luz","Feixe de luz pela fresta|Poeira dançando|Contraste forte","Silêncio","Poeira|Mofo","Calor do feixe","Esperança|Mistério","Esperança|Curiosidade","Esconderijos|Revelações|Prisões","Feixe de luz = esperança, sempre","Um raio de sol entrava pela fresta da porta. Era tudo o que ela sabia sobre o lado de fora."),
E15("Relâmpago","Clarão repentino|Tudo visível por um segundo|Escuridão de novo","Trovão logo depois","Ozônio|Chuva","Susto","Tensão|Medo|Revelação","Medo|Surpresa|Choque","Revelar algo por um segundo|Suspense","Relâmpago revelando o assassino (clichê)","O clarão mostrou por um segundo a sala inteira. Havia uma cadeira que não estava ali antes.")
);
G[2].itens.push(
E15("Madrugada","Ruas vazias|Luzes acesas em poucas janelas|Céu escuro","Silêncio|Cachorros|Carros raros|Geladeira zumbindo","Ar frio|Café","Frio|Sono","Pensamentos sombrios|Confissões|Insônia","Ansiedade|Medo|Solidão|Desespero","Insônia|Ligações urgentes|Confissões|Fugas","Madrugada sempre trágica","Às três da manhã, todo problema parece maior. Ela sabia disso e ainda assim pegou o celular."),
E15("Amanhecer","Céu clareando|Rosa e laranja|Primeiros movimentos","Pássaros|Primeiros ônibus|Padaria abrindo","Pão|Café|Orvalho","Frio da manhã","Esperança|Recomeço|Cansaço de quem não dormiu","Esperança|Alívio|Calma","Recomeços|Fins de noites difíceis|Viagens","Amanhecer = tudo resolvido","Viu o dia nascer da janela do hospital. Não sabia ainda se era bom sinal."),
E15("Manhã","Movimento|Trânsito|Gente apressada","Buzinas|Rádio|Café passando","Café|Pão|Perfume","Energia|Pressa","Agitação|Rotina","Impaciência|Determinação|Ansiedade","Rotina|Começos|Pressa","Manhãs sempre alegres","Todo dia às sete, a casa virava uma corrida: mochila, merenda, chave, cachorro."),
E15("Meio da tarde","Sol inclinado|Movimento menor|Sonolência","Ventilador|Novela|Cigarras","Café da tarde","Moleza|Calor","Tédio|Sono|Espera","Tédio|Apatia|Calma","Espera|Cenas lentas|Fofocas","Ignorar o ritmo lento","A tarde de domingo se arrastava. Até o relógio da cozinha parecia mais lento."),
E15("Pôr do sol","Céu laranja e rosa|Sombras longas|Luzes acendendo","Pássaros voltando|Movimento de volta para casa","Fim de tarde","Brisa","Nostalgia|Despedida|Reflexão","Nostalgia|Saudade|Tristeza|Amor","Despedidas|Fins de ciclo|Declarações","Pôr do sol como fundo de toda cena romântica","Ficaram olhando o sol se pôr sem dizer nada. Era a última tarde antes da mudança."),
E15("Anoitecer","Luzes acendendo|Céu azul escuro|Movimento diminuindo","Grilos|Panelas|Novela","Comida|Banho","Frescor","Recolhimento|Cansaço|Intimidade","Calma|Contentamento|Solidão","Volta para casa|Jantares|Conversas","Ignorar a transição","As luzes da rua acenderam todas ao mesmo tempo, e a mãe gritou da janela que era hora de entrar."),
E15("Noite","Escuridão|Luzes artificiais|Estrelas (longe da cidade)","Música|Conversas|Silêncio","Jantar|Perfume","Frescor","Intimidade|Perigo|Liberdade","Desejo|Medo|Euforia|Solidão","Encontros|Festas|Perigos|Segredos","Noite só como perigo","À noite, o bairro virava outro: os mesmos bares, outras pessoas."),
E15("Meia-noite","Relógio marcando|Fogos (em datas)|Silêncio","Badaladas|Fogos|Silêncio","Noite","Sono","Expectativa|Mudança|Mistério","Antecipação|Medo|Euforia","Viradas de ano|Prazos|Rituais|Magia","Meia-noite mágica (clichê)","Faltavam dois minutos para a meia-noite quando ela percebeu que não queria estar ali.")
);
G[3].itens.push(
E15("Verão brasileiro","Praias cheias|Sol forte|Chuvas de fim de tarde|Roupas leves","Mar|Música|Ventiladores","Protetor solar|Maresia|Suor","Calor|Pele queimada","Alegria|Preguiça|Irritação","Felicidade|Euforia|Irritação","Férias|Romances|Conflitos familiares|Natal no calor","Verão só como alegria","O Natal era no calor: peru na mesa, ventilador ligado, tio de bermuda e gorro de Papai Noel."),
E15("Inverno brasileiro","Varia muito: frio intenso no Sul, temperaturas amenas no Nordeste, seca no Centro-Oeste","Vento|Silêncio","Café|Pinhão|Quentão","Frio|Ar seco","Recolhimento|Nostalgia","Nostalgia|Ternura|Solidão","Festas juninas|Recolhimento|Doenças","Inverno com neve no Brasil todo","Em julho, Porto Alegre tremia e Fortaleza ia à praia. Os dois chamavam de inverno."),
E15("Época das chuvas","Rios cheios|Verde intenso|Lama|Mosquitos","Chuva quase diária|Sapos","Terra molhada|Mofo","Umidade|Roupas que não secam","Esperança (no campo)|Cansaço (na cidade)","Esperança|Irritação|Calma","Plantio|Enchentes|Isolamento","Ignorar as diferenças regionais","Na época das chuvas, a estrada virava barro e a escola fechava. As crianças comemoravam; os pais não."),
E15("Estiagem","Céu limpo|Poeira|Plantas secas","Vento|Silêncio","Poeira|Queimado","Ar seco|Sede","Preocupação|Resistência","Preocupação|Resignação|Esperança","Crise|Migração|Fé|Conflito por água","Sofrimento sem esperança","Em Brasília, a umidade baixou para 12%. Todo mundo andava com uma garrafa de água e o nariz sangrando."),
E15("Festas de fim de ano","Luzes piscando|Mesas cheias|Fogos|Família reunida","Música|Fogos|Discussões","Comida|Perfume|Cerveja","Calor|Cansaço","Alegria|Tensão familiar|Nostalgia","Felicidade|Saudade|Irritação|Solidão","Conflitos familiares|Balanços de vida|Recomeços","Natal sempre feliz","Na ceia, a cadeira da avó continuava no lugar. Ninguém teve coragem de tirar.")
);
})();
