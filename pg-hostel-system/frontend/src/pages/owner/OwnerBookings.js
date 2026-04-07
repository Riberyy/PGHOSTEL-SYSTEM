// src/pages/owner/OwnerBookings.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { confirmed:'badge-success', pending:'badge-warning', cancelled:'badge-danger', completed:'badge-gray' };

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/bookings/owner').then(r => setBookings(r.data.bookings)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header"><h1>Bookings</h1><p>View all tenant bookings across your properties</p></div>
      <div className="tabs">
        {['all','confirmed','pending','cancelled'].map(s => (
          <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>{s.charAt(0).toUpperCase()+s.slice(1)} {s==='all'?`(${bookings.length})`:''}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><div style={{fontSize:'3rem'}}>📋</div><h3>No bookings</h3></div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Tenant</th><th>Property</th><th>Room</th><th>Check-in</th><th>Rent</th><th>Roommate</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td>
                    <p style={{ fontWeight:600 }}>{b.student?.name}</p>
                    <p className="text-muted" style={{ fontSize:'0.75rem' }}>{b.student?.phone}</p>
                  </td>
                  <td>{b.property?.name}</td>
                  <td>Room {b.roomNumber} <span className="badge badge-gray" style={{marginLeft:4}}>{b.roomType}</span></td>
                  <td>{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight:600, color:'var(--primary)' }}>₹{b.rentAmount?.toLocaleString()}</td>
                  <td>{b.roommate ? <span className="badge badge-success">{b.matchScore}% match</span> : <span className="text-muted">–</span>}</td>
                  <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
