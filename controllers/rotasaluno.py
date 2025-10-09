# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, session, redirect, url_for
import mysql.connector

# Cria o blueprint para as rotas do aluno
rotas_aluno = Blueprint('rotas_aluno', __name__)

# Configuração do banco de dados (se quiser, pode importar de um config.py)
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

@rotas_aluno.route('/homealuno')
def home_aluno():
    if 'user_id' not in session or session.get('user_tipo') != 'ALUNO':
        return redirect(url_for('index'))
    return render_template('Aluno/homealuno.html', nome=session.get('user_name'))

@rotas_aluno.route('/badges')
def badges():
    return render_template('Aluno/badges.html')

@rotas_aluno.route('/fazerperguntaforum')
def fazerperguntaforum():
    return render_template('Aluno/fazer_pergunta_forum.html')

@rotas_aluno.route('/forumaluno')
def forumaluno():
    return render_template('Aluno/forumaluno.html')

@rotas_aluno.route('/respostasforum')
def respostasforum():
    return render_template('Aluno/respostas_forum.html')