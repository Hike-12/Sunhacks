import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import AchievementCard from "./AchievementCard";
import { useTheme } from "../context/ThemeContext";

const MyAchievements = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchMyAchievements();
  }, []);

  const fetchMyAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/achievements/unlocked`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
        setAchievementStats(data.stats);
      } else {
        toast.error("Failed to load achievements");
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    selectedFilter === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedFilter);

  const categories = [
    "all",
    "beginner",
    "completion",
    "variety",
    "time",
    "perfection",
    "quiz"
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#030303] text-[#f8f8f8]" : "bg-[#f8f8f8] text-[#080808]"}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? "border-[#4ade80]" : "border-[#7c3aed]"}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "text-[#f8f8f8]" : "bg-[#f8f8f8] text-[#080808]"} py-8`}>
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">🏆 My Achievements</h1>
            <p className={isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}>
              You've unlocked {achievements.length} achievements • {achievementStats.totalPoints || 0} points earned
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/achievements">
              <motion.button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition
                  ${isDark
                    ? "bg-[#222052] border-[#f8f8f8]/20 hover:border-[#4ade80]/30 text-[#f8f8f8]"
                    : "bg-[#ece9ff] border-[#7c3aed]/20 hover:border-[#7c3aed]/40 text-[#080808]"}
                `}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🎯 View All Achievements
              </motion.button>
            </Link>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">No Achievements Yet</h2>
            <p className={isDark ? "text-[#f8f8f8]/60 mb-6" : "text-[#080808]/60 mb-6"}>
              Complete your first course to start earning achievements!
            </p>
            <Link to="/student-dashboard">
              <motion.button
                className={`px-6 py-3 rounded-lg font-semibold transition
                  ${isDark
                    ? "bg-[#4ade80] text-[#030303] hover:bg-[#22c55e]"
                    : "bg-[#7c3aed] text-white hover:bg-[#5b21b6]"}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Courses
              </motion.button>
            </Link>
          </div>
        ) : (
          <>
            <div className={`rounded-xl p-6 mb-6 border
              ${isDark
                ? "bg-[#222052] border-[#f8f8f8]/20"
                : "bg-[#ece9ff] border-[#7c3aed]/20"}
            `}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">
                  Your Unlocked Achievements
                </h2>
                <div className={isDark ? "bg-[#4ade80]/10 rounded-full px-4 py-1" : "bg-[#7c3aed]/10 rounded-full px-4 py-1"}>
                  <span className={`text-sm font-medium ${isDark ? "text-[#4ade80]" : "text-[#7c3aed]"}`}>
                    {achievementStats.totalPoints || 0} Points Earned
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {categories.map((category) => {
                  const count = category === "all" 
                    ? achievements.length 
                    : achievements.filter(a => a.category === category).length;

                  return (
                    <motion.button
                      key={category}
                      onClick={() => setSelectedFilter(category)}
                      className={`px-4 py-2 text-sm rounded-lg capitalize transition
                        ${selectedFilter === category
                          ? isDark
                            ? "bg-[#4ade80] text-[#030303]"
                            : "bg-[#7c3aed] text-white"
                          : isDark
                            ? "bg-[#030303] hover:bg-[#222052] text-[#f8f8f8]/70"
                            : "bg-[#f8f8f8] hover:bg-[#ece9ff] text-[#080808]/70"}
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category} ({count})
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredAchievements.map((achievement) => {
                const achievementForCard = {
                  ...achievement,
                  unlocked: true,
                  progress: 100,
                  total: 100
                };
                return (
                  <AchievementCard key={achievement.id} achievement={achievementForCard} />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MyAchievements;