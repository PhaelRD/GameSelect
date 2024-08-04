// Inicializa o Firebase
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

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();

// Função para verificar se o usuário está logado
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário está logado
            document.getElementById('logout-menu-item').style.display = 'block';
        } else {
            // Usuário não está logado
            document.getElementById('logout-menu-item').style.display = 'none';
        }
    });
}

// Função para realizar o logout
function logout() {
    auth.signOut().then(() => {
        // Redirecionar para a página de login após logout
        window.location.href = 'login.html';
    }).catch(error => {
        console.error('Erro ao fazer logout:', error);
    });
}

// Função para buscar detalhes dos jogos
function fetchGameDetails(gameId) {
    return database.ref('jogos/' + gameId).once('value').then(snapshot => {
        return snapshot.val();
    });
}

// Função para buscar e exibir as 50 últimas resenhas
function fetchReviews() {
    const reviewsRef = database.ref('usuarios');
    let reviewsArray = [];
    let topReviewsArray = [];

    reviewsRef.once('value').then(snapshot => {
        let promises = [];

        snapshot.forEach(userSnapshot => {
            const userId = userSnapshot.key;
            const userData = userSnapshot.val();
            const username = userData.username || 'Usuário Desconhecido'; // Nome do usuário ou um valor padrão
            const userCategories = userData.categorias || {};

            Object.keys(userCategories).forEach(gameId => {
                const game = userCategories[gameId];
                if (game.status === 'zerado') {
                    promises.push(
                        fetchGameDetails(gameId).then(gameDetails => {
                            const review = {
                                userId,
                                username,
                                gameId,
                                gameName: gameDetails.nome, // Adiciona o nome do jogo
                                gameImage: gameDetails.imagem, // Adiciona a imagem do jogo
                                ...game
                            };
                            reviewsArray.push(review);
                            topReviewsArray.push(review); // Adiciona ao array para as mais curtidas
                        })
                    );
                }
            });
        });

        // Aguarda todas as promessas de detalhes do jogo serem resolvidas
        Promise.all(promises).then(() => {
            // Ordena por número de likes em ordem decrescente e limita a 5
            topReviewsArray.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            topReviewsArray = topReviewsArray.slice(0, 5);

            // Ordena por timestamp e limita a 50
            reviewsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            reviewsArray = reviewsArray.slice(0, 50);

            renderTopReviews(topReviewsArray);
            renderReviews(reviewsArray);
        });
    }).catch(error => {
        console.error('Erro ao buscar resenhas:', error);
        showModal('Erro', 'Erro ao carregar resenhas. Tente novamente.');
    });
}

// Função para renderizar as 5 resenhas mais curtidas
function renderTopReviews(reviews) {
    const sidebarDiv = document.getElementById('top-reviews');
    sidebarDiv.innerHTML = ''; // Limpa o conteúdo anterior

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('mb-3');
        
        reviewCard.innerHTML = `
            <div class="card shadow-sm">
                <img src="${review.gameImage}" class="card-img-top" alt="${review.gameName}">
                <div class="card-body">
                    <h5 class="card-title">${review.gameName}</h5>
                    <p class="card-text"><strong>Usuário:</strong> ${review.username}</p>
                    <p class="card-text"><strong>Nota:</strong> ${review.nota}/10</p>
                    <p class="card-text"><strong>Resenha:</strong> ${review.resenha}</p>
                    <p class="card-text"><strong>Likes:</strong> ${review.likes || 0}</p>
                    <button class="btn btn-primary" id="like-btn-${review.userId}-${review.gameId}">
                        Curtir
                    </button>
                </div>
            </div>
        `;
        
        sidebarDiv.appendChild(reviewCard);

        // Adiciona o evento de clique para o botão de curtir
        document.getElementById(`like-btn-${review.userId}-${review.gameId}`).addEventListener('click', () => {
            likeReview(review.userId, review.gameId);
        });
    });
}

// Função para renderizar as resenhas no feed principal
function renderReviews(reviews) {
    const feedDiv = document.getElementById('feed-resenhas');
    feedDiv.innerHTML = ''; // Limpa o conteúdo anterior

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('col-md-6', 'mb-4');
        
        reviewCard.innerHTML = `
            <div class="card shadow-sm">
                <img src="${review.gameImage}" class="card-img-top" alt="${review.gameName}">
                <div class="card-body">
                    <h5 class="card-title">${review.username}</h5> <!-- Exibe o nome do usuário -->
                    <p class="card-text"><strong>Jogo:</strong> ${review.gameName}</p> <!-- Exibe o nome do jogo -->
                    <p class="card-text"><strong>Nota:</strong> ${review.nota}/10</p>
                    <p class="card-text"><strong>Resenha:</strong> ${review.resenha}</p>
                    <button class="btn btn-primary" id="like-btn-${review.userId}-${review.gameId}">
                        Curtir (${review.likes || 0})
                    </button>
                </div>
            </div>
        `;
        
        feedDiv.appendChild(reviewCard);

        // Adiciona o evento de clique para o botão de curtir
        document.getElementById(`like-btn-${review.userId}-${review.gameId}`).addEventListener('click', () => {
            likeReview(review.userId, review.gameId);
        });
    });
}

// Função para curtir uma resenha
function likeReview(userId, gameId) {
    const userGameRef = database.ref(`usuarios/${userId}/categorias/${gameId}`);

    userGameRef.transaction(game => {
        if (game) {
            if (game.likes) {
                game.likes++;
            } else {
                game.likes = 1;
            }
        }
        return game;
    }).then(() => {
        fetchReviews(); // Atualiza a lista após dar like
    }).catch(error => {
        console.error('Erro ao curtir resenha:', error);
        showModal('Erro', 'Erro ao curtir resenha. Tente novamente.');
    });
}

// Mostrar modal com mensagem
function showModal(title, message) {
    const modalTitle = document.getElementById('alertModalLabel');
    const modalBody = document.querySelector('#alertModal .modal-body');

    modalTitle.textContent = title;
    modalBody.textContent = message;

    $('#alertModal').modal('show');
}

// Carregar resenhas e verificar estado de autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    fetchReviews();
});
