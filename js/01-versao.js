'use strict';
const VERSION='0.8.0';
const CHANGELOG=[{v:'0.8.0',d:'09/11/2026',h:'06:22',t:[
 'Projeto editável: novo botão Salvar projeto guarda tudo em um arquivo .picsey (camadas, textos, formas, pinturas, imagens inseridas e as fontes do aparelho usadas). Em Abrir projeto você escolhe o arquivo e continua de onde parou, em qualquer aparelho.',
 'Os botões ficam em Exportar, no Histórico (botão com a seta para baixo) e na tela inicial (Abrir projeto salvo).',
 'Abrir um projeto vira um passo do histórico, então dá para desfazer e voltar ao que estava antes.']},{v:'0.7.0',d:'09/11/2026',h:'06:09',t:[
 'A arte não encolhe mais quando você seleciona um objeto: aparece só uma barra curta de ações flutuando sobre a arte (Opções, Trancar, Espelhar, Virar, Girar 90°, Duplicar, Excluir, e Meia-lua e Rasterizar para texto). Tocando em Opções abre o painel completo, também flutuando por cima, sem mexer no tamanho da imagem. Só o pincel e o recorte ainda reduzem a arte, porque precisam dos controles na tela.',
 'Efeitos e ajustes de imagem agora só atingem imagens e pinturas. Texto e formas ficam intactos, a menos que o texto seja rasterizado.',
 'Trancar camada: uma camada trancada não move, não gira e não redimensiona, e o toque passa direto para o que estiver embaixo. Tranque pela barra de ações ou pela lista de Camadas, e destranque do mesmo jeito.',
 'Novas formas Linha e Seta, e estilo da linha (contínua, tracejada ou pontilhada) para qualquer forma.',
 'Redimensionar arrastando a aresta: em formas e imagens, arraste uma borda para esticar só naquele lado, ou um canto para esticar nos dois sentidos. As bolinhas nas arestas mostram onde pegar.',
 'Camadas virou um popup aberto por um botão no topo da arte, no lugar da aba de baixo, e agora cada camada tem o botão de trancar.']},{v:'0.6.1',d:'08/11/2026',h:'20:20',t:[
 'Ícone do app trocado pelo novo, só o balão com o nome PicSey. Os cantos brancos da imagem foram preenchidos com o fundo escuro, então o ícone fica sem bordas brancas.']},{v:'0.6.0',d:'08/11/2026',h:'20:00',t:[
 'O app agora se chama PicSey.',
 'A tela inicial usa a nova imagem do PicSey (balão com o robô e a maçã) no lugar da logo antiga.',
 'O ícone do app também foi trocado pela nova logo.',
 'O histórico de mudanças passa a mostrar a hora de cada versão.']},{v:'0.5.1',d:'08/11/2026',h:'19:02',t:[
 'Corrigido: no app instalado na Tela de Início, a tela às vezes dava zoom e a parte de cima (botões de início, histórico e desfazer) sumia. Agora a página fica travada no tamanho da tela, o zoom por gesto e por campo de texto foi bloqueado e a área da barra de status é respeitada.',
 'Animações de entrada e saída nos menus: as listas (Ajustar, Efeito, Adesivo), a tela de Camadas, o painel de opções, a barra do efeito, as janelas e a tela inicial agora deslizam e esmaecem em vez de aparecer de repente.']},{v:'0.5.0',d:'08/11/2026',h:'18:42',t:[
 'Navegação refeita: novo botão Início (casinha) no canto da arte volta para a tela inicial, e o projeto continua salvo.',
 'Ao concluir ou cancelar um filtro, ajuste, recorte ou o pincel, você volta para a lista de onde saiu (Ajustar ou Efeito), no mesmo ponto da rolagem.',
 'Camadas agora abre em tela própria, com miniaturas, e não cobre mais as opções do objeto que você está editando.',
 'Ao tocar uma vez em um texto aparece uma faixa de ações: Meia-lua, Rasterizar, Espelhar, Virar e Girar 90°. Espelhar, Virar e Girar 90° também valem para formas, imagens e pinturas.',
 'Texto em meia-lua: o controle Curvatura entorta o texto em arco para cima ou para baixo, até a meia-lua completa.',
 'Rasterizar transforma o texto em imagem, e a partir daí ele aceita efeitos, ajustes e a borracha.',
 'Espaçamentos revisados no painel de opções, nas listas e nas janelas.',
 'Balão da tela inicial mais estreito, com o nome em duas linhas.']},{v:'0.4.1',d:'08/11/2026',t:[
 'Corrigido: em alguns momentos o objeto parava de mover e só girava. Um toque antigo ficava registrado e o arrastar virava um gesto de dois dedos. Agora cada novo toque começa limpo.',
 'As alças do objeto (excluir, girar e redimensionar) ficam para fora do contorno, então objetos pequenos continuam fáceis de arrastar.',
 'O ímã de alinhamento ficou um pouco mais fácil de acertar e vale para texto, formas, imagens e pinturas.',
 'A borracha agora abre pronta para apagar quando você escolhe Apagar com a borracha em uma imagem, e Efeito, Pintar mantém a imagem selecionada.']},{v:'0.4.0',d:'08/11/2026',t:[
 'Alinhamento com ímã leve: ao mover um objeto, ele gruda no meio da arte na horizontal e na vertical e mostra uma linha guia.',
 'Layout principal refeito como o original: arte sobre fundo cinza e barra embaixo com Ajustar, Efeito, Adesivo, Camadas e Exportar.',
 'Efeito e Ajustar agora são listas separadas, como no PicSay. Ajustar tem recortar, redimensionar, girar, espelhar, brilho, contraste, saturação, exposição, nitidez, desfoque e granulação.',
 'Efeito tem Pintar, Inserir imagem, Cor em destaque, distorções (esferizar, redemoinho, inchar e comprimir, respingo circular, esticar e espelho), ajustes de cor e efeitos artísticos (estampa de quadrinhos, posterizar, Pop Art, sépia, negativo, pixelar, vinheta).',
 'Adesivo reúne texto, balões e formas. Ao tocar em um objeto, as opções dele aparecem em um painel embaixo.',
 'Botão de histórico no canto da arte, com a lista de passos, desfazer e refazer.',
 'Exportar agora abre uma tela com formato, qualidade e tamanho.']},{v:'0.3.0',d:'08/11/2026',t:[
 'Visual novo no estilo do PicSay: fundo escuro e chapado, barras cinzas, botões quadrados e confirmar em verde.',
 'Tela inicial com o botão Escolher uma foto, tela em branco e continuar o último projeto.',
 'Nova lista Adicionar efeito, com miniaturas feitas a partir da sua própria imagem e títulos de seção.',
 'Cada efeito abre uma tela com o valor no topo, controle deslizante embaixo com botões menos e mais, cancelar e confirmar.',
 'Efeitos novos: matiz, colorizar, escala de cinza, preto e branco, duotone, arco-íris, mesclar com cor, posterizar, pixelar e vinheta. Os ajustes antigos viraram itens da lista.',
 'Efeitos podem valer só para a imagem selecionada ou para a arte inteira.']},{v:'0.2.0',d:'08/11/2026',t:[
 'Nova aba Pincel, com pincel, borracha e restaurar.',
 'O pincel pinta em camadas de pintura próprias. Tamanho, dureza (macio ou duro), opacidade e cor ajustáveis, com conta-gotas.',
 'A borracha apaga partes de uma imagem ou de uma pintura sem estragar o original. O botão Restaurar traz de volta o que foi apagado.',
 'Cada traço entra no desfazer e no refazer. As camadas de pintura podem ser movidas, giradas e redimensionadas como as outras.',
 'Dois dedos fazem zoom e movem a tela enquanto a aba Pincel está aberta.']},{v:'0.1.0',d:'08/11/2026',t:[
 'Primeira versão do editor.',
 'Camadas de foto, imagens PNG, textos e formas, com ordem ajustável. Dá para colocar uma imagem abaixo de outra.',
 'Textos com as fontes do PicSay e com fontes carregadas do aparelho, contorno, sombra e alinhamento.',
 'Formas só com contorno ou preenchidas: retângulo, círculo, triângulo, estrela, coração e balões de fala, pensamento e grito.',
 'Ajustes de brilho, contraste, saturação, exposição, granulação, nitidez, desfoque e filtros P&B, sépia e negativo.',
 'Redimensionar, recortar com proporções e tamanhos prontos para Instagram e Facebook.',
 'Desfazer e refazer, salvamento automático no aparelho e exportação em PNG ou JPG.']}];
