import sqlite3
from pathlib import Path
from typing import Optional
from datetime import datetime


# =========================================================
# DATABASE LOCATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

DB_PATH = BASE_DIR / "agri_chat.db"


# =========================================================
# CONNECTION
# =========================================================

def get_connection():

    connection = sqlite3.connect(
        DB_PATH,
        check_same_thread=False
    )

    connection.row_factory = sqlite3.Row

    # Enable foreign keys
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


# =========================================================
# INITIALIZE DATABASE
# =========================================================

def init_db():

    connection = get_connection()

    cursor = connection.cursor()

    # -----------------------------------------------------
    # CHAT SESSIONS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id TEXT NOT NULL,

            title TEXT NOT NULL DEFAULT 'New Chat',

            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

        )
    """)

    # -----------------------------------------------------
    # CHAT MESSAGES
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            session_id INTEGER NOT NULL,

            role TEXT NOT NULL,

            content TEXT NOT NULL,

            confidence REAL,

            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (session_id)
            REFERENCES chat_sessions(id)
            ON DELETE CASCADE

        )
    """)

    connection.commit()

    connection.close()

    print("SQLite database initialized.")
    print("Database:", DB_PATH)


# =========================================================
# CREATE SESSION
# =========================================================

def create_session(
    user_id: str,
    title: str = "New Chat"
):

    connection = get_connection()

    cursor = connection.cursor()

    # Explicit timestamp
    now = datetime.now().isoformat(timespec="seconds")

    cursor.execute(
        """
        INSERT INTO chat_sessions
        (
            user_id,
            title,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            user_id,
            title,
            now,
            now
        )
    )

    session_id = cursor.lastrowid

    connection.commit()

    connection.close()

    return session_id


# =========================================================
# GET USER SESSIONS
# =========================================================

def get_sessions(user_id: str):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            user_id,
            title,
            created_at,
            updated_at
        FROM chat_sessions
        WHERE user_id = ?
        ORDER BY updated_at DESC
        """,
        (user_id,)
    )

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


# =========================================================
# GET ONE SESSION
# =========================================================

def get_session(
    session_id: int,
    user_id: str
):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM chat_sessions
        WHERE id = ?
        AND user_id = ?
        """,
        (
            session_id,
            user_id
        )
    )

    row = cursor.fetchone()

    connection.close()

    if row:
        return dict(row)

    return None


# =========================================================
# GET MESSAGES
# =========================================================

def get_messages(
    session_id: int
):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            session_id,
            role,
            content,
            confidence,
            created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY id ASC
        """,
        (session_id,)
    )

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


# =========================================================
# SAVE MESSAGE
# =========================================================

def save_message(
    session_id: int,
    role: str,
    content: str,
    confidence: Optional[float] = None
):

    connection = get_connection()

    cursor = connection.cursor()

    now = datetime.now().isoformat(timespec="seconds")

    cursor.execute(
        """
        INSERT INTO chat_messages
        (
            session_id,
            role,
            content,
            confidence,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            session_id,
            role,
            content,
            confidence,
            now
        )
    )

    cursor.execute(
        """
        UPDATE chat_sessions
        SET updated_at = ?
        WHERE id = ?
        """,
        (
            now,
            session_id
        )
    )

    connection.commit()

    connection.close()


# =========================================================
# RENAME SESSION
# =========================================================

def rename_session(
    session_id: int,
    user_id: str,
    title: str
):

    connection = get_connection()

    cursor = connection.cursor()

    now = datetime.now().isoformat(timespec="seconds")

    cursor.execute(
        """
        UPDATE chat_sessions
        SET
            title = ?,
            updated_at = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            title,
            now,
            session_id,
            user_id
        )
    )

    changed = cursor.rowcount > 0

    connection.commit()

    connection.close()

    return changed


# =========================================================
# DELETE SESSION
# =========================================================

def delete_session(
    session_id: int,
    user_id: str
):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM chat_sessions
        WHERE id = ?
        AND user_id = ?
        """,
        (
            session_id,
            user_id
        )
    )

    deleted = cursor.rowcount > 0

    connection.commit()

    connection.close()

    return deleted