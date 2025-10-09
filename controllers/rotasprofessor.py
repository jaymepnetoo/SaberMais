# -*- coding: utf-8 -*-
from flask import Blueprint, jsonify, render_template, session, redirect, url_for
from model.models import User
from services.user_service import get_user_info
import mysql.connector

# Cria o blueprint para as rotas do professor
rotas_professor = Blueprint('rotas_professor', __name__)

# Configuração do banco de dados (igual à usada no app.py)
DB_CONFIG = {
    'host': 'sbmdatabase.cxs6wq44otse.sa-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'sbmsenha8',
    'database': 'sbmdatabase',
    'ssl_disabled': True
}

def get_db():
    """Retorna uma conexão MySQL ativa."""
    return mysql.connector.connect(**DB_CONFIG)


# ======================
# ROTAS DO PROFESSOR
# ======================

@rotas_professor.route('/homeprofessor')
def home_professor():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('Professor/homeprofessor.html')


@rotas_professor.route('/turmas')
def turmas():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('Professor/turmas.html')

@rotas_professor.route('/criarquiz')
def criarquiz():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('Professor/criarquiz.html')


@rotas_professor.route('/relatorios')
def relatorios():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('Professor/relatorios.html')


@rotas_professor.route('/meusquizzes')
def meusquizzes():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('Professor/meus-quizzes.html')


@rotas_professor.route('/forum')
def forum():
    if 'user_id' not in session or session.get('user_tipo') != 'PROFESSOR':
        return redirect(url_for('index'))
    return render_template('Professor/forum.html')

@rotas_professor.route('/api/user/current', methods=['GET'])
def get_current_user():
    """Retorna o nome e o tipo do usuário logado"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401

    db = get_db()
    user = get_user_info(db, session['user_id'])
    db.close()

    if user:
        return jsonify({
            'success': True,
            'nome': user['nome'],
            'tipo_usuario': user['tipo_usuario']
        })
    else:
        return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 404

