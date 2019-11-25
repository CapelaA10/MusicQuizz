// Get a reference to the database service
var database = firebase.database();

//Get higher Score
var higherScoreInTheDb = 0;

//On load the page
$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            //Hello to the user
            helloUser(user.uid);

        } else {

            //User not logged info
            alert("User not logged in");

            //Game window
            window.open("index.html");

        }
    });
});

//Class fullquestion 
class FullQuestion {

    //Constructor
    constructor(question, correct, allIncorrect) {
        var d = decodeURI(question);
        var uri_dec = decodeURIComponent(d);
        this.questionRe = uri_dec;
        this.correct = decodeURIComponent(correct);
        this.allIncorrect = [decodeURIComponent(allIncorrect[0]), decodeURIComponent(allIncorrect[1]), decodeURIComponent(allIncorrect[2])];
    }

}

//Var global Score
var scoreN = 0;

//Var update text score now
var textScoreNow = document.getElementById('scoreNow');
textScoreNow.textContent = "Score now: " + scoreN;

//Inicializaing a empty questions
var fullQuestions;

//Get all the questions and answers
askApi();

//Ask for the questions in the api
function askApi() {

    //Ajax get query
    $.ajax({
        url: "https://opentdb.com/api.php?amount=50&category=12&difficulty=hard&type=multiple&encode=url3986",
        type: 'GET',
        dataType: 'json', // added data type
        success: function(res) {

            //Temp array to get the classes temp
            var tempArray = [];

            //Adding each on of the question full to the array of the class full question
            for (var i = 0; i <= 49; i++) {

                //Temp class to get the question
                let tempClass = new FullQuestion(res['results'][i]['question'],
                    res['results'][i]['correct_answer'],
                    res['results'][i]['incorrect_answers']
                );

                //Adding all of the results
                tempArray.push(tempClass);

            }

            //Passing all questions from the temp array to the final array
            fullQuestions = tempArray;

            //Change questions
            changeQuestion();
        }
    });
}

//Saying hello to the user and getting the higher value of the user in the game
function helloUser(userUid) {

    //High score in the user db
    var highScoreInTheDb = document.getElementById('higherScoreDb');

    //Ref to the username
    var ref = database.ref('users/' + userUid + '/username');

    //Get the data of the username
    ref.once("value", function(snapshot) {

        //Get Data
        var data = snapshot.val();

        //Alert the user hello
        alert("Hello " + data);

    })

    //Ref to the highScore
    ref = database.ref('users/' + userUid + '/highScore');

    //Get the data of the highScore
    ref.once("value", function(snapshot) {

        //Var data of the ref
        var data = snapshot.val();

        //Change the high Score in the user interface
        highScoreInTheDb.textContent = "Higher Score: " + data;

        //Higer score in the db to var
        higherScoreInTheDb = data;

    })
}

//Correct ans to check the question
var correctAnswer = "";

//Function to change the questions
function changeQuestion() {

    //Buttons
    var bttOne = document.getElementById('bttOne');
    var bttTwo = document.getElementById('bttTwo');
    var bttThree = document.getElementById('bttThree');
    var bttFourth = document.getElementById('bttFourth');

    //Show and enable the btts to the user click
    showBtts();
    enableBtts();

    //Question var
    var questionVar = document.getElementById('questionToA');

    //Random number of the question
    var randomNumber = Math.floor(Math.random() * fullQuestions.length);

    //Random right question
    var randomRight = Math.floor(Math.random() * 3);

    //Change the text content of the question
    questionVar.textContent = fullQuestions[randomNumber].questionRe;

    //Question number
    var questionNumber = document.getElementById('questionNumber');
    questionNumber.textContent = "Question number: " + randomNumber;

    //Check where the question will be and chaging the text in the buttons
    if (randomRight === 0) {
        bttOne.textContent = fullQuestions[randomNumber].correct;
        bttTwo.textContent = fullQuestions[randomNumber].allIncorrect[0];
        bttThree.textContent = fullQuestions[randomNumber].allIncorrect[1];
        bttFourth.textContent = fullQuestions[randomNumber].allIncorrect[2];
    } else if (randomRight === 1) {
        bttOne.textContent = fullQuestions[randomNumber].allIncorrect[0];
        bttTwo.textContent = fullQuestions[randomNumber].correct;
        bttThree.textContent = fullQuestions[randomNumber].allIncorrect[1];
        bttFourth.textContent = fullQuestions[randomNumber].allIncorrect[2];
    } else if (randomRight === 2) {
        bttOne.textContent = fullQuestions[randomNumber].allIncorrect[0];
        bttTwo.textContent = fullQuestions[randomNumber].allIncorrect[1];
        bttThree.textContent = fullQuestions[randomNumber].correct;
        bttFourth.textContent = fullQuestions[randomNumber].allIncorrect[2];
    } else if (randomRight === 3) {
        bttOne.textContent = fullQuestions[randomNumber].allIncorrect[0];
        bttTwo.textContent = fullQuestions[randomNumber].allIncorrect[1];
        bttThree.textContent = fullQuestions[randomNumber].allIncorrect[2];
        bttFourth.textContent = fullQuestions[randomNumber].correct;
    }

    //Get the correct answer
    correctAnswer = fullQuestions[randomNumber].correct.toString();
}

//Function to check if the answer is right
function checkAnswer(answerBtt) {
    var correctA = correctAnswer;
    var answerUser = answerBtt.textContent;

    //If the answer is correct
    if (answerUser === correctA) {

        //Disable and hidden the buttons to the user
        disableBtts();
        hiddenBtts();

        //Add one to score
        scoreN += 1;

        //Change the score
        changeScoreNow(scoreN);

        //Change the question
        changeQuestion();

    } else {

        //Disable and hidden the buttons to the user
        disableBtts();
        hiddenBtts();

        //Firebase get the user status and ref to db
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {

                //Ref to the highScore
                var ref = database.ref('users/' + user.uid + '/highScore');

                //Get the data of the highScore
                ref.once("value", function(snapshot) {

                    //Var data of the ref
                    var data = snapshot.val();

                    //If the score is higher then the higher
                    if (scoreN > data) {

                        //Get user and if the user exist then resgister the new highscore
                        firebase.auth().onAuthStateChanged(function(user) {
                            if (user) {

                                //Register the new high score
                                registerHighScore(scoreN, user.uid);
                            }
                        });

                        //Change the higher score in the game
                        changeHighScoreFinal(scoreN);
                    }
                })
            }
        });

        //Reset game
        resetGame();

    }
}

//Register the highScore
function registerHighScore(highScoreNew, userUid) {
    database.ref().child('users/' + userUid + "/highScore").set(highScoreNew);
}

//Function to change the score now
function changeScoreNow(scoreNow) {

    //Get text area
    var textArea = document.getElementById('scoreNow');

    //Change the text
    textArea.textContent = "Score Now: " + scoreNow;

}

//Function to reset the game score
function resetGlobalScore() {

    //Set global score to 0
    scoreN = 0;

}

//Function reset the game 
function resetGame() {

    //Buttons
    var bttOne = document.getElementById('bttOne');
    var bttTwo = document.getElementById('bttTwo');
    var bttThree = document.getElementById('bttThree');
    var bttFourth = document.getElementById('bttFourth');

    //Var last score
    var scoreLast = "Game over, Score: " + scoreN;

    //Question var
    var questionVar = document.getElementById('questionToA');

    //Chaging btt text to the last score
    bttOne.textContent = scoreLast;
    bttTwo.textContent = scoreLast;
    bttThree.textContent = scoreLast;
    bttFourth.textContent = scoreLast;

    //Question var to game over
    questionVar.textContent = scoreLast;

    // stop for sometime if needed
    setTimeout(resetBoxes, 5000);
}

function resetBoxes() {
    //Reseting the global score
    resetGlobalScore();

    //Change the score now
    changeScoreNow(scoreN);

    //Reset the questions
    changeQuestion();
}

//Function to disable the buttons
function disableBtts() {

    //Buttons
    var bttOne = document.getElementById('bttOne');
    var bttTwo = document.getElementById('bttTwo');
    var bttThree = document.getElementById('bttThree');
    var bttFourth = document.getElementById('bttFourth');

    //Disable the buttons
    bttOne.disabled = true;
    bttTwo.disabled = true;
    bttThree.disabled = true;
    bttFourth.disabled = true;

}

//Function to enable the buttons
function enableBtts() {

    //Buttons
    var bttOne = document.getElementById('bttOne');
    var bttTwo = document.getElementById('bttTwo');
    var bttThree = document.getElementById('bttThree');
    var bttFourth = document.getElementById('bttFourth');

    //Enable the buttons
    bttOne.disabled = false;
    bttTwo.disabled = false
    bttThree.disabled = false;
    bttFourth.disabled = false;
}

//Function to hide the btts
function hiddenBtts() {

    //Buttons
    var bttOne = document.getElementById('bttOne');
    var bttTwo = document.getElementById('bttTwo');
    var bttThree = document.getElementById('bttThree');
    var bttFourth = document.getElementById('bttFourth');

    //Hide the buttons
    bttOne.hidden = true;
    bttTwo.hidden = true;
    bttThree.hidden = true;
    bttFourth.hidden = true;

}

//Show btts
function showBtts() {

    //Buttons
    var bttOne = document.getElementById('bttOne');
    var bttTwo = document.getElementById('bttTwo');
    var bttThree = document.getElementById('bttThree');
    var bttFourth = document.getElementById('bttFourth');

    //Show btts
    bttOne.hidden = false;
    bttTwo.hidden = false;
    bttThree.hidden = false;
    bttFourth.hidden = false;

}

//Function to change the higher score
function changeHighScoreFinal(score) {

    //High score in the user db
    var highScoreInTheDb = document.getElementById('higherScoreDb');

    //Change the high Score in the user interface
    highScoreInTheDb.textContent = "Higher Score: " + score;

    //User not logged info
    alert("Congratulations your high score has changed");
}