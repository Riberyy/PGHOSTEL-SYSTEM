// src/pages/owner/EditProperty.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    api.get(`/properties/${id}`).then(r => {
      const p = r.data.property;
      setForm({ name:p.name, description:p.description, gender:p.gender, amenities:p.amenities||[], rules:p.rules?.length?p.rules:[''], address:p.address, pricing:{ deposit:p.pricing?.deposit||'', maintenance:p.pricing?.maintenance||'0' } });
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/properties/${id}`, { data: JSON.stringify({ ...form, pricing:{ deposit:Number(form.pricing.deposit), maintenance:Number(form.pricing.maintenance) } }) });
      toast.success('Property updated!');
      navigate('/owner/properties');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading || !form) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address:{ ...f.address, [k]:v } }));
  const setPricing = (k, v) => setForm(f => ({ ...f, pricing:{ ...f.pricing, [k]:v } }));
  const toggleAmenity = a => setForm(f => ({ ...f, amenities:f.amenities.includes(a)?f.amenities.filter(x=>x!==a):[...f.amenities,a] }));
  const AMENITIES_LIST = ['wifi','ac','parking','laundry','gym','kitchen','security','power_backup','mess','tv'];

  return (
    <div>
      <div className="page-header"><h1>Edit Property</h1><p>Update your property details</p></div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Property Name</label><input className="form-control" value={form.name} onChange={e => set('name',e.target.value)}/></div>
          <div className="form-row">
            <div className="form-group"><label>Gender</label>
              <select className="form-control" value={form.gender} onChange={e => set('gender',e.target.value)}>
                <option value="male">Male</option><option value="female">Female</option><option value="coed">Co-ed</option>
              </select>
            </div>
            <div className="form-group"><label>Security Deposit (₹)</label><input className="form-control" type="number" value={form.pricing.deposit} onChange={e => setPricing('deposit',e.target.value)}/></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" rows={4} value={form.description} onChange={e => set('description',e.target.value)}/></div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input className="form-control" value={form.address.city} onChange={e => setAddr('city',e.target.value)}/></div>
            <div className="form-group"><label>State</label><input className="form-control" value={form.address.state} onChange={e => setAddr('state',e.target.value)}/></div>
          </div>
          <div className="form-group">
            <label>Amenities</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.25rem' }}>
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  style={{ padding:'0.35rem 0.85rem', borderRadius:999, border:`2px solid ${form.amenities.includes(a)?'var(--primary)':'var(--border)'}`, background:form.amenities.includes(a)?'var(--primary-light)':'transparent', color:form.amenities.includes(a)?'var(--primary)':'var(--text-muted)', cursor:'pointer', fontSize:'0.8rem', fontWeight:500 }}>
                  {a.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
