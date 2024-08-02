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
            document.getElementById('logout-menu-item').style.display = 'block';
            document.getElementById('perfil-menu-item').style.display = 'block'; // Mostrar "Perfil" quando logado
            document.getElementById('admin-menu-item').style.display = 'block';
            database.ref(`users/${user.uid}`).once('value').then(snapshot => {
                const isAdmin = snapshot.val().admin || false;
                document.getElementById('admin-menu-item').style.display = isAdmin ? 'block' : 'none';
            });
        } else {
            // Usuário não autenticado
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

    let counter = 0; // Contador para adicionar anúncios

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

        // Incrementar contador
        counter++;

        // Inserir anúncio a cada 3 jogos
        if (counter % 3 === 0) {
            const adElement = document.createElement('div');
            adElement.classList.add('col-lg-4', 'col-md-6', 'mb-4'); // Mesmo tamanho dos cards de jogo
            adElement.innerHTML = `
                <div class="card ad-card bg-warning text-dark shadow-sm h-100">
                    <div class="card-body d-flex flex-column justify-content-center align-items-center">
                        <h5 class="card-title">Anúncio</h5>
                        <p class="card-text">Insira seu anúncio aqui!</p>
                        <a href="https://www.seuanuncio.com" target="_blank" class="btn btn-dark">Clique aqui</a>
                    </div>
                </div>
            `;
            gameList.appendChild(adElement);
        }
    }
}

// Filtrar jogos com base na entrada de pesquisa e filtros selecionados
function filterGames() {
    const searchTerm = document.getElementById('pesquisa-nome').value.toLowerCase();
    const selectedPlatforms = Array.from(document.querySelectorAll('.filtro-plataforma:checked')).map(el => el.value);
    const selectedGenres = Array.from(document.querySelectorAll('.filtro-genero:checked')).map(el => el.value);

    database.ref('jogos').once('value', snapshot => {
        const jogos = snapshot.val();
        const filteredGames = {};

        for (let id in jogos) {
            const jogo = jogos[id];

            // Filtrar por nome
            const nameMatches = jogo.nome.toLowerCase().includes(searchTerm);

            // Filtrar por plataforma
            const platformMatches = selectedPlatforms.length === 0 || jogo.plataformas.some(plataforma => selectedPlatforms.includes(plataforma));

            // Filtrar por gênero
            const genreMatches = selectedGenres.length === 0 || jogo.generos.some(genero => selectedGenres.includes(genero));

            if (nameMatches && platformMatches && genreMatches) {
                filteredGames[id] = jogo;
            }
        }

        calculateAndRenderGamesWithRatings(filteredGames); // Calcular classificações e renderizar jogos filtrados
    });
}

// Função de logout
function logout() {
    firebase.auth().signOut().then(() => {
        // Redirecionar para a página de login ou mostrar uma mensagem
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Erro ao sair: ', error);
    });
}
