const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  classes: "/classes",
  class: (id) => `/classes/${id}`,
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
      throw new Error(message || "Não foi possível carregar as turmas.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
};

async function loadClasses() {
  const classesGrid = document.querySelector(".classes-grid");

  try {
    const classes = await http.get(endpoints.classes);
    
    if (!classes || classes.length === 0) {
      if (classesGrid) {
        classesGrid.innerHTML = "<p>Nenhuma turma cadastrada ainda.</p>";
      }
      return;
    }

    if (classesGrid) {
      classesGrid.innerHTML = classes
        .map(
          (cls) => `
        <div class="class-card">
          <div class="class-header">
            <h3>${cls.name || cls.nome || "Sem nome"}</h3>
            <p>${cls.studentsCount || cls.alunos || 0} alunos matriculados</p>
          </div>
          <div class="class-stats">
            <div class="stat-row">
              <span>Média da turma:</span>
              <span class="stat-value">${cls.averageScore || cls.media || 0}%</span>
            </div>
            <div class="stat-row">
              <span>Quizzes ativos:</span>
              <span class="stat-value">${cls.activeQuizzes || cls.quizzes || 0}</span>
            </div>
          </div>
          <button class="manage-btn" onclick="manageClass('${cls.id}')">👥 Gerenciar Turma</button>
        </div>
      `
        )
        .join("");
    }
  } catch (error) {
    console.error(error);
    if (classesGrid) {
      classesGrid.innerHTML = `<p>Erro ao carregar turmas: ${error.message}</p>`;
    }
  }
}

function manageClass(id) {
  window.location.href = `manage-class.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadClasses);

