import React from 'react';

const Sidebar = () => {
  return (
    <aside style={{ width: '200px', background: '#f2f2f2', padding: '10px' }}>
      <ul>
        <li>Dashboard</li>
        <li>AI Itinerary</li>
        <li>My Rides</li>
        <li>Profile</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
