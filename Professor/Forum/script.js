const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  forumStats: "/forum/stats",
  questions: "/forum/questions",
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
      throw new Error(message || "Não foi possível carregar as estatísticas.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
};

async function loadForumStats() {
  try {
    const stats = await http.get(endpoints.forumStats);
    
    const pendingEl = document.querySelector(".stat-number.pending");
    const answeredEl = document.querySelector(".stat-number.answered");

    if (pendingEl) pendingEl.textContent = stats.pendingQuestions || 0;
    if (answeredEl) answeredEl.textContent = stats.answeredThisMonth || 0;
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", loadForumStats);

