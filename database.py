import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / 'estimates.db'


def get_db_connection():
    """Get a database connection."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize the database with required tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Estimates table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS estimates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            estimate_data TEXT NOT NULL,
            total_rcv REAL,
            room_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()


def create_project(name, description=None):
    """Create a new project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO projects (name, description, updated_at)
        VALUES (?, ?, ?)
    ''', (name, description, datetime.now()))
    
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return project_id


def get_all_projects():
    """Get all projects."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, description, created_at, updated_at
        FROM projects
        ORDER BY updated_at DESC
    ''')
    
    projects = []
    for row in cursor.fetchall():
        projects.append({
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        })
    
    conn.close()
    return projects


def get_project(project_id):
    """Get a specific project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, description, created_at, updated_at
        FROM projects
        WHERE id = ?
    ''', (project_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }
    return None


def update_project(project_id, name=None, description=None):
    """Update a project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    params = []
    
    if name is not None:
        updates.append('name = ?')
        params.append(name)
    
    if description is not None:
        updates.append('description = ?')
        params.append(description)
    
    if updates:
        updates.append('updated_at = ?')
        params.append(datetime.now())
        params.append(project_id)
        
        cursor.execute(f'''
            UPDATE projects
            SET {', '.join(updates)}
            WHERE id = ?
        ''', params)
        
        conn.commit()
    
    conn.close()


def delete_project(project_id):
    """Delete a project and all its estimates."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    
    conn.commit()
    conn.close()


def save_estimate(project_id, estimate_data):
    """Save an estimate to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Extract totals from estimate data
    total_rcv = estimate_data.get('project_totals', {}).get('rcv', 0)
    room_count = estimate_data.get('room_count', 0)
    
    # Convert estimate data to JSON string
    estimate_json = json.dumps(estimate_data)
    
    cursor.execute('''
        INSERT INTO estimates (project_id, estimate_data, total_rcv, room_count, updated_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (project_id, estimate_json, total_rcv, room_count, datetime.now()))
    
    estimate_id = cursor.lastrowid
    
    # Update project's updated_at timestamp
    cursor.execute('''
        UPDATE projects
        SET updated_at = ?
        WHERE id = ?
    ''', (datetime.now(), project_id))
    
    conn.commit()
    conn.close()
    
    return estimate_id


def get_project_estimates(project_id):
    """Get all estimates for a project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, estimate_data, total_rcv, room_count, created_at, updated_at
        FROM estimates
        WHERE project_id = ?
        ORDER BY created_at DESC
    ''', (project_id,))
    
    estimates = []
    for row in cursor.fetchall():
        estimates.append({
            'id': row['id'],
            'estimate_data': json.loads(row['estimate_data']),
            'total_rcv': row['total_rcv'],
            'room_count': row['room_count'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        })
    
    conn.close()
    return estimates


def get_latest_estimate(project_id):
    """Get the most recent estimate for a project."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, estimate_data, total_rcv, room_count, created_at, updated_at
        FROM estimates
        WHERE project_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    ''', (project_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'estimate_data': json.loads(row['estimate_data']),
            'total_rcv': row['total_rcv'],
            'room_count': row['room_count'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }
    return None


# Initialize database on import
init_database()

