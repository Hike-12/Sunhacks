import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaChartLine,
  FaTrophy,
  FaRedo,
  FaClock,
  FaBullseye,
  FaRoute,
  FaPlay,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaLightbulb,
  FaCalendarAlt,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";

const PersonalizedStudyFlow = () => {
  const { isDark } = useTheme();
  const [studyProfile, setStudyProfile] = useState({
    weakAreas: [],
    strongAreas: [],
    studyGoal: "",
    dailyGoal: 30,
    preferredDifficulty: "medium",
  });
  const [quizResults, setQuizResults] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const savedProfile = localStorage.getItem("studyProfile");
    const savedResults = localStorage.getItem("quizResults");
    const savedPlan = localStorage.getItem("studyPlan");

    if (savedProfile) {
      setStudyProfile(JSON.parse(savedProfile));
    }
    if (savedResults) {
      setQuizResults(JSON.parse(savedResults));
    }
    if (savedPlan) {
      setStudyPlan(JSON.parse(savedPlan));
    }
  };

  const generatePersonalizedPlan = async () => {
    setLoading(true);
    try {
      const weakAreas = analyzeQuizResults(quizResults);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
          import.meta.env.VITE_GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Create a personalized study plan based on these weak areas: ${weakAreas.join(
                      ", "
                    )}. 
              Study goal: ${studyProfile.studyGoal}. 
              Daily time available: ${studyProfile.dailyGoal} minutes.
              Preferred difficulty: ${studyProfile.preferredDifficulty}.
              
              Format as JSON with:
              {
                "dailyPlan": [
                  {
                    "day": "Day 1",
                    "topics": ["topic1", "topic2"],
                    "duration": 30,
                    "activities": ["flashcard review", "practice quiz"],
                    "focusArea": "weak area to focus on"
                  }
                ],
                "weeklyGoals": ["goal1", "goal2"],
                "studyTips": ["tip1", "tip2"],
                "estimatedCompletion": "timeframe"
              }`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0]);
        setStudyPlan(plan);
        localStorage.setItem("studyPlan", JSON.stringify(plan));
        toast.success("Personalized study plan generated!");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast.error("Failed to generate study plan");
    } finally {
      setLoading(false);
    }
  };

  const analyzeQuizResults = (results) => {
    const topicScores = {};

    results.forEach((result) => {
      result.questions.forEach((question) => {
        const topic = question.topic || "General";
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 };
        }
        topicScores[topic].total += 1;
        if (question.userAnswer === question.correctAnswer) {
          topicScores[topic].correct += 1;
        }
      });
    });

    const weakAreas = Object.entries(topicScores)
      .filter(([topic, scores]) => scores.correct / scores.total < 0.7)
      .map(([topic]) => topic);

    return weakAreas;
  };

  const startStudySession = (dayPlan) => {
    setCurrentSession({
      ...dayPlan,
      startTime: new Date(),
      completedActivities: [],
      currentActivity: 0,
    });
  };

  const completeActivity = (activityIndex) => {
    setCurrentSession((prev) => ({
      ...prev,
      completedActivities: [...prev.completedActivities, activityIndex],
      currentActivity: activityIndex + 1,
    }));

    if (activityIndex === currentSession.activities.length - 1) {
      toast.success("Study session completed! Great job!");
      setCurrentSession(null);

      const sessionData = {
        date: new Date().toISOString(),
        duration: currentSession.duration,
        focusArea: currentSession.focusArea,
        completed: true,
      };

      const studySessions = JSON.parse(
        localStorage.getItem("studySessions") || "[]"
      );
      studySessions.push(sessionData);
      localStorage.setItem("studySessions", JSON.stringify(studySessions));
    }
  };

  const renderProfileSetup = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FaBullseye
              className={`text-4xl mr-3 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <h2
              className={`text-3xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              Set Up Your Study Profile
            </h2>
          </div>
          <p
            className={`text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-8`}
          >
            Tell us about your learning goals to create a personalized study
            plan
          </p>
        </div>

        <div
          className={`p-8 rounded-lg border ${
            isDark
              ? "bg-[#18182b] border-[#a78bfa]"
              : "bg-[#ece9ff] border-[#7c3aed]"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Study Goal
              </label>
              <input
                type="text"
                value={studyProfile.studyGoal}
                onChange={(e) =>
                  setStudyProfile((prev) => ({
                    ...prev,
                    studyGoal: e.target.value,
                  }))
                }
                placeholder="e.g., Master calculus, Prepare for MCAT"
                className={`w-full px-4 py-3 rounded-lg border transition ${
                  isDark
                    ? "bg-[#1e1e3a] border-[#333] text-[#f8f8f8] placeholder-gray-500"
                    : "bg-white border-gray-300 text-[#080808] placeholder-gray-400"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Daily Study Time (minutes)
              </label>
              <input
                type="number"
                value={studyProfile.dailyGoal}
                onChange={(e) =>
                  setStudyProfile((prev) => ({
                    ...prev,
                    dailyGoal: parseInt(e.target.value),
                  }))
                }
                className={`w-full px-4 py-3 rounded-lg border transition ${
                  isDark
                    ? "bg-[#1e1e3a] border-[#333] text-[#f8f8f8]"
                    : "bg-white border-gray-300 text-[#080808]"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Preferred Difficulty
              </label>
              <select
                value={studyProfile.preferredDifficulty}
                onChange={(e) =>
                  setStudyProfile((prev) => ({
                    ...prev,
                    preferredDifficulty: e.target.value,
                  }))
                }
                className={`w-full px-4 py-3 rounded-lg border transition ${
                  isDark
                    ? "bg-[#1e1e3a] border-[#333] text-[#f8f8f8]"
                    : "bg-white border-gray-300 text-[#080808]"
                }`}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={() => {
                localStorage.setItem(
                  "studyProfile",
                  JSON.stringify(studyProfile)
                );
                toast.success("Profile saved!");
              }}
              className={`px-6 py-3 rounded-lg transition ${
                isDark
                  ? "bg-[#1e1e3a] hover:bg-[#262650] border border-[#a78bfa] text-[#f8f8f8]"
                  : "bg-[#e0d7ff] hover:bg-[#d4c7ff] border border-[#7c3aed] text-[#080808]"
              }`}
            >
              Save Profile
            </button>
            <button
              onClick={generatePersonalizedPlan}
              disabled={loading || !studyProfile.studyGoal}
              className={`px-6 py-3 rounded-lg transition disabled:opacity-50 flex items-center ${
                isDark
                  ? "bg-[#18182b] hover:bg-[#1e1e3a] border border-[#a78bfa] text-[#f8f8f8]"
                  : "bg-[#ece9ff] hover:bg-[#e0d7ff] border border-[#7c3aed] text-[#080808]"
              }`}
            >
              <FaBrain className="mr-2" />
              {loading ? "Generating..." : "Generate Study Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudyPlan = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaCalendarAlt
              className={`text-2xl mr-3 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              Your Personalized Study Plan
            </h2>
          </div>
          <button
            onClick={generatePersonalizedPlan}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              isDark
                ? "bg-[#18182b] hover:bg-[#1e1e3a] border border-[#a78bfa] text-[#f8f8f8]"
                : "bg-[#ece9ff] hover:bg-[#e0d7ff] border border-[#7c3aed] text-[#080808]"
            }`}
          >
            <FaRedo />
            <span>Regenerate</span>
          </button>
        </div>

        {studyPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                Daily Study Schedule
              </h3>
              <div className="space-y-4">
                {studyPlan.dailyPlan.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg border ${
                      isDark
                        ? "bg-[#18182b] border-[#a78bfa]"
                        : "bg-[#ece9ff] border-[#7c3aed]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4
                        className={`font-medium text-lg ${
                          isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                        }`}
                      >
                        {day.day}
                      </h4>
                      <button
                        onClick={() => startStudySession(day)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition ${
                          isDark
                            ? "bg-green-700 hover:bg-green-600 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        <FaPlay />
                        <span>Start</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span
                          className={`font-medium ${
                            isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                          }`}
                        >
                          Focus:
                        </span>
                        <p
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {day.focusArea}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`font-medium ${
                            isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                          }`}
                        >
                          Duration:
                        </span>
                        <p
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {day.duration} minutes
                        </p>
                      </div>
                      <div>
                        <span
                          className={`font-medium ${
                            isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                          }`}
                        >
                          Topics:
                        </span>
                        <p
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {day.topics.join(", ")}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`font-medium ${
                            isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                          }`}
                        >
                          Activities:
                        </span>
                        <p
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {day.activities.join(", ")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`p-6 rounded-lg border ${
                  isDark
                    ? "bg-[#18182b] border-[#a78bfa]"
                    : "bg-[#ece9ff] border-[#7c3aed]"
                }`}
              >
                <div className="flex items-center mb-3">
                  <FaBullseye
                    className={`mr-2 ${
                      isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                    }`}
                  />
                  <h4
                    className={`font-semibold ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Weekly Goals
                  </h4>
                </div>
                <ul className="space-y-2">
                  {studyPlan.weeklyGoals.map((goal, index) => (
                    <li
                      key={index}
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      • {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`p-6 rounded-lg border ${
                  isDark
                    ? "bg-[#18182b] border-[#a78bfa]"
                    : "bg-[#ece9ff] border-[#7c3aed]"
                }`}
              >
                <div className="flex items-center mb-3">
                  <FaLightbulb
                    className={`mr-2 ${
                      isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                    }`}
                  />
                  <h4
                    className={`font-semibold ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Study Tips
                  </h4>
                </div>
                <ul className="space-y-2">
                  {studyPlan.studyTips.map((tip, index) => (
                    <li
                      key={index}
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`p-6 rounded-lg border ${
                  isDark
                    ? "bg-[#18182b] border-[#a78bfa]"
                    : "bg-[#ece9ff] border-[#7c3aed]"
                }`}
              >
                <div className="flex items-center mb-3">
                  <FaClock
                    className={`mr-2 ${
                      isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                    }`}
                  />
                  <h4
                    className={`font-semibold ${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    Estimated Completion
                  </h4>
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {studyPlan.estimatedCompletion}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderActiveSession = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaRoute
              className={`text-3xl mr-3 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              Active Study Session
            </h2>
          </div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Focus: {currentSession.focusArea}
          </p>
        </div>

        <div
          className={`p-8 rounded-lg border ${
            isDark
              ? "bg-[#18182b] border-[#a78bfa]"
              : "bg-[#ece9ff] border-[#7c3aed]"
          }`}
        >
          <div className="text-center mb-6">
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              {currentSession.day}
            </h3>
          </div>

          <div className="space-y-4">
            {currentSession.activities.map((activity, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex justify-between items-center transition ${
                  currentSession.completedActivities.includes(index)
                    ? isDark
                      ? "bg-green-900/30 border-green-600"
                      : "bg-green-100 border-green-300"
                    : index === currentSession.currentActivity
                    ? isDark
                      ? "bg-blue-900/30 border-blue-600"
                      : "bg-blue-100 border-blue-300"
                    : isDark
                    ? "bg-[#1e1e3a] border-[#333]"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span
                  className={`${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}
                >
                  {activity}
                </span>

                {currentSession.completedActivities.includes(index) ? (
                  <FaTrophy className="text-yellow-500 text-lg" />
                ) : index === currentSession.currentActivity ? (
                  <button
                    onClick={() => completeActivity(index)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                  >
                    <FaCheckCircle className="mr-1" />
                    Complete
                  </button>
                ) : (
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentSession(null)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mx-auto"
            >
              <FaTimes className="mr-2" />
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <AnimatePresence mode="wait">
        {currentSession ? (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {renderActiveSession()}
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!studyPlan ? renderProfileSetup() : renderStudyPlan()}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            className={`p-8 rounded-lg ${
              isDark ? "bg-[#18182b]" : "bg-white"
            } text-center`}
          >
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={`${isDark ? "text-white" : "text-gray-900"}`}>
              Generating your personalized study plan...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PersonalizedStudyFlow;
