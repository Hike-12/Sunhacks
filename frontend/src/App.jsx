import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import { LanguageProvider } from "./context/LanguageContext";
import Signup from "./components/Signup";
import StudentDashboard from "./components/StudentDashboard";
import CourseViewer from "./components/CourseViewer";
import StudentStats from "./components/StudentStats";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import CreateCourse from "./components/teacher/CreateCourse";
import Landing from "./components/landing/Landing";
import AllAchievements from "./components/AllAchievements";
import MyAchievements from "./components/MyAchievements";
import PDFTranslator from "./components/translatePart/PDFTranslator";
import TeacherCourseViewer from "./components/teacher/TeacherCourseViewer";
import CourseEditor from "./components/teacher/CourseEditor";
import { ThemeProvider } from "./context/ThemeContext";
import WikipediaShorts, { WikipediaShortsLauncher } from "./components/TikTok";
import TeacherCommunity from "./components/teacher/TeacherCommunity"; // <--- added
import PomodoroDial from "./components/Pomodoro";
import PomodoroFloating from "./components/PomodoroFloating";
import { translatePage } from "./lib/translatePage";
import { useEffect } from "react";
import { restoreTranslation } from "./lib/restoreTranslation";

function App() {
  useEffect(() => {
    restoreTranslation();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        {/* Place your Navbar here if you have one */}
        <PomodoroFloating /> {/* <-- Add this line */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/course/:courseId" element={<CourseViewer />} />
          <Route path="/student-stats" element={<StudentStats />} />
          <Route path="/my-achievements" element={<MyAchievements />} />
          <Route path="/achievements" element={<AllAchievements />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/pdf-translator" element={<PDFTranslator />} />
          <Route path="/community" element={<TeacherCommunity />} />{" "}
          {/* new community route */}
          <Route path="/" element={<Landing />} />
          <Route path="/courses/:courseId/edit" element={<CourseEditor />} />
          <Route
            path="/courses/:courseId/view"
            element={<TeacherCourseViewer />}
          />
          <Route path="/courses/:courseId/take" element={<CourseViewer />} />
          <Route path="/pomo" element={<PomodoroDial />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
