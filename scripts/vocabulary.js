import { verbsSpanish, verbsGerman, verbsJapanese, verbsRussian } from "./words.js";

var vocabularyList = document.getElementById("vocabularyList");
var languageSelect = document.getElementById("languageSelect");

var currentLanguage = "spanish";

displayVerbs();

languageSelect.addEventListener("change", function() {
    currentLanguage = languageSelect.value;
    vocabularyList.innerHTML = ""
    verbsListPopulated = false;
    displayVerbs();
});

var verbsListPopulated = false;

function displayVerbs() {
    if (!verbsListPopulated) {
        var verbs;
        if (currentLanguage === "spanish") {
            verbs = verbsSpanish;
        } else if (currentLanguage === "german") {
            verbs = verbsGerman;
        } else if (currentLanguage === "russian") {
            verbs = verbsRussian;
        } else if (currentLanguage === "japanese") {
            verbs = verbsJapanese;
        }
    
        verbs.forEach(function(verb) {
            var listItem = document.createElement("li");
            listItem.textContent = verb[currentLanguage];
            listItem.dataset.english = verb.english;
            listItem.dataset.slovak = verb.slovak;
            listItem.dataset.language = currentLanguage;

            vocabularyList.appendChild(listItem);
    
            listItem.addEventListener("click", function() {
                translateVerb(listItem);
            });
        });

        verbsListPopulated = true;
    } else {
        var listItems = document.querySelectorAll("#vocabularyList li");
        listItems.forEach(function(item) {
            item.style.display = "block";
        });
    }
}

function translateVerb(listItem) {
    var verb = listItem.textContent;
    var englishTranslation = listItem.dataset.english;
    var slovakTranslation = listItem.dataset.slovak;
    var input = document.getElementById('searchInput');

    var card = document.createElement("div");
    card.classList.add("card");
    input.style.display = "none";

    var wordElement = document.createElement("h3");
    wordElement.classList.add("verb");
    wordElement.textContent = verb;

    var translationElement = document.createElement("p");
    translationElement.classList.add("english");
    translationElement.innerHTML = '<img src="../images/ukFlag.png" class="englishFlag">' + englishTranslation;

    var slovakTranslationeElement = document.createElement("p");
    slovakTranslationeElement.classList.add("slovak");
    slovakTranslationeElement.innerHTML = '<img src="../images/skFlag.png" class="slovakFlag">' + slovakTranslation;

    var backButton = document.createElement("i");
    backButton.classList.add("fas", "fa-arrow-left", "back-button");

    backButton.addEventListener("click", function() {
        card.style.display = "none";
        card.remove();
        input.style.display = "block";
    });

    card.appendChild(wordElement);
    card.appendChild(translationElement);
    card.appendChild(slovakTranslationeElement);
    card.appendChild(backButton);

    vocabularyList.appendChild(card);

    var listItems = document.querySelectorAll("#vocabularyList li");
    listItems.forEach(function(item) {
        item.style.display = "block";
    })
}

function searchVerbs() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("vocabularyList");
    li = ul.getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
        a = li[i];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            if (a.dataset.english.toUpperCase().indexOf(filter) > -1 || a.dataset.slovak.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
}