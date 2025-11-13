const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  overview: (teacherId) => `/teachers/${teacherId}/overview`,
  activities: (teacherId) => `/teachers/${teacherId}/activities`,
  classes: (teacherId) => `/teachers/${teacherId}/classes/summary`,
};

const state = {
  overview: null,
  activities: [],
  classes: [],
  isLoading: false,
};

const ui = {
  get totalStudents() {
    return document.getElementById("totalAlunos");
  },
  get totalQuizzes() {
    return document.getElementById("quizzesCriados");
  },
  get participationRate() {
    return document.getElementById("taxaParticipacao");
  },
  get averageScore() {
    return document.getElementById("mediaGeral");
  },
  get activitiesContainer() {
    return document.getElementById("atividadeRecente");
  },
  get classesContainer() {
    return document.getElementById("performanceTurmas");
  },
  get feedback() {
    return document.getElementById("professorFeedback");
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

function renderOverview(overview = {}) {
  if (ui.totalStudents) ui.totalStudents.textContent = overview.totalStudents ?? 0;
  if (ui.totalQuizzes) ui.totalQuizzes.textContent = overview.totalQuizzes ?? 0;
  if (ui.participationRate) ui.participationRate.textContent = `${overview.participationRate ?? 0}%`;
  if (ui.averageScore) ui.averageScore.textContent = `${overview.averageScore ?? 0}%`;
}

function renderActivities(activities = []) {
  if (!ui.activitiesContainer) return;
  ui.activitiesContainer.innerHTML = "";

  if (!activities.length) {
    ui.activitiesContainer.innerHTML = '<p class="empty-state">Nenhuma atividade recente.</p>';
    return;
  }

  activities.forEach((activity) => {
    const div = document.createElement("div");
    div.className = "activity-item";
    div.innerHTML = `
      <div class="activity-info">
        <h4>${activity.title}</h4>
        <p>${activity.className} • ${activity.participants} participantes</p>
      </div>
      <div class="activity-status ${String(activity.status).toLowerCase()}">${activity.status}</div>
    `;
    ui.activitiesContainer.appendChild(div);
  });
}

function renderClasses(classes = []) {
  if (!ui.classesContainer) return;
  ui.classesContainer.innerHTML = "";

  if (!classes.length) {
    ui.classesContainer.innerHTML = '<p class="empty-state">Nenhuma turma cadastrada.</p>';
    return;
  }

  classes.forEach((classSummary) => {
    const div = document.createElement("div");
    div.className = "performance-item";
    div.innerHTML = `
      <div class="class-info">
        <h4>${classSummary.name}</h4>
        <p>${classSummary.studentsCount} alunos</p>
      </div>
      <div class="performance-stats">
        <div class="performance-score">${classSummary.averageScore ?? 0}%</div>
        <div class="performance-detail">${classSummary.activeQuizzes ?? 0} quizzes ativos</div>
      </div>
    `;
    ui.classesContainer.appendChild(div);
  });
}

async function loadOverview() {
  setLoading(true);
  clearFeedback();

  try {
    const teacher = JSON.parse(localStorage.getItem("saber.user") || "{}");
    if (!teacher?.id) {
      throw new Error("Professor não identificado. Faça login novamente.");
    }

    const [overview, activities, classes] = await Promise.all([
      http.get(endpoints.overview(teacher.id)),
      http.get(endpoints.activities(teacher.id)),
      http.get(endpoints.classes(teacher.id)),
    ]);

    state.overview = overview;
    state.activities = Array.isArray(activities) ? activities : activities?.items || [];
    state.classes = Array.isArray(classes) ? classes : classes?.items || [];

    renderOverview(state.overview);
    renderActivities(state.activities);
    renderClasses(state.classes);
  } catch (error) {
    console.error(error);
    showFeedback(error.message, "error");
  } finally {
    setLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadOverview();
});

