
const API_BASE = window.__SABER_API_BASE_URL__ || 'http://localhost:3000/api';

// Função auxiliar para chamadas autenticadas
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('saber.authToken') || sessionStorage.getItem('saberplus_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message;
    throw new Error(message || `Erro ${response.status}: ${response.statusText}`);
  }

  return data;
}

// ==========================
// Inicialização da Página
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  await carregarDashboard();
  configurarInteracoes();
  console.log('🎓 Saber+ Dashboard conectado ao back-end.');
});

// ==========================
// Carregamento Dinâmico
// ==========================
async function carregarDashboard() {
  try {
    mostrarLoading(true);

    // Busca estatísticas do aluno
    const user = JSON.parse(localStorage.getItem('saber.user') || sessionStorage.getItem('saberplus_user') || '{}');
    const stats = await apiRequest(`/users/${user.id}/stats`);
    atualizarEstatisticas(stats);

    // Busca quizzes disponíveis
    const quizzes = await apiRequest('/quizzes');
    renderizarQuizzes(quizzes);

    // Busca ranking da turma
    const ranking = await apiRequest('/ranking?turma=' + user.turmaId);
    renderizarRanking(ranking);

  } catch (err) {
    console.error(err);
    showNotification('Erro ao carregar painel do aluno.', 'error');
  } finally {
    mostrarLoading(false);
  }
}

// ==========================
// Renderizações
// ==========================
function atualizarEstatisticas(stats) {
  document.querySelectorAll('.stat-card .stat-number')[0].textContent = stats.quizzesRealizados;
  document.querySelectorAll('.stat-card .stat-number')[1].textContent = stats.pontuacaoTotal;
  document.querySelectorAll('.stat-card .stat-number')[2].textContent = stats.mediaGeral + '%';
  document.querySelectorAll('.stat-card .stat-number')[3].textContent = stats.conquistas;
}

function renderizarQuizzes(quizzes) {
  const lista = document.querySelector('.quiz-list');
  lista.innerHTML = '';
  quizzes.forEach(q => {
    const item = document.createElement('div');
    item.className = 'quiz-item ' + (q.concluido ? 'completed' : '');
    item.innerHTML = `
      <div class="quiz-header">
        <h3>${q.titulo}</h3>
        <span class="quiz-status ${q.concluido ? 'completed' : 'pending'}">
          ${q.concluido ? 'Concluído' : 'Pendente'}
        </span>
      </div>
      <div class="quiz-details">
        <span class="quiz-subject">📘 ${q.disciplina}</span>
        <span class="quiz-questions">❓ ${q.qtdQuestoes} questões</span>
        <span class="quiz-time">⏱️ ${q.tempo} min</span>
      </div>
      ${q.concluido
        ? `<div class="quiz-score">Pontuação: ${q.nota}%</div>
           <button class="quiz-btn result-btn" data-id="${q.id}">Ver Resultado</button>`
        : `<button class="quiz-btn start-btn" data-id="${q.id}">
             <span class="btn-icon">▶️</span> Iniciar Quiz
           </button>`
      }`;
    lista.appendChild(item);
  });
}

function renderizarRanking(ranking) {
  const lista = document.querySelector('.ranking-list');
  lista.innerHTML = '';
  ranking.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'ranking-item' + (r.ehUsuarioAtual ? ' current-user' : '');
    item.innerHTML = `
      <div class="rank-position">${i + 1}</div>
      <div class="rank-avatar">${r.avatar || '👤'}</div>
      <div class="rank-name">${r.nome}</div>
      <div class="rank-score">⭐ ${r.pontos}</div>`;
    lista.appendChild(item);
  });
}

// ==========================
// Interações do Utilizador
// ==========================
function configurarInteracoes() {
  document.body.addEventListener('click', async (e) => {
    if (e.target.closest('.start-btn')) {
      const id = e.target.closest('.start-btn').dataset.id;
      showNotification('Iniciando quiz...', 'info');
      setTimeout(() => window.location.href = `../Quiz/take-quiz.html?id=${id}`, 1000);
    }

    if (e.target.closest('.result-btn')) {
      const id = e.target.closest('.result-btn').dataset.id;
      showNotification('Abrindo resultado...', 'info');
      setTimeout(() => window.location.href = `../Resultados/result.html?id=${id}`, 800);
    }

    if (e.target.closest('.logout-btn') || e.target.closest('.btn-secondary')) {
      if (confirm('Deseja realmente sair?')) {
        await efetuarLogout();
      }
    }
  });
}

// ==========================
// Logout
// ==========================
async function efetuarLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (_) {
    // mesmo se falhar, limpa sessão
  }
  sessionStorage.clear();
  localStorage.removeItem('saber.authToken');
  localStorage.removeItem('saber.user');
  window.location.href = '../../index.html'; // volta à tela de login
}

// ==========================
// Helpers de UI
// ==========================
function showNotification(message, type = 'info') {
  const n = document.createElement('div');
  n.className = `notification notification-${type}`;
  n.textContent = message;
  Object.assign(n.style, {
    position: 'fixed', top: '20px', right: '20px',
    padding: '12px 18px', borderRadius: '8px',
    color: '#fff', zIndex: 9999,
    background: type === 'success' ? '#10b981' :
                type === 'error' ? '#ef4444' : '#6366f1',
    transition: 'opacity .3s'
  });
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

function mostrarLoading(show) {
  let overlay = document.querySelector('.loading-overlay');
  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>';
      Object.assign(overlay.style, {
        position: 'fixed', inset: 0,
        background: 'rgba(255,255,255,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000
      });
      document.body.appendChild(overlay);
    }
  } else if (overlay) overlay.remove();
}
