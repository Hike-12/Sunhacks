import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUser,
  FaRobot,
  FaSmile,
  FaBolt,
  FaBrain,
  FaHeart,
  FaGavel,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const PERSONALITIES = {
  supportive: {
    description: "Supportive & encouraging",
    icon: <FaHeart className="text-green-400" />,
    color: "bg-green-500/20 text-green-400",
  },
  strict: {
    description: "Strict & no-nonsense",
    icon: <FaGavel className="text-red-400" />,
    color: "bg-red-500/20 text-red-400",
  },
  funny: {
    description: "Witty & humorous",
    icon: <FaSmile className="text-yellow-400" />,
    color: "bg-yellow-500/20 text-yellow-400",
  },
  analytical: {
    description: "Data-driven & methodical",
    icon: <FaBrain className="text-blue-400" />,
    color: "bg-blue-500/20 text-blue-400",
  },
  motivational: {
    description: "Energetic & inspiring",
    icon: <FaBolt className="text-purple-400" />,
    color: "bg-purple-500/20 text-purple-400",
  },
};

const SUBJECTS = [
  {
    key: "general",
    label: "General",
    icon: <FaRobot className="text-blue-400" />,
  },
  { key: "math", label: "Math", icon: <FaBrain className="text-green-400" /> },
  {
    key: "science",
    label: "Science",
    icon: <FaBolt className="text-yellow-400" />,
  },
  // Add more subjects as needed
];

const DoubtSolverChatbot = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [personality, setPersonality] = useState("supportive");
  const [subject, setSubject] = useState("general");
  const [loading, setLoading] = useState(false);
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const messagesEndRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const storedMessages = localStorage.getItem("doubtMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages([
        {
          text: "Hi! I'm your AI doubt-solving assistant. Select a personality and subject, then ask any academic question!",
          sender: "ai",
          personality: "supportive",
          subject: "general",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    const storedPersonality = localStorage.getItem("doubtPersonality");
    if (storedPersonality) setPersonality(storedPersonality);
    const storedSubject = localStorage.getItem("doubtSubject");
    if (storedSubject) setSubject(storedSubject);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("doubtMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("doubtPersonality", personality);
  }, [personality]);

  useEffect(() => {
    localStorage.setItem("doubtSubject", subject);
  }, [subject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      text: question,
      sender: "user",
      personality,
      subject,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/coach`,
        {
          message: question.trim(),
          personality,
          subject,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const aiMessage = {
        text: response.data.answer,
        sender: "ai",
        personality,
        subject,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting solution:", error);
      toast.error("Failed to get solution");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        text: "Hi! I'm your AI doubt-solving assistant. Select a personality and subject, then ask any academic question!",
        sender: "ai",
        personality: "supportive",
        subject: "general",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const changePersonality = (newType) => {
    setPersonality(newType);
    setShowPersonalitySelector(false);
    setMessages((prev) => [
      ...prev,
      {
        text: `Personality changed to: ${PERSONALITIES[newType].description}.`,
        sender: "ai",
        personality: newType,
        subject,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div
        className={`border rounded-xl p-4 mb-4
        ${isDark ? "bg-[#0a0a0a] border-[#222]" : "bg-white border-gray-200"}
      `}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              layoutId="personalityIcon"
              className={`w-10 h-10 rounded-full ${PERSONALITIES[personality].color} flex items-center justify-center text-xl`}
            >
              {PERSONALITIES[personality].icon}
            </motion.div>
            <div>
              <h3
                className={`font-bold text-lg ${
                  isDark ? "text-[#f5f5f7]" : "text-[#080808]"
                }`}
              >
                AI Doubt Solver Assistant
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-[#f5f5f7]/60" : "text-[#080808]/60"
                }`}
              >
                {PERSONALITIES[personality].description}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <motion.button
              onClick={() =>
                setShowPersonalitySelector(!showPersonalitySelector)
              }
              className={`p-2 rounded-lg text-sm ${
                isDark
                  ? "bg-[#1a1a1a] hover:bg-[#222] text-[#f5f5f7]"
                  : "bg-gray-100 hover:bg-gray-200 text-[#080808]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Change Personality
            </motion.button>
            <motion.button
              onClick={clearChat}
              className={`p-2 rounded-lg text-sm ${
                isDark
                  ? "bg-[#1a1a1a] hover:bg-[#222] text-[#f5f5f7]"
                  : "bg-gray-100 hover:bg-gray-200 text-[#080808]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Chat
            </motion.button>
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {SUBJECTS.map((subj) => (
            <button
              key={subj.key}
              className={`px-3 py-1 rounded-full flex items-center gap-1 text-sm border ${
                subject === subj.key
                  ? isDark
                    ? "bg-blue-900 border-blue-400 text-blue-200"
                    : "bg-blue-100 border-blue-400 text-blue-700"
                  : isDark
                  ? "bg-[#181818] border-[#222] text-[#f5f5f7]/70"
                  : "bg-gray-100 border-gray-200 text-[#080808]/70"
              }`}
              onClick={() => setSubject(subj.key)}
            >
              {subj.icon}
              {subj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personality selector modal */}
      {showPersonalitySelector && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPersonalitySelector(false)}
        >
          <motion.div
            className={`border rounded-lg p-4 w-full max-w-md mx-auto
              ${
                isDark
                  ? "bg-[#1a1a1a] border-[#222] text-[#f5f5f7]"
                  : "bg-white border-gray-200 text-[#080808]"
              }
            `}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-[#f5f5f7]/60">
                Select assistant personality:
              </p>
              <motion.button
                onClick={() => setShowPersonalitySelector(false)}
                className="p-1 rounded-full hover:bg-[#333]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(PERSONALITIES).map(([type, details]) => (
                <motion.button
                  key={type}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#222] text-left ${
                    personality === type ? "border border-[#A2BFFE]" : ""
                  }`}
                  onClick={() => changePersonality(type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    layoutId={personality === type ? "personalityIcon" : null}
                    className={`w-10 h-10 rounded-full ${details.color} flex items-center justify-center text-xl`}
                  >
                    {details.icon}
                  </motion.div>
                  <div>
                    <p className="font-medium">{details.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto border rounded-xl p-4 mb-4
        ${isDark ? "bg-[#0a0a0a] border-[#222]" : "bg-white border-gray-200"}
      `}
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-lg ${
                  msg.sender === "user"
                    ? isDark
                      ? "bg-blue-900 text-blue-100"
                      : "bg-[#A2BFFE] text-[#080808]"
                    : msg.personality
                    ? `${PERSONALITIES[msg.personality].color} bg-opacity-20`
                    : isDark
                    ? "bg-[#181818] text-[#f5f5f7]"
                    : "bg-gray-100 text-[#080808]"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-xs mt-1 opacity-70 ${
                    isDark ? "text-[#f5f5f7]/70" : "text-[#080808]/70"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className={`max-w-[90%] p-3 rounded-lg ${
                  isDark
                    ? "bg-[#181818] text-[#f5f5f7]"
                    : "bg-gray-100 text-[#080808]"
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className={`border rounded-xl p-4
          ${isDark ? "bg-[#0a0a0a] border-[#222]" : "bg-white border-gray-200"}
        `}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your academic doubt here..."
            className={`flex-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2
              ${
                isDark
                  ? "bg-[#1a1a1a] text-[#f5f5f7] focus:ring-blue-900"
                  : "bg-gray-100 text-[#080808] focus:ring-[#A2BFFE]/50"
              }
            `}
            disabled={loading}
          />
          <motion.button
            type="submit"
            className={`px-4 py-2 rounded-lg font-bold disabled:opacity-50
              ${
                isDark
                  ? "bg-blue-900 hover:bg-blue-800 text-blue-100"
                  : "bg-[#A2BFFE] hover:bg-[#91AFFE] text-[#080808]"
              }
            `}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            disabled={loading || !question.trim()}
          >
            Send
          </motion.button>
        </div>
        <p
          className={`text-xs mt-2 ${
            isDark ? "text-[#f5f5f7]/40" : "text-[#080808]/40"
          }`}
        >
          Your AI assistant uses Groq to solve your academic doubts.
        </p>
      </form>
    </div>
  );
};

export default DoubtSolverChatbot;
