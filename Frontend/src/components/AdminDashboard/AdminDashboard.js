import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserPlan } from '../AdminDashboard/admin'; 
import { customAlert } from '../SweetAlertCommon/Custom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);  // new loading state

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);  // start spinner
    try {
      const response = await getAllUsers(); 
      setUsers(response.data);
    } catch {
      customAlert('Error', 'Failed to load users', 'error');
    }
    setLoading(false);  // stop spinner
  };

  const handlePlanChange = async (userId, newPlan, userName) => {
    try {
      await updateUserPlan(userId, newPlan);
      customAlert('Success', `${userName}'s plan updated to "${newPlan}"`, 'success');
      loadUsers(); 
    } catch {
      customAlert('Error', 'Could not update plan', 'error');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>
      <p className="admin-subtitle">Manage User Subscriptions</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search users by name, email, phone or user plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Update Plan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner-admin-dashboard"></div>
                </td>
              </tr>
            ) : filteredUsers.length ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td className="current-plan">{user.plan}</td>
                  <td>
                    <select
                      className="plan-select"
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.id, e.target.value, user.name)}
                      disabled={loading}
                    >
                      {['bronze', 'silver', 'gold', 'platinum', 'premium', 'premium_Plus'].map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#bbb' }}>
                  No users found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
