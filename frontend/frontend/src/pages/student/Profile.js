// src/pages/student/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferences: user?.preferences || { sleepSchedule:'flexible', foodPreference:'any', lifestyle:'balanced', gender:'other' },
  });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const setPref = (k, v) => setForm(f => ({ ...f, preferences:{ ...f.preferences, [k]:v } }));

  const handleProfile = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePw = async e => {
    e.preventDefault(); setSavingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div>
      <div className="page-header"><h1>My Profile</h1><p>Manage your personal information and preferences</p></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>
        {/* Personal Info */}
        <div className="card">
          <h3 style={{ marginBottom:'1.25rem' }}>Personal Information</h3>
          <form onSubmit={handleProfile}>
            <div style={{ width:64, height:64, background:'var(--primary-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', marginBottom:'1.25rem' }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="form-group"><label>Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} /></div>
            <div className="form-group"><label>Email</label>
              <input className="form-control" value={user?.email} disabled style={{background:'var(--bg)'}} /></div>
            <div className="form-group"><label>Phone</label>
              <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} /></div>

            <p style={{ fontWeight:600, marginBottom:'0.75rem', fontSize:'0.875rem' }}>🤝 Roommate Preferences</p>
            <div className="form-row">
              <div className="form-group">
                <label>Sleep Schedule</label>
                <select className="form-control" value={form.preferences.sleepSchedule} onChange={e => setPref('sleepSchedule',e.target.value)}>
                  <option value="early_bird">Early bird</option>
                  <option value="night_owl">Night owl</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Food Preference</label>
                <select className="form-control" value={form.preferences.foodPreference} onChange={e => setPref('foodPreference',e.target.value)}>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lifestyle</label>
                <select className="form-control" value={form.preferences.lifestyle} onChange={e => setPref('lifestyle',e.target.value)}>
                  <option value="studious">Studious</option>
                  <option value="social">Social</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="form-control" value={form.preferences.gender} onChange={e => setPref('gender',e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 style={{ marginBottom:'1.25rem' }}>Change Password</h3>
          <form onSubmit={handlePw}>
            <div className="form-group"><label>Current Password</label>
              <input className="form-control" type="password" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword:e.target.value }))} /></div>
            <div className="form-group"><label>New Password</label>
              <input className="form-control" type="password" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword:e.target.value }))} /></div>
            <button type="submit" className="btn btn-outline btn-full" disabled={savingPw}>{savingPw ? 'Changing...' : 'Change Password'}</button>
          </form>

          <div style={{ marginTop:'2rem', padding:'1rem', background:'var(--bg)', borderRadius:'var(--radius-sm)' }}>
            <p style={{ fontWeight:600, marginBottom:'0.5rem', fontSize:'0.875rem' }}>Account Info</p>
            <p className="text-muted" style={{ fontSize:'0.8rem' }}>Role: <strong>{user?.role}</strong></p>
            <p className="text-muted" style={{ fontSize:'0.8rem' }}>Member since: <strong>{new Date(user?.createdAt).toLocaleDateString('en-IN')}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
