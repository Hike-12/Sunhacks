const pdf = require("pdf-parse");
const fetch = require("node-fetch");

exports.parsePdf = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // primary: text extraction via pdf-parse
    const data = await pdf(file.buffer);
    let text = data && data.text ? data.text.trim() : "";
    if ((!text || text.length < 200) && process.env.VISION_API_KEY) {
      try {
        const base64 = file.buffer.toString("base64");
        const visionRes = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requests: [
                {
                  image: { content: base64 },
                  features: [
                    { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
                  ],
                },
              ],
            }),
          }
        );
        const vr = await visionRes.json();
        const ocrText =
          vr.responses
            ?.map((r) => r.fullTextAnnotation?.text)
            .filter(Boolean)
            .join("\n") || "";
        if (ocrText && ocrText.trim().length > text.length) {
          text = (text + "\n" + ocrText).trim();
        }
      } catch (ocrErr) {
        console.error("Vision OCR failed:", ocrErr);
      }
    }

    return res.json({ text });
  } catch (err) {
    console.error("PDF parse error:", err);
    return res.status(500).json({ error: "Failed to parse PDF" });
  }
};
