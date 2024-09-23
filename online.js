// game.js
const database = firebase.database();
const gameRef = database.ref('game');

let playerNumber = null;
let yourChoice = '';
let opponentChoice = '';

// Funkce pro přiřazení hráče
function assignPlayer() {
  gameRef.transaction(currentData => {
    if (currentData === null) {
      currentData = { player1: { choice: null }, player2: { choice: null } };
    }
    if (!currentData.player1) {
      playerNumber = 1;
      currentData.player1 = { choice: null };
    } else if (!currentData.player2) {
      playerNumber = 2;
      currentData.player2 = { choice: null };
    }
    return currentData;
  }, (error, committed, snapshot) => {
    if (error) {
      console.error('Transaction failed abnormally!', error);
    } else if (!committed) {
      console.log('Transaction aborted');
    } else {
      if (playerNumber) {
        document.getElementById('player-number').textContent = playerNumber;
        document.getElementById('player-section').classList.remove('hidden');
        document.getElementById('status').classList.add('hidden');
      } else {
        document.getElementById('status').textContent = 'Hra je plná. Zkuste to později.';
      }
    }
  });
}

// Monitorování změn v databázi
gameRef.on('value', snapshot => {
  const data = snapshot.val();
  if (data) {
    if (playerNumber === 1) {
      opponentChoice = data.player2 ? data.player2.choice : null;
    } else if (playerNumber === 2) {
      opponentChoice = data.player1 ? data.player1.choice : null;
    }

    if (yourChoice && opponentChoice) {
      determineWinner();
      resetChoices();
    }
  }
});

// Výběr tahů
document.querySelectorAll('.choice').forEach(button => {
  button.addEventListener('click', () => {
    yourChoice = button.getAttribute('data-choice');
    if (playerNumber === 1) {
      gameRef.child('player1').update({ choice: yourChoice });
    } else if (playerNumber === 2) {
      gameRef.child('player2').update({ choice: yourChoice });
    }
    document.getElementById('status').textContent = 'Čekání na soupeře...';
    document.getElementById('player-section').classList.add('hidden');
  });
});

// Funkce pro určení vítěze
function determineWinner() {
  let result = '';
  if (yourChoice === opponentChoice) {
    result = 'Remíza!';
  } else if (
    (yourChoice === 'kámen' && opponentChoice === 'nůžky') ||
    (yourChoice === 'nůžky' && opponentChoice === 'papír') ||
    (yourChoice === 'papír' && opponentChoice === 'kámen')
  ) {
    result = 'Vyhrál jsi!';
  } else {
    result = 'Prohrál jsi!';
  }

  document.getElementById('your-choice').textContent = yourChoice;
  document.getElementById('opponent-choice').textContent = opponentChoice;
  document.getElementById('game-result').textContent = result;
  document.getElementById('result-section').classList.remove('hidden');
}

// Funkce pro resetování tahů
function resetChoices() {
  gameRef.child('player1').update({ choice: null });
  gameRef.child('player2').update({ choice: null });
  yourChoice = '';
  opponentChoice = '';
}

// Restart hry
document.getElementById('play-again').addEventListener('click', () => {
  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('player-section').classList.remove('hidden');
  document.getElementById('status').classList.add('hidden');
});

// Inicializace při načtení stránky
assignPlayer();
