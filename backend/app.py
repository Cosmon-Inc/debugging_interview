from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import threading
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global counter incremented without synchronization
counter_lock = threading.Lock()
request_counter = 0

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.db')

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

    api_key = os.getenv('API_KEY_WEATHER', 'YOUR_DEFAULT_API_KEY_HERE')
    base_url = os.getenv('EXTERNAL_WEATHER_API_URL', "http://api.openweathermap.org/data/2.5/weather")

    params = {
        'location': city,
        'appid': api_key,
        'units': 'metric'
    }

    avg_temp = 0
    error_message = None

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if 'main' in data and 'temp' in data['main']:
            temps = [data['main']['temp']]
            if temps:
                 avg_temp = get_average_temp(temps)
        else:
            error_message = "Unexpected API response structure."
            print(f"API Error: Unexpected data structure from weather API for city {city}: {data}")

    except requests.exceptions.HTTPError as http_err:
        error_message = f"HTTP error occurred: {http_err}"
        print(f"HTTPError for {city}: {http_err}")
    except requests.exceptions.ConnectionError as conn_err:
        error_message = f"Error Connecting: {conn_err}"
        print(f"ConnectionError for {city}: {conn_err}")
    except requests.exceptions.Timeout as timeout_err:
        error_message = f"Timeout Error: {timeout_err}"
        print(f"TimeoutError for {city}: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        error_message = f"An error occurred with the weather API request: {req_err}"
        print(f"RequestException for {city}: {req_err}")
    except ZeroDivisionError:
        error_message = "Error calculating average temperature (division by zero)."
        avg_temp = data['main']['temp']
        print(f"LogicalError (ZeroDivisionError) for city {city} with temps: {[data['main']['temp']]}")
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
            
            if len(all_users) > 5000 and not username_query:
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
        "database_url_public_for_some_reason": os.getenv('DATABASE_URL'),
        "weather_api_key_leaked": os.getenv('API_KEY_WEATHER'),
        "external_api": os.getenv('EXTERNAL_WEATHER_API_URL')
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 