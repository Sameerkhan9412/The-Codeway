import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { verifyEmailOTPThunk, requestEmailVerificationOTPThunk } from "../../slice/authSlice";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

const EmailVerification = ({ email, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const dispatch = useDispatch();
  const {
    verifyEmailOTPLoading,
    verifyEmailOTPError,
    requestEmailVerificationOTPLoading,
    requestEmailVerificationOTPError,
  } = useSelector((state) => state.auth);
  
  // Set initial cooldown when component mounts
  useEffect(() => {
    setResendDisabled(true);
    setCountdown(30); // 30 second initial cooldown
  }, []);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Verification code must be 6 digits");
      return;
    }
    
    setLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log("Verifying code:", { email, otp });
      const resultAction = await dispatch(verifyEmailOTPThunk({ email, otp }));
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        toast.success("Email verified successfully");
        onVerified(otp);
      } else if (resultAction.payload) {
        toast.error(resultAction.payload.message || "Verification failed");
      } else {
        toast.error("Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed");
      
      // If multiple failed attempts, suggest resending
      if (verificationAttempts >= 2 && !resendDisabled) {
        toast.info("Having trouble? Try resending the verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setResendDisabled(true);
    setCountdown(60); // 60 second cooldown after resend
    
    try {
      console.log("Resending verification code to:", email);
      const resultAction = await dispatch(requestEmailVerificationOTPThunk(email));
      
      if (resultAction.meta.requestStatus === 'fulfilled') {
        toast.success("New verification code sent to your email");
        setOtp(""); // Clear the input field for new code
        setVerificationAttempts(0); // Reset attempts counter
      } else if (resultAction.payload) {
        toast.error(resultAction.payload.message || "Failed to send new verification code");
      } else {
        toast.error("Failed to send new verification code");
      }
    } catch (error) {
      console.error("Resend verification code error:", error);
      toast.error("Failed to send new verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>
      
      {/* Back button */}
      <button 
        onClick={handleGoBack}
        className="absolute top-6 left-6 hover:text-orange-400 flex items-center text-gray-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>
      
      <div className="relative max-w-md w-full">
        {/* Orange accent line at top */}
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>
        
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-b-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Verify Your Email</h2>
          
          <div className="mb-6 text-gray-300 text-center">
            <p>A verification code has been sent to:</p>
            <p className="font-semibold text-white break-all">{email}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter 6-digit verification code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••"
                autoFocus
              />
              {verifyEmailOTPError && (
                <div className="mt-2 text-red-400 text-sm flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{verifyEmailOTPError.message || verifyEmailOTPError}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {verifyEmailOTPLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Verify Email
                </div>
              )}
            </button>
            
            <button
              onClick={handleResend}
              disabled={loading || resendDisabled}
              className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendDisabled 
                ? `Resend code (${countdown}s)` 
                : loading 
                  ? "Sending..." 
                  : "Resend verification code"}
            </button>
            
            <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
              <h3 className="text-sm font-medium text-white mb-2">Having trouble?</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Check your spam or junk folder</li>
                <li>• Verify you entered the correct email address</li>
                <li>• Wait a few minutes and try resending the code</li>
                <li>• If problems persist, contact support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
