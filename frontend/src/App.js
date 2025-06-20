import React, { useState, useEffect, useContext, createContext, useMemo, useCallback } from 'react';
import LoginForm from './LoginForm';
import UserList from './UserList';
import WeatherDashboard from './WeatherDashboard';

const AppContext = createContext();

// Context performance issue - value recreated on every render
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [userPreferences, setUserPreferences] = useState({ theme: 'light', language: 'en' });
  const [notifications, setNotifications] = useState([]);

  // Context value is recreated on every render causing unnecessary re-renders
  // Should be memoized but isn't
  const contextValue = {
    user,
    setUser,
    dbStats,
    setDbStats,
    userPreferences,
    setUserPreferences,
    notifications,
    setNotifications
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set()); // Using Set
  const [weatherData, setWeatherData] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userPreferences, setUserPreferences] = useState({ theme: 'light', language: 'en' });

  // Infinite re-render loop - useEffect with wrong dependencies
  useEffect(() => {
    // This creates a new object every time, causing infinite re-renders
    const newPrefs = { theme: userPreferences.theme, language: userPreferences.language };
    setUserPreferences(newPrefs);
  }, [userPreferences]); // userPreferences changes every render due to recreation

  // Stale closure in async operation
  const fetchDelayedData = useCallback(async () => {
    setTimeout(() => {
      // This closure captures the initial user state, not current
      console.log('Delayed operation for user:', user?.username); // Will be stale
      setNotifications(prev => [...prev, { 
        id: Date.now(), 
        message: `Delayed operation completed for ${user?.username || 'unknown'}` 
      }]);
    }, 2000);
  }, []); // Missing user dependency, creating stale closure

  // Memory leak - interval not cleaned up
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.slice(-5)); // Keep only last 5 notifications
    }, 5000);
    
    // Missing cleanup - interval continues after unmount
    // Should return cleanup function but doesn't
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchDelayedData(); // Will capture current user in stale closure
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedUsers(new Set());
    setWeatherData([]);
    setDbStats(null);
    setNotifications([]);
  };

  const triggerAppError = () => {
    // Simulate an error that should be caught by error boundary
    throw new Error('Intentional error for testing error boundaries');
  };

  const fetchDbStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/db-stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDbStats(data);
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
      setNotifications(prev => [...prev, { 
        id: Date.now(), 
        message: `Error fetching DB stats: ${error.message}`,
        type: 'error'
      }]);
    }
  };

  const updateUserPreference = (key, value) => {
    // Direct state mutation - modifies existing object
    userPreferences[key] = value; // Should create new object: setUserPreferences(prev => ({...prev, [key]: value}))
    setUserPreferences(userPreferences); // React won't detect this change
  };

  // Expensive computation not memoized - runs on every render
  const computeExpensiveValue = () => {
    console.log('Computing expensive value...');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    return result;
  };

  const expensiveValue = computeExpensiveValue(); // Should be memoized but isn't

  return (
    <AppProvider>
      <div className="container">
        <h1>Advanced Debugging Interview Challenge</h1>
        
        {!user ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
              <p>Welcome, {user.username}!</p>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={fetchDbStats} style={{ marginLeft: '10px' }}>
                Fetch DB Stats
              </button>
              <button onClick={triggerAppError} style={{ marginLeft: '10px' }}>
                Trigger Error
              </button>
              <p>Expensive computed value: {expensiveValue.toFixed(2)}</p>
            </div>

            <WeatherDashboard />
            <UserList />

            {dbStats && (
              <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <h3>Database Statistics</h3>
                <p>Total Users: {dbStats.total_users}</p>
                <p>Weather Requests: {dbStats.weather_requests}</p>
                <p>Cache Size: {dbStats.cache_status?.weather_cache_size}</p>
                <p>Active Sessions: {dbStats.cache_status?.session_count}</p>
              </div>
            )}

            {/* Notifications list uses array index as key */}
            <div style={{ marginTop: '20px' }}>
              <h3>Notifications</h3>
              {notifications.map((notification, index) => (
                <div 
                  key={index} // Using array index as key - should use notification.id
                  style={{ 
                    padding: '5px', 
                    margin: '2px', 
                    backgroundColor: notification.type === 'error' ? '#ffebee' : '#e8f5e8' 
                  }}
                >
                  {notification.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppProvider>
  );
}

export default App; 