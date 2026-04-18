// src/pages/owner/OwnerComplaints.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { open:'badge-danger', in_progress:'badge-warning', resolved:'badge-success', closed:'badge-gray' };
const PRIORITY_COLOR = { high:'var(--danger)', medium:'var(--warning)', low:'var(--success)' };

const OwnerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status:'', resolution:'', comment:'' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get('/complaints/owner').then(r => setComplaints(r.data.complaints)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const openUpdate = (c) => { setSelected(c); setUpdateForm({ status:c.status, resolution:c.resolution||'', comment:'' }); };

  const handleUpdate = async e => {
    e.preventDefault(); setUpdating(true);
    try {
      const { data } = await api.put(`/complaints/${selected._id}`, updateForm);
      setComplaints(c => c.map(x => x._id === selected._id ? data.complaint : x));
      setSelected(null);
      toast.success('Complaint updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header"><h1>Complaints</h1><p>Manage maintenance requests from tenants</p></div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {['open','in_progress','resolved','closed'].map(s => (
          <div key={s} className="stat-card">
            <div className="stat-value" style={{fontSize:'1.5rem'}}>{complaints.filter(c=>c.status===s).length}</div>
            <div className="stat-label">{s.replace('_',' ')}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {complaints.map(c => (
          <div className="card" key={c._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:600 }}>{c.title}</span>
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status.replace('_',' ')}</span>
                  <span style={{ fontSize:'0.75rem', fontWeight:600, color:PRIORITY_COLOR[c.priority] }}>● {c.priority} priority</span>
                  <span className="badge badge-gray">{c.category}</span>
                </div>
                <p className="text-muted" style={{ fontSize:'0.8rem' }}>
                  From: <strong>{c.raisedBy?.name}</strong> · {c.property?.name} · {new Date(c.createdAt).toLocaleDateString('en-IN')}
                </p>
                <p style={{ fontSize:'0.875rem', marginTop:'0.5rem' }}>{c.description}</p>
                {c.resolution && <p style={{ fontSize:'0.875rem', color:'var(--success)', marginTop:'0.5rem' }}>✓ {c.resolution}</p>}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => openUpdate(c)}>Update Status</button>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="empty-state"><div style={{fontSize:'3rem'}}>✅</div><h3>No complaints</h3><p>All clear!</p></div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update: {selected.title}</h3>
              <button style={{background:'none',border:'none',fontSize:'1.25rem',cursor:'pointer'}} onClick={() => setSelected(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status:e.target.value }))}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Resolution Note</label>
                  <textarea className="form-control" rows={3} value={updateForm.resolution} onChange={e => setUpdateForm(f => ({ ...f, resolution:e.target.value }))} placeholder="Describe what was done to resolve this..."/>
                </div>
                <div className="form-group">
                  <label>Add Comment</label>
                  <input className="form-control" value={updateForm.comment} onChange={e => setUpdateForm(f => ({ ...f, comment:e.target.value }))} placeholder="Add a comment for the tenant..."/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>{updating?'Updating...':'Update Complaint'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerComplaints;
