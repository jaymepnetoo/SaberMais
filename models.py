# -*- coding: utf-8 -*-
"""
Modelos de dados para a aplicação Saber+.
Implementa o padrão Repository para operações CRUD.
"""
import sqlite3
from typing import Optional, Dict, Any

class User:
    """
    Modelo de usuário com operações de banco de dados.
    Implementa padrão Repository para acesso aos dados.
    """
    
    @staticmethod
    def create(db: sqlite3.Connection, name: str, email: str, password_hash: str) -> Optional[int]:
        """
        Cria um novo usuário no banco de dados.
        
        Parameters
        ----------
        db : sqlite3.Connection
            Conexão com o banco de dados
        name : str
            Nome completo do usuário
        email : str
            Email único do usuário
        password_hash : str
            Hash da senha do usuário
        
        Returns
        -------
        int or None
            ID do usuário criado ou None em caso de erro
        
        Raises
        ------
        sqlite3.Error
            Erro ao executar comando SQL
        """
        try:
            cursor = db.execute(
                '''INSERT INTO users (name, email, password_hash) 
                   VALUES (?, ?, ?)''',
                (name, email, password_hash)
            )
            db.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"Erro ao criar usuário: {e}")
            db.rollback()
            return None
    
    @staticmethod
    def get_by_id(db: sqlite3.Connection, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por ID.
        
        Parameters
        ----------
        db : sqlite3.Connection
            Conexão com o banco de dados
        user_id : int
            ID do usuário
        
        Returns
        -------
        dict or None
            Dados do usuário ou None se não encontrado
        """
        try:
            cursor = db.execute(
                '''SELECT id, name, email, password_hash, profile_type, 
                          created_at, updated_at 
                   FROM users WHERE id = ?''',
                (user_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
        except sqlite3.Error as e:
            print(f"Erro ao buscar usuário por ID: {e}")
            return None
    
    @staticmethod
    def get_by_email(db: sqlite3.Connection, email: str) -> Optional[Dict[str, Any]]:
        """
        Busca usuário por email.
        
        Parameters
        ----------
        db : sqlite3.Connection
            Conexão com o banco de dados
        email : str
            Email do usuário
        
        Returns
        -------
        dict or None
            Dados do usuário ou None se não encontrado
        """
        try:
            cursor = db.execute(
                '''SELECT id, name, email, password_hash, profile_type, 
                          created_at, updated_at 
                   FROM users WHERE email = ?''',
                (email,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
        except sqlite3.Error as e:
            print(f"Erro ao buscar usuário por email: {e}")
            return None
    
    @staticmethod
    def update_profile(db: sqlite3.Connection, user_id: int, profile_type: str) -> bool:
        """
        Atualiza o tipo de perfil do usuário.
        
        Parameters
        ----------
        db : sqlite3.Connection
            Conexão com o banco de dados
        user_id : int
            ID do usuário
        profile_type : str
            Tipo de perfil ('aluno' ou 'professor')
        
        Returns
        -------
        bool
            True se atualizado com sucesso, False caso contrário
        """
        try:
            cursor = db.execute(
                '''UPDATE users 
                   SET profile_type = ?, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ?''',
                (profile_type, user_id)
            )
            db.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as e:
            print(f"Erro ao atualizar perfil do usuário: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def update_password(db: sqlite3.Connection, user_id: int, new_password_hash: str) -> bool:
        """
        Atualiza a senha do usuário.
        
        Parameters
        ----------
        db : sqlite3.Connection
            Conexão com o banco de dados
        user_id : int
            ID do usuário
        new_password_hash : str
            Novo hash da senha
        
        Returns
        -------
        bool
            True se atualizado com sucesso, False caso contrário
        """
        try:
            cursor = db.execute(
                '''UPDATE users 
                   SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ?''',
                (new_password_hash, user_id)
            )
            db.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as e:
            print(f"Erro ao atualizar senha do usuário: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def delete(db: sqlite3.Connection, user_id: int) -> bool:
        """
        Remove usuário do banco de dados.
        
        Parameters
        ----------
        db : sqlite3.Connection
            Conexão com o banco de dados
        user_id : int
            ID do usuário
        
        Returns
        -------
        bool
            True se removido com sucesso, False caso contrário
        """
        try:
            cursor = db.execute('DELETE FROM users WHERE id = ?', (user_id,))
            db.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as e:
            print(f"Erro ao remover usuário: {e}")
            db.rollback()
            return False
