import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useSelector, useDispatch } from "react-redux";
import { loginUser, getProfile, googleLoginUser, requestEmailVerificationOTPThunk } from "../../slice/authSlice";
import { toast } from "react-toastify";
import { EyeOff, Eye, ArrowLeft, AlertCircle } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import EmailVerification from "./EmailVerification";

// Zod schema without confirmPassword
const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

const Login = () => {
  const [showPassword, setShowpassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(loginUser(data));
      console.log('Login dispatch result:', res);
      
      if (res?.meta?.requestStatus === "fulfilled") {
        console.log('Login successful, token:', res.payload.token);
        toast.success("Logged In Successfully");
        await dispatch(getProfile());
      } else if (res?.payload?.needsVerification) {
        // Handle unverified email case
        console.log('Email not verified:', res.payload.email);
        toast.warning("Your email is not verified. Please verify to continue.");
        setUnverifiedEmail(res.payload.email);
        setShowVerification(true); // Directly show verification page
      } else {
        const errorMsg = res?.payload?.message || "Login failed";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Failed to Login");
    }
  };
  
  const handleResendVerification = async () => {
    const email = unverifiedEmail || getValues("emailId");
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    
    try {
      const otpRes = await dispatch(requestEmailVerificationOTPThunk(email));
      if (otpRes?.meta?.requestStatus === "fulfilled") {
        toast.success("Verification code sent to your email.");
        setUnverifiedEmail(email);
        setShowVerification(true);
      } else {
        toast.error("Failed to send verification code. Please try again.");
      }
    } catch (err) {
      console.error("Verification request error:", err);
      toast.error("Failed to request verification code");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.access_token;
      const res = await dispatch(googleLoginUser(token));
      if (res?.meta?.requestStatus === "fulfilled") {
        toast.success("Logged In Successfully with Google");
        await dispatch(getProfile());
      } else if (res?.payload?.needsVerification) {
        toast.warning("Your Google account email is not verified. Please verify to continue.");
        setUnverifiedEmail(res.payload.email);
        setShowVerification(true);
      } else {
        toast.error("Google login failed");
      }
    } catch (err) {
      toast.error("Google login error");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed");
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  // Custom Google Login Button Component
  const CustomGoogleButton = () => (
    <div className="w-full">
      {/* Custom styled button */}
      <button
        type="button"
        onClick={() => login()}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center border border-gray-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] group"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-gray-700 group-hover:text-gray-900">Continue with Google</span>
      </button>
    </div>
  );

  // If showing verification screen, render EmailVerification component
  if (showVerification) {
    return (
      <EmailVerification
        email={unverifiedEmail}
        onVerified={(otp) => {
          // After verification, redirect to login or try to log in automatically
          toast.success("Email verified successfully! You can now log in.");
          setShowVerification(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>

      {/* Back to Home button */}
      <NavLink to="/">
        <button className="absolute top-6 left-6 hover:text-orange-400 flex items-center text-gray-400 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </NavLink>

      <form
        className="relative w-full max-w-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative w-full max-w-md">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>

          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-b-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6"></div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">Join CodeWay for Challenges</p>
            </div>

            {/* Email verification notice */}
            {error && error.includes("not verified") && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-200 text-sm font-medium">Email not verified</p>
                  <p className="text-gray-300 text-sm mt-1">Please verify your email to continue.</p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium"
                  >
                    Resend verification code
                  </button>
                </div>
              </div>
            )}

            {/* Custom Google Login Button */}
            <CustomGoogleButton />

            <div className="flex items-center mb-6 mt-6">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="px-4 text-sm text-gray-400">
                or continue with email
              </span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  {...register("emailId")}
                  placeholder="name@company.com"
                />
                {errors.emailId && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {errors.emailId.message}
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Link
                    to="/forgotpassword"
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-12"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowpassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
              
              {/* Email verification link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                >
                  Need to verify your email?
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
