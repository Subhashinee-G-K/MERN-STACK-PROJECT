import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={() => navigate('/manage-donors')}>Manage Donors</button>
      <button onClick={() => navigate('/manage-receivers')}>Manage Receivers</button>
    </div>
  );
};

export default AdminDashboard;
