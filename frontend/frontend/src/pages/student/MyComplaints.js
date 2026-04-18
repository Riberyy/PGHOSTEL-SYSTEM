// src/pages/student/MyComplaints.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { open:'badge-danger', in_progress:'badge-warning', resolved:'badge-success', closed:'badge-gray' };
const PRIORITY_COLOR = { high:'var(--danger)', medium:'var(--warning)', low:'var(--success)' };

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ propertyId:'', bookingId:'', title:'', category:'plumbing', description:'', priority:'medium' });

  useEffect(() => {
    Promise.all([api.get('/complaints/my'), api.get('/bookings/my')])
      .then(([c, b]) => { setComplaints(c.data.complaints); setBookings(b.data.bookings.filter(x => x.status === 'confirmed')); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const booking = bookings.find(b => b._id === form.bookingId);
      const payload = { ...form, propertyId: form.propertyId || booking?.property?._id };
      const { data } = await api.post('/complaints', payload);
      setComplaints(c => [data.complaint, ...c]);
      setShowForm(false);
      setForm({ propertyId:'', bookingId:'', title:'', category:'plumbing', description:'', priority:'medium' });
      toast.success('Complaint submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
        <div><h1 style={{ fontSize:'1.75rem', fontFamily:'Poppins,sans-serif' }}>Complaints</h1><p className="text-muted">Raise and track maintenance issues</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Complaint</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {complaints.map(c => (
          <div className="card" key={c._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
                  <span style={{ fontWeight:600 }}>{c.title}</span>
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status.replace('_',' ')}</span>
                  <span style={{ fontSize:'0.75rem', fontWeight:600, color:PRIORITY_COLOR[c.priority] }}>● {c.priority}</span>
                </div>
                <p className="text-muted" style={{ fontSize:'0.8rem' }}>{c.property?.name} · {c.category}</p>
                <p style={{ fontSize:'0.875rem', marginTop:'0.5rem', color:'var(--text)' }}>{c.description}</p>
                {c.resolution && <p style={{ fontSize:'0.875rem', color:'var(--success)', marginTop:'0.5rem' }}>✓ Resolution: {c.resolution}</p>}
              </div>
              <p className="text-muted" style={{ fontSize:'0.75rem' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="empty-state"><div style={{fontSize:'3rem'}}>🔧</div><h3>No complaints</h3><p>All good! Raise an issue if needed.</p></div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Complaint</h3>
              <button style={{ background:'none',border:'none',fontSize:'1.25rem',cursor:'pointer' }} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Booking</label>
                  <select className="form-control" required value={form.bookingId}
                    onChange={e => { const b = bookings.find(x => x._id === e.target.value); setForm(f => ({ ...f, bookingId:e.target.value, propertyId:b?.property?._id||'' })); }}>
                    <option value="">-- Select your booking --</option>
                    {bookings.map(b => <option key={b._id} value={b._id}>{b.property?.name} – Room {b.roomNumber}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="Brief description" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                      {['plumbing','electrical','furniture','cleanliness','security','wifi','other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.value }))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={3} required value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Describe the issue in detail..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Complaint'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
