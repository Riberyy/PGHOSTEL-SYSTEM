// src/pages/admin/AdminBookings.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const STATUS_BADGE = { confirmed:'badge-success', pending:'badge-warning', cancelled:'badge-danger', completed:'badge-gray' };

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/bookings').then(r => setBookings(r.data.bookings)).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    !search || b.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.property?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header"><h1>All Bookings</h1><p>System-wide booking records</p></div>
      <div className="filter-bar">
        <div className="form-group" style={{margin:0,flex:1}}>
          <label>Search</label>
          <input className="form-control" placeholder="Tenant or property name..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <span className="badge badge-gray">{filtered.length} bookings</span>
        {' '}
        <span className="badge badge-success">{bookings.filter(b=>b.status==='confirmed').length} confirmed</span>
        {' '}
        <span className="badge badge-danger">{bookings.filter(b=>b.status==='cancelled').length} cancelled</span>
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Tenant</th><th>Property</th><th>Type</th><th>Room</th><th>Check-in</th><th>Rent</th><th>Roommate</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td><p style={{fontWeight:600}}>{b.student?.name}</p><p className="text-muted" style={{fontSize:'0.75rem'}}>{b.student?.email}</p></td>
                  <td>{b.property?.name}</td>
                  <td><span className="badge badge-info">{b.property?.type}</span></td>
                  <td>Room {b.roomNumber} <span className="badge badge-gray">{b.roomType}</span></td>
                  <td>{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                  <td style={{fontWeight:600,color:'var(--primary)'}}>₹{b.rentAmount?.toLocaleString()}</td>
                  <td>{b.roommate ? <span className="badge badge-success">{b.matchScore}%</span> : '–'}</td>
                  <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
