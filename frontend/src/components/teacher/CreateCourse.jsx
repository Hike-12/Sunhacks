import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FiUpload, FiBook, FiPlus, FiX, FiZap, FiLoader } from "react-icons/fi";

const CreateCourse = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    language: "English",
    isPrivate: false,
    password: "",
    tags: [],
    estimatedTime: 60,
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [currentTag, setCurrentTag] = useState("");

  const categories = [
    "Programming",
    "Design",
    "Marketing",
    "Business",
    "Science",
    "Math",
    "Language",
    "Music",
    "Art",
    "Other",
  ];

  const languages = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Kannada",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      toast.success("PDF file selected successfully!");
    } else if (file) {
      toast.error("Please select a valid PDF file");
      e.target.value = "";
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const enhanceDescription = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please enter title and description first");
      return;
    }

    setEnhancing(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_NODE_BASE_API_URL
        }/api/courses/enhance-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            language: formData.language,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          description: data.enhancedDescription,
        }));
        toast.success("Description enhanced successfully!");
      } else {
        toast.error(data.message || "Failed to enhance description");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error("Failed to enhance description");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }

    if (formData.isPrivate && !formData.password) {
      toast.error("Password is required for private courses");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("language", formData.language);
      formDataToSend.append("isPrivate", formData.isPrivate);
      formDataToSend.append("estimatedTime", formData.estimatedTime);
      formDataToSend.append("tags", JSON.stringify(formData.tags));

      if (formData.isPrivate) {
        formDataToSend.append("password", formData.password);
      }

      // PDF is now optional
      if (pdfFile) {
        formDataToSend.append("pdf", pdfFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Course creation error:", error);
      toast.error("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#111]" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            isDark ? "bg-[#181818] border-[#333]" : "bg-white border-gray-200"
          } border rounded-xl shadow-lg p-8`}
        >
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            } mb-8`}
          >
            Create New Course
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                } mb-2`}
              >
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  isDark
                    ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                    : "border-gray-300 bg-white text-[#080808]"
                }`}
                placeholder="Enter course title"
                required
              />
            </div>

            {/* Description with enhance button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  Course Description *
                </label>
                <motion.button
                  type="button"
                  onClick={enhanceDescription}
                  disabled={
                    enhancing || !formData.title || !formData.description
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 text-sm ${
                    isDark
                      ? "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                      : "bg-[#a78bfa] hover:bg-[#8b5cf6] text-white"
                  } rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {enhancing ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <FiZap />
                      Enhance with AI
                    </>
                  )}
                </motion.button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border ${
                  isDark
                    ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                    : "border-gray-300 bg-white text-[#080808]"
                }`}
                placeholder="Describe what students will learn in this course..."
                required
              />
              <p
                className={`text-xs mt-2 flex items-center gap-1 ${
                  isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"
                }`}
              >
                <FiZap size={12} />
                Tip: Use the "Enhance with AI" button to automatically improve
                your description!
              </p>
            </div>

            {/* Category and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  } mb-2`}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    isDark
                      ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                      : "border-gray-300 bg-white text-[#080808]"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  } mb-2`}
                >
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    isDark
                      ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                      : "border-gray-300 bg-white text-[#080808]"
                  }`}
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PDF Upload (Optional) */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                } mb-2`}
              >
                PDF Material (Optional)
              </label>
              <div
                className={`border-2 border-dashed ${
                  isDark
                    ? "border-[#333] bg-[#222]"
                    : "border-gray-300 bg-gray-50"
                } rounded-lg p-6`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUpload className="text-4xl mb-2" />
                  <div
                    className={`text-center ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    <p className="font-medium">
                      {pdfFile
                        ? pdfFile.name
                        : "Click to upload PDF (Optional)"}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"
                      } mt-1`}
                    >
                      Upload additional course material to enhance content
                      generation
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                } mb-2`}
              >
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className={`flex-1 px-4 py-2 border ${
                    isDark
                      ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                      : "border-gray-300 bg-white text-[#080808]"
                  }`}
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className={`px-4 py-2 ${
                    isDark
                      ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                      : "bg-[#a78bfa] hover:bg-[#8b5cf6]"
                  } text-white rounded-lg flex items-center gap-1`}
                >
                  <FiPlus />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 ${
                      isDark
                        ? "bg-[#7c3aed]/20 text-[#a78bfa]"
                        : "bg-[#a78bfa]/20 text-[#7c3aed]"
                    } rounded-full text-sm flex items-center gap-2`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Estimated Time */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                } mb-2`}
              >
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleInputChange}
                min="10"
                max="600"
                className={`w-full px-4 py-3 border ${
                  isDark
                    ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                    : "border-gray-300 bg-white text-[#080808]"
                }`}
              />
            </div>

            {/* Private Course Settings */}
            <div
              className={`border ${
                isDark ? "border-[#333]" : "border-gray-200"
              } rounded-lg p-4`}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#7c3aed] rounded focus:ring-[#7c3aed]"
                />
                <span
                  className={`font-medium ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  Make this a private course
                </span>
              </label>

              {formData.isPrivate && (
                <div className="mt-4">
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    } mb-2`}
                  >
                    Course Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      isDark
                        ? "border-[#333] bg-[#222] text-[#f8f8f8]"
                        : "border-gray-300 bg-white text-[#080808]"
                    }`}
                    placeholder="Enter password for private course"
                    required={formData.isPrivate}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <motion.button
                type="button"
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 border ${
                  isDark
                    ? "border-[#333] text-[#f8f8f8] hover:bg-[#222]"
                    : "border-gray-300 text-[#080808] hover:bg-gray-50"
                } rounded-lg font-medium`}
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 ${
                  isDark
                    ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                    : "bg-[#a78bfa] hover:bg-[#8b5cf6]"
                } text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiBook />
                    Create Course
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

export default CreateCourse;
