# Senior Software Engineer Debugging Interview Challenge

This project is a full-stack application (React + Flask) deliberately riddled with 11 common software bugs. It's designed to test a candidate's debugging skills across frontend, backend, and infrastructure (Docker).

**Target Audience:** Senior Software Engineers

**Estimated Time:** 90-120 minutes (30 min setup/review, 60-90 min debugging)

## Bugs Included:

**Backend (Python/Flask & SQLite):**
1.  **Logical Error**: Off-by-one mistake in averaging temperature data (`/api/weather`).
2.  **API Misuse**: Passing the wrong parameter name to an external weather API (`/api/weather`).
3.  **Performance Bottleneck**: Fetching the entire users table and filtering in Python instead of using a `WHERE` clause (`/api/users`).
4.  **Concurrency Issue**: A global counter incremented without proper synchronization (`/api/weather`).
5.  **Security Flaw**: SQL Injection vulnerability in the login endpoint (`/api/login`).
6.  **Configuration Management**: Hard-coded secrets or insecure exposure of configuration (`/api/config`, `.env` practices).
7.  **Resource Management**: Database connections not consistently closed, especially on error paths (various endpoints).
    
**Frontend (React):**
8.  **Memory Leak**: An event listener or interval timer not cleaned up in a React component (`App.js`).
9.  **Data Validation Failure**: Missing or inadequate input validation, or unsafe assumptions about API response structure, leading to runtime errors (`UserList.js`, `WeatherDashboard.js`, `LoginForm.js`).
10. **Error Handling Gap**: Missing error boundaries or insufficient try-catch blocks, causing UI crashes or uninformative error messages (`App.js`, `UserList.js`).
11. **Async/Promise Handling**: Unhandled promise rejections or improper async/await usage (`WeatherDashboard.js`, `UserList.js`, `App.js`).


## Setup Instructions

### Prerequisites
*   Docker and Docker Compose installed.
*   A code editor (e.g., VS Code).
*   A web browser with developer tools.

### Running the Application
1.  **Clone the repository (or extract the files):**
    ```bash
    # git clone <repository-url>
    # cd debugging-interview
    ```
2.  **Create/Review Environment File:**
    A `.env` file is provided at the root of the project. It contains a placeholder for `API_KEY_WEATHER`. For the weather API functionality (Bug 2), you might need a real API key from a provider like OpenWeatherMap (use their free tier). Update `EXTERNAL_WEATHER_API_URL` if necessary.
    ```env
    # .env
    FLASK_APP=app.py
    FLASK_ENV=development
    DATABASE_URL=sqlite:///./database/app.db
    API_KEY_WEATHER=YOUR_OPENWEATHERMAP_API_KEY # Replace with a real key
    EXTERNAL_WEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
    ```
    *If you don't provide a real API key, the weather feature will likely fail due to authentication, which itself can be part of debugging Bug 2 (API Misuse) or Bug 10 (Configuration Management).*

3.  **Build and Run with Docker Compose:**
    From the root directory (`debugging-interview/`):
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the Docker images for the frontend, backend, and nginx proxy.
    *   Start the containers.
    *   The backend will initialize/populate an SQLite database (`backend/database/app.db`).
    *   The frontend (React) will be served on `http://localhost:3000`.
    *   The backend (Flask) will be accessible via `http://localhost:5000` (and proxied via nginx).
    *   Nginx will serve the application on `http://localhost:80`.

4.  **Access the Application:**
    Open your web browser and navigate to `http://localhost` (or `http://localhost:80`).

    *   The React frontend should load.
    *   Backend API calls are proxied through Nginx (e.g., `/api/weather`).

### Development Notes
*   **Hot Reloading:**
    *   The React frontend (`frontend` service) is configured for hot reloading. Changes in `frontend/src` should automatically update in the browser.
    *   The Flask backend (`backend` service) is run in development mode, which should also restart on code changes.
*   **Database:**
    *   The SQLite database file (`app.db`) is stored in `backend/database/`. The schema is defined in `backend/init_db.sql`. The `backend/init_db.py` script, executed when the `backend` service starts, applies this schema and then populates the database with sample and bulk user data.
    *   To reset the database, you can stop Docker Compose, delete `backend/database/app.db`, and restart. `docker-compose down -v` will remove volumes including the DB.
*   **Logs:**
    View container logs using `docker-compose logs -f <service_name>` (e.g., `docker-compose logs -f backend`).

## Interview Task for Candidate

1.  **Familiarize Yourself:** Briefly review the application structure and the `README.md`.
2.  **Identify the Bugs:** Explore the application and its codebase. Try to identify as many of the 11 listed bugs as possible. Use browser developer tools, analyze network requests, inspect backend logs, and read the code.
3.  **Explain:** For each bug you find:
    *   Clearly describe the bug.
    *   Explain its potential impact.
    *   Pinpoint its location in the code.
4.  **Propose Fixes:** Suggest how you would fix each bug. You don't necessarily need to implement all fixes during the interview, but be prepared to discuss the code changes.
5.  **Prioritize (Optional):** If time is limited, discuss which bugs you would prioritize fixing and why.
6.  **Discuss Prevention:** How could these types of bugs be prevented in a real-world development environment (e.g., code reviews, static analysis, testing strategies, team practices)?

Good luck!
