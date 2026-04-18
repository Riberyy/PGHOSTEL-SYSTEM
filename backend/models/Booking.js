const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  roomNumber: { type: String, required: true },
  roomType:   { type: String, enum: ['single', 'double', 'triple'], required: true },
  roommate:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  checkIn:  { type: Date, required: true },
  checkOut: { type: Date },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },

  rentAmount:  { type: Number, required: true },
  depositPaid: { type: Boolean, default: false },
  depositAmount: { type: Number },

  matchScore: { type: Number, default: 0 }, // Roommate compatibility score

  cancellationReason: { type: String },
  cancelledAt: { type: Date },
}, { timestamps: true });

bookingSchema.index({ student: 1, status: 1 });
bookingSchema.index({ property: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
