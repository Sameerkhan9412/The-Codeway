import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfile } from '../../slice/authSlice';
import { Crown, Key, Zap, Shield, ArrowLeft } from 'lucide-react';
import PaymentHistory from './PaymentHistory';

const PremiumDashboard = () => {
  const dispatch = useDispatch();
  const { user, profile, profileLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <span className="loading loading-spinner loading-lg text-orange-500"></span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Crown className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              Premium Dashboard
            </h1>
          </div>
          <Link to="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* API Token Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">API Access</h2>
              </div>
              <p className="text-slate-400 mb-4">
                Use your personal API token to integrate Codexa with your applications.
              </p>
              <div className="mt-4 p-4 bg-slate-900 rounded-lg font-mono text-sm text-green-400 break-all border border-slate-700">
                {profile?.apiToken || 'No API token found.'}
              </div>
              <button className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Generate New Token
              </button>
            </div>

            {/* Usage Statistics Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Usage Statistics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm">AI Doubt Tokens</p>
                  <p className="text-3xl font-bold text-blue-400">{profile?.tokensLeft}</p>
                  <p className="text-slate-500 text-xs mt-1">tokens remaining</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm">AI Interview Sessions</p>
                  <p className="text-3xl font-bold text-blue-400">Unlimited</p>
                  <p className="text-slate-500 text-xs mt-1">for premium members</p>
                </div>
              </div>
            </div>
            <PaymentHistory />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Your Plan Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-700/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Your Plan</h2>
              </div>
              <p className="text-yellow-300 text-lg font-semibold">Premium Member</p>
              <p className="text-slate-400 mt-2">
                You have access to all exclusive features.
              </p>
              <button className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Coming Soon
              </button>
            </div>

            {/* Premium Features Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Exclusive Features</h2>
              </div>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>Unlimited AI Doubts & Assistance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>AI-Powered Mock Interviews</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>Advanced Performance Analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>Priority Customer Support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>Exclusive Access to New Features</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
