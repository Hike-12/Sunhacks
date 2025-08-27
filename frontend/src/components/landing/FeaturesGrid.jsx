import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  FaBrain,
  FaBook,
  FaChartBar,
  FaRobot,
  FaFilePdf,
  FaVideo,
  FaUsers,
  FaMedal,
} from "react-icons/fa";

const FeaturesGrid = () => {
  const { isDark } = useTheme();

  const features = [
    {
      key: "study-flow",
      title: "Personalized Study Flow",
      description:
        "Adaptive study schedules and task sequencing tailored to you.",
      Icon: FaBrain,
    },
    {
      key: "flashcards",
      title: "Smart Flashcards",
      description: "Auto-generated flashcards from notes, PDFs and textbooks.",
      Icon: FaBook,
    },
    {
      key: "quizzes",
      title: "Interactive Quizzes",
      description: "Short formative quizzes to reinforce retention and recall.",
      Icon: FaChartBar,
    },
    {
      key: "doubt-solver",
      title: "Doubt Solver",
      description: "Ask questions and get concise AI-guided answers and hints.",
      Icon: FaRobot,
    },
    {
      key: "pdf",
      title: "PDF & Notes",
      description: "Upload PDFs and get summaries, highlights and extracts.",
      Icon: FaFilePdf,
    },
    {
      key: "video-gen",
      title: "AI Video Generator",
      description: "Create short explainer videos from your content.",
      Icon: FaVideo,
    },
    {
      key: "community",
      title: "Community",
      description: "Study groups, peer help and shared resources.",
      Icon: FaUsers,
    },
    {
      key: "achievements",
      title: "Achievements",
      description: "Track progress, badges and milestones across courses.",
      Icon: FaMedal,
    },
  ];

  const container = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.36 } },
  };

  const cardBg = isDark
    ? "bg-[#0b0b0b] border border-[#222]"
    : "bg-white border border-gray-100";
  const mutedText = isDark ? "text-[#f8f8f8]/75" : "text-[#080808]/70";
  const titleText = isDark ? "text-[#f8f8f8]" : "text-[#080808]";
  const iconBg = "bg-[#222052]";

  return (
    <section id="features" className="py-12 px-4 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6  ${titleText}`}>
            Core Features
          </h2>
          <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto ${mutedText}`}>
            Practical tools you actually use — study flow, flashcards, quizzes,
            PDF tools and AI helpers. Optimized for phones; bento layout on
            laptops.
          </p>
        </motion.div>

        {/* MOBILE / SMALL SCREENS: stacked/grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4"
        >
          {features.map((f) => {
            const Icon = f.Icon;
            return (
              <motion.article
                key={f.key}
                variants={item}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-lg ${cardBg} relative overflow-hidden`}
                aria-labelledby={`feature-${f.key}-title`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-md flex items-center justify-center ${iconBg} text-white text-lg`}
                    aria-hidden
                  >
                    <Icon />
                  </div>

                  <div className="min-w-0">
                    <h3
                      id={`feature-${f.key}-title`}
                      className={`text-sm sm:text-base font-semibold ${titleText} mb-1`}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${mutedText} leading-snug`}
                    >
                      {f.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* DESKTOP / LAPTOP: Bento layout */}
        <div className="hidden md:block">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-4 grid-rows-2 gap-4 mb-4"
          >
            {/* Big tile: first feature */}
            {features[0] && (
              <motion.article
                variants={item}
                className={`p-6 rounded-lg ${cardBg} relative overflow-hidden md:col-span-2 md:row-span-2`}
                aria-labelledby={`feature-${features[0].key}-title`}
              >
                <div className="flex items-start gap-5 h-full">
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${iconBg} text-white text-2xl`}
                    aria-hidden
                  >
                    {features[0] &&
                      (() => {
                        const Icon = features[0].Icon;
                        return <Icon />;
                      })()}
                  </div>
                  <div className="min-w-0">
                    <h3
                      id={`feature-${features[0].key}-title`}
                      className={`text-lg font-bold ${titleText} mb-2`}
                    >
                      {features[0].title}
                    </h3>
                    <p className={`${mutedText} text-sm`}>
                      {features[0].description}
                    </p>
                  </div>
                </div>
              </motion.article>
            )}

            {features.slice(1, 5).map((f, i) => {
              const Icon = f.Icon;
              const colStart = 3 + (i % 2);
              const rowStart = Math.floor(i / 2) + 1;
              return (
                <motion.article
                  key={f.key}
                  variants={item}
                  className={`p-4 rounded-lg ${cardBg} relative overflow-hidden md:col-start-${colStart} md:row-start-${rowStart}`}
                  aria-labelledby={`feature-${f.key}-title`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${iconBg} text-white text-lg`}
                    >
                      <Icon />
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${titleText}`}>
                        {f.title}
                      </h4>
                      <p className={`text-xs ${mutedText}`}>{f.description}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          {/* remaining features (if any) shown in a compact row below the bento */}
          {features.length > 5 && (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-4"
            >
              {features.slice(5).map((f) => {
                const Icon = f.Icon;
                return (
                  <motion.article
                    key={f.key}
                    variants={item}
                    className={`p-4 rounded-lg ${cardBg} relative overflow-hidden`}
                    aria-labelledby={`feature-${f.key}-title`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${iconBg} text-white text-lg`}
                      >
                        <Icon />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${titleText}`}>
                          {f.title}
                        </h4>
                        <p className={`text-xs ${mutedText}`}>
                          {f.description}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
