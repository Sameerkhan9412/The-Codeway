import axiosClient from '../axiosClient';

export const getAllUsers = async () => {
    try {
        const response = await axiosClient.get('/user/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const getPlatformStats = async () => {
    try {
        const response = await axiosClient.get('/user/platform-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        throw error;
    }
};

export const updateAllUsersProfileImages = async () => {
    try {
        const response = await axiosClient.put('/user/admin/update-all-profile-images');
        return response.data;
    } catch (error) {
        console.error('Error updating all users profile images:', error);
        throw error;
    }
};
