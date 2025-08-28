# Saber+ - Plataforma Educacional

Sistema web para gestão educacional com perfis diferenciados para alunos e professores.

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com separação clara de responsabilidades:

- **app.py**: Aplicação principal Flask com rotas e endpoints
- **models.py**: Modelos de dados e padrão Repository
- **database.py**: Configuração e gerenciamento do banco SQLite
- **templates/**: Templates HTML das páginas

## 🚀 Funcionalidades Implementadas

### Autenticação
- ✅ Cadastro de usuários com validação
- ✅ Login com email e senha
- ✅ Hash seguro de senhas com Werkzeug
- ✅ Sessões de usuário

### Perfis de Usuário
- ✅ Seleção de perfil (Aluno/Professor)
- ✅ Persistência do tipo de perfil no banco

### Banco de Dados
- ✅ SQLite com schema automático
- ✅ Tabela de usuários com índices otimizados
- ✅ Timestamps de criação e atualização

## 🛠️ Instalação e Execução

### Pré-requisitos
- Python 3.8+
- pip

### Passos para executar

1. **Clone o repositório** (se aplicável)
```bash
git clone <repositorio>
cd SaberMais
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

3. **Execute a aplicação**
```bash
python app.py
```

4. **Acesse no navegador**
```
http://localhost:5000
```

## 📊 Banco de Dados

O sistema utiliza SQLite com a seguinte estrutura:

### Tabela `users`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária auto-incremento |
| name | TEXT | Nome completo do usuário |
| email | TEXT | Email único (índice) |
| password_hash | TEXT | Hash da senha |
| profile_type | TEXT | Tipo de perfil ('aluno' ou 'professor') |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data da última atualização |

## 🔐 Segurança

- **Senhas**: Hash seguro usando Werkzeug PBKDF2
- **Validação**: Validação de entrada em todos os endpoints
- **Sessões**: Gerenciamento seguro de sessões Flask
- **SQL Injection**: Uso de prepared statements

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/logout` - Logout

### Perfil
- `POST /api/profile/select` - Seleção de perfil

### Páginas
- `GET /` - Página de login/cadastro
- `GET /selecionar-perfil` - Página de seleção de perfil

## 🎯 Próximos Passos

Para expandir o sistema, considere implementar:

1. **Dashboard específico** para cada perfil
2. **Sistema de turmas** e matrículas
3. **Criação e gestão de quizzes**
4. **Relatórios e analytics**
5. **Upload de materiais**
6. **Sistema de notificações**

## 🏛️ Estrutura do Projeto

```
SaberMais/
├── app.py              # Aplicação principal Flask
├── database.py         # Configuração do banco de dados
├── models.py           # Modelos e Repository pattern
├── requirements.txt    # Dependências Python
├── README.md          # Documentação
├── templates/         # Templates HTML
│   ├── inicial.html   # Página de login/cadastro
│   └── segundatela.html # Página de seleção de perfil
└── saber_mais.db      # Banco SQLite (criado automaticamente)
```

## 💻 Tecnologias Utilizadas

- **Backend**: Flask 2.3.3
- **Banco de Dados**: SQLite3
- **Segurança**: Werkzeug para hash de senhas
- **Frontend**: HTML5, CSS3, JavaScript (Fetch API)
- **Arquitetura**: Clean Architecture / Repository Pattern

## 🎨 Design

O design das páginas foi mantido conforme especificado, com apenas pequenas integrações JavaScript para comunicação com o backend via API REST.
O Saber+ é um projeto acadêmico desenvolvido na disciplina de Soluções Computacionais do 8º semestre de Ciência da Computação da UCB. Nosso objetivo é criar uma plataforma educacional gamificada, voltada para a criação de quizzes e questionários interativos que tornem o estudo mais divertido e envolvente.
