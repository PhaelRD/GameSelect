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
const database = firebase.database();
const auth = firebase.auth();

// Global variable to store user ID
let currentUserId = null;

// Function to load favorite games
function loadFavoriteGames(favoritos) {
    const listaDiv = document.getElementById('favoritos-lista');

    if (favoritos.length === 0) {
        listaDiv.innerHTML = '<p>Você ainda não tem jogos favoritos.</p>';
        return;
    }

    favoritos.forEach(gameId => {
        database.ref(`jogos/${gameId}`).once('value').then(snapshot => {
            const jogo = snapshot.val();
            if (jogo) {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'favorito-jogo';

                // Create a link to the game details page
                const gameLink = document.createElement('a');
                gameLink.href = `jogo.html?id=${gameId}`;
                gameLink.style.textDecoration = 'none'; // Remove underline

                // Game title
                const gameTitle = document.createElement('h3');
                gameTitle.textContent = jogo.nome;
                gameLink.appendChild(gameTitle);

                // Game image
                const gameImage = document.createElement('img');
                gameImage.src = jogo.imagem;
                gameImage.alt = jogo.nome;
                gameLink.appendChild(gameImage);

                // Append the link to the gameDiv
                gameDiv.appendChild(gameLink);

                // Remove button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remover dos Favoritos';
                removeButton.onclick = (event) => {
                    event.stopPropagation(); // Prevent click event from bubbling up to the link
                    removeFromFavorites(currentUserId, gameId);
                };
                gameDiv.appendChild(removeButton);

                listaDiv.appendChild(gameDiv);
            }
        }).catch(error => {
            console.error('Error fetching game details:', error);
        });
    });
}

// Function to remove a game from favorites
function removeFromFavorites(userId, gameId) {
    const userRef = database.ref(`usuarios/${userId}/favoritos`);
    userRef.once('value').then(snapshot => {
        const favoritos = snapshot.val() || [];
        const updatedFavoritos = favoritos.filter(id => id !== gameId);
        userRef.set(updatedFavoritos).then(() => {
            // Refresh the favorites list
            loadUserFavorites();
        }).catch(error => {
            console.error('Error removing game from favorites:', error);
        });
    });
}

// Function to load user favorites
function loadUserFavorites() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid; // Store user ID in global variable
            const userRef = database.ref(`usuarios/${user.uid}/favoritos`);
            userRef.once('value').then(snapshot => {
                const favoritos = snapshot.val() || [];
                loadFavoriteGames(favoritos);
            }).catch(error => {
                console.error('Error loading user favorites:', error);
            });
        } else {
            document.getElementById('favoritos-lista').innerHTML = '<p>Você precisa estar logado para ver seus favoritos.</p>';
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadUserFavorites();
});
