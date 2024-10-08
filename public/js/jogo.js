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

function setupCategoryButtons(gameId) {
    const desejadosButton = document.getElementById('desejados-botao');
    const jogandoButton = document.getElementById('jogando-botao');
    const zeradoButton = document.getElementById('zerado-botao');
    const notaZeradoDiv = document.getElementById('nota-zerado');
    const enviarNotaButton = document.getElementById('enviar-nota');
    const notaInput = document.getElementById('nota');
    const resenhaInput = document.getElementById('resenha');

    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            // Adiciona os ouvintes de eventos para os botões de categoria
            desejadosButton.addEventListener('click', () => setCategory(userId, gameId, 'desejado'));
            jogandoButton.addEventListener('click', () => setCategory(userId, gameId, 'jogando'));
            zeradoButton.addEventListener('click', () => {
                notaZeradoDiv.style.display = 'block'; // Mostra o campo de nota e resenha quando "Zerado" é selecionado
            });

            enviarNotaButton.addEventListener('click', () => {
                const nota = parseInt(notaInput.value);
                const resenha = resenhaInput.value.trim();
                if (nota >= 1 && nota <= 10) {
                    setCategory(userId, gameId, 'zerado', nota, resenha);
                    notaZeradoDiv.style.display = 'none'; // Esconde o campo de nota e resenha após enviar
                } else {
                    showModal('Erro', 'Por favor, insira uma nota válida entre 1 e 10.');
                }
            });

            // Mostra os itens do menu de perfil e logout
            document.getElementById('perfil-menu-item').style.display = 'block';
            document.getElementById('logout-menu-item').style.display = 'block';
        } else {
            // Esconde os itens do menu de perfil e logout
            document.getElementById('perfil-menu-item').style.display = 'none';
            document.getElementById('logout-menu-item').style.display = 'none';

            // Adiciona ouvintes de eventos para os botões de categoria quando o usuário não está logado
            desejadosButton.addEventListener('click', () => showModal('Aviso', 'Você precisa estar logado para adicionar jogos aos desejados.'));
            jogandoButton.addEventListener('click', () => showModal('Aviso', 'Você precisa estar logado para adicionar jogos aos jogando.'));
            zeradoButton.addEventListener('click', () => showModal('Aviso', 'Você precisa estar logado para marcar jogos como zerado.'));
        }
    });
}

// Define a categoria do jogo no perfil do usuário
function setCategory(userId, gameId, category, nota = null, resenha = null) {
    const userGameRef = database.ref(`usuarios/${userId}/categorias/${gameId}`);
    const timestamp = new Date().toISOString(); // Data e horário atuais em formato ISO

    if (category === 'zerado' && nota !== null) {
        userGameRef.set({
            status: category,
            nota: nota,
            resenha: resenha,
            timestamp: timestamp // Adiciona data e horário
        }).then(() => {
            showModal('Sucesso', 'Jogo marcado como zerado e nota e resenha enviadas!');
            updateGameRatings(gameId); // Atualiza as avaliações após marcar o jogo como zerado
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


// Calculate and display the average rating for the game
function calculateAndDisplayAverageRating(gameId) {
    const ratingsRef = database.ref(`usuarios`);
    let totalRatings = 0;
    let sumRatings = 0;

    ratingsRef.once('value').then(snapshot => {
        snapshot.forEach(userSnapshot => {
            const userCategories = userSnapshot.val().categorias || {};

            if (userCategories[gameId] && userCategories[gameId].status === 'zerado') {
                const userRating = userCategories[gameId].nota;
                sumRatings += userRating;
                totalRatings++;
            }
        });

        const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 'N/A'; // Changed to 1 decimal place
        displayAverageRating(averageRating);
    }).catch(error => {
        console.error('Error calculating average rating:', error);
        showModal('Erro', 'Erro ao calcular a média de notas. Tente novamente.');
    });
}

// Display the average rating on the page
function displayAverageRating(averageRating) {
    const notaMediaDiv = document.getElementById('nota-media');
    notaMediaDiv.innerHTML = `<h3>Média de notas: ${averageRating}/10</h3>`; // Format as X/10
}

// Update the game ratings after a user sets a new rating
function updateGameRatings(gameId) {
    calculateAndDisplayAverageRating(gameId);
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error signing out: ', error);
        showModal('Erro', 'Erro ao sair. Tente novamente.');
    });
}

// Show modal with a message
function showModal(title, message) {
    const modalTitle = document.getElementById('alertModalLabel');
    const modalBody = document.querySelector('#alertModal .modal-body');

    modalTitle.textContent = title;
    modalBody.textContent = message;

    $('#alertModal').modal('show');
}

// On page load, check user authentication and fetch game details
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
                setupCategoryButtons(gameId);
                calculateAndDisplayAverageRating(gameId); // Calculate and display average rating
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
