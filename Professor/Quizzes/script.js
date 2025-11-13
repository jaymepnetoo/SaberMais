const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  quizzes: "/quizzes",
  quiz: (id) => `/quizzes/${id}`,
  deleteQuiz: (id) => `/quizzes/${id}`,
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
      throw new Error(message || "Não foi possível carregar os quizzes.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
  delete(path) {
    return this.request(path, { method: "DELETE" });
  },
};

async function loadQuizzes() {
  const quizList = document.getElementById("quiz-list");
  const noQuizzesMsg = document.getElementById("no-quizzes-msg");

  try {
    const quizzes = await http.get(endpoints.quizzes);
    
    if (!quizzes || quizzes.length === 0) {
      if (noQuizzesMsg) noQuizzesMsg.style.display = "block";
      if (quizList) quizList.innerHTML = "";
      return;
    }

    if (noQuizzesMsg) noQuizzesMsg.style.display = "none";
    if (quizList) {
      quizList.innerHTML = quizzes
        .map(
          (quiz) => `
        <div class="quiz-card">
          <div class="quiz-header">
            <h3>${quiz.title || quiz.titulo || "Sem título"}</h3>
            <span class="quiz-status ${quiz.status || "draft"}">${quiz.status || "Rascunho"}</span>
          </div>
          <div class="quiz-details">
            <span>📚 ${quiz.subject || quiz.materia || "Sem matéria"}</span>
            <span>👥 ${quiz.className || quiz.turma || "Sem turma"}</span>
            <span>❓ ${quiz.questionsCount || quiz.questions?.length || 0} questões</span>
          </div>
          <div class="quiz-actions">
            <button class="btn-secondary" onclick="editQuiz('${quiz.id}')">Editar</button>
            <button class="btn-danger" onclick="deleteQuiz('${quiz.id}')">Excluir</button>
          </div>
        </div>
      `
        )
        .join("");
    }
  } catch (error) {
    console.error(error);
    if (quizList) {
      quizList.innerHTML = `<p>Erro ao carregar quizzes: ${error.message}</p>`;
    }
  }
}

function editQuiz(id) {
  window.location.href = `CriarQuiz/CriarQuiz.html?id=${id}`;
}

async function deleteQuiz(id) {
  if (!confirm("Tem certeza que deseja excluir este quiz?")) return;

  try {
    await http.delete(endpoints.deleteQuiz(id));
    await loadQuizzes();
  } catch (error) {
    console.error(error);
    alert(`Erro ao excluir quiz: ${error.message}`);
  }
}

document.addEventListener("DOMContentLoaded", loadQuizzes);

