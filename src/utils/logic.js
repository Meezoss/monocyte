// /src/utils/logic.js
import { questions } from "./questions.js";

const LS_ANSWERS = "monocyteAnswers";
const LS_INDEX   = "monocyteIndex";

let answers = JSON.parse(localStorage.getItem(LS_ANSWERS) || "[]");
let currentQuestionIndex = parseInt(localStorage.getItem(LS_INDEX) || "0", 10);

const questionBox  = document.querySelector(".question-box h1");
const answerLog    = document.getElementById("answer-log");
const buttonGroup  = document.querySelector(".button-group");

export function initialize() {
  // Restore any saved answers to the UI
  if (answers.length) {
    answers.forEach(({ q, a }) => appendLog(q, a));
  }

  // If already completed, show final state
  if (currentQuestionIndex >= questions.length) {
    finishFlow();
    return;
  }

  questionBox.textContent = questions[currentQuestionIndex];
}

export function handleAnswer(answer) {
  const q = questions[currentQuestionIndex];
  appendLog(q, answer);

  // Save state
  answers.push({ q, a: answer });
  localStorage.setItem(LS_ANSWERS, JSON.stringify(answers));

  currentQuestionIndex++;
  localStorage.setItem(LS_INDEX, String(currentQuestionIndex));

  // Next or finish
  if (currentQuestionIndex < questions.length) {
    questionBox.textContent = questions[currentQuestionIndex];
  } else {
    finishFlow();
  }
}

export function resetForm() {
  answers = [];
  currentQuestionIndex = 0;

  localStorage.removeItem(LS_ANSWERS);
  localStorage.removeItem(LS_INDEX);

  answerLog.innerHTML = "";
  buttonGroup.style.display = "flex";
  questionBox.textContent = questions[currentQuestionIndex];
  questionBox.scrollIntoView({ behavior: "smooth" });
}

function appendLog(question, answer) {
  const entry = document.createElement("div");
  entry.textContent = `Q: ${question} → A: ${answer}`;
  answerLog.appendChild(entry);
}

function finishFlow() {
  questionBox.textContent = "All done. Your answers have been logged.";
  buttonGroup.style.display = "none";
}
