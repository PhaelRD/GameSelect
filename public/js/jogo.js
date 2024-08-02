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
                    alert('Por favor, insira uma nota válida entre 1 e 10.');
                }
            });

            // Show profile and logout menu items
            document.getElementById('perfil-menu-item').style.display = 'block';
            document.getElementById('logout-menu-item').style.display = 'block';
        } else {
            // Hide profile and logout menu items
            document.getElementById('perfil-menu-item').style.display = 'none';
            document.getElementById('logout-menu-item').style.display = 'none';

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
            alert('Jogo marcado como zerado e nota enviada!');
            updateGameRatings(gameId); // Update ratings after setting the game as completed
        }).catch(error => {
            console.error('Erro ao atualizar categoria do jogo:', error);
        });
    } else {
        userGameRef.set({
            status: category
        }).then(() => {
            alert(`Jogo adicionado aos ${category}!`);
        }).catch(error => {
            console.error('Erro ao atualizar categoria do jogo:', error);
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
    });
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
