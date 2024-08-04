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

// Função para verificar se o usuário está logado
function checkAuthState() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('logout-menu-item').style.display = 'block';
            fetchReviews(); // Buscar resenhas após verificar o estado de autenticação
        } else {
            document.getElementById('logout-menu-item').style.display = 'none';
            window.location.href = 'login.html'; // Redirecionar para login
        }
    });
}

// Função para realizar o logout
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html'; // Redirecionar para a página de login após logout
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
    const user = firebase.auth().currentUser;

    if (!user) {
        console.error('Usuário não autenticado');
        window.location.href = 'login.html'; // Redirecionar para a página de login se não estiver autenticado
        return;
    }

    const currentUserId = user.uid;
    const reviewsRef = database.ref('usuarios');
    let reviewsArray = [];
    let topReviewsArray = [];
    let friendsReviewsArray = [];
    let promises = [];
    let friendsIds = [];

    // Primeiro, obter os IDs dos amigos do usuário atual
    const currentUserRef = database.ref('usuarios/' + currentUserId);
    promises.push(currentUserRef.once('value').then(userSnapshot => {
        const userData = userSnapshot.val();
        friendsIds = userData.amigos || [];
    }));

    reviewsRef.once('value').then(snapshot => {
        snapshot.forEach(userSnapshot => {
            const userId = userSnapshot.key;
            const userData = userSnapshot.val();
            const username = userData.username || 'Usuário Desconhecido';

            Object.keys(userData.categorias || {}).forEach(gameId => {
                const game = userData.categorias[gameId];
                if (game.status === 'zerado') {
                    promises.push(
                        fetchGameDetails(gameId).then(gameDetails => {
                            const review = {
                                userId,
                                username,
                                gameId,
                                gameName: gameDetails.nome,
                                gameImage: gameDetails.imagem,
                                ...game
                            };
                            reviewsArray.push(review);
                            topReviewsArray.push(review);

                            if (friendsIds.includes(userId)) {
                                friendsReviewsArray.push(review);
                            }
                        })
                    );
                }
            });
        });

        Promise.all(promises).then(() => {
            topReviewsArray.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
            reviewsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
            friendsReviewsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);

            renderTopReviews(topReviewsArray);
            renderReviews(reviewsArray);
            renderFriendsReviews(friendsReviewsArray);
        }).catch(error => {
            console.error('Erro ao buscar resenhas:', error);
            showModal('Erro', 'Erro ao carregar resenhas. Tente novamente.');
        });
    }).catch(error => {
        console.error('Erro ao buscar dados dos usuários:', error);
        showModal('Erro', 'Erro ao carregar dados dos usuários. Tente novamente.');
    });
}

// Função para renderizar as 5 resenhas mais curtidas
function renderTopReviews(reviews) {
    const sidebarDiv = document.getElementById('top-reviews');
    if (!sidebarDiv) {
        console.error('Elemento com ID "top-reviews" não encontrado.');
        return;
    }
    sidebarDiv.innerHTML = ''; // Limpa o conteúdo anterior

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('mb-3');

        reviewCard.innerHTML = `
            <div class="card shadow-sm">
                <img src="${review.gameImage}" class="card-img-top" alt="${review.gameName}">
                <div class="card-body">
                    <h5 class="card-title">${review.gameName}</h5>
                    <p class="card-text">
                        <strong>Usuário:</strong> 
                        <a href="perfilamigo.html?userId=${review.userId}">${review.username}</a>
                    </p>
                    <p class="card-text"><strong>Nota:</strong> ${review.nota}/10</p>
                    <p class="card-text"><strong>Resenha:</strong> ${review.resenha}</p>
                    <p class="card-text"><strong>Likes:</strong> ${review.likes || 0}</p>
                    <button class="btn btn-primary like-btn" data-user-id="${review.userId}" data-game-id="${review.gameId}">
                        Curtir
                    </button>
                </div>
            </div>
        `;

        sidebarDiv.appendChild(reviewCard);
    });

    // Adiciona o evento de clique para todos os botões de curtir no feed
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-user-id');
            const gameId = event.target.getAttribute('data-game-id');
            likeReview(userId, gameId);
        });
    });
}

// Função para renderizar as resenhas no feed principal
function renderReviews(reviews) {
    const feedDiv = document.getElementById('feed-resenhas');
    if (!feedDiv) {
        console.error('Elemento com ID "feed-resenhas" não encontrado.');
        return;
    }
    feedDiv.innerHTML = ''; // Limpa o conteúdo anterior

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('col-md-6', 'mb-4');

        reviewCard.innerHTML = `
            <div class="card shadow-sm">
                <img src="${review.gameImage}" class="card-img-top" alt="${review.gameName}">
                <div class="card-body">
                    <h5 class="card-title">
                        <a href="perfilamigo.html?userId=${review.userId}">${review.username}</a>
                    </h5>
                    <p class="card-text"><strong>Jogo:</strong> ${review.gameName}</p>
                    <p class="card-text"><strong>Nota:</strong> ${review.nota}/10</p>
                    <p class="card-text"><strong>Resenha:</strong> ${review.resenha}</p>
                    <button class="btn btn-primary like-btn" data-user-id="${review.userId}" data-game-id="${review.gameId}">
                        Curtir (${review.likes || 0})
                    </button>
                </div>
            </div>
        `;

        feedDiv.appendChild(reviewCard);
    });

    // Adiciona o evento de clique para todos os botões de curtir no feed
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-user-id');
            const gameId = event.target.getAttribute('data-game-id');
            likeReview(userId, gameId);
        });
    });
}

// Função para renderizar as resenhas de amigos
function renderFriendsReviews(reviews) {
    const friendsFeedDiv = document.getElementById('friends-reviews');
    if (!friendsFeedDiv) {
        console.error('Elemento com ID "friends-reviews" não encontrado.');
        return;
    }
    friendsFeedDiv.innerHTML = ''; // Limpa o conteúdo anterior

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('col-md-6', 'mb-4');

        reviewCard.innerHTML = `
            <div class="card shadow-sm">
                <img src="${review.gameImage}" class="card-img-top" alt="${review.gameName}">
                <div class="card-body">
                    <h5 class="card-title">
                        <a href="perfilamigo.html?userId=${review.userId}">${review.username}</a>
                    </h5>
                    <p class="card-text"><strong>Jogo:</strong> ${review.gameName}</p>
                    <p class="card-text"><strong>Nota:</strong> ${review.nota}/10</p>
                    <p class="card-text"><strong>Resenha:</strong> ${review.resenha}</p>
                    <button class="btn btn-primary like-btn" data-user-id="${review.userId}" data-game-id="${review.gameId}">
                        Curtir (${review.likes || 0})
                    </button>
                </div>
            </div>
        `;

        friendsFeedDiv.appendChild(reviewCard);
    });

    // Adiciona o evento de clique para todos os botões de curtir no feed de amigos
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-user-id');
            const gameId = event.target.getAttribute('data-game-id');
            likeReview(userId, gameId);
        });
    });
}

// Função para curtir uma resenha
function likeReview(userId, gameId) {
    const reviewRef = database.ref('usuarios/' + userId + '/categorias/' + gameId);
    reviewRef.once('value').then(snapshot => {
        const review = snapshot.val();
        if (review) {
            const currentLikes = review.likes || 0;
            reviewRef.update({ likes: currentLikes + 1 }).then(() => {
                // Atualiza a interface após curtir
                fetchReviews();
            }).catch(error => {
                console.error('Erro ao curtir resenha:', error);
            });
        }
    }).catch(error => {
        console.error('Erro ao buscar resenha:', error);
    });
}

// Função para exibir um modal de erro
function showModal(title, message) {
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    modalTitle.textContent = title;
    modalBody.textContent = message;
    $('#errorModal').modal('show');
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

// Evento de clique para o botão de logout
document.getElementById('logout-menu-item').addEventListener('click', () => {
    logout();
});
