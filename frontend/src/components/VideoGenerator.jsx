import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const VideoGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const { isDark } = useTheme();

  const createTopicVideo = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    setError("");
    setProgress("Initializing...");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/video/create-topic-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({ topic }),
        }
      );
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || data.error || "Failed");
      setGeneratedVideo(
        `${import.meta.env.VITE_NODE_BASE_API_URL}${data.videoUrl}`
      );
      setProgress(`Video ready — ${data.slides} slides`);
    } catch (err) {
      setError(String(err.message || err));
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTopicVideo();
  };

  return (
    <div
      className={`min-h-screen p-6`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">AI Video Generator</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g., Photosynthesis)"
            className="w-full p-3 rounded border"
            disabled={loading}
          />
          <div className="flex gap-3">
            <button
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              {loading ? "Generating..." : "Generate Video"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTopic("");
                setGeneratedVideo(null);
                setError("");
                setProgress("");
              }}
              className="px-4 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </form>

        {progress && (
          <div className="mt-4 text-sm text-indigo-600">{progress}</div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">Error: {error}</div>
        )}

        {generatedVideo && (
          <div className="mt-6">
            <video src={generatedVideo} controls className="w-full rounded" />
            <a
              className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded"
              href={generatedVideo}
              download
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
