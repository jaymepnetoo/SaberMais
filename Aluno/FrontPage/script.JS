// JavaScript for Interactive Elements

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
});

function initializeDashboard() {
    // Add event listeners for buttons
    addButtonEventListeners();
    
    // Add hover effects for cards
    addCardHoverEffects();
    
    // Initialize progress animations
    initializeProgressAnimations();
    
    // Add click effects for footer items
    addFooterInteractions();
    
    // Add logout functionality
    addLogoutFunctionality();
}

function addButtonEventListeners() {
    // Quiz start buttons
    const startButtons = document.querySelectorAll('.start-btn');
    startButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const quizTitle = this.closest('.quiz-item').querySelector('h3').textContent;
            showNotification(`Iniciando quiz: ${quizTitle}`, 'info');
            
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="btn-icon">⏳</span> Carregando...';
            this.disabled = true;
            
            // Simulate loading
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
                showNotification('Quiz carregado com sucesso!', 'success');
            }, 2000);
        });
    });
    
    // Result buttons
    const resultButtons = document.querySelectorAll('.result-btn');
    resultButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const quizTitle = this.closest('.quiz-item').querySelector('h3').textContent;
            showNotification(`Visualizando resultado: ${quizTitle}`, 'info');
        });
    });
}

function addCardHoverEffects() {
    // Add enhanced hover effects for stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects for ranking items
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach(item => {
        item.addEventListener('click', function() {
            const name = this.querySelector('.rank-name').textContent;
            if (name !== 'Você') {
                showNotification(`Visualizando perfil de ${name}`, 'info');
            }
        });
    });
}

function initializeProgressAnimations() {
    // Animate progress bar on load
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const targetWidth = progressFill.style.width;
        progressFill.style.width = '0%';
        
        setTimeout(() => {
            progressFill.style.width = targetWidth;
        }, 500);
    }
    
    // Add click to update progress (demo functionality)
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.addEventListener('click', function() {
            const currentProgress = parseInt(progressFill.style.width);
            const newProgress = Math.min(currentProgress + 20, 100);
            progressFill.style.width = newProgress + '%';
            
            // Update text
            const progressText = document.querySelector('.progress-current');
            const progressPercentage = document.querySelector('.progress-percentage');
            const quizzesCompleted = Math.floor(newProgress / 20);
            
            progressText.textContent = `${quizzesCompleted} de 5 quizzes`;
            progressPercentage.textContent = `${newProgress}%`;
            
            if (newProgress >= 100) {
                showNotification('Parabéns! Meta semanal atingida! 🎉', 'success');
                document.querySelector('.progress-message').textContent = 'Meta semanal concluída!';
            } else {
                const remaining = 5 - quizzesCompleted;
                document.querySelector('.progress-message').textContent = `Faltam ${remaining} quizzes para bater sua meta!`;
            }
        });
    }
}

function addFooterInteractions() {
    const footerItems = document.querySelectorAll('.footer-item');
    footerItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            showNotification(`Navegando para ${title}`, 'info');
            
            // Add active state animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function addLogoutFunctionality() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show confirmation
            if (confirm('Tem certeza que deseja sair?')) {
                showNotification('Fazendo logout...', 'info');
                
                // Simulate logout process
                setTimeout(() => {
                    showNotification('Logout realizado com sucesso!', 'success');
                    // In a real app, this would redirect to login page
                }, 1000);
            }
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        fontSize: '14px',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add some dynamic data updates (demo functionality)
function updateStats() {
    // Simulate real-time updates
    const statNumbers = document.querySelectorAll('.stat-number');
    
    setInterval(() => {
        // Randomly update one of the stats occasionally
        if (Math.random() < 0.1) { // 10% chance every interval
            const randomStat = statNumbers[Math.floor(Math.random() * statNumbers.length)];
            const currentValue = parseInt(randomStat.textContent);
            
            if (randomStat.textContent.includes('%')) {
                const newValue = Math.min(currentValue + 1, 100);
                randomStat.textContent = newValue + '%';
            } else {
                const newValue = currentValue + 1;
                randomStat.textContent = newValue;
            }
            
            // Add a subtle animation
            randomStat.style.transform = 'scale(1.1)';
            randomStat.style.color = 'var(--primary-color)';
            setTimeout(() => {
                randomStat.style.transform = 'scale(1)';
                randomStat.style.color = 'var(--text-primary)';
            }, 300);
        }
    }, 5000); // Check every 5 seconds
}

// Initialize dynamic updates
setTimeout(updateStats, 2000);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press 'q' to start first available quiz
    if (e.key === 'q' || e.key === 'Q') {
        const firstStartBtn = document.querySelector('.start-btn');
        if (firstStartBtn) {
            firstStartBtn.click();
        }
    }
    
    // Press 'r' to view first result
    if (e.key === 'r' || e.key === 'R') {
        const firstResultBtn = document.querySelector('.result-btn');
        if (firstResultBtn) {
            firstResultBtn.click();
        }
    }
    
    // Press 'p' to update progress
    if (e.key === 'p' || e.key === 'P') {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.click();
        }
    }
});

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Add loading state management
window.addEventListener('load', function() {
    // Add a subtle fade-in animation for the entire page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Console welcome message
console.log('🎓 Saber+ Aluno Dashboard carregado com sucesso!');
console.log('💡 Dicas:');
console.log('   - Pressione "q" para iniciar o primeiro quiz');
console.log('   - Pressione "r" para ver resultados');
console.log('   - Pressione "p" para atualizar progresso');
console.log('   - Clique na barra de progresso para simular conclusão de quizzes');