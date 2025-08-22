import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBook,
  FaChartBar,
  FaSignOutAlt,
  FaHome,
  FaLanguage,
  FaChartLine,
} from "react-icons/fa";
import { ThemeToggle } from "./landing/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import StudentStats from "./StudentStats";
import MyAchievements from "./MyAchievements";
import PDFTranslator from "./translatePart/PDFTranslator";

// Maps frontend codes to backend full names
const BACKEND_LANGUAGE_MAP = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
};

// Maps backend names to frontend codes
const FRONTEND_LANGUAGE_MAP = Object.fromEntries(
  Object.entries(BACKEND_LANGUAGE_MAP).map(([code, name]) => [name, code])
);

// Display mapping (name -> code)
const LANGUAGE_MAPPING = {
  English: "en",
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
  Bengali: "bn",
  Marathi: "mr",
  Gujarati: "gu",
  Kannada: "kn",
};

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
  { key: "courses", label: "My Courses", icon: <FaBook /> },
  { key: "stats", label: "Stats", icon: <FaChartBar /> },
  { key: "achievements", label: "Achievements", icon: <FaChartLine /> },
  { key: "translator", label: "Translator", icon: <FaLanguage /> },
];

const StudentDashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrivateCourseModal, setShowPrivateCourseModal] = useState(false);
  const [privateCourseData, setPrivateCourseData] = useState({
    code: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "student") {
      navigate("/teacher-dashboard");
      return;
    }

    setUser(parsedUser);
    fetchCourses();
    fetchEnrolledCourses();
    fetchPreferredLanguage();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchPreferredLanguage = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.preferredLanguage) {
        const frontendCode = FRONTEND_LANGUAGE_MAP[data.preferredLanguage];
        setCurrentLanguage(
          Object.keys(LANGUAGE_MAPPING).find(
            (name) => LANGUAGE_MAPPING[name] === frontendCode
          ) || "English"
        );
      }
    } catch (error) {
      console.error("Error fetching preferred language:", error);
    }
  };

  const updateLanguagePreference = async (selectedLanguageName) => {
    setIsUpdatingLanguage(true);

    try {
      const frontendCode = LANGUAGE_MAPPING[selectedLanguageName];
      if (!frontendCode) {
        toast.error("Invalid language selection");
        return;
      }

      const backendName = BACKEND_LANGUAGE_MAP[frontendCode];
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/student/language`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ preferredLanguage: backendName }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setCurrentLanguage(selectedLanguageName);
        toast.success(`Language preference updated successfully!`);
      } else {
        toast.error(data.message || `Failed to update language preference`);
      }
    } catch (error) {
      toast.error(`Something went wrong. Please try again.`);
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/public`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error(`Error fetching courses:`, error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enrolled`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setEnrolledCourses(data.courses);
      }
    } catch (error) {
      console.error(`Error fetching enrolled courses:`, error);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ courseId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully enrolled in course!`);
        fetchEnrolledCourses();
        fetchCourses();
      } else {
        toast.error(data.message || `Failed to enroll`);
      }
    } catch (error) {
      toast.error(`Something went wrong. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateCourseJoin = async () => {
    if (!privateCourseData.code || !privateCourseData.password) {
      toast.error(`Please enter both course code and password`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/join-private`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(privateCourseData),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully joined private course!`);
        setShowPrivateCourseModal(false);
        setPrivateCourseData({ code: "", password: "" });
        fetchEnrolledCourses();
      } else {
        toast.error(data.message || `Failed to join course`);
      }
    } catch (error) {
      toast.error(`Something went wrong. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success(`Logged out successfully!`);
    setTimeout(() => navigate("/login"), 1000);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3"
        >
          <div className="animate-spin h-6 w-6 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
          <span className={`font-medium ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
            Loading dashboard...
          </span>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 ${
                isDark ? "bg-[#101010] border border-[#222]" : "bg-white border border-gray-200"
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                My Enrolled Courses
              </h2>
              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <motion.div
                      key={course._id}
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl p-6 cursor-pointer transition-all ${
                        isDark
                          ? "bg-[#181818] border border-[#333] hover:border-[#a78bfa]"
                          : "bg-gray-50 border border-gray-100 hover:border-[#7c3aed]"
                      }`}
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      <h3 className={`font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                        {course.title}
                      </h3>
                      <p className={`text-sm mb-4 ${isDark ? "text-[#aaa]" : "text-[#666]"}`}>
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDark ? "bg-[#222] text-[#aaa]" : "bg-gray-200 text-[#666]"
                        }`}>
                          {course.category}
                        </span>
                        <span className={`text-sm ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}`}>
                          Progress: {Math.round(course.progress || 0)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h4 className={`text-xl font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                    No courses yet
                  </h4>
                  <p className={`${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}`}>
                    Start learning by enrolling in a course!
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        );

      case "courses":
        return (
          <div className="space-y-6">
            {/* Header with actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
            >
              <h2 className={`text-2xl font-bold ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                Available Courses
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPrivateCourseModal(true)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isDark ? "bg-[#a78bfa] text-white" : "bg-[#7c3aed] text-white"
                  }`}
                >
                  Join Private Course
                </motion.button>
              </div>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-xl p-6 ${
                isDark ? "bg-[#101010] border border-[#222]" : "bg-white border border-gray-200"
              }`}
            >
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none ${
                  isDark
                    ? "bg-[#181818] border-[#222] text-[#f8f8f8] focus:ring-[#a78bfa]"
                    : "bg-white border-gray-200 text-[#080808] focus:ring-[#7c3aed]"
                }`}
              />
            </motion.div>

            {/* Courses Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-xl p-6 transition-all ${
                      isDark
                        ? "bg-[#101010] border border-[#222] hover:border-[#a78bfa]"
                        : "bg-white border border-gray-200 hover:border-[#7c3aed]"
                    }`}
                  >
                    <h3 className={`font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-[#aaa]" : "text-[#666]"}`}>
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDark ? "bg-[#222] text-[#aaa]" : "bg-gray-200 text-[#666]"
                      }`}>
                        {course.category}
                      </span>
                      <span className={`text-xs ${isDark ? "text-[#aaa]" : "text-[#666]"}`}>
                        By: {course.teacher}
                      </span>
                    </div>
                    {enrolledCourses.some((enrolled) => enrolled._id === course._id) ? (
                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        className={`w-full py-2 rounded-lg font-medium ${
                          isDark
                            ? "bg-[#181818] border border-[#333] text-[#f8f8f8]"
                            : "bg-gray-100 border border-gray-200 text-[#080808]"
                        }`}
                      >
                        Continue Learning →
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEnrollCourse(course._id)}
                        disabled={loading}
                        className={`w-full py-2 rounded-lg font-medium disabled:opacity-50 ${
                          isDark ? "bg-[#a78bfa] text-white" : "bg-[#7c3aed] text-white"
                        }`}
                      >
                        {loading ? "Enrolling..." : "Enroll Now"}
                      </motion.button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h4 className={`text-xl font-semibold mb-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                    No courses found
                  </h4>
                  <p className={`${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}`}>
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        );

      case "stats":
        return <StudentStats />;

      case "achievements":
        return <MyAchievements />;

      case "translator":
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
              PDF Translator
            </h2>
            <div className={`rounded-xl p-6 ${
              isDark ? "bg-[#101010] border border-[#222]" : "bg-white border border-gray-200"
            }`}>
              <p className={`mb-4 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                This feature allows you to translate PDF documents to your preferred language.
              </p>
              <PDFTranslator />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"}`}>
      {/* Sidebar */}
      <aside
        className={`sticky top-0 flex flex-col justify-between h-screen border-r transition-all duration-200
          ${collapsed ? "w-16" : "w-56"} z-30
          ${isDark ? "bg-[#101010] border-[#222]" : "bg-white border-gray-200"}
        `}
      >
        <div>
          <div
            className={`flex items-center justify-between px-4 py-4 border-b ${
              isDark ? "border-[#222]" : "border-gray-100"
            }`}
          >
            {!collapsed && (
              <h1 className={`font-bold ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                StudyAid
              </h1>
            )}
            <button
              className={`ml-2 p-2 rounded transition ${
                isDark
                  ? "hover:bg-[#181818] text-[#f8f8f8]"
                  : "hover:bg-gray-100 text-[#080808]"
              }`}
              onClick={() => setCollapsed((c) => !c)}
            >
              <FaBars />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`
                  group flex items-center gap-4 px-3 py-2 text-left rounded-lg transition relative
                  ${
                    activeTab === item.key
                      ? `${
                          isDark
                            ? "mx-2 my-1 bg-[#18182b] font-semibold border-l-4 border-[#a78bfa] shadow-sm"
                            : "mx-2 my-1 bg-[#ece9ff] font-semibold border-l-4 border-[#7c3aed] shadow-sm"
                        }`
                      : isDark
                      ? "hover:bg-[#181818]"
                      : "hover:bg-gray-100"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                  ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
                `}
                onClick={() => setActiveTab(item.key)}
                title={item.label}
                style={{
                  marginLeft: activeTab === item.key && !collapsed ? "2px" : 0,
                  marginRight: activeTab === item.key && !collapsed ? "2px" : 0,
                }}
              >
                <span className={`text-lg ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className={`sidebar-label text-base ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 px-2 pb-4">
          <button
            className={`flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded transition ${
              isDark
                ? "hover:bg-[#181818] text-red-400"
                : "hover:bg-red-50 text-red-600"
            }`}
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
            {!collapsed && (
              <span className="sidebar-label text-base">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-20 backdrop-blur border-b px-4 md:px-8 py-4 ${
            isDark
              ? "bg-[#101010]/90 border-[#222]"
              : "bg-white/90 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className={`text-lg md:text-xl font-semibold truncate ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}>
                Student Portal
              </h1>
            </div>
            <ThemeToggle className="h-8" />
          </div>
        </motion.header>

        {/* Content Area */}
        <main className={`flex-1 p-4 md:p-8 overflow-auto ${isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"}`}>
          <div className="max-w-6xl mx-auto w-full">{renderContent()}</div>
        </main>
      </div>

      {/* Private Course Modal */}
      <AnimatePresence>
        {showPrivateCourseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPrivateCourseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl p-6 w-full max-w-md ${
                isDark ? "bg-[#101010] border border-[#222]" : "bg-white border border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                Join Private Course
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Course Code"
                  value={privateCourseData.code}
                  onChange={(e) =>
                    setPrivateCourseData({
                      ...privateCourseData,
                      code: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none ${
                    isDark
                      ? "bg-[#222] border-[#333] text-[#f8f8f8] focus:ring-[#a78bfa]"
                      : "bg-white border-gray-200 text-[#080808] focus:ring-[#7c3aed]"
                  }`}
                />
                <input
                  type="password"
                  placeholder="Course Password"
                  value={privateCourseData.password}
                  onChange={(e) =>
                    setPrivateCourseData({
                      ...privateCourseData,
                      password: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none ${
                    isDark
                      ? "bg-[#222] border-[#333] text-[#f8f8f8] focus:ring-[#a78bfa]"
                      : "bg-white border-gray-200 text-[#080808] focus:ring-[#7c3aed]"
                  }`}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPrivateCourseModal(false)}
                  className={`flex-1 py-2 border rounded-lg ${
                    isDark
                      ? "border-[#222] text-[#f8f8f8]"
                      : "border-gray-200 text-[#080808]"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrivateCourseJoin}
                  disabled={loading}
                  className={`flex-1 py-2 rounded-lg font-medium disabled:opacity-50 ${
                    isDark ? "bg-[#a78bfa] text-white" : "bg-[#7c3aed] text-white"
                  }`}
                >
                  {loading ? "Joining..." : "Join Course"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;