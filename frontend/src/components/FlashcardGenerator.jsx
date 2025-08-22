import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUpload,
  FaDownload,
  FaEye,
  FaBrain,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaFilePdf,
  FaLightbulb,
  FaQuestionCircle,
  FaPlay,
  FaSpinner,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";

const FlashcardGenerator = () => {
  const { isDark } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    needsReview: [],
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size should be less than 20MB");
      return;
    }

    setPdfFile(file);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL || ""}/api/tools/parse-pdf`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        }
      );
      const json = await resp.json();
      if (resp.ok) {
        setExtractedText(json.text || "");
        toast.success("PDF text extracted on server");
      } else {
        console.error(json);
        toast.error(json.error || "Server failed to extract text");
      }
    } catch (err) {
      console.error("Upload/parse error:", err);
      toast.error("Failed to upload or parse PDF");
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (file) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      setExtractedText(fullText);
      toast.success("PDF text extracted successfully!");
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Failed to extract text from PDF");
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!extractedText) {
      toast.error("Please upload and extract text from a PDF first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
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
                    text: `Create 10-15 flashcards from this text. Format as JSON array with objects containing "question" and "answer" fields. Focus on key concepts, definitions, and important facts. Text: ${extractedText.slice(
                      0,
                      4000
                    )}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcardsData = JSON.parse(jsonMatch[0]);
        setFlashcards(flashcardsData);
        setActiveTab("flashcards");
        toast.success(`Generated ${flashcardsData.length} flashcards!`);
      } else {
        throw new Error("Could not parse flashcards from response");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  const generateMCQs = async () => {
    if (!extractedText) {
      toast.error("Please upload and extract text from a PDF first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
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
                    text: `Create 8-12 multiple choice questions from this text. Format as JSON array with objects containing "question", "options" (array of 4 choices), and "correctAnswer" (index 0-3). Text: ${extractedText.slice(
                      0,
                      4000
                    )}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const mcqsData = JSON.parse(jsonMatch[0]);
        setMcqs(mcqsData);
        setActiveTab("mcqs");
        toast.success(`Generated ${mcqsData.length} MCQs!`);
      } else {
        throw new Error("Could not parse MCQs from response");
      }
    } catch (error) {
      console.error("Error generating MCQs:", error);
      toast.error("Failed to generate MCQs");
    } finally {
      setLoading(false);
    }
  };

  const startStudyMode = () => {
    setStudyMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, incorrect: 0, needsReview: [] });
  };

  const handleCardResponse = (isCorrect) => {
    const newStats = { ...studyStats };
    if (isCorrect) {
      newStats.correct += 1;
    } else {
      newStats.incorrect += 1;
      newStats.needsReview.push(currentCardIndex);
    }
    setStudyStats(newStats);

    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setStudyMode(false);
      toast.success(
        `Study session complete! Correct: ${newStats.correct}, Needs review: ${newStats.needsReview.length}`
      );
    }
  };

  const toggleFlipCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const exportFlashcards = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "flashcards.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const renderUploadTab = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FaBrain
              className={`text-4xl mr-3 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <h2
              className={`text-3xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              Smart Study Material Generator
            </h2>
          </div>
          <p
            className={`text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-8`}
          >
            Upload any PDF and generate flashcards & MCQs automatically using AI
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDark
              ? "border-[#a78bfa]/30 hover:border-[#a78bfa]/50 bg-[#18182b]/30"
              : "border-[#7c3aed]/30 hover:border-[#7c3aed]/50 bg-[#ece9ff]/30"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <FaFilePdf
              className={`mx-auto text-6xl mb-4 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            {pdfFile ? (
              <div>
                <p
                  className={`font-medium text-lg ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  {pdfFile.name}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p
                  className={`font-medium text-lg ${
                    isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                  }`}
                >
                  Click to upload PDF
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Maximum file size: 10MB
                </p>
              </div>
            )}
          </label>
        </div>

        {extractedText && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateFlashcards}
              disabled={loading}
              className={`flex items-center justify-center space-x-3 p-4 rounded-lg transition disabled:opacity-50 ${
                isDark
                  ? "bg-[#18182b] hover:bg-[#1e1e3a] border border-[#a78bfa] text-[#f8f8f8]"
                  : "bg-[#ece9ff] hover:bg-[#e0d7ff] border border-[#7c3aed] text-[#080808]"
              }`}
            >
              <FaLightbulb />
              <span className="font-medium">
                {loading ? "Generating..." : "Generate Flashcards"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateMCQs}
              disabled={loading}
              className={`flex items-center justify-center space-x-3 p-4 rounded-lg transition disabled:opacity-50 ${
                isDark
                  ? "bg-[#18182b] hover:bg-[#1e1e3a] border border-[#a78bfa] text-[#f8f8f8]"
                  : "bg-[#ece9ff] hover:bg-[#e0d7ff] border border-[#7c3aed] text-[#080808]"
              }`}
            >
              <FaQuestionCircle />
              <span className="font-medium">
                {loading ? "Generating..." : "Generate MCQs"}
              </span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFlashcardsTab = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaLightbulb
              className={`text-2xl mr-3 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              Flashcards ({flashcards.length})
            </h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={startStudyMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isDark
                  ? "bg-[#18182b] hover:bg-[#1e1e3a] border border-[#a78bfa] text-[#f8f8f8]"
                  : "bg-[#ece9ff] hover:bg-[#e0d7ff] border border-[#7c3aed] text-[#080808]"
              }`}
            >
              <FaPlay />
              <span>Study Mode</span>
            </button>
            <button
              onClick={exportFlashcards}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isDark
                  ? "bg-[#181818] hover:bg-[#222] text-gray-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              <FaDownload />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-64 cursor-pointer"
              onClick={() => toggleFlipCard(index)}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front of card - Question */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-lg border shadow-lg flex flex-col justify-center p-6 ${
                    isDark
                      ? "bg-[#18182b] border-[#a78bfa] text-[#f8f8f8]"
                      : "bg-[#ece9ff] border-[#7c3aed] text-[#080808]"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex items-center mb-4">
                    <FaQuestionCircle
                      className={`mr-2 ${
                        isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
                      }`}
                    />
                    <span className="text-sm font-medium">Question</span>
                  </div>
                  <p className="text-base">{card.question}</p>
                  <div className="mt-4 text-center">
                    <span className="text-xs opacity-60">
                      Click to reveal answer
                    </span>
                  </div>
                </div>

                {/* Back of card - Answer */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-lg border shadow-lg flex flex-col justify-center p-6 ${
                    isDark
                      ? "bg-[#1e1e3a] border-[#a78bfa] text-[#f8f8f8]"
                      : "bg-[#e0d7ff] border-[#7c3aed] text-[#080808]"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="flex items-center mb-4">
                    <FaCheckCircle
                      className={`mr-2 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <span className="text-sm font-medium">Answer</span>
                  </div>
                  <p className="text-base">{card.answer}</p>
                  <div className="mt-4 text-center">
                    <span className="text-xs opacity-60">
                      Click to see question
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudyMode = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaBrain
              className={`text-3xl mr-3 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              Active Recall Study Session
            </h2>
          </div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Card {currentCardIndex + 1} of {flashcards.length}
          </p>
          <div
            className={`w-full rounded-full h-3 mt-4 ${
              isDark ? "bg-[#222]" : "bg-gray-200"
            }`}
          >
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isDark ? "bg-[#a78bfa]" : "bg-[#7c3aed]"
              }`}
              style={{
                width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`p-8 rounded-lg border min-h-[350px] flex flex-col justify-center ${
            isDark
              ? "bg-[#18182b] border-[#a78bfa]"
              : "bg-[#ece9ff] border-[#7c3aed]"
          }`}
        >
          <div className="text-center mb-6">
            <p
              className={`text-lg mb-6 ${
                isDark ? "text-[#f8f8f8]" : "text-[#080808]"
              }`}
            >
              {flashcards[currentCardIndex]?.question}
            </p>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className={`px-6 py-3 rounded-lg transition flex items-center mx-auto ${
                  isDark
                    ? "bg-[#1e1e3a] hover:bg-[#262650] border border-[#a78bfa] text-[#f8f8f8]"
                    : "bg-[#e0d7ff] hover:bg-[#d4c7ff] border border-[#7c3aed] text-[#080808]"
                }`}
              >
                <FaEye className="mr-2" />
                Reveal Answer
              </button>
            ) : (
              <div className="space-y-6">
                <div
                  className={`p-4 rounded-lg ${
                    isDark ? "bg-[#1e1e3a]" : "bg-[#e0d7ff]"
                  }`}
                >
                  <p
                    className={`${
                      isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                    }`}
                  >
                    {flashcards[currentCardIndex]?.answer}
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleCardResponse(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <FaTimesCircle />
                    <span>Need Review</span>
                  </button>
                  <button
                    onClick={() => handleCardResponse(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FaCheckCircle />
                    <span>Got It!</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p
            className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}
          >
            Correct: {studyStats.correct} | Need Review:{" "}
            {studyStats.needsReview.length}
          </p>
        </div>
      </div>
    </div>
  );

  const renderMCQsTab = () => (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center">
          <FaQuestionCircle
            className={`text-2xl mr-3 ${
              isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
            }`}
          />
          <h2
            className={`text-2xl font-bold ${
              isDark ? "text-[#f8f8f8]" : "text-[#080808]"
            }`}
          >
            Multiple Choice Questions ({mcqs.length})
          </h2>
        </div>

        <div className="space-y-6">
          {mcqs.map((mcq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${
                isDark
                  ? "bg-[#18182b] border-[#a78bfa]"
                  : "bg-[#ece9ff] border-[#7c3aed]"
              }`}
            >
              <h3
                className={`font-medium mb-4 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#080808]"
                }`}
              >
                {index + 1}. {mcq.question}
              </h3>

              <div className="space-y-3">
                {mcq.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg border transition-colors ${
                      optionIndex === mcq.correctAnswer
                        ? isDark
                          ? "bg-green-900/30 border-green-600 text-green-400"
                          : "bg-green-100 border-green-300 text-green-700"
                        : isDark
                        ? "bg-[#1e1e3a] border-[#333] text-gray-300"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </span>
                      {optionIndex === mcq.correctAnswer && (
                        <FaCheckCircle className="text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${isDark ? "bg-[#101010]" : "bg-white"}`}>
      <AnimatePresence mode="wait">
        {studyMode ? (
          <motion.div
            key="study-mode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {renderStudyMode()}
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Tab Navigation */}
            <div
              className={`border-b px-6 ${
                isDark ? "border-[#222]" : "border-gray-200"
              }`}
            >
              <div className="flex space-x-8">
                {[
                  { id: "upload", label: "Upload PDF", icon: FaFilePdf },
                  {
                    id: "flashcards",
                    label: `Flashcards ${
                      flashcards.length > 0 ? `(${flashcards.length})` : ""
                    }`,
                    icon: FaLightbulb,
                  },
                  {
                    id: "mcqs",
                    label: `MCQs ${mcqs.length > 0 ? `(${mcqs.length})` : ""}`,
                    icon: FaQuestionCircle,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition font-medium ${
                      activeTab === tab.id
                        ? isDark
                          ? "border-[#a78bfa] text-[#a78bfa]"
                          : "border-[#7c3aed] text-[#7c3aed]"
                        : isDark
                        ? "border-transparent text-gray-400 hover:text-gray-300"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "upload" && renderUploadTab()}
                {activeTab === "flashcards" && renderFlashcardsTab()}
                {activeTab === "mcqs" && renderMCQsTab()}
              </motion.div>
            </AnimatePresence>
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
            <FaSpinner
              className={`animate-spin text-4xl mx-auto mb-4 ${
                isDark ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}
            />
            <p className={`${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}`}>
              Processing your PDF...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FlashcardGenerator;
