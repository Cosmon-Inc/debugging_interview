# Senior Software Engineer Debugging Interview Challenge

This project is a full-stack application (React + Flask) deliberately riddled with 8 common software bugs. It's designed to test a candidate's debugging skills across frontend, backend, and infrastructure (Docker).

**Target Audience:** Senior Software Engineers

**Estimated Time:** 45 minutes (5 min setup, 40 min debugging)

## Bugs Included:

**Backend (Python/Flask & SQLite):**
1.  **Logical Error**: Off-by-one mistake in averaging temperature data (`/api/weather` - `get_average_temp()` function).
2.  **Security Flaw**: SQL Injection vulnerability in the login endpoint (`/api/login` - string concatenation in SQL query).
3.  **Performance Bottleneck**: Fetching the entire users table and filtering in Python instead of using a `WHERE` clause (`/api/users` - inefficient filtering).  
4.  **Configuration Management**: Sensitive data exposed through configuration endpoint (`/api/config` - secrets leaked in response).
5.  **Resource Management**: Database connections not properly closed in success paths (`/api/db-stats` - connection leak bug).

**Frontend (React):**

6.  **Memory Leak**: An interval timer not cleaned up in a React component (`App.js` - useEffect missing cleanup).

7.  **Data Validation Failure**: Missing input validation leading to runtime errors (`UserList.js` - assumes API always returns array).

8.  **Error Handling Gap**: Missing error boundaries causing UI crashes (`App.js` - no ErrorBoundary component).


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

2.  **Build and Run with Docker Compose:**
    From the root directory (`debugging-interview/`):
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the Docker images for the frontend, backend, and nginx proxy.
    *   Start the containers.
    *   The backend will initialize/populate an SQLite database with ~500 test users (`backend/database/app.db`).
    *   The frontend (React) will be served on `http://localhost:3000`.
    *   The backend (Flask) will be accessible via `http://localhost:5000` (and proxied via nginx).
    *   Nginx will serve the application on `http://localhost:80`.

3.  **Access the Application:**
    Open your web browser and navigate to `http://localhost` (or `http://localhost:80`).

    *   The React frontend should load.
    *   Backend API calls are proxied through Nginx (e.g., `/api/weather` uses mock weather data).
    *   Try the "Fetch DB Stats" button to test database resource management.

### Development Notes
*   **Hot Reloading:**
    *   The React frontend (`frontend` service) is configured for hot reloading. Changes in `frontend/src` should automatically update in the browser.
    *   The Flask backend (`backend` service) is run in development mode, which should also restart on code changes.
*   **Database:**
    *   The SQLite database file (`app.db`) is stored in `backend/database/`. The schema is defined in `backend/init_db.sql`. The `backend/init_db.py` script, executed when the `backend` service starts, applies this schema and then populates the database with ~500 test users.
    *   The `/api/db-stats` endpoint provides database statistics and demonstrates resource management issues.
    *   To reset the database, you can stop Docker Compose, delete `backend/database/app.db`, and restart. `docker-compose down -v` will remove volumes including the DB.
*   **Logs:**
    View container logs using `docker-compose logs -f <service_name>` (e.g., `docker-compose logs -f backend`).

## Interview Task for Candidate

1.  **Familiarize Yourself:** Briefly review the application structure and the `README.md` (2-3 minutes).
2.  **Identify the Bugs:** Explore the application and its codebase. Try to identify as many of the 8 listed bugs as possible. Use browser developer tools, analyze network requests, inspect backend logs, and read the code. Test all UI buttons including "Fetch DB Stats" for database resource management bugs (30-35 minutes).
3.  **Explain:** For each bug you find:
    *   Clearly describe the bug.
    *   Explain its potential impact.
    *   Pinpoint its location in the code.
4.  **Propose Fixes:** Suggest how you would fix each bug. Focus on 1-2 bugs for detailed implementation discussion (5-10 minutes).
5.  **Discuss Prevention:** How could these types of bugs be prevented in a real-world development environment (e.g., code reviews, static analysis, testing strategies, team practices)?

Good luck!
