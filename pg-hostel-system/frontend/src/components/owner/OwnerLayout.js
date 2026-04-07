// src/components/owner/OwnerLayout.js
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiList, FiPlusSquare, FiBookOpen, FiDollarSign, FiAlertCircle, FiLogOut } from 'react-icons/fi';

const navLinks = [
  { to: '/owner', label: 'Dashboard', icon: <FiHome />, end: true },
  { to: '/owner/properties', label: 'My Properties', icon: <FiList /> },
  { to: '/owner/properties/add', label: 'Add Property', icon: <FiPlusSquare /> },
  { to: '/owner/bookings', label: 'Bookings', icon: <FiBookOpen /> },
  { to: '/owner/payments', label: 'Payments', icon: <span style={{fontSize:'1rem'}}>₹</span> },
  { to: '/owner/complaints', label: 'Complaints', icon: <FiAlertCircle /> },
];

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🏠 PG System</h2>
          <span>Owner Portal</span>
        </div>
        <div style={{ padding: '0 1rem 1rem', marginBottom: '0.5rem' }}>
          <div style={{ background: '#fef3c7', borderRadius: 8, padding: '0.75rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</p>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Property Owner</p>
          </div>
        </div>
        <span className="nav-divider">Menu</span>
        {navLinks.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {l.icon} {l.label}
          </NavLink>
        ))}
        <button className="nav-item" onClick={handleLogout} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: 'var(--danger)', marginTop: '1rem' }}>
          <FiLogOut /> Logout
        </button>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
};

export default OwnerLayout;
