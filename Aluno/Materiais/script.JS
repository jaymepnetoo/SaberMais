const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  dashboard: (studentId) => `/students/${studentId}/dashboard`,
  quizzes: (studentId) => `/students/${studentId}/quizzes`,
  ranking: (classId) => `/classes/${classId}/ranking`,
  logout: "/auth/logout",
};

const state = {
  stats: null,
  quizzes: [],
  ranking: [],
  isLoading: false,
};

const ui = {
  get statsCards() {
    return document.querySelectorAll(".stat-card .stat-number");
  },
  get quizList() {
    return document.querySelector(".quiz-list");
  },
  get rankingList() {
    return document.querySelector(".ranking-list");
  },
  get progressFill() {
    return document.querySelector(".progress-fill");
  },
  get progressMessage() {
    return document.querySelector(".progress-message");
  },
  get progressCurrent() {
    return document.querySelector(".progress-current");
  },
  get progressPercentage() {
    return document.querySelector(".progress-percentage");
  },
  get logoutBtn() {
    return document.querySelector(".logout-btn");
  },
  get feedback() {
    return document.querySelector("#materialsFeedback");
  },
};

const http = {
  async request(path, { method = "GET", body, headers } = {}) {
    const token = localStorage.getItem("saber.authToken");
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const isJSON = contentType.includes("application/json");
    const data = isJSON ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof data === "string" ? data : data?.message;
      throw new Error(message || "Não foi possível carregar os dados.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
  post(path, body) {
    return this.request(path, { method: "POST", body });
  },
};

function setLoading(isLoading) {
  state.isLoading = isLoading;
  document.body.classList.toggle("is-loading", isLoading);
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: 500,
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3200);
}

function showFeedback(message, type = "info") {
  if (!ui.feedback) return;
  ui.feedback.textContent = message;
  ui.feedback.className = `feedback feedback-${type}`;
  ui.feedback.hidden = false;
}

function clearFeedback() {
  if (!ui.feedback) return;
  ui.feedback.hidden = true;
  ui.feedback.textContent = "";
}

async function loadDashboard() {
  setLoading(true);
  clearFeedback();

  try {
    const user = JSON.parse(localStorage.getItem("saber.user") || "{}");
    if (!user?.id) {
      throw new Error("Usuário não identificado. Faça login novamente.");
    }

    const [dashboard, quizzes, ranking] = await Promise.all([
      http.get(endpoints.dashboard(user.id)),
      http.get(endpoints.quizzes(user.id)),
      user.classId ? http.get(endpoints.ranking(user.classId)) : Promise.resolve([]),
    ]);

    state.stats = dashboard?.stats;
    state.quizzes = Array.isArray(quizzes) ? quizzes : quizzes?.items || [];
    state.ranking = Array.isArray(ranking) ? ranking : ranking?.items || [];

    renderStats(state.stats);
    renderQuizzes(state.quizzes);
    renderRanking(state.ranking);
    updateProgress(state.stats?.weeklyProgress);
  } catch (error) {
    console.error(error);
    showFeedback(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function renderStats(stats = {}) {
  if (!ui.statsCards.length) return;
  const values = [
    stats.quizzesCompleted ?? 0,
    stats.totalPoints ?? 0,
    stats.averageScore ? `${Math.round(stats.averageScore)}%` : "0%",
    stats.badgesCount ?? 0,
  ];

  ui.statsCards.forEach((card, index) => {
    if (values[index] !== undefined) {
      card.textContent = values[index];
    }
  });
}

function renderQuizzes(quizzes = []) {
  if (!ui.quizList) return;
  ui.quizList.innerHTML = "";

  if (!quizzes.length) {
    ui.quizList.innerHTML = '<p class="empty-state">Nenhum quiz disponível no momento.</p>';
    return;
  }

  quizzes.forEach((quiz) => {
    const wrapper = document.createElement("div");
    wrapper.className = `quiz-item ${quiz.completed ? "completed" : ""}`;
    wrapper.innerHTML = `
      <div class="quiz-header">
        <h3>${quiz.title}</h3>
        <span class="quiz-status ${quiz.completed ? "completed" : "pending"}">
          ${quiz.completed ? "Concluído" : "Pendente"}
        </span>
      </div>
      <div class="quiz-details">
        <span class="quiz-subject">📘 ${quiz.subjectName || "Disciplina"}</span>
        <span class="quiz-questions">❓ ${quiz.questionsCount || 0} questões</span>
        <span class="quiz-time">⏱️ ${quiz.duration || 0} min</span>
      </div>
      ${
        quiz.completed
          ? `<div class="quiz-score">Pontuação: ${quiz.score ?? 0}%</div>
             <button class="quiz-btn result-btn" data-action="view-result" data-quiz-id="${quiz.id}">Ver Resultado</button>`
          : `<button class="quiz-btn start-btn" data-action="start-quiz" data-quiz-id="${quiz.id}">
               <span class="btn-icon">▶️</span> Iniciar Quiz
             </button>`
      }
    `;
    ui.quizList.appendChild(wrapper);
  });
}

function renderRanking(ranking = []) {
  if (!ui.rankingList) return;
  ui.rankingList.innerHTML = "";

  if (!ranking.length) {
    ui.rankingList.innerHTML = '<p class="empty-state">O ranking da turma ainda não está disponível.</p>';
    return;
  }

  ranking.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = `ranking-item${entry.isCurrentUser ? " current-user" : ""}`;
    item.innerHTML = `
      <div class="rank-position">${index + 1}</div>
      <div class="rank-avatar">${entry.avatar || "👤"}</div>
      <div class="rank-name">${entry.name}</div>
      <div class="rank-score">⭐ ${entry.points}</div>
    `;
    ui.rankingList.appendChild(item);
  });
}

function updateProgress(progress = {}) {
  if (!ui.progressFill) return;
  const percentage = Math.min(Math.max(progress?.percentage ?? 0, 0), 100);
  const target = `${percentage}%`;

  requestAnimationFrame(() => {
    ui.progressFill.style.width = target;
  });

  if (ui.progressPercentage) ui.progressPercentage.textContent = target;
  if (ui.progressCurrent) ui.progressCurrent.textContent = `${progress?.completed ?? 0} de ${progress?.goal ?? 0} quizzes`;

  if (ui.progressMessage) {
    ui.progressMessage.textContent =
      percentage >= 100
        ? "Meta semanal concluída! 🚀"
        : `Faltam ${Math.max((progress?.goal ?? 0) - (progress?.completed ?? 0), 0)} quizzes para atingir sua meta.`;
  }
}

async function handleStartQuiz(quizId, button) {
  if (!quizId) return;
  button?.setAttribute("disabled", "true");
  button?.classList.add("loading");
  button?.setAttribute("aria-busy", "true");
  showNotification("Carregando quiz...", "info");

  try {
    window.location.href = `../Quizzes/take-quiz.html?id=${quizId}`;
  } catch (error) {
    button?.classList.remove("loading");
    button?.removeAttribute("disabled");
    button?.removeAttribute("aria-busy");
    showNotification(error.message, "error");
  }
}

async function handleViewResult(quizId) {
  if (!quizId) return;
  showNotification("Abrindo resultado...", "info");
  setTimeout(() => {
    window.location.href = `../Historico/history-detail.html?quiz=${quizId}`;
  }, 300);
}

async function handleLogout() {
  try {
    await http.post(endpoints.logout);
  } catch (error) {
    console.warn("Falha ao finalizar sessão no servidor:", error);
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../index.html";
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;

    const quizId = action.dataset.quizId;

    switch (action.dataset.action) {
      case "start-quiz":
        handleStartQuiz(quizId, action);
        break;
      case "view-result":
        handleViewResult(quizId);
        break;
      default:
        break;
    }
  });

  ui.rankingList?.addEventListener("click", (event) => {
    const item = event.target.closest(".ranking-item");
    if (item && !item.classList.contains("current-user")) {
      const name = item.querySelector(".rank-name")?.textContent || "Aluno";
      showNotification(`Abrindo perfil de ${name}`, "info");
    }
  });

  ui.logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    if (confirm("Deseja realmente sair?")) {
      handleLogout();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadDashboard();
});

