const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const routes = {
  login: "/auth/login",
  register: "/auth/register",
};

const http = {
  async post(path, payload) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJSON = contentType.includes("application/json");
    const data = isJSON ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = typeof data === "string" ? data : data?.message;
      throw new Error(errorMessage || "Ocorreu um erro inesperado.");
    }

    return data;
  },
};

const ui = {
  tabs: {
    login: document.getElementById("tab-login"),
    register: document.getElementById("tab-register"),
  },
  forms: {
    login: document.getElementById("form-login"),
    register: document.getElementById("form-register"),
  },
  feedback: {
    global: document.getElementById("global-feedback"),
    login: document.getElementById("login-feedback"),
    register: document.getElementById("register-feedback"),
  },
};

function setLoadingState(form, isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return;

  if (isLoading) {
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = submitButton.dataset.loadingText || "Enviando...";
    submitButton.disabled = true;
    form.classList.add("is-loading");
  } else {
    submitButton.textContent = submitButton.dataset.originalText || submitButton.textContent;
    submitButton.disabled = false;
    form.classList.remove("is-loading");
  }
}

function clearFeedback() {
  Object.values(ui.feedback).forEach((element) => {
    if (element) {
      element.textContent = "";
      element.className = element.className.replace(/\b(is-error|is-success)\b/g, "").trim();
    }
  });
}

function showFeedback(target, message, type = "error") {
  if (!target) return;
  target.textContent = message;
  target.classList.remove(type === "success" ? "is-error" : "is-success");
  target.classList.add(type === "success" ? "is-success" : "is-error");
}

function toggleTab(nextTab) {
  const isLogin = nextTab === "login";

  ui.tabs.login.classList.toggle("active", isLogin);
  ui.tabs.register.classList.toggle("active", !isLogin);
  ui.tabs.login.setAttribute("aria-selected", String(isLogin));
  ui.tabs.register.setAttribute("aria-selected", String(!isLogin));

  ui.forms.login.style.display = isLogin ? "block" : "none";
  ui.forms.register.style.display = isLogin ? "none" : "block";
  ui.forms.login.toggleAttribute("hidden", !isLogin);
  ui.forms.register.toggleAttribute("hidden", isLogin);
}

function serializeForm(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearFeedback();
  const form = event.currentTarget;
  const payload = serializeForm(form);

  setLoadingState(form, true);
  try {
    const data = await http.post(routes.login, payload);

    localStorage.setItem("saber.authToken", data?.token || "");
    localStorage.setItem("saber.user", JSON.stringify(data?.user ?? {}));

    showFeedback(ui.feedback.login, "Login realizado com sucesso!", "success");
    form.reset();

    window.dispatchEvent(
      new CustomEvent("auth:loginSuccess", {
        detail: data,
      })
    );
  } catch (error) {
    showFeedback(ui.feedback.login, error.message || "Não foi possível realizar o login.");
  } finally {
    setLoadingState(form, false);
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearFeedback();
  const form = event.currentTarget;
  const payload = serializeForm(form);

  setLoadingState(form, true);
  try {
    const data = await http.post(routes.register, payload);

    showFeedback(ui.feedback.register, "Cadastro realizado com sucesso!", "success");
    form.reset();

    window.dispatchEvent(
      new CustomEvent("auth:registerSuccess", {
        detail: data,
      })
    );

    toggleTab("login");
    showFeedback(ui.feedback.login, "Conta criada! Faça login para começar.", "success");
  } catch (error) {
    showFeedback(ui.feedback.register, error.message || "Não foi possível concluir o cadastro.");
  } finally {
    setLoadingState(form, false);
  }
}

function init() {
  ui.tabs.login?.addEventListener("click", () => {
    clearFeedback();
    toggleTab("login");
  });

  ui.tabs.register?.addEventListener("click", () => {
    clearFeedback();
    toggleTab("register");
  });

  ui.forms.login?.addEventListener("submit", handleLoginSubmit);
  ui.forms.register?.addEventListener("submit", handleRegisterSubmit);

  clearFeedback();
}

document.addEventListener("DOMContentLoaded", init);

