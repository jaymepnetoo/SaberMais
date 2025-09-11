# -*- coding: utf-8 -*-
"""
Modelos de dados para a aplicação Saber+.
Implementa o padrão Repository para operações CRUD usando MySQL.
"""
from typing import Optional, Dict, Any
import mysql.connector
from mysql.connector import Error

class User:
    """
    Modelo de usuário com operações de banco de dados.
    Implementa padrão Repository para acesso aos dados.
    """
    
    @staticmethod
    def create(db: mysql.connector.connection_cext.CMySQLConnection, name: str, email: str, password_hash: str, tipo_usuario: str = 'ALUNO') -> Optional[int]:
        """
        Cria um novo usuário no banco de dados.
        """
        try:
            cursor = db.cursor()
            cursor.execute(
                '''INSERT INTO usuario (nome, email, senha, tipo_usuario) 
                   VALUES (%s, %s, %s, %s)''',
                (name, email, password_hash, tipo_usuario)
            )
            db.commit()
            return cursor.lastrowid
        except Error as e:
            print(f"Erro ao criar usuário: {e}")
            db.rollback()
            return None
    
    @staticmethod
    def get_by_id(db: mysql.connector.connection_cext.CMySQLConnection, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por ID.
        """
        try:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                '''SELECT id_usuario, nome, email, senha, tipo_usuario, criado_em
                   FROM usuario WHERE id_usuario = %s''',
                (user_id,)
            )
            return cursor.fetchone()
        except Error as e:
            print(f"Erro ao buscar usuário por ID: {e}")
            return None

    @staticmethod
    def get_by_email(db: mysql.connector.connection_cext.CMySQLConnection, email: str) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por email.
        """
        try:
            cursor = db.cursor(dictionary=True)
            cursor.execute(
                '''SELECT id_usuario, nome, email, senha, tipo_usuario, criado_em
                   FROM usuario WHERE email = %s''',
                (email,)
            )
            return cursor.fetchone()
        except Error as e:
            print(f"Erro ao buscar usuário por email: {e}")
            return None
    
    @staticmethod
    def update_tipo_usuario(db: mysql.connector.connection_cext.CMySQLConnection, user_id: int, tipo_usuario: str) -> bool:
        """
        Atualiza o tipo de usuário.
        """
        try:
            cursor = db.cursor()
            cursor.execute(
                '''UPDATE usuario 
                   SET tipo_usuario = %s 
                   WHERE id_usuario = %s''',
                (tipo_usuario, user_id)
            )
            db.commit()
            return cursor.rowcount > 0
        except Error as e:
            print(f"Erro ao atualizar tipo de usuário: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def update_password(db: mysql.connector.connection_cext.CMySQLConnection, user_id: int, new_password_hash: str) -> bool:
        """
        Atualiza a senha do usuário.
        """
        try:
            cursor = db.cursor()
            cursor.execute(
                '''UPDATE usuario 
                   SET senha = %s 
                   WHERE id_usuario = %s''',
                (new_password_hash, user_id)
            )
            db.commit()
            return cursor.rowcount > 0
        except Error as e:
            print(f"Erro ao atualizar senha do usuário: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def delete(db: mysql.connector.connection_cext.CMySQLConnection, user_id: int) -> bool:
        """
        Remove usuário do banco de dados.
        """
        try:
            cursor = db.cursor()
            cursor.execute('DELETE FROM usuario WHERE id_usuario = %s', (user_id,))
            db.commit()
            return cursor.rowcount > 0
        except Error as e:
            print(f"Erro ao remover usuário: {e}")
            db.rollback()
            return False
