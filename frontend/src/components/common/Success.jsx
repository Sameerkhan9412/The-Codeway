// Success.jsx
import React from "react";
import {
  Check,
  Zap,
  Gift,
  Home,
  ArrowRight,
} from "lucide-react";

const Success = ({ showSuccess, purchasedPlan, redirectCount, handleGoHome }) => {
  if (!showSuccess || !purchasedPlan) {
    return null;
  }

  if (purchasedPlan.name === "Tokens") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl animate-pulse delay-300"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-green-400/5 rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-teal-400/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-2xl w-full relative z-10 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white relative">
            <span className="bg-gradient-to-r from-green-400 via-teal-500 to-green-400 bg-clip-text text-transparent animate-pulse">
              🎉 Success!
            </span>
          </h1>
          <p className="text-2xl text-slate-300 mb-3 font-medium">
            Tokens Purchased
          </p>
          <p className="text-lg text-slate-400 mb-8">
            100 additional tokens have been added to your account.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <button
              onClick={handleGoHome}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-500 hover:orange-green-600 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 group relative overflow-hidden"
            >
              <Home className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Go to Dashboard</span>
              <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </button>

            <div className="flex-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
              <div className="text-center relative z-10">
                <p className="text-slate-400 text-sm mb-2">
                  Auto-redirecting in
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center relative">
                    <span className="text-white font-bold text-lg">
                      {redirectCount}
                    </span>
                    <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin"></div>
                  </div>
                  <span className="text-slate-300 font-medium">seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-red-500/5 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-orange-400/5 rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-red-400/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white relative">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent animate-pulse">
              🎉 Success!
            </span>
          </h1>

          <p className="text-2xl text-slate-300 mb-3 font-medium">
            Welcome to{" "}
            <span className="text-orange-400 font-bold">CodeWay Premium!</span>
          </p>
          <p className="text-lg text-slate-400">
            Your{" "}
            <span className="text-orange-400 font-semibold">
              {purchasedPlan.name}
            </span>{" "}
            plan is now active
          </p>
        </div>

        {/* Plan Details */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8 relative overflow-hidden group hover:bg-slate-800/60 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div
              className={`w-20 h-20 rounded-xl bg-gradient-to-br ${purchasedPlan.color} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}
            >
              {purchasedPlan.icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">
                {purchasedPlan.name} Plan
              </h3>
              <p className="text-slate-400 text-lg">
                ₹{purchasedPlan.price}/month
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-400" />
                Your Benefits
              </h4>
              {purchasedPlan.features
                .slice(0, Math.ceil(purchasedPlan.features.length / 2))
                .map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 group/item hover:bg-slate-700/30 rounded-lg p-2 transition-all duration-200"
                  >
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                    <span className="text-slate-300 group-hover/item:text-white transition-colors duration-200">
                      {feature}
                    </span>
                  </div>
                ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                And More
              </h4>
              {purchasedPlan.features
                .slice(Math.ceil(purchasedPlan.features.length / 2))
                .map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 group/item hover:bg-slate-700/30 rounded-lg p-2 transition-all duration-200"
                  >
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                    <span className="text-slate-300 group-hover/item:text-white transition-colors duration-200">
                      {feature}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGoHome}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Home className="w-6 h-7 relative z-10" />
            <span className="relative z-10">Go to Dashboard</span>
            <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
          </button>

          <div className="flex-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
            <div className="text-center relative z-10">
              <p className="text-slate-400 text-sm mb-2">
                Auto-redirecting in
              </p>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center relative">
                  <span className="text-white font-bold text-lg">
                    {redirectCount}
                  </span>
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin"></div>
                </div>
                <span className="text-slate-300 font-medium">seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-4 h-4 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-16 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-orange-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping delay-1200"></div>
        <div className="absolute bottom-16 left-1/3 w-2 h-2 bg-red-400 rounded-full animate-bounce delay-1500"></div>

        <div className="absolute top-1/4 left-16 text-yellow-400 text-2xl animate-pulse">
          ⭐
        </div>
        <div className="absolute top-1/3 right-16 text-orange-400 text-xl animate-bounce delay-300">
          ✨
        </div>
        <div className="absolute bottom-1/4 left-12 text-pink-400 text-lg animate-pulse delay-500">
          💫
        </div>
        <div className="absolute bottom-1/3 right-12 text-purple-400 text-2xl animate-bounce delay-700">
          🌟
        </div>
      </div>
    </div>
  );
};

export default Success;
