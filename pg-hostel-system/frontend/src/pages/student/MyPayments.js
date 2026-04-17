import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { paid:'badge-success', pending:'badge-warning', overdue:'badge-danger' };

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [payForm, setPayForm] = useState({ paymentMethod:'upi', transactionId:'', upiId:'', cardNumber:'', cvv:'', expiry:'', bankDetails:'' });

  useEffect(() => {
    api.get('/payments/my').then(r => setPayments(r.data.payments)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handlePay = async e => {
    e.preventDefault();
    setPaying(showModal);
    try {
      const txnId = payForm.transactionId || payForm.upiId || `TXN${Date.now()}`;
      const { data } = await api.put(`/payments/${showModal}/pay`, { ...payForm, transactionId: txnId });
      setPayments(p => p.map(x => x._id === showModal ? data.payment : x));
      toast.success('✅ Payment recorded successfully! Confirmation email sent.');
      setShowModal(null);
      setPayForm({ paymentMethod:'upi', transactionId:'', upiId:'', cardNumber:'', cvv:'', expiry:'', bankDetails:'' });
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

      {pending.length === 0 && payments.length > 0 && (
        <div style={{ background:'#d1fae5', border:'1px solid #6ee7b7', borderRadius:'var(--radius)', padding:'1rem 1.25rem', marginBottom:'1.5rem' }}>
          <p style={{ fontWeight:600, color:'#065f46' }}>✅ All payments are up to date!</p>
          <p style={{ color:'#047857', fontSize:'0.875rem' }}>Next payment reminder will be sent on 1st of next month.</p>
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
            {p.status !== 'paid' ? (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(p._id)}>Pay Now</button>
            ) : (
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

      {/* Enhanced Pay Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💳 Make Payment</h3>
              <button style={{ background:'none',border:'none',fontSize:'1.25rem',cursor:'pointer' }} onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={handlePay}>
              <div className="modal-body">
                <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,padding:'0.75rem',marginBottom:'1rem'}}>
                  <p style={{fontWeight:600,color:'#065f46',margin:0}}>Amount: ₹{payments.find(p=>p._id===showModal)?.amount?.toLocaleString()}</p>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginTop:'0.35rem'}}>
                    {['upi','card','bank_transfer'].map(m => (
                      <button key={m} type="button" onClick={() => setPayForm(f=>({...f,paymentMethod:m}))}
                        style={{padding:'0.6rem',borderRadius:8,border:`2px solid ${payForm.paymentMethod===m?'var(--primary)':'var(--border)'}`,background:payForm.paymentMethod===m?'var(--primary-light)':'transparent',cursor:'pointer',fontWeight:500,fontSize:'0.8rem',color:payForm.paymentMethod===m?'var(--primary)':'var(--text-muted)'}}>
                        {m==='upi'?'📱 UPI':m==='card'?'💳 Card':'🏦 Bank'}
                      </button>
                    ))}
                  </div>
                </div>

                {payForm.paymentMethod === 'upi' && (
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input className="form-control" value={payForm.upiId} onChange={e=>setPayForm(f=>({...f,upiId:e.target.value}))} placeholder="yourname@upi" required/>
                    <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.25rem'}}>Enter your UPI ID used for payment</p>
                  </div>
                )}

                {payForm.paymentMethod === 'card' && (
                  <>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input className="form-control" value={payForm.cardNumber} onChange={e=>setPayForm(f=>({...f,cardNumber:e.target.value}))} placeholder="1234 5678 9012 3456" maxLength={19} required/>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input className="form-control" value={payForm.expiry} onChange={e=>setPayForm(f=>({...f,expiry:e.target.value}))} placeholder="MM/YY" maxLength={5} required/>
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input className="form-control" type="password" value={payForm.cvv} onChange={e=>setPayForm(f=>({...f,cvv:e.target.value}))} placeholder="***" maxLength={3} required/>
                      </div>
                    </div>
                  </>
                )}

                {payForm.paymentMethod === 'bank_transfer' && (
                  <div className="form-group">
                    <label>Transaction / UTR Number</label>
                    <input className="form-control" value={payForm.transactionId} onChange={e=>setPayForm(f=>({...f,transactionId:e.target.value}))} placeholder="Enter UTR/Transaction ID" required/>
                    <div style={{background:'#f1f5f9',borderRadius:8,padding:'0.75rem',marginTop:'0.5rem',fontSize:'0.8rem'}}>
                      <p style={{fontWeight:600,marginBottom:'0.25rem'}}>Bank Transfer Details:</p>
                      <p style={{color:'var(--text-muted)',margin:0}}>Account: 1234567890 | IFSC: HDFC0001234 | Name: PG System</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!!paying}>
                  {paying ? 'Processing...' : '✅ Confirm Payment'}
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
