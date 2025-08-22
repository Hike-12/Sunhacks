const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");
const gTTS = require("gtts");
const ffmpeg = require("fluent-ffmpeg");
const geminiService = require("../services/geminiService");

// ensure font available (system fallback OK)
const FONT_FAMILY = "Arial";

const outputsDir = path.join(__dirname, "../outputs");
if (!fsSync.existsSync(outputsDir))
  fsSync.mkdirSync(outputsDir, { recursive: true });

// create a single slide image (no gradients, neutral background)
async function renderSlideImage(text, index) {
  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // neutral backgrounds palette (no gradients)
  const BG_COLORS = ["#0b1220", "#0f1724", "#111827", "#0b1220"];
  const bg = BG_COLORS[index % BG_COLORS.length];

  // background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // title box top
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, width, 120);

  // Title text
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 38px ${FONT_FAMILY}`;
  ctx.textAlign = "left";
  ctx.fillText(text.title || "Slide", 36, 72);

  // Body text
  const body = text.content || "";
  ctx.fillStyle = "#e5e7eb";
  ctx.font = `26px ${FONT_FAMILY}`;
  ctx.textAlign = "left";

  // wrap text
  const maxWidth = width - 72;
  const words = body.split(" ");
  let line = "";
  let y = 160;
  const lineHeight = 34;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), 36, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trim(), 36, y);

  // small footer / credit
  ctx.fillStyle = "#9ca3af";
  ctx.font = `16px ${FONT_FAMILY}`;
  ctx.textAlign = "right";
  ctx.fillText("StudyAid • AI Slide", width - 24, height - 20);

  const filename = `slide_${index}_${Date.now()}.png`;
  const filepath = path.join(outputsDir, filename);
  const buffer = canvas.toBuffer("image/png");
  await fs.writeFile(filepath, buffer);
  return filepath;
}

function generateTTS(text, index) {
  return new Promise((resolve, reject) => {
    const filename = `slide_audio_${index}_${Date.now()}.mp3`;
    const filepath = path.join(outputsDir, filename);
    const speech = new gTTS(text, "en");
    speech.save(filepath, (err) => {
      if (err) return reject(err);
      resolve(filepath);
    });
  });
}

function createSlideVideo(imagePath, audioPath, durationSec, index) {
  return new Promise((resolve, reject) => {
    const outFile = path.join(
      outputsDir,
      `slide_video_${index}_${Date.now()}.mp4`
    );
    ffmpeg()
      .addInput(imagePath)
      .loop(durationSec)
      .addInput(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-c:a aac",
        "-pix_fmt yuv420p",
        "-shortest",
        "-vf scale=1280:720",
      ])
      .on("end", () => resolve(outFile))
      .on("error", (err) => reject(err))
      .save(outFile);
  });
}

async function concatVideos(videoPaths, finalPath) {
  // write list file
  const listPath = path.join(outputsDir, `concat_list_${Date.now()}.txt`);
  const lines = videoPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
  await fs.writeFile(listPath, lines);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .on("end", () => resolve(finalPath))
      .on("error", (err) => reject(err))
      .save(finalPath);
  });
}

const createTopicVideo = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Topic is required" });
    }

    // get slides description (titles/content/prompts) from geminiService
    const slidesMeta = await geminiService.generateSlidesForTopic(
      String(topic).trim()
    );
    if (!Array.isArray(slidesMeta) || slidesMeta.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate slides" });
    }

    const slideVideos = [];
    for (let i = 0; i < slidesMeta.length; i++) {
      const meta = slidesMeta[i];
      // render image locally from meta (no external API)
      const imagePath = await renderSlideImage(meta, i);
      // get narration
      const audioPath = await generateTTS(meta.content || `${meta.title}`);
      // create per-slide video (duration 6-8s)
      const durationSec = meta.duration || 7;
      const slideVideoPath = await createSlideVideo(
        imagePath,
        audioPath,
        durationSec,
        i
      );
      slideVideos.push(slideVideoPath);
    }

    // concat videos
    const finalFilename = `${topic.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}.mp4`;
    const finalPath = path.join(outputsDir, finalFilename);
    await concatVideos(slideVideos, finalPath);

    // CLEANUP: remove all files in outputs except the final video
    try {
      const files = await fs.readdir(outputsDir);
      for (const f of files) {
        const full = path.join(outputsDir, f);
        // keep only the final file
        if (full === finalPath) continue;
        try {
          await fs.unlink(full).catch(() => {});
        } catch (e) {
          // ignore per-file removal errors
        }
      }
    } catch (cleanupErr) {
      // log cleanup error but continue to respond success if video created
      console.error("Outputs cleanup error:", cleanupErr);
    }

    return res.json({
      success: true,
      videoUrl: `/outputs/${finalFilename}`,
      slides: slidesMeta.length,
      message: "Video created",
    });
  } catch (err) {
    console.error("createTopicVideo error:", err);
    return res.status(500).json({
      success: false,
      message: "Video generation failed",
      error: String(err),
    });
  }
};

module.exports = {
  createTopicVideo,
};
