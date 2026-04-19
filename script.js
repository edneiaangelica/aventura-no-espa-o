const missions = [
  {
    label: "Nível 1 – Energia da nave",
    minCorrect: 2,
    hint: "Escolha apenas resultados corretos de adição para religar o painel.",
    getProgress: (correct) => Math.min(correct * 50, 100),
    questions: [
      { text: "12 + 7 = ?", answer: "19" },
      { text: "25 + 8 = ?", answer: "33" },
      { text: "9 + 14 = ?", answer: "23" }
    ]
  },
  {
    label: "Nível 2 – Mapa estelar",
    minCorrect: 2,
    hint: "Use deslocamentos na malha: direita aumenta x, cima aumenta y.",
    getProgress: (correct) => Math.min(correct * 50, 100),
    questions: [
      {
        text: "Partindo de (2,3), avance 2 para a direita e 1 para cima. Qual coordenada final? (formato x,y)",
        answer: "4,4"
      },
      {
        text: "Partindo de (5,1), volte 3 para a esquerda e suba 2. Coordenada final? (x,y)",
        answer: "2,3"
      },
      {
        text: "Partindo de (0,0), avance 4 para a direita e 5 para cima. Coordenada final? (x,y)",
        answer: "4,5"
      }
    ]
  },
  {
    label: "Nível 3 – Combustível",
    minCorrect: 2,
    hint: "Use cálculo mental e decomposição para somas maiores.",
    getProgress: (correct) => Math.min(correct * 50, 100),
    questions: [
      { text: "145 + 230 = ?", answer: "375" },
      { text: "298 + 157 = ?", answer: "455" },
      { text: "620 + 185 = ?", answer: "805" }
    ]
  }
];

const state = {
  level: 0,
  questionIndex: 0,
  correctInLevel: 0,
  timer: 60,
  timerId: null,
  started: false
};

const missionLabel = document.getElementById("mission-label");
const timerLabel = document.getElementById("timer");
const title = document.getElementById("question-title");
const questionText = document.getElementById("question-text");
const hint = document.getElementById("question-hint");
const answerForm = document.getElementById("answer-form");
const answerInput = document.getElementById("answer-input");
const startButton = document.getElementById("start-button");
const retryButton = document.getElementById("retry-button");
const feedbackScreen = document.getElementById("feedback-screen");
const energyProgress = document.getElementById("energy-progress");
const fuelProgress = document.getElementById("fuel-progress");

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `⏱️ ${minutes}:${remainingSeconds}`;
}

function normalizeAnswer(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function renderQuestion() {
  const mission = missions[state.level];
  const question = mission.questions[state.questionIndex];
  missionLabel.textContent = `Missão: ${mission.label}`;
  title.textContent = mission.label;
  questionText.textContent = question.text;
  hint.textContent = mission.hint;
  answerInput.value = "";
  answerInput.focus();
  showFeedback("", "");
}

function showFeedback(text, type) {
  if (!text) {
    feedbackScreen.className = "feedback hidden";
    feedbackScreen.textContent = "";
    return;
  }

  feedbackScreen.className = `feedback ${type}`;
  feedbackScreen.textContent = text;
}

function updateProgress() {
  const level1 = state.level > 0 ? 2 : state.correctInLevel;
  energyProgress.value = missions[0].getProgress(level1);

  const level3 = state.level === 2 ? state.correctInLevel : state.level > 2 ? 2 : 0;
  fuelProgress.value = missions[2].getProgress(level3);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function failMission(message) {
  stopTimer();
  state.started = false;
  answerInput.disabled = true;
  showFeedback(`❌ ${message}`, "error");
  retryButton.classList.remove("hidden");
}

function startTimer() {
  stopTimer();
  state.timer = 60;
  timerLabel.textContent = formatTime(state.timer);

  state.timerId = setInterval(() => {
    state.timer -= 1;
    timerLabel.textContent = formatTime(state.timer);

    if (state.timer <= 0) {
      failMission("Tempo esgotado! Tente novamente para continuar a missão.");
    }
  }, 1000);
}

function nextQuestion() {
  const mission = missions[state.level];

  if (state.correctInLevel >= mission.minCorrect) {
    state.level += 1;
    state.questionIndex = 0;
    state.correctInLevel = 0;

    if (state.level >= missions.length) {
      stopTimer();
      state.started = false;
      answerInput.disabled = true;
      missionLabel.textContent = "Missão concluída";
      title.textContent = "🎉 Vitória!";
      questionText.textContent = "A nave foi consertada e a tripulação voltou para a rota principal!";
      hint.textContent = "Excelente trabalho, cadete!";
      updateProgress();
      showFeedback("✅ Parabéns! Você completou todas as missões intergalácticas.", "success");
      retryButton.classList.remove("hidden");
      return;
    }

    updateProgress();
    renderQuestion();
    startTimer();
    return;
  }

  if (state.questionIndex < mission.questions.length - 1) {
    state.questionIndex += 1;
  } else {
    failMission("Você não atingiu o número mínimo de acertos para avançar.");
    return;
  }

  updateProgress();
  renderQuestion();
  startTimer();
}

function startGame() {
  stopTimer();
  state.level = 0;
  state.questionIndex = 0;
  state.correctInLevel = 0;
  state.started = true;

  answerInput.disabled = false;
  startButton.disabled = true;
  retryButton.classList.add("hidden");

  updateProgress();
  renderQuestion();
  startTimer();
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.started) {
    return;
  }

  const mission = missions[state.level];
  const question = mission.questions[state.questionIndex];
  const userAnswer = normalizeAnswer(answerInput.value);

  if (userAnswer === normalizeAnswer(question.answer)) {
    state.correctInLevel += 1;
    showFeedback("✅ Resposta correta!", "success");
    nextQuestion();
  } else {
    failMission("Resposta incorreta! Revise o cálculo e tente novamente.");
  }
});

startButton.addEventListener("click", startGame);
retryButton.addEventListener("click", () => {
  startButton.disabled = false;
  startGame();
});

updateProgress();
timerLabel.textContent = formatTime(60);
