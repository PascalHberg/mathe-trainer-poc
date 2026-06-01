// Mathe Trainer Logic
// Generiert Mathe-Aufgaben, validiert Antworten und verwaltet Score

class MathTrainer {
  constructor() {
    this.max = 30;
    this.correct = 0;
    this.wrong = 0;
    this.currentQuestion = null;
    this.currentAnswer = null;
    
    this.elements = {
      maxInput: document.getElementById('max'),
      frage: document.getElementById('frage'),
      antwort: document.getElementById('antwort'),
      form: document.getElementById('trainer-form'),
      stats: document.getElementById('stats'),
      bar: document.getElementById('bar'),
      quote: document.getElementById('quote')
    };

    this.init();
  }

  /**
   * Initialize the trainer
   */
  init() {
    // Generate first question
    this.generateQuestion();

    // Event listeners
    this.elements.maxInput.addEventListener('change', () => {
      this.max = parseInt(this.elements.maxInput.value) || 30;
      this.generateQuestion();
    });

    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.checkAnswer();
    });

    // Focus on answer input
    this.elements.antwort.focus();
  }

  /**
   * Generate a new math question
   */
  generateQuestion() {
    // Random operation: +, -, *
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    // Generate numbers based on operation
    let num1, num2;
    
    if (operation === '+') {
      num1 = Math.floor(Math.random() * this.max);
      num2 = Math.floor(Math.random() * this.max);
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * this.max);
      num2 = Math.floor(Math.random() * num1);
    } else if (operation === '*') {
      num1 = Math.floor(Math.random() * Math.sqrt(this.max)) + 1;
      num2 = Math.floor(Math.random() * Math.sqrt(this.max)) + 1;
    }

    // Calculate correct answer
    let answer;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
    }

    // Store question
    this.currentQuestion = {
      num1,
      num2,
      operation,
      answer
    };

    // Display question
    this.displayQuestion();

    // Clear input
    this.elements.antwort.value = '';
    this.elements.antwort.focus();
  }

  /**
   * Display the current question
   */
  displayQuestion() {
    const { num1, num2, operation } = this.currentQuestion;
    this.elements.frage.textContent = `${num1} ${operation} ${num2}`;
  }

  /**
   * Check if answer is correct
   */
  checkAnswer() {
    const userAnswer = parseInt(this.elements.antwort.value);
    const correctAnswer = this.currentQuestion.answer;

    if (isNaN(userAnswer)) {
      alert('Bitte eine gültige Nummer eingeben!');
      return;
    }

    // Update score
    if (userAnswer === correctAnswer) {
      this.correct++;
    } else {
      this.wrong++;
    }

    // Update UI
    this.updateStats();

    // Generate next question
    this.generateQuestion();
  }

  /**
   * Update statistics display
   */
  updateStats() {
    const total = this.correct + this.wrong;
    const percentage = total > 0 ? Math.round((this.correct / total) * 100) : 0;

    // Update stats text
    this.elements.stats.textContent = `Richtig: ${this.correct} | Falsch: ${this.wrong}`;

    // Update progress bar
    this.elements.bar.style.width = `${percentage}%`;

    // Update quote
    this.elements.quote.textContent = `Trefferquote: ${percentage}%`;
  }

  /**
   * Reset all stats
   */
  reset() {
    this.correct = 0;
    this.wrong = 0;
    this.updateStats();
    this.generateQuestion();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mathTrainer = new MathTrainer();
});
