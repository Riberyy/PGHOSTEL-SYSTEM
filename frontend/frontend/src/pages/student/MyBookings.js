// src/pages/student/MyBookings.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';

const STATUS_BADGE = { confirmed:'badge-success', pending:'badge-warning', cancelled:'badge-danger', completed:'badge-gray' };

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data.bookings)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Student requested cancellation' });
      setBookings(b => b.map(x => x._id === id ? { ...x, status: 'cancelled' } : x));
      toast.success('Booking cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCancelling(null); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header"><h1>My Bookings</h1><p>Track all your accommodation bookings</p></div>
      {bookings.length === 0 ? (
        <div className="empty-state"><div style={{fontSize:'3rem'}}>📋</div><h3>No bookings yet</h3><p>Search for a PG or Hostel to get started</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {bookings.map(b => (
            <div className="card" key={b._id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                    <h3 style={{ fontSize:'1.1rem' }}>{b.property?.name}</h3>
                    <span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span>
                  </div>
                  <p className="text-muted" style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.875rem' }}>
                    <FiMapPin size={13}/> {b.property?.address?.city}, {b.property?.address?.state}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'0.75rem', marginTop:'1rem' }}>
                    <div><p className="text-muted" style={{fontSize:'0.75rem'}}>Room</p><p style={{fontWeight:600}}>Room {b.roomNumber} ({b.roomType})</p></div>
                    <div><p className="text-muted" style={{fontSize:'0.75rem'}}>Check-in</p><p style={{fontWeight:600}}>{new Date(b.checkIn).toLocaleDateString('en-IN')}</p></div>
                    <div><p className="text-muted" style={{fontSize:'0.75rem'}}>Monthly Rent</p><p style={{fontWeight:600,color:'var(--primary)'}}>₹{b.rentAmount?.toLocaleString()}</p></div>
                    {b.roommate && (
                      <div>
                        <p className="text-muted" style={{fontSize:'0.75rem'}}>Roommate</p>
                        <p style={{fontWeight:600, display:'flex', alignItems:'center', gap:4}}><FiUser size={13}/> {b.roommate.name}</p>
                        <span className="badge badge-success" style={{marginTop:4}}>Match: {b.matchScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {b.status === 'confirmed' && (
                  <button className="btn btn-danger btn-sm" onClick={() => cancel(b._id)} disabled={cancelling === b._id}>
                    {cancelling === b._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
