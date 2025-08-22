import React, { useState } from "react";

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const VideoGenerator = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // Generic Hugging Face fetcher
  const huggingFaceApi = async (model, payload, isJson = true) => {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    console.log(`🔄 Calling HuggingFace API: ${url}`);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          ...(isJson ? { "Content-Type": "application/json" } : {}),
        },
        body: isJson ? JSON.stringify(payload) : payload,
      });

      if (!response.ok) {
        throw new Error(`❌ HuggingFace API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (err) {
      console.error("🚨 HuggingFace API call failed:", err.message);
      throw err;
    }
  };

  // ✅ Text-to-Speech (no gated model)
  const generateAudio = async (text) => {
    setLoadingMessage("🎤 Generating audio...");
    try {
      const response = await huggingFaceApi(
        "facebook/mms-tts-eng", // ✅ Open-access English TTS
        { inputs: text }
      );
      const blob = await response.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert("Audio generation failed. Check console for details.");
    } finally {
      setLoadingMessage("");
    }
  };

  // ✅ Image Generation (open Stable Diffusion model)
  const generateImage = async (prompt) => {
    setLoadingMessage("🎨 Generating image...");
    try {
      const response = await huggingFaceApi(
        "stabilityai/stable-diffusion-2", // ✅ Open version (not gated)
        { inputs: prompt }
      );
      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert("Image generation failed. Check console for details.");
    } finally {
      setLoadingMessage("");
    }
  };

  // Example test run
  const handleGenerate = async () => {
    await generateAudio("Hello! This is your AI video generator speaking.");
    await generateImage("A futuristic cyberpunk city with neon lights at night");
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">🎬 AI Video Generator</h2>
      {loadingMessage && <p className="text-blue-500">{loadingMessage}</p>}

      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate Audio & Image
      </button>

      {audioUrl && (
        <div>
          <h3 className="font-semibold mt-4">🔊 Generated Audio:</h3>
          <audio controls src={audioUrl} />
        </div>
      )}

      {imageUrl && (
        <div>
          <h3 className="font-semibold mt-4">🖼️ Generated Image:</h3>
          <img src={imageUrl} alt="Generated" className="rounded-lg shadow-md w-96" />
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
