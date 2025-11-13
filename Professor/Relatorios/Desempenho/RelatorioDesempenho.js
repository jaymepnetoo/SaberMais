const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  comparativeClasses: (teacherId) => `/teachers/${teacherId}/reports/classes`,
  evolution: (teacherId) => `/teachers/${teacherId}/reports/evolution`,
  institutional: (teacherId) => `/teachers/${teacherId}/reports/institutional`,
};

const state = {
  charts: {
    classes: null,
    evolution: null,
    institutional: null,
  },
  isLoading: false,
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
      throw new Error(message || "Não foi possível carregar os relatórios.");
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

function destroyChart(chartKey) {
  if (state.charts[chartKey]) {
    state.charts[chartKey].destroy();
    state.charts[chartKey] = null;
  }
}

function renderComparativeClasses(dataset = {}) {
  const canvas = document.getElementById("chartTurmas");
  if (!canvas || typeof Chart === "undefined") return;

  destroyChart("classes");

  state.charts.classes = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dataset.labels || [],
      datasets: [
        {
          label: "Média (%)",
          data: dataset.values || [],
          backgroundColor: dataset.backgroundColor || "#6366f1",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: dataset.title || "Comparativo entre Turmas" },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
        },
      },
    },
  });
}

function renderEvolution(dataset = {}) {
  const canvas = document.getElementById("chartEvolucao");
  if (!canvas || typeof Chart === "undefined") return;

  destroyChart("evolution");

  state.charts.evolution = new Chart(canvas, {
    type: "line",
    data: {
      labels: dataset.labels || [],
      datasets: [
        {
          label: dataset.seriesLabel || "Média Geral",
          data: dataset.values || [],
          borderColor: dataset.borderColor || "#4f46e5",
          backgroundColor: dataset.fillColor || "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: dataset.title || "Evolução das Notas" },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
        },
      },
    },
  });
}

function renderInstitutional(dataset = {}) {
  const canvas = document.getElementById("chartInstitucional");
  if (!canvas || typeof Chart === "undefined") return;

  destroyChart("institutional");

  state.charts.institutional = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: dataset.labels || [],
      datasets: [
        {
          label: dataset.seriesLabel || "Distribuição",
          data: dataset.values || [],
          backgroundColor: dataset.backgroundColor || ["#16a34a", "#facc15", "#ef4444"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: dataset.title || "Desempenho Institucional" },
        legend: { position: "bottom" },
      },
    },
  });
}

async function loadReports() {
  setLoading(true);

  try {
    const teacher = JSON.parse(localStorage.getItem("saber.user") || "{}");
    if (!teacher?.id) {
      throw new Error("Professor não identificado. Faça login novamente.");
    }

    const [classes, evolution, institutional] = await Promise.all([
      http.get(endpoints.comparativeClasses(teacher.id)),
      http.get(endpoints.evolution(teacher.id)),
      http.get(endpoints.institutional(teacher.id)),
    ]);

    renderComparativeClasses(classes);
    renderEvolution(evolution);
    renderInstitutional(institutional);
  } catch (error) {
    console.error(error);
    const feedback = document.getElementById("reportsFeedback");
    if (feedback) {
      feedback.textContent = error.message;
      feedback.className = "feedback feedback-error";
      feedback.hidden = false;
    }
  } finally {
    setLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadReports();
});

