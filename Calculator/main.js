/**
 * Calculator Class
 * Manages calculator operations and display state.
 */
class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  // Reset calculator to its default state
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
  }

 // Remove the last entered character
  delete() {
    if (this.currentOperand === '0') return;
    if (this.currentOperand.length === 1) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  // Store the selected operator for calculation
  appendNumber(number) {
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  // Chooses operator (+, -, ×, ÷) and sets up the screen
  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  // Performs calculations and records to history log
  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          alert("Error: Division by zero is undefined.");
          this.clear();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Capture dynamic history logs before resetting variables
    addHistoryItem(`${prev} ${this.operation} ${current}`, computation);

    this.currentOperand = this.formatDisplayNumber(computation);
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  // Helper function to format displays dynamically (e.g., handles long floats)
  formatDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = '0';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  // Updates visual layout values
  updateDisplay() {
    this.currentOperandTextElement.innerText = this.currentOperand;
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.previousOperand} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = '';
    }
  }
}

// DOM Element Selectors

const numberButtons = document.querySelectorAll('.btn.number');
const operatorButtons = document.querySelectorAll('.btn.operator');
const equalsButton = document.getElementById('equals');
const deleteButton = document.getElementById('delete');
const clearButton = document.getElementById('clear');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

/* ==========================================
   Click Event Listeners
   ========================================== */
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operatorButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.getAttribute('data-operator'));
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener('click', () => {
  calculator.compute();
  calculator.updateDisplay();
});

clearButton.addEventListener('click', () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener('click', () => {
  calculator.delete();
  calculator.updateDisplay();
});

/* ==========================================
   Keyboard Input Support
   ========================================== */
document.addEventListener('keydown', e => {
  let key = e.key;
  let targetButton;

  if (key >= '0' && key <= '9' || key === '.') {
    calculator.appendNumber(key);
    targetButton = Array.from(numberButtons).find(btn => btn.innerText === key);
  } else if (key === '+' || key === '-') {
    calculator.chooseOperation(key);
    targetButton = Array.from(operatorButtons).find(btn => btn.getAttribute('data-operator') === key);
  } else if (key === '*') {
    calculator.chooseOperation('×');
    targetButton = Array.from(operatorButtons).find(btn => btn.getAttribute('data-operator') === '×');
  } else if (key === '/') {
    e.preventDefault(); // Prevents browser search actions
    calculator.chooseOperation('÷');
    targetButton = Array.from(operatorButtons).find(btn => btn.getAttribute('data-operator') === '÷');
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calculator.compute();
    targetButton = equalsButton;
  } else if (key === 'Backspace') {
    calculator.delete();
    targetButton = deleteButton;
  } else if (key === 'Escape') {
    calculator.clear();
    targetButton = clearButton;
  }

  calculator.updateDisplay();

  // Highlight physical key interactions
  if (targetButton) {
    targetButton.classList.add('keyboard-pressed');
    setTimeout(() => targetButton.classList.remove('keyboard-pressed'), 100);
  }
});

/* ==========================================
   Themes and Custom Sub-Panels
   ========================================== */
// Dark / Light Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  document.body.classList.toggle('dark-theme');
});

// Sliding History Panel Toggle
const historyToggle = document.getElementById('history-toggle');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

historyToggle.addEventListener('click', () => {
  historyPanel.classList.toggle('open');
});

// Close history panel if clicked outside
document.addEventListener('click', (e) => {
  if (!historyPanel.contains(e.target) && e.target !== historyToggle) {
    historyPanel.classList.remove('open');
  }
});

// Populate & Update Calculations History
function addHistoryItem(expression, result) {
  const emptyMsg = historyList.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  const li = document.createElement('li');
  li.innerHTML = `
    <div class="expr">${expression} =</div>
    <div class="res">${result}</div>
  `;
  
  // Click on any history line to load values back onto display
  li.addEventListener('click', () => {
    calculator.currentOperand = result.toString();
    calculator.shouldResetScreen = true;
    calculator.updateDisplay();
    historyPanel.classList.remove('open');
  });

  historyList.prepend(li);
}

// Clear calculations history
clearHistoryBtn.addEventListener('click', () => {
  historyList.innerHTML = '<li class="empty-msg">No history yet</li>';
});