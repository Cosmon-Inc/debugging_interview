import sqlite3
import os
import random
import string

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'init_db.sql')

def generate_random_string(length=10):
    """Generates a random string of fixed length."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def init_db():
    """Initializes the database by creating schema and populating it with users."""
    db_dir = os.path.dirname(DATABASE_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        print(f"Created database directory: {db_dir}")

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Always try to create schema from init_db.sql
    # The SQL script itself uses "DROP TABLE IF EXISTS" and "CREATE TABLE",
    # so it's safe to run even if tables exist.
    # It also inserts the initial 3 users.
    try:
        print(f"Applying schema from {SCHEMA_PATH}...")
        with open(SCHEMA_PATH, 'r') as f:
            cursor.executescript(f.read())
        conn.commit()
        print("Schema applied and initial users inserted successfully.")
    except sqlite3.Error as e:
        print(f"Error applying schema: {e}")
        conn.close()
        return # Stop if schema application fails

    # Check current user count
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    print(f"Current user count after schema application: {user_count}")

    # Populate with additional users for performance testing
    # We aim for a total of 500 + initial users from schema.
    # Let's target a total of roughly 503 users.
    # The initial 3 users are already inserted by init_db.sql
    
    num_additional_users_to_create = 500
    
    if user_count < (3 + num_additional_users_to_create): # Check if we need to add more
        print(f"Populating additional {num_additional_users_to_create} users...")
        users_to_add = []
        for i in range(num_additional_users_to_create):
            username = f"user{i}_{generate_random_string(5)}"
            password = "password123" # Simple password for all test users
            email = f"{username}@example.com"
            users_to_add.append((username, password, email))
        
        try:
            # Using INSERT OR IGNORE to avoid issues if some users (by chance or due to re-runs) already exist
            cursor.executemany("INSERT OR IGNORE INTO users (username, password, email) VALUES (?, ?, ?)", users_to_add)
            conn.commit()
            
            cursor.execute("SELECT COUNT(*) FROM users")
            final_user_count = cursor.fetchone()[0]
            print(f"Successfully added/ignored users. Total users now: {final_user_count}")

        except sqlite3.Error as e:
            print(f"Error populating additional users: {e}")
    else:
        print(f"Sufficient users already exist ({user_count}). Skipping bulk population.")

    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialization script finished.") 