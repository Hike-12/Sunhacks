import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { SidebarProvider } from "../../context/SidebarContext";
import DashboardLayout from "./DashboardLayout";
import Overview from "./Overview";
import Courses from "./Courses";
import CreateCourse from "./CreateCourse";
import Analytics from "./Analytics";
import FlashcardGenerator from "../FlashcardGenerator";
import PersonalizedStudyFlow from "../PersonalizedStudyFlow";
import { useTheme } from "../../context/ThemeContext";
import "react-toastify/dist/ReactToastify.css";
import PDFTranslator from "../translatePart/PDFTranslator";
import InterviewPrep from "../InterviewPrep";
import VideoGenerator from "../VideoGenerator"; // Import the new component

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "teacher") {
      toast.error("Access denied. Teachers only.");
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  // Sidebar navigation items
  const teacherNavItems = [
    {
      id: "overview",
      label: "Overview",
      active: activeTab === "overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      id: "courses",
      label: "Courses",
      active: activeTab === "courses",
      onClick: () => setActiveTab("courses"),
    },
    {
      id: "analytics",
      label: "Analytics",
      active: activeTab === "analytics",
      onClick: () => setActiveTab("analytics"),
    },
    {
      id: "viva-preperation",
      label: "Viva Preperation",
      active: activeTab === "viva-preperation",
      onClick: () => setActiveTab("viva-preperation"),
    },
    {
      id: "flashcard-generator",
      label: "Smart Flashcards",
      active: activeTab === "flashcard-generator",
      onClick: () => setActiveTab("flashcard-generator"),
    },
    {
      id: "study-flow",
      label: "Study Flow",
      active: activeTab === "study-flow",
      onClick: () => setActiveTab("study-flow"),
    },
    {
      id: "video-generator",
      label: "AI Video Generator",
      active: activeTab === "video-generator",
      onClick: () => setActiveTab("video-generator"),
    },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "courses":
        return <Courses setActiveTab={setActiveTab} />;
      case "create-course":
        return <CreateCourse setActiveTab={setActiveTab} />;
      case "analytics":
        return <Analytics />;
      case "viva-preperation":
        return <InterviewPrep />
      case "flashcard-generator":
        return <FlashcardGenerator />;
      case "study-flow":
        return <PersonalizedStudyFlow />;
      case "pdf-translator":
        return <PDFTranslator />;
      case "video-generator":
        return <VideoGenerator />;
      default:
        return <Overview />;
    }
  };

  if (!user) {
    return (
      <div
        className={
          isDark
            ? "min-h-screen flex items-center justify-center bg-neutral-900"
            : "min-h-screen flex items-center justify-center bg-neutral-50"
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={
            isDark
              ? "flex items-center space-x-3 text-neutral-50"
              : "flex items-center space-x-3 text-neutral-900"
          }
        >
          <div className="animate-spin h-6 w-6 border-2 border-indigo-700 border-t-transparent rounded-full"></div>
          <span className="font-medium">Loading dashboard...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardLayout
        user={user}
        navItems={teacherNavItems}
        onLogout={handleLogout}
        activeKey={activeTab}
        setActiveTab={setActiveTab}
        title="StudyAid Dashboard"
        subtitle={`AI-Powered Learning Assistant | ${
          user.language || "English"
        }`}
      >
        {renderContent()}
      </DashboardLayout>
    </SidebarProvider>
  );
};

export default TeacherDashboard;