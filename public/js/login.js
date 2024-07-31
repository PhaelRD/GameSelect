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

// Reference to the Firebase Auth service
const auth = firebase.auth();

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get email and password from form
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

    // Sign in with email and password
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User signed in successfully
            const user = userCredential.user;
            console.log('User signed in:', user);
            
            // Redirect to a different page or show a success message
            alert('Login realizado com sucesso!');
            window.location.href = 'index.html'; // Redirect to the main page or dashboard
        })
        .catch((error) => {
            // Handle errors
            console.error('Error signing in:', error.message);
            alert('Erro ao entrar: ' + error.message);
        });
});
