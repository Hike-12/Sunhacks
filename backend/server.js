require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const diagramRoutes = require("./routes/diagramRoutes");
const chatRoutes = require("./routes/chatRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const videoRoutes = require("./routes/videoRoutes");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // for HuggingFace API calls
const FormData = require("form-data");
const teacherAnalyticsRoutes = require('./routes/teacherAnalyticsRoutes');
const coachRoutes = require('./routes/coachRoutes');  

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    "https://studyaid-sunhacks.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directories (ensure exist)
const uploadsDir = path.join(__dirname, "uploads");
const outputsDir = path.join(__dirname, "outputs");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

// Serve generated videos + images
app.use("/outputs", express.static(outputsDir));
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/diagram", diagramRoutes);
app.use("/api/chat", chatRoutes);
app.use("/interview", interviewRoutes);
app.use("/api/video", videoRoutes); // mount video routes
app.use("/api/tools", pdfRoutes);
app.use('/api/teacher', teacherAnalyticsRoutes);
app.use('/api/coach', coachRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to StudyAid API" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
