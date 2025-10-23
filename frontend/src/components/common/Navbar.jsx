import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logutUser, setUserStats, getProfile } from "../../slice/authSlice"; // Import setUserStats
import { useNavigate, Link, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import {
  User,
  ChevronDown,
  Menu,
  X,
  Code2,
  Trophy,
  MessageCircle,
  Briefcase,
  Store,
  Search,
  Settings,
  LogOut,
  Shield,
  Bell,
  Crown,
  Star,
  Zap, // Added Zap icon for streak
  ScanEye,
  LayoutDashboard
} from "lucide-react";
import CodewayLogo from "../../utils/logo/codeway-logo.png";
import { getSocket } from "../../utils/socket"; // Import socket utility

const Navbar = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsopen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { isAuthenticated, loading, error, user, profileLoading } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Entry animation
  useEffect(() => {
    setIsVisible(true);
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch]);

  // Setup socket listener for userStatsUpdate
  useEffect(() => {
    const io = getSocket();

    if (io && user) {
      const userId = user._id || user.id;
      io.on("userStatsUpdate", (data) => {
        if (data && data.points !== undefined && data.streak !== undefined) {
          dispatch(setUserStats({ points: data.points, streak: data.streak }));
        }
      });

      // Cleanup on unmount
      return () => {
        io.off("userStatsUpdate");
      };
    }
  }, [user]);

  const logout = () => {
    dispatch(logutUser());
    navigate("/login");
    toast.info("Logout Successfully");
    setIsopen(false);
  };

  const navItems = [
    // { to: "/explore", label: "Explore", icon: Search },
    { to: "/problems", label: "Problems", icon: Code2 },
    { to: "/contest", label: "Contest", icon: Trophy },
    { to: "/discuss", label: "Discuss", icon: MessageCircle },
    { to: "/interview", label: "Interview", icon: Briefcase },
    { to: "/visualizer", label: "Visualizer", icon: ScanEye },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".user-dropdown")) {
        setIsopen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Navbar Spacer - ensures content doesn't get hidden under navbar */}
      <div className="h-24"></div>

      {/* Main Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl transition-all duration-300 ease-in-out ${
            scrolled
              ? "mt-1 backdrop-blur-xl bg-slate-900/98 border border-slate-700/50 shadow-2xl shadow-black/20"
              : "mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/30"
          } rounded-2xl mx-4`}
        >
          <div className="flex items-center justify-between py-3 px-6">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <NavLink
                to="/"
                className="group relative overflow-hidden flex items-center space-x-3"
              >
                <div className="relative">
                  <img
                    className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                    src={CodewayLogo}
                    alt="The Codeway"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-lg font-bold mt-[-7px] bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    CodeWay
                  </h1>
                </div>
              </NavLink>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.to}
                    className={`transition-all duration-300 ease-out ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${(index + 1) * 100}ms`,
                    }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `relative px-3 py-2 text-sm font-medium transition-all duration-200 group rounded-lg flex items-center space-x-2 ${
                          isActive
                            ? "text-orange-400 bg-orange-400/10 border border-orange-400/20"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                        }`
                      }
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="relative z-10">{item.label}</span>
                      <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                    </NavLink>
                  </div>
                );
              })}
            </nav>

            {/* Right Side - User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-4">
              {/* Premium Status (if authenticated) */}
              {isAuthenticated && (
                <div>
                  {user?.isPremium ? (
                    user.tokensLeft > 0 ? (
                      // Premium User - Show Token Count
                      <div></div>
                    ) : (
                      // Premium User, No Tokens - Show Buy Tokens Button
                      <NavLink to="/premium" className="cursor-pointer">
                        <button className="relative p-2 text-slate-40 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl">
                          <span className="flex items-center space-x-1">
                            <Crown className="w-4 h-4" />
                            <span>Buy Tokens</span>
                          </span>
                        </button>
                      </NavLink>
                    )
                  ) : (
                    // Non-Premium User - Show Upgrade Button
                    <NavLink to="/premium" className="cursor-pointer">
                      <button className="relative p-2 text-slate-40 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl">
                        <span className="flex items-center space-x-1">
                          <Crown className="w-4 h-4" />
                          <span>Buy Premium</span>
                        </span>
                      </button>
                    </NavLink>
                  )}
                </div>
              )}

              {/* Streak Display */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2 px-3 py-2 min-w-[70px] justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="text-xl font-semibold text-white">
                    {user?.streak}
                  </span>
                </div>
              )}

              {/* User Menu */}
              <div className="relative user-dropdown">
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setIsopen(!isOpen)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        scrolled
                          ? "bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm"
                          : "bg-slate-800/60 hover:bg-slate-700/70"
                      } border border-slate-600/50 hover:border-slate-500/50 shadow-lg hover:shadow-xl group`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center relative overflow-hidden ${
                          user?.isPremium
                            ? "bg-gradient-to-br from-yellow-500 to-amber-500"
                            : "bg-gradient-to-br from-orange-500 to-amber-500"
                        }`}
                      >
                        {user?.profileImage ? (
                          <img
                            src={
                              user.profileImage.startsWith("http")
                                ? user.profileImage
                                : `${import.meta.env.VITE_BACKEND_URL}${
                                    user.profileImage
                                  }`
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        )}
                        {user?.isPremium && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Crown className="w-2 h-2 text-slate-800" />
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-white flex items-center space-x-1">
                          <span>{user?.firstName}</span>
                        
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {user?.isPremium
                            ? "Premium Member"
                            : user?.role || "User"}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-all duration-200 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Enhanced Dropdown */}
                    {isOpen && (
                      <div className="absolute right-0 mt-3 w-80 opacity-100 translate-y-0 scale-100 transition-all duration-300 ease-out">
                        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
                          {/* Header */}
                          <div
                            className={`p-6 border-b border-slate-600/30 ${
                              user?.isPremium
                                ? "bg-gradient-to-r from-yellow-900/30 to-amber-900/30"
                                : "bg-gradient-to-r from-slate-800 to-slate-700"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden ${
                                  user?.isPremium
                                    ? "bg-gradient-to-br from-yellow-500 to-amber-500"
                                    : "bg-gradient-to-br from-orange-500 to-amber-500"
                                }`}
                              >
                                {user?.profileImage ? (
                                  <img
                                    src={
                                      user.profileImage.startsWith("http")
                                        ? user.profileImage
                                        : `${import.meta.env.VITE_BACKEND_URL}${
                                            user.profileImage
                                          }`
                                    }
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-sm font-bold">
                                    {user?.firstName
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U"}
                                  </span>
                                )}
                                {user?.isPremium && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                 
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white text-lg flex items-center space-x-2">
                                  <span>
                                    {user?.firstName} {user?.lastName}
                                  </span>
                                  {user?.isPremium && (
                                    <Crown className="w-4 h-4 text-yellow-400" />
                                  )}
                                </p>
                                <p className="text-sm text-slate-400 capitalize flex items-center space-x-2">
                                  <span>
                                    {user?.isPremium
                                      ? "Premium Member"
                                      : user?.role || "User"}
                                  </span>
                                  {user?.role === "admin" && (
                                    <Shield className="w-3 h-3" />
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-4 space-y-2">
                            {/* Profile Settings */}
                            <Link
                              to="/profile"
                              onClick={() => setIsopen(false)}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                            >
                              <Settings className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                              <div>
                                <p className="font-medium">Profile Settings</p>
                                <p className="text-xs text-slate-500">
                                  Manage your account
                                </p>
                              </div>
                            </Link>

                            <Link
                              to="/dashboard"
                              onClick={() => setIsopen(false)}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
                            >
                              <LayoutDashboard  className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                              <div>
                                <p className="font-medium">Dashboard</p>
                                <p className="text-xs text-slate-500">
                                  User Dashboard
                                </p>
                              </div>
                            </Link>

                            {/* Premium Section */}
                            {user?.isPremium ? (
                              <Link
                                to="/premium-dashboard"
                                onClick={() => setIsopen(false)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl bg-gradient-to-r from-yellow-900/30 to-amber-900/30 hover:from-yellow-800/40 hover:to-amber-800/40 border border-yellow-700/30 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-yellow-300">
                                    Premium Dashboard
                                  </p>
                                  <p className="text-xs text-yellow-400">
                                    Exclusive features
                                  </p>
                                </div>
                              </Link>
                            ) : (
                              <Link
                                to="/premium"
                                onClick={() => setIsopen(false)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl bg-gradient-to-r from-orange-900/30 to-amber-900/30 hover:from-orange-800/40 hover:to-amber-800/40 border border-orange-700/30 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-orange-300">
                                    Upgrade to Premium
                                  </p>
                                  <p className="text-xs text-orange-400">
                                    Unlock exclusive features
                                  </p>
                                </div>
                              </Link>
                            )}

                            {/* Admin Dashboard */}
                            {user?.role === "admin" && (
                              <NavLink
                                to="/admin"
                                onClick={() => setIsopen(false)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 hover:from-blue-800/40 hover:to-indigo-800/40 border border-blue-700/30 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-blue-300">
                                    Admin Dashboard
                                  </p>
                                  <p className="text-xs text-blue-400">
                                    Management panel
                                  </p>
                                </div>
                              </NavLink>
                            )}

                            {/* Divider */}
                            <div className="border-t border-slate-600/30 my-2"></div>

                            {/* Logout Button */}
                            <button
                              onClick={logout}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl text-slate-300 hover:text-white hover:bg-red-900/20 border border-transparent hover:border-red-700/30 transition-all duration-200 group"
                            >
                              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                              <div>
                                <p className="font-medium">Sign Out</p>
                                <p className="text-xs text-slate-500">
                                  See you later!
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="relative group px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      <span className="relative z-10">Login</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-slate-800/50"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-20 left-4 right-4 bg-slate-900/98 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="p-6">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "text-orange-400 bg-orange-400/10 border border-orange-400/20"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                        }`
                      }
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
