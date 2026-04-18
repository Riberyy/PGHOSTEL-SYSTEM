// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '🔍', title: 'Smart Search', desc: 'Search PGs and hostels by location, price, and amenities with advanced filters.' },
    { icon: '🤝', title: 'Roommate Matching', desc: 'AI-powered compatibility matching based on lifestyle, sleep schedule and food preferences.' },
    { icon: '💰', title: 'Easy Payments', desc: 'Track and pay monthly rent online via UPI, card or bank transfer.' },
    { icon: '🔧', title: 'Complaint System', desc: 'Raise and track maintenance complaints directly with your property owner.' },
    { icon: '📧', title: 'Email Alerts', desc: 'Automatic reminders for rent due dates, booking confirmations and payment receipts.' },
    { icon: '🏠', title: 'Property Management', desc: 'Owners can manage multiple properties, rooms, bookings and tenant payments.' },
  ];

  const steps = [
    { num: '01', title: 'Register', desc: 'Create your account as student or property owner' },
    { num: '02', title: 'Search', desc: 'Browse approved PG and hostel listings in your city' },
    { num: '03', title: 'Book', desc: 'Book your room and get matched with a compatible roommate' },
    { num: '04', title: 'Manage', desc: 'Pay rent, raise complaints and manage everything online' },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: '#1e293b', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏠</span>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: scrolled ? '#4f46e5' : '#fff' }}>PG System</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{
            color: scrolled ? '#4f46e5' : '#fff',
            textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem',
          }}>Login</Link>
          <Link to="/register" style={{
            background: scrolled ? '#4f46e5' : 'rgba(255,255,255,0.2)',
            color: '#fff', textDecoration: 'none', fontWeight: 600,
            padding: '0.5rem 1.25rem', borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 50%, #10b981 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '6rem 2rem 4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background circles */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', transform: 'translate(-50%,-50%)' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '999px', padding: '0.4rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#fff', fontWeight: 500 }}>
            🏠 Smart PG & Hostel Management
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Find Your Perfect<br/>
            <span style={{ color: '#fef3c7' }}>PG or Hostel</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
            A smart platform for students to find accommodations and owners to manage properties — with AI-powered roommate matching.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#fff', color: '#4f46e5', textDecoration: 'none',
              fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '12px',
              fontSize: '1rem', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}>🎓 I'm a Student</Link>
            <Link to="/register" style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none',
              fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '12px',
              fontSize: '1rem', border: '2px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(10px)',
            }}>🏢 I'm an Owner</Link>
          </div>

          {/* Stats 
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
            {[['3 Roles', 'Student, Owner, Admin'], ['Smart Match', 'Roommate AI'], ['Real-time', 'Rent Tracking']].map(([val, label]) => (
              <div key={val} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>{val}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{label}</p>
              </div> 
            ))}
          </div> */}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Everything You Need</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>A complete system for students, owners and administrators</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: '16px', padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
            
      {/* How it works */}
      <div style={{ padding: '5rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Get started in 4 simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: 800, color: '#fff',
                }}>{s.num}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unique Feature - Roommate Matching */}
      <div style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #ede9fe, #dbeafe)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: '#4f46e5', color: '#fff', borderRadius: '999px', padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>✨ Unique Feature</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>AI Roommate Matching</h2>
            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>Our smart algorithm matches you with the most compatible roommate based on your lifestyle preferences — not just random assignment.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[['😴 Sleep Schedule', '40 points'], ['🍽️ Food Preference', '30 points'], ['🎯 Lifestyle', '30 points']].map(([label, pts]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <span style={{ color: '#4f46e5', fontWeight: 700 }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 20px 60px rgba(79,70,229,0.15)' }}>
            <p style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem' }}>🤝 Compatibility Score</p>
            {[['You', 85], ['Alex', 78], ['Sam', 45]].map(([name, score]) => (
              <div key={name} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{name}</span>
                  <span style={{ fontSize: '0.875rem', color: score >= 45 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{score}%</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: '999px', height: 8 }}>
                  <div style={{ width: `${score}%`, height: '100%', borderRadius: '999px', background: score >= 45 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : '#ef4444', transition: 'width 1s ease' }}/>
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>✅ Match ≥45%: Auto-assigned | ⚠️ Below 45%: Confirmation required</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Ready to Get Started?</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Join thousands of students and property owners on our platform</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem' }}>Create Account</Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>Sign In</Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0f172a', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>© 2026 Smart PG & Hostel Management System. Built with MERN Stack.</p>
      </div>
    </div>
  );
};

export default LandingPage;
