// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Property = require('../models/Property');

// Toggle wishlist
router.post('/:propertyId', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.propertyId;
    const idx = user.wishlist.indexOf(pid);
    if (idx === -1) user.wishlist.push(pid);
    else user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get wishlist
router.get('/', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      match: { status: 'approved', isActive: true },
      populate: { path: 'owner', select: 'name phone' },
    });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
