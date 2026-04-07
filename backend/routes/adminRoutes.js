const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboard, getAllUsers, toggleUser, getAllProperties, reviewProperty, getAllBookings, getAllComplaints } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard',              getDashboard);
router.get('/users',                  getAllUsers);
router.put('/users/:id/toggle',       toggleUser);
router.get('/properties',             getAllProperties);
router.put('/properties/:id/review',  reviewProperty);
router.get('/bookings',               getAllBookings);
router.get('/complaints',             getAllComplaints);

module.exports = router;
