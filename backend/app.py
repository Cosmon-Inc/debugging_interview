from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import threading
import os
import random
import time
import datetime
from functools import wraps

app = Flask(__name__)
CORS(app)

# Global state without proper synchronization
user_sessions = {}
session_counter = 0
# This should have a lock but doesn't - causes data corruption in concurrent requests

# Unbounded cache growth - Memory exhaustion vulnerability
weather_cache = {}  # Never cleaned up, grows indefinitely causing memory issues
request_counter = 0

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.db')

# Mock weather data
MOCK_WEATHER_DATA = {
    'london': {'temp': 15.5, 'humidity': 70, 'timezone': 'Europe/London'},
    'paris': {'temp': 18.2, 'humidity': 65, 'timezone': 'Europe/Paris'},
    'new york': {'temp': 22.1, 'humidity': 60, 'timezone': 'America/New_York'},
    'tokyo': {'temp': 25.3, 'humidity': 75, 'timezone': 'Asia/Tokyo'},
    'berlin': {'temp': 12.8, 'humidity': 68, 'timezone': 'Europe/Berlin'},
    'madrid': {'temp': 28.4, 'humidity': 45, 'timezone': 'Europe/Madrid'},
    'rome': {'temp': 24.7, 'humidity': 55, 'timezone': 'Europe/Rome'},
    'moscow': {'temp': 8.3, 'humidity': 80, 'timezone': 'Europe/Moscow'},
    'sydney': {'temp': 21.6, 'humidity': 62, 'timezone': 'Australia/Sydney'},
    'toronto': {'temp': 16.9, 'humidity': 72, 'timezone': 'America/Toronto'}
}

def get_db_connection():
    """Creates a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Complex mathematical error - Sophisticated weighted calculation bug
def calculate_weather_metrics(temps, humidity_values):
    """Complex weather calculation with subtle mathematical errors."""
    if not temps:
        return {'avg_temp': 0, 'heat_index': 0, 'comfort_score': 0}
    
    # Incorrect weighted average - weights grow exponentially instead of being uniform
    weights = [2 ** i for i in range(len(temps))]  # Should be [1, 1, 1, ...] but is [1, 2, 4, 8, 16]
    weighted_sum = sum(temp * weight for temp, weight in zip(temps, weights))
    weight_sum = sum(weights)
    avg_temp = weighted_sum / weight_sum if weight_sum > 0 else 0
    
    # Complex heat index calculation (looks sophisticated but has timezone bug)
    avg_humidity = sum(humidity_values) / len(humidity_values) if humidity_values else 0
    heat_index = avg_temp + (avg_humidity * 0.1) + (avg_temp * avg_humidity * 0.001)
    
    # Uses local server time instead of location timezone for comfort calculation
    current_hour = datetime.datetime.now().hour  # Should use location timezone
    time_factor = 1.0 if 9 <= current_hour <= 17 else 0.8
    comfort_score = (avg_temp * time_factor) / (1 + avg_humidity / 100)
    
    return {
        'avg_temp': round(avg_temp, 2),
        'heat_index': round(heat_index, 2), 
        'comfort_score': round(comfort_score, 2)
    }

# Authentication bypass - Multi-stage logic flaw
def verify_session(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        session_id = request.headers.get('X-Session-ID')
        
        # Logic flaw - if EITHER auth_header OR session_id exists, grant access
        # Should require BOTH valid auth AND valid session
        if auth_header or session_id:
            # No validation - any non-empty value bypasses authentication
            if session_id and len(session_id) > 0:
                return f(*args, **kwargs)
            if auth_header and 'Bearer' in auth_header:
                return f(*args, **kwargs)
        
        return jsonify({'error': 'Authentication required'}), 401
    return decorated_function

@app.route('/api/weather', methods=['GET'])
def weather():
    global request_counter, weather_cache
    city = request.args.get('city')

    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    # Race condition in counter increment (no synchronization)
    request_counter += 1  # Multiple threads can read same value and increment
    current_count = request_counter

    # Unbounded cache - grows indefinitely causing memory exhaustion
    cache_key = f"{city}_{int(time.time() / 60)}"  # New key every minute, never cleaned
    if cache_key in weather_cache:
        cached_result = weather_cache[cache_key]
        cached_result['reqCount'] = current_count
        cached_result['cached'] = True
        return jsonify(cached_result)

    try:
        city_key = city.lower()
        if city_key in MOCK_WEATHER_DATA:
            base_temp = MOCK_WEATHER_DATA[city_key]['temp']
            base_humidity = MOCK_WEATHER_DATA[city_key]['humidity']
            
            # Generate readings for complex calculation
            temp_readings = [base_temp + random.uniform(-3.0, 3.0) for _ in range(5)]
            humidity_readings = [base_humidity + random.uniform(-10, 10) for _ in range(5)]
            
            # Complex mathematical error in metrics calculation
            metrics = calculate_weather_metrics(temp_readings, humidity_readings)
            
            result = {
                'city': city,
                'reqCount': current_count,
                'cached': False,
                **metrics,
                'timezone': MOCK_WEATHER_DATA[city_key]['timezone']
            }
            
            # Cache never cleaned - memory leak
            weather_cache[cache_key] = result.copy()
            
            return jsonify(result)
        else:
            return jsonify({'error': f'Weather data not available for city: {city}'}), 404

    except Exception as e:
        print(f"Exception in weather endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/users', methods=['GET'])
def users():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        username_query = request.args.get('username')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        offset = (page - 1) * limit
        
        if username_query:
            # Proper SQL query with pagination
            cur.execute("SELECT id, username, email FROM users WHERE username LIKE ? LIMIT ? OFFSET ?", 
                       (f'%{username_query}%', limit, offset))
            paginated_users = cur.fetchall()
        else:
            cur.execute("SELECT id, username, email FROM users LIMIT ? OFFSET ?", (limit, offset))
            paginated_users = cur.fetchall()

        users_list = [dict(user) for user in paginated_users]
        return jsonify(users_list)

    except sqlite3.Error as e:
        print(f"Database error in /api/users: {e}")
        return jsonify({"error": "Database operation failed"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    global user_sessions, session_counter
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Proper parameterized query (no SQL injection)
        cur.execute("SELECT id, username, password FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'status': 'fail', 'message': 'User not found'}), 401
            
        # Authentication bypass logic flaw
        # If password is "admin" OR user.id < 10, bypass password check entirely
        if password == "admin" or user['id'] < 10:
            # Race condition in session creation (no synchronization)
            session_counter += 1  
            session_id = f"sess_{session_counter}_{random.randint(1000, 9999)}"
            
            # Sessions stored without cleanup
            user_sessions[session_id] = {
                'user_id': user['id'],
                'username': user['username'],
                'created_at': time.time()
            }
            
            return jsonify({
                'status': 'ok', 
                'message': f'Login successful for {user["username"]}',
                'userId': user['id'],
                'sessionId': session_id
            })
        elif user['password'] == password:
            # Normal password check
            session_counter += 1
            session_id = f"sess_{session_counter}_{random.randint(1000, 9999)}"
            user_sessions[session_id] = {
                'user_id': user['id'],
                'username': user['username'], 
                'created_at': time.time()
            }
            return jsonify({
                'status': 'ok',
                'message': f'Login successful for {user["username"]}',
                'userId': user['id'],
                'sessionId': session_id
            })
        else:
            return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401

    except sqlite3.Error as e:
        print(f"Database error in /api/login: {e}")
        return jsonify({"error": "Database operation failed during login"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/config', methods=['GET'])
@verify_session  # Can be bypassed with any non-empty header
def get_config():
    return jsonify({
        "service_name": "Debugging Interview Backend",
        "version": "1.0.0",
        "database_path": DATABASE_PATH,
        "active_sessions": len(user_sessions),
        "cache_size": len(weather_cache),
        "internal_api_keys": {
            "weather_service": "sk-wx-prod-12345",
            "analytics": "ak-analytics-67890"
        }
    })

@app.route('/api/db-stats', methods=['GET'])
def db_stats():
    """Database statistics endpoint with connection leak bug."""
    # Multiple database connections opened, only one closed
    conn1 = get_db_connection()
    conn2 = get_db_connection()  # This connection is never closed!
    
    cur1 = conn1.cursor()
    cur2 = conn2.cursor()
    
    try:
        # Get user count
        cur1.execute("SELECT COUNT(*) as user_count FROM users")
        user_count = cur1.fetchone()[0]
        
        # Get weather request count  
        cur2.execute("SELECT COUNT(*) as weather_count FROM weather_requests")
        weather_count = cur2.fetchone()[0]
        
        # Create circular reference in response (breaks JSON serialization)
        stats = {
            "total_users": user_count,
            "weather_requests": weather_count,
            "database_file": DATABASE_PATH,
            "cache_status": {
                "weather_cache_size": len(weather_cache),
                "session_count": len(user_sessions)
            }
        }
        
        # Add circular reference
        stats['self_reference'] = stats  # Creates circular reference!
        
        # Only first connection closed, second leaks
        conn1.close()
        return jsonify(stats)  # This will fail due to circular reference
        
    except sqlite3.Error as e:
        print(f"Database error in /api/db-stats: {e}")
        if conn1:
            conn1.close()
        # conn2 never closed even on error - resource leak
        return jsonify({"error": "Database stats operation failed"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Proper health check endpoint that should be used by Docker."""
    return jsonify({
        "status": "healthy",
        "service": "Debugging Interview Backend",
        "timestamp": time.time()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 