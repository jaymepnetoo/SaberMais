# -*- coding: utf-8 -*-
"""
Aplicação principal Flask para Saber+
Backend Clean Architecture
"""
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from models import User
import mysql.connector
import os

app = Flask(__name__)
app.secret_key = 'saber_mais_secret_key_2024'  # Em produção, usar variável de ambiente

# Configuração do banco de dados
DB_CONFIG = {
    'host': 'sbmdatabase.cxs6wq44otse.sa-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'sbmsenha8',
    'database': 'sbmdatabase'
}

def get_db():
    """Retorna uma conexão MySQL ativa."""
    return mysql.connector.connect(**DB_CONFIG)

@app.route('/')
def index():
    """Página inicial - formulário de login/registro."""
    return render_template('inicial.html')

@app.route('/selecionar-perfil')
def selecionar_perfil():
    """Página de seleção de perfil do usuário."""
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('segundatela.html')

@app.route('/homeprofessor')
def home_professor():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('homeprofessor.html')

@app.route('/turmas')
def turmas():
    return render_template('turmas.html')

@app.route('/relatorios')
def relatorios():
    return render_template('relatorios.html')

@app.route('/meusquizzes')
def meusquizzes():
    return render_template('meus-quizzes.html')

@app.route('/forum')
def forum():
    return render_template('forum.html')

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Endpoint para autenticação de usuário."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email e senha são obrigatórios'}), 400
        
        db = get_db()
        user = User.get_by_email(db, email)
        db.close()
        
        # Comparação simples de senha, pois está em texto puro
        if user and user['senha'] == password:
            session['user_id'] = user['id_usuario']
            session['user_email'] = user['email']
            session['user_name'] = user['nome']
            session['user_tipo'] = user['tipo_usuario']

            # Redirecionamento conforme tipo de usuário
            if user['tipo_usuario'] == 'PROFESSOR':
                redirect_url = '/homeprofessor'  # Tela específica para professor
            else:
                redirect_url = '/selecionar-perfil'  # Alunos e demais perfis

            return jsonify({
                'success': True, 
                'message': 'Login realizado com sucesso',
                'redirect': redirect_url
            })
        else:
            return jsonify({'success': False, 'message': 'Email ou senha inválidos'}), 401
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Endpoint para registro de novo usuário."""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not email or not password:
            return jsonify({'success': False, 'message': 'Todos os campos são obrigatórios'}), 400
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Senha deve ter pelo menos 6 caracteres'}), 400
        
        db = get_db()
        
        # Verifica se email já existe
        if User.get_by_email(db, email):
            db.close()
            return jsonify({'success': False, 'message': 'Email já cadastrado'}), 400
        
        # Cria novo usuário (senha em texto puro)
        user_id = User.create(db, name, email, password)
        db.close()
        
        if user_id:
            session['user_id'] = user_id
            session['user_email'] = email
            session['user_name'] = name
            session['user_tipo'] = 'ALUNO'
            
            return jsonify({
                'success': True, 
                'message': 'Cadastro realizado com sucesso',
                'redirect': '/selecionar-perfil'
            })
        else:
            return jsonify({'success': False, 'message': 'Erro ao criar usuário'}), 500
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/profile/select', methods=['POST'])
def select_profile():
    """Endpoint para seleção de perfil do usuário."""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
        
        data = request.get_json()
        profile_type = data.get('profile_type')
        
        if profile_type.upper() not in ['ALUNO', 'PROFESSOR', 'COORDENADOR', 'DIRETOR', 'RESPONSAVEL']:
            return jsonify({'success': False, 'message': 'Tipo de perfil inválido'}), 400
        
        db = get_db()
        success = User.update_tipo_usuario(db, session['user_id'], profile_type.upper())
        db.close()
        
        if success:
            session['user_tipo'] = profile_type.upper()
            return jsonify({
                'success': True, 
                'message': f'Perfil {profile_type.upper()} selecionado com sucesso',
                'profile': profile_type.upper()
            })
        else:
            return jsonify({'success': False, 'message': 'Erro ao atualizar perfil'}), 500
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Endpoint para logout do usuário."""
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

@app.errorhandler(404)
def not_found(error):
    """Handler para páginas não encontradas."""
    return jsonify({'success': False, 'message': 'Página não encontrada'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler para erros internos do servidor."""
    return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)