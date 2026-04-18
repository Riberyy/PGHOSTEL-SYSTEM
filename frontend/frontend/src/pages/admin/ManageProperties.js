// src/pages/admin/ManageProperties.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCheck, FiX, FiEye } from 'react-icons/fi';

const STATUS_BADGE = { approved:'badge-success', pending:'badge-warning', rejected:'badge-danger' };

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewing, setReviewing] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status:'approved', adminNote:'' });
  const [submitting, setSubmitting] = useState(false);
  const [viewProp, setViewProp] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/properties', { params:{ status: filter === 'all' ? '' : filter } });
      setProperties(data.properties);
    } catch (_) { toast.error('Failed'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleReview = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await api.put(`/admin/properties/${reviewing._id}/review`, reviewForm);
      setProperties(p => p.map(x => x._id === reviewing._id ? data.property : x));
      setReviewing(null);
      toast.success(`Property ${reviewForm.status}!`);
    } catch (_) { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header"><h1>Property Listings</h1><p>Review and approve property submissions</p></div>
      <div className="tabs">
        {['pending','approved','rejected','all'].map(s => (
          <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
          {properties.map(p => (
            <div className="card" key={p._id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem', flexWrap:'wrap'}}>
                    <span style={{fontWeight:600, fontSize:'1rem'}}>{p.name}</span>
                    <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                    <span className="badge badge-info">{p.type}</span>
                    <span className="badge badge-gray">{p.gender}</span>
                  </div>
                  <p className="text-muted" style={{fontSize:'0.8rem', display:'flex', alignItems:'center', gap:4}}>
                    <FiMapPin size={12}/> {p.address?.city}, {p.address?.state}
                  </p>
                  <p className="text-muted" style={{fontSize:'0.8rem', marginTop:'0.25rem'}}>
                    Owner: <strong>{p.owner?.name}</strong> · {p.owner?.email} · {p.owner?.phone}
                  </p>
                  <p className="text-muted" style={{fontSize:'0.8rem'}}>
                    Rooms: {p.rooms?.length} · Deposit: ₹{p.pricing?.deposit?.toLocaleString()} · Submitted: {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  {p.adminNote && <p style={{fontSize:'0.8rem', color:'var(--danger)', marginTop:'0.25rem'}}>Note: {p.adminNote}</p>}
                </div>
                <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center'}}>
                  {p.images?.[0] && (
                    <img src={p.images[0].url} alt="" style={{width:80, height:60, objectFit:'cover', borderRadius:8}} />
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => setViewProp(p)}><FiEye/> View</button>
                  {p.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => { setReviewing(p); setReviewForm({ status:'approved', adminNote:'' }); }}><FiCheck/> Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setReviewing(p); setReviewForm({ status:'rejected', adminNote:'' }); }}><FiX/> Reject</button>
                    </>
                  )}
                  {p.status !== 'pending' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setReviewing(p); setReviewForm({ status:p.status==='approved'?'rejected':'approved', adminNote:'' }); }}>
                      {p.status === 'approved' ? 'Revoke' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {properties.length===0 && <div className="empty-state"><div style={{fontSize:'3rem'}}>🏠</div><h3>No properties</h3></div>}
        </div>
      )}

      {/* Review Modal */}
      {reviewing && (
        <div className="modal-overlay" onClick={() => setReviewing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{reviewForm.status === 'approved' ? '✅ Approve' : '❌ Reject'}: {reviewing.name}</h3>
              <button style={{background:'none',border:'none',fontSize:'1.25rem',cursor:'pointer'}} onClick={() => setReviewing(null)}>✕</button>
            </div>
            <form onSubmit={handleReview}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Decision</label>
                  <select className="form-control" value={reviewForm.status} onChange={e => setReviewForm(f => ({ ...f, status:e.target.value }))}>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Admin Note {reviewForm.status === 'rejected' && '*'}</label>
                  <textarea className="form-control" rows={3} required={reviewForm.status==='rejected'} value={reviewForm.adminNote} onChange={e => setReviewForm(f => ({ ...f, adminNote:e.target.value }))} placeholder="Reason for rejection or any note for the owner..."/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReviewing(null)}>Cancel</button>
                <button type="submit" className={`btn ${reviewForm.status==='approved'?'btn-primary':'btn-danger'}`} disabled={submitting}>{submitting?'Submitting...':'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProp && (
        <div className="modal-overlay" onClick={() => setViewProp(null)}>
          <div className="modal" style={{maxWidth:640}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewProp.name}</h3>
              <button style={{background:'none',border:'none',fontSize:'1.25rem',cursor:'pointer'}} onClick={() => setViewProp(null)}>✕</button>
            </div>
            <div className="modal-body">
              {viewProp.images?.length > 0 && (
                <div className="img-grid" style={{marginBottom:'1rem'}}>
                  {viewProp.images.slice(0,6).map((img,i) => <img key={i} src={img.url} alt=""/>)}
                </div>
              )}
              <p style={{marginBottom:'0.75rem', color:'var(--text-muted)'}}>{viewProp.description}</p>
              <p style={{fontSize:'0.875rem'}}><strong>Address:</strong> {viewProp.address?.street}, {viewProp.address?.city} {viewProp.address?.pincode}</p>
              <p style={{fontSize:'0.875rem', marginTop:'0.25rem'}}><strong>Amenities:</strong> {viewProp.amenities?.join(', ') || 'None'}</p>
              <p style={{fontSize:'0.875rem', marginTop:'0.25rem'}}><strong>Rooms:</strong> {viewProp.rooms?.length} total</p>
              <p style={{fontSize:'0.875rem', marginTop:'0.25rem'}}><strong>Deposit:</strong> ₹{viewProp.pricing?.deposit?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperties;
