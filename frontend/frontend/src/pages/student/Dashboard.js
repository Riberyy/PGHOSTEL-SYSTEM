// src/pages/student/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiHome, FiDollarSign, FiAlertCircle, FiSearch } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, pendingPayments: 0, openComplaints: 0 });
  const [recentBooking, setRecentBooking] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bookRes, payRes, cmpRes] = await Promise.all([
          api.get('/bookings/my'),
          api.get('/payments/my'),
          api.get('/complaints/my'),
        ]);
        const activeBookings = bookRes.data.bookings.filter(b => b.status === 'confirmed');
        const pending = payRes.data.payments.filter(p => p.status !== 'paid');
        const open = cmpRes.data.complaints.filter(c => c.status === 'open');
        setStats({ bookings: activeBookings.length, pendingPayments: pending.length, openComplaints: open.length });
        if (activeBookings.length > 0) setRecentBooking(activeBookings[0]);
      } catch (_) {}
    };
    fetch();
  }, []);

  const statCards = [
    { label: 'Active Bookings', value: stats.bookings, icon: <FiHome />, color: '#4f46e5', bg: '#ede9fe' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: <span style={{fontSize:'1.25rem'}}>₹</span>, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Open Complaints', value: stats.openComplaints, icon: <FiAlertCircle />, color: '#ef4444', bg: '#fee2e2' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening with your accommodation</p>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {recentBooking ? (
        <div className="card mb-2">
          <h3 style={{ marginBottom: '1rem' }}>🏡 Current Accommodation</h3>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Property</p>
              <p style={{ fontWeight: 600 }}>{recentBooking.property?.name}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Room</p>
              <p style={{ fontWeight: 600 }}>{recentBooking.roomNumber} ({recentBooking.roomType})</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Monthly Rent</p>
              <p style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{recentBooking.rentAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Check-in</p>
              <p style={{ fontWeight: 600 }}>{new Date(recentBooking.checkIn).toLocaleDateString('en-IN')}</p>
            </div>
            {recentBooking.roommate && (
              <div>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Roommate</p>
                <p style={{ fontWeight: 600 }}>{recentBooking.roommate?.name}</p>
                <span className="badge badge-success">Match: {recentBooking.matchScore}%</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏠</p>
          <h3>No active booking</h3>
          <p className="text-muted mb-2">Start by searching for PG or Hostel accommodations</p>
          <Link to="/student/search" className="btn btn-primary">
            <FiSearch /> Search Properties
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
