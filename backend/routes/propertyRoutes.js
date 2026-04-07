const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, getOwnerProperties, deletePropertyImage
} = require('../controllers/propertyController');

router.get('/',               getProperties);
router.get('/owner/mine',     protect, authorize('owner'), getOwnerProperties);
router.get('/:id',            getProperty);
router.post('/',              protect, authorize('owner'), upload.array('images', 10), createProperty);
router.put('/:id',            protect, authorize('owner'), upload.array('images', 10), updateProperty);
router.delete('/:id',         protect, authorize('owner'), deleteProperty);
router.delete('/:id/image/:publicId', protect, authorize('owner'), deletePropertyImage);

module.exports = router;
