const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  material: (id) => `/materials/${id}`,
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
      throw new Error(message || "Não foi possível carregar o material.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
};

async function loadMaterial() {
  const urlParams = new URLSearchParams(window.location.search);
  const materialId = urlParams.get("id");

  if (!materialId) {
    document.getElementById("material-display-area").innerHTML =
      "<p>Material não encontrado.</p>";
    return;
  }

  try {
    const material = await http.get(endpoints.material(materialId));
    renderMaterial(material);
  } catch (error) {
    console.error(error);
    document.getElementById("material-display-area").innerHTML =
      `<p>Erro ao carregar material: ${error.message}</p>`;
  }
}

function renderMaterial(material) {
  const titleEl = document.getElementById("material-title");
  const subtitleEl = document.getElementById("material-subtitle");
  const displayArea = document.getElementById("material-display-area");

  if (titleEl) titleEl.textContent = material.title || "Material";
  if (subtitleEl)
    subtitleEl.textContent = `${material.subject || ""} - ${
      material.teacher || ""
    } - ${new Date(material.createdAt).toLocaleDateString("pt-BR")}`;

  if (displayArea) {
    switch (material.type) {
      case "pdf":
        displayArea.innerHTML = `<iframe src="${material.url}" width="100%" height="600px" style="border: none;"></iframe>`;
        break;
      case "video":
        displayArea.innerHTML = `<iframe src="${material.embedUrl || material.url}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe>`;
        break;
      case "link":
        displayArea.innerHTML = `<div style="padding: 20px;"><a href="${material.url}" target="_blank" rel="noopener">Abrir link externo: ${material.title}</a></div>`;
        break;
      default:
        displayArea.innerHTML = `<p>${material.description || "Conteúdo não disponível."}</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadMaterial);

