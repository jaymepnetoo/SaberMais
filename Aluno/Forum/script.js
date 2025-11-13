const API_BASE_URL = window.__SABER_API_BASE_URL__ || "http://localhost:3000/api";

const endpoints = {
  questions: "/forum/questions",
  question: (id) => `/forum/questions/${id}`,
  likeQuestion: (id) => `/forum/questions/${id}/like`,
  answers: (questionId) => `/forum/questions/${questionId}/answers`,
  createAnswer: (questionId) => `/forum/questions/${questionId}/answers`,
  likeAnswer: (questionId, answerId) => `/forum/questions/${questionId}/answers/${answerId}/like`,
  filters: "/forum/categories",
};

const state = {
  questions: [],
  selectedQuestionId: null,
  filters: {
    category: "all",
    sort: "recent",
  },
  isLoading: false,
};

const selectors = {
  searchInput: "#searchInput",
  filtersBtn: "#filtersBtn",
  newQuestionBtn: "#newQuestionBtn",
  questionList: "#questionsList",
  answersList: "#answersList",
  emptyState: "#forumEmptyState",
  questionTemplate: "#questionCardTemplate",
  answerTemplate: "#answerCardTemplate",
  globalFeedback: "#forumFeedback",
};

const ui = {
  get searchInput() {
    return document.querySelector(selectors.searchInput);
  },
  get filtersBtn() {
    return document.querySelector(selectors.filtersBtn);
  },
  get newQuestionBtn() {
    return document.querySelector(selectors.newQuestionBtn);
  },
  get questionList() {
    return document.querySelector(selectors.questionList);
  },
  get answersList() {
    return document.querySelector(selectors.answersList);
  },
  get emptyState() {
    return document.querySelector(selectors.emptyState);
  },
  get questionTemplate() {
    return document.querySelector(selectors.questionTemplate);
  },
  get answerTemplate() {
    return document.querySelector(selectors.answerTemplate);
  },
  get globalFeedback() {
    return document.querySelector(selectors.globalFeedback);
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
      throw new Error(message || "Não foi possível completar a requisição.");
    }

    return data;
  },
  get(path) {
    return this.request(path);
  },
  post(path, body) {
    return this.request(path, { method: "POST", body });
  },
  patch(path, body) {
    return this.request(path, { method: "PATCH", body });
  },
};

function showFeedback(message, type = "info") {
  if (!ui.globalFeedback) return;
  ui.globalFeedback.textContent = message;
  ui.globalFeedback.className = `feedback feedback-${type}`;
  ui.globalFeedback.hidden = false;
}

function clearFeedback() {
  if (!ui.globalFeedback) return;
  ui.globalFeedback.hidden = true;
  ui.globalFeedback.textContent = "";
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  document.body.classList.toggle("is-loading", isLoading);
}

function renderQuestions(questions = []) {
  if (!ui.questionList) return;
  ui.questionList.innerHTML = "";

  if (!questions.length) {
    ui.emptyState?.removeAttribute("hidden");
    return;
  }

  ui.emptyState?.setAttribute("hidden", "");

  questions.forEach((question) => {
    const card = createQuestionCard(question);
    ui.questionList.appendChild(card);
  });
}

function renderAnswers(question) {
  if (!ui.answersList) return;
  ui.answersList.innerHTML = "";

  if (!question?.answers?.length) {
    ui.answersList.innerHTML =
      '<p class="empty-answers">Ainda não há respostas para esta pergunta. Seja o primeiro a contribuir!</p>';
    return;
  }

  question.answers.forEach((answer) => {
    ui.answersList.appendChild(createAnswerCard(answer, question.id));
  });
}

function createQuestionCard(question) {
  if (ui.questionTemplate?.content) {
    const clone = ui.questionTemplate.content.cloneNode(true);
    populateQuestionCard(clone, question);
    return clone;
  }

  const card = document.createElement("article");
  card.className = "question-card";
  card.dataset.questionId = question.id;
  card.innerHTML = `
    <header class="question-header">
      <h3 class="question-title">${question.title}</h3>
      <span class="tag category">${question.categoryName || "Geral"}</span>
    </header>
    <p class="question-description">${question.description}</p>
    <footer class="question-footer">
      <span class="question-meta">${formatMeta(question)}</span>
      <div class="question-actions">
        ${createInteractionButtonsHTML(question)}
      </div>
    </footer>
  `;
  return card;
}

function populateQuestionCard(fragment, question) {
  const card = fragment.querySelector(".question-card");
  if (!card) return;

  card.dataset.questionId = question.id;
  fragment.querySelector(".question-title").textContent = question.title;
  fragment.querySelector(".question-description").textContent = question.description;
  const categoryTag = fragment.querySelector(".tag.category");
  if (categoryTag) categoryTag.textContent = question.categoryName || "Geral";

  const meta = fragment.querySelector(".question-meta");
  if (meta) meta.textContent = formatMeta(question);

  const actions = fragment.querySelector(".question-actions");
  if (actions) actions.innerHTML = createInteractionButtonsHTML(question);
}

function createInteractionButtonsHTML(question) {
  return `
    <button class="interaction-btn like-btn" data-action="like-question" data-liked="${question.liked}" aria-pressed="${Boolean(question.liked)}">
      <i class="fa-solid fa-thumbs-up"></i>
      <span>${question.likes ?? 0}</span>
    </button>
    <button class="interaction-btn answer-btn" data-action="view-answers">
      <i class="fa-solid fa-comment"></i>
      <span>${question.answersCount ?? 0}</span>
    </button>
  `;
}

function createAnswerCard(answer, questionId) {
  if (ui.answerTemplate?.content) {
    const clone = ui.answerTemplate.content.cloneNode(true);
    populateAnswerCard(clone, answer, questionId);
    return clone;
  }

  const card = document.createElement("article");
  card.className = "answer-card";
  card.dataset.answerId = answer.id;
  card.dataset.questionId = questionId;
  card.innerHTML = `
    <header class="answer-header">
      <h4 class="answer-title">${answer.authorName || "Anônimo"}</h4>
      <span class="answer-date">${formatDate(answer.createdAt)}</span>
    </header>
    <p class="answer-description">${answer.content}</p>
    <footer class="answer-footer">
      <button class="interaction-btn like-btn" data-action="like-answer" data-liked="${answer.liked}" aria-pressed="${Boolean(answer.liked)}">
        <i class="fa-solid fa-thumbs-up"></i>
        <span>${answer.likes ?? 0}</span>
      </button>
    </footer>
  `;
  return card;
}

function populateAnswerCard(fragment, answer, questionId) {
  const card = fragment.querySelector(".answer-card");
  if (!card) return;

  card.dataset.answerId = answer.id;
  card.dataset.questionId = questionId;
  fragment.querySelector(".answer-title").textContent = answer.authorName || "Anônimo";
  fragment.querySelector(".answer-description").textContent = answer.content;
  const date = fragment.querySelector(".answer-date");
  if (date) date.textContent = formatDate(answer.createdAt);

  const likeBtn = fragment.querySelector(".interaction-btn.like-btn span");
  if (likeBtn) likeBtn.textContent = answer.likes ?? 0;
}

function formatMeta(question) {
  const answers = question.answersCount ?? 0;
  const likes = question.likes ?? 0;
  const createdAt = formatDate(question.createdAt);
  return `${answers} respostas • ${likes} curtidas • ${createdAt}`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function filterQuestions(term) {
  term = term.trim().toLowerCase();
  const filtered = state.questions.filter((question) => {
    if (!term) return true;

    const fields = [question.title, question.description, question.categoryName];
    return fields.some((field) => (field || "").toLowerCase().includes(term));
  });

  renderQuestions(filtered);
}

function toggleLike(button, liked) {
  button.dataset.liked = liked ? "true" : "false";
  button.setAttribute("aria-pressed", liked);
  button.classList.toggle("liked", liked);
}

async function loadQuestions() {
  setLoading(true);
  clearFeedback();

  try {
    const params = new URLSearchParams();
    if (state.filters.category && state.filters.category !== "all") params.append("category", state.filters.category);
    if (state.filters.sort) params.append("sort", state.filters.sort);

    const data = await http.get(`${endpoints.questions}?${params.toString()}`);
    state.questions = Array.isArray(data) ? data : data.items || [];
    renderQuestions(state.questions);

    if (state.selectedQuestionId) {
      const current = state.questions.find((item) => item.id === state.selectedQuestionId);
      if (current) {
        renderAnswers(current);
      }
    }
  } catch (error) {
    showFeedback(error.message, "error");
    renderQuestions([]);
  } finally {
    setLoading(false);
  }
}

async function handleQuestionSelection(questionId) {
  state.selectedQuestionId = questionId;
  try {
    const question = await http.get(endpoints.question(questionId));
    renderAnswers(question);
  } catch (error) {
    showFeedback(error.message, "error");
  }
}

async function handleLikeQuestion(button, questionId) {
  const liked = button.dataset.liked === "true";
  toggleLike(button, !liked);

  const counter = button.querySelector("span");
  const previousValue = counter ? parseInt(counter.textContent, 10) || 0 : 0;
  if (counter) counter.textContent = previousValue + (liked ? -1 : 1);

  try {
    await http.post(endpoints.likeQuestion(questionId), { liked: !liked });
  } catch (error) {
    toggleLike(button, liked);
    if (counter) counter.textContent = previousValue;
    showFeedback(error.message, "error");
  }
}

async function handleLikeAnswer(button, questionId, answerId) {
  const liked = button.dataset.liked === "true";
  toggleLike(button, !liked);

  const counter = button.querySelector("span");
  const previousValue = counter ? parseInt(counter.textContent, 10) || 0 : 0;
  if (counter) counter.textContent = previousValue + (liked ? -1 : 1);

  try {
    await http.post(endpoints.likeAnswer(questionId, answerId), { liked: !liked });
  } catch (error) {
    toggleLike(button, liked);
    if (counter) counter.textContent = previousValue;
    showFeedback(error.message, "error");
  }
}

function bindEvents() {
  if (ui.searchInput) {
    ui.searchInput.addEventListener("input", (event) => filterQuestions(event.target.value));
  }

  if (ui.filtersBtn) {
    ui.filtersBtn.addEventListener("click", async () => {
      showFeedback("Carregando filtros disponíveis...", "info");
      try {
        const categories = await http.get(endpoints.filters);
        window.dispatchEvent(
          new CustomEvent("forum:filtersLoaded", {
            detail: { categories },
          })
        );
        showFeedback("Filtros atualizados.", "success");
      } catch (error) {
        showFeedback(error.message, "error");
      }
    });
  }

  document.addEventListener("click", (event) => {
    const questionCard = event.target.closest(".question-card");
    const answerCard = event.target.closest(".answer-card");
    const actionButton = event.target.closest(".interaction-btn");

    if (questionCard?.dataset.questionId && !actionButton) {
      handleQuestionSelection(questionCard.dataset.questionId);
    }

    if (actionButton) {
      const { action } = actionButton.dataset;
      const targetQuestionId = questionCard?.dataset.questionId || answerCard?.dataset.questionId;

      if (action === "like-question" && targetQuestionId) {
        handleLikeQuestion(actionButton, targetQuestionId);
      }

      if (action === "view-answers" && questionCard?.dataset.questionId) {
        handleQuestionSelection(questionCard.dataset.questionId);
      }

      if (action === "like-answer" && targetQuestionId && answerCard?.dataset.answerId) {
        handleLikeAnswer(actionButton, targetQuestionId, answerCard.dataset.answerId);
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      ui.searchInput?.focus();
    }

    if (event.key === "Escape" && document.activeElement === ui.searchInput) {
      ui.searchInput.value = "";
      filterQuestions("");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadQuestions();
});

