// DOM Elements
const searchInput = document.getElementById('searchInput');
const filtersBtn = document.getElementById('filtersBtn');
const newQuestionBtn = document.getElementById('newQuestionBtn');
const questionCards = document.querySelectorAll('.question-card');
const answerCards = document.querySelectorAll('.answer-card');
const interactionBtns = document.querySelectorAll('.interaction-btn');

// Search Functionality for Questions
if (searchInput && questionCards.length > 0) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        questionCards.forEach(card => {
            const title = card.querySelector('.question-title').textContent.toLowerCase();
            const description = card.querySelector('.question-description').textContent.toLowerCase();
            const category = card.querySelector('.tag.category').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Search Functionality for Answers
if (searchInput && answerCards.length > 0) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        answerCards.forEach(card => {
            const title = card.querySelector('.answer-title').textContent.toLowerCase();
            const description = card.querySelector('.answer-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Interaction Buttons (Like/Comment)
interactionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const icon = btn.querySelector('i');
        const counter = btn.querySelector('span');
        
        if (icon.classList.contains('fa-thumbs-up')) {
            // Toggle like state
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                btn.style.color = '#6c757d';
                counter.textContent = parseInt(counter.textContent) - 1;
            } else {
                btn.classList.add('liked');
                btn.style.color = '#6f42c1';
                counter.textContent = parseInt(counter.textContent) + 1;
            }
        } else if (icon.classList.contains('fa-comment')) {
            // Comment functionality (placeholder)
            alert('Funcionalidade de comentários em desenvolvimento');
        }
    });
});

// Filters Button
if (filtersBtn) {
    filtersBtn.addEventListener('click', () => {
        alert('Funcionalidade de filtros em desenvolvimento');
    });
}

// Question Card Hover Effects
questionCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Answer Card Hover Effects
answerCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Focus search on Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Clear search on Escape
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth transitions
    questionCards.forEach(card => {
        card.style.transition = 'all 0.2s ease';
    });
    
    answerCards.forEach(card => {
        card.style.transition = 'all 0.2s ease';
    });
    
    console.log('Saber+ Fórum carregado com sucesso!');
});