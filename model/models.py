# -*- coding: utf-8 -*-
from typing import Optional, Dict
from repository.user_repository import create_user, get_user_by_email, update_tipo_usuario

class User:
    @staticmethod
    def get_by_email(db, email) -> Optional[Dict]:
        return get_user_by_email(db, email)

    @staticmethod
    def create(db, name, email, password, tipo_usuario='ALUNO', id_escola=None) -> Optional[int]:
        return create_user(db, name, email, password, tipo_usuario, id_escola)

    @staticmethod
    def update_tipo_usuario(db, user_id, tipo) -> bool:
        return update_tipo_usuario(db, user_id, tipo)
    
    @staticmethod
    def get_by_id(db, user_id):
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id_usuario, nome, tipo_usuario FROM usuario WHERE id_usuario = %s", (user_id,))
            return cursor.fetchone()
        finally:
            cursor.close()
