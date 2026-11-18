// PARTE 8 — entradas de conflito
(function(){
const G=GUIA.partes[8].grupos;
G[0].itens.push(
E8("Divórcio","Separação amigável que azeda|Divórcio litigioso|Descobrir que o outro já tem alguém|Divisão de bens e guarda dos filhos","Dividir os amigos do casal|Mudar o status nas redes e arquivar as fotos|Decidir quem fica com o cachorro|Festas de fim de ano separadas","Perder a guarda|Ruína financeira na partilha|Filhos usados como arma|Depressão","Tristeza|Raiva|Alívio|Culpa|Solidão","*Fiz tudo errado?*|*Devo lutar ou deixar ir?*|*Ainda o amo?*","Rancoroso|Vingativo|Controlador|Vitimista","Amor e pertencimento: a família como era deixa de existir.|Segurança: casa, renda e rotina ficam instáveis.","Maduro|Justo|Resiliente|Paciente","Descobrir a própria força, reconstruir a identidade e construir uma relação mais saudável com os filhos e com o ex."),
E8("Ex que interfere","Ex que aparece no novo trabalho|Ex que fala mal nas redes|Ex que tenta voltar","Mensagens fora de hora|Encontros em festas|Comentários nas fotos","Fim do novo relacionamento|Exposição pública|Perseguição","Irritação|Ciúme|Ansiedade|Raiva","*Ainda sinto algo?*|*Devo enfrentar ou ignorar?*","Indeciso|Ciumento|Explosivo","Amor e pertencimento: ameaça a nova relação.","Assertivo|Calmo|Maduro","Aprender a impor limites e fechar o ciclo."),
E8("Rival amoroso","Disputar alguém com uma amiga|Rival mais bonita ou rica","Comparações|Provocações|Indiretas","Perder a pessoa e a amizade|Humilhação","Ciúme|Inveja|Insegurança","*Vale a pena lutar?*|*Sou suficiente?*","Invejoso|Inseguro|Ciumento","Estima: autoestima abalada.","Confiante|Honesto|Autêntico","Descobrir o próprio valor fora da disputa."),
E8("Traição de um aliado","Sócio que rouba|Amigo que vaza segredo|Colega que entrega ao chefe","Silêncios estranhos|Desconfiança","Perder tudo|Ser presa|Ruptura definitiva","Mágoa|Raiva|Choque|Desconfiança","*Como não percebi?*|*Confio em mais alguém?*","Vingativo|Paranoico|Rancoroso","Segurança e pertencimento abalados.","Perspicaz|Resiliente|Justo","Aprender a escolher melhor em quem confiar."),
E8("Ser manipulada","Chantagem emocional|Mentiras|Distorção dos fatos","Dúvida sobre a própria memória|Culpa constante","Isolamento|Perda de autonomia","Confusão|Culpa|Raiva","*Estou louca?*|*A culpa é minha?*","Crédulo|Inseguro|Submisso","Estima e segurança afetadas.","Perspicaz|Assertivo|Independente","Recuperar a confiança no próprio julgamento."),
E8("Segredo de família revelado","Filho de outro pai|Dívida escondida|Irmão desconhecido","Silêncio no almoço de domingo|Briga no grupo da família","Ruptura familiar|Crise de identidade","Choque|Raiva|Mágoa","*Em quem posso confiar?*","Rancoroso|Explosivo","Pertencimento abalado.","Maduro|Perdoador","Construir uma relação mais honesta."),
E8("Perder a cabeça com alguém querido","Gritar com a mãe|Dizer algo cruel ao parceiro","Arrependimento|Silêncio","Ruptura|Afastamento","Culpa|Vergonha|Raiva","*Por que fiz isso?*","Explosivo|Orgulhoso","Pertencimento ameaçado.","Humilde|Honesto","Aprender a pedir desculpas e a se controlar."),
E8("Pressão do grupo","Amigos que incentivam algo errado|Grupo que exclui","Piadas|Exclusão","Atos arriscados|Perder valores","Insegurança|Ansiedade|Culpa","*Preciso me encaixar?*","Conformista|Inseguro","Pertencimento ameaçado.","Autêntico|Corajoso","Descobrir quem realmente é."),
E8("Parente afastado que reaparece","Pai ausente|Irmão sumido","Encontros tensos|Perguntas sem resposta","Revelações|Pedido de dinheiro","Surpresa|Raiva|Esperança","*Perdoo ou não?*","Rancoroso|Desconfiado","Pertencimento.","Perdoador|Maduro","Encerrar ciclos ou reconstruir laços."),
E8("Briga no grupo da família","Política|Herança|Fofoca","Mensagens apagadas|Indiretas","Família rachada|Festas canceladas","Irritação|Raiva|Tristeza","*Saio do grupo?*","Explosivo|Sarcástico","Pertencimento.","Diplomático|Pacificador","Aprender a dialogar.")
);
G[1].itens.push(
E8("Mentira que prejudica alguém","Mentira que tira o emprego de um colega|Mentira para os pais","Encobrir com novas mentiras","Alguém punido injustamente|Perder a confiança","Culpa|Medo|Vergonha","*Conto a verdade?*","Mentiroso|Covarde","Estima: imagem ameaçada.","Honesto|Corajoso","Assumir o erro e reparar."),
E8("Causar um acidente","Bater o carro|Derrubar alguém","Explicações|Custos","Ferimentos graves|Processo","Culpa|Medo|Remorso","*Poderia ter evitado?*","Imprudente|Negligente","Segurança e estima.","Responsável|Honesto","Mudar hábitos."),
E8("Ser pega mentindo","Mentira descoberta pelo parceiro|Currículo falso","Olhares desconfiados","Fim da relação|Demissão","Vergonha|Medo","*Explico ou admito?*","Mentiroso|Defensivo","Estima.","Honesto|Humilde","Recomeçar com a verdade."),
E8("Perder o celular","Roubo|Esquecimento","Perder contatos|Fotos|Senhas","Golpes com os dados|Exposição de segredos","Ansiedade|Raiva|Frustração","*O que alguém pode descobrir?*","Distraído|Desorganizado","Segurança.","Prático|Calmo","Rever a dependência do celular."),
E8("Mandar mensagem para a pessoa errada","Fofoca enviada para a própria pessoa|Mensagem íntima no grupo do trabalho","Constrangimento|Explicações","Fim de amizade|Demissão","Vergonha|Pânico","*Peço desculpas ou finjo que não foi nada?*","Indiscreto|Distraído","Estima.","Honesto|Humilde","Aprender a ser mais cuidadosa."),
E8("Investimento ruim","Pirâmide financeira|Apostas|Negócio que falha","Dívidas|Cobranças","Falência|Perder a casa","Ansiedade|Culpa|Desespero","*Conto para a família?*","Impulsivo|Ganancioso","Segurança.","Cauteloso|Resiliente","Aprender a lidar com dinheiro."),
E8("Subestimar um perigo","Ignorar alerta de chuva|Trilha sem equipamento","Pequenos acidentes","Tragédia|Ferimentos","Medo|Culpa","*Por que não ouvi?*","Imprudente|Presunçoso","Segurança.","Cauteloso|Responsável","Respeitar limites."),
E8("Esquecer algo importante","Aniversário|Buscar o filho|Remédio","Desculpas|Culpa","Perigo|Ruptura","Culpa|Vergonha","*Sou descuidada?*","Distraído|Esquecido","Pertencimento.","Atento|Organizado","Criar sistemas."),
E8("Errar na frente de todos","Apresentação|Discurso|Prova","Risos|Comentários","Viralizar|Perder oportunidade","Vergonha|Humilhação","*Volto a tentar?*","Inseguro|Perfeccionista","Estima.","Resiliente|Bem-humorado","Aprender a rir de si."),
E8("Confiar na pessoa errada","Golpe|Traição","Perdas pequenas","Ruína","Mágoa|Raiva","*Confio de novo?*","Crédulo|Ingênuo","Segurança.","Perspicaz|Cauteloso","Desenvolver discernimento.")
);
G[2].itens.push(
E8("Oportunidade de trapacear","Cola numa prova|Atalho num concurso","Tentação constante","Ser descoberta|Expulsão","Tentação|Culpa|Ansiedade","*Ninguém vai saber?*","Desonesto|Ambicioso","Estima.","Íntegro|Honesto","Vencer de forma justa."),
E8("Dinheiro sujo","Herança suspeita|Proposta ilegal","Desconfiança","Prisão|Morte","Desejo|Medo|Culpa","*Vale o risco?*","Ganancioso|Interesseiro","Segurança.","Íntegro|Prudente","Escolher a integridade."),
E8("Acobertar uma amiga","Traição|Crime|Mentira","Mentir para outros","Ser cúmplice","Culpa|Lealdade","*Lealdade ou verdade?*","Leal|Mentiroso","Pertencimento.","Honesto|Justo","Encontrar o equilíbrio."),
E8("Infringir a lei por um bom motivo","Roubar remédio|Esconder alguém","Fugir|Mentir","Prisão","Medo|Determinação","*O certo é sempre o legal?*","Rebelde|Imprudente","Segurança.","Corajoso|Justo","Questionar o sistema."),
E8("Sentir algo por quem não devia","Por alguém comprometido|Pelo chefe","Olhares|Distância forçada","Traição|Escândalo","Desejo|Culpa","*Sigo o coração?*","Impulsivo|Infiel","Pertencimento.","Íntegro|Maduro","Fazer escolhas conscientes."),
E8("Testemunhar corrupção","No trabalho|Na política","Pressão para calar","Ameaças|Perder o emprego","Indignação|Medo","*Denuncio?*","Covarde|Conformista","Segurança.","Corajoso|Íntegro","Defender o que é certo."),
E8("Testemunhar discriminação","Piada racista|Exclusão","Silêncio desconfortável","Cumplicidade|Conflito","Indignação|Culpa","*Me posiciono?*","Covarde|Conformista","Estima.","Justo|Corajoso","Agir conforme os valores."),
E8("Aceitar um suborno","Policial|Fiscal","Propostas","Prisão|Corrupção","Tentação|Culpa","*Ninguém vai saber?*","Ganancioso","Segurança.","Íntegro","Manter a integridade."),
E8("Mentir para proteger alguém","Esconder um erro|Encobrir uma fuga","Tensão|Mentiras em cadeia","Ser descoberta","Culpa|Medo","*Mentir é proteger?*","Mentiroso|Leal","Pertencimento.","Honesto|Protetor","Proteger com a verdade."),
E8("Encontrar dinheiro perdido","Carteira cheia|Envelope no ônibus","Dúvida","Ser acusada|Ruína de quem perdeu","Tentação|Culpa","*Devolvo?*","Ganancioso","Segurança.","Honesto|Justo","Agir com honestidade.")
);
G[3].itens.push(
E8("Filho doente","Febre na véspera de uma reunião importante|Doença grave","Faltas no trabalho|Noites sem dormir","Perder o emprego|Agravamento","Preocupação|Culpa|Ansiedade","*Trabalho ou família?*","Superprotetor|Viciado em trabalho","Segurança e pertencimento.","Protetor|Organizado","Redefinir prioridades."),
E8("Problema na escola do filho","Bullying|Notas baixas|Briga","Reuniões","Expulsão|Trauma","Preocupação|Culpa","*Onde errei?*","Controlador|Negligente","Pertencimento.","Atento|Paciente","Fortalecer o vínculo com o filho."),
E8("Cuidar de um parente idoso","Mãe com Alzheimer|Pai acamado","Cansaço|Custos","Esgotamento|Brigas entre irmãos","Culpa|Cansaço|Ternura","*E a minha vida?*","Mártir|Ressentido","Segurança e pertencimento.","Paciente|Compassivo","Encontrar apoio e dividir tarefas."),
E8("Chefia ruim","Chefe abusivo|Incompetente","Humilhações|Horas extras","Demissão|Adoecimento","Raiva|Frustração","*Fico ou saio?*","Submisso|Explosivo","Estima.","Assertivo|Resiliente","Impor limites."),
E8("Burocracia","Documento que falta|Fila do INSS","Viagens repetidas","Perder um benefício","Frustração|Impaciência","*Desisto?*","Impaciente","Segurança.","Persistente|Organizado","Persistir."),
E8("Perder o emprego","Demissão|Corte","Contas","Ruína|Depressão","Medo|Vergonha","*Quem sou sem meu trabalho?*","Inseguro|Viciado em trabalho","Segurança e estima.","Resiliente|Adaptável","Reinventar-se."),
E8("Trabalhar com um inimigo","Rival na equipe","Discussões","Fracasso do projeto","Irritação|Desconfiança","*Coopero?*","Orgulhoso|Competitivo","Estima.","Profissional|Diplomático","Superar diferenças."),
E8("Dupla jornada","Trabalho e casa sem divisão","Cansaço|Atrasos","Esgotamento","Frustração|Cansaço","*Até quando?*","Mártir|Perfeccionista","Segurança.","Assertivo|Organizado","Exigir divisão justa."),
E8("Plano de saúde nega cobertura","Cirurgia negada|Tratamento caro","Ligações|Burocracia","Agravamento|Dívidas","Indignação|Medo","*Processo?*","Desanimado","Segurança.","Persistente|Assertivo","Lutar pelos direitos."),
E8("Promessa difícil de cumprir","Promessa a alguém que morreu|Promessa de cuidar","Sacrifícios","Culpa eterna","Culpa|Determinação","*Quebro a promessa?*","Teimoso|Mártir","Pertencimento.","Leal|Honrado","Honrar sem se destruir.")
);
G[4].itens.push(
E8("Prazo antecipado","Entrega adiantada|Concurso mais cedo","Noites sem dormir","Fracasso","Ansiedade|Pânico","*Dou conta?*","Procrastinador","Estima.","Disciplinado|Eficiente","Superar limites."),
E8("Chantagem","Fotos|Segredos","Pagamentos|Ameaças","Exposição|Ruína","Medo|Raiva","*Cedo ou enfrento?*","Covarde","Segurança.","Corajoso","Enfrentar o chantagista."),
E8("Ultimato","Escolha imposta pelo parceiro|Pela empresa","Pressão","Ruptura","Ansiedade|Raiva","*O que escolher?*","Indeciso","Pertencimento.","Decidido","Fazer uma escolha consciente."),
E8("Ser caçada","Perseguição|Ameaça","Fugas|Esconderijos","Morte","Medo|Pavor","*Fujo ou enfrento?*","Imprudente","Segurança.","Corajoso|Engenhoso","Descobrir a própria força."),
E8("Despesa inesperada","Conserto do carro|Remédio caro","Cortes no orçamento","Dívidas","Ansiedade|Frustração","*De onde tiro?*","Gastador","Segurança.","Econômico|Engenhoso","Aprender a planejar."),
E8("Provar a inocência","Falsa acusação","Investigações","Prisão","Medo|Indignação","*Alguém acredita em mim?*","Explosivo","Segurança.","Persistente|Justo","Fazer a verdade aparecer."),
E8("Exposição pública","Vídeo viral|Fofoca","Comentários","Cancelamento|Demissão","Vergonha|Raiva","*Respondo?*","Defensivo","Estima.","Resiliente","Reconstruir a imagem."),
E8("Contas atrasadas","Aluguel|Luz cortada","Cobranças","Despejo","Ansiedade|Vergonha","*Peço ajuda?*","Orgulhoso","Segurança.","Engenhoso|Humilde","Aceitar ajuda."),
E8("Visita inesperada","Sogra chega|Ex aparece","Arrumações","Revelações","Surpresa|Ansiedade","*Escondo algo?*","Controlador","Pertencimento.","Hospitaleiro","Lidar com o imprevisto."),
E8("Corrida contra o tempo para salvar alguém","Resgate|Hospital","Trânsito|Obstáculos","Morte","Pânico|Determinação","*Vou conseguir?*","Impulsivo","Pertencimento.","Corajoso|Decidido","Descobrir a própria capacidade.")
);
G[5].itens.push(
E8("Ficar entre dois lados","Pais separados|Amigos brigados","Mensagens dos dois","Perder ambos","Angústia|Culpa","*Escolho um?*","Indeciso","Pertencimento.","Diplomático|Justo","Afirmar a própria posição."),
E8("Não conseguir salvar todos","Desastre|Acidente","Escolhas rápidas","Mortes","Culpa|Desespero","*Fiz o certo?*","Perfeccionista","Segurança e estima.","Corajoso|Resiliente","Aceitar os próprios limites."),
E8("Escolher o menor de dois males","Mentir ou ferir|Perder a casa ou o emprego","Pressão","Consequências duras","Angústia|Culpa","*Qual é o menos pior?*","Indeciso","Segurança.","Sábio|Racional","Assumir responsabilidade."),
E8("Sacrificar um pelo bem de muitos","Demitir um para salvar a empresa|Decisão em crise","Pressão","Culpa eterna","Culpa|Tristeza","*Tenho esse direito?*","Frio","Estima.","Justo|Compassivo","Liderar com humanidade."),
E8("Trair alguém para salvar outro","Delatar um amigo para proteger o filho","Mentiras","Ruptura","Culpa|Medo","*Quem proteger?*","Covarde","Pertencimento.","Leal|Corajoso","Encontrar a terceira via."),
E8("Escolher entre o sonho e a família","Oportunidade no exterior|Carreira","Discussões","Perder um dos dois","Angústia|Culpa","*O que importa mais?*","Egoísta|Mártir","Autorrealização e pertencimento.","Maduro|Decidido","Escolher com consciência."),
E8("Revelar um segredo ou deixar alguém sofrer","Saber da traição de um amigo","Silêncio","Ruptura","Culpa|Ansiedade","*Conto?*","Covarde|Indiscreto","Pertencimento.","Honesto|Compassivo","Agir com verdade e cuidado."),
E8("Ficar ou partir","Mudar de cidade|Terminar","Indecisão","Arrependimento","Ambivalência|Medo","*E se eu me arrepender?*","Indeciso","Segurança.","Corajoso|Decidido","Assumir o próprio caminho.")
);
})();
