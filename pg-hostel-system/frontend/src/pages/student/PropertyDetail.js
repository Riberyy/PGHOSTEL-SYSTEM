// src/pages/student/PropertyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiMail, FiArrowLeft } from 'react-icons/fi';


const AMENITY_ICONS = { wifi:'📶',ac:'❄️',parking:'🅿️',laundry:'🫧',gym:'💪',kitchen:'🍳',security:'🔐',mess:'🍽️',tv:'📺',power_backup:'⚡' };

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [showBook, setShowBook] = useState(false);
  const [bookForm, setBookForm] = useState({ roomNumber: '', checkIn: '' });
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(r => setProperty(r.data.property))
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async e => {
    e.preventDefault();
    if (!bookForm.roomNumber || !bookForm.checkIn) return toast.error('Please fill all fields');
    setBooking(true);
    try {
      const { data } = await api.post('/bookings', { propertyId: id, ...bookForm });

      if (data.requiresConfirmation) {
        if (window.confirm(data.message + '\n\nClick OK to continue anyway.')) {
          const { data: forced } = await api.post('/bookings', { propertyId: id, ...bookForm, forceBook: true });
          setShowBook(false);
          setBookingSuccess({
            roomNumber: bookForm.roomNumber,
            roomType: forced.booking?.roomType || '',
            rentAmount: forced.booking?.rentAmount || 0,
            matchScore: forced.booking?.matchScore || 0,
            roommate: forced.booking?.roommate || null,
          });
          toast.success('🎉 Booking done successfully!');
        }
        setBooking(false);
        return;
      }

      setShowBook(false);
      setBookingSuccess({
        roomNumber: bookForm.roomNumber,
        roomType: data.booking?.roomType || '',
        rentAmount: data.booking?.rentAmount || 0,
        matchScore: data.booking?.matchScore || 0,
        roommate: data.booking?.roommate || null,
      });
      toast.success('🎉 Booking done successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  // Loading state
  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  // Not found
  if (!property) return <div className="empty-state"><h3>Property not found</h3></div>;

  // SUCCESS SCREEN - must be before availableRooms
  if (bookingSuccess) {
    return (
      <div style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
        <div className="card">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ marginBottom: '0.5rem', color: '#10b981' }}>Booking Done Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You have successfully joined this PG/Hostel. A confirmation email has been sent to you.
          </p>
          <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{property?.name}</p>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Room: {bookingSuccess?.roomNumber} {bookingSuccess?.roomType ? `(${bookingSuccess.roomType})` : ''}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Monthly Rent: ₹{bookingSuccess?.rentAmount?.toLocaleString()}
            </p>
          </div>
          {bookingSuccess?.roommate && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>🤝 Roommate Matched!</p>
              {bookingSuccess.matchScore > 0 && (
                <p style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: 500 }}>
                  {bookingSuccess.matchScore}% compatible
                </p>
              )}
            </div>
          )}
          <button className="btn btn-primary btn-full" onClick={() => navigate('/student/bookings')}>
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // Available rooms - AFTER success check
  const availableRooms = property.rooms?.filter(r => r.isAvailable) || [];

  return (
    <div>
      <button className="btn btn-outline btn-sm mb-2" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      {/* Image Gallery */}
      {property.images?.length > 0 ? (
        <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '1.5rem', height: 360 }}>
          <img src={property.images[imgIdx]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {property.images.length > 1 && (
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
              {property.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ height: 200, background: 'var(--primary-light)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: '1.5rem' }}>🏠</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div className="card mb-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>{property.name}</h1>
                <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <FiMapPin size={14} /> {property.address?.street}, {property.address?.city} – {property.address?.pincode}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <span className="badge badge-info">{property.type}</span>
                  <span className="badge badge-gray">{property.gender}</span>
                  {property.type === 'PG' && <span className="badge badge-success">🤝 Roommate Matching</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{property.pricing?.minRent?.toLocaleString()}</p>
                {property.pricing?.maxRent > property.pricing?.minRent && (
                  <p className="text-muted">up to ₹{property.pricing?.maxRent?.toLocaleString()}</p>
                )}
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>per month</p>
              </div>
            </div>
          </div>

          <div className="card mb-2">
            <h3 style={{ marginBottom: '0.75rem' }}>About this property</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{property.description}</p>
          </div>

          <div className="card mb-2">
            <h3 style={{ marginBottom: '0.75rem' }}>Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {property.amenities?.map(a => (
                <span key={a} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: 999, fontSize: '0.875rem', fontWeight: 500 }}>
                  {AMENITY_ICONS[a] || '✓'} {a.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="card mb-2">
            <h3 style={{ marginBottom: '1rem' }}>Available Rooms</h3>
            {availableRooms.length === 0 ? (
              <p className="text-muted">No rooms currently available</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {availableRooms.map(r => (
                  <div key={r.roomNumber} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>Room {r.roomNumber}</p>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{r.type} • Floor {r.floor} • Capacity {r.capacity}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{r.price?.toLocaleString()}/mo</p>
                      <button className="btn btn-primary btn-sm" onClick={() => { setBookForm(f => ({ ...f, roomNumber: r.roomNumber })); setShowBook(true); }}>
                        Book this room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {property.rules?.length > 0 && (
            <div className="card mb-2">
              <h3 style={{ marginBottom: '0.75rem' }}>House Rules</h3>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                {property.rules.map((r, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="card mb-2">
            <h3 style={{ marginBottom: '0.75rem' }}>Owner Details</h3>
            <p style={{ fontWeight: 600 }}>{property.owner?.name}</p>
            <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.875rem' }}>
              <FiPhone size={13} /> {property.owner?.phone}
            </p>
            <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.875rem' }}>
              <FiMail size={13} /> {property.owner?.email}
            </p>
          </div>
          <div className="card mb-2">
            <h3 style={{ marginBottom: '0.75rem' }}>Pricing Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Monthly Rent</span>
                <span style={{ fontWeight: 600 }}>₹{property.pricing?.minRent?.toLocaleString()}+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Security Deposit</span>
                <span style={{ fontWeight: 600 }}>₹{property.pricing?.deposit?.toLocaleString()}</span>
              </div>
              {property.pricing?.maintenance > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Maintenance</span>
                  <span style={{ fontWeight: 600 }}>₹{property.pricing?.maintenance?.toLocaleString()}/mo</span>
                </div>
              )}
            </div>
          </div>
          {availableRooms.length > 0 && (
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowBook(true)}>
              Book Now
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBook && (
        <div className="modal-overlay" onClick={() => setShowBook(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book a Room</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }} onClick={() => setShowBook(false)}>✕</button>
            </div>
            <form onSubmit={handleBook}>
              <div className="modal-body">
                {property.type === 'PG' && (
                  <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    🤝 <strong>Roommate matching is enabled</strong> for PG bookings. You'll be automatically matched with the most compatible roommate.
                  </div>
                )}
                <div className="form-group">
                  <label>Select Room</label>
                  <select className="form-control" required value={bookForm.roomNumber}
                    onChange={e => setBookForm(f => ({ ...f, roomNumber: e.target.value }))}>
                    <option value="">-- Choose a room --</option>
                    {availableRooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.type}) – ₹{r.price?.toLocaleString()}/mo
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input className="form-control" type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookForm.checkIn}
                    onChange={e => setBookForm(f => ({ ...f, checkIn: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBook(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={booking}>
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;