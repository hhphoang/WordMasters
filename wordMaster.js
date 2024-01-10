const letters = document.querySelectorAll(".scoreboard-letter");
const LoadingDiv = document.querySelector(".info-bar");


async function init() {

    const answerLength = 5;
    let currentLetter = "";
    let currentRow = 0;
    let isLoading = true;

    isLoading = false;
    setLoading(isLoading);

    const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
    const respond = await promise.json();
    const word = respond.word.toUpperCase();
    const wordPart = word.split("");
    let done = false;
    let ROUNDS = 6;


    document.addEventListener("keydown", function (event) {

        if (done || isLoading) {
            return;
        }
        const action = event.key;
        if (action === "Enter") {
            commit();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            //do nothingo
            return;
        }
    })

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    function addLetter(letter) {
        if (currentLetter.length < answerLength) {
            currentLetter += letter;
        }
        else {
            currentLetter = currentLetter.substring(0, currentLetter.length - 1) + letter;
        }
        letters[currentRow * answerLength + currentLetter.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentLetter.length != answerLength) {
            //do nothing
            return;
        }

        //checks valid word
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentLetter })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        if (!validWord) {
            markInvalidWord();
            alert("valid word");
        }

        isLoading = false;
        setLoading(false);


        const guessPart = currentLetter.split("");
        const map = makeMap(wordPart);


        for (let i = 0; i < answerLength; i++) {
            if (wordPart[i] === guessPart[i]) {
                letters[currentRow * answerLength + i].classList.add("correct");
                map[guessPart[i]]--;
            }
        }
        for (let i = 0; i < answerLength; i++) {
            if (wordPart[i] === guessPart[i]) {

            } else if (wordPart.includes(guessPart[i]) && map[guessPart[i]] > 0) {
                letters[currentRow * answerLength + i].classList.add("close");
                map[guessPart[i]]--;
            } else {
                letters[currentRow * answerLength + i].classList.add("wrong");
            }
        }
        currentRow++;

        if (currentLetter === word) {
            alert('You win!');
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`You lose, the answer was ${word}`);
            done = true;

        }
        currentLetter = "";
    }
    function backspace() {
        currentLetter = currentLetter.substring(0, currentLetter.length - 1);
        letters[currentRow * answerLength + currentLetter.length].innerText = "";
    }


    function markInvalidWord() {
        for (let i = 0; i < answerLength; i++) {
            letters[currentRow * answerLength + i].classList.remove("invalid");
            setTimeout(() => letters[currentRow * answerLength + i].classList.add("invalid"), 10)
        }
    }

    function setLoading(isLoading) {
        LoadingDiv.classList.toggle("hidden", !isLoading);
    }

    function makeMap(arr) {
        const object = {};
        for (let i = 0; i < answerLength; i++) {
            const letter = arr[i];
            if (object[letter]) {
                object[letter]++;
            } else object[letter] = 1;
        }
        return object;
    }
};

init();