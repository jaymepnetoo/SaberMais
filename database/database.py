# -*- coding: utf-8 -*-
import mysql.connector
from flask import g
from config.config import DB_CONFIG

def get_db():
    """Retorna conexão MySQL ativa (um único objeto por request usando flask.g)."""
    db = getattr(g, '_database', None)
    if db is None:
        db = mysql.connector.connect(**DB_CONFIG)
        g._database = db
    return db

def close_db(e=None):
    db = getattr(g, '_database', None)
    if db is not None:
        try:
            db.close()
        except Exception:
            pass

def init_app(app):
    """
    Registra funções de banco de dados na aplicação Flask.
    
    Parameters
    ----------
    app : Flask
        Instância da aplicação Flask
    """
    app.teardown_appcontext(close_db)