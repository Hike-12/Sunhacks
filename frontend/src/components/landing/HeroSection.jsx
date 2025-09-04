import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("study-flow");
  const navigate = useNavigate();

  const tabs = [
    {
      id: "study-flow",
      label: "Flow",
      image: "/StudyFlow.png",
    },
    { id: "flashcards", label: "Cards  ", image: "/FlashCards.png" },
    { id: "quizzes", label: "Quizzes", image: "/Quizzes.png" },
    { id: "dashboard", label: "Dashboard", image: "/dashboard.png" },
  ];

  return (
    <section className="pt-32 pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 mt-8"
      >
        <h1
          className={`
            text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight mx-auto
            max-w-3xl md:max-w-full md:whitespace-nowrap
            ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
          `}
        >
          Revolutionize{" "}
          <span
            className={`bg-clip-text text-transparent inline ${
              isDark
                ? "bg-gradient-to-r from-[#4a4494] to-[#4a4494]/70"
                : "bg-gradient-to-r from-[#222052] to-[#222052]/70"
            }`}
          >
            Learning
          </span>{" "}
          with StudyAid
        </h1>
        <p
          className={`
            text-sm sm:text-base md:text-lg mb-6 max-w-2xl mx-auto leading-relaxed
            ${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}
          `}
        >
          Turn your notes, PDFs, and books into AI-powered study guides,
          flashcards, quizzes, and summaries. Personalized, multilingual, and
          interactive – all in one platform.
        </p>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mb-10 w-full px-2">
          {/* Primary: phone = full width + rounded-md, desktop = auto width + rounded-md */}
          <motion.button
            whileHover={{ translateY: -3 }}
            whileTap={{ translateY: 0 }}
            className="w-full sm:w-auto relative inline-flex items-center justify-center transition-transform duration-200 focus:outline-none"
            onClick={() => navigate("/signup")}
          >
            <span
              className={`relative z-10 block w-full text-center px-12 py-3 text-sm font-medium
        rounded-md tracking-wider
        ${isDark ? "bg-[#222052] text-white" : "bg-[#222052] text-white"}`}
              style={{
                boxShadow: isDark
                  ? "0 8px 22px rgba(28,24,72,0.55)"
                  : "0 8px 22px rgba(34,34,60,0.12)",
              }}
            >
              Get Started
            </span>
          </motion.button>

          <motion.button
            whileHover={{ translateY: -2 }}
            whileTap={{ translateY: 0 }}
            // onClick={handleInstallClick}
            className="w-full sm:w-auto relative inline-flex items-center justify-center transition-transform duration-200 focus:outline-none"
          >
            <span
              className={`relative z-10 block w-full text-center px-12 py-3 text-sm font-medium
        rounded-md tracking-wider
        ${
          isDark
            ? "bg-transparent text-[#dcd6ff] border border-[#3b3760]"
            : "bg-white text-[#222052] border border-[#222052]"
        }`}
              style={{
                boxShadow: isDark
                  ? "0 6px 18px rgba(0,0,0,0.45)"
                  : "0 6px 18px rgba(34,34,60,0.06)",
              }}
            >
              Install App
            </span>
          </motion.button>
        </div>
      </motion.div>
      {/* Demo Container */}
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div
            className={`absolute -inset-1 rounded-2xl ${
              isDark
                ? "bg-gradient-to-r from-[#4a4494] via-[#4a4494]/50 to-[#4a4494] opacity-30"
                : "bg-gradient-to-r from-[#222052] via-[#222052]/50 to-[#222052] opacity-30"
            }`}
          ></div>

          <div
            className={`
              relative rounded-2xl overflow-hidden
              ${
                isDark
                  ? "bg-[#080808] border border-[#f8f8f8]/20"
                  : "bg-[#f8f8f8] border border-[#080808]/20"
              }
            `}
          >
            {/* Tab Navigation */}
            <div
              className={`
                flex space-x-1 p-2 border-b
                ${isDark ? "border-[#f8f8f8]/20" : "border-[#080808]/20"}
                relative justify-between px-2 md:px-10
              `}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${
          activeTab === tab.id
            ? isDark
              ? "text-[#f8f8f8]"
              : "text-[#f8f8f8]"
            : isDark
            ? "text-[#f8f8f8]/70 hover:text-[#f8f8f8] hover:bg-[#f8f8f8]/10"
            : "text-[#080808]/70 hover:text-[#080808] hover:bg-[#080808]/10"
        }
      `}
                  style={{ zIndex: 1 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-highlight"
                      className={`absolute inset-0 rounded-lg ${
                        isDark ? "bg-[#4a4494]" : "bg-[#222052]"
                      }`}
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-2">
              <motion.div
                key={activeTab}
                layoutId="demo-tab-image"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={`aspect-video rounded-lg overflow-hidden ${
                  isDark
                    ? "bg-gradient-to-br from-[#4a4494]/20 to-[#4a4494]/10"
                    : "bg-gradient-to-br from-[#222052]/20 to-[#222052]/10"
                }`}
              >
                <img
                  src={tabs.find((tab) => tab.id === activeTab)?.image}
                  alt={`${activeTab} preview`}
                  className="w-full h-full object-fill"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
