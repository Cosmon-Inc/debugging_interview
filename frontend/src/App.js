import React, { useState, useEffect, useCallback } from 'react';
import WeatherDashboard from './WeatherDashboard';
import UserList from './UserList';
import LoginForm from './LoginForm'; // We'll create this component

// --- Bug 6: Memory Leak (Frontend) ---
// An interval is set but never cleared, leading to a memory leak
// as the component re-renders or unmounts.

// --- Bug 8: Error Handling Gap (Frontend - Missing Error Boundary) ---
// If any child component throws an unhandled error, the whole app might crash.
// A proper ErrorBoundary component should wrap parts of the UI.

function App() {
  const [leakCounter, setLeakCounter] = useState(0);
  const [showUserList, setShowUserList] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [appError, setAppError] = useState(null); // For demonstrating error boundary need
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLeakCounter(prev => prev + 1);
      console.log('Memory leak interval running...', leakCounter);
    }, 5000);

  }, [leakCounter]);

  const handleLoginSuccess = (userData) => {
    setLoggedInUser(userData);
    setAppError(null);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const triggerAppError = () => {
    try {
      const val = undefinedVar.property;
      console.log(val);
    } catch (error) {
      setAppError("A simulated critical error occurred in App.js!");
    }
  };

  const fetchDbStats = async () => {
    try {
      const response = await fetch('/api/db-stats');
      const data = await response.json();
      setDbStats(data);
    } catch (error) {
      console.error('Error fetching DB stats:', error);
    }
  };
  
  const fetchDataWithPotentialIssue = useCallback(async () => {
    try {
      const response = await fetch('/api/some-endpoint-that-might-fail');
      if (!response.ok) {
        console.error('API call failed but not thrown as an error:', response.status);
      }
    } catch (error) {
      console.error("Caught error in fetchDataWithPotentialIssue:", error);
    }
  }, []);

  useEffect(() => {
    fetchDataWithPotentialIssue();
  }, [fetchDataWithPotentialIssue]);

  if (appError) {
    return (
      <div className="container error">
        <h2>Application Error</h2>
        <p>{appError}</p>
        <button onClick={() => setAppError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Debugging Challenge App</h1>
      <p>Memory Leak Counter (check console): {leakCounter}</p>
      <hr />

      {!loggedInUser ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="container">
          <h2>Welcome, {loggedInUser.username}!</h2>
          <p>(User ID: {loggedInUser.userId})</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      
      <hr />
      <WeatherDashboard />
      <hr />
      
      <button onClick={() => setShowUserList(!showUserList)}>
        {showUserList ? 'Hide' : 'Show'} User List
      </button>
      {showUserList && <UserList />}
      <hr/>
      <button onClick={triggerAppError}>Trigger Simulated App Error</button>
      <button onClick={fetchDbStats} style={{marginLeft: '10px'}}>Fetch DB Stats</button>
      {dbStats && (
        <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0'}}>
          <h4>Database Statistics:</h4>
          <p>Total Users: {dbStats.total_users}</p>
          <p>Weather Requests: {dbStats.weather_requests}</p>
          <p>Database File: {dbStats.database_file}</p>
        </div>
      )}
      <p style={{marginTop: "20px", fontSize: "0.8em", color: "gray"}}>
        Open your browser's developer console to see detailed logs and errors.
      </p>
    </div>
  );
}

export default App; 