import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { resetPasswordThunk } from "../slice/authSlice";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [isReset, setIsReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(resetPasswordThunk({ token, newPassword: data.password }));
      if (res?.meta?.requestStatus === "fulfilled") {
        toast.success("Password has been reset successfully.");
        setIsReset(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const errorMsg = res?.payload?.message || "Failed to reset password.";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-b-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-400">
              {isReset
                ? "Your password has been updated."
                : "Enter your new password below."}
            </p>
          </div>

          {isReset ? (
            <div className="text-center">
              <p className="text-green-400">Password reset successfully!</p>
              <p className="text-gray-400">Redirecting to login...</p>
              <Link
                to="/login"
                className="mt-4 inline-block text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  {...register("password")}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
