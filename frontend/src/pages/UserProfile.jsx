import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProfile,
  updateProfile,
  resetUpdateProfileState,
  deleteProfileThunk,
  resetDeleteProfileState,
  changePasswordThunk,
  resetEmailVerificationState,
  resetChangePasswordState,
} from "../slice/authSlice";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import EmailVerification from "../components/common/EmailVerification";
import axiosClient from "../utils/axiosClient";

const UserProfile = () => {
  const dispatch = useDispatch();
  const {
    profile,
    profileLoading,
    profileError,
    updateProfileLoading,
    updateProfileError,
    updateProfileSuccess,
    requestEmailVerificationOTPLoading,
    requestEmailVerificationOTPError,
    requestEmailVerificationOTPSuccess,
    verifyEmailOTPLoading,
    verifyEmailOTPError,
    verifyEmailOTPSuccess,
    changePasswordLoading,
    changePasswordError,
    changePasswordSuccess,
    deleteProfileLoading,
    deleteProfileError,
    deleteProfileSuccess,
    user,
  } = useSelector((state) => state.auth);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    linkedin: "",
    github: "",
    twitter: "",
    website: "",
    profileImage: null,
    profileImagePreview: null,
  });

  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    if (profile?.emailVerified) {
      setShowEmailVerification(false);
    }
  }, [profile]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const [contestHistory, setContestHistory] = useState([]);
  const [contestHistoryLoading, setContestHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchContestHistory = async () => {
      try {
        const response = await axiosClient.get("/contest/user/history");
        setContestHistory(response.data.contestHistory);
      } catch (error) {
        console.error("Error fetching contest history:", error);
      } finally {
        setContestHistoryLoading(false);
      }
    };

    fetchContestHistory();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        age: profile?.age || "",
        linkedin: profile?.socialLinks?.linkedin || "",
        github: profile?.socialLinks?.github || "",
        twitter: profile?.socialLinks?.twitter || "",
        website: profile?.socialLinks?.website || "",
        profileImage: null,
        profileImagePreview: profile?.profileImage || null,
      });
      setEmailForVerification(profile?.emailId || "");
    }
  }, [profile]);

  useEffect(() => {
    if (updateProfileSuccess) {
      setSuccessMessage("Profile updated successfully! 🎉");
      dispatch(resetUpdateProfileState());
      dispatch(getProfile());
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [updateProfileSuccess, dispatch]);


  const navigate = useNavigate();

  useEffect(() => {
    if (changePasswordSuccess) {
      toast.success("Password changed successfully! 🎉");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
      dispatch(resetChangePasswordState());
      setTimeout(() => setSuccessMessage(""), 5000);
      setTimeout(() => navigate("/profile"), 2000);
    }
  }, [changePasswordSuccess, dispatch, navigate]);

  useEffect(() => {
    if (verifyEmailOTPSuccess) {
      toast.success("Email verified successfully! 🎉");
      setShowEmailVerification(false);
      setVerificationOtp("");
      dispatch(resetEmailVerificationState());
      dispatch(getProfile());
      setTimeout(() => setSuccessMessage(""), 5000);
      setTimeout(() => navigate("/profile"), 2000);
    }
  }, [verifyEmailOTPSuccess, dispatch, navigate]);

  useEffect(() => {
    if (profile?.emailVerified) {
      setShowEmailVerification(false);
    }
  }, [profile]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (formData.age && (formData.age < 6 || formData.age > 80)) {
      errors.age = "Age must be between 6 and 80";
    }

    const urlRegex = /^https?:\/\/.+/;
    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
      errors.linkedin =
        "Please enter a valid URL starting with http:// or https://";
    }
    if (formData.github && !urlRegex.test(formData.github)) {
      errors.github =
        "Please enter a valid URL starting with http:// or https://";
    }
    if (formData.twitter && !urlRegex.test(formData.twitter)) {
      errors.twitter =
        "Please enter a valid URL starting with http:// or https://";
    }
    if (formData.website && !urlRegex.test(formData.website)) {
      errors.website =
        "Please enter a valid URL starting with http:// or https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordChange = () => {
    const errors = {};

    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "File size must be less than 5MB",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        profileImagePreview: URL.createObjectURL(file),
      }));
      setValidationErrors((prev) => ({ ...prev, profileImage: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          setValidationErrors((prev) => ({
            ...prev,
            profileImage: "File size must be less than 5MB",
          }));
          return;
        }
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
          profileImagePreview: URL.createObjectURL(file),
        }));
        setValidationErrors((prev) => ({ ...prev, profileImage: null }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("age", formData.age);
    data.append(
      "socialLinks",
      JSON.stringify({
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        website: formData.website,
      })
    );
    if (formData.profileImage) {
      data.append("profileImage", formData.profileImage);
    }
    dispatch(updateProfile(data));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;

    dispatch(
      changePasswordThunk({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      })
    );
  };

  const handleRequestVerificationOTP = () => {
    if (!emailForVerification) {
      toast.error("Email is not available for verification.");
      return;
    }
    dispatch(requestEmailVerificationOTPThunk(emailForVerification))
      .unwrap()
      .then(() => {
        toast.success("Verification OTP sent to your email.");
        setShowEmailVerification(true);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to send OTP. Please try again.");
      });
  };

  const handleVerifyEmail = () => {
    if (!verificationOtp) {
      setValidationErrors((prev) => ({
        ...prev,
        otp: "OTP is required",
      }));
      return;
    }
    dispatch(
      verifyEmailOTPThunk({
        email: emailForVerification,
        otp: verificationOtp,
      })
    );
  };

  const handleEmailVerified = () => {
    dispatch(getProfile());
    setShowEmailVerification(false);
  };

  const handleDeleteAccount = () => {
    dispatch(deleteProfileThunk())
      .unwrap()
      .then(() => {
        toast.success("Account deleted successfully.");
        navigate("/");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to delete account.");
      });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-gray-300 text-lg">
              Loading your profile...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
      
      <NavLink to="/" className="mb-6 inline-block text-gray-400 hover:text-orange-400 transition-colors ">
          <ArrowLeft className="inline-block mr-2" /> 
         Back
        </NavLink>
      
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-center animate-fadeIn">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {profileError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center">
            ⚠️ {profileError}
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Image */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl sticky top-8">
                <h3 className="text-xl font-semibold text-orange-400 mb-6 flex items-center">
                  <span className="mr-2">📸</span>
                  Profile Photo
                </h3>

                {/* Profile Image Display */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 p-1 mx-auto shadow-xl">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                        {formData.profileImagePreview ? (
                          <img
                            src={formData.profileImagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl text-orange-400">
                            {formData.firstName
                              ? formData.firstName.charAt(0).toUpperCase()
                              : "👤"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 border-2 border-gray-800 shadow-lg">
                      <span className="text-white text-sm">✏️</span>
                    </div>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-orange-400 bg-orange-400/10"
                      : "border-gray-600 hover:border-orange-400/50 hover:bg-orange-400/5"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-gray-400 mb-4">
                    <span className="text-3xl block mb-2">📤</span>
                    <p className="text-sm">Drag & drop your photo here</p>
                    <p className="text-xs text-gray-500 mt-1">or</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 inline-block">
                      Choose File
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
                </div>

                {/* Image Upload Error */}
                {validationErrors.profileImage && (
                  <div className="mt-3 text-red-400 text-sm text-center">
                    ⚠️ {validationErrors.profileImage}
                  </div>
                )}

                {/* Current Image Info */}
                {profile?.profileImage && (
                  <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-400 text-center">
                      Current image will be replaced if you upload a new one
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                  <h3 className="text-xl font-semibold text-orange-400 mb-6 flex items-center">
                    <span className="mr-2">👤</span>
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          validationErrors.firstName
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                        placeholder="Enter your first name"
                      />
                      {validationErrors.firstName && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ {validationErrors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-200"
                        placeholder="Enter your last name"
                      />
                    </div>

                    {/* Age */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="6"
                        max="80"
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          validationErrors.age
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                        placeholder="Enter your age (6-80)"
                      />
                      {validationErrors.age && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ {validationErrors.age}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
                  <h3 className="text-xl font-semibold text-orange-400 mb-6 flex items-center">
                    <span className="mr-2">🌐</span>
                    Social Links
                  </h3>

                  <div className="space-y-4">
                    {/* LinkedIn */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                        <span className="mr-2">💼</span>
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          validationErrors.linkedin
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {validationErrors.linkedin && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ {validationErrors.linkedin}
                        </p>
                      )}
                    </div>

                    {/* GitHub */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                        <span className="mr-2">🐙</span>
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          validationErrors.github
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                        placeholder="https://github.com/yourusername"
                      />
                      {validationErrors.github && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ {validationErrors.github}
                        </p>
                      )}
                    </div>

                    {/* Twitter */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                        <span className="mr-2">🐦</span>
                        Twitter
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          validationErrors.twitter
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                        placeholder="https://twitter.com/yourusername"
                      />
                      {validationErrors.twitter && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ {validationErrors.twitter}
                        </p>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                        <span className="mr-2">🌐</span>
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          validationErrors.website
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                        placeholder="https://yourwebsite.com"
                      />
                      {validationErrors.website && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ {validationErrors.website}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Update Profile Error */}
                {updateProfileError && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center">
                    ⚠️ {updateProfileError}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={updateProfileLoading}
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/30 ${
                      updateProfileLoading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {updateProfileLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>💾</span>
                        <span>Update Profile</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Email Verification Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-orange-400 flex items-center">
                <span className="mr-2">✉️</span>
                Email Verification
              </h3>
              {profile?.emailVerified ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center">
                  <span className="mr-1">✓</span> Verified
                </span>
              ) : (
                <button
                  onClick={() => setShowEmailVerification(!showEmailVerification)}
                  className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full hover:bg-orange-500/30 transition-colors"
                >
                  {showEmailVerification ? "Hide" : "Verify Email"}
                </button>
              )}
            </div>

            {!profile?.emailVerified && showEmailVerification && (
              <EmailVerification
                email={emailForVerification}
                onVerified={handleEmailVerified}
              />
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-orange-400 flex items-center">
                <span className="mr-2">🔒</span>
                Change Password
              </h3>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full hover:bg-orange-500/30 transition-colors"
              >
                {showChangePassword ? "Hide" : "Change Password"}
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                {changePasswordError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    ⚠️ {changePasswordError}
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      passwordErrors.oldPassword
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                    }`}
                    placeholder="Enter your current password"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="mt-2 text-red-400 text-sm">
                      ⚠️ {passwordErrors.oldPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      passwordErrors.newPassword
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                    }`}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-red-400 text-sm">
                      ⚠️ {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      passwordErrors.confirmPassword
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-600 focus:ring-orange-500/30 focus:border-orange-500"
                    }`}
                    placeholder="Confirm your new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-red-400 text-sm">
                      ⚠️ {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className={`w-full px-4 py-3 rounded-xl font-medium text-white transition-all ${
                    changePasswordLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {changePasswordLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-2xl p-6 border border-red-500/50 shadow-2xl">
            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
              <ShieldAlert className="mr-2" />
              Delete Account
            </h3>
            <p className="text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Delete My Account
            </button>
          </div>

          {/* Profile Preview Section */}
          {(formData.firstName ||
            formData.lastName ||
            Object.values(formData).some(
              (val) => typeof val === "string" && val.startsWith("http")
            )) && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <h3 className="text-xl font-semibold text-orange-400 mb-6 flex items-center">
                <span className="mr-2">👁️</span>
                Profile Preview
              </h3>

              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Preview Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {formData.profileImagePreview ? (
                        <img
                          src={formData.profileImagePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-orange-400">
                          {formData.firstName
                            ? formData.firstName.charAt(0).toUpperCase()
                            : "👤"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Info */}
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {formData.firstName} {formData.lastName}
                    {formData.age && (
                      <span className="text-gray-400 text-sm ml-2">
                        ({formData.age} years old)
                      </span>
                    )}
                  </h4>

                  {/* Email Verification Status */}
                  <div className="mb-3">
                    <span
                      className={`text-sm ${
                        profile?.emailVerified
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {profile?.emailVerified ? (
                        <span className="flex items-center">
                          <span className="mr-1">✓</span> Verified Email:{" "}
                          {profile?.emailId}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <span className="mr-1">⚠️</span> Email not verified:{" "}
                          {profile?.emailId}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Social Links Preview */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                    {formData.linkedin && (
                      <a
                        href={formData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-full text-blue-400 text-sm hover:bg-blue-600/30 transition-colors duration-200"
                      >
                        <span>💼</span>
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {formData.github && (
                      <a
                        href={formData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600/20 border border-gray-600/30 rounded-full text-gray-400 text-sm hover:bg-gray-600/30 transition-colors duration-200"
                      >
                        <span>🐙</span>
                        <span>GitHub</span>
                      </a>
                    )}
                    {formData.twitter && (
                      <a
                        href={formData.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-400/20 border border-blue-400/30 rounded-full text-blue-400 text-sm hover:bg-blue-400/30 transition-colors duration-200"
                      >
                        <span>🐦</span>
                        <span>Twitter</span>
                      </a>
                    )}
                    {formData.website && (
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-full text-green-400 text-sm hover:bg-green-600/30 transition-colors duration-200"
                      >
                        <span>🌐</span>
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contest Stats Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-semibold text-orange-400 mb-6 flex items-center">
              <span className="mr-2">🏆</span>
              Contest Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 p-4 rounded-xl flex items-center">
                <div className="p-3 bg-orange-500/20 rounded-full mr-4">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Contest Streak</div>
                  <div className="text-white text-2xl font-bold">{profile?.streak || 0}</div>
                </div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl flex items-center">
                <div className="p-3 bg-green-500/20 rounded-full mr-4">
                  <span className="text-2xl">🏅</span>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Contests Completed</div>
                  <div className="text-white text-2xl font-bold">{profile?.contestsCompleted?.length || 0}</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Contest History</h4>
              {contestHistoryLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : contestHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Contest</th>
                        <th scope="col" className="px-6 py-3">Rank</th>
                        <th scope="col" className="px-6 py-3">Score</th>
                        <th scope="col" className="px-6 py-3">Problems Solved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestHistory.map((contest) => (
                        <tr key={contest.contestId} className="bg-gray-800/50 border-b border-gray-700">
                          <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            {contest.name}
                          </th>
                          <td className="px-6 py-4">{contest.rank}</td>
                          <td className="px-6 py-4">{contest.score}</td>
                          <td className="px-6 py-4">{contest.problemsSolved}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No contest history yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Are you sure?</h2>
            <p className="text-gray-300 mb-6">
              This action is irreversible. All your data, including submissions and profile information, will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteProfileLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                {deleteProfileLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
