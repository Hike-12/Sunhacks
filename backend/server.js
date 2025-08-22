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
const interviewRoutes = require('./routes/interviewRoutes');
const videoRoutes = require('./routes/videoRoutes'); // NEW: Import the video route

// NEW: Import fs and path for file system operations
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", // Vite default port
    "http://localhost:4173", // Vite preview port
    "https://egurukul.vercel.app",
    "*",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};



// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));


// NEW: Create necessary directories for file uploads and video outputs
const uploadsDir = path.join(__dirname, 'uploads');
const outputsDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });


// NEW: Serve the generated videos statically
app.use('/outputs', express.static(outputsDir));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/diagram", diagramRoutes);
app.use("/api/chat", chatRoutes);
app.use('/interview',interviewRoutes);
app.use("/api/tools", pdfRoutes);
app.use("/api/video", videoRoutes); // NEW: Use the video route

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to StudyAid API" });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});