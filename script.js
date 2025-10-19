// Initialize Feather Icons
feather.replace();

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const scoreElement = document.getElementById('score');
const currentQuestionElement = document.getElementById('current-question');
const progressBar = document.getElementById('progress-bar');
const finalScoreElement = document.getElementById('final-score');
const maxScoreElement = document.getElementById('max-score');
const resultMessageElement = document.getElementById('result-message');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');

// Quiz Variables
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedCategory = '9';
let selectedDifficulty = 'easy';

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
});
restartBtn.addEventListener('click', resetQuiz);

// Fetch Questions from API
async function getQuestions() {
    const apiUrl = `https://opentdb.com/api.php?amount=10&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

// Start Quiz
async function startQuiz() {
    selectedCategory = categorySelect.value;
    selectedDifficulty = difficultySelect.value;
    
    // Disable start button while fetching
    startBtn.disabled = true;

    questions = await getQuestions();

    // Re-enable button after fetch completes
    startBtn.disabled = false;

    if (questions.length === 0) {
        alert('Failed to load questions. Please try again.');
        return;
    }

    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = score;
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    maxScoreElement.textContent = questions.length;

    showQuestion();
}

// Show Current Question
function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    const questionNo = currentQuestionIndex + 1;
    currentQuestionElement.textContent = questionNo;
    
    // Update progress bar
    const progressPercentage = (questionNo / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Decode HTML entities in question
    questionElement.textContent = decodeHtmlEntities(currentQuestion.question);

    // Combine correct and incorrect answers and shuffle
    const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    shuffleArray(answers);

    // Create answer buttons
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = decodeHtmlEntities(answer);
        // Apply Tailwind classes for styling
        button.classList.add('w-full', 'p-4', 'rounded-lg', 'border', 'border-purple-200', 'text-left', 'transition-all', 'duration-200', 'hover:bg-purple-50', 'hover:border-purple-300', 'focus:outline-none', 'focus:ring-2', 'focus:ring-purple-500');
        
        // Use a wrapper function to ensure correct scope for correct answer check
        const isCorrect = answer === currentQuestion.correct_answer;
        button.addEventListener('click', () => selectAnswer(button, isCorrect, decodeHtmlEntities(currentQuestion.correct_answer)));
        
        optionsElement.appendChild(button);
    });
}

// Reset Question State
function resetState() {
    nextBtn.classList.add('hidden');
    while (optionsElement.firstChild) {
        optionsElement.removeChild(optionsElement.firstChild);
    }
}

// Select Answer
function selectAnswer(selectedButton, isCorrect, correctAnswerText) {
    // Disable all buttons
    Array.from(optionsElement.children).forEach(button => {
        button.disabled = true;
        // Check if button text matches the selected or the actual correct answer
        const isThisCorrect = button.textContent === correctAnswerText;

        if (button.textContent === selectedButton.textContent) {
            // This is the button the user clicked
            button.classList.add(isCorrect ? 'bg-green-100' : 'bg-red-100', 'border', isCorrect ? 'border-green-400' : 'border-red-400', isCorrect ? 'text-green-800' : 'text-red-800');
        } else if (isThisCorrect) {
            // This is the correct answer, but not selected
            button.classList.add('bg-green-100', 'border-green-400', 'text-green-800');
        }
        
        // Remove hover effects after selection
        button.classList.remove('hover:bg-purple-50', 'hover:border-purple-300');
    });

    // Add pulse animation to selected button
    selectedButton.classList.add('option-selected');

    // Update score if correct
    if (isCorrect) {
        score++;
        scoreElement.textContent = score;
    }

    // Show next button
    nextBtn.classList.remove('hidden');
}

// Show Results
function showResults() {
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    finalScoreElement.textContent = score;
    
    // Display result message based on score
    const percentage = (score / questions.length) * 100;
    let message = '';
    if (percentage >= 80) {
        message = 'Quiz Master! You nailed it! 🎉';
    } else if (percentage >= 60) {
        message = 'Great job! You know your stuff. 👍';
    } else if (percentage >= 40) {
        message = 'Not bad! Keep learning. 📚';
    } else {
        message = 'Keep practicing! You\'ll get better. 💪';
    }
    resultMessageElement.textContent = message;
}

// Reset Quiz
function resetQuiz() {
    resultsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    progressBar.style.width = '0%';
    // Re-initialize Feather Icons for the start screen just in case
    feather.replace(); 
}

// Helper Functions
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}