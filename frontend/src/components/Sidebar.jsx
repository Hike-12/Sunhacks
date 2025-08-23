import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaBook,
  FaChartBar,
  FaSignOutAlt,
  FaHome,
  FaLanguage,
  FaBrain,
  FaRoute,
  FaMedal,
  FaRobot,
  FaUsers,
  FaVideo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import translatePage from "../lib/translatePage";

const navItems = [
  { key: "overview", label: "Overview", icon: <FaHome /> },
  { key: "courses", label: "Courses", icon: <FaBook /> },
  { key: "community", label: "Community", icon: <FaUsers /> },
  { key: "viva-preperation", label: "Viva Preparation", icon: <FaLanguage /> },
  { key: "flashcard-generator", label: "Smart Flashcards", icon: <FaBrain /> },
  { key: "study-flow", label: "Study Flow", icon: <FaRoute /> },
  { key: "doubt-solver", label: "Doubt Solver", icon: <FaRobot /> },
  { key: "video-generator", label: "AI Video Generator", icon: <FaVideo /> },
  { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
  { key: "achievements", label: "Achievements", icon: <FaMedal /> },
];

const Sidebar = ({ activeKey, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("language") || "en"
      : "en"
  );

  // enrolled list removed from Sidebar — use dedicated 'Enrolled' tab instead

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("language");
    if (stored) setLanguage(stored);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    if (lang === "en" || lang === "mr") {
      try {
        translatePage(lang);
      } catch (e) {
        console.error("translation error", e);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
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
          <div />
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
        {/* simple language selector (shadcn-like) */}
        <div className="px-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">
              {language === "en"
                ? "EN"
                : language === "mr"
                ? "MR"
                : language.toUpperCase()}
            </span>
            <div className="relative">
              <button
                className="px-2 py-1 border rounded text-sm"
                onClick={(e) => {
                  const menu = e.currentTarget.nextSibling;
                  if (menu) menu.classList.toggle("hidden");
                }}
              >
                Language
              </button>
              <div className="hidden absolute left-0 mt-2 w-36 rounded-md shadow-lg bg-white/95 dark:bg-[#0b0b0b]/95 z-40">
                <div className="py-1">
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      language === "en" ? "font-semibold" : ""
                    }`}
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      language === "mr" ? "font-semibold" : ""
                    }`}
                    onClick={() => handleLanguageChange("mr")}
                  >
                    Marathi
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm`}
                    onClick={() => handleLanguageChange("hi")}
                  >
                    Hindi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`
                group flex items-center gap-4 px-3 py-2 text-left rounded-lg transition relative
                ${
                  activeKey === item.key
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
                marginLeft: activeKey === item.key && !collapsed ? "2px" : 0,
                marginRight: activeKey === item.key && !collapsed ? "2px" : 0,
              }}
            >
              <span
                className={`text-lg ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span
                  className={`sidebar-label text-base ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Enrolled quick list removed — use Enrolled tab in dashboard */}
      </div>
      <div className="flex flex-col gap-2 px-2 pb-4">
        <button
          className={`flex items-center justify-center md:justify-start gap-2 px-2 py-2 rounded transition
            ${
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
  );
};

export default Sidebar;
