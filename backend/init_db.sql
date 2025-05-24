DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS weather_requests;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE weather_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_name TEXT NOT NULL,
    request_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    temperature REAL,
    api_call_count INTEGER
);

-- Sample Users
INSERT INTO users (username, password, email) VALUES ('admin', 'password123', 'admin@example.com');
INSERT INTO users (username, password, email) VALUES ('alice', 'securepass', 'alice@example.com');
INSERT INTO users (username, password, email) VALUES ('bob', 'bobspassword', 'bob@example.com'); 