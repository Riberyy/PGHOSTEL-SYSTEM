const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { raiseComplaint, getMyComplaints, getOwnerComplaints, updateComplaint, addComment } = require('../controllers/paymentComplaintController');

router.post('/',              protect, authorize('student'), raiseComplaint);
router.get('/my',             protect, authorize('student'), getMyComplaints);
router.get('/owner',          protect, authorize('owner'),   getOwnerComplaints);
router.put('/:id',            protect, authorize('owner'),   updateComplaint);
router.post('/:id/comment',   protect,                       addComment);

module.exports = router;
