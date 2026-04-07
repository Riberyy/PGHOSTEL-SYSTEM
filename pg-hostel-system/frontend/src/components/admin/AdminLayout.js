// src/components/admin/AdminLayout.js
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiList, FiBookOpen, FiAlertCircle, FiLogOut } from 'react-icons/fi';

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: <FiHome />, end: true },
  { to: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
  { to: '/admin/properties', label: 'Properties', icon: <FiList /> },
  { to: '/admin/bookings', label: 'All Bookings', icon: <FiBookOpen /> },
  { to: '/admin/complaints', label: 'Complaints', icon: <FiAlertCircle /> },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🏠 PG System</h2>
          <span>Admin Panel</span>
        </div>
        <div style={{ padding: '0 1rem 1rem' }}>
          <div style={{ background: '#fee2e2', borderRadius: 8, padding: '0.75rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Administrator</p>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Full access</p>
          </div>
        </div>
        <span className="nav-divider">Menu</span>
        {navLinks.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {l.icon} {l.label}
          </NavLink>
        ))}
        <button className="nav-item" onClick={() => { logout(); navigate('/login'); }}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: 'var(--danger)', marginTop: '1rem' }}>
          <FiLogOut /> Logout
        </button>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
};

export default AdminLayout;
