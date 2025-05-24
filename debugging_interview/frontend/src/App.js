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

  useEffect(() => {
    // INTENTIONAL BUG: Memory Leak
    // This interval is never cleared. If App component unmounts and remounts,
    // multiple intervals will run.
    const intervalId = setInterval(() => {
      setLeakCounter(prev => prev + 1);
      console.log('Memory leak interval running...', leakCounter);
    }, 5000);

    // To fix, uncomment the cleanup function:
    // return () => clearInterval(intervalId);
  }, [leakCounter]); // Dependency array is also problematic here, will cause re-creation of interval

  const handleLoginSuccess = (userData) => {
    setLoggedInUser(userData);
    setAppError(null); // Clear previous errors on successful login
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  // Simulate an error that an ErrorBoundary would catch
  const triggerAppError = () => {
    try {
      // This will throw an error because undefinedVar is not defined
      // @ts-ignore
      const val = undefinedVar.property; // eslint-disable-line no-undef
      console.log(val); // to prevent unused variable warning
    } catch (error) {
      setAppError("A simulated critical error occurred in App.js!");
      // In a real app, an ErrorBoundary would catch this if it originated from a child.
      // Here, we're setting state to display it.
    }
  };
  
  // --- Bug 4 (Frontend): Async/Promise Handling ---
  // Example of a function that might have unhandled promise rejections
  // This is a placeholder; WeatherDashboard and UserList will have more direct examples.
  const fetchDataWithPotentialIssue = useCallback(async () => {
    try {
      const response = await fetch('/api/some-endpoint-that-might-fail');
      if (!response.ok) {
        // Not throwing an error here or not catching it properly elsewhere
        // can lead to unhandled promise rejections.
        console.error('API call failed but not thrown as an error:', response.status);
        // return Promise.reject(new Error(`API Error: ${response.status}`)); // Correct way
      }
      // const data = await response.json(); // Process data
    } catch (error) {
      console.error("Caught error in fetchDataWithPotentialIssue:", error);
      // If this catch is missing, or if .then().catch() is not used, it's a bug.
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
      {/* --- Bug 8: Error Handling Gap (Frontend) --- */}
      {/* UserList component could crash. Ideally, wrap it with an ErrorBoundary */}
      {showUserList && <UserList />}
      <hr/>
      <button onClick={triggerAppError}>Trigger Simulated App Error</button>
      <p style={{marginTop: "20px", fontSize: "0.8em", color: "gray"}}>
        Open your browser's developer console to see detailed logs and errors.
      </p>
    </div>
  );
}

// Basic Error Boundary (for demonstration - usually a separate file)
// This is a very simple one. Real ones are more complex.
// To use it: <ErrorBoundary><UserList /></ErrorBoundary>
/*
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error">
          <h2>Something went wrong in this section.</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
*/

export default App; 