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
    // Get the game ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (gameId) {
        // Fetch the game details from Firebase
        database.ref(`jogos/${gameId}`).once('value').then(snapshot => {
            const jogo = snapshot.val();
            if (jogo) {
                renderGameDetails(jogo);
                setupFavoriteButton(gameId); // Set up the favorite button
            } else {
                document.getElementById('jogo-detalhes').innerHTML = '<p>Jogo não encontrado.</p>';
            }
        }).catch(error => {
            console.error('Error fetching game details:', error);
            document.getElementById('jogo-detalhes').innerHTML = '<p>Erro ao carregar detalhes do jogo.</p>';
        });
    } else {
        document.getElementById('jogo-detalhes').innerHTML = '<p>ID do jogo não fornecido.</p>';
    }
});

// Render game details including links, genres, and platforms
function renderGameDetails(jogo) {
    const detalhesDiv = document.getElementById('jogo-detalhes');

    // Create and append the game title
    const gameTitle = document.createElement('h2');
    gameTitle.textContent = jogo.nome;
    detalhesDiv.appendChild(gameTitle);

    // Create and append the game image
    const gameImage = document.createElement('img');
    gameImage.src = jogo.imagem;
    gameImage.alt = jogo.nome;
    detalhesDiv.appendChild(gameImage);

    // Create and append the game video
    if (jogo.video) {
        const videoId = jogo.video.split('/').pop(); // Extract video ID from the URL
        const gameVideo = document.createElement('iframe');
        gameVideo.src = `https://www.youtube.com/embed/${videoId}`;
        gameVideo.width = "560";
        gameVideo.height = "315";
        gameVideo.frameBorder = "0";
        gameVideo.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        gameVideo.allowFullscreen = true;
        detalhesDiv.appendChild(gameVideo);
    }

    // Create and append the game description
    if (jogo.descricao) {
        const gameDescription = document.createElement('p');
        gameDescription.textContent = jogo.descricao;
        detalhesDiv.appendChild(gameDescription);
    }

    // Create and append the genres
    if (jogo.generos && jogo.generos.length > 0) {
        const genreList = document.createElement('ul');
        const genreTitle = document.createElement('h3');
        genreTitle.textContent = 'Gêneros:';
        detalhesDiv.appendChild(genreTitle);

        jogo.generos.forEach(genero => {
            const listItem = document.createElement('li');
            listItem.textContent = genero;
            genreList.appendChild(listItem);
        });

        detalhesDiv.appendChild(genreList);
    } else {
        detalhesDiv.innerHTML += '<p>Não há gêneros disponíveis para este jogo.</p>';
    }

    // Create and append the platforms
    if (jogo.plataformas && jogo.plataformas.length > 0) {
        const platformList = document.createElement('ul');
        const platformTitle = document.createElement('h3');
        platformTitle.textContent = 'Plataformas:';
        detalhesDiv.appendChild(platformTitle);

        jogo.plataformas.forEach(plataforma => {
            const listItem = document.createElement('li');
            listItem.textContent = plataforma;
            platformList.appendChild(listItem);
        });

        detalhesDiv.appendChild(platformList);
    } else {
        detalhesDiv.innerHTML += '<p>Não há plataformas disponíveis para este jogo.</p>';
    }

    // Create and append the links
    if (jogo.links && jogo.links.length > 0) {
        const linksList = document.createElement('ul');
        const linksTitle = document.createElement('h3');
        linksTitle.textContent = 'Links:';
        detalhesDiv.appendChild(linksTitle);

        jogo.links.forEach(link => {
            const listItem = document.createElement('li');

            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.nome;
            linkElement.target = '_blank'; // Open link in a new tab

            listItem.appendChild(linkElement);
            linksList.appendChild(listItem);
        });

        detalhesDiv.appendChild(linksList);
    } else {
        detalhesDiv.innerHTML += '<p>Não há links disponíveis para este jogo.</p>';
    }
}

// Set up the favorite button
function setupFavoriteButton(gameId) {
    const favoriteButton = document.getElementById('favoritar-botao');
    
    auth.onAuthStateChanged(user => {
        if (user) {
            // Check if the game is already in the user's favorites
            const userRef = database.ref(`usuarios/${user.uid}`);
            userRef.once('value').then(snapshot => {
                const userData = snapshot.val();
                const isFavorite = userData.favoritos && userData.favoritos.includes(gameId);
                favoriteButton.textContent = isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';
                
                // Add event listener to toggle favorite status
                favoriteButton.addEventListener('click', () => {
                    if (isFavorite) {
                        removeFromFavorites(user.uid, gameId);
                    } else {
                        addToFavorites(user.uid, gameId);
                    }
                });
            });
        } else {
            favoriteButton.style.display = 'none'; // Hide button if user is not logged in
        }
    });
}

// Add a game to user's favorites
function addToFavorites(userId, gameId) {
    const userRef = database.ref(`usuarios/${userId}/favoritos`);
    userRef.once('value').then(snapshot => {
        const favoritos = snapshot.val() || [];
        if (!favoritos.includes(gameId)) {
            favoritos.push(gameId);
            userRef.set(favoritos).then(() => {
                document.getElementById('favoritar-botao').textContent = 'Remover dos Favoritos';
            });
        }
    });
}

// Remove a game from user's favorites
function removeFromFavorites(userId, gameId) {
    const userRef = database.ref(`usuarios/${userId}/favoritos`);
    userRef.once('value').then(snapshot => {
        let favoritos = snapshot.val() || [];
        favoritos = favoritos.filter(id => id !== gameId);
        userRef.set(favoritos).then(() => {
            document.getElementById('favoritar-botao').textContent = 'Adicionar aos Favoritos';
        });
    });
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        // Redirect to login page or show a message
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error signing out: ', error);
    });
}
