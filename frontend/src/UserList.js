import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchTerm) {
        params.append('username', searchTerm);
      }

      const response = await fetch(`http://localhost:5000/api/users?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleUserSelection = (userId, isSelected) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (isSelected) {
      newSelectedUsers.add(userId);
    } else {
      newSelectedUsers.delete(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>User List</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '300px', padding: '5px' }}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div>
          <p>Showing {users.length} users (Page {page})</p>
          <p>Selected: {selectedUsers.size} users</p>
          
          {/* Using array index as key instead of user.id */}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map((user, index) => (
              <li 
                key={index} // Should use user.id, not array index
                style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  border: '1px solid #ddd',
                  backgroundColor: selectedUsers.has(user.id) ? '#e3f2fd' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                <strong>{user.username}</strong> - {user.email}
                <span style={{ marginLeft: '10px', color: '#666' }}>
                  (ID: {user.id})
                </span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span style={{ margin: '0 10px' }}>Page {page}</span>
            <button 
              onClick={() => setPage(prev => prev + 1)}
              disabled={users.length < 20}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList; 