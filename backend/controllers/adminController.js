const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { Payment, Complaint } = require('../models/PaymentComplaint');

// @desc  Dashboard analytics
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalBookings, pendingProperties, totalRevenue, openComplaints] =
      await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        Property.countDocuments(),
        Booking.countDocuments(),
        Property.countDocuments({ status: 'pending' }),
        Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      ]);

    const recentBookings = await Booking.find()
      .populate('student', 'name email')
      .populate('property', 'name type')
      .sort({ createdAt: -1 })
      .limit(5);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$month', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        pendingProperties,
        totalRevenue: totalRevenue[0]?.total || 0,
        openComplaints,
      },
      recentBookings,
      monthlyRevenue: monthlyRevenue.reverse(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = { role: { $ne: 'admin' } };
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle user active status
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all properties (admin view)
const getAllProperties = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = status ? { status } : {};
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, properties, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Approve / reject property
const reviewProperty = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    ).populate('owner', 'name email');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: `Property ${status}`, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('student', 'name email')
      .populate('property', 'name type address')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all complaints (admin)
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('raisedBy', 'name email')
      .populate('property', 'name address')
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getAllUsers, toggleUser, getAllProperties, reviewProperty, getAllBookings, getAllComplaints };
