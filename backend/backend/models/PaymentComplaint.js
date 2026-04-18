const mongoose = require('mongoose');

// ─── Payment ─────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  amount:    { type: Number, required: true },
  type:      { type: String, enum: ['rent', 'deposit', 'maintenance'], required: true },
  month:     { type: String }, // "2024-01" format
  status:    { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  dueDate:   { type: Date, required: true },
  paidAt:    { type: Date },

  transactionId: { type: String },
  paymentMethod: { type: String, enum: ['online', 'cash', 'upi', 'bank_transfer'], default: 'online' },
  receipt:       { type: String },
  notes:         { type: String },
}, { timestamps: true });

paymentSchema.index({ student: 1, status: 1, dueDate: -1 });

// ─── Complaint ────────────────────────────────────────────────────────────────
const complaintSchema = new mongoose.Schema({
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title:    { type: String, required: true },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'furniture', 'cleanliness', 'security', 'wifi', 'other'],
    required: true,
  },
  description: { type: String, required: true },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  images:      [String],

  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  resolution: { type: String },
  resolvedAt: { type: Date },

  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

complaintSchema.index({ property: 1, status: 1 });

const Payment   = mongoose.model('Payment', paymentSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = { Payment, Complaint };
