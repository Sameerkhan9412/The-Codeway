import React, { useEffect, useState } from 'react';
import { getPlatformStats } from '../../utils/apis/adminApi';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiAward, FiClipboard } from 'react-icons/fi';

const PlatformAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getPlatformStats();
                setStats(data.stats);
            } catch (err) {
                setError('Failed to fetch platform stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gray-100 min-h-screen"
        >
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Platform Analytics</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<FiUsers />} title="Total Users" value={stats.totalUsers} color="blue" />
                    <StatCard icon={<FiFileText />} title="Total Submissions" value={stats.totalSubmissions} color="green" />
                    <StatCard icon={<FiAward />} title="Total Contests" value={stats.totalContests} color="purple" />
                    <StatCard icon={<FiClipboard />} title="Total Problems" value={stats.totalProblems} color="red" />
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-${color}-500`}>
        <div className={`text-4xl text-${color}-500 mr-4`}>{icon}</div>
        <div>
            <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default PlatformAnalytics;
