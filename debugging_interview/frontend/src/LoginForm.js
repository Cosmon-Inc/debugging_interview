import React, { useState } from 'react';

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- Bug 9: Data Validation Failure (Frontend) ---
    // Basic client-side validation is missing.
    // Example: Empty fields, password complexity (though backend should always validate too)
    if (!username.trim() || !password.trim()) {
        // INTENTIONAL BUG: This validation is present, but the scenario is about *missing* validation.
        // For the bug, imagine this block is commented out or less comprehensive.
        // setError("Username and password cannot be empty.");
        // setLoading(false);
        // return;
        // To demonstrate the bug, we'll let it proceed and rely on backend validation,
        // but good UX would have frontend validation.
        // The actual bug for the candidate to find is the SQL Injection on the backend,
        // but poor frontend validation contributes to ease of exploitation.
    }


    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        onLoginSuccess({ username: data.username, userId: data.userId, message: data.message });
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      // --- Bug 4 (Frontend): Async/Promise Handling ---
      // Network errors or if the server is down, this catch block handles it.
      // An unhandled promise rejection would occur if this try/catch was missing
      // or if an intermediate promise in the chain wasn't handled.
      console.error("Login API call failed:", err);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // INTENTIONAL BUG: No autoFocus, no required attribute for HTML5 validation
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // INTENTIONAL BUG: No required attribute
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{marginTop: '10px', fontSize: '0.9em'}}>
        Try username: <code>admin'--</code> with any password (SQL Injection Bug 5). <br/>
        Or try valid credentials: <code>admin</code> / <code>password123</code>.
      </p>
    </div>
  );
}

export default LoginForm; 