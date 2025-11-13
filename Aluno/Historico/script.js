const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  history: (studentId) => `/students/${studentId}/history`,
  quizAttempt: (attemptId) => `/quiz-attempts/${attemptId}`,
};

const state = {
  attempts: [],
  filters: {
    subject: "all",
    status: "all",
  },
  isLoading: false,
};

const ui = {
  get list() {
    return document.querySelector("#historyList");
  },
  get emptyState() {
    return document.querySelector("#historyEmptyState");
  },
  get template() {
    return document.querySelector("#historyItemTemplate");
  },
  get filters() {
    return document.querySelector(".history-filters");
  },
  get feedback() {
    return document.querySelector("#historyFeedback");
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
      throw new Error(message || "Não foi possível carregar o histórico.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
};

function setLoading(isLoading) {
  state.isLoading = isLoading;
  document.body.classList.toggle("is-loading", isLoading);
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

function renderHistory(attempts = []) {
  if (!ui.list) return;
  ui.list.innerHTML = "";

  if (!attempts.length) {
    ui.emptyState?.removeAttribute("hidden");
    return;
  }

  ui.emptyState?.setAttribute("hidden", "");

  attempts.forEach((attempt) => {
    const item = createHistoryItem(attempt);
    ui.list.appendChild(item);
  });
}

function createHistoryItem(attempt) {
  if (ui.template?.content) {
    const clone = ui.template.content.cloneNode(true);
    populateHistoryItem(clone, attempt);
    return clone;
  }

  const element = document.createElement("article");
  element.className = "history-item";
  element.dataset.attemptId = attempt.id;
  element.innerHTML = `
    <div class="history-info">
      <h3>${attempt.quizTitle}</h3>
      <p>${attempt.subjectName || "Disciplina geral"} • ${formatDate(attempt.completedAt)}</p>
    </div>
    <div class="history-meta">
      <span class="history-score">${attempt.score}%</span>
      <button class="history-btn result-btn" data-action="view-details">Ver Resultado Detalhado</button>
    </div>
  `;

  return element;
}

function populateHistoryItem(fragment, attempt) {
  const item = fragment.querySelector(".history-item");
  if (!item) return;

  item.dataset.attemptId = attempt.id;

  const title = fragment.querySelector("h3");
  if (title) title.textContent = attempt.quizTitle;

  const description = fragment.querySelector(".history-info p");
  if (description) description.textContent = `${attempt.subjectName || "Disciplina geral"} • ${formatDate(attempt.completedAt)}`;

  const score = fragment.querySelector(".history-score");
  if (score) score.textContent = `${attempt.score}%`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function applyFilters() {
  const filtered = state.attempts.filter((attempt) => {
    const subjectMatch = state.filters.subject === "all" || attempt.subjectId === state.filters.subject;
    const statusMatch = state.filters.status === "all" || attempt.status === state.filters.status;
    return subjectMatch && statusMatch;
  });

  renderHistory(filtered);
}

async function loadHistory() {
  setLoading(true);
  clearFeedback();

  try {
    const user = JSON.parse(localStorage.getItem("saber.user") || "{}");
    if (!user?.id) {
      throw new Error("Usuário não identificado. Faça login novamente.");
    }

    const data = await http.get(endpoints.history(user.id));
    state.attempts = Array.isArray(data) ? data : data.items || [];
    applyFilters();
  } catch (error) {
    console.error(error);
    showFeedback(error.message, "error");
    renderHistory([]);
  } finally {
    setLoading(false);
  }
}

async function handleViewDetails(attemptId) {
  if (!attemptId) return;
  showFeedback("Carregando resultado detalhado...", "info");

  try {
    const attempt = await http.get(endpoints.quizAttempt(attemptId));
    window.dispatchEvent(
      new CustomEvent("history:attemptLoaded", {
        detail: attempt,
      })
    );

    const detailUrl = attempt?.detailUrl || `../Historico/history-detail.html?id=${attemptId}`;
    setTimeout(() => {
      window.location.href = detailUrl;
    }, 300);
  } catch (error) {
    showFeedback(error.message, "error");
  }
}

function bindEvents() {
  if (ui.filters) {
    ui.filters.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[name='subjectFilter']")) {
        state.filters.subject = target.value;
        applyFilters();
      }

      if (target.matches("[name='statusFilter']")) {
        state.filters.status = target.value;
        applyFilters();
      }
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='view-details']");
    if (button) {
      const attemptId = button.closest(".history-item")?.dataset.attemptId;
      handleViewDetails(attemptId);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadHistory();
});

