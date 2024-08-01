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
                setupCategoryButtons(gameId); // Set up the category buttons
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
    detalhesDiv.innerHTML = ''; // Clear previous content

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
    if (jogo.links && Object.keys(jogo.links).length > 0) {
        const linksList = document.createElement('ul');
        const linksTitle = document.createElement('h3');
        linksTitle.textContent = 'Links:';
        detalhesDiv.appendChild(linksTitle);

        Object.keys(jogo.links).forEach(key => {
            const link = jogo.links[key];
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

// Set up the category buttons
function setupCategoryButtons(gameId) {
    const desejadosButton = document.getElementById('desejados-botao');
    const jogandoButton = document.getElementById('jogando-botao');
    const zeradoButton = document.getElementById('zerado-botao');
    const notaDiv = document.getElementById('nota-zerado');
    const enviarNotaButton = document.getElementById('enviar-nota');
    const notaInput = document.getElementById('nota');
    
    auth.onAuthStateChanged(user => {
        if (user) {
            const userRef = database.ref(`usuarios/${user.uid}`);
            userRef.once('value').then(snapshot => {
                const userData = snapshot.val();
                const categorias = userData.categorias || {};
                
                desejadosButton.textContent = categorias[gameId] === 'desejado' ? 'Remover dos Desejados' : 'Adicionar aos Desejados';
                jogandoButton.textContent = categorias[gameId] === 'jogando' ? 'Remover dos Jogando' : 'Adicionar aos Jogando';
                zeradoButton.textContent = categorias[gameId] === 'zerado' ? 'Remover dos Zerados' : 'Marcar como Zerado';
                
                // Set up button click handlers
                desejadosButton.addEventListener('click', () => toggleCategory(user.uid, gameId, 'desejado'));
                jogandoButton.addEventListener('click', () => toggleCategory(user.uid, gameId, 'jogando'));
                zeradoButton.addEventListener('click', () => {
                    if (categorias[gameId] === 'zerado') {
                        removeCategory(user.uid, gameId, 'zerado');
                    } else {
                        notaDiv.style.display = 'block'; // Show the rating input
                        enviarNotaButton.addEventListener('click', () => {
                            const nota = parseInt(notaInput.value);
                            if (nota >= 1 && nota <= 10) {
                                markAsCompleted(user.uid, gameId, nota);
                                notaDiv.style.display = 'none'; // Hide the rating input
                            } else {
                                alert('Por favor, forneça uma nota válida entre 1 e 10.');
                            }
                        });
                    }
                });
            });
        } else {
            // Hide buttons if user is not logged in
            desejadosButton.style.display = 'none';
            jogandoButton.style.display = 'none';
            zeradoButton.style.display = 'none';
        }
    });
}

// Toggle category for a game
function toggleCategory(userId, gameId, category) {
    const userRef = database.ref(`usuarios/${userId}/categorias`);
    userRef.once('value').then(snapshot => {
        const categorias = snapshot.val() || {};
        const currentCategory = categorias[gameId];
        
        if (currentCategory === category) {
            removeCategory(userId, gameId, category);
        } else {
            if (currentCategory) {
                removeCategory(userId, gameId, currentCategory);
            }
            addCategory(userId, gameId, category);
        }
    });
}

// Add a category to the game
function addCategory(userId, gameId, category) {
    const userRef = database.ref(`usuarios/${userId}/categorias`);
    userRef.child(gameId).set(category).then(() => {
        document.getElementById(`${category}-botao`).textContent = `Remover dos ${capitalizeFirstLetter(category)}s`;
    });
}

// Remove a category from the game
function removeCategory(userId, gameId, category) {
    const userRef = database.ref(`usuarios/${userId}/categorias`);
    userRef.child(gameId).remove().then(() => {
        document.getElementById(`${category}-botao`).textContent = `Adicionar aos ${capitalizeFirstLetter(category)}s`;
    });
}

// Mark the game as completed with a rating
function markAsCompleted(userId, gameId, rating) {
    const userRef = database.ref(`usuarios/${userId}/categorias`);
    userRef.child(gameId).set({
        status: 'zerado',
        nota: rating
    }).then(() => {
        document.getElementById('zerado-botao').textContent = 'Remover dos Zerados';
    });
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        // Redirect to login page or show a message
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error signing out: ', error);
    });
}
