
// Import googleLogin API
import { googleLogin as googleLoginApi, register, login, logout, checkAuth as checkAuthApi, getProfile as getProfileApi } from '../utils/apis/userApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { updateProfile as updateProfileApi } from '../utils/apis/userApi';

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await register(userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      // Return user and token
      return { user: response.data.user, token: response.data.token };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Login failed");
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      const response = await googleLoginApi(token);
      return response.data; // Return the full payload
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Google login failed";
      return rejectWithValue(message);
    }
  }
);

export const logutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logout();
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
)

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {//_becuase we are not sending empty no data is going to db saving something all token thing validation.
    try {
      const response = await checkAuthApi();
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
)

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfileApi();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await updateProfileApi(formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);




import { signupWithVerification, verifySignupOTP, requestEmailVerificationOTP, verifyEmailOTP, forgotPassword, resetPassword, changePassword } from '../utils/apis/userApi';

export const signupWithVerificationThunk = createAsyncThunk(
  "auth/signupWithVerification",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await signupWithVerification(userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const verifySignupOTPThunk = createAsyncThunk(
  "auth/verifySignupOTP",
  async (data, { rejectWithValue }) => {
    try {
      const response = await verifySignupOTP(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const requestEmailVerificationOTPThunk = createAsyncThunk(
  "auth/requestEmailVerificationOTP",
  async (email, { rejectWithValue }) => {
    try {
      const response = await requestEmailVerificationOTP(email);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const verifyEmailOTPThunk = createAsyncThunk(
  "auth/verifyEmailOTP",
  async (data, { rejectWithValue }) => {
    try {
      const response = await verifyEmailOTP(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const requestPasswordResetOTPThunk = createAsyncThunk(
  "auth/requestPasswordResetOTP",
  async (email, { rejectWithValue }) => {
    try {
      const response = await requestPasswordResetOTP(email);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPassword(email);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPassword(token, newPassword);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await changePassword(oldPassword, newPassword);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteProfileThunk = createAsyncThunk(
  "auth/deleteProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteProfile();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

//slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("authToken") || null,
    loading: false,
    isAuthenticated: !!localStorage.getItem("authToken"),
    error: null,
    profile: null,
    profileLoading: false,
    profileError: null,
    updateProfileLoading: false,
    updateProfileError: null,
    updateProfileSuccess: false,
    requestEmailVerificationOTPLoading: false,
    requestEmailVerificationOTPError: null,
    requestEmailVerificationOTPSuccess: false,
    verifyEmailOTPLoading: false,
    verifyEmailOTPError: null,
    verifyEmailOTPSuccess: false,
    signupSuccess: false, // New state for signup
    verifySignupOTPLoading: false, // Add loading state for signup verification
    verifySignupOTPError: null, // Add error state for signup verification
    verifySignupOTPSuccess: false, // New state for signup verification
    requestPasswordResetOTPLoading: false,
    requestPasswordResetOTPError: null,
    requestPasswordResetOTPSuccess: false,
    resetPasswordLoading: false,
    resetPasswordError: null,
    resetPasswordSuccess: false,
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
    deleteProfileLoading: false,
    deleteProfileError: null,
    deleteProfileSuccess: false,
  },
  reducers: {
    resetDeleteProfileState: (state) => {
      state.deleteProfileLoading = false;
      state.deleteProfileError = null;
      state.deleteProfileSuccess = false;
    },
    resetUpdateProfileState: (state) => {
      state.updateProfileLoading = false;
      state.updateProfileError = null;
      state.updateProfileSuccess = false;
    },
    resetEmailVerificationState: (state) => {
      state.requestEmailVerificationOTPLoading = false;
      state.requestEmailVerificationOTPError = null;
      state.requestEmailVerificationOTPSuccess = false;
      state.verifyEmailOTPLoading = false;
      state.verifyEmailOTPError = null;
      state.verifyEmailOTPSuccess = false;
    },
    resetPasswordResetState: (state) => {
      state.requestPasswordResetOTPLoading = false;
      state.requestPasswordResetOTPError = null;
      state.requestPasswordResetOTPSuccess = false;
      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
    },
    resetChangePasswordState: (state) => {
      state.changePasswordLoading = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
    },
    // New reducer to update user stats from socket
    setUserStats: (state, action) => {
      if (state.user) {
        state.user.points = action.payload.points;
        state.user.streak = action.payload.streak;
      }
    },
    updateTokens: (state, action) => {
      if (state.user) {
        state.user.tokensLeft = action.payload.tokensLeft;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      //login user cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true,
          state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Update localStorage for token and user
        console.log("LOGIN SUCCESSFUL, SETTING TOKEN:", action.payload.token);
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        // Dispatch getProfile to fetch full user data including streak
        // This needs to be handled outside the slice, e.g., in the component that dispatches loginUser
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something Went Wrong";
        state.isAuthenticated = false;
        state.user = null;
      })

      // Google login user cases
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Update localStorage for token and user
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        // Dispatch getProfile to fetch full user data including streak
        // This needs to be handled outside the slice, e.g., in the component that dispatches googleLoginUser
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something Went Wrong";
        state.isAuthenticated = false;
        state.user = null;
      })

      //logout user
      .addCase(logutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      })
      .addCase(logutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something Went Wrong";
        state.user = null;
        state.isAuthenticated = false;
      })

      //check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true,
          state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false,
          state.error = action.payload?.message || "Something Went Wrong";
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(getProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload.user;
        state.user = {
          ...state.user,
          ...action.payload.user,
          emailId: action.payload.user.emailId,
          paymentHistory: action.payload.user.paymentHistory || [],
        };
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })

      // update profile
      .addCase(updateProfile.pending, (state) => {
        state.updateProfileLoading = true;
        state.updateProfileError = null;
        state.updateProfileSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileSuccess = true;
        state.profile = action.payload.user;
        state.user = {
          ...state.user,
          ...action.payload.user,
          emailId: action.payload.user.emailId,
        };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileError = action.payload;
        state.updateProfileSuccess = false;
      })

      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // signupWithVerification
      .addCase(signupWithVerificationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupWithVerificationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.signupSuccess = true; // Set signup success to true
        // Do not set isAuthenticated or user here, as verification is pending
      })
      .addCase(signupWithVerificationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup with verification failed";
      })

      // verifySignupOTP
      .addCase(verifySignupOTPThunk.pending, (state) => {
        state.verifySignupOTPLoading = true;
        state.verifySignupOTPError = null;
        state.verifySignupOTPSuccess = false;
      })
      .addCase(verifySignupOTPThunk.fulfilled, (state, action) => {
        state.verifySignupOTPLoading = false;
        state.isAuthenticated = true; // User is authenticated after OTP verification
        state.user = action.payload.user; // Assuming payload contains user data
        state.token = action.payload.token; // Assuming payload contains token
        state.verifySignupOTPSuccess = true;
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifySignupOTPThunk.rejected, (state, action) => {
        state.verifySignupOTPLoading = false;
        state.verifySignupOTPError = action.payload || "OTP verification failed";
        state.isAuthenticated = false;
        state.user = null;
        state.verifySignupOTPSuccess = false;
      })

      // requestEmailVerificationOTP
      .addCase(requestEmailVerificationOTPThunk.pending, (state) => {
        state.requestEmailVerificationOTPLoading = true;
        state.requestEmailVerificationOTPError = null;
        state.requestEmailVerificationOTPSuccess = false;
      })
      .addCase(requestEmailVerificationOTPThunk.fulfilled, (state) => {
        state.requestEmailVerificationOTPLoading = false;
        state.requestEmailVerificationOTPSuccess = true;
      })
      .addCase(requestEmailVerificationOTPThunk.rejected, (state, action) => {
        state.requestEmailVerificationOTPLoading = false;
        state.requestEmailVerificationOTPError = action.payload;
        state.requestEmailVerificationOTPSuccess = false;
      })

      // verifyEmailOTP
      .addCase(verifyEmailOTPThunk.pending, (state) => {
        state.verifyEmailOTPLoading = true;
        state.verifyEmailOTPError = null;
        state.verifyEmailOTPSuccess = false;
      })
      .addCase(verifyEmailOTPThunk.fulfilled, (state, action) => {
        state.verifyEmailOTPLoading = false;
        state.verifyEmailOTPSuccess = true;
        state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(verifyEmailOTPThunk.rejected, (state, action) => {
        state.verifyEmailOTPLoading = false;
        state.verifyEmailOTPError = action.payload;
        state.verifyEmailOTPSuccess = false;
      })

      // requestPasswordResetOTP
      .addCase(requestPasswordResetOTPThunk.pending, (state) => {
        state.requestPasswordResetOTPLoading = true;
        state.requestPasswordResetOTPError = null;
        state.requestPasswordResetOTPSuccess = false;
      })
      .addCase(requestPasswordResetOTPThunk.fulfilled, (state) => {
        state.requestPasswordResetOTPLoading = false;
        state.requestPasswordResetOTPSuccess = true;
      })
      .addCase(requestPasswordResetOTPThunk.rejected, (state, action) => {
        state.requestPasswordResetOTPLoading = false;
        state.requestPasswordResetOTPError = action.payload;
        state.requestPasswordResetOTPSuccess = false;
      })

      // resetPassword
      .addCase(resetPasswordThunk.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload;
        state.resetPasswordSuccess = false;
      })

      // changePassword
      .addCase(changePasswordThunk.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = true;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload;
        state.changePasswordSuccess = false;
      })

      // delete profile
      .addCase(deleteProfileThunk.pending, (state) => {
        state.deleteProfileLoading = true;
        state.deleteProfileError = null;
        state.deleteProfileSuccess = false;
      })
      .addCase(deleteProfileThunk.fulfilled, (state) => {
        state.deleteProfileLoading = false;
        state.deleteProfileSuccess = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      })
      .addCase(deleteProfileThunk.rejected, (state, action) => {
        state.deleteProfileLoading = false;
        state.deleteProfileError = action.payload;
        state.deleteProfileSuccess = false;
      });
  }
})



export const { resetUpdateProfileState, resetEmailVerificationState, resetPasswordResetState, resetChangePasswordState, setUserStats, updateTokens, resetDeleteProfileState } = authSlice.actions;

export default authSlice.reducer;
