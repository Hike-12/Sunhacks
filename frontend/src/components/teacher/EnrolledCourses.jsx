import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCourses([]);
          setLoading(false);
          return;
        }
        const res = await fetch(
          `${import.meta.env.VITE_NODE_BASE_API_URL}/api/courses/enrolled`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, []);

  if (loading) return <div>Loading enrolled courses...</div>;
  if (!courses.length) return <div>No enrolled courses found.</div>;

  return (
    <div className={`p-4 ${isDark ? "text-white" : "text-black"}`}>
      <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
      <div className="grid gap-3">
        {courses.map((c) => (
          <div
            key={c._id}
            className={`p-3 rounded border ${
              isDark ? "bg-[#0b0b0b] border-[#222]" : "bg-white border-gray-100"
            } cursor-pointer`}
            onClick={() => navigate(`/courses/${c._id}`)}
            title={c.title}
          >
            <div className="font-semibold truncate">{c.title}</div>
            {c.description && (
              <div className="text-sm text-gray-500 line-clamp-2">
                {c.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrolledCourses;
