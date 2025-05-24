from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import threading
import requests
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Bug 4: Concurrency Issue ---
# Global counter incremented without synchronization
counter_lock = threading.Lock()
request_counter = 0

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.db')

def get_db_connection():
    """Creates a database connection."""
    # --- Bug 11: Resource Management (Potential: connections not always closed) ---
    # While Flask's context might handle some cases, explicit closing is better.
    # This function itself doesn't introduce the bug, but its usage in routes might.
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row # Access columns by name
    return conn

# --- Bug 1: Logical Error ---
def get_average_temp(temps):
    """Calculates average temperature."""
    if not temps:
        return 0
    # Logical Error: divides by (len-1) instead of len
    # This will cause ZeroDivisionError if len(temps) is 1
    return sum(temps) / (len(temps) - 1) # INTENTIONAL BUG

@app.route('/api/weather', methods=['GET'])
def weather():
    global request_counter
    city = request.args.get('city') # Corrected from 'cityName' based on typical frontend usage

    if not city:
        # --- Bug 9: Data Validation Failure (Backend) ---
        # Missing check for city parameter
        return jsonify({"error": "City parameter is required"}), 400

    # --- Bug 4: Concurrency Issue (Fix attempt, but still flawed if not careful) ---
    with counter_lock:
        request_counter += 1
        current_count = request_counter

    # --- Bug 10: Configuration Management ---
    # API key and URL are hardcoded or unsafely managed if not from .env
    # For this example, we assume it's loaded from .env, but the bug is about *how* it's managed.
    # The .env file itself could be committed, or secrets not properly injected in production.
    api_key = os.getenv('API_KEY_WEATHER', 'YOUR_DEFAULT_API_KEY_HERE') # Hardcoded default if not in .env
    base_url = os.getenv('EXTERNAL_WEATHER_API_URL', "http://api.openweathermap.org/data/2.5/weather")

    # --- Bug 2: API Misuse ---
    # Wrong parameter name 'location' instead of 'q' for OpenWeatherMap
    params = {
        'location': city, # INTENTIONAL BUG: Should be 'q' for OpenWeatherMap
        'appid': api_key,
        'units': 'metric'
    }

    avg_temp = 0
    error_message = None

    try:
        # --- Bug 7: Error Handling Gap (Backend) ---
        # No specific try-except for requests.exceptions.RequestException
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        
        data = response.json()
        
        # Assuming the API returns temp directly, or a list of temps if it's a forecast
        # For simplicity, let's assume it's a list of one if current weather, or multiple for forecast
        # The original example had `data['forecast']` and `day['temp']`.
        # Let's adapt to a simpler structure for OpenWeatherMap current weather.
        if 'main' in data and 'temp' in data['main']:
            temps = [data['main']['temp']] # Simulating a list for get_average_temp
            if temps: # Ensure temps is not empty
                 avg_temp = get_average_temp(temps) # This will trigger the logical error if len(temps) == 1
        else:
            # Handle cases where the API response structure is not as expected
            error_message = "Unexpected API response structure."
            # --- Bug 7: Error Handling Gap ---
            # Should log this error or return a more specific message
            print(f"API Misuse/Error: Unexpected data structure from weather API for city {city}: {data}")


    except requests.exceptions.HTTPError as http_err:
        error_message = f"HTTP error occurred: {http_err}"
        # --- Bug 7: Error Handling Gap ---
        # Should log this error
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
    except ZeroDivisionError: # Catching the logical error explicitly for now
        error_message = "Error calculating average temperature (division by zero)."
        avg_temp = data['main']['temp'] # Fallback to current temp if averaging fails
        print(f"LogicalError (ZeroDivisionError) for city {city} with temps: {[data['main']['temp']]}")
    except Exception as e: # Generic catch-all
        error_message = f"An unexpected error occurred: {str(e)}"
        print(f"Generic Exception for {city}: {e}")


    if error_message:
        return jsonify({'error': error_message, 'reqCount': current_count}), 500
    
    return jsonify({'avgTemp': avg_temp, 'reqCount': current_count, 'city': city})


@app.route('/api/users', methods=['GET'])
def users():
    # --- Bug 3: Performance Bottleneck ---
    # Loads entire table then filters in Python.
    # --- Bug 11: Resource Management ---
    # Connection might not be closed if an exception occurs before conn.close().
    conn = None # Initialize conn to None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        username_query = request.args.get('username')

        if username_query:
            # Still a bottleneck if not indexed, but better than loading all.
            # The *intended* bug is fetching ALL then filtering.
            # cur.execute("SELECT id, username, email FROM users WHERE username LIKE ?", (f"%{username_query}%",))
            
            # INTENTIONAL BUG: Fetch all users
            cur.execute("SELECT id, username, email FROM users")
            all_users = cur.fetchall()
            # Filter in Python (Performance Bottleneck)
            filtered_users = [user for user in all_users if username_query.lower() in user['username'].lower()]
            
            # To make the bug more obvious, let's simulate a delay if many users are fetched
            if len(all_users) > 5000 and not username_query: # Only delay if fetching all
                import time
                time.sleep(2) # Simulate slow processing for large datasets

        else:
            cur.execute("SELECT id, username, email FROM users") # Fetch all if no query
            filtered_users = cur.fetchall()

        # Convert Row objects to dicts for JSON serialization
        users_list = [dict(user) for user in filtered_users]
        return jsonify(users_list)

    except sqlite3.Error as e:
        # --- Bug 7: Error Handling Gap ---
        # Generic error message, could be more specific.
        print(f"Database error in /api/users: {e}")
        return jsonify({"error": "Database operation failed"}), 500
    finally:
        if conn:
            conn.close() # Ensure connection is closed

@app.route('/api/login', methods=['POST'])
def login():
    # --- Bug 7: Error Handling Gap ---
    # No try-except block for parsing JSON or database operations.
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        username = data.get('username')
        password = data.get('password')

        # --- Bug 9: Data Validation Failure ---
        # Missing validation for username and password presence/type.
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
        if not isinstance(username, str) or not isinstance(password, str):
            return jsonify({"error": "Username and password must be strings"}), 400


        conn = get_db_connection()
        cur = conn.cursor()

        # --- Bug 5: Security Flaw (SQL Injection) ---
        # SQL query constructed with unsanitized user input via f-string.
        # This is a major security risk.
        query = f"SELECT id, username FROM users WHERE username = '{username}' AND password = '{password}'" # INTENTIONAL BUG
        print(f"Executing SQL (vulnerable): {query}") # For demonstration
        
        cur.execute(query) # VULNERABLE
        record = cur.fetchone()

        if record:
            return jsonify({'status': 'ok', 'message': f'Login successful for {record["username"]}.', 'userId': record['id']})
        else:
            return jsonify({'status': 'fail', 'message': 'Invalid username or password'}), 401

    except sqlite3.Error as e:
        print(f"Database error in /api/login: {e}")
        return jsonify({"error": "Database operation failed during login"}), 500
    except Exception as e: # Catch other potential errors like JSON parsing
        print(f"Error in /api/login: {e}")
        return jsonify({"error": str(e)}), 400
    finally:
        if conn:
            conn.close()

@app.route('/api/config', methods=['GET'])
def get_config():
    # --- Bug 10: Configuration Management ---
    # Exposing sensitive information (even if from .env, it's exposed via API)
    # A real app should never expose raw API keys or full DB URLs.
    return jsonify({
        "service_name": "Debugging Interview Backend",
        "version": "1.0.0",
        "database_url_public_for_some_reason": os.getenv('DATABASE_URL'), # Exposing this is bad
        "weather_api_key_leaked": os.getenv('API_KEY_WEATHER'), # Exposing this is very bad
        "external_api": os.getenv('EXTERNAL_WEATHER_API_URL')
    })


if __name__ == '__main__':
    # Ensure DB is initialized before starting Flask dev server
    # In a containerized setup, init_db.py is run by CMD in Dockerfile
    # from init_db import init_db as initialize_database
    # initialize_database() # Commented out as Docker CMD handles it
    app.run(debug=True, host='0.0.0.0', port=5000) 