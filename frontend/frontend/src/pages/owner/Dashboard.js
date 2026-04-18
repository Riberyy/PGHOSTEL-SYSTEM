// src/pages/owner/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiBookOpen, FiDollarSign, FiAlertCircle, FiClock } from 'react-icons/fi';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties:0, bookings:0, pendingPayments:0, openComplaints:0, revenue:0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetch = async () => {
    try {
      const [p, b, pay, c] = await Promise.allSettled([
        api.get('/properties/owner/mine'),
        api.get('/bookings/owner'),
        api.get('/payments/owner'),
        api.get('/complaints/owner'),
      ]);

      const props = p.status === 'fulfilled' ? p.value.data.properties : [];
      const bookings = b.status === 'fulfilled' ? b.value.data.bookings : [];
      const payments = pay.status === 'fulfilled' ? pay.value.data.payments : [];
      const complaints = c.status === 'fulfilled' ? c.value.data.complaints : [];

      const activeBookings = bookings.filter(x => x.status === 'confirmed');
      const pendingPay = payments.filter(x => x.status !== 'paid');
      const revenue = payments.filter(x => x.status === 'paid').reduce((s, x) => s + x.amount, 0);
      const openComp = complaints.filter(x => ['open', 'in_progress'].includes(x.status));

      setStats({
        properties: props.length,
        bookings: activeBookings.length,
        pendingPayments: pendingPay.length,
        openComplaints: openComp.length,
        revenue
      });
      setRecentBookings(bookings.slice(0, 5));
    } catch (_) {}
    finally { setLoading(false); }
  };
  fetch();
}, []);
  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const statCards = [
    { label:'My Properties', value:stats.properties, icon:'🏠', color:'#4f46e5', link:'/owner/properties' },
    { label:'Active Bookings', value:stats.bookings, icon:'📋', color:'#06b6d4', link:'/owner/bookings' },
    { label:'Pending Payments', value:stats.pendingPayments, icon:'⏳', color:'#f59e0b', link:'/owner/payments' },
    { label:'Open Complaints', value:stats.openComplaints, icon:'🔧', color:'#ef4444', link:'/owner/complaints' },
    { label:'Total Revenue', value:`₹${stats.revenue.toLocaleString()}`, icon:'💰', color:'#10b981', link:'/owner/payments' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Owner Dashboard</h1>
        <p>Welcome back, {user?.name}! Here's your property overview.</p>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <Link to={s.link} key={s.label} style={{ textDecoration:'none' }}>
            <div className="stat-card" style={{ cursor:'pointer', transition:'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color:s.color, fontSize:'1.75rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3>Recent Bookings</h3>
            <Link to="/owner/bookings" style={{ color:'var(--primary)', fontSize:'0.875rem' }}>View all →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-muted">No bookings yet</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {recentBookings.map(b => (
                <div key={b._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem', background:'var(--bg)', borderRadius:'var(--radius-sm)' }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.875rem' }}>{b.student?.name}</p>
                    <p className="text-muted" style={{ fontSize:'0.75rem' }}>{b.property?.name} · Room {b.roomNumber}</p>
                  </div>
                  <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-gray'}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom:'1rem' }}>Quick Actions</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <Link to="/owner/properties/add" className="btn btn-primary">+ Add New Property</Link>
            <Link to="/owner/properties" className="btn btn-secondary">📋 Manage Properties</Link>
            <Link to="/owner/complaints" className="btn btn-secondary">🔧 Handle Complaints</Link>
            <Link to="/owner/payments" className="btn btn-secondary">💰 View Payments</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
