# -*- coding: utf-8 -*-
"""
Aplicação principal Flask para Saber+
Backend Clean Architecture
"""
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from database import init_db, get_db, init_app
from models import User
import os

app = Flask(__name__)
app.secret_key = 'saber_mais_secret_key_2024'  # Em produção, usar variável de ambiente

# Configuração do banco de dados
DATABASE = 'saber_mais.db'
app.config['DATABASE'] = DATABASE

# Inicializa configurações do banco
init_app(app)

@app.before_request
def before_request():
    """Garante que o banco de dados esteja inicializado."""
    if not hasattr(app, 'db_initialized'):
        init_db()
        app.db_initialized = True

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

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Endpoint para autenticação de usuário.
    
    Returns
    -------
    dict
        JSON com resultado da autenticação
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email e senha são obrigatórios'}), 400
        
        db = get_db()
        user = User.get_by_email(db, email)
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['user_email'] = user['email']
            session['user_name'] = user['name']
            
            return jsonify({
                'success': True, 
                'message': 'Login realizado com sucesso',
                'redirect': '/selecionar-perfil'
            })
        else:
            return jsonify({'success': False, 'message': 'Email ou senha inválidos'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Endpoint para registro de novo usuário.
    
    Returns
    -------
    dict
        JSON com resultado do registro
    """
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
            return jsonify({'success': False, 'message': 'Email já cadastrado'}), 400
        
        # Cria novo usuário
        password_hash = generate_password_hash(password)
        user_id = User.create(db, name, email, password_hash)
        
        if user_id:
            session['user_id'] = user_id
            session['user_email'] = email
            session['user_name'] = name
            
            return jsonify({
                'success': True, 
                'message': 'Cadastro realizado com sucesso',
                'redirect': '/selecionar-perfil'
            })
        else:
            return jsonify({'success': False, 'message': 'Erro ao criar usuário'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/profile/select', methods=['POST'])
def select_profile():
    """
    Endpoint para seleção de perfil do usuário.
    
    Returns
    -------
    dict
        JSON com resultado da seleção
    """
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
        
        data = request.get_json()
        profile_type = data.get('profile_type')
        
        if profile_type not in ['aluno', 'professor']:
            return jsonify({'success': False, 'message': 'Tipo de perfil inválido'}), 400
        
        db = get_db()
        success = User.update_profile(db, session['user_id'], profile_type)
        
        if success:
            session['user_profile'] = profile_type
            return jsonify({
                'success': True, 
                'message': f'Perfil {profile_type} selecionado com sucesso',
                'profile': profile_type
            })
        else:
            return jsonify({'success': False, 'message': 'Erro ao atualizar perfil'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """
    Endpoint para logout do usuário.
    
    Returns
    -------
    dict
        JSON com resultado do logout
    """
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
