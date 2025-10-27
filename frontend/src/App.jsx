import React, { useEffect } from "react";
import { Route, Routes, Navigate, useParams } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./components/common/Login";
import Signup from "./components/common/Signup";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, getProfile } from "./slice/authSlice";
import Problem from "./pages/Problem";
import ProblemSolve from "./pages/ProblemSolve";
import AdminPage from "./pages/AdminPage";
import CreateProblem from "./components/Admin/CreateProblem";
import UpdateProblem from "./components/Admin/UpdateProblem";
import DeleteProblem from "./components/Admin/DeleteProblem";
import UserManagement from "./components/Admin/UserManagement";
import PlatformAnalytics from "./components/Admin/PlatformAnalytics";
import ManageVideo from "./components/Admin/ManageVideo";
import UploadVideo from "./components/Admin/UploadVideo";
import AdminContest from "./components/Admin/contest/AdminContest";
import ContestPage from "../src/pages/ContestPage";
import ContestDetail from "./components/Admin/contest/ContestDetail";
import ContestDetails from "./components/contest/ContestDetails";
import ContestProblemSolve from "./components/contest/ContestProblemSolve";
import ContestLeaderboard from "./components/contest/ContestLeaderboard";
import DashboardPage from "./components/Dashboards/DashboardPage";
import UserProfile from "./pages/UserProfile";
import { ContestProvider } from "./context/ContestContext";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./components/common/EmailVerification"; // Import
import EmailVerificationPopup from "./components/common/EmailVerificationPopup";
import { initializeSocket } from "./utils/socket";
import DoubtAI from "./components/common/DoubtAi";
import Explore from "./pages/Explore";
import DiscussionDetail from "./pages/DiscussionDetail";
import DiscussPage from "./pages/DiscussPage";
import { DSAVisualizer } from "./pages/DSAVisualizer";
import Interview from "./pages/Interview";

const ContestLeaderboardWrapper = () => {
  const { contestId } = useParams();
  return <ContestLeaderboard contestId={contestId} isContestActive={true} />;
};

const App = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
        dispatch(getProfile());
      } catch (error) {
        // Silently handle authentication errors
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        initializeSocket(token);
      }
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div>
        {isAuthenticated && user && !user.emailVerified && (
          <EmailVerificationPopup user={user} />
        )}
        <ContestProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />{" "}
            {/* New route for email verification */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <DashboardPage /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/problems"
              element={
                isAuthenticated ? <Problem /> : <Navigate to={"/login"} />
              }
            />
            <Route path="/problem/:problemId" element={<ProblemSolve />} />
            <Route
              path="/admin"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <AdminPage />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/create"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <CreateProblem />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/update"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <UpdateProblem />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/delete"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <DeleteProblem />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/users"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <UserManagement />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/analytics"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <PlatformAnalytics />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/video"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <ManageVideo />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/video"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <ManageVideo />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/contest"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <AdminContest />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/contest"
              element={
                isAuthenticated ? <ContestPage /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/contest/:contestId"
              element={
                isAuthenticated ? (
                  <ContestDetails />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/contest/:id"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <ContestDetail />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/contest/:contestId/problem/:problemId"
              element={
                isAuthenticated ? (
                  <ContestProblemSolve />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/contest/:contestId/leaderboard"
              element={
                isAuthenticated ? (
                  <ContestLeaderboardWrapper />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/admin/upload/:problemId"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <UploadVideo />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/interview"
              element={
                isAuthenticated ? <Interview /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/discuss"
              element={
                isAuthenticated ? <DiscussPage /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/discuss/:discussionId"
              element={
                isAuthenticated ? (
                  <DiscussionDetail />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
            <Route
              path="/doubt-ai"
              element={
                isAuthenticated ? <DoubtAI /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? <UserProfile /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/visualizer"
              element={
                isAuthenticated ? (
                  <DSAVisualizer />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
              
            />
          </Routes>
        </ContestProvider>
      </div>
    </>
  );
};

export default App;
