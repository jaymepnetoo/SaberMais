# -*- coding: utf-8 -*-
from typing import Optional, Dict
from mysql.connector import Error
import datetime
from repository.aluno_repository import create_aluno
from repository.auditoria_repository import registrar_auditoria


def create_user(db, name: str, email: str, password_hash: str, tipo_usuario: str = 'ALUNO', id_escola: Optional[int] = None) -> Optional[int]:
    """
    Cria um novo usuário e realiza ações relacionadas (aluno/auditoria).
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            '''INSERT INTO usuario (nome, email, senha, tipo_usuario, id_escola) 
               VALUES (%s, %s, %s, %s, %s)''',
            (name, email, password_hash, tipo_usuario, id_escola)
        )
        db.commit()
        user_id = cursor.lastrowid

        # Se for aluno, cria registro na tabela aluno
        if tipo_usuario.upper() == 'ALUNO':
            create_aluno(db, user_id)

        # Registra auditoria
        acao = f"Criação de usuário: {name} ({tipo_usuario})"
        descricao = f"Usuário criado em {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        registrar_auditoria(db, user_id, acao, 'usuario', descricao)

        return user_id

    except Error as e:
        print(f"Erro ao criar usuário: {e}")
        db.rollback()
        return None

    finally:
        cursor.close()


def get_user_by_email(db, email: str) -> Optional[Dict]:
    """
    Busca um usuário pelo e-mail.
    """
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM usuario WHERE email = %s", (email,))
        return cursor.fetchone()
    except Error as e:
        print(f"Erro ao buscar usuário: {e}")
        return None
    finally:
        cursor.close()


def update_tipo_usuario(db, user_id: int, tipo_usuario: str) -> bool:
    """
    Atualiza o tipo de usuário (ex: ALUNO → PROFESSOR).
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE usuario SET tipo_usuario = %s WHERE id_usuario = %s",
            (tipo_usuario, user_id)
        )
        db.commit()
        return True
    except Error as e:
        print(f"Erro ao atualizar tipo de usuário: {e}")
        db.rollback()
        return False
    finally:
        cursor.close()