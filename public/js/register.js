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

// Reference to the Firebase Auth service and Database service
const auth = firebase.auth();
const database = firebase.database();

document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get email and password from form
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Create a new user with email and password
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User registered successfully
            const user = userCredential.user;
            console.log('User registered:', user);

            // Save additional user information in Realtime Database
            const userRef = database.ref('usuarios/' + user.uid);
            userRef.set({
                email: email,
                admin: false, // Default value for admin
                favoritos: [] // Default empty list for favorites
            })
            .then(() => {
                console.log('User data saved to Realtime Database.');
                // Redirect or show a success message
                alert('Registro realizado com sucesso!');
                window.location.href = 'index.html'; // Redirect to login page
            })
            .catch((error) => {
                console.error('Error saving user data:', error.message);
                alert('Erro ao salvar dados do usuário: ' + error.message);
            });
        })
        .catch((error) => {
            // Handle errors
            console.error('Error registering user:', error.message);
            alert('Erro ao registrar: ' + error.message);
        });
});
