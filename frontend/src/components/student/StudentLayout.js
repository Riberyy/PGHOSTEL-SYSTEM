// src/components/student/StudentLayout.js
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiSearch, FiBookOpen,
  FiAlertCircle, FiHeart, FiUser, FiLogOut
} from 'react-icons/fi';

const navLinks = [
  { to: '/student', label: 'Dashboard', icon: <FiHome />, end: true },
  { to: '/student/search', label: 'Search PG / Hostel', icon: <FiSearch /> },
  { to: '/student/bookings', label: 'My Bookings', icon: <FiBookOpen /> },
{ to: '/student/payments', label: 'Rent & Payments', icon: <span style={{fontSize:'1rem'}}>₹</span> },
  { to: '/student/complaints', label: 'Complaints', icon: <FiAlertCircle /> },
  { to: '/student/wishlist', label: 'Wishlist', icon: <FiHeart /> },
  { to: '/student/profile', label: 'My Profile', icon: <FiUser /> },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🏠 PG System</h2>
          <span>Student Portal</span>
        </div>
        <div style={{ padding: '0 1rem 1rem', marginBottom: '0.5rem' }}>
          <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '0.75rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</p>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</p>
          </div>
        </div>
        <span className="nav-divider">Menu</span>
        {navLinks.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {l.icon} {l.label}
          </NavLink>
        ))}
        <span className="nav-divider" style={{ marginTop: '1rem' }}>Account</span>
        <button className="nav-item" onClick={handleLogout} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: 'var(--danger)' }}>
          <FiLogOut /> Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
