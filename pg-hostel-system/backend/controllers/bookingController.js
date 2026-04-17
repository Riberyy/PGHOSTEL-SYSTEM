const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { Payment } = require('../models/PaymentComplaint');
const { computeCompatibilityScore } = require('../utils/roommateMatch');
const { sendBookingConfirmation } = require('../utils/emailService');

// ─── Helper: find compatible roommate ────────────────────────────────────────
const findRoommate = async (property, room, currentStudent) => {
  // Find another confirmed booking in the same room (partial occupancy)
  const existingBooking = await Booking.findOne({
    property: property._id,
    roomNumber: room.roomNumber,
    status: 'confirmed',
    student: { $ne: currentStudent._id },
  }).populate('student', 'preferences');

  if (!existingBooking) return { roommate: null, matchScore: 0 };

  const score = computeCompatibilityScore(
    currentStudent.preferences || {},
    existingBooking.student.preferences || {}
  );

  return { roommate: existingBooking.student._id, matchScore: score };
};

// @desc  Create booking
// @route POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { propertyId, roomNumber, checkIn, checkOut, forceBook } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || property.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Property not found or not approved' });
    }

    const room = (property.rooms || []).find(r => r.roomNumber === roomNumber);
    if (!room || !room.isAvailable) {
      return res.status(400).json({ success: false, message: 'Room not available' });
    }

    // Check if student already has an active booking here
    const duplicate = await Booking.findOne({
      student: req.user._id,
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'You already have an active booking at this property' });
    }

    let roommate = null;
    let matchScore = 0;

    // Roommate matching – only for PG shared rooms
   if (property.type === 'PG' && room.type !== 'single') {
  const student = await User.findById(req.user._id);
  const match = await findRoommate(property, room, student);
  roommate = match.roommate;
  matchScore = match.matchScore;

  // ⬇️ NEW: if match < 45%, ask user to confirm before proceeding
  if (roommate && matchScore < 45 && !forceBook) {
    return res.status(200).json({
      success: false,
      requiresConfirmation: true,
      matchScore,
      message: `Roommate compatibility is only ${matchScore}%. Do you still want to continue?`,
    });
  }
}

    const booking = await Booking.create({
      student: req.user._id,
      property: propertyId,
      roomNumber,
      roomType: room.type,
      checkIn: new Date(checkIn),
      checkOut: checkOut ? new Date(checkOut) : null,
      rentAmount: room.price,
      depositAmount: property.pricing.deposit,
      roommate,
      matchScore,
      status: 'confirmed',
    });

    // Update room occupants (legacy docs may omit occupants array)
    if (!room.occupants) room.occupants = [];
    room.occupants.push(req.user._id);
    if (room.occupants.length >= room.capacity) room.isAvailable = false;
    await property.save();

  if (roommate) {
    await Booking.findOneAndUpdate(
    { property: propertyId, roomNumber, student: roommate, status: 'confirmed' },
    { roommate: req.user._id, matchScore },
    { new: true }
  );
}

    // Create first month payment record
    const dueDate = new Date(checkIn);
    dueDate.setDate(1);
    dueDate.setMonth(dueDate.getMonth() + 1);

    await Payment.create({
      booking: booking._id,
      student: req.user._id,
      property: propertyId,
      owner: property.owner,
      amount: room.price,
      type: 'rent',
      month: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`,
      dueDate,
    });

    try {
    const student = await User.findById(req.user._id);
    await sendBookingConfirmation(student, property, booking);
    } catch (emailErr) { console.error('Email error:', emailErr.message); }

    const populated = await booking.populate([
      { path: 'property', select: 'name address type' },
      { path: 'roommate', select: 'name email preferences' },
    ]);

     
   res.status(201).json({ success: true, message: 'Booking done successfully! 🎉', booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get student bookings
// @route GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate({ path: 'property', select: 'name address type images owner', options: { strictPopulate: false } })
      .populate({ path: 'roommate', select: 'name email avatar preferences', options: { strictPopulate: false } })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('getMyBookings error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: get bookings for their properties
// @route GET /api/bookings/owner
const getOwnerBookings = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).select('_id');
    const ids = properties.map(p => p._id);
    const bookings = await Booking.find({ property: { $in: ids } })
      .populate({ path: 'student', select: 'name email phone preferences', options: { strictPopulate: false } })
      .populate({ path: 'property', select: 'name address type', options: { strictPopulate: false } })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('getOwnerBookings error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cancel booking
// @route PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || '';
    booking.cancelledAt = new Date();
    await booking.save();

    // Free up the room
    const property = await Property.findById(booking.property);
    const room = (property?.rooms || []).find(r => r.roomNumber === booking.roomNumber);
    if (room) {
      room.occupants = (room.occupants || []).filter(o => !o.equals(req.user._id));
      room.isAvailable = true;
      await property.save();
    }

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('student', 'name email phone preferences')
      .populate('roommate', 'name email preferences avatar');
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getOwnerBookings, cancelBooking, getBooking };
