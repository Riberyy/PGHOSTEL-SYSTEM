// src/pages/owner/MyProperties.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlusSquare, FiMapPin } from 'react-icons/fi';

const STATUS_BADGE = { approved:'badge-success', pending:'badge-warning', rejected:'badge-danger' };

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/properties/owner/mine').then(r => setProperties(r.data.properties)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(p => p.filter(x => x._id !== id));
      toast.success('Property deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
        <div><h1 style={{ fontSize:'1.75rem', fontFamily:'Poppins,sans-serif' }}>My Properties</h1><p className="text-muted">Manage your listed properties</p></div>
        <Link to="/owner/properties/add" className="btn btn-primary"><FiPlusSquare/> Add Property</Link>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:'3rem'}}>🏠</div>
          <h3>No properties yet</h3>
          <p>Add your first PG or Hostel to get started</p>
          <Link to="/owner/properties/add" className="btn btn-primary" style={{marginTop:'1rem'}}>Add Property</Link>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map(p => (
            <div className="property-card" key={p._id}>
              {p.images?.[0] ? <img src={p.images[0].url} alt={p.name}/> : <div className="no-img">🏠</div>}
              <div className="card-body">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
                  <h3 style={{ flex:1 }}>{p.name}</h3>
                  <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                </div>
                <p className="text-muted" style={{ fontSize:'0.8rem', display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                  <FiMapPin size={12}/> {p.address?.city}, {p.address?.state}
                </p>
                <div style={{ display:'flex', gap:'0.5rem', margin:'0.5rem 0' }}>
                  <span className="badge badge-info">{p.type}</span>
                  <span className="badge badge-gray">{p.rooms?.length || 0} rooms</span>
                  <span className="badge badge-success">{p.availableRooms} free</span>
                </div>
                {p.status === 'rejected' && p.adminNote && (
                  <p style={{ fontSize:'0.75rem', color:'var(--danger)', marginTop:'0.25rem' }}>Reason: {p.adminNote}</p>
                )}
                {p.status === 'pending' && (
                  <p style={{ fontSize:'0.75rem', color:'var(--warning)', marginTop:'0.25rem' }}>⏳ Awaiting admin approval</p>
                )}
                <div className="card-footer">
                  <span className="price">₹{p.pricing?.minRent?.toLocaleString()}/mo</span>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <Link to={`/owner/properties/edit/${p._id}`} className="btn btn-secondary btn-sm"><FiEdit2/></Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><FiTrash2/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
