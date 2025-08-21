import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBook, FaClock, FaTrophy, FaChartLine } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const StudentStats = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    achievements: 0,
    weeklyProgress: []
  });

  useEffect(() => {
    // Fetch student stats from API
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/students/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching student stats:", error);
    }
  };

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: <FaBook className="text-2xl" />,
      color: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
      iconColor: isDark ? "text-blue-400" : "text-blue-600"
    },
    {
      title: "Completed",
      value: stats.completedCourses,
      icon: <FaTrophy className="text-2xl" />,
      color: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600",
      iconColor: isDark ? "text-green-400" : "text-green-600"
    },
    {
      title: "Study Hours",
      value: `${stats.totalHours}h`,
      icon: <FaClock className="text-2xl" />,
      color: isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600",
      iconColor: isDark ? "text-purple-400" : "text-purple-600"
    },
    {
      title: "Achievements",
      value: stats.achievements,
      icon: <FaChartLine className="text-2xl" />,
      color: isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600",
      iconColor: isDark ? "text-orange-400" : "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
          Your Learning Statistics
        </h2>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl p-6 transition-all duration-200 ${
              isDark 
                ? "bg-[#101010] border border-[#222] hover:border-[#333]" 
                : "bg-white border border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-[#aaa]" : "text-[#666]"}`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-xl p-6 ${
          isDark ? "bg-[#101010] border border-[#222]" : "bg-white border border-gray-200"
        }`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
          Weekly Progress
        </h3>
        <div className={`h-64 rounded-lg flex items-center justify-center ${
          isDark ? "bg-[#181818]" : "bg-gray-50"
        }`}>
          <p className={`text-center ${isDark ? "text-[#aaa]" : "text-[#666]"}`}>
            Progress chart will be displayed here
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentStats;