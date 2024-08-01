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
    // Check authentication and adjust UI
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            document.getElementById('logout-menu-item').style.display = 'block';
            document.getElementById('perfil-menu-item').style.display = 'block'; // Show "Favoritos" when logged in
            database.ref(`users/${user.uid}`).once('value').then(snapshot => {
                const isAdmin = snapshot.val().admin || false;
                document.getElementById('admin-menu-item').style.display = isAdmin ? 'block' : 'none';
            });
        } else {
            // User is not signed in
            document.getElementById('logout-menu-item').style.display = 'none';
            document.getElementById('perfil-menu-item').style.display = 'none'; // Hide "Favoritos" when not logged in
            document.getElementById('admin-menu-item').style.display = 'none';
        }
    });

    // Get references to filter elements
    const searchInput = document.getElementById('pesquisa-nome');
    const platformFilters = document.querySelectorAll('.filtro-plataforma');
    const genreFilters = document.querySelectorAll('.filtro-genero');

    // Fetch games from Firebase
    fetchGames();

    // Add event listeners for filters
    searchInput.addEventListener('input', filterGames);
    platformFilters.forEach(filter => filter.addEventListener('change', filterGames));
    genreFilters.forEach(filter => filter.addEventListener('change', filterGames));
});

// Fetch games from the database and render them
function fetchGames() {
    database.ref('jogos').on('value', snapshot => {
        const jogos = snapshot.val();
        renderGames(jogos);
    });
}

// Render games based on the data from Firebase
function renderGames(jogos) {
    const gameList = document.getElementById('jogos-lista');
    gameList.innerHTML = ''; // Clear previous games

    for (let id in jogos) {
        const jogo = jogos[id];

        // Create HTML elements for game
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');
        gameElement.setAttribute('data-id', id); // Attach game ID as a data attribute

        const gameLink = document.createElement('a');
        gameLink.href = `jogo.html?id=${id}`; // Link to the game details page with game ID
        gameLink.classList.add('game-link');

        const gameName = document.createElement('h3');
        gameName.textContent = jogo.nome;

        const gameImage = document.createElement('img');
        gameImage.src = jogo.imagem;
        gameImage.alt = jogo.nome;

        // Append elements to game link in the desired order
        gameLink.appendChild(gameName); // Name first
        gameLink.appendChild(gameImage); // Image second

        // Append game link to game element
        gameElement.appendChild(gameLink);

        // Append game element to the game list
        gameList.appendChild(gameElement);
    }
}

// Filter games based on search input and selected filters
function filterGames() {
    const searchTerm = document.getElementById('pesquisa-nome').value.toLowerCase();
    const selectedPlatforms = Array.from(document.querySelectorAll('.filtro-plataforma:checked')).map(el => el.value);
    const selectedGenres = Array.from(document.querySelectorAll('.filtro-genero:checked')).map(el => el.value);

    database.ref('jogos').once('value', snapshot => {
        const jogos = snapshot.val();
        const filteredGames = {};

        for (let id in jogos) {
            const jogo = jogos[id];

            // Filter by name
            const nameMatches = jogo.nome.toLowerCase().includes(searchTerm);

            // Filter by platform
            const platformMatches = selectedPlatforms.length === 0 || jogo.plataformas.some(plataforma => selectedPlatforms.includes(plataforma));

            // Filter by genre
            const genreMatches = selectedGenres.length === 0 || jogo.generos.some(genero => selectedGenres.includes(genero));

            if (nameMatches && platformMatches && genreMatches) {
                filteredGames[id] = jogo;
            }
        }

        renderGames(filteredGames);
    });
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
