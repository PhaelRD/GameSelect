// Your web app's Firebase configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to Firebase services
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
        loadUserProfile(userId);
    } else {
        window.location.href = 'index.html'; // Redirect to home if no userId
    }
    
    // Add friend button click handler
    document.getElementById('add-friend-btn').addEventListener('click', function() {
        if (auth.currentUser) {
            const currentUserId = auth.currentUser.uid;
            addFriend(currentUserId, userId);
        } else {
            alert('Você precisa estar logado para adicionar amigos.');
        }
    });
});

// Load user profile data
function loadUserProfile(userId) {
    const userRef = database.ref(`usuarios/${userId}`);

    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        if (userData) {
            const perfilInfo = document.getElementById('perfil-info');
            perfilInfo.innerHTML = `
                <h3>Nome: ${userData.username || 'Desconhecido'}</h3>
            `;
            renderFriendsList(userId, 'amigos-lista');
            renderGameList(userId, 'desejados', 'jogos-desejados-lista');
            renderGameList(userId, 'jogando', 'jogos-jogando-lista');
            renderGameList(userId, 'zerado', 'jogos-zerados-lista');
        }
    }).catch(error => {
        console.error('Erro ao carregar perfil do amigo:', error);
    });
}

// Render game list for a specific category
function renderGameList(userId, category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const userRef = database.ref(`usuarios/${userId}/categorias`);
    userRef.once('value').then(snapshot => {
        const categorias = snapshot.val() || {};

        for (const gameId in categorias) {
            if (categorias[gameId].status === category) {
                createGameElement(
                    gameId,
                    container,
                    categorias[gameId].nota,
                    categorias[gameId].resenha
                );
            }
        }
    }).catch(error => {
        console.error('Erro ao renderizar lista de jogos:', error);
    });
}

// Create an HTML element for a game
function createGameElement(gameId, container, userRating = null, review = null) {
    const gameRef = database.ref(`jogos/${gameId}`);

    gameRef.once('value').then(snapshot => {
        const jogo = snapshot.val();
        if (jogo) {
            const gameDiv = document.createElement('div');
            gameDiv.classList.add('game-item');

            // Create a link to the game details page
            const gameLink = document.createElement('a');
            gameLink.href = `jogo.html?id=${gameId}`;
            gameLink.classList.add('game-link');

            // Create game title
            const gameTitle = document.createElement('h3');
            gameTitle.textContent = jogo.nome;
            gameLink.appendChild(gameTitle);

            // Create game image
            const gameImage = document.createElement('img');
            gameImage.src = jogo.imagem;
            gameImage.alt = jogo.nome;
            gameLink.appendChild(gameImage);

            // Append the link to the gameDiv
            gameDiv.appendChild(gameLink);

            // Add user's rating if available
            if (userRating !== null) {
                const userRatingElement = document.createElement('p');
                userRatingElement.textContent = `Sua Nota: ${userRating}/10`;
                gameDiv.appendChild(userRatingElement);
            }

            // Add review if available
            if (review !== null) {
                const reviewElement = document.createElement('p');
                reviewElement.textContent = `Resenha: ${review}`;
                gameDiv.appendChild(reviewElement);
            }

            // Fetch and display the average rating
            fetchAverageRating(gameId).then(averageRating => {
                const averageRatingElement = document.createElement('p');
                averageRatingElement.textContent = `Nota Média: ${averageRating}`;
                gameDiv.appendChild(averageRatingElement);
            });

            // Fetch and display the number of likes
            fetchNumberOfLikes(gameId).then(numberOfLikes => {
                const likesElement = document.createElement('p');
                likesElement.textContent = `Curtidas: ${numberOfLikes}`;
                gameDiv.appendChild(likesElement);
            });

            container.appendChild(gameDiv);
        }
    }).catch(error => {
        console.error('Erro ao carregar detalhes do jogo:', error);
    });
}

// Fetch average rating for a specific game
function fetchAverageRating(gameId) {
    return new Promise((resolve, reject) => {
        database.ref('usuarios').once('value').then(snapshot => {
            const users = snapshot.val() || {};
            let sum = 0;
            let count = 0;

            for (const userId in users) {
                const categorias = users[userId].categorias || {};
                if (categorias[gameId] && categorias[gameId].status === 'zerado') {
                    sum += categorias[gameId].nota;
                    count += 1;
                }
            }

            if (count > 0) {
                const average = (sum / count).toFixed(1);
                resolve(`${average}/10`);
            } else {
                resolve('N/A');
            }
        }).catch(error => {
            console.error('Error fetching average rating:', error);
            resolve('N/A');
        });
    });
}

// Fetch the number of likes for a game
function fetchNumberOfLikes(gameId) {
    return new Promise((resolve, reject) => {
        database.ref('usuarios').once('value').then(snapshot => {
            const users = snapshot.val() || {};
            let totalLikes = 0;

            for (const userId in users) {
                const categorias = users[userId].categorias || {};
                if (categorias[gameId] && categorias[gameId].status === 'zerado') {
                    totalLikes += categorias[gameId].likes || 0;
                }
            }

            resolve(totalLikes);
        }).catch(error => {
            console.error('Error fetching number of likes:', error);
            resolve(0);
        });
    });
}

// Add a friend to the user's friends list
function addFriend(currentUserId, friendId) {
    const friendsRef = database.ref(`usuarios/${currentUserId}/amigos`);
    friendsRef.once('value').then(snapshot => {
        const friends = snapshot.val() || [];
        if (!friends.includes(friendId)) {
            friends.push(friendId);
            friendsRef.set(friends).then(() => {
                alert('Amigo adicionado com sucesso!');
            }).catch(error => {
                console.error('Erro ao adicionar amigo:', error);
            });
        } else {
            alert('Este usuário já é um amigo.');
        }
    }).catch(error => {
        console.error('Erro ao carregar lista de amigos:', error);
    });
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Erro ao sair: ', error);
    });
}

// Render list of friends
function renderFriendsList(userId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const userRef = database.ref(`usuarios/${userId}/amigos`);
    userRef.once('value').then(snapshot => {
        const amigos = snapshot.val() || [];
        if (amigos.length > 0) {
            amigos.forEach(friendId => {
                const friendRef = database.ref(`usuarios/${friendId}`);
                friendRef.once('value').then(friendSnapshot => {
                    const friendData = friendSnapshot.val();
                    if (friendData) {
                        const friendDiv = document.createElement('div');
                        friendDiv.classList.add('friend-item');

                        // Create a link to the friend's profile
                        const friendLink = document.createElement('a');
                        friendLink.href = `perfilamigo.html?userId=${friendId}`;
                        friendLink.classList.add('friend-link');

                        // Create friend name
                        const friendName = document.createElement('h4');
                        friendName.textContent = friendData.username || 'Desconhecido';
                        friendLink.appendChild(friendName);

                        friendDiv.appendChild(friendLink);
                        container.appendChild(friendDiv);
                    }
                }).catch(error => {
                    console.error('Erro ao carregar dados do amigo:', error);
                });
            });
        } else {
            container.innerHTML = '<p>Não há amigos para exibir.</p>';
        }
    }).catch(error => {
        console.error('Erro ao carregar lista de amigos:', error);
    });
}
