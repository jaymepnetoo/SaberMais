const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  reportsStats: "/reports/stats",
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

async function loadReportsStats() {
  try {
    const stats = await http.get(endpoints.reportsStats);
    
    const summaryItems = document.querySelectorAll(".summary-item");
    if (summaryItems.length >= 4) {
      if (summaryItems[0].querySelector(".summary-value"))
        summaryItems[0].querySelector(".summary-value").textContent = stats.quizzesRealized || 0;
      if (summaryItems[1].querySelector(".summary-value"))
        summaryItems[1].querySelector(".summary-value").textContent = `${stats.averageParticipation || 0}%`;
      if (summaryItems[2].querySelector(".summary-value"))
        summaryItems[2].querySelector(".summary-value").textContent = stats.bestClass || "N/A";
      if (summaryItems[3].querySelector(".summary-value"))
        summaryItems[3].querySelector(".summary-value").textContent = stats.mostPopularQuiz || "N/A";
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", loadReportsStats);

