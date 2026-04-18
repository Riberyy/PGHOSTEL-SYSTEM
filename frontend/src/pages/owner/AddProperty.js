// src/pages/owner/AddProperty.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AMENITIES_LIST = ['wifi','ac','parking','laundry','gym','kitchen','security','power_backup','mess','tv'];

const AddProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name:'', type:'PG', gender:'male', description:'',
    address:{ street:'', city:'', state:'', pincode:'' },
    amenities:[], rules:[''],
    pricing:{ deposit:'', maintenance:'0' },
    rooms:[{ roomNumber:'101', type:'single', capacity:1, price:'', floor:1, amenities:[] }],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address:{ ...f.address, [k]:v } }));
  const setPricing = (k, v) => setForm(f => ({ ...f, pricing:{ ...f.pricing, [k]:v } }));

  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const addRoom = () => setForm(f => ({
    ...f, rooms:[...f.rooms, { roomNumber:`${101+f.rooms.length}`, type:'single', capacity:1, price:'', floor:1, amenities:[] }]
  }));
  const setRoom = (i, k, v) => setForm(f => ({ ...f, rooms:f.rooms.map((r, idx) => idx === i ? { ...r, [k]:v } : r) }));
  const removeRoom = (i) => setForm(f => ({ ...f, rooms:f.rooms.filter((_, idx) => idx !== i) }));

  const setRule = (i, v) => setForm(f => ({ ...f, rules:f.rules.map((r, idx) => idx === i ? v : r) }));
  const addRule = () => setForm(f => ({ ...f, rules:[...f.rules, ''] }));
  const removeRule = (i) => setForm(f => ({ ...f, rules:f.rules.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    if (!form.name || !form.address.city || !form.pricing.deposit) return toast.error('Fill required fields');
    if (form.rooms.length === 0) return toast.error('Add at least one room');
    setSubmitting(true);
    try {
      const formData = new FormData();
      const data = { ...form, rules:form.rules.filter(r => r.trim()), pricing:{ ...form.pricing, deposit:Number(form.pricing.deposit), maintenance:Number(form.pricing.maintenance) }, rooms:form.rooms.map(r => ({ ...r, price:Number(r.price), capacity:Number(r.capacity) })) };
      formData.append('data', JSON.stringify(data));
      images.forEach(img => formData.append('images', img));

      await api.post('/properties', formData, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.success('Property submitted for admin approval!');
      navigate('/owner/properties');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add property'); }
    finally { setSubmitting(false); }
  };

  const steps = ['Basic Info', 'Address & Amenities', 'Rooms', 'Images & Rules'];

  return (
    <div>
      <div className="page-header"><h1>Add New Property</h1><p>Fill in the details to list your PG or Hostel</p></div>

      {/* Step indicator */}
      <div style={{ display:'flex', gap:'0', marginBottom:'2rem' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex:1, textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:i+1 <= step ? 'var(--primary)' : 'var(--border)', color:i+1 <= step ? '#fff' : 'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.875rem', margin:'0 auto', flexShrink:0 }}>{i+1}</div>
              {i < steps.length - 1 && <div style={{ flex:1, height:2, background:i+1 < step ? 'var(--primary)' : 'var(--border)' }}/>}
            </div>
            <p style={{ fontSize:'0.75rem', marginTop:'0.35rem', color:i+1 === step ? 'var(--primary)' : 'var(--text-muted)', fontWeight:i+1 === step ? 600 : 400 }}>{s}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <h3 style={{ marginBottom:'1.25rem' }}>Basic Information</h3>
            <div className="form-group"><label>Property Name *</label><input className="form-control" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Green Valley PG"/></div>
            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select className="form-control" value={form.type} onChange={e => set('type',e.target.value)}>
                  <option value="PG">PG (Paying Guest)</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender',e.target.value)}>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                  <option value="coed">Co-ed</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description *</label><textarea className="form-control" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your property, its highlights, nearby places..."/></div>
          </>
        )}

        {/* Step 2: Address + Amenities */}
        {step === 2 && (
          <>
            <h3 style={{ marginBottom:'1.25rem' }}>Address & Amenities</h3>
            <div className="form-group"><label>Street Address *</label><input className="form-control" value={form.address.street} onChange={e => setAddr('street',e.target.value)} placeholder="123, MG Road"/></div>
            <div className="form-row">
              <div className="form-group"><label>City *</label><input className="form-control" value={form.address.city} onChange={e => setAddr('city',e.target.value)} placeholder="Bangalore"/></div>
              <div className="form-group"><label>State *</label><input className="form-control" value={form.address.state} onChange={e => setAddr('state',e.target.value)} placeholder="Karnataka"/></div>
            </div>
            <div className="form-group"><label>Pincode</label><input className="form-control" value={form.address.pincode} onChange={e => setAddr('pincode',e.target.value)} placeholder="560001"/></div>
            <div className="form-row">
              <div className="form-group"><label>Security Deposit (₹) *</label><input className="form-control" type="number" value={form.pricing.deposit} onChange={e => setPricing('deposit',e.target.value)} placeholder="e.g. 10000"/></div>
              <div className="form-group"><label>Maintenance (₹/mo)</label><input className="form-control" type="number" value={form.pricing.maintenance} onChange={e => setPricing('maintenance',e.target.value)} placeholder="e.g. 500"/></div>
            </div>
            <div className="form-group">
              <label>Amenities</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.25rem' }}>
                {AMENITIES_LIST.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    style={{ padding:'0.35rem 0.85rem', borderRadius:999, border:`2px solid ${form.amenities.includes(a) ? 'var(--primary)' : 'var(--border)'}`, background:form.amenities.includes(a) ? 'var(--primary-light)' : 'transparent', color:form.amenities.includes(a) ? 'var(--primary)' : 'var(--text-muted)', cursor:'pointer', fontSize:'0.8rem', fontWeight:500, transition:'all 0.15s' }}>
                    {a.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Rooms */}
        {step === 3 && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3>Rooms</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addRoom}>+ Add Room</button>
            </div>
            {form.rooms.map((r, i) => (
              <div key={i} style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                  <p style={{ fontWeight:600 }}>Room {i+1}</p>
                  {form.rooms.length > 1 && <button type="button" onClick={() => removeRoom(i)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:'1rem' }}>✕</button>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px,1fr))', gap:'0.75rem' }}>
                  <div className="form-group" style={{margin:0}}>
                    <label>Room No.</label>
                    <input className="form-control" value={r.roomNumber} onChange={e => setRoom(i,'roomNumber',e.target.value)}/>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label>Type</label>
                    <select className="form-control" value={r.type} onChange={e => { setRoom(i,'type',e.target.value); setRoom(i,'capacity',e.target.value==='single'?1:e.target.value==='double'?2:3); }}>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                    </select>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label>Capacity</label>
                    <input className="form-control" type="number" min={1} max={4} value={r.capacity} onChange={e => setRoom(i,'capacity',e.target.value)}/>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label>Price/mo (₹)</label>
                    <input className="form-control" type="number" value={r.price} onChange={e => setRoom(i,'price',e.target.value)} placeholder="8000"/>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label>Floor</label>
                    <input className="form-control" type="number" min={0} value={r.floor} onChange={e => setRoom(i,'floor',e.target.value)}/>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Step 4: Images + Rules */}
        {step === 4 && (
          <>
            <h3 style={{ marginBottom:'1.25rem' }}>Images & House Rules</h3>
            <div className="form-group">
              <label>Property Images (up to 10)</label>
              <input type="file" multiple accept="image/*" className="form-control"
                onChange={e => setImages(Array.from(e.target.files).slice(0,10))} />
              {images.length > 0 && (
                <div className="img-grid" style={{ marginTop:'0.75rem' }}>
                  {images.map((img, i) => <img key={i} src={URL.createObjectURL(img)} alt={`preview-${i}`}/>)}
                </div>
              )}
            </div>
            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label>House Rules</label>
                <button type="button" onClick={addRule} className="btn btn-secondary btn-sm">+ Add Rule</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.35rem' }}>
                {form.rules.map((r, i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem' }}>
                    <input className="form-control" value={r} onChange={e => setRule(i, e.target.value)} placeholder={`Rule ${i+1}`}/>
                    {form.rules.length > 1 && <button type="button" onClick={() => removeRule(i)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', padding:'0 0.5rem' }}>✕</button>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s-1)} disabled={step===1}>← Back</button>
          {step < 4 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep(s => s+1)}>Next →</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit Property'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
