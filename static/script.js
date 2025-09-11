// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // Navegação principal
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove a classe active de todos os itens
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona a classe active ao item clicado
            this.classList.add('active');
            
            console.log('Navegando para:', this.textContent);
        });
    });

    // Botões do cabeçalho
    const createQuizBtn = document.querySelector('.btn-primary');
    const reportsBtn = document.querySelector('.btn-secondary:nth-child(2)');
    const exitBtn = document.querySelector('.btn-secondary:nth-child(3)');

    if (createQuizBtn) {
        createQuizBtn.addEventListener('click', function() {
            alert('Funcionalidade "Criar Quiz" seria implementada aqui!');
        });
    }

    if (reportsBtn) {
        reportsBtn.addEventListener('click', function() {
            window.location.href = '/relatorios';
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja sair?')) {
                alert('Saindo do sistema...');
            }
        });
    }

    // Funcionalidades específicas da página Meus Quizzes
    if (window.location.pathname.includes('/meusquizzes')) {
        initMeusQuizzes();
    }

    // Funcionalidades específicas da página Turmas
    if (window.location.pathname.includes('/turmas')) {
        initTurmas();
    }

    // Funcionalidades específicas da página Relatórios
    if (window.location.pathname.includes('/relatorios')) {
        initRelatorios();
    }

    // Funcionalidades específicas da página Fórum
    if (window.location.pathname.includes('/forum')) {
        initForum();
    }

    // Funcionalidades da página inicial (dashboard)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initDashboard();
    }

    // Função para mostrar notificações
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Inicialização da página Meus Quizzes
    function initMeusQuizzes() {
        const actionBtns = document.querySelectorAll('.action-btn');
        const newQuizBtn = document.querySelector('.page-header .btn-primary');

        actionBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.classList.contains('view') ? 'visualizar' : 
                              this.classList.contains('edit') ? 'editar' : 'excluir';
                const quizTitle = this.closest('.quiz-card').querySelector('h3').textContent;
                
                if (action === 'excluir') {
                    if (confirm(`Tem certeza que deseja excluir o quiz "${quizTitle}"?`)) {
                        showNotification(`Quiz "${quizTitle}" excluído com sucesso!`, 'success');
                        this.closest('.quiz-card').remove();
                    }
                } else {
                    showNotification(`Abrindo ${action} para "${quizTitle}"`, 'info');
                }
            });
        });

        if (newQuizBtn) {
            newQuizBtn.addEventListener('click', function() {
                showNotification('Abrindo criador de quiz...', 'info');
            });
        }
    }

    // Inicialização da página Turmas
    function initTurmas() {
        const manageBtns = document.querySelectorAll('.manage-btn');

        manageBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const className = this.closest('.class-card').querySelector('h3').textContent;
                showNotification(`Abrindo gerenciamento da turma ${className}`, 'info');
            });
        });
    }

    // Inicialização da página Relatórios
    function initRelatorios() {
        const generateBtns = document.querySelectorAll('.generate-btn');

        generateBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const reportName = this.closest('.report-item').querySelector('h4').textContent;
                showNotification(`Gerando ${reportName}...`, 'info');
                
                // Simula o processo de geração
                setTimeout(() => {
                    showNotification(`${reportName} gerado com sucesso!`, 'success');
                }, 2000);
            });
        });
    }

    // Inicialização da página Fórum
    function initForum() {
        const accessBtn = document.querySelector('.access-forum-btn');

        if (accessBtn) {
            accessBtn.addEventListener('click', function() {
                showNotification('Redirecionando para o fórum...', 'info');
                setTimeout(() => {
                    alert('Aqui seria aberto o fórum completo com todas as perguntas e respostas.');
                }, 1000);
            });
        }
    }

    // Inicialização do Dashboard
    function initDashboard() {
        // Animação dos cards de métricas
        const metricCards = document.querySelectorAll('.metric-card');
        
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });

        // Interatividade para itens de atividade
        const activityItems = document.querySelectorAll('.activity-item');
        
        activityItems.forEach(item => {
            item.addEventListener('click', function() {
                const title = this.querySelector('h4').textContent;
                const status = this.querySelector('.activity-status').textContent;
                alert(`Atividade: ${title}\nStatus: ${status}\n\nDetalhes da atividade seriam mostrados aqui.`);
            });
        });

        // Interatividade para itens de performance
        const performanceItems = document.querySelectorAll('.performance-item');
        
        performanceItems.forEach(item => {
            item.addEventListener('click', function() {
                const className = this.querySelector('h4').textContent;
                const score = this.querySelector('.performance-score').textContent;
                alert(`Turma: ${className}\nPerformance: ${score}\n\nDetalhes da turma seriam mostrados aqui.`);
            });
        });

        // Adiciona efeito de hover personalizado para os cards
        metricCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Notificação de boas-vindas
        setTimeout(() => {
            showNotification('Dashboard carregado com sucesso!', 'success');
        }, 1000);
    }

    console.log('Sistema Saber+ Gestor inicializado com sucesso!');
});

