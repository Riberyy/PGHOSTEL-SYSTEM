// src/pages/student/MyPayments.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { paid:'badge-success', pending:'badge-warning', overdue:'badge-danger' };

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [payForm, setPayForm] = useState({ paymentMethod:'online', transactionId:'' });

  useEffect(() => {
    api.get('/payments/my').then(r => setPayments(r.data.payments)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handlePay = async e => {
    e.preventDefault();
    setPaying(showModal);
    try {
      const { data } = await api.put(`/payments/${showModal}/pay`, payForm);
      setPayments(p => p.map(x => x._id === showModal ? data.payment : x));
      toast.success('Payment recorded successfully!');
      setShowModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setPaying(null); }
  };

  const pending  = payments.filter(p => p.status !== 'paid');
  const paid     = payments.filter(p => p.status === 'paid');
  const totalDue = pending.reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header"><h1>Rent & Payments</h1><p>Track and manage your monthly rent payments</p></div>

      {pending.length > 0 && (
        <div style={{ background:'#fee2e2', border:'1px solid #fecaca', borderRadius:'var(--radius)', padding:'1rem 1.25rem', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
          <div>
            <p style={{ fontWeight:600, color:'#991b1b' }}>⚠️ Outstanding Amount</p>
            <p style={{ color:'#b91c1c', fontSize:'0.875rem' }}>{pending.length} payment(s) pending or overdue</p>
          </div>
          <p style={{ fontSize:'1.5rem', fontWeight:700, color:'#dc2626' }}>₹{totalDue.toLocaleString()}</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {payments.map(p => (
          <div className="card" key={p._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
                <span style={{ fontWeight:600 }}>₹{p.amount?.toLocaleString()}</span>
                <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                <span className="badge badge-gray">{p.type}</span>
              </div>
              <p className="text-muted" style={{ fontSize:'0.8rem' }}>{p.property?.name} • Room {p.booking?.roomNumber}</p>
              <p className="text-muted" style={{ fontSize:'0.8rem' }}>
                Due: {new Date(p.dueDate).toLocaleDateString('en-IN')}
                {p.paidAt && ` · Paid: ${new Date(p.paidAt).toLocaleDateString('en-IN')}`}
                {p.month && ` · Month: ${p.month}`}
              </p>
            </div>
            {p.status !== 'paid' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(p._id)}>Pay Now</button>
            )}
            {p.status === 'paid' && (
              <div style={{ textAlign:'right' }}>
                <p className="text-muted" style={{ fontSize:'0.75rem' }}>Txn: {p.transactionId}</p>
                <span className="badge badge-success">✓ Paid</span>
              </div>
            )}
          </div>
        ))}
        {payments.length === 0 && (
          <div className="empty-state"><div style={{fontSize:'3rem'}}>💰</div><h3>No payments yet</h3><p>Payments appear after you book a room</p></div>
        )}
      </div>

      {/* Pay Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button style={{ background:'none',border:'none',fontSize:'1.25rem',cursor:'pointer' }} onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={handlePay}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select className="form-control" value={payForm.paymentMethod} onChange={e => setPayForm(f => ({ ...f, paymentMethod:e.target.value }))}>
                    <option value="online">Online Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Transaction ID (optional)</label>
                  <input className="form-control" value={payForm.transactionId} onChange={e => setPayForm(f => ({ ...f, transactionId:e.target.value }))} placeholder="e.g. UTR123456789" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!!paying}>
                  {paying ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
