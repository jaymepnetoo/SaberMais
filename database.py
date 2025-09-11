# -*- coding: utf-8 -*-
"""
Módulo de configuração e gerenciamento do banco de dados SQLite.
Implementa o padrão Repository para acesso aos dados.
"""
import sqlite3
import os
from flask import g, current_app

def get_db():
    """
    Obtém conexão com banco de dados SQLite.
    
    Returns
    -------
    sqlite3.Connection
        Conexão ativa com o banco de dados
    """
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=current_app.config['sbmdatabase.cxs6wq44otse.sa-east-1.rds.amazonaws.com'],
            user=current_app.config['admin'],
            password=current_app.config['sbmsenha8'],
            database=current_app.config['sbmaisdatabase']
        )
    return g.db

def close_db(e=None):
    """
    Fecha conexão com banco de dados.
    
    Parameters
    ----------
    e : Exception, optional
        Exceção que pode ter causado o fechamento
    """
    db = g.pop('db', None)
    
    if db is not None:
        db.close()

def init_app(app):
    """
    Registra funções de banco de dados na aplicação Flask.
    
    Parameters
    ----------
    app : Flask
        Instância da aplicação Flask
    """
    app.teardown_appcontext(close_db)
