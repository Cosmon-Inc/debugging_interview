# Senior Software Engineer Debugging Interview Challenge

This project is a full-stack application (React + Flask) deliberately riddled with **16 sophisticated software bugs**. It's designed to test an experienced senior engineer's debugging skills across frontend, backend, and infrastructure (Docker). These are **production-like bugs** that require deep understanding of React, Python, databases, and containerization.

**Target Audience:** Senior Software Engineers (3+ years experience)  
**Estimated Time:** 45 minutes (5 min setup, 35 min debugging, 5 min discussion)  
**Difficulty Level:** Advanced - requires expertise in React hooks, state management, async operations, database optimization, Docker, and performance debugging.

## The 16 Sophisticated Bugs

### **Backend (Python/Flask & SQLite) - 6 Bugs:**

1. **Race Condition (Bug #1)**: Global state mutations without proper synchronization causing data corruption in concurrent requests
2. **Memory Exhaustion (Bug #2)**: Unbounded cache growth leading to resource exhaustion attacks  
3. **Complex Mathematical Error (Bug #3)**: Sophisticated weighted average calculations with exponential weight progression flaw
4. **Authentication Bypass (Bug #4)**: Multi-stage logic flaw allowing privilege escalation through OR conditions
5. **Resource Management (Bug #5)**: Multiple database connection leaks in success and error paths
6. **Circular Reference (Bug #6)**: JSON serialization failures due to self-referential objects in API responses

### **Frontend (React) - 7 Bugs:**

7. **Context Performance (Bug #7)**: Unnecessary re-renders caused by context value recreation on every render
8. **Infinite Re-render Loop (Bug #8)**: useEffect dependencies causing endless render cycles due to object recreation
9. **Stale Closure (Bug #9)**: Async operations capturing outdated state values due to missing dependencies
10. **Memory Leak (Bug #10)**: Uncleaned intervals causing memory accumulation and performance degradation
11. **State Mutation (Bug #11)**: Direct modifications of state objects breaking React's reconciliation algorithm
12. **Key Prop Issues (Bug #12)**: Using array indices as keys causing list rendering corruption and state issues
13. **Performance Bottleneck (Bug #13)**: Expensive synchronous operations blocking main thread - **requires React Profiler to identify**

### **Infrastructure (Docker/DevOps) - 3 Bugs:**

14. **Environment Variable Precedence (Bug #14)**: Conflicting environment variables overriding each other in unexpected ways
15. **Volume Permission Issues (Bug #15)**: Incorrect read-only volume mounts preventing hot reloading and development workflows
16. **Health Check Misconfiguration (Bug #16)**: Wrong endpoints and conditions causing delayed service availability

## Advanced Features to Debug:

- **Weather Dashboard**: Complex mathematical calculations with exponential weight progression errors
- **User Management**: State management with mutation issues and performance problems
- **Session Authentication**: Multi-stage authentication with bypass vulnerabilities
- **Database Statistics**: Resource management and connection pooling problems
- **React Context**: Performance optimization and re-render issues
- **Component Lifecycle**: Memory leaks and cleanup problems
- **Docker Environment**: Configuration conflicts and permission issues

## Setup Instructions

### Prerequisites
*   Docker and Docker Compose installed
*   A code editor with debugging capabilities (VS Code recommended)
*   Browser with developer tools (Chrome DevTools recommended)
*   Understanding of React DevTools and profiling

### Running the Application
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd debugging-interview
    ```

2.  **Build and Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build Docker images for frontend, backend, and nginx
    *   Start containers with intentional configuration issues
    *   Initialize SQLite database with ~500 test users
    *   The frontend (React) will be served on `http://localhost:3000`
    *   The backend (Flask) will be accessible via `http://localhost:5000` 
    *   Nginx will proxy the application on `http://localhost:80`

3.  **Access the Application:**
    Open your browser and navigate to `http://localhost` (or `http://localhost:80`)

    *   The React frontend should load with advanced debugging features
    *   Backend API calls include weather data, user management, and statistics
    *   Try all UI interactions including "Fetch DB Stats", user selection, weather requests, and authentication

## Interview Task for Senior Candidate

### **Phase 1: Initial Assessment (10 minutes)**
1.  **Explore the Application**: Test all features - login, weather dashboard, user list, database stats
2.  **Identify Bug Categories**: Recognize performance, memory, logic, security, and infrastructure issues
3.  **Use Developer Tools**: Browser DevTools, React DevTools, Network tab, Performance profiler

### **Phase 2: Deep Debugging (30 minutes)**
1.  **Backend Investigation**: 
     - Analyze API response times and mathematical calculation errors
     - Check server logs for race conditions and resource leaks
     - Test authentication flows and bypass vulnerabilities
     - Examine database connection management

2.  **Frontend Analysis**:
     - Profile React component re-renders and memory usage
     - Test user interactions for state corruption and infinite loops
     - Analyze async operation handling and closure issues
     - Check for memory leaks and performance degradation

3.  **Infrastructure Review**:
     - Examine Docker container health and environment conflicts
     - Check volume mounts and permission issues
     - Analyze service dependencies and startup behavior

### **Phase 3: Solutions & Discussion (5 minutes)**
1.  **Prioritize Fixes**: Which bugs would you fix first in production?
2.  **Explain Root Causes**: Demonstrate understanding of underlying issues
3.  **Propose Prevention**: How would you prevent these bug categories?

## Evaluation Criteria

**Senior Level Expectations:**
- **Identify 80%+ of bugs** (13+ out of 16)
- **Explain root causes** with technical depth
- **Propose systematic solutions** not just quick fixes
- **Demonstrate profiling skills** using advanced debugging tools (especially for Bug #13)
- **Understand production implications** of each bug category
- **Suggest prevention strategies** (testing, monitoring, code review)

## Advanced Debugging Tools Recommended

- **Chrome DevTools**: Performance tab, Memory tab, Network analysis
- **React DevTools**: Profiler, Component tree, Hook inspection
- **Docker Tools**: Container stats, log analysis, health monitoring
- **Code Analysis**: Understanding async patterns, state management, memory management

## Bug Summary by Category

| Category | Count | Examples |
|----------|-------|----------|
| **Concurrency** | 2 | Race conditions, authentication bypass |
| **Memory/Performance** | 5 | Cache leaks, infinite loops, expensive operations, main thread blocking |
| **State Management** | 3 | React mutations, stale closures, context issues |
| **Infrastructure** | 3 | Docker configs, volume permissions, health checks |
| **Security** | 1 | Authentication bypass vulnerabilities |
| **Data Processing** | 2 | Mathematical errors, circular references |

## Specific Bug Location Hints & Symptoms

### **Backend Issues (Look for these symptoms):**
1. **Race Conditions**: Multiple rapid weather API calls show inconsistent request counters
2. **Memory Growth**: Weather cache grows indefinitely - check memory usage over time
3. **Math Errors**: Weather calculations seem wrong - compare weighted vs simple averages
4. **Auth Bypass**: Try password "admin" or login with user ID < 10 (check database)
5. **Resource Leaks**: Database connections not properly closed - check `/api/db-stats`
6. **JSON Errors**: `/api/db-stats` endpoint fails with circular reference serialization

### **Frontend Issues (Look for these symptoms):**
7. **Context Re-renders**: React DevTools shows unnecessary component updates
8. **Infinite Loops**: Browser becomes unresponsive, check console for render warnings
9. **Stale Data**: User info in delayed notifications shows wrong/old username
10. **Memory Leaks**: Check browser memory tab - notifications interval never stops
11. **State Mutations**: User preference changes don't trigger re-renders
12. **List Corruption**: User selection state gets mixed up when paginating
13. **Performance**: **Typing in weather input freezes UI - use React Profiler**

### **Infrastructure Issues (Check these areas):**
14. **Environment Conflicts**: Backend logs show conflicting DEBUG values
15. **Volume Permissions**: Hot reloading doesn't work - files are read-only
16. **Health Checks**: `docker ps` shows backend as "unhealthy" status

## Debugging Strategy

- Focus on **systematic debugging** rather than random testing
- Use **profiling tools** to identify performance bottlenecks (essential for Bug #13)
- Look for **patterns** across similar bugs (e.g., all state mutations)
- Test **edge cases** and **concurrent operations**
- Pay attention to **console logs** and **error messages**
- Consider **production impact** of each bug type
- **Try typing in the weather input field** - severe performance issues require React Profiler to diagnose

Good luck! This challenge reflects real-world debugging scenarios that senior engineers face in production systems.

## Development Notes
*   **Hot Reloading**: Frontend should support live code changes (but has volume permission issues)
*   **Database Reset**: `docker-compose down && docker-compose up --build` resets everything
*   **Logs**: `docker-compose logs -f <service_name>` for detailed debugging
*   **Container Stats**: `docker stats` to monitor resource usage during debugging

## Complete Bug Reference & Debugging Guide

### Backend Bugs (6) - File: `backend/app.py`
1. **Lines 15-16**: `user_sessions = {}; session_counter = 0` - Race condition without locks
   - **Test**: Make multiple rapid weather API calls, observe inconsistent request counters
   - **Symptom**: Counter values don't increment correctly under load
   
2. **Line 19**: `weather_cache = {}` - Unbounded cache causing memory exhaustion  
   - **Test**: Make weather requests for different cities over time
   - **Symptom**: Memory usage grows continuously, cache never clears
   
3. **Line 42**: `weights = [2 ** i for i in range(len(temps))]` - Exponential weight error
   - **Test**: Compare weather calculations - later readings have exponentially more weight
   - **Symptom**: Temperature averages skewed toward last few readings
   
4. **Lines 58-65**: Authentication bypass logic in `verify_session()` decorator
   - **Test**: Try password "admin" or login with any user ID < 10
   - **Symptom**: Authentication succeeds without proper credentials
   
5. **Lines 281-282**: Multiple database connections opened, only one closed
   - **Test**: Call `/api/db-stats` multiple times, monitor database connections
   - **Symptom**: Database connection pool exhaustion over time
   
6. **Line 302**: `stats['self_reference'] = stats` - Circular reference in JSON
   - **Test**: Call `/api/db-stats` endpoint
   - **Symptom**: JSON serialization error, endpoint returns 500

### Frontend Bugs (7) - Files: `frontend/src/App.js`, `UserList.js`, `WeatherDashboard.js`
7. **Lines 8-22 (App.js)**: Context value recreated on every render in `AppProvider`
   - **Test**: Use React DevTools Profiler, observe unnecessary re-renders
   - **Symptom**: All context consumers re-render on every state change
   
8. **Lines 47-50 (App.js)**: useEffect with `userPreferences` dependency causing infinite loop
   - **Test**: Open browser console, observe continuous re-render warnings
   - **Symptom**: Browser becomes unresponsive, infinite console logs
   
9. **Lines 53-62 (App.js)**: `fetchDelayedData` with empty dependency array missing `user`
   - **Test**: Login, wait 2 seconds for delayed notification
   - **Symptom**: Notification shows wrong/undefined username
   
10. **Lines 65-72 (App.js)**: Interval created without cleanup function
    - **Test**: Use browser Memory tab, observe growing memory usage
    - **Symptom**: Memory leak, interval continues after component unmount
    
11. **Line 112 (App.js)**: Direct state mutation: `userPreferences[key] = value`
    - **Test**: Try toggling theme or changing preferences
    - **Symptom**: UI doesn't update when preferences change
    
12. **Line 73 (UserList.js)**: Using array index as key: `key={index}` in UserList
    - **Test**: Select users, then paginate or search
    - **Symptom**: Selection state gets corrupted, wrong users appear selected
    
13. **Lines 9-25 (WeatherDashboard.js)**: Expensive computation on every render - **requires React Profiler**
    - **Test**: Type in weather city input field
    - **Symptom**: UI freezes while typing, main thread blocked

### Infrastructure Bugs (3) - File: `docker-compose.yml`
14. **Lines 10-13**: `DEBUG=true` then `DEBUG=false` - conflicting env vars
    - **Test**: Check backend container logs for environment variable conflicts
    - **Symptom**: Inconsistent debug behavior, conflicting log levels
    
15. **Line 26**: `:ro` read-only volume mount preventing hot reload
    - **Test**: Try modifying frontend files, check if changes auto-reload
    - **Symptom**: Hot reloading doesn't work, files are read-only in container
    
16. **Line 17**: Health check uses wrong endpoint `/api/nonexistent`
    - **Test**: Run `docker ps` and check container health status
    - **Symptom**: Backend container shows as "unhealthy" despite working properly

## Testing Commands for Verification

```bash
# Check container health
docker ps

# Monitor memory usage
docker stats

# Check backend logs
docker-compose logs backend

# Test endpoints manually
curl http://localhost:5000/api/health      # Should work
curl http://localhost:5000/api/nonexistent # Should fail (404)

# Test authentication bypass
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"admin"}'
```
