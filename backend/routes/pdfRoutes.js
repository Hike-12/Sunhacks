const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // keeps file in memory buffer
const pdfController = require("../controllers/pdfController");

router.post("/parse-pdf", upload.single("file"), pdfController.parsePdf);

module.exports = router;
