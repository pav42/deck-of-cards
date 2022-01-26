// variable declarations
var deck_id, card_img, prev_card_value, curr_card_value, isHigher, end_of_deck;
var score = 0;

// const declarations
const noOfBestScores = 10;
const localStorageItem = 'bestScores';

//Setting value of card for checking higher/lower
const cardValueMap = new Map();
cardValueMap.set('A', 1);
cardValueMap.set('2', 2);
cardValueMap.set('3', 3);
cardValueMap.set('4', 4);
cardValueMap.set('5', 5);
cardValueMap.set('6', 6);
cardValueMap.set('7', 7);
cardValueMap.set('8', 8);
cardValueMap.set('9', 9);
cardValueMap.set('0', 10);
cardValueMap.set('J', 11);
cardValueMap.set('Q', 12);
cardValueMap.set('K', 13);


// To get a new deck of cards 
const fetchNewDeck = () => {
    axios.get('https://deckofcardsapi.com/api/deck/new/draw/?count=1')
        .then(response => {
            deck_id = response.data.deck_id;
            card_img = response.data.cards[0].image;
            prev_card_value = response.data.cards[0].code
            //Extracting first character for checking higher/lower value comparison
            prev_card_value = prev_card_value.charAt(0)
            showHide('messageConatiner', 'none');
            showHide('startNewGame', 'none');
            showHide('guessContainer', 'block');
            showHide('displayBestScore', 'block');
            //Display Deck ID
            displayDeckId();
            //Show current score
            showCurrentScore();
            //Show Inital card
            card(card_img);
            //Show Best Scores
            showBestScores()
        })
        .catch(error => console.error(error));
};

// To draw a new card from the deck of cards
drawCard = () => {
    axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`)
        .then(response => {
            deck_id = response.data.deck_id;
            card_img = response.data.cards[0].image;
            end_of_deck = response.data.remaining;
            curr_card_value = response.data.cards[0].code;
            //Extracting first character for checking higher/lower value
            curr_card_value = curr_card_value.charAt(0)
            //Show card
            card(card_img);
            //calculating score
            calcScore();
            //Reached the end of deck
            endOfDeck();
        })
        .catch(error => console.error(error));
}

// Display deck id
const displayDeckId = () => {
    document.getElementById('showDeckID').innerText = `Deck ID: ${deck_id}`;
}

// create card UI
const card = () => {
    document.getElementById('showCard').innerHTML = `
        <div class='card fade-in'>
            <img src= ${card_img}>
        </div>  
    `;
}

// guess higher/Lower
const guessVal = (obj) => {
    if (obj == 'isHigher') {
        isHigher = 1;
    } else {
        isHigher = 0;
    }
    drawCard();
}

//end the game
endgame = (hasWon) => {
    showHide('guessContainer', 'none');
    showHide('startNewGame', 'block');    
    showHide('messageConatiner', 'block');
    if (hasWon) {
        userMessage('Congratulations! You have completed the deck!');
    } else {
        userMessage('Sorry, incorrect guess. Game over.');
    }
    checkBestScore(score);
    score = 0;
    deck_id = null;
}

// Display message to user
const userMessage = (msg) => {
    document.getElementById('messageConatiner').innerText = msg;
}

// End of Deck
const endOfDeck = () => {
    if (end_of_deck == 0) {
        endgame(true);
    }
}

// Show/Hide elements
const showHide = (iD, val) => {
    document.getElementById(iD).style.display = val;
}

// Calculate score
const calcScore = () => {
    let curr = cardValueMap.get(curr_card_value);
    let prev = cardValueMap.get(prev_card_value);
    
    if (((isHigher) && (curr >= prev)) || ((!isHigher) && (curr <= prev))) {
        score += 1;
        prev_card_value = curr_card_value;
        showCurrentScore();
    } else {
        endgame(false);
    }
}

const showCurrentScore = () => {
    document.getElementById('ShowCurrentScore').innerText = `Your score: ${score}`;
}

const toggleDisplay = (iD) => {
    let container = document.getElementById(iD);
    let bestScoreTxt = document.getElementById('displayBestScore');
    if (container.style.display == 'block') {
        container.style.display = 'none';
        bestScoreTxt.innerText = 'Show best score';
    } else {
        container.style.display = 'block';
        bestScoreTxt.innerText = 'Hide best score';
    }
}

// Local storage

// check if the current score is the best score and add it to local storage if it is.
const checkBestScore = (score) => {
    // get best scores from local storage.
    const bestScores = JSON.parse(localStorage.getItem(localStorageItem)) ?? [];

    // last score in the list will be the lowest score.
    const lowestScore = bestScores[noOfBestScores - 1]?.score ?? 0;

    if (score > lowestScore) {
        saveBestScore(score, bestScores);
        showBestScores();
    }
}

// saves the current score to best scores list in local storage.
const saveBestScore =(score, bestScores) => {
    // prompt user for a name.
    const name = prompt('You got a high score! Enter name:');

    if(name == null){
        return;
    }

    const newScore = {
        score,
        name
    };

    // Add current score to the list of best scores.
    bestScores.push(newScore);

    // Sort the best score list.
    bestScores.sort((a, b) => b.score - a.score);

    // Splice the list to max entries
    bestScores.splice(noOfBestScores);

    // save the list to local storage
    localStorage.setItem(localStorageItem, JSON.stringify(bestScores));
};

// shows the best scores.
const showBestScores = () => {
    const bestScores = JSON.parse(localStorage.getItem(localStorageItem)) ?? [];
    var displayScore;

    displayScore = bestScores
        .map((tmpScore) => `<li>${tmpScore.score} - ${tmpScore.name} </li>`)
        .join('');

    document.getElementById('bestScoresList').innerHTML = displayScore;
    showHide('clearSavedBestScores', 'block');
}

// clears the best scores from storage.
const clearBestScores = () => {
    localStorage.removeItem (localStorageItem);
    document.getElementById('bestScoresList').innerHTML = "";
}
