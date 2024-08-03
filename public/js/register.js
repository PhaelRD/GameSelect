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

// Referência ao serviço de autenticação do Firebase e ao banco de dados
const auth = firebase.auth();
const database = firebase.database();

// Obtenha referência ao formulário de registro
const registerForm = document.getElementById('register-form');

// Obtenha referência ao spinner
const spinnerOverlay = document.getElementById('loading-overlay');

// Obtenha referência aos alertas
const alertSuccess = document.getElementById('alert-success');
const alertError = document.getElementById('alert-error');
const errorMessage = document.getElementById('error-message');

// Obtenha referência ao campo de nome de usuário
const usernameField = document.getElementById('register-username');

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

// Função para verificar se o nome de usuário já existe
function checkUsernameExists(username) {
    return database.ref('usuarios').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => snapshot.exists());
}

// Adicione o ouvinte de evento de envio ao formulário
registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Mostre o spinner de carregamento
    showLoadingSpinner();

    // Ocultar alertas anteriores
    alertSuccess.classList.add('d-none');
    alertError.classList.add('d-none');

    // Obtenha o email, senha e nome de usuário do formulário
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const username = usernameField.value;

    // Verifique se o nome de usuário já existe
    checkUsernameExists(username).then(exists => {
        if (exists) {
            // Nome de usuário já existe
            errorMessage.textContent = 'Nome de usuário já está em uso.';
            showAlert(alertError);
            hideLoadingSpinner();
        } else {
            // Crie um novo usuário com email e senha
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Usuário registrado com sucesso
                    const user = userCredential.user;
                    console.log('Usuário registrado:', user);

                    // Salvar informações adicionais do usuário no banco de dados
                    const userRef = database.ref('usuarios/' + user.uid);
                    userRef.set({
                        email: email,
                        username: username,
                        admin: false, // Valor padrão para admin
                        favoritos: [] // Lista vazia padrão para favoritos
                    })
                    .then(() => {
                        console.log('Dados do usuário salvos no banco de dados.');
                        // Mostrar alerta de sucesso
                        showAlert(alertSuccess);

                        // Redirecionar após um pequeno atraso
                        setTimeout(() => {
                            window.location.href = 'login.html'; // Redireciona para a página de login
                        }, 1500);
                    })
                    .catch((error) => {
                        console.error('Erro ao salvar dados do usuário:', error.message);
                        errorMessage.textContent = 'Erro ao salvar dados do usuário: ' + error.message;
                        // Mostrar alerta de erro
                        showAlert(alertError);
                    })
                    .finally(() => {
                        // Sempre ocultar o spinner após finalizar
                        hideLoadingSpinner();
                    });
                })
                .catch((error) => {
                    // Lide com erros
                    console.error('Erro ao registrar usuário:', error.message);

                    // Identifique erros específicos
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage.textContent = 'Este e-mail já está em uso.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage.textContent = 'E-mail inválido.';
                            break;
                        case 'auth/weak-password':
                            errorMessage.textContent = 'Senha fraca. A senha deve ter pelo menos 6 caracteres.';
                            break;
                        default:
                            errorMessage.textContent = 'Erro ao registrar: ' + error.message;
                    }
                    
                    // Mostrar alerta de erro
                    showAlert(alertError);
                })
                .finally(() => {
                    // Sempre ocultar o spinner após finalizar
                    hideLoadingSpinner();
                });
        }
    });
});
