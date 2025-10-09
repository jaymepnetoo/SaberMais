# -*- coding: utf-8 -*-
from model.models import User
from typing import Optional, Dict

def authenticate(db, email: str, password: str) -> Optional[Dict]:
    """
    Autentica usuário: retorna o dict do usuário se ok, caso contrário None.
    Atualmente compara senha em texto puro (preservando comportamento atual).
    """
    user = User.get_by_email(db, email)
    if user and user.get('senha') == password:
        return user
    return None

def register_user(db, name: str, email: str, password: str) -> Optional[int]:
    """
    Registra usuário e retorna user_id ou None.
    Adicione validações aqui se quiser (e.g. checar formato de email).
    """
    return User.create(db, name, email, password)
