// Configuração do Firebase
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

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao serviço de autenticação do Firebase
const auth = firebase.auth();

// Obtenha referência ao formulário de login
const loginForm = document.getElementById('login-form');

// Obtenha referência ao spinner
const spinnerOverlay = document.getElementById('loading-overlay');

// Obtenha referência aos alertas
const alertSuccess = document.getElementById('alert-success');
const alertError = document.getElementById('alert-error');
const errorMessage = document.getElementById('error-message');

// Função para mostrar alerta
function showAlert(alertElement) {
    alertElement.classList.remove('d-none');
    setTimeout(() => {
        alertElement.classList.add('d-none');
    }, 3000); // Alerta some após 3 segundos
}

// Função para mostrar o spinner de carregamento
function showLoadingSpinner() {
    spinnerOverlay.classList.remove('d-none');
}

// Função para esconder o spinner de carregamento
function hideLoadingSpinner() {
    spinnerOverlay.classList.add('d-none');
}

// Adicione o ouvinte de evento de envio ao formulário
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Mostre o spinner de carregamento
    showLoadingSpinner();

    // Ocultar alertas anteriores
    alertSuccess.classList.add('d-none');
    alertError.classList.add('d-none');

    // Obtenha o email e a senha do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

    // Faça login com email e senha
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuário logado com sucesso
            const user = userCredential.user;
            console.log('Usuário logado:', user);

            // Mostrar alerta de sucesso
            showAlert(alertSuccess);

            // Redirecionar após um pequeno atraso
            setTimeout(() => {
                window.location.href = 'index.html'; // Redireciona para a página principal ou dashboard
            }, 1500);
        })
        .catch((error) => {
            // Lide com erros
            console.error('Erro ao entrar:', error.message);

            // Identifique erros específicos
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage.textContent = 'Senha incorreta.';
                    break;
                case 'auth/user-not-found':
                    errorMessage.textContent = 'Email não registrado.';
                    break;
                default:
                    errorMessage.textContent = error.message;
            }
            
            // Mostrar alerta de erro
            showAlert(alertError);
        })
        .finally(() => {
            // Sempre ocultar o spinner após finalizar
            hideLoadingSpinner();
        });
});
