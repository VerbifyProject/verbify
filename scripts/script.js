import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import disallowedUsernames from './cursewords.js';
import { updateLeaderboard } from './leaderboard.js'
import { verbsSpanish, verbsGerman, verbsRussian, verbsJapanese } from "./words.js";

const appSettings = {
    databaseURL: "https://verbify-65b54-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings);
const database = getDatabase(app);
const leaderboardRef = ref(database, "leaderboard");

document.addEventListener("DOMContentLoaded", function () {
    var usernameInput = document.getElementById("usernameInput");
    usernameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            startApp();
        }
    });

    var savedUsername = getCookie("username");
    if (savedUsername) {
        var expiration = parseInt(getCookie("username_expiration"));
        var currentTime = new Date().getTime();
        if (currentTime < expiration) {
            usernameInput.value = savedUsername;
            startApp();
        } else {
            setCookie("username", "", -1);
            setCookie("username_expiration", "", -1);
        }
    }
});

function startApp() {
    var username = document.getElementById("usernameInput").value.trim();
    var userRef = ref(database, `users/${username}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            var userData = snapshot.val();
            highScore = userData.highScores[currentLanguage] || 0;
            scoreDisplay.textContent = score + " / " + highScore;
        } else {
            highScore = 0;
            set(userRef.child("highScores").child(currentLanguage), 0);
            scoreDisplay.textContent = score + " / " + highScore;
        }
    }).catch((error) => {
        console.error("Error getting user data:", error);
    });

    if (username === "") {
        warningSound.play();
        alert("Please enter your name to start the game.");
        return;
    } else if (username.length > 10) {
        warningSound.play();
        alert("Username cannot be longer than 10 characters.");
        return;
    } else if (disallowedUsernames.includes(username.toLowerCase())) {
        warningSound.play();
        alert("This username is not allowed!");
        return;
    }

    var expirationTime = new Date();
    expirationTime.setTime(expirationTime.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 day
    setCookie("username", username, 1);
    setCookie("username_expiration", expirationTime.getTime(), 1);

    score = 0;
    highScore = parseInt(getCookie(username + "_highScore")) || 0;

    document.getElementById("logoutAppBtn").style.display = "block";
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";
    document.getElementById("navbarContainer").style.display = "flex";
    document.getElementById("usernameDisplay").textContent = "Welcome, " + username + "!";
    scoreDisplay.textContent = score + " / " + highScore;
}

function logoutFromApp() {
    setCookie("username", "", -1);
    setCookie("username_expiration", "", -1);

    document.getElementById("logoutAppBtn").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("quizContainer").style.display = "none";
    document.getElementById("navbarContainer").style.display = "none";
    document.getElementById("usernameDisplay").textContent = "";
}

var username = "";
var verbDisplay = document.getElementById("verbDisplay");
var translationInput = document.getElementById("translationInput");
var checkBtn = document.getElementById("checkBtn");
var result = document.getElementById("result");
var scoreDisplay = document.getElementById("scoreDisplay");
var languageSelect = document.getElementById("languageSelect");
var volumeSlider = document.getElementById("volumeSlider");
var correctSound = new Audio('./sounds/correct-sound.mp3');
var incorrectSound = new Audio('./sounds/incorrect-sound.mp3');
var highScoreSound = new Audio('./sounds/highscore-sound.mp3');
var warningSound = new Audio('./sounds/warning-sound.mp3');
var startAppBtn = document.getElementById("startAppBtn");
var logoutAppBtn = document.getElementById("logoutAppBtn");
var score = 0;
var highScore = getCookie("highScore") || 0;
var volumeBtn = document.getElementById("volumeBtn");
var volumeMenu = document.getElementById("volumeMenu");
var currentLanguage = "spanish";
var answerTimer;
var usedIndices = [];
var currentIndex = -1;

volumeBtn.addEventListener("click", function () {
    if (volumeMenu.style.display === "block") {
        volumeMenu.style.display = "none";
    } else {
        volumeMenu.style.display = "block";
    }
});

languageSelect.addEventListener("change", function () {
    currentLanguage = languageSelect.value;
    displayRandomVerb();

    var username = document.getElementById("usernameInput").value.trim();
    var userHighScoreRef = ref(database, `users/${username}/highScores/${currentLanguage}`);

    get(userHighScoreRef).then((snapshot) => {
        var userHighScore = snapshot.exists() ? snapshot.val() : 0;
        scoreDisplay.textContent = score + " / " + userHighScore;
    }).catch((error) => {
        console.error("Error getting user high score:", error);
    });
});

startAppBtn.addEventListener("click", function () {
    startApp();
})

logoutAppBtn.addEventListener("click", function () {
    logoutFromApp();
})

function playCorrectSound() {
    correctSound.currentTime = 0;
    correctSound.play();
}

function playIncorrectSound() {
    incorrectSound.currentTime = 0;
    incorrectSound.play();
}

function playHighScoreSound() {
    highScoreSound.currentTime = 0;
    highScoreSound.play();
}

function playWarningSound() {
    warningSound.currentTime = 0;
    warningSound.play();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayRandomVerb() {
    clearInterval(answerTimer);

    let verbs;
    if (currentLanguage === "spanish") {
        verbs = verbsSpanish;
    } else if (currentLanguage === "german") {
        verbs = verbsGerman;
    } else if (currentLanguage === "russian") {
        verbs = verbsRussian;
    } else if (currentLanguage === "japanese") {
        verbs = verbsJapanese;
    }

    if (currentIndex === -1 || currentIndex >= verbs.length - 1) {
        shuffleArray(verbs);
        currentIndex = 0;
    } else {
        currentIndex++;
    }

    let randomVerb = verbs[currentIndex];
    verbDisplay.textContent = randomVerb[currentLanguage];

    translationInput.value = "";
    translationInput.focus();
    result.textContent = "";

    var timeLeft = 15;
    var timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = "Time left: " + timeLeft + "s";

    answerTimer = setInterval(function () {
        timeLeft--;
        timerDisplay.textContent = "Time left: " + timeLeft + "s";
        if (timeLeft <= 0) {
            clearInterval(answerTimer);
            handleIncorrectTranslation("Time's up! No answer provided.", null, true);
        }
    }, 1000);
}

function checkTranslation() {
    var inputText = translationInput.value.trim().toLowerCase();
    var currentVerb;
    var correctTranslation;

    clearTimeout(answerTimer);

    if (currentLanguage === "spanish") {
        currentVerb = verbDisplay.textContent.toLowerCase();
        var currentVerbIndex = verbsSpanish.findIndex(verb => verb.spanish.toLowerCase() === currentVerb);
        if (currentVerbIndex !== -1) {
            correctTranslation = verbsSpanish[currentVerbIndex].english.toLowerCase();
            if (inputText === correctTranslation) {
                handleCorrectTranslation();
                return;
            } else {
                var slovakTranslation = verbsSpanish[currentVerbIndex].slovak.toLowerCase();
                if (inputText === slovakTranslation) {
                    handleCorrectTranslation();
                    return;
                } else {
                    handleIncorrectTranslation(correctTranslation);
                    return;
                }
            }
        }
    }else if (currentLanguage === "german") {
        currentVerb = verbDisplay.textContent.toLowerCase();
        var currentVerbIndex = verbsGerman.findIndex(verb => verb.german.toLowerCase() === currentVerb);
        if (currentVerbIndex !== -1) {
            correctTranslation = verbsGerman[currentVerbIndex].english.toLowerCase();
            if (inputText === correctTranslation) {
                handleCorrectTranslation();
                return;
            } else {
                var slovakTranslation = verbsGerman[currentVerbIndex].slovak.toLowerCase();
                if (inputText === slovakTranslation) {
                    handleCorrectTranslation();
                    return;
                } else {
                    handleIncorrectTranslation(correctTranslation);
                    return;
                }
            }
        }
    } else if (currentLanguage === "russian") {
        currentVerb = verbDisplay.textContent.toLowerCase();
        var currentVerbIndex = verbsRussian.findIndex(verb => verb.russian.toLowerCase() === currentVerb);
        if (currentVerbIndex !== -1) {
            correctTranslation = verbsRussian[currentVerbIndex].english.toLowerCase();
            if (inputText === correctTranslation) {
                handleCorrectTranslation();
                return;
            } else {
                var slovakTranslation = verbsRussian[currentVerbIndex].slovak.toLowerCase();
                if (inputText === slovakTranslation) {
                    handleCorrectTranslation();
                    return;
                } else {
                    handleIncorrectTranslation(correctTranslation);
                    return;
                }
            }
        }
    } else if (currentLanguage === "japanese") {
        currentVerb = verbDisplay.textContent.toLowerCase();
        var currentVerbIndex = verbsJapanese.findIndex(verb => verb.japanese.toLowerCase() === currentVerb);
        if (currentVerbIndex !== -1) {
            correctTranslation = verbsJapanese[currentVerbIndex].english.toLowerCase();
            if (inputText === correctTranslation) {
                handleCorrectTranslation();
                return;
            } else {
                var slovakTranslation = verbsJapanese[currentVerbIndex].slovak.toLowerCase();
                if (inputText === slovakTranslation) {
                    handleCorrectTranslation();
                    return;
                } else {
                    handleIncorrectTranslation(correctTranslation);
                    return;
                }
            }
        }
    }

    if (correctTranslation && inputText === correctTranslation) {
        handleCorrectTranslation();
    } else if (correctTranslation) {
        handleIncorrectTranslation(correctTranslation);
    }
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function handleCorrectTranslation() {
    var translation = translationInput.value.trim();
    if (translation === "") {
        alert("Please enter the translation before proceeding.");
        playWarningSound();
        return;
    }

    result.textContent = "Correct!";
    score++;

    var username = document.getElementById("usernameInput").value.trim();
    var userHighScoreRef = ref(database, `users/${username}/highScores/${currentLanguage}`);

    get(userHighScoreRef).then((snapshot) => {
        var userHighScore = snapshot.exists() ? snapshot.val() : 0;

        if (score > userHighScore) {
            set(userHighScoreRef, score).then(() => {
                console.log("High score updated successfully.");
                scoreDisplay.textContent = score + " / " + score;
            }).catch((error) => {
                console.error("Error updating high score:", error);
            });

            playHighScoreSound();
        } else {
            scoreDisplay.textContent = score + " / " + userHighScore;
        }

        updateLeaderboard(languageSelect.value);
    }).catch((error) => {
        console.error("Error getting user high score:", error);
    });

    playCorrectSound();

    displayRandomVerb();
}

var isCooldownActive = false;

function handleIncorrectTranslation(correctTranslation, defaultMessage, isTimerExpired = false) {
    var translation = translationInput.value.trim();

    if (isCooldownActive) {
        return;
    }

    if (!isTimerExpired && !defaultMessage && translation === "") {
        alert("Please enter the translation before proceeding.");
        playWarningSound();
        return;
    }

    if (isTimerExpired) {
        result.textContent = "Time's up! No answer provided.";
    } else {
        result.textContent = "Incorrect. The correct translation is: " + correctTranslation;
    }

    var username = document.getElementById("usernameInput").value.trim();
    var userHighScoreRef = ref(database, `users/${username}/highScores/${currentLanguage}`);

    get(userHighScoreRef).then((snapshot) => {
        var userHighScore = snapshot.exists() ? snapshot.val() : 0;
        scoreDisplay.textContent = score + " / " + userHighScore;
    }).catch((error) => {
        console.error("Error getting user high score:", error);
    });

    score = 0;
    playIncorrectSound();

    isCooldownActive = true;
    setTimeout(function () {
        isCooldownActive = false;
        displayRandomVerb();
    }, 1500);
}

checkBtn.addEventListener("click", checkTranslation);

translationInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        checkTranslation();
    }
});

volumeSlider.addEventListener("input", function () {
    var volume = volumeSlider.value / 100;
    correctSound.volume = volume;
    incorrectSound.volume = volume;
    highScoreSound.volume = volume;
    warningSound.volume = volume;
});

displayRandomVerb();