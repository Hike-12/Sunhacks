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
const videoRoutes = require('./routes/videoRoutes'); 
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // for HuggingFace API calls
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
    "https://egurukul.vercel.app",
    "*",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directories
const uploadsDir = path.join(__dirname, "uploads");
const outputsDir = path.join(__dirname, "outputs");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

// Serve generated videos + images
app.use("/outputs", express.static(outputsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/diagram", diagramRoutes);
app.use("/api/chat", chatRoutes);
app.use("/interview", interviewRoutes);
app.use("/api/tools", pdfRoutes);
app.use("/api/video", videoRoutes);

// ✅ NEW: Hugging Face Stable Diffusion v1.5 endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios({
      method: "post",
      url: "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: { inputs: prompt },
      responseType: "arraybuffer",
    });

    const filename = `image_${Date.now()}.png`;
    const filePath = path.join(outputsDir, filename);

    fs.writeFileSync(filePath, response.data);

    res.json({ 
      success: true, 
      imageUrl: `/outputs/${filename}` 
    });
  } catch (err) {
    console.error("Image generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

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
