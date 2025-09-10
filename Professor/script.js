// Simulando dados do backend da página VisaoGeral
const dadosDashboard = {
    alunos: 156,
    quizzes: 24,
    participacao: 87,
    media: 78,
    atividades: [
        { titulo: "Matemática - Equações do 2º Grau", turma: "9° A", participantes: 28, status: "Ativo" },
        { titulo: "História - Segunda Guerra Mundial", turma: "9° B", participantes: 25, status: "Finalizado" },
        { titulo: "Ciências - Sistema Solar", turma: "8° A", participantes: 30, status: "Rascunho" }
    ],
    turmas: [
        { nome: "8° A", alunos: 30, media: 82, quizzes: 3 },
        { nome: "8° B", alunos: 28, media: 79, quizzes: 2 },
        { nome: "9° A", alunos: 32, media: 85, quizzes: 4 },
        { nome: "9° B", alunos: 29, media: 77, quizzes: 3 }
    ]
};

// Atualiza indicadores
document.getElementById("totalAlunos").textContent = dadosDashboard.alunos;
document.getElementById("quizzesCriados").textContent = dadosDashboard.quizzes;
document.getElementById("taxaParticipacao").textContent = dadosDashboard.participacao + "%";
document.getElementById("mediaGeral").textContent = dadosDashboard.media + "%";

// Atualiza Atividade Recente
const atividadeDiv = document.getElementById("atividadeRecente");
atividadeDiv.innerHTML = ""; // limpa placeholder
dadosDashboard.atividades.forEach(a => {
    const div = document.createElement("div");
    div.classList.add("activity-item");
    div.innerHTML = `
        <div class="activity-info">
            <h4>${a.titulo}</h4>
            <p>${a.turma} • ${a.participantes} participantes</p>
        </div>
        <div class="activity-status ${a.status.toLowerCase()}">${a.status}</div>
    `;
    atividadeDiv.appendChild(div);
});

// Atualiza Performance das Turmas
const performanceDiv = document.getElementById("performanceTurmas");
performanceDiv.innerHTML = ""; 
dadosDashboard.turmas.forEach(t => {
    const div = document.createElement("div");
    div.classList.add("performance-item");
    div.innerHTML = `
        <div class="class-info">
            <h4>${t.nome}</h4>
            <p>${t.alunos} alunos</p>
        </div>
        <div class="performance-stats">
            <div class="performance-score">${t.media}%</div>
            <div class="performance-detail">${t.quizzes} quizzes ativos</div>
        </div>
    `;
    performanceDiv.appendChild(div);
});






