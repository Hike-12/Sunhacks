const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Achievement } = require('../models/Achievement');
const auth = require('../middleware/authMiddleware');

// GET /api/achievements
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await Achievement.find({ user: userId });

    res.json({
      success: true,
      achievements,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', error: err.message });
  }
});

module.exports = router;