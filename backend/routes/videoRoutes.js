const express = require("express");
const { createTopicVideo } = require("../controllers/videoController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-topic-video", authMiddleware, createTopicVideo);

module.exports = router;
