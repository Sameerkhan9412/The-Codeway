import axiosClient from '../axiosClient';

export const fetchUserProfile = () => axiosClient.get('/user/getProfile');
export const fetchProblemsSolved = () => axiosClient.get('/problem/profile/problemsSolved');
export const fetchAllProblems = () => axiosClient.get('/problem/profile/allProblems');
export const fetchUserStreaks = () => axiosClient.get('/user/streaks');
export const fetchUserBadges = () => axiosClient.get('/user/badges');
export const fetchUserRank = () => axiosClient.get('/user/rank');
export const fetchAllUserSubmissions = () => axiosClient.get('/user/submissions');
export const fetchHeatmapData = () => axiosClient.get('/user/heatmap');
export const fetchUserActivity = () => axiosClient.get('/problem/profile/problemsSolved');
