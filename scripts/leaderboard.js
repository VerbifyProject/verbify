import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://verbify-65b54-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings);
const database = getDatabase(app);
const usersRef = ref(database, "users");

function updateLeaderboard(currentLanguage) {
    const leaderboardContainer = document.getElementById("leaderboardContainer");
    if (!leaderboardContainer) {
        console.log("Leaderboard container not found.");
        return;
    }
    leaderboardContainer.innerHTML = "";

    get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();

            const usersArray = Object.entries(users).map(([username, userData]) => ({
                username,
                highScores: userData.highScores
            }));

            const sortedUsers = usersArray.sort((a, b) => {
                const userAScore = a.highScores[currentLanguage] || 0;
                const userBScore = b.highScores[currentLanguage] || 0;
                return userBScore - userAScore;
            });

            const hasScores = sortedUsers.some(userData => userData.highScores[currentLanguage]);

            if (!hasScores) {
                console.log("No scores available for " + currentLanguage);
                return;
            }

            sortedUsers.forEach((userData, index) => {
                const score = userData.highScores[currentLanguage] || 0;
                if (score === 0) {
                    return;
                }
                const leaderboardItem = document.createElement("li");
                leaderboardItem.textContent = `${index + 1}. ${userData.username} - ${score}`;
                leaderboardContainer.appendChild(leaderboardItem);
            });
        } else {
            console.log("No user data available.");
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error);
    });
}

const languageSelect = document.getElementById("languageSelect");
const leaderboardTitle = document.getElementById("leaderboardTitle");

languageSelect.addEventListener("change", function () {
    const selectedLanguage = languageSelect.value;

    leaderboardTitle.textContent = "Leaderboard (" +selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1) + ")";

    updateLeaderboard(selectedLanguage);
});

updateLeaderboard(languageSelect.value);

export { updateLeaderboard };