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
            // If not authenticated, redirect to login page
            window.location.href = 'login.html';
        }
    });

    const form = document.getElementById('adicionar-jogo');
    const addLinkButton = document.getElementById('add-link');
    const linksContainer = document.getElementById('links');

    // Add event listener to add new link fields
    addLinkButton.addEventListener('click', () => {
        const newLinkGroup = document.createElement('div');
        newLinkGroup.className = 'link-group';
        newLinkGroup.innerHTML = `
            <input type="text" name="link-nome[]" placeholder="Nome do Link" required>
            <input type="url" name="link-url[]" placeholder="URL do Link" required>
        `;
        linksContainer.insertBefore(newLinkGroup, addLinkButton);
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get values from the form
        const nome = document.getElementById('nome').value || '';
        const imagem = document.getElementById('imagem').value || '';
        const video = document.getElementById('video').value || '';
        const descricao = document.getElementById('descricao').value || '';

        // Get selected values for platforms and genres
        const plataformaCheckboxes = document.querySelectorAll('input[name="plataforma"]:checked');
        const generoCheckboxes = document.querySelectorAll('input[name="genero"]:checked');

        const plataformas = Array.from(plataformaCheckboxes).map(checkbox => checkbox.value);
        const generos = Array.from(generoCheckboxes).map(checkbox => checkbox.value);

        // Get link data
        const linkNames = Array.from(document.querySelectorAll('input[name="link-nome[]"]')).map(input => input.value);
        const linkUrls = Array.from(document.querySelectorAll('input[name="link-url[]"]')).map(input => input.value);

        // Generate a unique ID for the new game
        const newGameRef = database.ref('jogos').push(); // Push generates a new ID
        const newGameId = newGameRef.key; // Get the generated ID

        // Prepare the game data
        const newGameData = {
            nome: nome,
            imagem: imagem,
            descricao: descricao,
            video: video,
            plataformas: plataformas,
            generos: generos,
            links: linkNames.map((name, index) => ({
                nome: name,
                url: linkUrls[index]
            }))
        };

        // Save the new game data to the Realtime Database
        newGameRef.set(newGameData)
            .then(() => {
                console.log('Game added successfully.');
                alert('Jogo adicionado com sucesso!');
                form.reset(); // Reset the form
                document.querySelectorAll('.link-group:not(:first-child)').forEach(group => group.remove());
            })
            .catch((error) => {
                console.error('Error adding game:', error.message);
                alert('Erro ao adicionar jogo: ' + error.message);
            });
    });
});
