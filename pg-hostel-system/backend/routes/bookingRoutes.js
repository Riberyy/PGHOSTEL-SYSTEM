// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, getOwnerBookings, cancelBooking, getBooking } = require('../controllers/bookingController');

router.post('/',          protect, createBooking);
router.get('/my',         protect, getMyBookings);
router.get('/owner',      protect, authorize('owner'), getOwnerBookings);
router.get('/:id',        protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;