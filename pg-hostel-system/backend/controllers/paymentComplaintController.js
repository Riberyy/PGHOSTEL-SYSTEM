const { Payment, Complaint } = require('../models/PaymentComplaint');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendPaymentConfirmation, sendRentReminder, sendManualWarning } = require('../utils/emailService');

// ═══════════════ PAYMENT CONTROLLERS ═══════════════════════════════════════

// @desc  Get student payments
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate({ path: 'property', select: 'name address', options: { strictPopulate: false } })
      .populate({ path: 'booking', select: 'roomNumber', options: { strictPopulate: false } })
      .sort({ dueDate: -1 })
      .lean();
    res.json({ success: true, payments });
  } catch (err) {
    console.error('getMyPayments error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Pay rent
const payRent = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, student: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'paid') return res.status(400).json({ success: false, message: 'Already paid' });

    payment.status = 'paid';
    payment.paidAt = new Date();
    payment.transactionId = req.body.transactionId || `TXN${Date.now()}`;
    payment.paymentMethod = req.body.paymentMethod || 'online';
    payment.notes = req.body.notes || '';
    await payment.save();

    // Generate next month payment record
    const nextDue = new Date(payment.dueDate);
    nextDue.setMonth(nextDue.getMonth() + 1);
    const monthStr = `${nextDue.getFullYear()}-${String(nextDue.getMonth() + 1).padStart(2, '0')}`;

    const exists = await Payment.findOne({ booking: payment.booking, month: monthStr });
    if (!exists) {
      await Payment.create({
        booking: payment.booking,
        student: payment.student,
        property: payment.property,
        owner: payment.owner,
        amount: payment.amount,
        type: 'rent',
        month: monthStr,
        dueDate: nextDue,
      });
    }
    // Send payment confirmation email
    try {
    const student = await User.findById(payment.student);
    const property = await Property.findById(payment.property);
    await sendPaymentConfirmation(student, payment, property);
    } catch (emailErr) { console.error('Email error:', emailErr.message); }

res.json({ success: true, message: 'Payment recorded successfully! ✅', payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: get all payments for their properties
const getOwnerPayments = async (req, res) => {
  try {
    const props = await Property.find({ owner: req.user._id }).select('_id');
    const ids = props.map(p => p._id);
    const payments = await Payment.find({ property: { $in: ids } })
      .populate({ path: 'student', select: 'name email phone', options: { strictPopulate: false } })
      .populate({ path: 'property', select: 'name', options: { strictPopulate: false } })
      .populate({ path: 'booking', select: 'roomNumber', options: { strictPopulate: false } })
      .sort({ dueDate: -1 })
      .lean();
    res.json({ success: true, payments });
  } catch (err) {
    console.error('getOwnerPayments error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send manual warning email
const sendWarningEmail = async (req, res) => {
  try {
    const { studentId, propertyId, message } = req.body;
    const student = await User.findById(studentId);
    const property = await Property.findById(propertyId);
    if (!student || !property) return res.status(404).json({ success: false, message: 'Student or property not found' });
    await sendManualWarning(student.email, student.name, property.name, message);
    res.json({ success: true, message: 'Warning email sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ COMPLAINT CONTROLLERS ══════════════════════════════════════

// @desc  Raise a complaint
const raiseComplaint = async (req, res) => {
  try {
    const { propertyId, bookingId, title, category, description, priority } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const complaint = await Complaint.create({
      raisedBy: req.user._id,
      property: propertyId,
      booking: bookingId,
      owner: property.owner,
      title,
      category,
      description,
      priority: priority || 'medium',
    });

    res.status(201).json({ success: true, message: 'Complaint submitted', complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my complaints (student)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ raisedBy: req.user._id })
      .populate({ path: 'property', select: 'name address', options: { strictPopulate: false } })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, complaints });
  } catch (err) {
    console.error('getMyComplaints error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: get complaints for their properties
const getOwnerComplaints = async (req, res) => {
  try {
    const props = await Property.find({ owner: req.user._id }).select('_id');
    const ids = props.map(p => p._id);
    const complaints = await Complaint.find({ property: { $in: ids } })
      .populate({ path: 'raisedBy', select: 'name email phone', options: { strictPopulate: false } })
      .populate({ path: 'property', select: 'name address', options: { strictPopulate: false } })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, complaints });
  } catch (err) {
    console.error('getOwnerComplaints error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update complaint status (owner)
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, owner: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });

    const { status, resolution, comment } = req.body;
    if (status) complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    if (comment) complaint.comments.push({ user: req.user._id, text: comment });

    await complaint.save();
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Add comment to complaint
const addComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });

    complaint.comments.push({ user: req.user._id, text: req.body.comment });
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyPayments, payRent, getOwnerPayments, sendWarningEmail, raiseComplaint, getMyComplaints, getOwnerComplaints, updateComplaint, addComment };
