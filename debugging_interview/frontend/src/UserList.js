import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    // --- Bug 4 (Frontend): Async/Promise Handling ---
    // Unhandled promise rejection if fetch fails and no .catch() is present
    // or if the response is not ok and not handled.
    
    // Construct query parameter for backend search
    const query = searchTerm ? `?username=${encodeURIComponent(searchTerm)}` : '';

    fetch(`/api/users${query}`)
      .then(response => {
        // --- Bug 9: Data Validation Failure (Frontend) ---
        // Assuming the response will always be ok and parseable JSON.
        // No check for response.ok before .json()
        if (!response.ok) {
          // INTENTIONAL BUG: If this block is missing, .json() might be called on an error response,
          // which could lead to an error or unexpected behavior.
          // throw new Error(`Network response was not ok: ${response.statusText}`);
          // For the bug, we'll let it proceed to show the issue.
          // The candidate should identify that response.ok should be checked.
          console.warn(`UserList fetch response not OK: ${response.status}`)
        }
        return response.json(); // This could fail if response is not valid JSON (e.g. 500 error HTML page)
      })
      .then(data => {
        // --- Bug 9: Data Validation Failure (Frontend) ---
        // Assuming 'data' is always an array. If the API returns an error object
        // (e.g., { error: "message" }), .map will fail.
        if (!Array.isArray(data)) {
            // INTENTIONAL BUG: If this check is missing, and API returns an error object,
            // users.map will crash the component.
            // setError("Received invalid data format from server.");
            // setUsers([]);
            // For the bug, we'll try to map it anyway.
            console.error("UserList expected an array, but received:", data);
            // To make the bug manifest, we'll set users to this potentially non-array:
            // @ts-ignore
            setUsers(data); // This will cause a crash if data is not an array.
        } else {
            setUsers(data);
        }
      })
      .catch(err => {
        // This catch handles network errors or errors thrown from .then() blocks
        console.error("Failed to fetch users:", err);
        setError(`Failed to fetch users: ${err.message}. Check console for more details.`);
        setUsers([]); // Clear users on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm]); // Re-fetch when searchTerm changes

  if (loading) return <p>Loading users...</p>;
  
  // --- Bug 8: Error Handling Gap (Frontend) ---
  // If 'error' state is set, we display it. But if a runtime error occurs
  // during rendering (e.g., users.map fails due to 'users' not being an array),
  // this component will crash without an ErrorBoundary in App.js.
  if (error) return <p className="error">{error}</p>;

  // This is where the crash would happen if 'users' is not an array due to Bug 9.
  let userItems;
  try {
    // @ts-ignore
    userItems = users.map(user => ( // users might not be an array here
      <li key={user.id || user.username}> 
        {user.username} ({user.email})
      </li>
    ));
  } catch (e) {
    // This local try-catch is a partial fix for Bug 9, but an ErrorBoundary is better.
    // For the interview, this catch block might be initially missing to let the component crash.
    console.error("Error rendering user list:", e);
    return <p className="error">Error rendering user list. Data might be in unexpected format.</p>;
  }


  return (
    <div className="container">
      <h2>User List</h2>
      <p>This list demonstrates Bug 3 (Performance Bottleneck on backend) when fetching all users, and Bug 9 (Data Validation) if the API returns unexpected data.</p>
      <input 
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{marginBottom: '10px', width: 'calc(100% - 22px)'}}
      />
      {users.length === 0 && !loading && <p>No users found.</p>}
      {/* @ts-ignore */}
      {users.length > 0 && <ul>{userItems}</ul>}
    </div>
  );
}

export default UserList; 