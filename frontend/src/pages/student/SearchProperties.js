// src/pages/student/SearchProperties.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiSearch, FiMapPin, FiHeart, FiWifi, FiZap, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AMENITY_ICONS = { wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '🫧', gym: '💪', kitchen: '🍳', security: '🔐', mess: '🍽️' };

const SearchProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [filters, setFilters] = useState({ city: '', type: '', gender: '', minRent: '', maxRent: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/properties', { params });
      setProperties(data.properties);
      setTotalPages(data.pages);
    } catch (_) {
      toast.error('Failed to load properties');
    } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // Load wishlist IDs
  useEffect(() => {
    api.get('/wishlist').then(r => setWishlist(r.data.wishlist?.map(p => p._id) || [])).catch(() => {});
  }, []);

  const toggleWishlist = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const { data } = await api.post(`/wishlist/${id}`);
      setWishlist(data.wishlist);
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (_) { toast.error('Login required'); }
  };

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  return (
    <div>
      <div className="page-header">
        <h1>Find your PG or Hostel</h1>
        <p>Browse approved accommodations across the city</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 160 }}>
          <label>City</label>
          <input className="form-control" placeholder="e.g. Bangalore" value={filters.city}
            onChange={e => setFilter('city', e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Type</label>
          <select className="form-control" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            <option value="PG">PG</option>
            <option value="Hostel">Hostel</option>
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Gender</label>
          <select className="form-control" value={filters.gender} onChange={e => setFilter('gender', e.target.value)}>
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="coed">Co-ed</option>
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Min Rent (₹)</label>
          <input className="form-control" type="number" placeholder="0" value={filters.minRent}
            onChange={e => setFilter('minRent', e.target.value)} style={{ width: 100 }} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Max Rent (₹)</label>
          <input className="form-control" type="number" placeholder="50000" value={filters.maxRent}
            onChange={e => setFilter('maxRent', e.target.value)} style={{ width: 100 }} />
        </div>
        <button className="btn btn-primary" onClick={fetchProperties}><FiSearch /> Search</button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner"/></div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <h3>No properties found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="property-grid">
            {properties.map(p => (
              <Link to={`/student/property/${p._id}`} key={p._id} style={{ textDecoration: 'none' }}>
                <div className="property-card">
                  {p.images?.[0] ? (
                    <img src={p.images[0].url} alt={p.name} />
                  ) : (
                    <div className="no-img">🏠</div>
                  )}
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3>{p.name}</h3>
                      <button onClick={e => toggleWishlist(p._id, e)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                        {wishlist.includes(p._id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <FiMapPin size={12} /> {p.address?.city}, {p.address?.state}
                    </p>
                    <div className="card-meta">
                      <span className="badge badge-info">{p.type}</span>
                      <span className="badge badge-gray">{p.gender}</span>
                      {p.amenities?.slice(0, 3).map(a => (
                        <span key={a} className="amenity-tag">{AMENITY_ICONS[a] || '✓'} {a}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <div>
                        <span className="price">₹{p.pricing?.minRent?.toLocaleString()}</span>
                        {p.pricing?.maxRent > p.pricing?.minRent && (
                          <span className="text-muted"> – ₹{p.pricing?.maxRent?.toLocaleString()}</span>
                        )}
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>/month</span>
                      </div>
                      <span className="badge badge-success">{p.availableRooms} rooms free</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchProperties;
