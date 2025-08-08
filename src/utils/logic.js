// /src/utils/logic.js
import { questions } from "./questions.js";

const LS_ANSWERS = "monocyteAnswers";
const LS_INDEX   = "monocyteIndex";

let answers = JSON.parse(localStorage.getItem(LS_ANSWERS) || "[]");
let currentQuestionIndex = parseInt(localStorage.getItem(LS_INDEX) || "0", 10);

const questionBox  = document.querySelector(".question-box h1");
const answerLog    = document.getElementById("answer-log");
const buttonGroup  = document.querySelector(".button-group");

export async function initialize() {
  const res = await fetch("../utils/questions.json");
  questions = await res.json();

  if (answers.length) {
    answers.forEach(({ q, a }) => appendLog(q, a));
  }
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

export async function generateFeedback() {
  const aiBox = document.getElementById("ai-feedback");
  aiBox.textContent = "Generating summary…";

  try {
    const r = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    const data = await r.json();
    if (r.ok) {
      aiBox.textContent = data.summary;
    } else {
      aiBox.textContent = "Error generating feedback.";
      console.error(data);
    }
  } catch (err) {
    aiBox.textContent = "Network error.";
    console.error(err);
  }
}
