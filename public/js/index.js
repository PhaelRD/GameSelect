// Configuração do Firebase
var firebaseConfig = {
    apiKey: "AIzaSyC0rjXmQpkSk7BSUtWwDnnIaFsyDPtIz8o",
    authDomain: "emulando-6fa4e.firebaseapp.com",
    databaseURL: "https://emulando-6fa4e-default-rtdb.firebaseio.com",
    projectId: "emulando-6fa4e",
    storageBucket: "emulando-6fa4e.appspot.com",
    messagingSenderId: "285091625419",
    appId: "1:285091625419:web:43d5d37d36cb100b3d1e4e",
    measurementId: "G-7LS6SXRR34"
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);

// Referência aos serviços do Firebase
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    // Verifique a autenticação e ajuste a interface
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Usuário autenticado
            console.log("Usuário autenticado:", user.uid); // Log para verificar o UID do usuário
            document.getElementById('logout-menu-item').style.display = 'block';
            document.getElementById('perfil-menu-item').style.display = 'block'; // Mostrar "Perfil" quando logado
            
            // Verifique os dados do usuário no banco de dados
            database.ref(`usuarios/${user.uid}`).once('value').then(snapshot => {
                const userData = snapshot.val();
                if (!userData) {
                    console.error("Dados do usuário não encontrados para UID:", user.uid);
                    return;
                }
                
                console.log("Dados do usuário:", userData); // Log para verificar os dados do usuário
                
                const isAdmin = userData.admin === true; // Verificar se admin é true
                console.log("Usuário é admin:", isAdmin); // Log para verificar o status de admin
                
                // Mostrar ou ocultar "Admin" conforme necessário
                document.getElementById('admin-menu-item').style.display = isAdmin ? 'block' : 'none';
            }).catch(error => {
                console.error("Erro ao verificar o status de administrador:", error);
                document.getElementById('admin-menu-item').style.display = 'none';
            });
        } else {
            // Usuário não autenticado
            console.log("Nenhum usuário autenticado.");
            document.getElementById('logout-menu-item').style.display = 'none';
            document.getElementById('perfil-menu-item').style.display = 'none'; // Ocultar "Perfil" quando não logado
            document.getElementById('admin-menu-item').style.display = 'none';
        }
    });

    // Referências para os elementos de filtro
    const searchInput = document.getElementById('pesquisa-nome');
    const platformFilters = document.querySelectorAll('.filtro-plataforma');
    const genreFilters = document.querySelectorAll('.filtro-genero');

    // Buscar jogos do Firebase
    fetchGames();

    // Adicionar ouvintes de eventos para filtros
    searchInput.addEventListener('input', filterGames);
    platformFilters.forEach(filter => filter.addEventListener('change', filterGames));
    genreFilters.forEach(filter => filter.addEventListener('change', filterGames));
});

// Buscar jogos do banco de dados e renderizá-los
function fetchGames() {
    database.ref('jogos').on('value', snapshot => {
        const jogos = snapshot.val();
        calculateAndRenderGamesWithRatings(jogos);
    });
}

// Calcular classificações médias e renderizar jogos
function calculateAndRenderGamesWithRatings(jogos) {
    const ratingsRef = database.ref('usuarios');
    ratingsRef.once('value').then(snapshot => {
        const users = snapshot.val() || {};
        const gameRatings = {};

        // Calcular classificações médias para cada jogo
        for (let userId in users) {
            const categorias = users[userId].categorias || {};
            for (let gameId in categorias) {
                if (categorias[gameId].status === 'zerado') {
                    if (!gameRatings[gameId]) {
                        gameRatings[gameId] = { sum: 0, count: 0 };
                    }
                    gameRatings[gameId].sum += categorias[gameId].nota;
                    gameRatings[gameId].count += 1;
                }
            }
        }

        // Calcular classificações médias e atualizar jogos
        for (let gameId in gameRatings) {
            const { sum, count } = gameRatings[gameId];
            const averageRating = count > 0 ? (sum / count).toFixed(1) : 'N/A';

            if (jogos[gameId]) { // Verifique se o jogo existe nos dados de jogos
                jogos[gameId].averageRating = `${averageRating}/10`;
            }
        }

        renderGames(jogos);
    }).catch(error => {
        console.error('Erro ao calcular classificações de jogos:', error);
    });
}

// Renderizar jogos com base nos dados do Firebase
function renderGames(jogos) {
    const gameList = document.getElementById('jogos-lista');
    gameList.innerHTML = ''; // Limpar jogos anteriores

    for (let id in jogos) {
        const jogo = jogos[id];

        // Verifique se o objeto de jogo está definido
        if (!jogo) {
            continue;
        }

        // Criar elementos HTML para o jogo
        const gameElement = document.createElement('div');
        gameElement.classList.add('col-lg-4', 'col-md-6', 'mb-4', 'game');
        gameElement.setAttribute('data-id', id); // Anexar ID do jogo como um atributo de dados

        const gameLink = document.createElement('a');
        gameLink.href = `jogo.html?id=${id}`; // Link para a página de detalhes do jogo com ID do jogo
        gameLink.classList.add('game-link', 'card', 'shadow-sm', 'h-100');

        const gameImage = document.createElement('img');
        gameImage.src = jogo.imagem;
        gameImage.alt = jogo.nome;
        gameImage.classList.add('card-img-top');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'd-flex', 'flex-column');

        const gameName = document.createElement('h3');
        gameName.classList.add('card-title', 'mt-2');
        gameName.textContent = jogo.nome;

        // Criar e adicionar a classificação média
        const gameRating = document.createElement('p');
        gameRating.classList.add('card-text', 'mt-auto');
        gameRating.textContent = `Nota Média: ${jogo.averageRating || 'N/A'}`;

        // Anexar elementos ao corpo do card
        cardBody.appendChild(gameName); // Nome primeiro
        cardBody.appendChild(gameRating); // Nota por último

        // Anexar imagem e corpo ao link do jogo
        gameLink.appendChild(gameImage); // Imagem primeiro
        gameLink.appendChild(cardBody); // Corpo depois

        // Anexar link do jogo ao elemento de jogo
        gameElement.appendChild(gameLink);

        // Anexar elemento de jogo à lista de jogos
        gameList.appendChild(gameElement);
    }
}

// Função para filtrar jogos com base no termo de pesquisa
function filterGames() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedPlatforms = Array.from(platformFilters).filter(el => el.checked).map(el => el.value);
    const selectedGenres = Array.from(genreFilters).filter(el => el.checked).map(el => el.value);

    // Ocultar ou mostrar jogos com base nos critérios de filtro
    document.querySelectorAll('.game').forEach(gameElement => {
        const gameName = gameElement.querySelector('.card-title').textContent.toLowerCase();
        const gamePlatforms = (gameElement.getAttribute('data-plataforma') || '').split(','); // Use data-plataforma para plataformas
        const gameGenres = (gameElement.getAttribute('data-genero') || '').split(','); // Use data-genero para gêneros

        // Verifique se o jogo corresponde aos critérios de filtro
        const nameMatches = gameName.includes(searchTerm);
        const platformMatches = selectedPlatforms.length === 0 || selectedPlatforms.some(platform => gamePlatforms.includes(platform));
        const genreMatches = selectedGenres.length === 0 || selectedGenres.some(genre => gameGenres.includes(genre));

        // Mostre ou oculte o jogo com base na correspondência
        if (nameMatches && platformMatches && genreMatches) {
            gameElement.style.display = 'block';
        } else {
            gameElement.style.display = 'none';
        }
    });
}

// Função de logout
function logout() {
    auth.signOut().then(() => {
        // Redirecionar para a página de login ou mostrar uma mensagem
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Erro ao sair:', error);
    });
}

// Função para criar um novo usuário
function createNewUser(userId, email, username) {
    database.ref('usuarios/' + userId).set({
        email: email,
        username: username,
        admin: true // Definindo admin como booleano
    }).then(() => {
        console.log('Novo usuário criado com sucesso.');
    }).catch(error => {
        console.error('Erro ao criar novo usuário:', error);
    });
}
