import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../utils/apis/adminApi';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserAnalytics = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data.users);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return <div className="text-center p-8 bg-gray-900 text-white">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500 bg-gray-900">{error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gray-900 text-white min-h-screen"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-orange-500">User Analytics</h1>
                    <Link to="/admin" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        Back to Admin
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex items-center">
                        <FiUsers className="text-5xl text-orange-500 mr-6" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-400">Total Users</h2>
                            <p className="text-4xl font-bold text-white">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold text-orange-500 mb-6">Problems Solved</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 border-b-2 border-gray-700 bg-gray-800 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 border-b-2 border-gray-700 bg-gray-800 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Problems Solved
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user._id} className="hover:bg-gray-700 transition-colors duration-200">
                                        <td className={`px-6 py-5 ${index === users.length - 1 ? '' : 'border-b'} border-gray-700 bg-transparent text-md`}>
                                            <p className="text-white whitespace-no-wrap">{user.firstName} {user.lastName}</p>
                                        </td>
                                        <td className={`px-6 py-5 ${index === users.length - 1 ? '' : 'border-b'} border-gray-700 bg-transparent text-md`}>
                                            <p className="text-orange-400 whitespace-no-wrap font-semibold">{user.problemSolved.length}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserAnalytics;
