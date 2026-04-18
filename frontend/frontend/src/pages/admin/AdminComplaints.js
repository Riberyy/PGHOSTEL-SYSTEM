// src/pages/admin/AdminComplaints.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const STATUS_BADGE = { open:'badge-danger', in_progress:'badge-warning', resolved:'badge-success', closed:'badge-gray' };
const PRIORITY_COLOR = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' };

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/complaints').then(r => setComplaints(r.data.complaints)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const summary = {
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    closed: complaints.filter(c => c.status === 'closed').length,
  };

  return (
    <div>
      <div className="page-header"><h1>All Complaints</h1><p>System-wide complaint monitoring</p></div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="stat-card"><div className="stat-value" style={{color:'var(--danger)'}}>{summary.open}</div><div className="stat-label">Open</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:'var(--warning)'}}>{summary.in_progress}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:'var(--success)'}}>{summary.resolved}</div><div className="stat-label">Resolved</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:'var(--text-muted)'}}>{summary.closed}</div><div className="stat-label">Closed</div></div>
      </div>
      <div className="tabs">
        {['all','open','in_progress','resolved','closed'].map(s => (
          <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>{s.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
        ))}
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Raised By</th><th>Property</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td style={{fontWeight:600}}>{c.title}</td>
                  <td><p style={{fontWeight:500}}>{c.raisedBy?.name}</p><p className="text-muted" style={{fontSize:'0.75rem'}}>{c.raisedBy?.email}</p></td>
                  <td>{c.property?.name}</td>
                  <td className="text-muted">{c.category}</td>
                  <td><span style={{fontWeight:600, color:PRIORITY_COLOR[c.priority], fontSize:'0.8rem'}}>● {c.priority}</span></td>
                  <td className="text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status.replace('_',' ')}</span></td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No complaints</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
