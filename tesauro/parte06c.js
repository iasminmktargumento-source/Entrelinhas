// PARTE 6 — confiança traída, infância, acontecimentos traumáticos
(function(){
const N={F:"Fisiológicas",S:"Segurança",A:"Amor e pertencimento",E:"Estima e reconhecimento",R:"Autorrealização"};
const nec=s=>s.split("").map(c=>N[c]).join("|");
GUIA.partes[6].grupos[4].itens.push(
E6("Traição de irmão","","Irmão que rouba a herança|Irmã que se envolve com o parceiro|Delação",nec("AE"),"*Nem a família é confiável.*","Confiar em parentes","Afastamento|Desconfiança|Busca de reconciliação","Desconfiado|Rancoroso|Leal","Datas familiares|Inventário","Reconciliar-se ou encerrar a relação em paz."),
E6("Relação tóxica","","Parceiro que controla|Amizade que diminui|Ciúme e manipulação",nec("AE"),"*Não mereço coisa melhor.*|*A culpa é minha.*","Ficar sozinha|Ser controlada de novo","Isolamento|Baixa autoestima|Saída gradual|Terapia","Inseguro|Submisso|Resiliente|Assertivo","Mensagens|Tom de voz|Lugares do casal","Reconhecer o padrão e escolher diferente."),
E6("Violência doméstica","Foco nos efeitos e na saída. O Disque 180 é o canal de apoio às mulheres no Brasil.","Agressões físicas|Violência psicológica|Controle financeiro",nec("SAE"),"*Não tenho para onde ir.*|*Eu provoquei.*","Ser encontrada|Repetir o ciclo","Esconder marcas|Medo constante|Fuga planejada|Luta por outras mulheres","Cauteloso|Protetor|Resiliente|Corajoso","Passos|Portas batendo|Cheiro de bebida","Sair, ser acolhida e reconstruir a vida."),
E6("Ser renegada pela família","","Por orientação sexual|Por escolha religiosa|Por casamento",nec("AE"),"*Não sou digna de amor.*","Rejeição","Construir família escolhida|Saudade|Orgulho","Independente|Autêntico|Resiliente","Datas festivas|Fotos","Reaproximar-se ou encontrar paz sem eles."),
E6("Infidelidade","","Traição descoberta|Relação paralela",nec("AE"),"*Não fui suficiente.*","Ser traída de novo","Desconfiança|Ciúme|Perdão ou ruptura","Ciumento|Desconfiado|Inseguro","Mensagens|Perfumes|Atrasos","Confiar de novo em alguém digno."),
E6("Descobrir uma adoção escondida","","Documento encontrado|Revelação num velório",nec("AE"),"*Minha vida foi uma mentira.*","Ser enganada","Busca pela origem|Crise de identidade|Raiva dos pais","Curioso|Desconfiado|Ressentido","Documentos|Fotos de família","Encontrar a história e reconciliar as duas famílias."),
E6("Roubo de ideias","","Chefe que leva o crédito|Projeto copiado",nec("E"),"*Não posso confiar meu trabalho a ninguém.*","Ser explorada","Segredo|Competitividade|Desconfiança","Desconfiado|Competitivo|Reservado","Reuniões|Créditos","Ser reconhecida pelo próprio trabalho."),
E6("Melhor amiga que trai","","Fofoca|Roubo de namorado|Abandono",nec("A"),"*Amizade é ilusão.*","Novas amizades","Isolamento|Desconfiança","Desconfiado|Reservado","Grupos|Lugares antigos","Construir uma amizade verdadeira."),
E6("Golpe de alguém amado","","Parceiro que rouba|Filho que endivida",nec("SA"),"*O amor me cega.*","Amar de novo","Desconfiança|Controle financeiro","Cauteloso|Desconfiado","Pedidos de dinheiro","Recuperar a confiança em si."),
E6("Mentor que decepciona","","Professor corrupto|Líder religioso hipócrita",nec("ER"),"*Todo ídolo cai.*","Admirar alguém","Cinismo|Independência","Cínico|Independente","Discursos","Encontrar um modelo verdadeiro."),
E6("Pai com outra família","","Descoberta de irmãos|Vida dupla",nec("AE"),"*Nunca fui prioridade.*","Ser trocada","Raiva|Busca por respostas","Ressentido|Curioso","Sobrenomes|Datas","Conhecer os irmãos."),
E6("Segredo exposto","","Diário lido|Mensagens vazadas",nec("AE"),"*Não posso me abrir.*","Exposição","Reserva|Desconfiança","Reservado|Desconfiado","Celulares|Fofocas","Contar algo a alguém e ser respeitada.")
);
GUIA.partes[6].grupos[5].itens.push(
E6("Abandono","","Pai que sumiu|Mãe que foi embora|Criança deixada com parentes",nec("AE"),"*Ninguém fica.*|*Sou fácil de deixar.*","Ser abandonada de novo","Carência|Afastar antes de ser deixada|Lealdade extrema","Carente|Independente|Leal","Despedidas|Malas|Portas","Ser escolhida e ficar."),
E6("Pais narcisistas","","Pai que compete com o filho|Mãe que vive da imagem",nec("AE"),"*Meu valor depende de agradar.*","Desagradar","Perfeccionismo|Carência|Busca de aprovação","Perfeccionista|Inseguro|Bajulador","Críticas|Comparações","Agir pela própria vontade."),
E6("Pais dependentes de álcool ou drogas","","Cuidar dos pais|Promessas quebradas|Vergonha na escola",nec("SA"),"*Tenho que cuidar de todos.*","Caos|Vício","Responsabilidade precoce|Controle|Evitar álcool ou repetir o padrão","Responsável|Controlador|Superprotetor","Cheiro de bebida|Promessas","Deixar alguém cuidar dela."),
E6("Negligência","","Fome|Sujeira|Falta de atenção",nec("FSA"),"*Não importo.*","Ser esquecida","Autossuficiência|Carência","Independente|Carente","Fome|Silêncio","Ser cuidada."),
E6("Amor condicional","","Afeto só com boas notas|Elogio só com conquistas",nec("AE"),"*Só sou amada se for perfeita.*","Falhar","Perfeccionismo|Ansiedade","Perfeccionista|Ansioso","Notas|Avaliações","Ser amada após um fracasso."),
E6("Lar adotivo e abrigos","","Vários abrigos|Devolução|Separação de irmãos",nec("SA"),"*Nenhum lugar é meu.*","Rejeição","Desconfiança|Lealdade intensa","Desconfiado|Leal|Resiliente","Malas|Mudanças","Encontrar um lar."),
E6("Crescer numa seita","","Regras rígidas|Isolamento",nec("AR"),"*O mundo lá fora é perigoso.*","Liberdade","Confusão|Rebeldia","Rebelde|Cético","Rituais|Músicas","Construir crenças próprias."),
E6("Crescer sob os holofotes","","Filha de famosos|Criança artista",nec("AE"),"*Sou só uma imagem.*","Exposição","Busca de autenticidade","Autêntico|Exibido","Câmeras","Ser vista como pessoa."),
E6("Favoritismo entre irmãos","","Irmão preferido|Comparações",nec("AE"),"*Nunca sou suficiente.*","Ser deixada de lado","Competição|Ressentimento","Competitivo|Invejoso","Elogios ao irmão","Ser valorizada pelo que é."),
E6("Abuso sexual na infância","Trate apenas pelos efeitos na vida adulta, com pesquisa séria. Em caso de denúncia, o Disque 100 é o canal de proteção à infância no Brasil.","Abuso por familiar|Por alguém de confiança",nec("SAE"),"*A culpa foi minha.*|*Não posso confiar.*","Intimidade|Ser tocada","Desconfiança|Proteção extrema a crianças|Terapia|Silêncio","Protetor|Desconfiado|Resiliente","Cheiros|Lugares|Datas","Ser acolhida, falar e encontrar segurança."),
E6("Pais superprotetores","","Proibições excessivas",nec("R"),"*Não sei me virar.*","Errar sozinha","Insegurança|Rebeldia","Inseguro|Rebelde","Regras","Conquistar autonomia."),
E6("Responsabilidade precoce","","Cuidar dos irmãos|Trabalhar cedo",nec("AR"),"*Não posso falhar.*","Descansar","Maturidade|Controle","Responsável|Controlador","Crianças chorando","Permitir-se brincar."),
E6("Divórcio dos pais","","Guarda dividida|Brigas",nec("SA"),"*Amor acaba.*","Abandono","Medo de compromisso","Desconfiado|Independente","Brigas","Viver um amor estável."),
E6("Pai violento","","Agressões|Gritos",nec("SA"),"*Preciso ficar quieta.*","Raiva alheia","Submissão ou agressividade","Submisso|Explosivo|Protetor","Gritos|Passos","Romper o ciclo.")
);
GUIA.partes[6].grupos[6].itens.push(
E6("Incêndio","","Perder a casa|Sobreviver a um incêndio",nec("S"),"*Posso perder tudo a qualquer momento.*","Fogo","Hipervigilância|Desapego","Cauteloso|Desapegado","Fumaça|Sirenes","Reconstruir."),
E6("Acidente grave","","Acidente de carro ou moto|Queda",nec("S"),"*A vida é frágil.*","Dirigir","Cautela|Valorização da vida","Cauteloso|Grato","Freadas|Hospitais","Voltar a dirigir."),
E6("Suicídio de alguém querido","Trate com cuidado: sem detalhar métodos, com foco no luto e no apoio. O CVV atende pelo 188.","Perder pai, mãe, irmão ou amigo",nec("AE"),"*Eu devia ter percebido.*","Perder outra pessoa","Culpa|Atenção aos sinais|Ativismo pela prevenção","Atento|Protetor|Culpa","Datas|Músicas","Ajudar alguém a buscar ajuda a tempo."),
E6("Aborto espontâneo","","Perda gestacional",nec("A"),"*Meu corpo falhou.*","Tentar de novo","Luto silencioso|Medo","Sensível|Resiliente","Bebês|Datas","Viver o luto e seguir."),
E6("Morte de um filho","","Doença|Acidente",nec("AR"),"*Nada faz sentido.*","Amar de novo","Luto profundo|Causa|Isolamento","Resiliente|Protetor","Datas|Brinquedos","Encontrar sentido."),
E6("Morte dos pais","","Na infância|Na vida adulta",nec("SA"),"*Estou sozinha.*","Abandono","Independência precoce|Saudade","Independente|Responsável","Datas|Fotos","Honrar a memória."),
E6("Desastre natural","","Enchente|Deslizamento de encosta|Seca extrema",nec("FS"),"*A natureza pode tirar tudo.*","Chuvas","Ansiedade com o clima|Solidariedade","Cauteloso|Solidário","Trovões|Chuva","Ajudar outros atingidos."),
E6("Perdas numa pandemia","","Morte de parentes|Isolamento",nec("SA"),"*Nada é garantido.*","Doença","Ansiedade|Valorização","Cauteloso|Grato","Hospitais|Tosse","Reconstruir laços."),
E6("Guerra ou conflito armado","","Refugiada|Ex-combatente",nec("FS"),"*O mundo é violento.*","Barulhos","Hipervigilância|Pesadelos","Cauteloso|Protetor","Fogos|Helicópteros","Encontrar paz."),
E6("Tragédia coletiva","","Rompimento de barragem|Incêndio em boate|Desabamento",nec("SA"),"*Ninguém está seguro.*","Lugares cheios","Culpa do sobrevivente|Luta por justiça","Justo|Resiliente|Indignado","Datas|Notícias","Lutar por memória e justiça."),
E6("Diagnóstico terminal","","Câncer|Doença degenerativa",nec("SR"),"*Meu tempo acabou.*","Morrer","Reavaliar prioridades|Reconciliar-se","Grato|Corajoso","Exames","Viver o que resta com sentido."),
E6("Testemunhar uma morte","","Acidente|Doença",nec("S"),"*A morte está em todo lugar.*","Perder alguém","Ansiedade|Valorização","Cauteloso|Grato","Lugares","Superar o trauma."),
E6("Viuvez","","Perder o parceiro de vida",nec("A"),"*Nunca vou amar de novo.*","Solidão","Luto|Isolamento|Recomeço","Leal|Resiliente","Datas|Objetos","Abrir espaço para novos afetos.")
);
})();
