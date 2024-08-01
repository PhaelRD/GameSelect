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

// Load user profile data
function loadUserProfile(userId) {
    const userRef = database.ref(`usuarios/${userId}/categorias`);

    userRef.once('value').then(snapshot => {
        const categorias = snapshot.val() || {};
        renderCategoryList(categorias, 'desejado', 'desejados-lista');
        renderCategoryList(categorias, 'jogando', 'jogando-lista');
        renderCompletedList(categorias, 'zerado', 'zerado-lista');
    }).catch(error => {
        console.error('Error loading user profile:', error);
    });
}

// Render a list of games in a specific category
function renderCategoryList(categorias, category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (const gameId in categorias) {
        if (categorias[gameId] === category) {
            createGameElement(gameId, container);
        }
    }
}

// Render completed games with ratings
function renderCompletedList(categorias, category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (const gameId in categorias) {
        if (categorias[gameId].status === category) {
            createGameElement(gameId, container, categorias[gameId].nota);
        }
    }
}

// Create an HTML element for a game
function createGameElement(gameId, container, rating = null) {
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

            // Add rating if available
            if (rating !== null) {
                const gameRating = document.createElement('p');
                gameRating.textContent = `Nota: ${rating}`;
                gameDiv.appendChild(gameRating);
            }

            container.appendChild(gameDiv);
        }
    }).catch(error => {
        console.error('Error loading game details:', error);
    });
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error signing out: ', error);
    });
}
