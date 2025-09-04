import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FaDownload, FaCopy, FaTrash, FaPlay, FaSpinner } from "react-icons/fa";
import { MdVideoLibrary, MdDelete } from "react-icons/md";

const VideoGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [generatedVideos, setGeneratedVideos] = useState([]); // Store all videos
  const [error, setError] = useState("");
  const [progressSteps, setProgressSteps] = useState([]);
  const [currentProgress, setCurrentProgress] = useState("");
  const { isDark } = useTheme();

  useEffect(() => {
    // Load all saved videos from localStorage
    const savedVideos = localStorage.getItem("generatedVideos");
    if (savedVideos) {
      try {
        const videosArray = JSON.parse(savedVideos);
        setGeneratedVideos(videosArray);
        // Set the most recent video as current
        if (videosArray.length > 0) {
          setGeneratedVideo(videosArray[videosArray.length - 1].url);
        }
      } catch (e) {
        console.warn("Failed to parse saved videos:", e);
      }
    }
  }, []);

  const saveVideoToStorage = (videoUrl, topic, slides) => {
    const newVideo = {
      id: Date.now(),
      url: videoUrl,
      topic: topic,
      slides: slides,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
    };

    const updatedVideos = [...generatedVideos, newVideo];
    setGeneratedVideos(updatedVideos);
    localStorage.setItem("generatedVideos", JSON.stringify(updatedVideos));
    return newVideo;
  };

  const removeVideoFromStorage = (videoId) => {
    const updatedVideos = generatedVideos.filter(
      (video) => video.id !== videoId
    );
    setGeneratedVideos(updatedVideos);
    localStorage.setItem("generatedVideos", JSON.stringify(updatedVideos));

    // If we're removing the current video, set the next one as current
    const currentVideoObj = generatedVideos.find(
      (v) => v.url === generatedVideo
    );
    if (currentVideoObj && currentVideoObj.id === videoId) {
      const nextVideo =
        updatedVideos.length > 0
          ? updatedVideos[updatedVideos.length - 1]
          : null;
      setGeneratedVideo(nextVideo ? nextVideo.url : null);
    }
  };

  const createTopicVideoWithLiveProgress = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setError("");
    setProgressSteps([]);
    setCurrentProgress("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/video/create-topic-video-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({ topic }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                setError(
                  data.error + (data.details ? `: ${data.details}` : "")
                );
                setLoading(false);
                return;
              }

              if (data.success) {
                // Video generation complete
                const fullVideoUrl = `${
                  import.meta.env.VITE_NODE_BASE_API_URL
                }${data.videoUrl}`;
                setGeneratedVideo(fullVideoUrl);

                // Save to localStorage with metadata
                saveVideoToStorage(fullVideoUrl, topic, data.slides);

                setCurrentProgress(
                  `✅ Complete! Generated ${data.slides} slides`
                );
                setLoading(false);
                return;
              }

              // Progress update
              if (data.message) {
                setCurrentProgress(data.message);
                setProgressSteps((prev) => [
                  ...prev,
                  {
                    step: data.step,
                    details: data.details,
                    message: data.message,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(String(err.message || err));
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTopicVideoWithLiveProgress();
  };

  const handleDeleteVideo = async (video) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/video/delete-video`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({ videoUrl: video.url }),
        }
      );
      removeVideoFromStorage(video.id);
    } catch (e) {
      console.warn("Delete failed:", e);
      // Still remove from frontend even if backend delete fails
      removeVideoFromStorage(video.id);
    }
  };

  const handleReset = () => {
    setTopic("");
    setError("");
    setProgressSteps([]);
    setCurrentProgress("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 ${
        isDark ? "bg-[#0a0a0a] text-[#f5f5f7]" : "bg-white text-[#080808]"
      }`}
    >
      <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto">
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-4 ${
            isDark ? "text-[#f5f5f7]" : "text-[#080808]"
          }`}
        >
          AI Video Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g., Photosynthesis, Machine Learning, History of Rome)"
            className={`w-full p-3 rounded border ${
              isDark
                ? "bg-[#1a1a1a] border-[#333] text-[#f5f5f7] placeholder-[#888]"
                : "bg-white border-gray-300 text-[#080808] placeholder-gray-500"
            }`}
            disabled={loading}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled={loading}
              className={`px-6 py-3 rounded font-medium w-full sm:w-auto transition-colors flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaPlay />
                  Generate Video
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className={`px-6 py-3 rounded font-medium w-full sm:w-auto transition-colors flex items-center justify-center gap-2 ${
                isDark
                  ? "border-[#333] text-[#f5f5f7] hover:bg-[#1a1a1a]"
                  : "border-gray-300 text-[#080808] hover:bg-gray-50"
              } border`}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Live Progress Display */}
        {loading && progressSteps.length > 0 && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              isDark
                ? "bg-[#1a1a1a] border-[#333]"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <h3
              className={`font-semibold mb-3 ${
                isDark ? "text-[#f5f5f7]" : "text-[#080808]"
              }`}
            >
              Generation Progress
            </h3>

            {/* Current Progress */}
            <div
              className={`mb-4 p-3 rounded ${
                isDark
                  ? "bg-[#0a0a0a] text-indigo-400"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                <span className="font-medium">{currentProgress}</span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progressSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded flex justify-between items-start ${
                    isDark
                      ? "bg-[#0a0a0a] text-[#ccc]"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <div>
                    <span className="font-medium">{step.step}</span>
                    {step.details && (
                      <span
                        className={`ml-2 ${
                          isDark ? "text-[#888]" : "text-gray-500"
                        }`}
                      >
                        - {step.details}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isDark ? "text-[#666]" : "text-gray-400"
                    }`}
                  >
                    {step.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Current Generated Video */}
        {generatedVideo && (
          <div className="mt-6">
            <h3
              className={`font-semibold mb-3 flex items-center gap-2 ${
                isDark ? "text-[#f5f5f7]" : "text-[#080808]"
              }`}
            >
              <FaPlay />
              Latest Generated Video
            </h3>
            <video
              src={generatedVideo}
              controls
              className="w-full rounded-lg shadow-lg"
              preload="metadata"
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
                href={generatedVideo}
                download
              >
                <FaDownload />
                Download Video
              </a>
              <button
                onClick={() => copyToClipboard(generatedVideo)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
                  isDark
                    ? "bg-[#1a1a1a] hover:bg-[#333] text-[#f5f5f7] border border-[#333]"
                    : "bg-gray-100 hover:bg-gray-200 text-[#080808] border border-gray-300"
                }`}
              >
                <FaCopy />
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Video Library */}
        {generatedVideos.length > 0 && (
          <div className="mt-8">
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                isDark ? "text-[#f5f5f7]" : "text-[#080808]"
              }`}
            >
              <MdVideoLibrary />
              Your Video Library ({generatedVideos.length} videos)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {generatedVideos.map((video) => (
                <div
                  key={video.id}
                  className={`border rounded-lg p-4 ${
                    isDark
                      ? "bg-[#1a1a1a] border-[#333]"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="aspect-video mb-3 rounded overflow-hidden">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setGeneratedVideo(video.url)}
                      preload="metadata"
                    />
                  </div>

                  <h4
                    className={`font-medium mb-2 truncate ${
                      isDark ? "text-[#f5f5f7]" : "text-[#080808]"
                    }`}
                    title={video.topic}
                  >
                    {video.topic}
                  </h4>

                  <div
                    className={`text-sm mb-3 ${
                      isDark ? "text-[#888]" : "text-gray-500"
                    }`}
                  >
                    <div>{video.slides} slides</div>
                    <div>{video.timestamp}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setGeneratedVideo(video.url)}
                      className={`flex-1 px-3 py-1 text-xs rounded flex items-center justify-center gap-1 ${
                        video.url === generatedVideo
                          ? "bg-indigo-600 text-white"
                          : isDark
                          ? "bg-[#333] text-[#f5f5f7] hover:bg-[#444]"
                          : "bg-gray-200 text-[#080808] hover:bg-gray-300"
                      }`}
                    >
                      <FaPlay className="text-xs" />
                      {video.url === generatedVideo ? "Current" : "View"}
                    </button>

                    <button
                      onClick={() => handleDeleteVideo(video)}
                      className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                      title="Delete video"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
