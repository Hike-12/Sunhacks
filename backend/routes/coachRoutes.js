const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const auth = require('../middleware/authMiddleware');

// Protect all routes
router.use(auth);

// @route   POST api/coach
// @desc    Get doubt solving advice
// @access  Private
router.post('/', coachController.getDoubtSolution);

module.exports = router;