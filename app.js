const screen = document.querySelector("#screen");
const history = document.querySelector("#history");
const keypad = document.querySelector(".keypad");

const calculator = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  expression: ""
};

const operatorLabels = {
  "+": "+",
  "-": "-",
  "*": "x",
  "/": "÷"
};

function updateDisplay() {
  screen.textContent = calculator.displayValue;
  history.textContent = calculator.expression || "\u00a0";
}

function inputDigit(digit) {
  const { displayValue, waitingForSecondOperand } = calculator;

  if (waitingForSecondOperand) {
    calculator.displayValue = digit;
    calculator.waitingForSecondOperand = false;
    return;
  }

  calculator.displayValue = displayValue === "0" ? digit : displayValue + digit;
}

function inputDecimal() {
  if (calculator.waitingForSecondOperand) {
    calculator.displayValue = "0.";
    calculator.waitingForSecondOperand = false;
    return;
  }

  if (!calculator.displayValue.includes(".")) {
    calculator.displayValue += ".";
  }
}

function handleOperator(nextOperator) {
  const inputValue = Number.parseFloat(calculator.displayValue);

  if (calculator.operator && calculator.waitingForSecondOperand) {
    calculator.operator = nextOperator;
    calculator.expression = `${formatNumber(calculator.firstOperand)} ${operatorLabels[nextOperator]}`;
    return;
  }

  if (calculator.firstOperand === null) {
    calculator.firstOperand = inputValue;
  } else if (calculator.operator) {
    const result = calculate(calculator.firstOperand, inputValue, calculator.operator);

    if (result === "Error") {
      resetCalculator("Error");
      return;
    }

    calculator.displayValue = String(result);
    calculator.firstOperand = result;
  }

  calculator.waitingForSecondOperand = true;
  calculator.operator = nextOperator;
  calculator.expression = `${formatNumber(calculator.firstOperand)} ${operatorLabels[nextOperator]}`;
}

function calculate(firstOperand, secondOperand, operator) {
  switch (operator) {
    case "+":
      return roundResult(firstOperand + secondOperand);
    case "-":
      return roundResult(firstOperand - secondOperand);
    case "*":
      return roundResult(firstOperand * secondOperand);
    case "/":
      return secondOperand === 0 ? "Error" : roundResult(firstOperand / secondOperand);
    default:
      return secondOperand;
  }
}

function performEquals() {
  if (!calculator.operator || calculator.waitingForSecondOperand) {
    return;
  }

  const firstOperand = calculator.firstOperand;
  const secondOperand = Number.parseFloat(calculator.displayValue);
  const result = calculate(firstOperand, secondOperand, calculator.operator);

  calculator.expression = `${formatNumber(firstOperand)} ${operatorLabels[calculator.operator]} ${formatNumber(secondOperand)} =`;

  if (result === "Error") {
    calculator.displayValue = "Error";
    calculator.firstOperand = null;
    calculator.operator = null;
    calculator.waitingForSecondOperand = true;
    return;
  }

  calculator.displayValue = String(result);
  calculator.firstOperand = result;
  calculator.operator = null;
  calculator.waitingForSecondOperand = true;
}

function deleteLastDigit() {
  if (calculator.waitingForSecondOperand || calculator.displayValue === "Error") {
    calculator.displayValue = "0";
    calculator.waitingForSecondOperand = false;
    return;
  }

  calculator.displayValue = calculator.displayValue.length > 1
    ? calculator.displayValue.slice(0, -1)
    : "0";
}

function applyPercent() {
  if (calculator.displayValue === "Error") {
    return;
  }

  calculator.displayValue = String(roundResult(Number.parseFloat(calculator.displayValue) / 100));
}

function resetCalculator(displayValue = "0") {
  calculator.displayValue = displayValue;
  calculator.firstOperand = null;
  calculator.operator = null;
  calculator.waitingForSecondOperand = false;
  calculator.expression = "";
}

function roundResult(number) {
  return Number.parseFloat(number.toFixed(10));
}

function formatNumber(number) {
  return Number.isInteger(number) ? String(number) : String(roundResult(number));
}

function handleButtonClick(event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.number) {
    inputDigit(button.dataset.number);
  } else if (button.dataset.operator) {
    handleOperator(button.dataset.operator);
  } else {
    handleAction(button.dataset.action);
  }

  updateDisplay();
}

function handleAction(action) {
  switch (action) {
    case "clear":
      resetCalculator();
      break;
    case "delete":
      deleteLastDigit();
      break;
    case "decimal":
      inputDecimal();
      break;
    case "percent":
      applyPercent();
      break;
    case "equals":
      performEquals();
      break;
    default:
      break;
  }
}

function handleKeyboardInput(event) {
  const { key } = event;

  if (/\d/.test(key)) {
    inputDigit(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key);
  } else if (key === "." || key === ",") {
    inputDecimal();
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    performEquals();
  } else if (key === "Backspace") {
    deleteLastDigit();
  } else if (key === "Escape") {
    resetCalculator();
  } else if (key === "%") {
    applyPercent();
  } else {
    return;
  }

  updateDisplay();
}

keypad.addEventListener("click", handleButtonClick);
document.addEventListener("keydown", handleKeyboardInput);
updateDisplay();
