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
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            loadUserProfile(userId);
        } else {
            window.location.href = 'index.html'; // Redirect to home if not logged in
        }
    });
});

// Load user profile data including friends
function loadUserProfile(userId) {
    const userRef = database.ref(`usuarios/${userId}`);

    userRef.once('value').then(snapshot => {
        const userData = snapshot.val() || {};
        const categorias = userData.categorias || {};

        renderCategoryList(categorias, 'desejado', 'desejados-lista');
        renderCategoryList(categorias, 'jogando', 'jogando-lista');
        renderCompletedList(categorias, 'zerado', 'zerado-lista');

        // Load friends list
        renderFriendsList(userId, 'amigos-lista');
    }).catch(error => {
        console.error('Error loading user profile:', error);
    });
}

// Render a list of games in a specific category
function renderCategoryList(categorias, category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (const gameId in categorias) {
        if (categorias[gameId].status === category) {
            createGameElement(gameId, container);
        }
    }
}

// Render completed games with ratings and reviews
function renderCompletedList(categorias, category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (const gameId in categorias) {
        if (categorias[gameId].status === category) {
            createGameElement(
                gameId,
                container,
                categorias[gameId].nota,
                categorias[gameId].resenha,
                categorias[gameId].timestamp
            );
        }
    }
}

// Create an HTML element for a game
function createGameElement(gameId, container, userRating = null, review = null, timestamp = null) {
    const gameRef = database.ref(`jogos/${gameId}`);

    gameRef.once('value').then(snapshot => {
        const jogo = snapshot.val();
        if (jogo) {
            const gameDiv = document.createElement('div');
            gameDiv.classList.add('game-item', 'card', 'mb-3');

            // Create a link to the game details page
            const gameLink = document.createElement('a');
            gameLink.href = `jogo.html?id=${gameId}`;
            gameLink.classList.add('game-link', 'card-body');

            // Create game title
            const gameTitle = document.createElement('h3');
            gameTitle.classList.add('card-title');
            gameTitle.textContent = jogo.nome;
            gameLink.appendChild(gameTitle);

            // Create game image
            const gameImage = document.createElement('img');
            gameImage.src = jogo.imagem;
            gameImage.alt = jogo.nome;
            gameImage.classList.add('card-img-top');
            gameLink.appendChild(gameImage);

            // Append the link to the gameDiv
            gameDiv.appendChild(gameLink);

            // Add user's rating if available
            if (userRating !== null) {
                const userRatingElement = document.createElement('p');
                userRatingElement.classList.add('card-text');
                userRatingElement.textContent = `Sua Nota: ${userRating}/10`;
                gameDiv.appendChild(userRatingElement);
            }

            // Add review if available
            if (review !== null) {
                const reviewElement = document.createElement('p');
                reviewElement.classList.add('card-text');
                reviewElement.textContent = `Resenha: ${review}`;
                gameDiv.appendChild(reviewElement);
            }

            // Fetch and display the average rating
            fetchAverageRating(gameId).then(averageRating => {
                const averageRatingElement = document.createElement('p');
                averageRatingElement.classList.add('card-text');
                averageRatingElement.textContent = `Nota Média: ${averageRating}`;
                gameDiv.appendChild(averageRatingElement);
            });

            // Fetch and display the number of likes
            fetchNumberOfLikes(gameId).then(numberOfLikes => {
                const likesElement = document.createElement('p');
                likesElement.classList.add('card-text');
                likesElement.textContent = `Curtidas: ${numberOfLikes}`;
                gameDiv.appendChild(likesElement);
            });

            container.appendChild(gameDiv);
        }
    }).catch(error => {
        console.error('Error loading game details:', error);
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

// Fetch number of likes for a specific game
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
                        friendDiv.classList.add('friend-item', 'card', 'mb-3');

                        // Create a link to the friend's profile
                        const friendLink = document.createElement('a');
                        friendLink.href = `perfilamigo.html?userId=${friendId}`;
                        friendLink.classList.add('friend-link', 'card-body');

                        // Create friend name
                        const friendName = document.createElement('h4');
                        friendName.classList.add('card-title');
                        friendName.textContent = friendData.username || 'Desconhecido';
                        friendLink.appendChild(friendName);

                        friendDiv.appendChild(friendLink);

                        // Add 'Unfollow' button
                        const unfollowButton = document.createElement('button');
                        unfollowButton.classList.add('btn', 'btn-danger', 'mt-2');
                        unfollowButton.textContent = 'Deixar de Seguir';
                        unfollowButton.onclick = () => unfollowUser(userId, friendId);
                        friendDiv.appendChild(unfollowButton);

                        container.appendChild(friendDiv);
                    }
                }).catch(error => {
                    console.error('Error loading friend data:', error);
                });
            });
        } else {
            container.innerHTML = '<p class="text-muted">Você não tem amigos para exibir.</p>';
        }
    }).catch(error => {
        console.error('Error loading friends list:', error);
    });
}

// Unfollow a user
function unfollowUser(userId, friendId) {
    const userRef = database.ref(`usuarios/${userId}/amigos`);
    userRef.once('value').then(snapshot => {
        const amigos = snapshot.val() || [];
        const updatedFriends = amigos.filter(id => id !== friendId);

        // Update the user's friends list
        userRef.set(updatedFriends).then(() => {
            alert('Você deixou de seguir este usuário.');
            loadUserProfile(userId); // Reload profile to reflect changes
        }).catch(error => {
            console.error('Error unfollowing user:', error);
        });
    }).catch(error => {
        console.error('Error loading user friends:', error);
    });
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html'; // Redirect to home after logout
    }).catch(error => {
        console.error('Error signing out:', error);
    });
}
