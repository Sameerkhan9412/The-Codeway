import axiosClient from '../axiosClient';

export const updateProfile = (formData) => {
  return axiosClient.put('/user/updateProfile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const register = (data) => {
  return axiosClient.post('/user/register', data);
};

export const googleLogin = (token) => {
  return axiosClient.post('/user/googleLogin', { token });
};

export const signupWithVerification = (data) => {
  return axiosClient.post('/user/signupWithVerification', data);
};

export const verifySignupOTP = (data) => {
  return axiosClient.post('/user/verifySignupOTP', data);
};

export const requestEmailVerificationOTP = (email) => {
  return axiosClient.post('/user/requestEmailVerificationOTP', { email });
};

export const verifyEmailOTP = (data) => {
  return axiosClient.post('/user/verifyEmailOTP', data);
};

export const forgotPassword = (email) => {
  return axiosClient.post('/user/forgot-password', { email });
};

export const resetPassword = (token, newPassword) => {
  return axiosClient.post(`/user/reset-password/${token}`, { newPassword });
};

export const changePassword = (oldPassword, newPassword) => {
  return axiosClient.post('/user/changePassword', { oldPassword, newPassword });
};

export const getProfile = () => {
  return axiosClient.get('/user/getProfile');
};

export const deleteProfile = () => {
  return axiosClient.delete('/user/deleteProfile');
};

export const login = (credentials) => {
  return axiosClient.post('/user/login', credentials);
};

export const logout = () => {
  return axiosClient.post('/user/logout');
};

export const checkAuth = () => {
  return axiosClient.get('/user/check');
};
