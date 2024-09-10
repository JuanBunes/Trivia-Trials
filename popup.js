const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const answersContainer = document.getElementById('answers');
const question = document.getElementById('question');
const nextButton = document.getElementById('next-question');
const categorySelect = document.getElementById('categorySelect');
const difficultySelect = document.getElementById('difficultySelect');
const amountInput = document.getElementById('amountInput');
const startButton = document.getElementById('start-game');
const playAgainButton = document.getElementById('play-again');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let url = "";
let categories = [];

function fetchQuestions(fetchUrl) {
  fetch(fetchUrl)
    .then(response => response.json())
    .then(data => {
      questions = data.results;
      displayQuestion();
    })
    .catch(error => console.error('Error fetching questions:', error));
}

function displayQuestion() {
  if (currentQuestionIndex < questions.length) {
    const currentQuestion = questions[currentQuestionIndex];
    question.innerHTML = decodeHTML(currentQuestion.question);

    answersContainer.innerHTML = '';
    let allAnswers = [...currentQuestion.incorrect_answers];
    allAnswers.push(currentQuestion.correct_answer);
    allAnswers = shuffleArray(allAnswers);

    allAnswers.forEach(answer => {
      const answerButton = document.createElement('button');
      answerButton.textContent = decodeHTML(answer);
      answerButton.classList.add('answer-btn');
      answerButton.addEventListener('click', () => selectAnswer(answer, currentQuestion.correct_answer));
      answersContainer.appendChild(answerButton);
    });
  } else {
    showFinalScore();
  }
}

function selectAnswer(selected, correct) {
  const answerButtons = document.querySelectorAll('.answer-btn');
  const isCorrect = selected === correct;

  answerButtons.forEach(button => {
    if (button.textContent === correct) {
      button.classList.add('correct');
    } else if (button.textContent === selected) {
      button.classList.add('incorrect');
    }
  });

  setTimeout(() => { nextButton.style.display = 'block'; }, 1000);

  if (isCorrect) {
    score++;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function showFinalScore() {
  question.innerHTML = `<h3>Game Over!</h3><p>Correct Answers: ${score}</p>`;
  answersContainer.innerHTML = '';

  playAgainButton.classList.remove('hidden');
  playAgainButton.addEventListener('click', playAgain);
  questionContainer.appendChild(playAgainButton);
}

function fetchAvailableCategories() {
  fetch('https://opentdb.com/api_category.php')
    .then(response => response.json())
    .then(data => {
      categories = data.trivia_categories;
      fillCategories();
    })
    .catch(error => console.error('Error fetching categories:', error));
}

function fillCategories() {
  categories.sort((a, b) => a.name.localeCompare(b.name));
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

function getUrl(amount, category, difficulty) {
  let url = "https://opentdb.com/api.php?";
  url += `amount=${amount}`;
  if (category != 1) url += `&category=${category}`;
  if (difficulty != "any") url += `&difficulty=${difficulty}`;
  return url;
}

startButton.addEventListener('click', function() {
  const selectedCategory = categorySelect.options[categorySelect.selectedIndex].value;
  const selectedDifficulty = difficultySelect.options[difficultySelect.selectedIndex].value;
  const amount = parseInt(amountInput.value, 10);

  if (isNaN(amount) || amount < 1 || amount > 50) {
    alert('Please enter a number between 1 and 50 for the amount of questions.');
    return;
  }

  if (selectedCategory === "0") {
    alert('Please select a valid category.');
    return;
  }

  if (selectedDifficulty === "") {
    alert('Please select a difficulty level.');
    return;
  }

  url = getUrl(amount, selectedCategory, selectedDifficulty);
  hideComponents();
  fetchQuestions(url); 
});

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  nextButton.style.display = 'none';
  displayQuestion();
});

function mainMenu() {
  resetVar();
  fetchAvailableCategories();
  showComponents();
}

function resetVar() {
  questions = [];
  currentQuestionIndex = 0;
  score = 0;
  url = "";
  categories = [];
}

function showComponents() {
  categorySelect.classList.remove('hidden');
  difficultySelect.classList.remove('hidden');
  amountInput.classList.remove('hidden');
  startButton.classList.remove('hidden');
}

function hideComponents() {
  categorySelect.classList.add('hidden');
  difficultySelect.classList.add('hidden');
  amountInput.classList.add('hidden');
  startButton.classList.add('hidden');
  playAgainButton.classList.add('hidden');
}

function playAgain() {
  playAgainButton.classList.add('hidden');
  mainMenu();
}

// Initialize the game
mainMenu();
