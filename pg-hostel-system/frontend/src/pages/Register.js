// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'student',
    preferences: { sleepSchedule: 'flexible', foodPreference: 'any', lifestyle: 'balanced', gender: 'other' },
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPref = (k, v) => setForm(f => ({ ...f, preferences: { ...f.preferences, [k]: v } }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      if (user.role === 'owner') navigate('/owner');
      else navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-logo">🏠</div>
        <h1>Create account</h1>
        <p className="text-muted mb-2">Join the PG & Hostel Management System</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full name</label>
              <input className="form-control" required value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" required value={form.phone}
                onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input className="form-control" type="email" required value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" required value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label>Register as</label>
            <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="student">Student / Tenant</option>
              <option value="owner">Property Owner</option>
            </select>
          </div>

          {form.role === 'student' && (
            <>
              <p style={{ fontWeight: 600, marginBottom: '0.75rem', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                🤝 Roommate Matching Preferences
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>Sleep schedule</label>
                  <select className="form-control" value={form.preferences.sleepSchedule} onChange={e => setPref('sleepSchedule', e.target.value)}>
                    <option value="early_bird">Early bird</option>
                    <option value="night_owl">Night owl</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Food preference</label>
                  <select className="form-control" value={form.preferences.foodPreference} onChange={e => setPref('foodPreference', e.target.value)}>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non_vegetarian">Non-vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Lifestyle</label>
                  <select className="form-control" value={form.preferences.lifestyle} onChange={e => setPref('lifestyle', e.target.value)}>
                    <option value="studious">Studious</option>
                    <option value="social">Social</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-control" value={form.preferences.gender} onChange={e => setPref('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary btn-full btn-lg mt-2" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-muted mt-2" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
