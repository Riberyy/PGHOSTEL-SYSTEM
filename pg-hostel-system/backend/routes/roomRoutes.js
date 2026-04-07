const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Property = require('../models/Property');

// Add room to property
router.post('/:propertyId', protect, authorize('owner'), async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.propertyId, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    property.rooms.push(req.body);
    await property.save();
    res.status(201).json({ success: true, rooms: property.rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update room
router.put('/:propertyId/:roomNumber', protect, authorize('owner'), async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.propertyId, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    const room = property.rooms.find(r => r.roomNumber === req.params.roomNumber);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    Object.assign(room, req.body);
    await property.save();
    res.json({ success: true, rooms: property.rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete room
router.delete('/:propertyId/:roomNumber', protect, authorize('owner'), async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.propertyId, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    property.rooms = property.rooms.filter(r => r.roomNumber !== req.params.roomNumber);
    await property.save();
    res.json({ success: true, rooms: property.rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
