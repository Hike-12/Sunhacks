const express = require('express');
const router = express.Router();

// Example route (you can add your real achievement routes here)
router.get('/', (req, res) => {
  res.json({ message: 'Achievements route working!' });
});

module.exports = router;