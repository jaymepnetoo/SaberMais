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
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row  # Permite acesso por nome de coluna
    
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

def init_db():
    """
    Inicializa o banco de dados criando as tabelas necessárias.
    
    Raises
    ------
    sqlite3.Error
        Erro ao executar comandos SQL
    """
    db = get_db()
    
    # Schema do banco de dados
    schema = '''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_type TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    CREATE INDEX IF NOT EXISTS idx_users_profile_type ON users (profile_type);
    '''
    
    try:
        db.executescript(schema)
        db.commit()
    except sqlite3.Error as e:
        print(f"Erro ao inicializar banco de dados: {e}")
        raise

def init_app(app):
    """
    Registra funções de banco de dados na aplicação Flask.
    
    Parameters
    ----------
    app : Flask
        Instância da aplicação Flask
    """
    app.teardown_appcontext(close_db)
