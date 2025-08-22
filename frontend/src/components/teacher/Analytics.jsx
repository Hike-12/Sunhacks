import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../landing/ThemeToggle';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FaBook, FaClock, FaBullseye, FaTrophy, FaStar, FaShareAlt, FaChartPie } from 'react-icons/fa';

const COLORS = ['#4ade80', '#3b82f6', '#eab308', '#8b5cf6', '#f97316'];

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        // Fake stats for demo
        setTimeout(() => {
            setAnalytics({
                coursesCompleted: 7,
                totalStudyTime: 420,
                averageScore: 86,
                achievementsUnlocked: 5,
                achievementPoints: 1200,
                // For charts
                studyTimePerCourse: [
                    { name: 'Math', minutes: 120 },
                    { name: 'Science', minutes: 80 },
                    { name: 'English', minutes: 60 },
                    { name: 'History', minutes: 90 },
                    { name: 'Art', minutes: 70 },
                ],
                scores: [
                    { name: 'Math', score: 92 },
                    { name: 'Science', score: 85 },
                    { name: 'English', score: 78 },
                    { name: 'History', score: 88 },
                    { name: 'Art', score: 87 },
                ],
                achievementsPie: [
                    { name: 'Unlocked', value: 5 },
                    { name: 'Locked', value: 3 },
                ]
            });
            setLoading(false);
        }, 800);
    }, []);

    const shareAnalytics = () => {
        setShowShareModal(true);
    };

    const generateImage = async () => {
        toast.info("Download as image is not supported for charts demo. Use screenshot!");
        setShowShareModal(false);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#030303]' : 'bg-[#f8f8f8]'}`}>
                <motion.div className={`flex items-center space-x-2 ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}`}>
                    <div className={`animate-spin h-6 w-6 border-2 ${isDark ? 'border-[#222052]' : 'border-[#080808]'} border-t-transparent rounded-full`}></div>
                    <span>Loading analytics...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-screen ${isDark ? 'bg-[#030303]' : 'bg-[#f8f8f8]'} py-8 px-4`}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className={`text-4xl font-bold ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'} mb-4 flex items-center justify-center gap-2`}>
                                <FaChartPie className="inline-block mb-1 text-blue-500" /> Analytics
                            </h1>
                        </motion.div>
                        <ThemeToggle />
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {[
                            { icon: <FaBook className="text-3xl mb-2 text-blue-500" />, value: analytics?.coursesCompleted, label: 'Courses Completed' },
                            { icon: <FaClock className="text-3xl mb-2 text-yellow-500" />, value: `${analytics?.totalStudyTime} min`, label: 'Total Study Time' },
                            { icon: <FaBullseye className="text-3xl mb-2 text-green-500" />, value: `${analytics?.averageScore}%`, label: 'Average Score' },
                            { icon: <FaTrophy className="text-3xl mb-2 text-purple-500" />, value: analytics?.achievementsUnlocked, label: 'Achievements Unlocked' },
                            { icon: <FaStar className="text-3xl mb-2 text-orange-400" />, value: analytics?.achievementPoints, label: 'Achievement Points' },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 1) }}
                                className={`${isDark ? 'bg-[#222052] border-[#f8f8f8]/20 text-[#f8f8f8]' : 'bg-white border-[#080808]/20 text-[#080808]'} border rounded-2xl p-6 text-center`}
                            >
                                {stat.icon}
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                                <p className="opacity-70">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Study Time Bar Chart */}
                        <div className={`${isDark ? 'bg-[#222052] text-[#f8f8f8]' : 'bg-white text-[#080808]'} rounded-xl p-6 shadow`}>
                            <h2 className="text-xl font-bold mb-4">Study Time per Course</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={analytics.studyTimePerCourse}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke={isDark ? '#f8f8f8' : '#080808'} />
                                    <YAxis stroke={isDark ? '#f8f8f8' : '#080808'} />
                                    <Tooltip />
                                    <Bar dataKey="minutes" fill="#3b82f6" radius={[8,8,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Scores Bar Chart */}
                        <div className={`${isDark ? 'bg-[#222052] text-[#f8f8f8]' : 'bg-white text-[#080808]'} rounded-xl p-6 shadow`}>
                            <h2 className="text-xl font-bold mb-4">Scores per Course</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={analytics.scores}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke={isDark ? '#f8f8f8' : '#080808'} />
                                    <YAxis stroke={isDark ? '#f8f8f8' : '#080808'} />
                                    <Tooltip />
                                    <Bar dataKey="score" fill="#4ade80" radius={[8,8,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Achievements Pie Chart */}
                    <div className={`${isDark ? 'bg-[#222052] text-[#f8f8f8]' : 'bg-white text-[#080808]'} rounded-xl p-6 shadow mb-8 max-w-md mx-auto`}>
                        <h2 className="text-xl font-bold mb-4">Achievements Status</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analytics.achievementsPie}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {analytics.achievementsPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={shareAnalytics}
                        className={`${isDark ? 'bg-[#222052] text-[#f8f8f8] border-[#f8f8f8]/20' : 'bg-white text-[#080808] border-[#080808]/20'} px-6 py-2 border rounded-lg flex items-center gap-2 justify-center`}
                    >
                        <FaShareAlt className="text-lg" /> Share Analytics
                    </motion.button>
                </div>

                {/* Share Modal */}
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`${isDark ? 'bg-[#181818] text-[#f8f8f8]' : 'bg-white text-[#080808]'} rounded-2xl p-6 max-w-md w-full mx-4`}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                                <FaShareAlt className="inline-block mb-1 text-blue-500" /> Share Your Analytics
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={generateImage}
                                    className={`${isDark ? 'bg-[#030303] border border-[#f8f8f8]/20 text-[#f8f8f8]' : 'bg-[#f8f8f8] border border-[#080808]/20 text-[#080808]'} w-full p-3 rounded-lg transition flex items-center justify-center gap-2`}
                                >
                                    <FaChartPie className="text-lg" /> Download as Image
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    theme={isDark ? "dark" : "light"}
                    toastStyle={{
                        backgroundColor: isDark ? '#222052' : '#f8f8f8',
                        color: isDark ? '#f8f8f8' : '#080808',
                        border: isDark ? "1px solid #222" : "1px solid #e5e7eb",
                    }}
                />
            </motion.div>
        </>
    );
};

export default Analytics;