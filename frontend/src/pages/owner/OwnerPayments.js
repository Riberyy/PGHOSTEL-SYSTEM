// src/pages/owner/OwnerPayments.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { paid:'badge-success', pending:'badge-warning', overdue:'badge-danger' };

const OwnerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/payments/owner').then(r => setPayments(r.data.payments)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending   = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header"><h1>Payments</h1><p>Track rent payments from all tenants</p></div>
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value" style={{color:'var(--success)'}}>₹{totalCollected.toLocaleString()}</div><div className="stat-label">Collected</div></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value" style={{color:'var(--warning)'}}>₹{totalPending.toLocaleString()}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{payments.length}</div><div className="stat-label">Total Records</div></div>
      </div>
      <div className="tabs">
        {['all','paid','pending','overdue'].map(s => (
          <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Tenant</th><th>Property</th><th>Room</th><th>Amount</th><th>Month</th><th>Due Date</th><th>Paid On</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id}>
                <td><p style={{fontWeight:600}}>{p.student?.name}</p><p className="text-muted" style={{fontSize:'0.75rem'}}>{p.student?.email}</p></td>
                <td>{p.property?.name}</td>
                <td>Room {p.booking?.roomNumber}</td>
                <td style={{fontWeight:600,color:'var(--primary)'}}>₹{p.amount?.toLocaleString()}</td>
                <td>{p.month || '–'}</td>
                <td>{new Date(p.dueDate).toLocaleDateString('en-IN')}</td>
                <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '–'}</td>
                <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerPayments;
