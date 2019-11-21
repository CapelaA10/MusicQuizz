// Get a reference to the database service
var database = firebase.database();

//Login button and register button
var loginBtt = document.getElementById('loginBtt');
var registerBtt = document.getElementById('registerBtt');

//Event listener to the button login click
loginBtt.addEventListener('click', function() {

    //Login function
    loginEmail();

});

//Event listener to the button register click
registerBtt.addEventListener('click', function() {

    //Register the new user function
    registerUser();

});

//Login email
function loginEmail() {

    //Var email, passwordn and username
    var email = document.getElementById('emailLogin').value;
    var password = document.getElementById('passwordLogin').value;

    //Firebase autentication
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(cred) {
        if (cred != null) {
            openGameWindow()
        }
    }).catch(function(error) {

        //Var erros codes
        var errorCode = error.code;
        var errorMessage = error.message;

        //Alerts to the user 
        alert("Error message: " + errorMessage + " " + "Error code: " + errorCode);

    });
}

//Register email 
function registerUser() {

    //Var email password and username
    var username = document.getElementById('usernameRegister').value;
    var email = document.getElementById('emailRegister').value;
    var password = document.getElementById('passwordRegister').value;

    //Firebase register
    firebase.auth().createUserWithEmailAndPassword(email, password).then(cred =>
        registerUserDb(cred, email, username)
    ).catch(function(error) {

        //Error codes 
        var errorCode = error.code;
        var errorMessage = error.message;

        //Alert the user to the erros
        alert("Error message: " + errorMessage + "Erro Code: " + errorCode);

    });

}

//Register user initial data in the db real time 
function registerUserDb(cred, email, username) {

    //Database ref user
    database.ref('users/' + cred.user.uid).set({
        username: username,
        email: email,
        highScore: 0
    });

    //Alert to the user to see that is register
    alert("You are register you can login now thank you!");

}

//Function open new window
function openGameWindow() {

    //Game window
    var gameWindow = window.open("gamePage.html");

}