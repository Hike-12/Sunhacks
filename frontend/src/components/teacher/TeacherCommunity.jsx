import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlus } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const TeacherCommunity = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // track the single course id that's currently enrolling (so only that card shows processing)
  const [enrollingId, setEnrollingId] = useState(null);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateData, setPrivateData] = useState({ code: "", password: "" });

  // New state for details modal
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPublic();
    fetchEnrolled();
    // eslint-disable-next-line
  }, []);

  const fetchPublic = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/public`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (data.success) setCourses(data.courses || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnrolled = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enrolled`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (data.success) setEnrolledCourses(data.courses || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ courseId }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Enrolled successfully");
        await fetchEnrolled();
        await fetchPublic();
        // close details modal if user enrolled from there
        setShowDetailsModal(false);
      } else {
        toast.error(data.message || "Failed to enroll");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      // clear only this id so other cards are unaffected
      setEnrollingId(null);
    }
  };

  const handleJoinPrivate = async () => {
    if (!privateData.code || !privateData.password) {
      toast.error("Enter code and password");
      return;
    }
    setEnrollingId(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/join-private`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(privateData),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Joined private course");
        setShowPrivateModal(false);
        setPrivateData({ code: "", password: "" });
        fetchEnrolled();
      } else toast.error(data.message || "Failed to join");
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (course) =>
    enrolledCourses.some((e) => String(e._id) === String(course._id));

  const snippet = (text, max = 180) => {
    if (!text) return "";
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= max) return normalized;
    return normalized.slice(0, max).trim() + "...";
  };

  const openDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2
          className={`text-2xl font-bold ${
            isDark ? "text-neutral-50" : "text-gray-900"
          }`}
        >
          Community
        </h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center w-full md:w-80 bg-transparent rounded-lg border px-3 py-2">
            <FaSearch
              className={`mr-2 ${
                isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className={`w-full bg-transparent outline-none ${
                isDark ? "text-neutral-200" : "text-neutral-800"
              }`}
            />
          </div>
          <button
            onClick={() => setShowPrivateModal(true)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDark ? "bg-[#a78bfa] text-white" : "bg-[#7c3aed] text-white"
            }`}
          >
            Join Private
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div
            className={`col-span-full text-center py-12 ${
              isDark ? "text-neutral-400" : "text-gray-500"
            }`}
          >
            No courses found
          </div>
        ) : (
          filtered.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl p-5 transition flex flex-col h-72 ${
                isDark
                  ? "bg-[#181818] border border-[#222]"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <h3
                  className={`font-semibold mb-2 ${
                    isDark ? "text-neutral-50" : "text-gray-900"
                  }`}
                >
                  {course.title}
                </h3>

                {/* truncated content area */}
                <div className="text-sm mb-3">
                  {course.description && course.description.length > 200 ? (
                    <>
                      <p
                        className={`${
                          isDark ? "text-neutral-300" : "text-gray-600"
                        }`}
                      >
                        {snippet(course.description, 180)}{" "}
                        <button
                          onClick={() => openDetails(course)}
                          className={`ml-1 underline italic font-medium ${
                            isDark ? "text-neutral-200" : "text-gray-800"
                          }`}
                        >
                          read more
                        </button>
                      </p>
                    </>
                  ) : (
                    <p
                      className={`${
                        isDark ? "text-neutral-300" : "text-gray-600"
                      } break-words`}
                    >
                      {course.description || ""}
                    </p>
                  )}
                </div>

                {/* optional meta row */}
                <div className="flex items-center gap-2 text-xs mb-4">
                  {course.estimatedTime && (
                    <span
                      className={`px-2 py-1 rounded ${
                        isDark
                          ? "bg-[#111] text-neutral-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {course.estimatedTime} mins
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded ${
                      isDark
                        ? "bg-[#111] text-neutral-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {course.category || "General"}
                  </span>
                </div>
              </div>

              {/* footer actions - stay aligned bottom */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  {isEnrolled(course) ? (
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="px-4 py-2 rounded bg-gray-100 text-sm"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      disabled={enrollingId !== null}
                      onClick={() => handleEnroll(course._id)}
                      className={`px-6 py-3 rounded text-sm font-medium ${
                        isDark
                          ? "bg-[#a78bfa] text-white"
                          : "bg-[#7c3aed] text-white"
                      }`}
                    >
                      {enrollingId === course._id ? "Processing..." : "Enroll"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Details modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div
            className={`rounded-2xl p-6 overflow-auto ${
              isDark
                ? "bg-[#101010] border border-[#222]"
                : "bg-white border border-gray-200"
            }`}
            style={{ width: "60vw", height: "80vh" }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3
                className={`text-xl font-bold ${
                  isDark ? "text-neutral-50" : "text-gray-900"
                }`}
              >
                {selectedCourse.title}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`text-sm ${
                  isDark ? "text-neutral-300" : "text-gray-600"
                }`}
              >
                Close
              </button>
            </div>

            <div
              className={`prose max-w-none mb-4 ${
                isDark ? "prose-invert text-neutral-200" : ""
              }`}
              dangerouslySetInnerHTML={{
                __html: selectedCourse.description || "",
              }}
            />

            <div className="flex flex-wrap gap-3 mb-6">
              <span
                className={`px-3 py-1 rounded ${
                  isDark
                    ? "bg-[#111] text-neutral-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedCourse.category || "General"}
              </span>
              {selectedCourse.estimatedTime && (
                <span
                  className={`px-3 py-1 rounded ${
                    isDark
                      ? "bg-[#111] text-neutral-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedCourse.estimatedTime} mins
                </span>
              )}
            </div>
            {/* extra spacing below badges */}
            <div className="mb-6" />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`px-4 py-2 rounded border ${
                  isDark
                    ? "border-[#222] text-neutral-200"
                    : "border-gray-200 text-neutral-800"
                }`}
              >
                Close
              </button>
              {!isEnrolled(selectedCourse) ? (
                <button
                  disabled={enrollingId !== null}
                  onClick={() => handleEnroll(selectedCourse._id)}
                  className={`px-5 py-2.5 rounded ${
                    isDark
                      ? "bg-[#a78bfa] text-white"
                      : "bg-[#7c3aed] text-white"
                  }`}
                >
                  {enrollingId ? "Processing..." : "Enroll"}
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/course/${selectedCourse._id}`)}
                  className="px-5 py-2.5 rounded bg-gray-100 text-sm"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Private join modal - small centered */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`rounded-2xl p-6 overflow-auto w-[420px] ${
              isDark
                ? "bg-[#101010] border border-[#222]"
                : "bg-white border border-gray-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-neutral-50" : "text-gray-900"
              }`}
            >
              Join Private Course
            </h3>
            <input
              value={privateData.code}
              onChange={(e) =>
                setPrivateData({ ...privateData, code: e.target.value })
              }
              placeholder="Course Code"
              className={`w-full px-4 py-3 rounded-lg mb-3 border ${
                isDark
                  ? "bg-[#111] border-[#222] text-neutral-200"
                  : "bg-white border-gray-200 text-neutral-800"
              }`}
            />
            <input
              value={privateData.password}
              onChange={(e) =>
                setPrivateData({ ...privateData, password: e.target.value })
              }
              placeholder="Password"
              type="password"
              className={`w-full px-4 py-3 rounded-lg mb-4 border ${
                isDark
                  ? "bg-[#111] border-[#222] text-neutral-200"
                  : "bg-white border-gray-200 text-neutral-800"
              }`}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPrivateModal(false)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? "border-[#222] text-neutral-200"
                    : "border-gray-200 text-neutral-800"
                }`}
              >
                Cancel
              </button>
              <button
                disabled={enrollingId !== null}
                onClick={handleJoinPrivate}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? "bg-[#a78bfa] text-white" : "bg-[#7c3aed] text-white"
                }`}
              >
                {enrollingId ? "Processing..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCommunity;
