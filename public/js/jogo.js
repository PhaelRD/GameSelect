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

// Function to render game details including links, genres, and platforms
function renderGameDetails(jogo) {
    const detalhesDiv = document.getElementById('jogo-detalhes');
    detalhesDiv.innerHTML = ''; // Clear previous content

    // Create and append the game title
    const gameTitle = document.createElement('h2');
    gameTitle.textContent = jogo.nome;
    gameTitle.classList.add('card-header'); // Use card header class
    detalhesDiv.appendChild(gameTitle);

    // Create and append the game image
    const gameImage = document.createElement('img');
    gameImage.src = jogo.imagem;
    gameImage.alt = jogo.nome;
    gameImage.classList.add('card-img-top'); // Use Bootstrap class for image
    detalhesDiv.appendChild(gameImage);

    // Create card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    // Create and append the game video
    if (jogo.video) {
        const videoId = jogo.video.split('/').pop(); // Extract video ID from the URL
        const gameVideo = document.createElement('iframe');
        gameVideo.src = `https://www.youtube.com/embed/${videoId}`;
        gameVideo.width = "720";
        gameVideo.height = "400";
        gameVideo.frameBorder = "0";
        gameVideo.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        gameVideo.allowFullscreen = true;
    
        // Create a container for the video
        const videoContainer = document.createElement('div');
        videoContainer.style.textAlign = 'center'; // Center align the container
        videoContainer.appendChild(gameVideo);
    
        cardBody.appendChild(videoContainer);
    }

    // Create and append the game description
    if (jogo.descricao) {
        const gameDescription = document.createElement('p');
        gameDescription.textContent = jogo.descricao;
        cardBody.appendChild(gameDescription);
    }

    // Create and append the genres
    if (jogo.generos && jogo.generos.length > 0) {
        const genreList = document.createElement('ul');
        genreList.classList.add('list-group'); // Use Bootstrap list group
        const genreTitle = document.createElement('h3');
        genreTitle.textContent = 'Gêneros:';
        cardBody.appendChild(genreTitle);

        jogo.generos.forEach(genero => {
            const listItem = document.createElement('li');
            listItem.textContent = genero;
            listItem.classList.add('list-group-item'); // Use Bootstrap list group item
            genreList.appendChild(listItem);
        });

        cardBody.appendChild(genreList);
    } else {
        cardBody.innerHTML += '<p>Não há gêneros disponíveis para este jogo.</p>';
    }

    // Create and append the platforms
    if (jogo.plataformas && jogo.plataformas.length > 0) {
        const platformList = document.createElement('ul');
        platformList.classList.add('list-group'); // Use Bootstrap list group
        const platformTitle = document.createElement('h3');
        platformTitle.textContent = 'Plataformas:';
        cardBody.appendChild(platformTitle);

        jogo.plataformas.forEach(plataforma => {
            const listItem = document.createElement('li');
            listItem.textContent = plataforma;
            listItem.classList.add('list-group-item'); // Use Bootstrap list group item
            platformList.appendChild(listItem);
        });

        cardBody.appendChild(platformList);
    } else {
        cardBody.innerHTML += '<p>Não há plataformas disponíveis para este jogo.</p>';
    }

    // Create and append the links
    if (jogo.links && Object.keys(jogo.links).length > 0) {
        const linksList = document.createElement('ul');
        linksList.classList.add('list-group'); // Use Bootstrap list group
        const linksTitle = document.createElement('h3');
        linksTitle.textContent = 'Links:';
        cardBody.appendChild(linksTitle);

        Object.keys(jogo.links).forEach(key => {
            const link = jogo.links[key];
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item'); // Use Bootstrap list group item

            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.nome;
            linkElement.target = '_blank'; // Open link in a new tab

            listItem.appendChild(linkElement);
            linksList.appendChild(listItem);
        });

        cardBody.appendChild(linksList);
    } else {
        cardBody.innerHTML += '<p>Não há links disponíveis para este jogo.</p>';
    }

    detalhesDiv.appendChild(cardBody);
}

// Set up the category buttons
function setupCategoryButtons(gameId) {
    const desejadosButton = document.getElementById('desejados-botao');
    const jogandoButton = document.getElementById('jogando-botao');
    const zeradoButton = document.getElementById('zerado-botao');
    const notaZeradoDiv = document.getElementById('nota-zerado');
    const enviarNotaButton = document.getElementById('enviar-nota');
    const notaInput = document.getElementById('nota');

    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            // Add event listeners for category buttons
            desejadosButton.addEventListener('click', () => setCategory(userId, gameId, 'desejado'));
            jogandoButton.addEventListener('click', () => setCategory(userId, gameId, 'jogando'));
            zeradoButton.addEventListener('click', () => {
                notaZeradoDiv.style.display = 'block'; // Show rating input when "Zerado" is selected
            });

            enviarNotaButton.addEventListener('click', () => {
                const nota = parseInt(notaInput.value);
                if (nota >= 1 && nota <= 10) {
                    setCategory(userId, gameId, 'zerado', nota);
                    notaZeradoDiv.style.display = 'none'; // Hide rating input after submitting
                } else {
                    showModal('Erro', 'Por favor, insira uma nota válida entre 1 e 10.');
                }
            });

            // Show profile and logout menu items
            document.getElementById('perfil-menu-item').style.display = 'block';
            document.getElementById('logout-menu-item').style.display = 'block';
        } else {
            // Hide profile and logout menu items
            document.getElementById('perfil-menu-item').style.display = 'none';
            document.getElementById('logout-menu-item').style.display = 'none';

            // Add event listeners for category buttons when user is not logged in
            desejadosButton.addEventListener('click', () => showModal('Aviso', 'Você precisa estar logado para adicionar jogos aos desejados.'));
            jogandoButton.addEventListener('click', () => showModal('Aviso', 'Você precisa estar logado para adicionar jogos aos jogando.'));
            zeradoButton.addEventListener('click', () => showModal('Aviso', 'Você precisa estar logado para marcar jogos como zerado.'));
        }
    });
}

// Set the category for the game in the user's profile
function setCategory(userId, gameId, category, nota = null) {
    const userGameRef = database.ref(`usuarios/${userId}/categorias/${gameId}`);
    
    if (category === 'zerado' && nota !== null) {
        userGameRef.set({
            status: category,
            nota: nota
        }).then(() => {
            showModal('Sucesso', 'Jogo marcado como zerado e nota enviada!');
            updateGameRatings(gameId); // Update ratings after setting the game as completed
        }).catch(error => {
            console.error('Erro ao atualizar categoria do jogo:', error);
            showModal('Erro', 'Erro ao atualizar categoria do jogo. Tente novamente.');
        });
    } else {
        userGameRef.set({
            status: category
        }).then(() => {
            showModal('Sucesso', `Jogo adicionado aos ${category}!`);
        }).catch(error => {
            console.error('Erro ao atualizar categoria do jogo:', error);
            showModal('Erro', 'Erro ao atualizar categoria do jogo. Tente novamente.');
        });
    }
}

// Show a modal dialog with a message
function showModal(title, message) {
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = title;
    modalBody.textContent = message;

    $('#messageModal').modal('show');
}

// Update average game ratings
function updateGameRatings(gameId) {
    const ratingsRef = database.ref(`usuarios`);
    const gameRatingsRef = database.ref(`jogos/${gameId}/avaliacoes`);
    
    ratingsRef.once('value').then(snapshot => {
        const users = snapshot.val();
        let totalRating = 0;
        let ratingCount = 0;
        
        for (const userId in users) {
            const userGames = users[userId].categorias;
            if (userGames && userGames[gameId] && userGames[gameId].status === 'zerado') {
                totalRating += userGames[gameId].nota;
                ratingCount++;
            }
        }
        
        const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : null;
        
        gameRatingsRef.set({
            average: averageRating,
            count: ratingCount
        }).then(() => {
            console.log('Average rating updated successfully.');
        }).catch(error => {
            console.error('Error updating average rating:', error);
        });
    }).catch(error => {
        console.error('Error fetching user data:', error);
    });
}

// Fetch the game ID from the URL
function getGameIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load game data and initialize the page
function loadGameData() {
    const gameId = getGameIdFromURL();
    if (!gameId) {
        showModal('Erro', 'Jogo não encontrado.');
        return;
    }

    const gameRef = database.ref(`jogos/${gameId}`);

    gameRef.once('value').then(snapshot => {
        const gameData = snapshot.val();
        if (gameData) {
            renderGameDetails(gameData);
            setupCategoryButtons(gameId);
        } else {
            showModal('Erro', 'Jogo não encontrado.');
        }
    }).catch(error => {
        console.error('Erro ao buscar dados do jogo:', error);
        showModal('Erro', 'Erro ao buscar dados do jogo. Tente novamente.');
    });
}

// Call loadGameData when the window is loaded
window.addEventListener('load', loadGameData);
