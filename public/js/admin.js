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
    // Check if the user is authenticated
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'login.html';
        }
    });

    const form = document.getElementById('adicionar-jogo');
    const addLinkButton = document.getElementById('add-link');
    const linksContainer = document.getElementById('links');
    const gameIdInput = document.getElementById('game-id');
    const gamesTableBody = document.querySelector('#games-table tbody');

    // Load existing games
    function loadGames() {
        database.ref('jogos').once('value').then(snapshot => {
            gamesTableBody.innerHTML = ''; // Clear current list
            snapshot.forEach(gameSnapshot => {
                const game = gameSnapshot.val();
                const gameId = gameSnapshot.key;
                const platforms = game.plataformas.join(', ');
                const genres = game.generos.join(', ');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${game.nome}</td>
                    <td>${platforms}</td>
                    <td>${genres}</td>
                    <td>
                        <button onclick="editGame('${gameId}')">Editar</button>
                        <button onclick="deleteGame('${gameId}')">Excluir</button>
                    </td>
                `;
                gamesTableBody.appendChild(row);
            });
        });
    }

    // Add event listener to add new link fields
    addLinkButton.addEventListener('click', () => {
        const newLinkGroup = document.createElement('div');
        newLinkGroup.className = 'link-group';
        newLinkGroup.innerHTML = `
            <input type="text" name="link-nome[]" placeholder="Nome do Link" required>
            <input type="url" name="link-url[]" placeholder="URL do Link" required>
            <button type="button" class="remove-link">Remover</button>
        `;
        linksContainer.insertBefore(newLinkGroup, addLinkButton);

        // Add event listener for the new "Remover" button
        newLinkGroup.querySelector('.remove-link').addEventListener('click', function() {
            newLinkGroup.remove();
        });
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get values from the form
        const nome = document.getElementById('nome').value || '';
        const imagem = document.getElementById('imagem').value || '';
        const descricao = document.getElementById('descricao').value || ''; // Ensure description is included
        const video = document.getElementById('video').value || '';

        // Get selected values for platforms and genres
        const plataformaCheckboxes = document.querySelectorAll('input[name="plataforma"]:checked');
        const generoCheckboxes = document.querySelectorAll('input[name="genero"]:checked');

        const plataformas = Array.from(plataformaCheckboxes).map(checkbox => checkbox.value);
        const generos = Array.from(generoCheckboxes).map(checkbox => checkbox.value);

        // Get link data
        const linkNames = Array.from(document.querySelectorAll('input[name="link-nome[]"]')).map(input => input.value);
        const linkUrls = Array.from(document.querySelectorAll('input[name="link-url[]"]')).map(input => input.value);

        // Generate a unique ID for the new game
        const gameId = gameIdInput.value || database.ref('jogos').push().key; // Use existing ID if editing

        // Prepare the game data
        const links = {};
        linkNames.forEach((name, index) => {
            if (name && linkUrls[index]) { // Ensure that both name and URL are provided
                links[`link${index + 1}`] = {
                    nome: name,
                    url: linkUrls[index]
                };
            }
        });

        const gameData = {
            nome: nome,
            imagem: imagem,
            descricao: descricao, // Include description
            video: video,
            plataformas: plataformas,
            generos: generos,
            links: links
        };

        // Save the game data to the Realtime Database
        database.ref(`jogos/${gameId}`).set(gameData)
            .then(() => {
                console.log('Game saved successfully.');
                alert('Jogo salvo com sucesso!');
                form.reset(); // Reset the form
                gameIdInput.value = ''; // Clear the hidden input
                document.querySelectorAll('.link-group:not(:first-child)').forEach(group => group.remove());
                loadGames(); // Reload the games list
            })
            .catch((error) => {
                console.error('Error saving game:', error.message);
                alert('Erro ao salvar jogo: ' + error.message);
            });
    });

    // Edit game function
    window.editGame = function(gameId) {
        database.ref(`jogos/${gameId}`).once('value').then(snapshot => {
            const game = snapshot.val();
            document.getElementById('nome').value = game.nome || '';
            document.getElementById('imagem').value = game.imagem || '';
            document.getElementById('descricao').value = game.descricao || ''; // Populate description
            document.getElementById('video').value = game.video || '';
            gameIdInput.value = gameId;

            // Set selected platforms and genres
            document.querySelectorAll('input[name="plataforma"]').forEach(checkbox => {
                checkbox.checked = game.plataformas.includes(checkbox.value);
            });
            document.querySelectorAll('input[name="genero"]').forEach(checkbox => {
                checkbox.checked = game.generos.includes(checkbox.value);
            });

            // Populate link fields
            document.querySelectorAll('.link-group').forEach(group => group.remove()); // Clear existing link fields
            Object.entries(game.links).forEach(([key, link]) => {
                const newLinkGroup = document.createElement('div');
                newLinkGroup.className = 'link-group';
                newLinkGroup.innerHTML = `
                    <input type="text" name="link-nome[]" value="${link.nome}" placeholder="Nome do Link" required>
                    <input type="url" name="link-url[]" value="${link.url}" placeholder="URL do Link" required>
                    <button type="button" class="remove-link">Remover</button>
                `;
                linksContainer.insertBefore(newLinkGroup, addLinkButton);

                // Add event listener for the new "Remover" button
                newLinkGroup.querySelector('.remove-link').addEventListener('click', function() {
                    newLinkGroup.remove();
                });
            });
        });
    };

    // Delete game function
    window.deleteGame = function(gameId) {
        if (confirm('Tem certeza que deseja excluir este jogo?')) {
            database.ref(`jogos/${gameId}`).remove()
                .then(() => {
                    console.log('Game deleted successfully.');
                    alert('Jogo excluído com sucesso!');
                    loadGames(); // Reload the games list
                })
                .catch((error) => {
                    console.error('Error deleting game:', error.message);
                    alert('Erro ao excluir jogo: ' + error.message);
                });
        }
    };

    // Load games on page load
    loadGames();
});
