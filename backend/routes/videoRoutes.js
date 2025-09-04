const express = require("express");
const {
  createTopicVideo,
  createTopicVideoWithProgress,
  deleteVideoFile,
} = require("../controllers/videoController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-topic-video", authMiddleware, createTopicVideo);
router.post(
  "/create-topic-video-progress",
  authMiddleware,
  createTopicVideoWithProgress
); // NEW
router.delete("/delete-video", authMiddleware, deleteVideoFile);

module.exports = router;
