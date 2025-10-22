import React, { useEffect, useState } from 'react';
import { getAllUsers, updateAllUsersProfileImages } from '../../utils/apis/adminApi';
import { motion } from 'framer-motion';
import { FiSearch, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data.users);
            setFilteredUsers(data.users);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.emailId.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-orange-500">User Management</h1>
                    <div>
                        <button
                            onClick={async () => {
                                setUpdateMessage('Updating...');
                                const res = await updateAllUsersProfileImages();
                                setUpdateMessage(res.message);
                                fetchUsers();
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                        >
                            Update All Profile Images
                        </button>
                        <Link to="/admin" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                            Back to Admin
                        </Link>
                    </div>
                </div>
                {updateMessage && <div className="text-center p-4 my-4 bg-gray-700 text-white rounded-lg">{updateMessage}</div>}
                <div className="relative mb-6">
                    <FiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <img className="w-full h-full rounded-full" src={user.profileImage || 'https://via.placeholder.com/150'} alt="User" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-white whitespace-no-wrap">{user.firstName} {user.lastName}</p>
                                                <p className="text-gray-400 whitespace-no-wrap">{user.emailId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <p className="text-white whitespace-no-wrap">{user.role}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <p className="text-white whitespace-no-wrap">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                                        <button className="text-red-500 hover:text-red-700">
                                            <FiXCircle size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default UserManagement;
