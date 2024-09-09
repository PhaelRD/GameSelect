# Index.html - Estrutura e Funcionamento

## 1. Serviços do Firebase
- **auth**: Usado para gerenciar autenticação de usuários.
- **database**: Usado para interagir com o banco de dados em tempo real, onde os jogos e dados dos usuários estão armazenados.

## 2. Variáveis Globais
- **games**: Armazena todos os jogos recuperados do Firebase.
- **filteredGames**: Armazena os jogos filtrados com base nos critérios definidos pelo usuário.
- **currentPage**: Gerencia a página atual da lista de jogos paginados.
- **gamesPerPage**: Define o número de jogos exibidos por página.
- **selectedPlatforms** e **selectedGenres**: Armazenam as plataformas e gêneros selecionados pelo usuário para filtragem.

## 3. Eventos de Carregamento da Página
- O código escuta o evento `DOMContentLoaded`, que é disparado quando o conteúdo HTML é totalmente carregado e analisado.
  - Dentro deste evento, o Firebase verifica o estado de autenticação do usuário usando `auth.onAuthStateChanged()`:
    - Se o usuário estiver autenticado, o menu de perfil e logout é exibido.
    - Se o usuário for um administrador (definido no banco de dados), o menu de administração é exibido.
  - Elementos de interface, como filtros de plataformas e gêneros, são associados a ouvintes de eventos para atualizarem os jogos filtrados quando o usuário interagir com eles.

## 4. Buscar Jogos do Banco de Dados
- A função `fetchGames()` recupera a lista de jogos armazenada no Firebase.
  - Após obter os dados, ela chama `calculateAndRenderGamesWithRatings()` para calcular as classificações médias dos jogos com base nas avaliações dos usuários.

## 5. Cálculo das Classificações dos Jogos
- A função `calculateAndRenderGamesWithRatings()` acessa os dados dos usuários e suas avaliações de jogos:
  - Para cada jogo, calcula a média das avaliações dos usuários que marcaram o status do jogo como "zerado".
  - O resultado é salvo na propriedade `averageRating` de cada jogo.

## 6. Filtragem de Jogos
- A função `filterGames()` filtra os jogos com base no termo de pesquisa, plataformas e gêneros selecionados:
  - Verifica se o nome do jogo contém o termo de pesquisa.
  - Confere se o jogo pertence às plataformas e gêneros selecionados.
  - Jogos que atendem a todos os critérios de filtragem são armazenados em `filteredGames`.
  - Após a filtragem, a função `renderGames()` é chamada para exibir os jogos filtrados.

## 7. Renderização dos Jogos
- A função `renderGames()` exibe os jogos filtrados na página:
  - Limpa a lista de jogos existente no elemento HTML.
  - Calcula a página atual e os jogos que devem ser exibidos com base na paginação.
  - Cria dinamicamente os elementos HTML necessários para exibir cada jogo, incluindo imagem, nome e classificação média.
  - A função `updatePaginationControls()` é usada para criar botões de navegação para as diferentes páginas.

## 8. Controles de Paginação
- `updatePaginationControls(totalGames)`: Esta função calcula o número total de páginas com base na quantidade de jogos filtrados e cria botões de navegação para que o usuário possa alternar entre as páginas.
- `changePage(page)`: Muda a página atual e re-renderiza os jogos dessa página.

# login.js - Configuração e Funcionalidade

## 1. Configuração do Firebase
- **firebaseConfig**: Contém as credenciais necessárias para conectar-se ao projeto Firebase.
  - `apiKey`: Chave da API do Firebase.
  - `authDomain`: Domínio de autenticação do Firebase.
  - `databaseURL`: URL do banco de dados em tempo real do Firebase.
  - `projectId`: ID do projeto Firebase.
  - `storageBucket`: Bucket de armazenamento do Firebase.
  - `messagingSenderId`: ID do remetente de mensagens do Firebase.
  - `appId`: ID do aplicativo Firebase.
  - `measurementId`: ID de medição do Firebase.

## 2. Inicialização do Firebase
- **firebase.initializeApp(firebaseConfig)**: Inicializa o Firebase com a configuração fornecida.

## 3. Referências de Elementos
- **auth**: Referência ao serviço de autenticação do Firebase.
- **loginForm**: Referência ao formulário de login.
- **spinnerOverlay**: Referência ao overlay de carregamento (spinner).
- **alertSuccess**: Referência ao elemento de alerta de sucesso.
- **alertError**: Referência ao elemento de alerta de erro.
- **errorMessage**: Referência ao elemento que exibe a mensagem de erro.

## 4. Funções Auxiliares
- **showAlert(alertElement)**: Exibe um alerta específico por 3 segundos.
- **showLoadingSpinner()**: Exibe o spinner de carregamento.
- **hideLoadingSpinner()**: Esconde o spinner de carregamento.

## 5. Manipulação do Formulário de Login
- Adiciona um ouvinte de evento ao formulário de login para lidar com o envio.
  - **event.preventDefault()**: Previne o comportamento padrão de envio do formulário.
  - **showLoadingSpinner()**: Exibe o spinner de carregamento.
  - **alertSuccess.classList.add('d-none')** e **alertError.classList.add('d-none')**: Oculta alertas anteriores.
  - **auth.signInWithEmailAndPassword(email, password)**: Faz login com o email e a senha fornecidos.
    - **.then((userCredential))**: Se o login for bem-sucedido, exibe um alerta de sucesso e redireciona para `index.html` após um atraso de 1.5 segundos.
    - **.catch((error))**: Se ocorrer um erro, exibe a mensagem de erro correspondente.
    - **.finally()**: Sempre oculta o spinner de carregamento após a tentativa de login.

## 6. Tratamento de Erros
- **auth/wrong-password**: Mensagem de erro "Senha incorreta."
- **auth/user-not-found**: Mensagem de erro "Email não registrado."
- **default**: Exibe a mensagem de erro padrão.

# register.js - Registro de Usuário

## 1. Configuração do Firebase
- **firebaseConfig**: Contém as credenciais necessárias para conectar-se ao projeto Firebase.
  - `apiKey`: Chave da API do Firebase.
  - `authDomain`: Domínio de autenticação do Firebase.
  - `databaseURL`: URL do banco de dados em tempo real do Firebase.
  - `projectId`: ID do projeto Firebase.
  - `storageBucket`: Bucket de armazenamento do Firebase.
  - `messagingSenderId`: ID do remetente de mensagens do Firebase.
  - `appId`: ID do aplicativo Firebase.
  - `measurementId`: ID de medição do Firebase.

## 2. Inicialização do Firebase
- **firebase.initializeApp(firebaseConfig)**: Inicializa o Firebase com a configuração fornecida.

## 3. Referências de Elementos
- **auth**: Referência ao serviço de autenticação do Firebase.
- **database**: Referência ao banco de dados em tempo real do Firebase.
- **registerForm**: Referência ao formulário de registro.
- **spinnerOverlay**: Referência ao overlay de carregamento (spinner).
- **alertSuccess**: Referência ao elemento de alerta de sucesso.
- **alertError**: Referência ao elemento de alerta de erro.
- **errorMessage**: Referência ao elemento que exibe a mensagem de erro.
- **usernameField**: Referência ao campo de nome de usuário.

## 4. Funções Auxiliares
- **showAlert(alertElement)**: Exibe um alerta específico por 3 segundos.
- **showLoadingSpinner()**: Exibe o spinner de carregamento.
- **hideLoadingSpinner()**: Esconde o spinner de carregamento.
- **checkUsernameExists(username)**: Verifica se o nome de usuário já existe no banco de dados.

## 5. Manipulação do Formulário de Registro
- Adiciona um ouvinte de evento ao formulário de registro para lidar com o envio.
  - **event.preventDefault()**: Previne o comportamento padrão de envio do formulário.
  - **showLoadingSpinner()**: Exibe o spinner de carregamento.
  - **alertSuccess.classList.add('d-none')** e **alertError.classList.add('d-none')**: Oculta alertas anteriores.
  - **checkUsernameExists(username)**: Verifica se o nome de usuário já existe no banco de dados.
    - Se o nome de usuário já existir, exibe uma mensagem de erro e oculta o spinner de carregamento.
    - Se o nome de usuário não existir, **auth.createUserWithEmailAndPassword(email, password)** é chamado para criar um novo usuário com o email e a senha fornecidos.
      - **.then((userCredential))**: Se o registro for bem-sucedido, salva as informações adicionais do usuário no banco de dados, exibe um alerta de sucesso e redireciona para `login.html` após um atraso de 1.5 segundos.
      - **.catch((error))**: Se ocorrer um erro, exibe a mensagem de erro correspondente.
      - **.finally()**: Sempre oculta o spinner de carregamento após a tentativa de registro.

## 6. Tratamento de Erros
- **auth/email-already-in-use**: Mensagem de erro "Este e-mail já está em uso."
- **auth/invalid-email**: Mensagem de erro "E-mail inválido."
- **auth/weak-password**: Mensagem de erro "Senha fraca. A senha deve ter pelo menos 6 caracteres."
- **default**: Exibe a mensagem de erro padrão.

# admin.js - Administração de Jogos

## 1. Configuração do Firebase
- **firebaseConfig**: Contém as credenciais necessárias para conectar-se ao projeto Firebase.
  - `apiKey`: Chave da API do Firebase.
  - `authDomain`: Domínio de autenticação do Firebase.
  - `databaseURL`: URL do banco de dados em tempo real do Firebase.
  - `projectId`: ID do projeto Firebase.
  - `storageBucket`: Bucket de armazenamento do Firebase.
  - `messagingSenderId`: ID do remetente de mensagens do Firebase.
  - `appId`: ID do aplicativo Firebase.
  - `measurementId`: ID de medição do Firebase.

## 2. Inicialização do Firebase
- **firebase.initializeApp(firebaseConfig)**: Inicializa o Firebase com a configuração fornecida.

## 3. Referências de Serviços
- **auth**: Referência ao serviço de autenticação do Firebase.
- **database**: Referência ao banco de dados em tempo real do Firebase.

## 4. Verificação de Autenticação
- **auth.onAuthStateChanged(function(user))**: Verifica se o usuário está autenticado. Se não estiver, redireciona para `login.html`.

## 5. Carregamento de Jogos
- **loadGames()**: Carrega e exibe a lista de jogos existentes na tabela.
  - Obtém os dados dos jogos do banco de dados.
  - Cria uma linha para cada jogo com opções para editar ou excluir.

## 6. Adição de Campos de Link
- **addLinkButton.addEventListener('click', function() {...})**: Adiciona novos campos de link ao formulário.
  - Cria um novo grupo de campos de link com um botão para remover o grupo.

## 7. Manipulação do Formulário de Jogo
- **form.addEventListener('submit', function(event) {...})**: Lida com o envio do formulário de registro/edição de jogos.
  - **event.preventDefault()**: Previne o comportamento padrão de envio do formulário.
  - Obtém os valores do formulário, incluindo nome, imagem, descrição, vídeo, plataformas, gêneros e links.
  - Gera um ID único para o jogo e prepara os dados do jogo.
  - Salva os dados do jogo no banco de dados e recarrega a lista de jogos.

## 8. Função de Edição de Jogo
- **window.editGame = function(gameId) {...}**: Preenche o formulário com os dados do jogo selecionado para edição.
  - Obtém os dados do jogo do banco de dados.
  - Preenche os campos do formulário e marca as plataformas e gêneros correspondentes.
  - Popula os campos de link com os dados existentes.

## 9. Função de Exclusão de Jogo
- **window.deleteGame = function(gameId) {...}**: Exclui o jogo selecionado após confirmação do usuário.
  - Remove o jogo do banco de dados e recarrega a lista de jogos.

## 10. Inicialização
- **loadGames()**: Carrega a lista de jogos quando a página é carregada.

# jogo.js

## Configuração do Firebase

O código inicia configurando e inicializando o Firebase com as credenciais fornecidas.

**Parâmetros de Configuração:**
- `apiKey`: Chave de API do Firebase.
- `authDomain`: Domínio de autenticação do Firebase.
- `databaseURL`: URL do banco de dados em tempo real do Firebase.
- `projectId`: ID do projeto Firebase.
- `storageBucket`: Bucket de armazenamento do Firebase.
- `messagingSenderId`: ID do remetente de mensagens do Firebase.
- `appId`: ID do aplicativo Firebase.
- `measurementId`: ID de medição do Firebase.

## Referências dos Serviços Firebase

- **`auth`**: Referência para o serviço de autenticação do Firebase.
- **`database`**: Referência para o banco de dados em tempo real do Firebase.

## Funções

### `renderGameDetails(jogo)`

Renderiza os detalhes de um jogo na página, incluindo:
- Título
- Imagem
- Vídeo
- Descrição
- Gêneros
- Plataformas
- Links

A função utiliza elementos HTML dinâmicos e classes do Bootstrap para criar e estilizar o conteúdo.

### `setupCategoryButtons(gameId)`

Configura os botões de categoria (`desejados`, `jogando`, `zerado`) com ouvintes de eventos. As ações variam dependendo do estado de autenticação do usuário:
- **Usuário autenticado:** Adiciona jogos às categorias e permite enviar notas e resenhas.
- **Usuário não autenticado:** Exibe uma mensagem de aviso para autenticação.

### `setCategory(userId, gameId, category, nota = null, resenha = null)`

Define a categoria de um jogo no perfil do usuário, com suporte para notas e resenhas, e registra a data e hora atuais. Atualiza a categoria no banco de dados Firebase.

### `calculateAndDisplayAverageRating(gameId)`

Calcula e exibe a média das notas de um jogo, considerando apenas os jogos marcados como 'zerado'. Atualiza a exibição da média de notas na página.

### `displayAverageRating(averageRating)`

Exibe a média de notas calculada na página, formatada como `X/10`.

### `updateGameRatings(gameId)`

Atualiza as avaliações do jogo chamando a função `calculateAndDisplayAverageRating`.

### `logout()`

Desconecta o usuário e redireciona para a página inicial. Exibe um erro caso a operação falhe.

### `showModal(title, message)`

Exibe um modal com um título e mensagem fornecidos, utilizando o componente modal do Bootstrap.

## Evento de Carregamento da Página

- Ao carregar a página, obtém o ID do jogo da URL.
- Busca os detalhes do jogo no Firebase usando o ID.
- Renderiza os detalhes do jogo e configura os botões de categoria.
- Calcula e exibe a média de avaliações do jogo

# perfil.js

## Configuração do Firebase

O código inicia configurando e inicializando o Firebase com as credenciais fornecidas. Os parâmetros de configuração incluem a chave da API, domínio de autenticação, URL do banco de dados, ID do projeto, bucket de armazenamento, ID do remetente de mensagens, ID do aplicativo e ID de medição.

## Referências dos Serviços Firebase

- **`auth`**: Referência para o serviço de autenticação do Firebase.
- **`database`**: Referência para o banco de dados em tempo real do Firebase.

## Funções

### `renderGameDetails(jogo)`

Renderiza os detalhes de um jogo na página, incluindo título, imagem, vídeo, descrição, gêneros, plataformas e links. Utiliza elementos HTML dinâmicos e classes do Bootstrap para criar e estilizar o conteúdo.

### `setupCategoryButtons(gameId)`

Configura os botões de categoria (`desejados`, `jogando`, `zerado`) com ouvintes de eventos. As ações dependem do estado de autenticação do usuário:
- **Usuário autenticado:** Permite adicionar jogos às categorias e enviar notas e resenhas.
- **Usuário não autenticado:** Exibe uma mensagem de aviso para autenticação.

### `setCategory(userId, gameId, category, nota = null, resenha = null)`

Define a categoria de um jogo no perfil do usuário, com suporte para notas e resenhas. Registra a data e hora atuais e atualiza a categoria no banco de dados Firebase.

### `calculateAndDisplayAverageRating(gameId)`

Calcula e exibe a média das notas de um jogo, considerando apenas os jogos marcados como 'zerado'. Atualiza a exibição da média de notas na página.

### `displayAverageRating(averageRating)`

Exibe a média de notas calculada na página, formatada como `X/10`.

### `updateGameRatings(gameId)`

Atualiza as avaliações do jogo chamando a função `calculateAndDisplayAverageRating`.

### `logout()`

Desconecta o usuário e redireciona para a página inicial. Exibe um erro caso a operação falhe.

### `showModal(title, message)`

Exibe um modal com um título e mensagem fornecidos, utilizando o componente modal do Bootstrap.

## Evento de Carregamento da Página

- Ao carregar a página, obtém o ID do jogo da URL.
- Busca os detalhes do jogo no Firebase usando o ID.
- Renderiza os detalhes do jogo e configura os botões de categoria.
- Calcula e exibe a média de avaliações do jogo.

# resenha.js

## 1. Inicialização do Firebase
O código começa inicializando o Firebase com as configurações específicas do projeto, permitindo a integração com os serviços de autenticação, banco de dados em tempo real e armazenamento de arquivos.

## 2. Autenticação do Usuário
- **Função `checkAuthState`**: Monitora o estado de autenticação do usuário. Se o usuário estiver logado, o item de menu "Logout" é exibido e as resenhas são buscadas. Caso contrário, o usuário é redirecionado para a página de login.
- **Função `logout`**: Realiza o logout do usuário e redireciona-o para a página de login.

## 3. Busca de Dados
- **Função `fetchGameDetails`**: Obtém os detalhes de um jogo específico a partir do banco de dados em tempo real do Firebase.
- **Função `fetchReviews`**: Busca as últimas 50 resenhas dos jogos que os usuários marcaram como "zerados" na última semana. As resenhas são categorizadas em três arrays: todas as resenhas, as cinco resenhas mais curtidas e as resenhas de amigos do usuário.

## 4. Renderização de Resenhas
- **Funções `renderTopReviews`, `renderReviews` e `renderFriendsReviews`**: Responsáveis por exibir as resenhas no frontend. Cada função cria elementos HTML para exibir as resenhas em formato de cartão, mostrando o jogo, nota, resenha e o botão "Curtir". 
  - A função `renderTopReviews` exibe as cinco resenhas mais curtidas.
  - A função `renderReviews` exibe as últimas 50 resenhas gerais.
  - A função `renderFriendsReviews` exibe as resenhas de amigos do usuário.

## 5. Interatividade
O código adiciona eventos de clique aos botões "Curtir" para permitir que os usuários interajam com as resenhas. A função `likeReview` atualiza o número de curtidas de uma resenha específica no banco de dados e recarrega a lista de resenhas atualizadas.

## 6. Tratamento de Erros
A função `showModal` exibe uma janela modal de erro quando ocorre algum problema, como falha ao buscar resenhas ou dados dos usuários.

## 7. Eventos do DOM
- O evento `DOMContentLoaded` inicializa a aplicação ao verificar o estado de autenticação do usuário.
- Um evento de clique é adicionado ao item de menu "Logout" para permitir que o usuário se desconecte da aplicação.

