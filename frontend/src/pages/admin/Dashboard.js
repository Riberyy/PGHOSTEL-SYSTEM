// src/pages/admin/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (!data) return <div className="empty-state"><h3>Failed to load dashboard</h3></div>;

  const { stats, recentBookings, monthlyRevenue } = data;
  const maxRev = Math.max(...(monthlyRevenue?.map(m => m.total) || [1]));

  const statCards = [
    { label:'Total Users', value:stats.totalUsers, icon:'👥', color:'#4f46e5', link:'/admin/users' },
    { label:'Total Properties', value:stats.totalProperties, icon:'🏠', color:'#06b6d4', link:'/admin/properties' },
    { label:'Pending Approval', value:stats.pendingProperties, icon:'⏳', color:'#f59e0b', link:'/admin/properties' },
    { label:'Total Bookings', value:stats.totalBookings, icon:'📋', color:'#10b981', link:'/admin/bookings' },
    { label:'Open Complaints', value:stats.openComplaints, icon:'🔧', color:'#ef4444', link:'/admin/complaints' },
    { label:'Total Revenue', value:`₹${(stats.totalRevenue||0).toLocaleString()}`, icon:'💰', color:'#8b5cf6', link:'/admin/bookings' },
  ];

  return (
    <div>
      <div className="page-header"><h1>Admin Dashboard</h1><p>System-wide analytics and management</p></div>

      <div className="stats-grid">
        {statCards.map(s => (
          <Link to={s.link} key={s.label} style={{textDecoration:'none'}}>
            <div className="stat-card" style={{cursor:'pointer'}}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{color:s.color, fontSize:'1.75rem'}}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:'1.5rem', alignItems:'start' }}>
        {/* Revenue Chart */}
        <div className="card">
          <h3 style={{marginBottom:'1.25rem'}}>Monthly Revenue</h3>
          {monthlyRevenue?.length > 0 ? (
            <div style={{display:'flex', alignItems:'flex-end', gap:'0.5rem', height:160}}>
              {monthlyRevenue.map(m => (
                <div key={m._id} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem'}}>
                  <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>₹{(m.total/1000).toFixed(0)}k</span>
                  <div style={{width:'100%', background:'var(--primary)', borderRadius:'4px 4px 0 0', height:`${(m.total/maxRev)*120}px`, minHeight:4, transition:'height 0.5s'}}/>
                  <span style={{fontSize:'0.65rem', color:'var(--text-muted)'}}>{m._id?.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted">No revenue data yet</p>}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
            <h3>Recent Bookings</h3>
            <Link to="/admin/bookings" style={{color:'var(--primary)',fontSize:'0.875rem'}}>All →</Link>
          </div>
          {recentBookings?.length === 0 ? <p className="text-muted">No bookings</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              {recentBookings?.map(b => (
                <div key={b._id} style={{padding:'0.75rem', background:'var(--bg)', borderRadius:'var(--radius-sm)'}}>
                  <p style={{fontWeight:600, fontSize:'0.875rem'}}>{b.student?.name}</p>
                  <p className="text-muted" style={{fontSize:'0.75rem'}}>{b.property?.name} · {b.property?.type}</p>
                  <span className={`badge ${b.status==='confirmed'?'badge-success':'badge-warning'}`} style={{marginTop:4}}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.pendingProperties > 0 && (
        <div style={{marginTop:'1.5rem', background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:'var(--radius)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <p style={{fontWeight:600, color:'#92400e'}}>⚠️ {stats.pendingProperties} propert{stats.pendingProperties===1?'y':'ies'} awaiting approval</p>
            <p style={{fontSize:'0.875rem', color:'#a16207'}}>Review and approve property listings from owners</p>
          </div>
          <Link to="/admin/properties" className="btn btn-sm" style={{background:'#f59e0b', color:'#fff', border:'none'}}>Review Now</Link>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
