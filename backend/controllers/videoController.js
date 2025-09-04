const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");
const gTTS = require("gtts");
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const axios = require("axios");
const { getImageForKeyword } = require("../services/unsplashService");

// ensure font available (system fallback OK)
const FONT_FAMILY = "Arial";

const outputsDir = path.join(__dirname, "../outputs");
if (!fsSync.existsSync(outputsDir))
  fsSync.mkdirSync(outputsDir, { recursive: true });

// create a single slide image (no gradients, clean black/white palette)
// now accepts optional bgImageUrl to use as slide background (fetched from Unsplash)
async function renderSlideImage(text, index, bgImageUrl = null) {
  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Attempt to draw background image if provided
  let drewBgImage = false;
  if (bgImageUrl) {
    try {
      const resp = await axios.get(bgImageUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
      });
      const buffer = Buffer.from(resp.data, "binary");
      const img = await loadImage(buffer);
      // cover the canvas (cover behavior)
      const ratio = Math.max(width / img.width, height / img.height);
      const iw = img.width * ratio;
      const ih = img.height * ratio;
      const ix = (width - iw) / 2;
      const iy = (height - ih) / 2;
      ctx.drawImage(img, ix, iy, iw, ih);
      drewBgImage = true;
    } catch (e) {
      console.warn(
        "Failed to load background image, falling back to solid bg:",
        e.message || e
      );
      drewBgImage = false;
    }
  }

  // clean black/white palette fallback if no image
  const BG_COLORS = ["#ffffff", "#0b0b0b"];
  const bg = drewBgImage ? null : BG_COLORS[index % BG_COLORS.length];
  const isDark = bg === null ? false /*image may be any*/ : bg !== "#ffffff";

  // background when no image
  if (!drewBgImage) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }

  // overlay to ensure text readability when image used (and also subtle when using colors)
  if (drewBgImage) {
    // darken/brighten overlay depending on perceived background
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, width, height);
  } else {
    // subtle top bar background
    ctx.fillStyle = isDark ? "#0b0b0b" : "#f3f4f6";
    ctx.fillRect(0, 0, width, 100);
  }

  // Title text
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 40px ${FONT_FAMILY}`;
  ctx.textAlign = "left";
  ctx.fillText(text.title || "Slide", 36, 64);

  // Optional icon (simple inline SVG book) rendered as image (white icon for contrast)
  try {
    const iconSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 24 24' fill='#ffffff'><path d='M3 5a2 2 0 0 1 2-2h11v2H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h11v2H5a2 2 0 0 1-2-2V5z'/><path d='M21 7h-2v13h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z'/></svg>`;
    const iconDataUri =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(iconSVG);
    const iconImg = await loadImage(iconDataUri);
    ctx.drawImage(iconImg, width - 92, 22, 56, 56);
  } catch (e) {
    // ignore icon render errors
  }

  // Body text
  const body = text.content || "";
  ctx.fillStyle = "#ffffff";
  ctx.font = `26px ${FONT_FAMILY}`;
  ctx.textAlign = "left";

  // if slide contains mermaidSVG (model-provided), draw it top-right / center area
  if (text.mermaidSVG) {
    try {
      const svgDataUri =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(text.mermaidSVG);
      const img = await loadImage(svgDataUri);
      // draw diagram to the right side, scaling to fit
      const maxW = 560;
      const maxH = 360;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const iw = img.width * ratio;
      const ih = img.height * ratio;
      const ix = width - iw - 48;
      const iy = 140;
      ctx.drawImage(img, ix, iy, iw, ih);

      // render body text in remaining space
      const maxWidth = ix - 72;
      wrapText(ctx, body, 36, 160, maxWidth, 34);
    } catch (e) {
      // couldn't render mermaid svg - fall back to plain body
      wrapText(ctx, body, 36, 160, width - 72, 34);
    }
  } else {
    // wrap text full width
    wrapText(ctx, body, 36, 160, width - 72, 34);
  }

  // small footer / credit
  ctx.fillStyle = "#cbd5e1";
  ctx.font = `16px ${FONT_FAMILY}`;
  ctx.textAlign = "right";
  ctx.fillText("StudyAid • AI Slide", width - 24, height - 20);

  const filename = `slide_${index}_${Date.now()}.png`;
  const filepath = path.join(outputsDir, filename);
  const buffer = canvas.toBuffer("image/png");
  await fs.writeFile(filepath, buffer);
  return filepath;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trim(), x, y);
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

// new: generate slides using Gemini 2.5-flash directly
async function generateSlidesWithGemini(topic) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI API key not set in environment");

  const prompt = `
Generate a JSON array of slides for the topic: "${topic}"
Each slide object must contain:
- "title": short title (max 8 words)
- "content": 1-3 concise sentences suitable for slide narration/tts
- "duration": integer seconds (6-9)
- optionally "mermaidSVG": a self-contained SVG string representing a mermaid diagram if a diagram is useful for the slide; if no diagram is needed, omit this field.

Return ONLY valid JSON (an array). Do not add extra commentary.
Make diagrams minimal and focused. Use plain SVG for mermaid content (no external resources).
Limit total slides to 6-12.
`;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.error?.message || JSON.stringify(json) || "Gemini API failed"
    );
  }

  const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No content from Gemini");

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch)
    throw new Error("Could not parse JSON array from Gemini response");

  const slides = JSON.parse(jsonMatch[0]);

  // defensive: ensure shape and defaults
  return slides.map((s) => ({
    title: s.title || "Slide",
    content: s.content || s.text || "",
    duration: Number(s.duration) || 7,
    mermaidSVG: s.mermaidSVG || s.mermaid || undefined,
  }));
}

// Add progress tracking function
function sendProgress(res, step, details = "") {
  const message = details ? `${step}: ${details}` : step;
  res.write(`data: ${JSON.stringify({ step, details, message })}\n\n`);
}

const createTopicVideoWithProgress = async (req, res) => {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      res.write(`data: ${JSON.stringify({ error: "Topic is required" })}\n\n`);
      res.end();
      return;
    }

    sendProgress(res, "Initializing", "Starting video generation...");

    // Step 1: Generate slides with Gemini
    sendProgress(res, "Generating Content", "Creating slides with AI...");
    const slidesMeta = await generateSlidesWithGemini(String(topic).trim());
    if (!Array.isArray(slidesMeta) || slidesMeta.length === 0) {
      res.write(
        `data: ${JSON.stringify({ error: "Failed to generate slides" })}\n\n`
      );
      res.end();
      return;
    }
    sendProgress(
      res,
      "Content Generated",
      `${slidesMeta.length} slides created`
    );

    // Step 2: Fetch background images
    sendProgress(res, "Fetching Images", "Getting background images...");
    let bgImages = [];
    try {
      bgImages = await Promise.all(
        slidesMeta.map((s) => getImageForKeyword(`${topic} ${s.title || ""}`))
      );
      sendProgress(res, "Images Ready", "Background images downloaded");
    } catch (e) {
      console.warn("Error fetching background images:", e.message || e);
      bgImages = slidesMeta.map(() => null);
      sendProgress(res, "Images Skipped", "Using default backgrounds");
    }

    // Step 3: Process each slide - Keep track of temp files
    const slideVideos = [];
    const tempFiles = []; // Track temporary files for cleanup

    for (let i = 0; i < slidesMeta.length; i++) {
      const meta = slidesMeta[i];
      const bgImageUrl = bgImages[i] || null;

      sendProgress(
        res,
        "Processing Slide",
        `Slide ${i + 1}/${slidesMeta.length}: ${meta.title}`
      );

      // Render slide image
      sendProgress(
        res,
        "Rendering Image",
        `Creating visual for slide ${i + 1}`
      );
      const imagePath = await renderSlideImage(meta, i, bgImageUrl);
      tempFiles.push(imagePath); // Add to temp files

      // Generate TTS - Make sure we use the full content
      sendProgress(
        res,
        "Generating Audio",
        `Creating narration for slide ${i + 1}`
      );
      const fullText = `${meta.title}. ${meta.content || ""}`.trim();
      const audioPath = await generateTTS(fullText, i);
      tempFiles.push(audioPath); // Add to temp files

      // Create slide video
      sendProgress(
        res,
        "Creating Video",
        `Combining audio and visual for slide ${i + 1}`
      );
      const durationSec = Math.max(6, Math.min(12, meta.duration || 8));
      const slideVideoPath = await createSlideVideo(
        imagePath,
        audioPath,
        durationSec,
        i
      );
      slideVideos.push(slideVideoPath);
      tempFiles.push(slideVideoPath); // Add to temp files

      sendProgress(res, "Slide Complete", `Slide ${i + 1} finished`);
    }

    // Step 4: Combine all slides
    sendProgress(res, "Finalizing", "Combining all slides into final video...");
    const finalFilename = `${topic.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}.mp4`;
    const finalPath = path.join(outputsDir, finalFilename);
    await concatVideos(slideVideos, finalPath);

    // Step 5: Cleanup ONLY temporary files, keep final video
    sendProgress(res, "Cleaning Up", "Removing temporary files...");
    try {
      // Only remove the specific temp files we created, not all files in outputs
      for (const tempFile of tempFiles) {
        try {
          await fs.unlink(tempFile);
        } catch (e) {
          console.warn(`Failed to delete temp file ${tempFile}:`, e.message);
        }
      }

      // Also remove the concat list file if it exists
      const files = await fs.readdir(outputsDir);
      for (const f of files) {
        if (f.startsWith("concat_list_") && f.endsWith(".txt")) {
          try {
            await fs.unlink(path.join(outputsDir, f));
          } catch (e) {
            console.warn(`Failed to delete concat list ${f}:`, e.message);
          }
        }
      }
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }

    // Send final result
    sendProgress(res, "Complete", "Video generation finished!");
    res.write(
      `data: ${JSON.stringify({
        success: true,
        videoUrl: `/outputs/${finalFilename}`,
        slides: slidesMeta.length,
        message: "Video created successfully",
      })}\n\n`
    );
    res.end();
  } catch (err) {
    console.error("createTopicVideo error:", err);
    res.write(
      `data: ${JSON.stringify({
        error: "Video generation failed",
        details: String(err),
      })}\n\n`
    );
    res.end();
  }
};

// Update the regular endpoint too
const createTopicVideo = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Topic is required" });
    }

    const slidesMeta = await generateSlidesWithGemini(String(topic).trim());
    if (!Array.isArray(slidesMeta) || slidesMeta.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate slides" });
    }

    let bgImages = [];
    try {
      bgImages = await Promise.all(
        slidesMeta.map((s) => getImageForKeyword(`${topic} ${s.title || ""}`))
      );
    } catch (e) {
      console.warn("Error fetching background images:", e.message || e);
      bgImages = slidesMeta.map(() => null);
    }

    const slideVideos = [];
    const tempFiles = []; // Track temporary files

    for (let i = 0; i < slidesMeta.length; i++) {
      const meta = slidesMeta[i];
      const bgImageUrl = bgImages[i] || null;
      const imagePath = await renderSlideImage(meta, i, bgImageUrl);
      tempFiles.push(imagePath);

      // Enhanced TTS with full content
      const fullText = `${meta.title}. ${meta.content || ""}`.trim();
      const audioPath = await generateTTS(fullText, i);
      tempFiles.push(audioPath);

      const durationSec = Math.max(6, Math.min(12, meta.duration || 8));
      const slideVideoPath = await createSlideVideo(
        imagePath,
        audioPath,
        durationSec,
        i
      );
      slideVideos.push(slideVideoPath);
      tempFiles.push(slideVideoPath);
    }

    const finalFilename = `${topic.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}.mp4`;
    const finalPath = path.join(outputsDir, finalFilename);
    await concatVideos(slideVideos, finalPath);

    // Cleanup only temp files, keep final video
    try {
      for (const tempFile of tempFiles) {
        try {
          await fs.unlink(tempFile);
        } catch (e) {
          console.warn(`Failed to delete temp file ${tempFile}:`, e.message);
        }
      }

      // Remove concat list files
      const files = await fs.readdir(outputsDir);
      for (const f of files) {
        if (f.startsWith("concat_list_") && f.endsWith(".txt")) {
          try {
            await fs.unlink(path.join(outputsDir, f));
          } catch (e) {}
        }
      }
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
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

const deleteVideoFile = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl)
      return res
        .status(400)
        .json({ success: false, message: "No videoUrl provided" });
    const filename = videoUrl.split("/outputs/")[1];
    if (!filename)
      return res
        .status(400)
        .json({ success: false, message: "Invalid videoUrl" });
    const filePath = path.join(outputsDir, filename);
    await fs.unlink(filePath);
    return res.json({ success: true, message: "Video deleted" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
      error: String(err),
    });
  }
};

module.exports = {
  createTopicVideo,
  createTopicVideoWithProgress, // Add new function
  deleteVideoFile,
};
