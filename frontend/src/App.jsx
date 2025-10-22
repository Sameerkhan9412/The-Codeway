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
import ManageVideo from "./components/Admin/ManageVideo";
import UploadVideo from "./components/Admin/UploadVideo";
import DashboardPage from "./components/Dashboards/DashboardPage";
import PremiumDashboard from "./components/Dashboards/PremiumDashboard";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./components/common/EmailVerification"; // Import
import EmailVerificationPopup from "./components/common/EmailVerificationPopup";

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
        {isAuthenticated && user && !user.emailVerified && <EmailVerificationPopup user={user} />}
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
              path="/interview"
              element={
                isAuthenticated ? <Interview /> : <Navigate to={"/login"} />
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
              path="/premium"
              element={
                isAuthenticated ? <Premium /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/premium-dashboard"
              element={
                isAuthenticated ? <PremiumDashboard /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? <UserProfile /> : <Navigate to={"/login"} />
              }
            />
          </Routes>
        </ContestProvider>
      </div>
    </>
  );
};

export default App;
