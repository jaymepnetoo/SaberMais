# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from config.config import SECRET_KEY
from database.database import get_db, close_db
from model.models import User
from controllers.rotasaluno import rotas_aluno
from controllers.rotasprofessor import rotas_professor

app = Flask(__name__)
app.secret_key = SECRET_KEY

# registra blueprints
app.register_blueprint(rotas_aluno)
app.register_blueprint(rotas_professor)

# registra teardown para fechar conexão do DB
app.teardown_appcontext(close_db)

@app.route('/')
def index():
    return render_template('inicial.html')

@app.route('/selecionar-perfil')
def selecionar_perfil():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('segundatela.html')

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email e senha são obrigatórios'}), 400
        db = get_db()
        user = User.get_by_email(db, email)
        # db closed by teardown at end of request
        if user and user.get('senha') == password:
            session['user_id'] = user['id_usuario']
            session['user_email'] = user['email']
            session['user_name'] = user['nome']
            session['user_tipo'] = user['tipo_usuario']
            if user['tipo_usuario'] == 'PROFESSOR':
                redirect_url = '/homeprofessor'
            elif user['tipo_usuario'] == 'ALUNO':
                redirect_url = '/homealuno'
            else:
                redirect_url = '/selecionar-perfil'
            return jsonify({'success': True, 'message': 'Login realizado com sucesso', 'redirect': redirect_url})
        else:
            return jsonify({'success': False, 'message': 'Email ou senha inválidos'}), 401
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
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
        if User.get_by_email(db, email):
            return jsonify({'success': False, 'message': 'Email já cadastrado'}), 400
        user_id = User.create(db, name, email, password)
        if user_id:
            session['user_id'] = user_id
            session['user_email'] = email
            session['user_name'] = name
            session['user_tipo'] = 'ALUNO'
            return jsonify({'success': True, 'message': 'Cadastro realizado com sucesso', 'redirect': '/selecionar-perfil'})
        else:
            return jsonify({'success': False, 'message': 'Erro ao criar usuário'}), 500
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/profile/select', methods=['POST'])
def select_profile():
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
        data = request.get_json()
        profile_type = data.get('profile_type')
        if profile_type.upper() not in ['ALUNO', 'PROFESSOR', 'COORDENADOR', 'DIRETOR', 'RESPONSAVEL']:
            return jsonify({'success': False, 'message': 'Tipo de perfil inválido'}), 400
        db = get_db()
        success = User.update_tipo_usuario(db, session['user_id'], profile_type.upper())
        if success:
            session['user_tipo'] = profile_type.upper()
            return jsonify({'success': True, 'message': f'Perfil {profile_type.upper()} selecionado com sucesso', 'profile': profile_type.upper()})
        else:
            return jsonify({'success': False, 'message': 'Erro ao atualizar perfil'}), 500
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Página não encontrada'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
