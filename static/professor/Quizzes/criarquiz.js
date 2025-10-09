// Quiz Application JavaScript - Refactored Version
class QuizApp {
    constructor() {
        this.currentTab = 'informacoes';
        this.questions = [];
        this.materials = [];
        this.currentMaterialType = null;
        this.quizData = {
            titulo: '',
            materia: 'matematica',
            turma: '8a',
            tempoLimite: 20,
            dificuldade: 'facil',
            pontuacaoMaxima: 100
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedData();
        this.updateUI();
        this.setupFileUpload();
    }

    bindEvents() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Header buttons
        document.getElementById('voltarBtn').addEventListener('click', () => {
            this.goBack();
        });

        document.getElementById('salvarQuizBtn').addEventListener('click', () => {
            this.saveQuiz();
        });

        // Form inputs with validation
        this.bindFormInputs();

        // Question types
        document.querySelectorAll('.question-type').forEach(type => {
            type.addEventListener('click', (e) => {
                const questionType = e.currentTarget.dataset.type;
                this.openQuestionModal(questionType);
            });
        });

        // Material types - Enhanced interface
        document.querySelectorAll('.material-type').forEach(type => {
            type.addEventListener('click', (e) => {
                const materialType = e.currentTarget.dataset.type;
                this.openMaterialModal(materialType);
            });
        });

        // Nova questão button
        document.getElementById('novaQuestaoBtn').addEventListener('click', () => {
            this.openQuestionModal('multipla');
        });

        // Question modal events
        this.bindQuestionModalEvents();

        // Material modal events
        this.bindMaterialModalEvents();

        // Question bank actions
        this.bindQuestionBankEvents();

        // Keyboard shortcuts
        this.bindKeyboardShortcuts();

        // Form validation
        this.bindFormValidation();
    }

    bindFormInputs() {
        const inputs = [
            { id: 'tituloQuiz', prop: 'titulo' },
            { id: 'materia', prop: 'materia' },
            { id: 'turma', prop: 'turma' },
            { id: 'tempoLimite', prop: 'tempoLimite', type: 'number' },
            { id: 'dificuldade', prop: 'dificuldade' },
            { id: 'pontuacaoMaxima', prop: 'pontuacaoMaxima', type: 'number' }
        ];

        inputs.forEach(({ id, prop, type }) => {
            const element = document.getElementById(id);
            element.addEventListener('input', (e) => {
                this.quizData[prop] = type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
                this.autoSave();
                this.validateField(element);
            });

            element.addEventListener('blur', (e) => {
                this.validateField(element);
            });
        });
    }

    bindQuestionModalEvents() {
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeQuestionModal();
        });

        document.getElementById('cancelQuestion').addEventListener('click', () => {
            this.closeQuestionModal();
        });

        document.getElementById('saveQuestion').addEventListener('click', () => {
            this.saveQuestion();
        });

        document.getElementById('questionType').addEventListener('change', (e) => {
            this.updateQuestionOptions(e.target.value);
        });

        document.getElementById('questionModal').addEventListener('click', (e) => {
            if (e.target.id === 'questionModal') {
                this.closeQuestionModal();
            }
        });
    }

    bindMaterialModalEvents() {
        document.getElementById('closeMaterialModal').addEventListener('click', () => {
            this.closeMaterialModal();
        });

        document.getElementById('cancelMaterial').addEventListener('click', () => {
            this.closeMaterialModal();
        });

        document.getElementById('saveMaterial').addEventListener('click', () => {
            this.saveMaterial();
        });

        document.getElementById('materialModal').addEventListener('click', (e) => {
            if (e.target.id === 'materialModal') {
                this.closeMaterialModal();
            }
        });
    }

    bindQuestionBankEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.question-actions .btn-icon')) {
                const action = e.target.closest('.btn-icon');
                const questionItem = action.closest('.question-item');
                
                if (action.title.includes('Visualizar')) {
                    this.viewQuestion(questionItem);
                } else if (action.title.includes('Adicionar')) {
                    this.addQuestionFromBank(questionItem);
                }
            }

            // Material actions
            if (e.target.closest('.material-actions .btn-icon')) {
                const action = e.target.closest('.btn-icon');
                const materialItem = action.closest('.material-item');
                
                if (action.title.includes('Editar')) {
                    this.editMaterial(materialItem);
                } else if (action.title.includes('Remover')) {
                    this.removeMaterial(materialItem);
                }
            }
        });
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveQuiz();
                        break;
                    case 'n':
                        e.preventDefault();
                        if (this.currentTab === 'questoes') {
                            this.openQuestionModal('multipla');
                        } else if (this.currentTab === 'materiais') {
                            this.openMaterialModal('video');
                        }
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeQuestionModal();
                this.closeMaterialModal();
            }
        });
    }

    bindFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        field.classList.remove('error', 'success');
        
        if (isRequired && !value) {
            field.classList.add('error');
            return false;
        }
        
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            field.classList.add('error');
            return false;
        }
        
        if (field.type === 'url' && value && !this.isValidUrl(value)) {
            field.classList.add('error');
            return false;
        }
        
        if (value) {
            field.classList.add('success');
        }
        
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    switchTab(tabName) {
        // Update ARIA attributes
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.animateTabSwitch();
    }

    animateTabSwitch() {
        const activeContent = document.querySelector('.tab-content.active');
        activeContent.style.opacity = '0';
        activeContent.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            activeContent.style.opacity = '1';
            activeContent.style.transform = 'translateY(0)';
        }, 50);
    }

    openQuestionModal(type = 'multipla') {
        const modal = document.getElementById('questionModal');
        const questionType = document.getElementById('questionType');
        
        // Reset form
        document.getElementById('questionText').value = '';
        document.getElementById('questionPoints').value = '10';
        questionType.value = type;
        
        this.updateQuestionOptions(type);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        setTimeout(() => {
            document.getElementById('questionText').focus();
        }, 100);
    }

    closeQuestionModal() {
        const modal = document.getElementById('questionModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    openMaterialModal(type) {
        this.currentMaterialType = type;
        const modal = document.getElementById('materialModal');
        const title = document.getElementById('material-modal-title');
        
        // Reset form
        document.getElementById('materialTitle').value = '';
        document.getElementById('materialDescription').value = '';
        document.getElementById('videoUrl').value = '';
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkTarget').value = '_blank';
        document.getElementById('pdfFile').value = '';
        
        // Update modal title
        const titles = {
            video: 'Adicionar Vídeo Explicativo',
            pdf: 'Adicionar Material PDF',
            link: 'Adicionar Link Externo'
        };
        title.textContent = titles[type];
        
        // Show/hide relevant fields
        this.showMaterialFields(type);
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        setTimeout(() => {
            document.getElementById('materialTitle').focus();
        }, 100);
    }

    closeMaterialModal() {
        const modal = document.getElementById('materialModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        this.currentMaterialType = null;
    }

    showMaterialFields(type) {
        // Hide all fields first
        document.querySelectorAll('.material-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show relevant fields
        const fieldMap = {
            video: 'videoFields',
            pdf: 'pdfFields',
            link: 'linkFields'
        };
        
        const fieldsToShow = document.getElementById(fieldMap[type]);
        if (fieldsToShow) {
            fieldsToShow.style.display = 'block';
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('pdfFile');
        const uploadArea = document.getElementById('pdfUploadArea');
        
        if (!fileInput || !uploadArea) return;

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files[0]);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });
    }

    handleFileSelection(file) {
        const uploadArea = document.getElementById('pdfUploadArea');
        const content = uploadArea.querySelector('.file-upload-content');
        
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            this.showNotification('Por favor, selecione apenas arquivos PDF.', 'error');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('O arquivo deve ter no máximo 10MB.', 'error');
            return;
        }

        // Update UI
        uploadArea.classList.add('file-selected');
        content.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <p><strong>${file.name}</strong></p>
            <small>${this.formatFileSize(file.size)}</small>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateQuestionOptions(type) {
        const optionsContainer = document.getElementById('questionOptions');
        optionsContainer.innerHTML = '';

        switch (type) {
            case 'multipla':
                this.createMultipleChoiceOptions(optionsContainer);
                break;
            case 'verdadeiro-falso':
                this.createTrueFalseOptions(optionsContainer);
                break;
            case 'dissertativa':
                this.createEssayOptions(optionsContainer);
                break;
        }
    }

    createMultipleChoiceOptions(container) {
        const optionsDiv = document.createElement('div');
        optionsDiv.innerHTML = `
            <label>Opções de Resposta <span class="required">*</span></label>
            <small class="form-help">Marque a opção correta</small>
            <div class="question-options-list">
                ${this.createOptionInput(0, 'A', true)}
                ${this.createOptionInput(1, 'B', false)}
                ${this.createOptionInput(2, 'C', false)}
                ${this.createOptionInput(3, 'D', false)}
            </div>
            <button type="button" class="add-option" onclick="quizApp.addOption()">
                <i class="fas fa-plus"></i> Adicionar Opção
            </button>
        `;
        container.appendChild(optionsDiv);
    }

    createOptionInput(index, letter, checked = false) {
        return `
            <div class="option-input">
                <input type="radio" name="correctAnswer" value="${index}" ${checked ? 'checked' : ''} aria-label="Marcar opção ${letter} como correta">
                <input type="text" placeholder="Opção ${letter}" data-option="${index}" required aria-label="Texto da opção ${letter}">
                <button type="button" class="remove-option" onclick="this.parentElement.remove()" aria-label="Remover opção ${letter}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    createTrueFalseOptions(container) {
        const optionsDiv = document.createElement('div');
        optionsDiv.innerHTML = `
            <label>Resposta Correta <span class="required">*</span></label>
            <small class="form-help">Selecione a resposta correta</small>
            <div class="question-options-list">
                <div class="option-input">
                    <input type="radio" name="correctAnswer" value="true" checked aria-label="Verdadeiro">
                    <span>Verdadeiro</span>
                </div>
                <div class="option-input">
                    <input type="radio" name="correctAnswer" value="false" aria-label="Falso">
                    <span>Falso</span>
                </div>
            </div>
        `;
        container.appendChild(optionsDiv);
    }

    createEssayOptions(container) {
        const optionsDiv = document.createElement('div');
        optionsDiv.innerHTML = `
            <label>Critérios de Avaliação</label>
            <small class="form-help">Descreva como esta questão será avaliada</small>
            <textarea placeholder="Descreva os critérios para avaliação desta questão dissertativa..." rows="4" aria-label="Critérios de avaliação"></textarea>
        `;
        container.appendChild(optionsDiv);
    }

    addOption() {
        const optionsList = document.querySelector('.question-options-list');
        const optionCount = optionsList.children.length;
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        if (optionCount < 8) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-input';
            optionDiv.innerHTML = `
                <input type="radio" name="correctAnswer" value="${optionCount}" aria-label="Marcar opção ${letters[optionCount]} como correta">
                <input type="text" placeholder="Opção ${letters[optionCount]}" data-option="${optionCount}" required aria-label="Texto da opção ${letters[optionCount]}">
                <button type="button" class="remove-option" onclick="this.parentElement.remove()" aria-label="Remover opção ${letters[optionCount]}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            optionsList.appendChild(optionDiv);
        } else {
            this.showNotification('Máximo de 8 opções permitidas.', 'warning');
        }
    }

    saveQuestion() {
        const questionText = document.getElementById('questionText').value.trim();
        const questionType = document.getElementById('questionType').value;
        const questionPoints = parseInt(document.getElementById('questionPoints').value);

        if (!this.validateField(document.getElementById('questionText'))) {
            this.showNotification('Por favor, digite a pergunta.', 'error');
            return;
        }

        const question = {
            id: Date.now(),
            text: questionText,
            type: questionType,
            points: questionPoints,
            options: [],
            correctAnswer: null,
            createdAt: new Date().toISOString()
        };

        // Get options based on question type
        if (questionType === 'multipla') {
            const options = document.querySelectorAll('[data-option]');
            const correctAnswer = document.querySelector('input[name="correctAnswer"]:checked');
            
            options.forEach((option) => {
                if (option.value.trim()) {
                    question.options.push(option.value.trim());
                }
            });

            if (question.options.length < 2) {
                this.showNotification('Adicione pelo menos 2 opções.', 'error');
                return;
            }

            question.correctAnswer = correctAnswer ? parseInt(correctAnswer.value) : 0;
        } else if (questionType === 'verdadeiro-falso') {
            question.options = ['Verdadeiro', 'Falso'];
            const correctAnswer = document.querySelector('input[name="correctAnswer"]:checked');
            question.correctAnswer = correctAnswer ? correctAnswer.value : 'true';
        } else if (questionType === 'dissertativa') {
            const criteria = document.querySelector('#questionOptions textarea');
            question.criteria = criteria ? criteria.value.trim() : '';
        }

        this.questions.push(question);
        this.updateQuestionsDisplay();
        this.closeQuestionModal();
        this.showNotification('Questão adicionada com sucesso!', 'success');
        this.autoSave();
    }

    saveMaterial() {
        const title = document.getElementById('materialTitle').value.trim();
        const description = document.getElementById('materialDescription').value.trim();

        if (!this.validateField(document.getElementById('materialTitle'))) {
            this.showNotification('Por favor, digite o título do material.', 'error');
            return;
        }

        const material = {
            id: Date.now(),
            type: this.currentMaterialType,
            title: title,
            description: description,
            createdAt: new Date().toISOString()
        };

        // Type-specific validation and data
        switch (this.currentMaterialType) {
            case 'video':
                const videoUrl = document.getElementById('videoUrl').value.trim();
                if (!this.validateField(document.getElementById('videoUrl'))) {
                    this.showNotification('Por favor, digite uma URL válida para o vídeo.', 'error');
                    return;
                }
                material.url = videoUrl;
                material.embedUrl = this.getVideoEmbedUrl(videoUrl);
                break;

            case 'pdf':
                const pdfFile = document.getElementById('pdfFile').files[0];
                if (!pdfFile) {
                    this.showNotification('Por favor, selecione um arquivo PDF.', 'error');
                    return;
                }
                material.file = {
                    name: pdfFile.name,
                    size: pdfFile.size,
                    type: pdfFile.type
                };
                // In a real app, you would upload the file here
                break;

            case 'link':
                const linkUrl = document.getElementById('linkUrl').value.trim();
                const linkTarget = document.getElementById('linkTarget').value;
                if (!this.validateField(document.getElementById('linkUrl'))) {
                    this.showNotification('Por favor, digite uma URL válida para o link.', 'error');
                    return;
                }
                material.url = linkUrl;
                material.target = linkTarget;
                break;
        }

        this.materials.push(material);
        this.updateMaterialsDisplay();
        this.closeMaterialModal();
        this.showNotification('Material adicionado com sucesso!', 'success');
        this.autoSave();
    }

    getVideoEmbedUrl(url) {
        // Convert YouTube URLs to embed format
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // Convert Vimeo URLs
        if (url.includes('vimeo.com/')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return url;
    }

    updateQuestionsDisplay() {
        const container = document.getElementById('questionsList');
        if (!container) return;

        if (this.questions.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma questão adicionada ainda.</p>';
            return;
        }

        container.innerHTML = this.questions.map(question => `
            <div class="question-item" data-id="${question.id}">
                <div class="question-content">
                    <h4>${question.text}</h4>
                    <div class="question-meta">
                        <span class="type">${this.getQuestionTypeLabel(question.type)}</span>
                        <span class="points">${question.points} pontos</span>
                        ${question.options.length > 0 ? `<span class="options">${question.options.length} opções</span>` : ''}
                    </div>
                </div>
                <div class="question-actions">
                    <button class="btn-icon" title="Editar questão" onclick="quizApp.editQuestion('${question.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Remover questão" onclick="quizApp.removeQuestion('${question.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateMaterialsDisplay() {
        const container = document.getElementById('materialsList');
        if (!container) return;

        if (this.materials.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum material adicionado ainda.</p>';
            return;
        }

        container.innerHTML = this.materials.map(material => `
            <div class="material-item" data-id="${material.id}">
                <div class="material-content">
                    <div class="material-icon">
                        <i class="fas fa-${this.getMaterialIcon(material.type)}"></i>
                    </div>
                    <div class="material-info">
                        <h4>${material.title}</h4>
                        <p>${material.description || this.getMaterialTypeLabel(material.type)}</p>
                        ${material.url ? `<small><a href="${material.url}" target="_blank" rel="noopener">${material.url}</a></small>` : ''}
                        ${material.file ? `<small>Arquivo: ${material.file.name} (${this.formatFileSize(material.file.size)})</small>` : ''}
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn-icon" title="Editar material" onclick="quizApp.editMaterial('${material.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Remover material" onclick="quizApp.removeMaterial('${material.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getQuestionTypeLabel(type) {
        const labels = {
            multipla: 'Múltipla Escolha',
            'verdadeiro-falso': 'Verdadeiro/Falso',
            dissertativa: 'Dissertativa'
        };
        return labels[type] || type;
    }

    getMaterialTypeLabel(type) {
        const labels = {
            video: 'Vídeo Explicativo',
            pdf: 'Material PDF',
            link: 'Link Externo'
        };
        return labels[type] || type;
    }

    getMaterialIcon(type) {
        const icons = {
            video: 'video',
            pdf: 'file-pdf',
            link: 'link'
        };
        return icons[type] || 'file';
    }

    editQuestion(id) {
        const question = this.questions.find(q => q.id == id);
        if (!question) return;

        // Populate modal with question data
        document.getElementById('questionText').value = question.text;
        document.getElementById('questionType').value = question.type;
        document.getElementById('questionPoints').value = question.points;

        this.openQuestionModal(question.type);

        // Update save button to edit mode
        const saveBtn = document.getElementById('saveQuestion');
        saveBtn.textContent = 'Atualizar Questão';
        saveBtn.onclick = () => this.updateQuestion(id);
    }

    updateQuestion(id) {
        // Remove old question
        this.questions = this.questions.filter(q => q.id != id);
        
        // Save as new (reusing save logic)
        this.saveQuestion();
        
        // Reset save button
        const saveBtn = document.getElementById('saveQuestion');
        saveBtn.textContent = 'Salvar Questão';
        saveBtn.onclick = () => this.saveQuestion();
    }

    removeQuestion(id) {
        if (confirm('Tem certeza que deseja remover esta questão?')) {
            this.questions = this.questions.filter(q => q.id != id);
            this.updateQuestionsDisplay();
            this.showNotification('Questão removida com sucesso!', 'success');
            this.autoSave();
        }
    }

    editMaterial(id) {
        const material = this.materials.find(m => m.id == id);
        if (!material) return;

        this.openMaterialModal(material.type);

        // Populate form with material data
        document.getElementById('materialTitle').value = material.title;
        document.getElementById('materialDescription').value = material.description || '';

        if (material.type === 'video' || material.type === 'link') {
            document.getElementById(material.type === 'video' ? 'videoUrl' : 'linkUrl').value = material.url;
        }

        if (material.type === 'link') {
            document.getElementById('linkTarget').value = material.target || '_blank';
        }

        // Update save button to edit mode
        const saveBtn = document.getElementById('saveMaterial');
        saveBtn.textContent = 'Atualizar Material';
        saveBtn.onclick = () => this.updateMaterial(id);
    }

    updateMaterial(id) {
        // Remove old material
        this.materials = this.materials.filter(m => m.id != id);
        
        // Save as new (reusing save logic)
        this.saveMaterial();
        
        // Reset save button
        const saveBtn = document.getElementById('saveMaterial');
        saveBtn.textContent = 'Adicionar Material';
        saveBtn.onclick = () => this.saveMaterial();
    }

    removeMaterial(id) {
        if (confirm('Tem certeza que deseja remover este material?')) {
            this.materials = this.materials.filter(m => m.id != id);
            this.updateMaterialsDisplay();
            this.showNotification('Material removido com sucesso!', 'success');
            this.autoSave();
        }
    }

    viewQuestion(questionItem) {
        this.showNotification('Visualização de questão em desenvolvimento.', 'info');
    }

    addQuestionFromBank(questionItem) {
        // Simulate adding a question from the bank
        const bankQuestion = {
            id: Date.now(),
            text: 'Qual é a fórmula de Bhaskara?',
            type: 'multipla',
            points: 10,
            options: [
                'x = (-b ± √(b² - 4ac)) / 2a',
                'x = (-b ± √(b² + 4ac)) / 2a',
                'x = (b ± √(b² - 4ac)) / 2a',
                'x = (-b ± √(b² - 4ac)) / a'
            ],
            correctAnswer: 0,
            createdAt: new Date().toISOString()
        };

        this.questions.push(bankQuestion);
        this.updateQuestionsDisplay();
        this.showNotification('Questão adicionada do banco!', 'success');
        this.autoSave();
    }

    saveQuiz() {
        if (!this.validateQuiz()) {
            return;
        }

        const quizToSave = {
            ...this.quizData,
            questions: this.questions,
            materials: this.materials,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.showLoadingState(true);
        
        // Simulate API call
        setTimeout(() => {
            try {
                localStorage.setItem('savedQuiz', JSON.stringify(quizToSave));
                this.showLoadingState(false);
                this.showNotification('Quiz salvo com sucesso!', 'success');
                
                // Clear auto-save
                localStorage.removeItem('autoSaveQuiz');
                
                setTimeout(() => {
                    this.showNotification('Redirecionando para a lista de quizzes...', 'info');
                }, 1500);
            } catch (error) {
                this.showLoadingState(false);
                this.showNotification('Erro ao salvar quiz. Tente novamente.', 'error');
            }
        }, 2000);
    }

    validateQuiz() {
        if (!this.quizData.titulo.trim()) {
            this.showNotification('Por favor, digite um título para o quiz.', 'error');
            this.switchTab('informacoes');
            setTimeout(() => {
                document.getElementById('tituloQuiz').focus();
            }, 100);
            return false;
        }

        if (this.questions.length === 0) {
            this.showNotification('Adicione pelo menos uma questão ao quiz.', 'error');
            this.switchTab('questoes');
            return false;
        }

        return true;
    }

    autoSave() {
        const autoSaveData = {
            ...this.quizData,
            questions: this.questions,
            materials: this.materials,
            lastAutoSave: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('autoSaveQuiz', JSON.stringify(autoSaveData));
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    loadSavedData() {
        const autoSaved = localStorage.getItem('autoSaveQuiz');
        if (autoSaved) {
            try {
                const data = JSON.parse(autoSaved);
                this.quizData = { ...this.quizData, ...data };
                this.questions = data.questions || [];
                this.materials = data.materials || [];
                this.updateFormValues();
                
                if (data.lastAutoSave) {
                    const lastSave = new Date(data.lastAutoSave);
                    const now = new Date();
                    const diffMinutes = Math.floor((now - lastSave) / (1000 * 60));
                    
                    if (diffMinutes < 60) {
                        this.showNotification(`Dados recuperados do auto-save (${diffMinutes} min atrás)`, 'info');
                    }
                }
            } catch (error) {
                console.error('Error loading auto-saved data:', error);
            }
        }
    }

    updateFormValues() {
        document.getElementById('tituloQuiz').value = this.quizData.titulo || '';
        document.getElementById('materia').value = this.quizData.materia || 'matematica';
        document.getElementById('turma').value = this.quizData.turma || '8a';
        document.getElementById('tempoLimite').value = this.quizData.tempoLimite || 20;
        document.getElementById('dificuldade').value = this.quizData.dificuldade || 'facil';
        document.getElementById('pontuacaoMaxima').value = this.quizData.pontuacaoMaxima || 100;
    }

    goBack() {
        const hasChanges = this.questions.length > 0 || this.materials.length > 0 || this.quizData.titulo.trim();
        
        if (hasChanges && !confirm('Tem certeza que deseja sair? Alterações não salvas serão perdidas.')) {
            return;
        }
        
        this.showNotification('Voltando para a página anterior...', 'info');
        setTimeout(() => {
            window.history.back();
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Fechar notificação">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showLoadingState(show) {
        const saveBtn = document.getElementById('salvarQuizBtn');
        const overlay = document.getElementById('loadingOverlay');
        
        if (show) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="spinner"></div> Salvando...';
            saveBtn.classList.add('loading');
            overlay.style.display = 'flex';
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Quiz';
            saveBtn.classList.remove('loading');
            overlay.style.display = 'none';
        }
    }

    updateUI() {
        this.updateQuestionsDisplay();
        this.updateMaterialsDisplay();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizApp;
}