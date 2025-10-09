# -*- coding: utf-8 -*-
from mysql.connector import Error

def registrar_auditoria(db, id_usuario: int, acao: str, entidade: str, descricao: str):
    """
    Insere um registro na tabela de auditoria.
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            '''INSERT INTO auditoria (id_usuario, acao, entidade_afetada, descricao)
               VALUES (%s, %s, %s, %s)''',
            (id_usuario, acao, entidade, descricao)
        )
        db.commit()
    except Error as e:
        print(f"Erro ao registrar auditoria: {e}")
        db.rollback()
        raise
    finally:
        cursor.close()