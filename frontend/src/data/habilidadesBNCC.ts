// Habilidades da BNCC por componente curricular e ano

export interface HabilidadeBNCC {
  codigo: string
  descricao: string
  componente: string
  ano: number
}

export const habilidadesBNCC: HabilidadeBNCC[] = [
  // LÍNGUA PORTUGUESA - 1º ANO
  { codigo: 'EF01LP01', descricao: 'Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo da página.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP02', descricao: 'Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP03', descricao: 'Observar escritas convencionais, comparando-as às suas produções escritas.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP04', descricao: 'Distinguir as letras do alfabeto de outros sinais gráficos.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP05', descricao: 'Reconhecer o sistema de escrita alfabética como representação dos sons da fala.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP06', descricao: 'Segmentar oralmente palavras em sílabas.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP07', descricao: 'Identificar fonemas e sua representação por letras.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP08', descricao: 'Relacionar elementos sonoros das palavras com sua representação escrita.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP09', descricao: 'Comparar palavras, identificando semelhanças e diferenças entre sons.', componente: 'Língua Portuguesa', ano: 1 },
  { codigo: 'EF01LP10', descricao: 'Nomear as letras do alfabeto e recitá-lo na ordem das letras.', componente: 'Língua Portuguesa', ano: 1 },

  // LÍNGUA PORTUGUESA - 2º ANO
  { codigo: 'EF02LP01', descricao: 'Utilizar, ao produzir o texto, grafia correta de palavras conhecidas.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP02', descricao: 'Segmentar palavras em sílabas e remover e substituir sílabas iniciais, mediais ou finais.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP03', descricao: 'Ler e escrever palavras com correspondências regulares diretas entre letras e fonemas.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP04', descricao: 'Ler e escrever corretamente palavras com sílabas CV, V, CVC, CCV.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP05', descricao: 'Ler e escrever corretamente palavras com marcas de nasalidade.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP06', descricao: 'Perceber o princípio acrofônico que opera nos nomes das letras do alfabeto.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP07', descricao: 'Escrever palavras, frases, textos curtos nas formas imprensa e cursiva.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP08', descricao: 'Segmentar corretamente as palavras ao escrever frases e textos.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP09', descricao: 'Usar adequadamente ponto final, ponto de interrogação e ponto de exclamação.', componente: 'Língua Portuguesa', ano: 2 },
  { codigo: 'EF02LP10', descricao: 'Identificar sinônimos de palavras de texto lido, determinando a diferença de sentido entre eles.', componente: 'Língua Portuguesa', ano: 2 },

  // LÍNGUA PORTUGUESA - 3º ANO
  { codigo: 'EF03LP01', descricao: 'Ler e escrever palavras com correspondências regulares contextuais entre grafemas e fonemas.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP02', descricao: 'Ler e escrever corretamente palavras com sílabas complexas.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP03', descricao: 'Ler e escrever corretamente palavras com os dígrafos lh, nh, ch.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP04', descricao: 'Usar acento gráfico (agudo ou circunflexo) em monossílabos tônicos terminados em a, e, o.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP05', descricao: 'Identificar o número de sílabas de palavras, classificando-as em monossílabas, dissílabas, trissílabas e polissílabas.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP06', descricao: 'Identificar a sílaba tônica em palavras, classificando-as em oxítonas, paroxítonas e proparoxítonas.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP07', descricao: 'Identificar a função na leitura e usar na escrita ponto final, ponto de interrogação, ponto de exclamação e, em diálogos, dois-pontos e travessão.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP08', descricao: 'Identificar e diferenciar, em textos, substantivos e verbos e suas funções na oração.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP09', descricao: 'Identificar, em textos, adjetivos e sua função de atribuição de propriedades aos substantivos.', componente: 'Língua Portuguesa', ano: 3 },
  { codigo: 'EF03LP10', descricao: 'Reconhecer prefixos e sufixos produtivos na formação de palavras derivadas de substantivos, de adjetivos e de verbos.', componente: 'Língua Portuguesa', ano: 3 },

  // LÍNGUA PORTUGUESA - 4º ANO
  { codigo: 'EF04LP01', descricao: 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP02', descricao: 'Ler e escrever, corretamente, palavras com sílabas VV e CVV em casos nos quais a combinação VV (ditongo) é reduzida.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP03', descricao: 'Localizar palavras no dicionário para esclarecer significados.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP04', descricao: 'Usar acento gráfico em palavras oxítonas terminadas em -a(s), -e(s), -o(s) e -em.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP05', descricao: 'Identificar a função na leitura e usar, adequadamente, na escrita ponto final, de interrogação, de exclamação, dois-pontos e travessão.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP06', descricao: 'Identificar em textos e usar na produção textual a concordância entre substantivo ou pronome pessoal e verbo.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP07', descricao: 'Identificar em textos e usar na produção textual a concordância entre artigo, substantivo e adjetivo.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP08', descricao: 'Reconhecer e grafar, corretamente, palavras derivadas com os sufixos -agem, -oso, -eza, -izar/-isar.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP09', descricao: 'Ler e compreender, com autonomia, boletos, faturas e carnês, dentre outros gêneros do campo da vida cotidiana.', componente: 'Língua Portuguesa', ano: 4 },
  { codigo: 'EF04LP10', descricao: 'Ler e compreender, com autonomia, cartas pessoais de reclamação, dentre outros gêneros.', componente: 'Língua Portuguesa', ano: 4 },

  // LÍNGUA PORTUGUESA - 5º ANO
  { codigo: 'EF05LP01', descricao: 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares, contextuais e morfológicas.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP02', descricao: 'Identificar o caráter polissêmico das palavras, conforme o contexto de uso.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP03', descricao: 'Acentuar corretamente palavras oxítonas, paroxítonas e proparoxítonas.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP04', descricao: 'Diferenciar, na leitura de textos, vírgula, ponto e vírgula, dois-pontos e reconhecer seus efeitos de sentido.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP05', descricao: 'Identificar a expressão de presente, passado e futuro em tempos verbais do modo indicativo.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP06', descricao: 'Flexionar, adequadamente, na escrita e na oralidade, os verbos em concordância com pronomes pessoais/nomes sujeitos da oração.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP07', descricao: 'Identificar, em textos, o uso de conjunções e a relação que estabelecem entre partes do texto: adição, oposição, tempo, causa, condição, finalidade.', componente: 'Língua Portuguesa', ano: 5 },
  { codigo: 'EF05LP08', descricao: 'Diferenciar palavras primitivas, derivadas e compostas, e derivadas por adição de prefixo e de sufixo.', componente: 'Língua Portuguesa', ano: 5 },

  // LÍNGUA PORTUGUESA - 6º ANO
  { codigo: 'EF06LP01', descricao: 'Reconhecer a impossibilidade de uma neutralidade absoluta no relato de fatos e identificar diferentes graus de parcialidade/imparcialidade.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF06LP02', descricao: 'Estabelecer relação entre os diferentes gêneros jornalísticos, compreendendo a centralidade da notícia.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF06LP03', descricao: 'Analisar diferenças de sentido entre palavras de uma série sinonímica.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF06LP04', descricao: 'Analisar a função e as flexões de substantivos e adjetivos e de verbos nos modos Indicativo, Subjuntivo e Imperativo.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF06LP05', descricao: 'Identificar os efeitos de sentido dos modos verbais, considerando o gênero textual e a intenção comunicativa.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF67LP01', descricao: 'Analisar a estrutura das palavras e os recursos de formação de palavras (derivação, composição).', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF67LP02', descricao: 'Explorar o espaço reservado ao leitor nos jornais, revistas, impressos e on-line, sites noticiosos etc.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF67LP03', descricao: 'Comparar informações sobre um mesmo fato divulgadas em diferentes veículos e mídias.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF67LP04', descricao: 'Distinguir, em segmentos descontínuos de textos, fato da opinião enunciada em relação a esse mesmo fato.', componente: 'Língua Portuguesa', ano: 6 },
  { codigo: 'EF67LP05', descricao: 'Identificar e avaliar teses/opiniões/posicionamentos explícitos e argumentos em textos argumentativos.', componente: 'Língua Portuguesa', ano: 6 },

  // LÍNGUA PORTUGUESA - 7º ANO
  { codigo: 'EF67LP06', descricao: 'Identificar os efeitos de sentido provocados pela seleção lexical, topicalização de elementos e seleção e hierarquização de informações.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF67LP07', descricao: 'Identificar o uso de recursos persuasivos em textos argumentativos diversos e reivindicatórios e propositivos.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF67LP08', descricao: 'Identificar os efeitos de sentido devidos à escolha de imagens estáticas, sequenciação ou sobreposição de imagens, definição de figura/fundo, ângulo, profundidade e foco.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP01', descricao: 'Distinguir diferentes propostas editoriais – sensacionalismo, jornalismo investigativo etc. –, de forma a identificar os recursos utilizados.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP02', descricao: 'Comparar notícias e reportagens sobre um mesmo fato divulgadas em diferentes mídias, analisando as especificidades das mídias.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP03', descricao: 'Formar, com base em palavras primitivas, palavras derivadas com os prefixos e sufixos mais produtivos no português.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP04', descricao: 'Reconhecer, em textos, o verbo como o núcleo das orações.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP05', descricao: 'Identificar, em orações de textos lidos ou de produção própria, verbos de predicação completa e incompleta.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP06', descricao: 'Empregar as regras básicas de concordância nominal e verbal em situações comunicativas e na produção de textos.', componente: 'Língua Portuguesa', ano: 7 },
  { codigo: 'EF07LP07', descricao: 'Identificar, em textos lidos ou de produção própria, a estrutura básica da oração: sujeito, predicado, complemento.', componente: 'Língua Portuguesa', ano: 7 },

  // LÍNGUA PORTUGUESA - 8º ANO
  { codigo: 'EF89LP01', descricao: 'Analisar os interesses que movem o campo jornalístico, os efeitos das novas tecnologias no campo e as condições que fazem da informação uma mercadoria.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF89LP02', descricao: 'Analisar diferentes práticas, selecionando procedimentos e estratégias de leitura adequados a diferentes objetivos e levando em conta características dos gêneros e suportes.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF89LP03', descricao: 'Analisar textos de opinião e reconhecer neles a presença de valores sociais, culturais e humanos.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF08LP01', descricao: 'Identificar e comparar as várias editorias de jornais impressos e digitais e de sites noticiosos.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF08LP02', descricao: 'Justificar diferenças ou semelhanças no tratamento dado a uma mesma informação veiculada em textos diferentes.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF08LP03', descricao: 'Produzir artigos de opinião, tendo em vista o contexto de produção dado, assumindo posição diante de tema polêmico.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF08LP04', descricao: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: ortografia, regências e concordâncias nominal e verbal.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF08LP05', descricao: 'Analisar processos de formação de palavras por composição, derivação prefixal, sufixal e parassintética.', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF09LP01', descricao: 'Analisar o fenômeno da disseminação de notícias falsas nas redes sociais e desenvolver estratégias para reconhecê-las.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF09LP02', descricao: 'Analisar e comentar notícias, fotorreportagens e entrevistas, identificando características desses gêneros.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF09LP03', descricao: 'Produzir artigos de opinião, tendo em vista o contexto de produção dado, assumindo posição diante de tema polêmico.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF09LP04', descricao: 'Escrever textos corretamente, de acordo com a norma-padrão, com estruturas sintáticas complexas no nível da oração e do período.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF09LP05', descricao: 'Identificar, em textos lidos e em produções próprias, orações com a estrutura sujeito-verbo de ligação-predicativo.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF09LP06', descricao: 'Diferenciar, em textos lidos e em produções próprias, o efeito de sentido do uso de orações adjetivas restritivas e explicativas.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF09LP07', descricao: 'Comparar o uso de regência verbal e regência nominal na norma-padrão com seu uso no português brasileiro coloquial oral.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF08LP06', descricao: 'Identificar, em textos lidos ou de produção própria, os termos constitutivos da oração (sujeito e seus modificadores, verbo e seus complementos e modificadores).', componente: 'Língua Portuguesa', ano: 8 },
  { codigo: 'EF08LP07', descricao: 'Diferenciar, em textos lidos ou de produção própria, complementos diretos e indiretos de verbos transitivos.', componente: 'Língua Portuguesa', ano: 8 },

  // LÍNGUA PORTUGUESA - 9º ANO
  { codigo: 'EF89LP04', descricao: 'Identificar e avaliar teses/opiniões/posicionamentos explícitos e implícitos, argumentos e contra-argumentos em textos argumentativos.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF89LP05', descricao: 'Analisar o efeito de sentido produzido pelo uso, em textos, de recurso a formas de apropriação textual.', componente: 'Língua Portuguesa', ano: 9 },
  { codigo: 'EF89LP06', descricao: 'Analisar o uso de recursos persuasivos em textos argumentativos diversos e reivindicatórios e propositivos.', componente: 'Língua Portuguesa', ano: 9 },

  // MATEMÁTICA - 1º ANO
  { codigo: 'EF01MA01', descricao: 'Utilizar números naturais como indicadores de quantidade ou de ordem em diferentes situações cotidianas.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA02', descricao: 'Contar de maneira exata ou aproximada, utilizando diferentes estratégias como o pareamento e outros agrupamentos.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA03', descricao: 'Estimar e comparar quantidades de objetos de dois conjuntos (em torno de 20 elementos).', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA04', descricao: 'Contar a quantidade de objetos de coleções até 100 unidades e apresentar o resultado por registros verbais e simbólicos.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA05', descricao: 'Comparar números naturais de até duas ordens em situações cotidianas, com e sem suporte da reta numérica.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA06', descricao: 'Construir fatos básicos da adição e utilizá-los em procedimentos de cálculo para resolver problemas.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA07', descricao: 'Compor e decompor número de até duas ordens, por meio de diferentes adições, com o suporte de material manipulável.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA08', descricao: 'Resolver e elaborar problemas de adição e de subtração, envolvendo números de até dois algarismos.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA09', descricao: 'Organizar e ordenar objetos familiares ou representações por figuras, por meio de atributos.', componente: 'Matemática', ano: 1 },
  { codigo: 'EF01MA10', descricao: 'Descrever, após o reconhecimento e a manipulação de modelos tridimensionais, características de figuras geométricas espaciais.', componente: 'Matemática', ano: 1 },

  // MATEMÁTICA - 2º ANO
  { codigo: 'EF02MA01', descricao: 'Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA02', descricao: 'Fazer estimativas por meio de estratégias diversas a respeito da quantidade de objetos de coleções.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA03', descricao: 'Comparar quantidades de objetos de dois conjuntos, por estimativa e/ou por correspondência (um a um, dois a dois).', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA04', descricao: 'Compor e decompor números naturais de até três ordens, com suporte de material manipulável.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA05', descricao: 'Construir fatos básicos da adição e subtração e utilizá-los no cálculo mental ou escrito.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA06', descricao: 'Resolver e elaborar problemas de adição e de subtração, envolvendo números de até três ordens.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA07', descricao: 'Resolver e elaborar problemas de multiplicação (por 2, 3, 4 e 5) com o suporte de imagens e material manipulável.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA08', descricao: 'Resolver e elaborar problemas envolvendo dobro, metade, triplo e terça parte.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA09', descricao: 'Construir sequências de números naturais em ordem crescente ou decrescente a partir de um número qualquer.', componente: 'Matemática', ano: 2 },
  { codigo: 'EF02MA10', descricao: 'Descrever um padrão (ou regularidade) de sequências repetitivas e de sequências recursivas.', componente: 'Matemática', ano: 2 },

  // MATEMÁTICA - 3º ANO
  { codigo: 'EF03MA01', descricao: 'Ler, escrever e comparar números naturais de até a ordem de unidade de milhar.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA02', descricao: 'Identificar características do sistema de numeração decimal, utilizando a composição e a decomposição de número natural.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA03', descricao: 'Construir e utilizar fatos básicos da adição e da multiplicação para o cálculo mental ou escrito.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA04', descricao: 'Estabelecer a relação entre números naturais e pontos da reta numérica para utilizá-la na ordenação dos números naturais.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA05', descricao: 'Utilizar diferentes procedimentos de cálculo mental e escrito para resolver problemas.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA06', descricao: 'Resolver e elaborar problemas de adição e subtração com os significados de juntar, acrescentar, separar, retirar, comparar e completar quantidades.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA07', descricao: 'Resolver e elaborar problemas de multiplicação (por 2, 3, 4, 5 e 10) com os significados de adição de parcelas iguais e elementos apresentados em disposição retangular.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA08', descricao: 'Resolver e elaborar problemas de divisão de um número natural por outro (até 10), com resto zero e com resto diferente de zero.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA09', descricao: 'Associar o quociente de uma divisão com resto zero de um número natural por 2, 3, 4, 5 e 10 às ideias de metade, terça, quarta, quinta e décima partes.', componente: 'Matemática', ano: 3 },
  { codigo: 'EF03MA10', descricao: 'Identificar regularidades em sequências ordenadas de números naturais, resultantes da realização de adições ou subtrações sucessivas.', componente: 'Matemática', ano: 3 },

  // MATEMÁTICA - 4º ANO
  { codigo: 'EF04MA01', descricao: 'Ler, escrever e ordenar números naturais até a ordem de dezenas de milhar.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA02', descricao: 'Mostrar, por decomposição e composição, que todo número natural pode ser escrito por meio de adições e multiplicações por potências de dez.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA03', descricao: 'Resolver e elaborar problemas com números naturais envolvendo adição e subtração, utilizando estratégias diversas.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA04', descricao: 'Utilizar as relações entre adição e subtração, bem como entre multiplicação e divisão, para ampliar as estratégias de cálculo.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA05', descricao: 'Utilizar as propriedades das operações para desenvolver estratégias de cálculo.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA06', descricao: 'Resolver e elaborar problemas envolvendo diferentes significados da multiplicação, utilizando estratégias diversas.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA07', descricao: 'Resolver e elaborar problemas de divisão cujo divisor tenha no máximo dois algarismos.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA08', descricao: 'Resolver, com o suporte de imagem e/ou material manipulável, problemas simples de contagem, como a determinação do número de agrupamentos possíveis.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA09', descricao: 'Reconhecer as frações unitárias mais usuais (1/2, 1/3, 1/4, 1/5, 1/10 e 1/100) como unidades de medida menores do que uma unidade.', componente: 'Matemática', ano: 4 },
  { codigo: 'EF04MA10', descricao: 'Reconhecer que as regras do sistema de numeração decimal podem ser estendidas para a representação decimal de um número racional.', componente: 'Matemática', ano: 4 },

  // MATEMÁTICA - 5º ANO
  { codigo: 'EF05MA01', descricao: 'Ler, escrever e ordenar números naturais até a ordem das centenas de milhar com compreensão das principais características do sistema de numeração decimal.', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA02', descricao: 'Ler, escrever e ordenar números racionais na forma decimal com compreensão das principais características do sistema de numeração decimal.', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA03', descricao: 'Identificar e representar frações (menores e maiores que a unidade), associando-as ao resultado de uma divisão.', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA04', descricao: 'Identificar frações equivalentes.', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA05', descricao: 'Comparar e ordenar números racionais positivos (representações fracionária e decimal).', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA06', descricao: 'Associar as representações 10%, 25%, 50%, 75% e 100% respectivamente à décima parte, quarta parte, metade, três quartos e um inteiro.', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA07', descricao: 'Resolver e elaborar problemas de adição e subtração com números naturais e com números racionais, cuja representação decimal seja finita.', componente: 'Matemática', ano: 5 },
  { codigo: 'EF05MA08', descricao: 'Resolver e elaborar problemas de multiplicação e divisão com números naturais e com números racionais cuja representação decimal é finita.', componente: 'Matemática', ano: 5 },

  // MATEMÁTICA - 6º ANO
  { codigo: 'EF06MA01', descricao: 'Comparar, ordenar, ler e escrever números naturais e números racionais cuja representação decimal é finita.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA02', descricao: 'Reconhecer o sistema de numeração decimal, como o que prevaleceu no mundo ocidental, e destacar semelhanças e diferenças com outros sistemas.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA03', descricao: 'Resolver e elaborar problemas que envolvam cálculos (mentais ou escritos, exatos ou aproximados) com números naturais.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA04', descricao: 'Construir algoritmo em linguagem natural e representá-lo por fluxograma que indique a resolução de um problema simples.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA05', descricao: 'Classificar números naturais em primos e compostos, estabelecer relações entre números, expressas pelos termos "é múltiplo de", "é divisor de", "é fator de".', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA06', descricao: 'Resolver e elaborar problemas que envolvam as ideias de múltiplo e de divisor.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA07', descricao: 'Compreender, comparar e ordenar frações associadas às ideias de partes de inteiros e resultado de divisão.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA08', descricao: 'Reconhecer que os números racionais positivos podem ser expressos nas formas fracionária e decimal.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA09', descricao: 'Resolver e elaborar problemas que envolvam o cálculo da fração de uma quantidade e cujo resultado seja um número natural.', componente: 'Matemática', ano: 6 },
  { codigo: 'EF06MA10', descricao: 'Resolver e elaborar problemas que envolvam adição ou subtração com números racionais positivos na representação fracionária.', componente: 'Matemática', ano: 6 },

  // MATEMÁTICA - 7º ANO
  { codigo: 'EF07MA01', descricao: 'Resolver e elaborar problemas com números naturais, envolvendo as noções de divisor e de múltiplo, podendo incluir máximo divisor comum ou mínimo múltiplo comum.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA02', descricao: 'Resolver e elaborar problemas que envolvam porcentagens, como os que lidam com acréscimos e decréscimos simples, utilizando estratégias pessoais, cálculo mental e calculadora.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA03', descricao: 'Comparar e ordenar números inteiros em diferentes contextos, incluindo o histórico, associá-los a pontos da reta numérica e utilizá-los em situações que envolvam adição e subtração.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA04', descricao: 'Resolver e elaborar problemas que envolvam operações com números inteiros.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA05', descricao: 'Resolver um mesmo problema utilizando diferentes algoritmos.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA06', descricao: 'Reconhecer que as resoluções de um grupo de problemas que têm a mesma estrutura podem ser obtidas utilizando os mesmos procedimentos.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA07', descricao: 'Estabelecer o número π como a razão entre a medida de uma circunferência e seu diâmetro, para compreender e resolver problemas.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA08', descricao: 'Comparar e ordenar frações associadas às ideias de partes de inteiros, resultado da divisão, razão e operador.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA09', descricao: 'Utilizar, na resolução de problemas, a associação entre razão e fração, como a fração 2/3 para expressar a razão de duas partes de uma grandeza para três partes da mesma.', componente: 'Matemática', ano: 7 },
  { codigo: 'EF07MA10', descricao: 'Comparar e ordenar números racionais em diferentes contextos e associá-los a pontos da reta numérica.', componente: 'Matemática', ano: 7 },

  // MATEMÁTICA - 8º ANO
  { codigo: 'EF08MA01', descricao: 'Efetuar cálculos com potências de expoentes inteiros e aplicar esse conhecimento na representação de números em notação científica.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA02', descricao: 'Resolver e elaborar problemas usando a relação entre potenciação e radiciação, para representar uma raiz como potência de expoente fracionário.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA03', descricao: 'Resolver e elaborar problemas de contagem cuja resolução envolve a aplicação do princípio multiplicativo.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA04', descricao: 'Resolver e elaborar problemas, envolvendo cálculo de porcentagens, incluindo o uso de tecnologias digitais.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA05', descricao: 'Reconhecer e utilizar procedimentos para a obtenção de uma fração geratriz para uma dízima periódica.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA06', descricao: 'Resolver e elaborar problemas que envolvam cálculo do valor numérico de expressões algébricas.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA07', descricao: 'Associar uma equação linear de 1º grau com duas incógnitas a uma reta no plano cartesiano.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA08', descricao: 'Resolver e elaborar problemas relacionados ao seu contexto próximo, que possam ser representados por sistemas de equações de 1º grau com duas incógnitas.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA09', descricao: 'Resolver e elaborar, com e sem uso de tecnologias, problemas que possam ser representados por equações polinomiais de 2º grau do tipo ax² = b.', componente: 'Matemática', ano: 8 },
  { codigo: 'EF08MA10', descricao: 'Identificar a regularidade de uma sequência numérica ou figural não recursiva e construir um algoritmo por meio de um fluxograma.', componente: 'Matemática', ano: 8 },

  // MATEMÁTICA - 9º ANO
  { codigo: 'EF09MA01', descricao: 'Reconhecer que, uma vez fixada uma unidade de comprimento, existem segmentos de reta cujo comprimento não é expresso por número racional.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA02', descricao: 'Reconhecer um número irracional como um número real cuja representação decimal é infinita e não periódica, e estimar a localização de alguns deles na reta numérica.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA03', descricao: 'Efetuar cálculos com números reais, inclusive potências com expoentes negativos e fracionários.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA04', descricao: 'Resolver e elaborar problemas com números reais, inclusive em notação científica, envolvendo diferentes operações.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA05', descricao: 'Resolver e elaborar problemas que envolvam porcentagens, com a ideia de aplicação de percentuais sucessivos e a determinação das taxas percentuais.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA06', descricao: 'Compreender as funções como relações de dependência unívoca entre duas variáveis e suas representações numérica, algébrica e gráfica.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA07', descricao: 'Resolver problemas que envolvam a razão entre duas grandezas de espécies diferentes, como velocidade e densidade demográfica.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA08', descricao: 'Resolver e elaborar problemas que envolvam relações de proporcionalidade direta e inversa entre duas ou mais grandezas.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA09', descricao: 'Compreender os processos de fatoração de expressões algébricas, com base em suas relações com os produtos notáveis.', componente: 'Matemática', ano: 9 },
  { codigo: 'EF09MA10', descricao: 'Demonstrar relações simples entre os ângulos formados por retas paralelas cortadas por uma transversal.', componente: 'Matemática', ano: 9 },

  // CIÊNCIAS - 1º ANO
  { codigo: 'EF01CI01', descricao: 'Comparar características de diferentes materiais presentes em objetos de uso cotidiano.', componente: 'Ciências', ano: 1 },
  { codigo: 'EF01CI02', descricao: 'Localizar, nomear e representar graficamente (por meio de desenhos) partes do corpo humano.', componente: 'Ciências', ano: 1 },
  { codigo: 'EF01CI03', descricao: 'Discutir as razões pelas quais os hábitos de higiene do corpo são necessários para a manutenção da saúde.', componente: 'Ciências', ano: 1 },
  { codigo: 'EF01CI04', descricao: 'Comparar características físicas entre os colegas, reconhecendo a diversidade.', componente: 'Ciências', ano: 1 },
  { codigo: 'EF01CI05', descricao: 'Identificar e nomear diferentes escalas de tempo: os períodos diários e a sucessão de dias, semanas, meses e anos.', componente: 'Ciências', ano: 1 },
  { codigo: 'EF01CI06', descricao: 'Selecionar exemplos de como a sucessão de dias e noites orienta o ritmo de atividades diárias de seres humanos e de outros seres vivos.', componente: 'Ciências', ano: 1 },

  // CIÊNCIAS - 2º ANO
  { codigo: 'EF02CI01', descricao: 'Identificar de que materiais são feitos os objetos que fazem parte da vida cotidiana, como esses objetos são utilizados e com quais materiais eram produzidos no passado.', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI02', descricao: 'Propor o uso de diferentes materiais para a construção de objetos de uso cotidiano, tendo em vista algumas propriedades desses materiais.', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI03', descricao: 'Discutir os cuidados necessários à prevenção de acidentes domésticos (objetos cortantes e inflamáveis, eletricidade, produtos de limpeza, medicamentos etc.).', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI04', descricao: 'Descrever características de plantas e animais (tamanho, forma, cor, fase da vida, local onde se desenvolvem etc.) que fazem parte de seu cotidiano e relacioná-las ao ambiente em que eles vivem.', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI05', descricao: 'Investigar a importância da água e da luz para a manutenção da vida de plantas em geral.', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI06', descricao: 'Identificar as principais partes de uma planta (raiz, caule, folhas, flores e frutos) e a função desempenhada por cada uma delas.', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI07', descricao: 'Descrever as posições do Sol em diversos horários do dia e associar o surgimento do Sol ao começo do dia e o ocaso ao fim do dia.', componente: 'Ciências', ano: 2 },
  { codigo: 'EF02CI08', descricao: 'Comparar o efeito da radiação solar (luz e calor) no ambiente, nas plantas e nos animais, durante o dia e à noite.', componente: 'Ciências', ano: 2 },

  // CIÊNCIAS - 3º ANO
  { codigo: 'EF03CI01', descricao: 'Produzir diferentes sons a partir da vibração de variados objetos e identificar variáveis que influem nesse fenômeno.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI02', descricao: 'Experimentar e relatar o que ocorre com a passagem da luz através de objetos transparentes, translúcidos e opacos.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI03', descricao: 'Discutir hábitos necessários para a manutenção da saúde auditiva e visual considerando as condições do ambiente em termos de som e luz.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI04', descricao: 'Identificar características sobre o modo de vida (alimentação, reprodução etc.) dos animais mais comuns no ambiente próximo.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI05', descricao: 'Descrever e comunicar as alterações que ocorrem desde o nascimento em animais de diferentes meios terrestres ou aquáticos.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI06', descricao: 'Comparar alguns animais e organizá-los em grupos com base em características externas comuns (presença de penas, pelos, escamas, bico, garras, antenas, patas etc.).', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI07', descricao: 'Identificar características da Terra (como seu formato esférico, a presença de água, solo etc.), com base na observação, manipulação e comparação de diferentes formas de representação do planeta.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI08', descricao: 'Observar, identificar e registrar os períodos diários (manhã, tarde, noite) em que o Sol, demais estrelas, Lua e planetas estão visíveis no céu.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI09', descricao: 'Comparar diferentes amostras de solo do entorno da escola com base em características como cor, textura, cheiro, tamanho das partículas, permeabilidade etc.', componente: 'Ciências', ano: 3 },
  { codigo: 'EF03CI10', descricao: 'Identificar os diferentes usos do solo (construção, agricultura, extrativismo etc.), reconhecendo a importância do solo para a agricultura e para a vida.', componente: 'Ciências', ano: 3 },

  // CIÊNCIAS - 4º ANO
  { codigo: 'EF04CI01', descricao: 'Identificar misturas na vida diária, com base em suas propriedades físicas observáveis, reconhecendo sua composição.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI02', descricao: 'Testar e relatar transformações nos materiais do dia a dia quando expostos a diferentes condições (aquecimento, resfriamento, luz e umidade).', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI03', descricao: 'Concluir que algumas mudanças causadas por aquecimento ou resfriamento são reversíveis (como as mudanças de estado físico da água) e outras não.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI04', descricao: 'Analisar e construir cadeias alimentares simples, reconhecendo a posição ocupada pelos seres vivos nessas cadeias e o papel do Sol como fonte primária de energia.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI05', descricao: 'Descrever e destacar semelhanças e diferenças entre o ciclo da matéria e o fluxo de energia entre os componentes vivos e não vivos de um ecossistema.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI06', descricao: 'Relacionar a participação de fungos e bactérias no processo de decomposição, reconhecendo a importância ambiental desse processo.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI07', descricao: 'Verificar a participação de microrganismos na produção de alimentos, combustíveis, medicamentos, entre outros.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI08', descricao: 'Propor, a partir do conhecimento das formas de transmissão de alguns microrganismos, atitudes e medidas adequadas para prevenção de doenças a eles associadas.', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI09', descricao: 'Identificar os pontos cardeais, com base no registro de diferentes posições relativas do Sol e da sombra de uma vara (gnômon).', componente: 'Ciências', ano: 4 },
  { codigo: 'EF04CI10', descricao: 'Comparar as indicações dos pontos cardeais resultantes da observação das sombras de uma vara (gnômon) com aquelas obtidas por meio de uma bússola.', componente: 'Ciências', ano: 4 },

  // CIÊNCIAS - 5º ANO
  { codigo: 'EF05CI01', descricao: 'Explorar fenômenos da vida cotidiana que evidenciem propriedades físicas dos materiais – como densidade, condutibilidade térmica e elétrica, respostas a forças magnéticas, solubilidade, respostas a forças mecânicas.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI02', descricao: 'Aplicar os conhecimentos sobre as mudanças de estado físico da água para explicar o ciclo hidrológico e analisar suas implicações na agricultura, no clima, na geração de energia elétrica, no provimento de água potável e no equilíbrio dos ecossistemas.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI03', descricao: 'Selecionar argumentos que justifiquem a importância da cobertura vegetal para a manutenção do ciclo da água, a conservação dos solos, dos cursos de água e da qualidade do ar atmosférico.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI04', descricao: 'Identificar os principais usos da água e de outros materiais nas atividades cotidianas para discutir e propor formas sustentáveis de utilização desses recursos.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI05', descricao: 'Construir proposições coletivas para um consumo mais consciente e criar soluções tecnológicas para o descarte adequado e a reutilização ou reciclagem de materiais consumidos na escola e/ou na vida cotidiana.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI06', descricao: 'Selecionar argumentos que justifiquem por que os sistemas de transporte e comunicação são considerados infraestruturas essenciais para o funcionamento da sociedade moderna.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI07', descricao: 'Justificar a relação entre o funcionamento do sistema circulatório, a distribuição dos nutrientes pelo organismo e a eliminação dos resíduos produzidos.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI08', descricao: 'Organizar um cardápio equilibrado com base nas características dos grupos alimentares e nas necessidades individuais.', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI09', descricao: 'Discutir a ocorrência de distúrbios nutricionais (como obesidade, subnutrição etc.) entre crianças e jovens a partir da análise de seus hábitos (tipos e quantidade de alimento ingerido, prática de atividade física etc.).', componente: 'Ciências', ano: 5 },
  { codigo: 'EF05CI10', descricao: 'Identificar algumas constelações no céu, com o apoio de recursos (como mapas celestes e aplicativos digitais), e os períodos do ano em que elas são visíveis no início da noite.', componente: 'Ciências', ano: 5 },

  // CIÊNCIAS - 6º ANO
  { codigo: 'EF06CI01', descricao: 'Classificar como homogênea ou heterogênea a mistura de dois ou mais materiais (água e sal, água e óleo, água e areia etc.).', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI02', descricao: 'Identificar evidências de transformações químicas a partir do resultado de misturas de materiais que originam produtos diferentes dos que foram misturados.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI03', descricao: 'Selecionar métodos mais adequados para a separação de diferentes sistemas heterogêneos a partir da identificação de processos de separação de materiais.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI04', descricao: 'Associar a produção de medicamentos e outros materiais sintéticos ao desenvolvimento científico e tecnológico, reconhecendo benefícios e avaliando impactos socioambientais.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI05', descricao: 'Explicar a organização básica das células e seu papel como unidade estrutural e funcional dos seres vivos.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI06', descricao: 'Concluir, com base na análise de ilustrações e/ou modelos, que os organismos são um complexo arranjo de sistemas com diferentes níveis de organização.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI07', descricao: 'Justificar o papel do sistema nervoso na coordenação das ações motoras e sensoriais do corpo.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI08', descricao: 'Explicar a importância da visão (captada pelos olhos) na interação do organismo com o meio e, com base no funcionamento do olho humano, selecionar lentes adequadas para a correção de diferentes defeitos da visão.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI09', descricao: 'Deduzir que a estrutura, a sustentação e a movimentação dos animais resultam da interação entre os sistemas muscular, ósseo e nervoso.', componente: 'Ciências', ano: 6 },
  { codigo: 'EF06CI10', descricao: 'Explicar como o funcionamento do sistema nervoso pode ser afetado por substâncias psicoativas.', componente: 'Ciências', ano: 6 },

  // CIÊNCIAS - 7º ANO
  { codigo: 'EF07CI01', descricao: 'Discutir a aplicação, ao longo da história, das máquinas simples e propor soluções e invenções para a realização de tarefas mecânicas cotidianas.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI02', descricao: 'Diferenciar temperatura, calor e sensação térmica nas diferentes situações de equilíbrio termodinâmico cotidianas.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI03', descricao: 'Utilizar o conhecimento das formas de propagação do calor para justificar a utilização de determinados materiais na vida cotidiana.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI04', descricao: 'Avaliar o papel do equilíbrio termodinâmico para a manutenção da vida na Terra, para o funcionamento de máquinas térmicas e em outras situações cotidianas.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI05', descricao: 'Discutir o uso de diferentes tipos de combustível e máquinas térmicas ao longo do tempo, para avaliar avanços, questionamentos e usos mais sustentáveis.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI06', descricao: 'Discutir e avaliar mudanças econômicas, culturais e sociais, tanto na vida cotidiana quanto no mundo do trabalho, decorrentes do desenvolvimento de novos materiais e tecnologias.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI07', descricao: 'Caracterizar os principais ecossistemas brasileiros quanto à paisagem, à quantidade de água, ao tipo de solo, à disponibilidade de luz solar, à temperatura etc.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI08', descricao: 'Avaliar como os impactos provocados por catástrofes naturais ou mudanças nos componentes físicos, biológicos ou sociais de um ecossistema afetam suas populações.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI09', descricao: 'Interpretar as condições de saúde da comunidade, cidade ou estado, com base na análise e comparação de indicadores de saúde.', componente: 'Ciências', ano: 7 },
  { codigo: 'EF07CI10', descricao: 'Argumentar sobre a importância da vacinação para a saúde pública, com base em informações sobre a maneira como a vacina atua no organismo.', componente: 'Ciências', ano: 7 },

  // CIÊNCIAS - 8º ANO
  { codigo: 'EF08CI01', descricao: 'Identificar e classificar diferentes fontes (renováveis e não renováveis) e tipos de energia utilizados em residências, comunidades ou cidades.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI02', descricao: 'Construir circuitos elétricos com pilha/bateria, fios e lâmpada ou outros dispositivos e compará-los a circuitos elétricos residenciais.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI03', descricao: 'Classificar equipamentos elétricos residenciais (chuveiro, ferro, lâmpadas, TV, rádio, geladeira etc.) de acordo com o tipo de transformação de energia.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI04', descricao: 'Calcular o consumo de eletrodomésticos a partir dos dados de potência e tempo de uso.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI05', descricao: 'Propor ações coletivas para otimizar o uso de energia elétrica em sua escola e/ou comunidade, com base na seleção de equipamentos segundo critérios de sustentabilidade.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI06', descricao: 'Discutir e avaliar usinas de geração de energia elétrica, sua distância da região de consumo e pre referir o uso de energia elétrica gerada a partir de fontes renováveis.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI07', descricao: 'Comparar diferentes processos reprodutivos em plantas e animais em relação aos mecanismos adaptativos e evolutivos.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI08', descricao: 'Analisar e explicar as transformações que ocorrem na puberdade considerando a atuação dos hormônios sexuais.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI09', descricao: 'Discutir as ideias de Mendel sobre hereditariedade, considerando-as para resolver problemas envolvendo a transmissão de características hereditárias.', componente: 'Ciências', ano: 8 },
  { codigo: 'EF08CI10', descricao: 'Identificar os principais órgãos e funções de sistemas do corpo humano, estabelecendo relações entre eles.', componente: 'Ciências', ano: 8 },

  // CIÊNCIAS - 9º ANO
  { codigo: 'EF09CI01', descricao: 'Investigar as mudanças de estado físico da matéria e explicar essas transformações com base no modelo de constituição submicroscópica.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI02', descricao: 'Comparar quantidades de reagentes e produtos envolvidos em transformações químicas, estabelecendo a proporção entre as suas massas.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI03', descricao: 'Identificar modelos que descrevem a estrutura da matéria e reconhecer sua evolução histórica.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI04', descricao: 'Planejar e executar experimentos que evidenciem que todas as cores de luz podem ser formadas pela composição das três cores primárias da luz.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI05', descricao: 'Investigar os principais mecanismos envolvidos na transmissão e recepção de imagem e som que revolucionaram os sistemas de comunicação humana.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI06', descricao: 'Classificar as radiações eletromagnéticas por suas frequências e seu uso para diferentes fins.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI07', descricao: 'Discutir o papel do avanço tecnológico na aplicação das radiações na medicina diagnóstica e no tratamento de doenças.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI08', descricao: 'Associar os gametas à transmissão das características hereditárias, estabelecendo relações entre ancestrais e descendentes.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI09', descricao: 'Discutir as ideias de Mendel sobre hereditariedade, considerando-as para resolver problemas envolvendo a transmissão de características hereditárias em diferentes organismos.', componente: 'Ciências', ano: 9 },
  { codigo: 'EF09CI10', descricao: 'Comparar as ideias evolucionistas de Lamarck e Darwin apresentadas em textos científicos e históricos.', componente: 'Ciências', ano: 9 },

  // HISTÓRIA - 1º ANO
  { codigo: 'EF01HI01', descricao: 'Identificar aspectos do seu crescimento por meio do registro das lembranças particulares ou de lembranças dos membros de sua família.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI02', descricao: 'Identificar a relação entre as suas histórias e as histórias de sua família e de sua comunidade.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI03', descricao: 'Descrever e distinguir os seus papéis e responsabilidades relacionados à família, à escola e à comunidade.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI04', descricao: 'Identificar as diferenças entre os variados ambientes em que vive.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI05', descricao: 'Identificar semelhanças e diferenças entre jogos e brincadeiras atuais e de outras épocas e lugares.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI06', descricao: 'Conhecer as histórias da família e da escola e identificar o papel desempenhado por diferentes sujeitos em diferentes espaços.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI07', descricao: 'Identificar mudanças e permanências nas formas de organização familiar.', componente: 'História', ano: 1 },
  { codigo: 'EF01HI08', descricao: 'Reconhecer o significado das comemorações e festas escolares, diferenciando-as das datas festivas comemoradas no âmbito familiar ou da comunidade.', componente: 'História', ano: 1 },

  // HISTÓRIA - 2º ANO
  { codigo: 'EF02HI01', descricao: 'Reconhecer espaços de sociabilidade e identificar os motivos que aproximam e separam as pessoas em diferentes grupos sociais ou de parentesco.', componente: 'História', ano: 2 },
  { codigo: 'EF02HI02', descricao: 'Identificar e descrever práticas e papéis sociais que as pessoas exercem em diferentes comunidades.', componente: 'História', ano: 2 },
  { codigo: 'EF02HI03', descricao: 'Selecionar situações cotidianas que remetam à percepção de mudança, pertencimento e memória.', componente: 'História', ano: 2 },
  { codigo: 'EF02HI04', descricao: 'Selecionar e compreender o significado de objetos e documentos pessoais como fontes de memórias e histórias nos âmbitos pessoal, familiar, escolar e comunitário.', componente: 'História', ano: 2 },

  // HISTÓRIA - 3º ANO
  { codigo: 'EF03HI01', descricao: 'Identificar os grupos populacionais que formam a cidade, o município e a região, as relações estabelecidas entre eles e os eventos que marcam a formação da cidade.', componente: 'História', ano: 3 },
  { codigo: 'EF03HI02', descricao: 'Selecionar, por meio da consulta de fontes de diferentes naturezas, e registrar acontecimentos ocorridos ao longo do tempo na cidade ou região em que vive.', componente: 'História', ano: 3 },
  { codigo: 'EF03HI03', descricao: 'Identificar e comparar pontos de vista em relação a eventos significativos do local em que vive, aspectos relacionados a condições sociais e à presença de diferentes grupos sociais e culturais.', componente: 'História', ano: 3 },
  { codigo: 'EF03HI04', descricao: 'Identificar os patrimônios históricos e culturais de sua cidade ou região e discutir as razões culturais, sociais e políticas para que assim sejam considerados.', componente: 'História', ano: 3 },

  // HISTÓRIA - 4º ANO
  { codigo: 'EF04HI01', descricao: 'Reconhecer a história como resultado da ação do ser humano no tempo e no espaço, com base na identificação de mudanças e permanências ao longo do tempo.', componente: 'História', ano: 4 },
  { codigo: 'EF04HI02', descricao: 'Identificar mudanças e permanências ao longo do tempo, discutindo os sentidos dos grandes marcos da história da humanidade.', componente: 'História', ano: 4 },
  { codigo: 'EF04HI03', descricao: 'Identificar as transformações ocorridas na cidade ao longo do tempo e discutir suas interferências nos modos de vida de seus habitantes.', componente: 'História', ano: 4 },
  { codigo: 'EF04HI04', descricao: 'Identificar as relações entre os indivíduos e a natureza e discutir o significado do nomadismo e da fixação das primeiras comunidades humanas.', componente: 'História', ano: 4 },

  // HISTÓRIA - 5º ANO
  { codigo: 'EF05HI01', descricao: 'Identificar os processos de formação das culturas e dos povos, relacionando-os com o espaço geográfico ocupado.', componente: 'História', ano: 5 },
  { codigo: 'EF05HI02', descricao: 'Identificar os mecanismos de organização do poder político com vistas à compreensão da ideia de Estado e/ou de outras formas de ordenação social.', componente: 'História', ano: 5 },
  { codigo: 'EF05HI03', descricao: 'Analisar o papel das culturas e das religiões na composição identitária dos povos antigos.', componente: 'História', ano: 5 },
  { codigo: 'EF05HI04', descricao: 'Associar a noção de cidadania com os princípios de respeito à diversidade, à pluralidade e aos direitos humanos.', componente: 'História', ano: 5 },

  // HISTÓRIA - 6º ANO
  { codigo: 'EF06HI01', descricao: 'Identificar diferentes formas de compreensão da noção de tempo e de periodização dos processos históricos.', componente: 'História', ano: 6 },
  { codigo: 'EF06HI02', descricao: 'Identificar a gênese da produção do saber histórico e analisar o significado das fontes que originaram determinadas formas de registro em sociedades e épocas distintas.', componente: 'História', ano: 6 },
  { codigo: 'EF06HI03', descricao: 'Identificar as hipóteses científicas sobre o surgimento da espécie humana e sua historicidade e analisar os significados dos mitos de fundação.', componente: 'História', ano: 6 },
  { codigo: 'EF06HI04', descricao: 'Conhecer as teorias sobre a origem do homem americano.', componente: 'História', ano: 6 },

  // HISTÓRIA - 7º ANO
  { codigo: 'EF07HI01', descricao: 'Explicar o significado de "modernidade" e suas lógicas de inclusão e exclusão, com base em uma concepção europeia.', componente: 'História', ano: 7 },
  { codigo: 'EF07HI02', descricao: 'Identificar conexões e interações entre as sociedades do Novo Mundo, da Europa, da África e da Ásia no contexto das navegações e indicar a complexidade e as interações que ocorrem nos Oceanos Atlântico, Índico e Pacífico.', componente: 'História', ano: 7 },
  { codigo: 'EF07HI03', descricao: 'Identificar aspectos e processos específicos das sociedades africanas e americanas antes da chegada dos europeus, com destaque para as formas de organização social e o desenvolvimento de saberes e técnicas.', componente: 'História', ano: 7 },

  // HISTÓRIA - 8º ANO
  { codigo: 'EF08HI01', descricao: 'Identificar os principais aspectos conceituais do iluminismo e do liberalismo e discutir a relação entre eles e a organização do mundo contemporâneo.', componente: 'História', ano: 8 },
  { codigo: 'EF08HI02', descricao: 'Identificar as particularidades político-sociais da Inglaterra do século XVII e analisar os desdobramentos posteriores à Revolução Gloriosa.', componente: 'História', ano: 8 },
  { codigo: 'EF08HI03', descricao: 'Analisar os impactos da Revolução Industrial na produção e circulação de povos, produtos e culturas.', componente: 'História', ano: 8 },

  // HISTÓRIA - 9º ANO
  { codigo: 'EF09HI01', descricao: 'Descrever e contextualizar os principais aspectos sociais, culturais, econômicos e políticos da emergência da República no Brasil.', componente: 'História', ano: 9 },
  { codigo: 'EF09HI02', descricao: 'Caracterizar e compreender os ciclos da história republicana, identificando particularidades da história local e regional até 1954.', componente: 'História', ano: 9 },
  { codigo: 'EF09HI03', descricao: 'Identificar os mecanismos de inserção do cidadão na vida política do país com base na análise de documentos e da legislação.', componente: 'História', ano: 9 },

  // GEOGRAFIA - 1º ANO
  { codigo: 'EF01GE01', descricao: 'Descrever características observadas de seus lugares de vivência e identificar semelhanças e diferenças entre esses lugares.', componente: 'Geografia', ano: 1 },
  { codigo: 'EF01GE02', descricao: 'Identificar semelhanças e diferenças entre jogos e brincadeiras de diferentes épocas e lugares.', componente: 'Geografia', ano: 1 },
  { codigo: 'EF01GE03', descricao: 'Identificar e relatar semelhanças e diferenças de usos do espaço público.', componente: 'Geografia', ano: 1 },
  { codigo: 'EF01GE04', descricao: 'Discutir e elaborar, coletivamente, regras de convívio em diferentes espaços.', componente: 'Geografia', ano: 1 },
  { codigo: 'EF01GE05', descricao: 'Observar e descrever ritmos naturais em diferentes escalas espaciais e temporais.', componente: 'Geografia', ano: 1 },
  { codigo: 'EF01GE06', descricao: 'Descrever e comparar diferentes tipos de moradia ou objetos de uso cotidiano, considerando técnicas e materiais utilizados em sua produção.', componente: 'Geografia', ano: 1 },
  { codigo: 'EF01GE07', descricao: 'Descrever atividades de trabalho relacionadas com o dia a dia da sua comunidade.', componente: 'Geografia', ano: 1 },

  // GEOGRAFIA - 2º ANO
  { codigo: 'EF02GE01', descricao: 'Descrever a história das migrações no bairro ou comunidade em que vive.', componente: 'Geografia', ano: 2 },
  { codigo: 'EF02GE02', descricao: 'Comparar costumes e tradições de diferentes populações inseridas no bairro ou comunidade em que vive, reconhecendo a importância do respeito às diferenças.', componente: 'Geografia', ano: 2 },
  { codigo: 'EF02GE03', descricao: 'Comparar diferentes meios de transporte e de comunicação, indicando o seu papel na conexão entre lugares.', componente: 'Geografia', ano: 2 },
  { codigo: 'EF02GE04', descricao: 'Reconhecer semelhanças e diferenças nos hábitos, nas relações com a natureza e no modo de viver de pessoas em diferentes lugares.', componente: 'Geografia', ano: 2 },

  // GEOGRAFIA - 3º ANO
  { codigo: 'EF03GE01', descricao: 'Identificar e comparar aspectos culturais dos grupos sociais de seus lugares de vivência, seja na cidade, seja no campo.', componente: 'Geografia', ano: 3 },
  { codigo: 'EF03GE02', descricao: 'Identificar, em seus lugares de vivência, marcas de contribuição cultural e econômica de grupos de diferentes origens.', componente: 'Geografia', ano: 3 },
  { codigo: 'EF03GE03', descricao: 'Reconhecer os diferentes modos de vida de povos e comunidades tradicionais em distintos lugares.', componente: 'Geografia', ano: 3 },
  { codigo: 'EF03GE04', descricao: 'Explicar como os processos naturais e históricos atuam na produção e na mudança das paisagens naturais e antrópicas nos seus lugares de vivência.', componente: 'Geografia', ano: 3 },

  // GEOGRAFIA - 4º ANO
  { codigo: 'EF04GE01', descricao: 'Selecionar, em seus lugares de vivência e em suas histórias familiares, elementos de distintas culturas, valorizando o que é próprio em cada uma delas.', componente: 'Geografia', ano: 4 },
  { codigo: 'EF04GE02', descricao: 'Descrever processos migratórios e suas contribuições para a formação da sociedade brasileira.', componente: 'Geografia', ano: 4 },
  { codigo: 'EF04GE03', descricao: 'Distinguir funções e papéis dos órgãos do poder público municipal e canais de participação social na gestão do Município.', componente: 'Geografia', ano: 4 },
  { codigo: 'EF04GE04', descricao: 'Reconhecer especificidades e analisar a interdependência do campo e da cidade, considerando fluxos econômicos, de informações, de ideias e de pessoas.', componente: 'Geografia', ano: 4 },

  // GEOGRAFIA - 5º ANO
  { codigo: 'EF05GE01', descricao: 'Descrever e analisar dinâmicas populacionais na Unidade da Federação em que vive, estabelecendo relações entre migrações e condições de infraestrutura.', componente: 'Geografia', ano: 5 },
  { codigo: 'EF05GE02', descricao: 'Identificar diferenças étnico-raciais e étnico-culturais e desigualdades sociais entre grupos em diferentes territórios.', componente: 'Geografia', ano: 5 },
  { codigo: 'EF05GE03', descricao: 'Identificar as formas de representação e pensamento espacial para analisar situações geográficas.', componente: 'Geografia', ano: 5 },
  { codigo: 'EF05GE04', descricao: 'Reconhecer as características da cidade e analisar as interações entre a cidade e o campo e entre cidades na rede urbana.', componente: 'Geografia', ano: 5 },

  // GEOGRAFIA - 6º ANO
  { codigo: 'EF06GE01', descricao: 'Comparar modificações das paisagens nos lugares de vivência e os usos desses lugares em diferentes tempos.', componente: 'Geografia', ano: 6 },
  { codigo: 'EF06GE02', descricao: 'Analisar modificações de paisagens por diferentes tipos de sociedade, com destaque para os povos originários.', componente: 'Geografia', ano: 6 },
  { codigo: 'EF06GE03', descricao: 'Descrever os movimentos do planeta e sua relação com a circulação geral da atmosfera, o tempo atmosférico e os padrões climáticos.', componente: 'Geografia', ano: 6 },
  { codigo: 'EF06GE04', descricao: 'Descrever o ciclo da água, comparando o escoamento superficial no ambiente urbano e rural, reconhecendo os principais componentes da morfologia das bacias e das redes hidrográficas.', componente: 'Geografia', ano: 6 },

  // GEOGRAFIA - 7º ANO
  { codigo: 'EF07GE01', descricao: 'Avaliar, por meio de exemplos extraídos dos meios de comunicação, ideias e estereótipos acerca das paisagens e da formação territorial do Brasil.', componente: 'Geografia', ano: 7 },
  { codigo: 'EF07GE02', descricao: 'Analisar a influência dos fluxos econômicos e populacionais na formação socioeconômica e territorial do Brasil, compreendendo os conflitos e as tensões históricas e contemporâneas.', componente: 'Geografia', ano: 7 },
  { codigo: 'EF07GE03', descricao: 'Selecionar argumentos que reconheçam as territorialidades dos povos indígenas originários, das comunidades remanescentes de quilombos, de povos das florestas e do cerrado, de ribeirinhos e caiçaras, entre outros grupos sociais do campo e da cidade.', componente: 'Geografia', ano: 7 },

  // GEOGRAFIA - 8º ANO
  { codigo: 'EF08GE01', descricao: 'Descrever as rotas de dispersão da população humana pelo planeta e os principais fluxos migratórios em diferentes períodos da história.', componente: 'Geografia', ano: 8 },
  { codigo: 'EF08GE02', descricao: 'Relacionar fatos e situações representativas da história das famílias do Município em que se localiza a escola, considerando a diversidade e os fluxos migratórios da população mundial.', componente: 'Geografia', ano: 8 },
  { codigo: 'EF08GE03', descricao: 'Analisar aspectos representativos da dinâmica demográfica, considerando características da população (perfil etário, crescimento vegetativo e mobilidade espacial).', componente: 'Geografia', ano: 8 },

  // GEOGRAFIA - 9º ANO
  { codigo: 'EF09GE01', descricao: 'Analisar criticamente de que forma a hegemonia europeia foi exercida em várias regiões do planeta, notadamente em situações de conflito, intervenções militares e/ou influência cultural em diferentes tempos e lugares.', componente: 'Geografia', ano: 9 },
  { codigo: 'EF09GE02', descricao: 'Analisar a atuação das corporações internacionais e das organizações econômicas mundiais na vida da população em relação ao consumo, à cultura e à mobilidade.', componente: 'Geografia', ano: 9 },
  { codigo: 'EF09GE03', descricao: 'Identificar diferentes manifestações culturais de minorias étnicas como forma de compreender a multiplicidade cultural na escala mundial.', componente: 'Geografia', ano: 9 },
]

export const getHabilidadesPorAnoEComponente = (ano: number, componente: string): HabilidadeBNCC[] => {
  return habilidadesBNCC.filter(h => h.ano === ano && h.componente === componente)
}

export const getComponentesPorAno = (ano: number): string[] => {
  const componentes = new Set(habilidadesBNCC.filter(h => h.ano === ano).map(h => h.componente))
  return Array.from(componentes).sort()
}
