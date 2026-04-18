// src/pages/student/Wishlist.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiTrash2 } from 'react-icons/fi';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => setWishlist(r.data.wishlist || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    await api.post(`/wishlist/${id}`);
    setWishlist(w => w.filter(p => p._id !== id));
    toast.success('Removed from wishlist');
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header"><h1>Wishlist ❤️</h1><p>Properties you've saved for later</p></div>
      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:'3rem'}}>🤍</div>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any property to save it here</p>
          <Link to="/student/search" className="btn btn-primary" style={{marginTop:'1rem'}}>Browse Properties</Link>
        </div>
      ) : (
        <div className="property-grid">
          {wishlist.map(p => (
            <div className="property-card" key={p._id}>
              {p.images?.[0] ? <img src={p.images[0].url} alt={p.name}/> : <div className="no-img">🏠</div>}
              <div className="card-body">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <h3>{p.name}</h3>
                  <button onClick={() => remove(p._id)} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer'}}><FiTrash2/></button>
                </div>
                <p className="text-muted" style={{fontSize:'0.8rem',display:'flex',alignItems:'center',gap:4,marginTop:4}}>
                  <FiMapPin size={12}/> {p.address?.city}, {p.address?.state}
                </p>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                  <span className="badge badge-info">{p.type}</span>
                  <span className="badge badge-gray">{p.gender}</span>
                </div>
                <div className="card-footer">
                  <span className="price">₹{p.pricing?.minRent?.toLocaleString()}/mo</span>
                  <Link to={`/student/property/${p._id}`} className="btn btn-primary btn-sm">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
