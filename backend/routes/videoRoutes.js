const express = require("express");
const {
  createTopicVideo,
  deleteVideoFile,
} = require("../controllers/videoController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-topic-video", authMiddleware, createTopicVideo);
router.delete("/delete-video", authMiddleware, deleteVideoFile); // NEW

module.exports = router;
