const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber:  { type: String, required: true },
  type:        { type: String, enum: ['single', 'double', 'triple'], required: true },
  capacity:    { type: Number, required: true },
  occupants:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAvailable: { type: Boolean, default: true },
  price:       { type: Number, required: true },
  amenities:   [String],
  floor:       { type: Number, default: 1 },
});

const propertySchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  type:        { type: String, enum: ['PG', 'Hostel'], required: true },
  gender:      { type: String, enum: ['male', 'female', 'coed'], required: true },
  description: { type: String, required: true },

  address: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },

  images: [{ url: String, publicId: String }],

  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'parking', 'laundry', 'gym', 'kitchen', 'security', 'power_backup', 'mess', 'tv'],
  }],

  rules: [String],
  nearbyPlaces: [{ name: String, distance: String }],

  rooms: [roomSchema],

  pricing: {
    minRent: { type: Number },
    maxRent: { type: Number },
    deposit:    { type: Number, required: true },
    maintenance: { type: Number, default: 0 },
  },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-compute min/max rent from rooms
propertySchema.pre('save', function (next) {
  if (this.rooms && this.rooms.length > 0) {
    const prices = this.rooms.map(r => r.price);
    this.pricing.minRent = Math.min(...prices);
    this.pricing.maxRent = Math.max(...prices);
  }
  next();
});

// Virtual: available rooms count (guard: rooms may be omitted when property is populated with .select())
propertySchema.virtual('availableRooms').get(function () {
  return (this.rooms || []).filter(r => r.isAvailable).length;
});

propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

propertySchema.index({ 'address.city': 1, status: 1, type: 1 });

module.exports = mongoose.model('Property', propertySchema);
