import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import mermaid from "mermaid";
import { ThemeToggle } from "../landing/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

function MermaidDiagram({ code }) {
  const [svg, setSvg] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    if (!code || code.trim().length === 0) {
      setSvg("");
      setError("");
      return;
    }
    async function render() {
      try {
        let cleanedCode = code.replace(
          /^(flowchart|graph)\s+([A-Za-z]+)\s*/i,
          (match, p1, p2) => `${p1} ${p2}\n`
        );
        const diagramId = `mermaid-teacher-${Date.now()}`;
        const { svg } = await mermaid.render(diagramId, cleanedCode);
        if (!cancelled) {
          setSvg(svg);
          setError("");
        }
      } catch (error) {
        if (!cancelled) {
          setSvg("");
          setError("Error rendering diagram: " + error.message);
        }
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!code || code.trim().length === 0) return null;
  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }
  return (
    <div className="mb-4">
      <div
        className="bg-white p-4 rounded-lg shadow-lg"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

const TeacherCourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flattenedContent, setFlattenedContent] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/${courseId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
        const flattened = flattenContentTree(data.course.contentTree || []);
        setFlattenedContent(flattened);
      }
    } catch (error) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const flattenContentTree = (contentTree) => {
    const flattened = [];
    const traverse = (nodes) => {
      for (const node of nodes) {
        if (node.type === "topic") {
          flattened.push({
            title: node.title,
            content: node.content || "<p>No content available</p>",
            videoUrls: node.videoUrls || [],
            imageUrls: node.imageUrls || [],
            mermaid: node.mermaid || "",
          });
        }
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      }
    };
    traverse(contentTree);
    return flattened;
  };

  const renderVideoPlayer = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop().split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      if (videoId) {
        return (
          <div className="aspect-video mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Course Video"
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      }
    }
    return (
      <div className="mb-4">
        <video
          src={url}
          controls
          className="w-full rounded-lg"
          style={{ maxHeight: "400px" }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const renderImage = (url) => {
    if (!url) return null;
    return (
      <div className="mb-4">
        <img
          src={url}
          alt="Course content"
          className="w-full rounded-lg shadow-lg"
          style={{ maxHeight: "500px", objectFit: "contain" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

  const handleBack = () => {
    navigate("/teacher-dashboard");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col ${
          isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"
        }`}
      >
        <div
          className={`w-full flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"
          }`}
        >
          <div />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className={`flex items-center space-x-2 ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            <div className="animate-spin h-6 w-6 border-2 border-[#7c3aed] border-t-transparent rounded-full"></div>
            <span>Loading course...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className={`min-h-screen flex flex-col ${
          isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"
        }`}
      >
        <div
          className={`w-full flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"
          }`}
        >
          <div />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`text-center ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Course not found</h2>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = flattenedContent[currentSlide] || {
    title: "No Content",
    content: "This course has no content yet.",
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-[#030303]" : "bg-[#f8f8f8]"
      }`}
    >
      <div
        className={`w-full flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={handleBack}
          className={`p-2 rounded 
    ${
      isDark
        ? "hover:bg-[#181818] text-[#f8f8f8]"
        : "hover:bg-neutral-200 text-[#7c3aed]"
    } 
    transition`}
        >
          <FaArrowLeft />
        </button>
        <ThemeToggle />
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto py-6 px-2 sm:px-6">
        <div className="mb-6">
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            {course.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>{course.category}</span>
            <span>•</span>
            <span>{course.language}</span>
          </div>
        </div>

        {flattenedContent.length > 0 ? (
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${
              isDark
                ? "bg-[#101010] border-[#222]"
                : "bg-neutral-50 border-gray-200"
            } rounded-lg shadow p-6 border`}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                {currentContent.title}
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Slide {currentSlide + 1} of {flattenedContent.length}
              </span>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                className={`leading-relaxed ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
                dangerouslySetInnerHTML={{
                  __html: currentContent.content,
                }}
              />
            </div>

            {currentContent.videoUrls &&
              currentContent.videoUrls.length > 0 && (
                <div className="mt-6">
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Videos
                  </h3>
                  {currentContent.videoUrls.map((url, index) => (
                    <div key={index} className="mb-4">
                      {url && url.trim() && renderVideoPlayer(url)}
                    </div>
                  ))}
                </div>
              )}

            {currentContent.imageUrls &&
              currentContent.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Images
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentContent.imageUrls.map((url, index) => (
                      <div key={index}>
                        {url && url.trim() && renderImage(url)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {currentContent.mermaid && (
              <div className="mt-6">
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  Diagram
                </h3>
                <MermaidDiagram code={currentContent.mermaid} />
              </div>
            )}

            <div
              className={`flex justify-between items-center mt-8 pt-6 border-t ${
                isDark ? "border-[#222]" : "border-gray-200"
              } gap-2`}
            >
              <button
                onClick={() =>
                  setCurrentSlide(Math.max(0, currentSlide - 1))
                }
                disabled={currentSlide === 0}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition
                  ${
                    isDark
                      ? "border-[#222] text-[#f8f8f8] hover:bg-[#181818]"
                      : "border-gray-300 text-[#7c3aed] hover:bg-neutral-100"
                  }
                `}
              >
                <FaChevronLeft />
                <span>Previous</span>
              </button>
              <button
                onClick={() =>
                  setCurrentSlide(
                    Math.min(flattenedContent.length - 1, currentSlide + 1)
                  )
                }
                disabled={currentSlide === flattenedContent.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5b21b6] transition"
              >
                <span>Next</span>
                <FaChevronRight />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This course has no content yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseViewer;