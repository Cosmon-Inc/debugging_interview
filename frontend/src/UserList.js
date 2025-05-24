import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const query = searchTerm ? `?username=${encodeURIComponent(searchTerm)}` : '';

    fetch(`/api/users${query}`)
      .then(response => {
        if (!response.ok) {
          console.warn(`UserList fetch response not OK: ${response.status}`)
        }
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
            console.error("UserList expected an array, but received:", data);
            setUsers(data);
        } else {
            setUsers(data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch users:", err);
        setError(`Failed to fetch users: ${err.message}. Check console for more details.`);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm]);

  if (loading) return <p>Loading users...</p>;
  
  if (error) return <p className="error">{error}</p>;

  let userItems;
  try {
    userItems = users.map(user => (
      <li key={user.id || user.username}> 
        {user.username} ({user.email})
      </li>
    ));
  } catch (e) {
    console.error("Error rendering user list:", e);
    return <p className="error">Error rendering user list. Data might be in unexpected format.</p>;
  }

  return (
    <div className="container">
      <h2>User List</h2>
      <p>This list demonstrates performance issues when fetching all users, and data validation problems if the API returns unexpected data.</p>
      <input 
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{marginBottom: '10px', width: 'calc(100% - 22px)'}}
      />
      {users.length === 0 && !loading && <p>No users found.</p>}
      {users.length > 0 && <ul>{userItems}</ul>}
    </div>
  );
}

export default UserList; 