import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaFire, FaCheckCircle, FaStar, FaClock, FaMedal, FaBookOpen } from "react-icons/fa";

const categoryColors = {
  beginner: "#4ade80",    // Green
  streak: "#f97316",      // Orange
  completion: "#3b82f6",  // Blue
  variety: "#8b5cf6",     // Purple
  time: "#ec4899",        // Pink
  perfection: "#eab308",  // Yellow
};

const fakeAchievements = [
  {
    _id: "1",
    name: "Getting Started",
    description: "Complete your first course.",
    icon: <FaBookOpen />,
    unlocked: true,
    progress: 1,
    total: 1,
    category: "beginner"
  },
  {
    _id: "2",
    name: "Streak Master",
    description: "Study for 7 days in a row.",
    icon: <FaFire />,
    unlocked: false,
    progress: 3,
    total: 7,
    category: "streak"
  },
  {
    _id: "3",
    name: "Course Completer",
    description: "Complete 5 courses.",
    icon: <FaCheckCircle />,
    unlocked: false,
    progress: 2,
    total: 5,
    category: "completion"
  },
  {
    _id: "4",
    name: "Variety Learner",
    description: "Finish courses in 3 different categories.",
    icon: <FaStar />,
    unlocked: true,
    progress: 3,
    total: 3,
    category: "variety"
  },
  {
    _id: "5",
    name: "Time Keeper",
    description: "Study for 10 hours total.",
    icon: <FaClock />,
    unlocked: false,
    progress: 6,
    total: 10,
    category: "time"
  },
  {
    _id: "6",
    name: "Perfectionist",
    description: "Score 100% in any quiz.",
    icon: <FaMedal />,
    unlocked: true,
    progress: 1,
    total: 1,
    category: "perfection"
  }
];

const AchievementCard = ({ achievement }) => {
  const { name, description, icon, unlocked, progress, total, category } = achievement;
  const progressPercentage = Math.round((progress / total) * 100);
  const categoryColor = categoryColors[category] || "#A2BFFE";

  return (
    <motion.div
      className={`border rounded-lg p-5 flex flex-col items-center text-center ${
        unlocked
          ? "border-[#A2BFFE]/30 bg-[#A2BFFE]/5"
          : "border-[#222] bg-[#0a0a0a]/50"
      }`}
      whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(162, 191, 254, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 text-3xl`}
        style={{
          backgroundColor: unlocked ? `${categoryColor}20` : undefined,
          color: unlocked ? categoryColor : "#666",
          filter: unlocked ? undefined : "grayscale(1)"
        }}
      >
        {icon}
      </div>
      <div className="space-y-2 mb-3">
        <h3 className={`font-bold text-base ${!unlocked && "text-[#f5f5f7]/60"}`}>{name}</h3>
        <p className="text-xs text-[#f5f5f7]/60">{description}</p>
      </div>
      <div
        className={`text-xs rounded-full px-3 py-1 mb-4 capitalize`}
        style={{
          backgroundColor: unlocked ? `${categoryColor}15` : undefined,
          color: unlocked ? categoryColor : "#f5f5f7"
        }}
      >
        {category}
      </div>
      <div className="w-full">
        <div className="flex justify-between text-xs text-[#f5f5f7]/60 mb-1">
          <span>{progress} / {total}</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-[#111] rounded-full h-2">
          <div
            className="rounded-full h-2"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: unlocked ? categoryColor : "#444"
            }}
          />
        </div>
      </div>
      <div
        className={`mt-4 text-xs px-3 py-1 rounded-full`}
        style={{
          backgroundColor: unlocked ? `${categoryColor}15` : "#222",
          color: unlocked ? categoryColor : "#f5f5f7"
        }}
      >
        {unlocked ? "Unlocked" : "Locked"}
      </div>
    </motion.div>
  );
};

const AchievementSection = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use fake achievements for demo
    setTimeout(() => {
      setAchievements(fakeAchievements);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span>Loading achievements...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">
        <FaMedal className="inline-block mb-1 text-yellow-500" /> Achievements
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {achievements.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No achievements yet.</div>
        ) : (
          achievements.map((achievement) => (
            <AchievementCard key={achievement._id} achievement={achievement} />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementSection;