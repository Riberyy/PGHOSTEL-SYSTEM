const Property = require('../models/Property');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get all approved properties (with search/filter)
// @route GET /api/properties
const getProperties = async (req, res) => {
  try {
    const { city, type, gender, minRent, maxRent, amenities, page = 1, limit = 12 } = req.query;

    const query = { status: 'approved', isActive: true };
    if (city)    query['address.city'] = { $regex: city, $options: 'i' };
    if (type)    query.type = type;
    if (gender)  query.gender = { $in: [gender, 'coed'] };
    if (minRent) query['pricing.maxRent'] = { $gte: Number(minRent) };
    if (maxRent) query['pricing.minRent'] = { $lte: Number(maxRent) };
    if (amenities) {
      query.amenities = { $all: amenities.split(',') };
    }

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('owner', 'name phone email')
      .select('-rooms.occupants')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: total, properties, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single property
// @route GET /api/properties/:id
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name phone email avatar');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: create property
// @route POST /api/properties
const createProperty = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    const images = (req.files || []).map(f => ({ url: f.path, publicId: f.filename }));

    const property = await Property.create({ ...data, owner: req.user._id, images, status: 'pending' });
    res.status(201).json({ success: true, message: 'Property submitted for approval', property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: update property
// @route PUT /api/properties/:id
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found or not yours' });

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({ url: f.path, publicId: f.filename }));
      data.images = [...(property.images || []), ...newImages];
    }

    Object.assign(property, data);
    await property.save();
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: delete property
// @route DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });

    // Remove images from cloudinary
    for (const img of property.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Owner: get own properties
// @route GET /api/properties/owner/mine
const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete image from property
// @route DELETE /api/properties/:id/image/:publicId
const deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });

    await cloudinary.uploader.destroy(req.params.publicId);
    property.images = property.images.filter(i => i.publicId !== req.params.publicId);
    await property.save();
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProperties, getProperty, createProperty, updateProperty, deleteProperty, getOwnerProperties, deletePropertyImage };
