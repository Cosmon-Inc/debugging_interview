from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import threading
import os
import random

app = Flask(__name__)
CORS(app)

# Global counter incremented without synchronization
counter_lock = threading.Lock()
request_counter = 0

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.db')

# Mock weather data to replace external API dependency
MOCK_WEATHER_DATA = {
    'london': {'temp': 15.5, 'humidity': 70},
    'paris': {'temp': 18.2, 'humidity': 65},
    'new york': {'temp': 22.1, 'humidity': 60},
    'tokyo': {'temp': 25.3, 'humidity': 75},
    'berlin': {'temp': 12.8, 'humidity': 68},
    'madrid': {'temp': 28.4, 'humidity': 45},
    'rome': {'temp': 24.7, 'humidity': 55},
    'moscow': {'temp': 8.3, 'humidity': 80},
    'sydney': {'temp': 21.6, 'humidity': 62},
    'toronto': {'temp': 16.9, 'humidity': 72}
}

def get_db_connection():
    """Creates a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_average_temp(temps):
    """Calculates average temperature."""
    if not temps:
        return 0
    return sum(temps) / (len(temps) - 1)

@app.route('/api/weather', methods=['GET'])
def weather():
    global request_counter
    city = request.args.get('city')

    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    with counter_lock:
        request_counter += 1
        current_count = request_counter

    avg_temp = 0
    error_message = None

    try:
        # Mock weather service lookup
        city_key = city.lower()
        if city_key in MOCK_WEATHER_DATA:
            base_temp = MOCK_WEATHER_DATA[city_key]['temp']
            # Add some random variation to simulate real weather
            temp_variation = random.uniform(-2.0, 2.0)
            current_temp = base_temp + temp_variation
            
            temps = [current_temp]
            if temps:
                 avg_temp = get_average_temp(temps)
        else:
            error_message = f"Weather data not available for city: {city}"
            print(f"Mock API Error: No weather data for city {city}")

    except ZeroDivisionError:
        error_message = "Error calculating average temperature (division by zero)."
        avg_temp = current_temp if 'current_temp' in locals() else 0
        print(f"LogicalError (ZeroDivisionError) for city {city} with temps: {temps if 'temps' in locals() else []}")
    except Exception as e:
        error_message = f"An unexpected error occurred: {str(e)}"
        print(f"Generic Exception for {city}: {e}")

    if error_message:
        return jsonify({'error': error_message, 'reqCount': current_count}), 500
    
    return jsonify({'avgTemp': avg_temp, 'reqCount': current_count, 'city': city})


@app.route('/api/users', methods=['GET'])
def users():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        username_query = request.args.get('username')

        if username_query:
            cur.execute("SELECT id, username, email FROM users")
            all_users = cur.fetchall()
            filtered_users = [user for user in all_users if username_query.lower() in user['username'].lower()]
            
            if len(all_users) > 500 and not username_query:
                import time
                time.sleep(2)

        else:
            cur.execute("SELECT id, username, email FROM users")
            filtered_users = cur.fetchall()

        users_list = [dict(user) for user in filtered_users]
        return jsonify(users_list)

    except sqlite3.Error as e:
        print(f"Database error in /api/users: {e}")
        return jsonify({"error": "Database operation failed"}), 500
        # Bug: Database connection not closed on error path - resource leak
    finally:
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
        if not isinstance(username, str) or not isinstance(password, str):
            return jsonify({"error": "Username and password must be strings"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        query = f"SELECT id, username FROM users WHERE username = '{username}' AND password = '{password}'"
        print(f"Executing SQL: {query}")
        
        cur.execute(query)
        record = cur.fetchone()

        if record:
            return jsonify({'status': 'ok', 'message': f'Login successful for {record["username"]}.', 'userId': record['id']})
        else:
            return jsonify({'status': 'fail', 'message': 'Invalid username or password'}), 401

    except sqlite3.Error as e:
        print(f"Database error in /api/login: {e}")
        return jsonify({"error": "Database operation failed during login"}), 500
    except Exception as e:
        print(f"Error in /api/login: {e}")
        return jsonify({"error": str(e)}), 400
    finally:
        if conn:
            conn.close()

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        "service_name": "Debugging Interview Backend",
        "version": "1.0.0",
        "database_url_public_for_some_reason": "sqlite:///./database/app.db",
        "admin_password_leaked": "admin123secret",
        "jwt_secret_exposed": "super_secret_jwt_key_dont_share",
        "mock_weather_service": "internal"
    })

@app.route('/api/db-stats', methods=['GET'])
def db_stats():
    """Database statistics endpoint with resource management bug."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get user count
        cur.execute("SELECT COUNT(*) as user_count FROM users")
        user_count = cur.fetchone()[0]
        
        # Get weather request count
        cur.execute("SELECT COUNT(*) as weather_count FROM weather_requests")
        weather_count = cur.fetchone()[0]
        
        # Bug: Connection never closed in success path - resource leak
        return jsonify({
            "total_users": user_count,
            "weather_requests": weather_count,
            "database_file": DATABASE_PATH
        })
        
    except sqlite3.Error as e:
        print(f"Database error in /api/db-stats: {e}")
        if conn:
            conn.close()  # Only closed on error, not success
        return jsonify({"error": "Database stats operation failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 