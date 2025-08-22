const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User'); // <-- FIXED IMPORT
const auth = require('../middleware/authMiddleware');

// GET /api/teacher/analytics
router.get('/analytics', auth, async (req, res) => {
    try {
        // Only allow teachers
        const teacherId = req.user.id;
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Courses created by teacher
        const courses = await Course.find({ createdBy: teacherId });
        const courseIds = courses.map(c => c._id);

        // Students enrolled in teacher's courses
        const enrolledProgress = await Progress.find({ course: { $in: courseIds } });
        const uniqueStudentIds = [...new Set(enrolledProgress.map(p => p.student.toString()))];
        const totalStudents = uniqueStudentIds.length;

        // Course completion stats
        const completedProgress = enrolledProgress.filter(p => p.completed);
        const totalCompletions = completedProgress.length;

        // Average score across all completions
        const scores = completedProgress.map(p => p.score || 0);
        const averageScore = scores.length
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
            : 0;

        // Engagement: total lessons viewed
        const totalLessonsViewed = enrolledProgress.reduce((sum, p) => sum + (p.lessonsViewed || 0), 0);

        // Recent completions
        const recentCompletions = await Progress.find({
            course: { $in: courseIds },
            completed: true
        })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('student', 'name email')
        .populate('course', 'title');

        res.json({
            success: true,
            analytics: {
                totalCourses: courses.length,
                totalStudents,
                totalCompletions,
                averageScore,
                totalLessonsViewed,
                recentCompletions: recentCompletions.map(rc => ({
                    student: rc.student,
                    course: rc.course,
                    score: rc.score,
                    completedAt: rc.completedAt,
                }))
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: err.message });
    }
});

module.exports = router;