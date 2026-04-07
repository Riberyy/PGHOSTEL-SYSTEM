// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏠</div>
        <h1>Welcome back</h1>
        <p className="text-muted mb-2">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input className="form-control" type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-full btn-lg mt-2" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-muted mt-2" style={{ textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Register</Link>
        </p>
        {/* <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
          <strong>Demo credentials:</strong><br />
          Admin: admin@pg.com / admin123<br />
          Owner: owner@pg.com / owner123<br />
          Student: student@pg.com / student123
        </div> */}
      </div>
    </div>
  );
};

export default Login;
