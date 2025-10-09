# -*- coding: utf-8 -*-
from mysql.connector import Error

def create_aluno(db, user_id: int):
    """
    Cria um registro na tabela aluno associado a um usuário existente.
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            '''INSERT INTO aluno (id_usuario) VALUES (%s)''',
            (user_id,)
        )
        db.commit()
    except Error as e:
        print(f"Erro ao criar aluno: {e}")
        db.rollback()
        raise
    finally:
        cursor.close()