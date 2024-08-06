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

// Variáveis globais para os filtros
let selectedPlatforms = [];
let selectedGenres = [];

// Variáveis de paginação
let currentPage = 1;
const gamesPerPage = 15;

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

    // Função para atualizar os filtros selecionados
    function updateFilters() {
        selectedPlatforms = Array.from(platformFilters)
            .filter(filter => filter.checked)
            .map(filter => filter.value);

        selectedGenres = Array.from(genreFilters)
            .filter(filter => filter.checked)
            .map(filter => filter.value);

        filterGames();
    }

    // Adicionar ouvintes de eventos para filtros
    searchInput.addEventListener('input', filterGames);
    platformFilters.forEach(filter => filter.addEventListener('change', updateFilters));
    genreFilters.forEach(filter => filter.addEventListener('change', updateFilters));

    // Buscar jogos do Firebase
    fetchGames();
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
    gameList.innerHTML = '';

    // Calcular o índice inicial e final com base na página atual
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;

    // Obter os jogos que devem ser exibidos na página atual
    const jogosArray = Object.entries(jogos);
    const jogosParaExibir = jogosArray.slice(startIndex, endIndex);

    jogosParaExibir.forEach(([id, jogo]) => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('col-lg-4', 'col-md-6', 'mb-4', 'game');
        gameElement.setAttribute('data-id', id);
        gameElement.setAttribute('data-plataforma', jogo.plataformas.join(','));
        gameElement.setAttribute('data-genero', jogo.generos.join(','));

        const gameLink = document.createElement('a');
        gameLink.href = `jogo.html?id=${id}`;
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

        const gameRating = document.createElement('p');
        gameRating.classList.add('card-text', 'mt-auto');
        gameRating.textContent = `Nota Média: ${jogo.averageRating || 'N/A'}`;

        cardBody.appendChild(gameName);
        cardBody.appendChild(gameRating);

        gameLink.appendChild(gameImage);
        gameLink.appendChild(cardBody);

        gameElement.appendChild(gameLink);
        gameList.appendChild(gameElement);
    });

    updatePaginationControls(jogosArray.length);
}

function updatePaginationControls(totalGames) {
    const totalPages = Math.ceil(totalGames / gamesPerPage);
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    // Botão de página anterior
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.onclick = () => changePage(currentPage - 1);
        paginationControls.appendChild(prevButton);
    }

    // Botões de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.disabled = true;
        } else {
            pageButton.onclick = () => changePage(i);
        }
        paginationControls.appendChild(pageButton);
    }

    // Botão de página seguinte
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próximo';
        nextButton.onclick = () => changePage(currentPage + 1);
        paginationControls.appendChild(nextButton);
    }
}

function changePage(page) {
    currentPage = page;
    fetchGames();
}

// Função para filtrar jogos com base no termo de pesquisa
function filterGames() {
    const searchInput = document.getElementById('pesquisa-nome');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const platformFilters = document.querySelectorAll('.filtro-plataforma');
    const genreFilters = document.querySelectorAll('.filtro-genero');

    document.querySelectorAll('.game').forEach(gameElement => {
        const gameName = gameElement.querySelector('.card-title').textContent.toLowerCase();
        const gamePlatforms = (gameElement.getAttribute('data-plataforma') || '').split(',');
        const gameGenres = (gameElement.getAttribute('data-genero') || '').split(',');

        const nameMatches = gameName.includes(searchTerm);
        const platformMatches = selectedPlatforms.length === 0 || selectedPlatforms.some(platform => gamePlatforms.includes(platform));
        const genreMatches = selectedGenres.length === 0 || selectedGenres.some(genre => gameGenres.includes(genre));

        if (nameMatches && platformMatches && genreMatches) {
            gameElement.style.display = 'block';
        } else {
            gameElement.style.display = 'none';
        }
    });

    // Recalcular a paginação após o filtro
    changePage(1);
}
