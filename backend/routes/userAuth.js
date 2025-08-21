const express = require("express");
const { register, getProfile, login, logout, deleteProfile, activeUsers, updateProfile, googleLogin, getAllUsers, getPlatformStats, updateAllProfileImages } = require("../controllers/userAuthenticate");
const { requestEmailVerificationOTP, verifyEmailOTP, requestPasswordResetOTP, resetPassword, changePassword } = require("../controllers/userVerification");
const { signupWithVerification, verifySignupOTP } = require("../controllers/userSignupVerification");
const { userMiddleware } = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminRegister = require("../controllers/adminAuthenticate");
const dashboardController = require("../controllers/dashboardController");
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", userMiddleware, logout);
authRouter.post("/admin/register", adminMiddleware, adminRegister);
authRouter.get("/getProfile", userMiddleware, getProfile);
authRouter.put("/updateProfile", userMiddleware, updateProfile);
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile);
authRouter.get("/activeuser", adminMiddleware, activeUsers);
authRouter.get("/users", adminMiddleware, getAllUsers);
authRouter.get("/platform-stats", adminMiddleware, getPlatformStats);
authRouter.put("/admin/update-all-profile-images", adminMiddleware, updateAllProfileImages);

// New route for Google login
authRouter.post("/googleLogin", googleLogin);

// New routes for email verification and password reset
authRouter.post("/requestEmailVerificationOTP", requestEmailVerificationOTP);
authRouter.post("/verifyEmailOTP", verifyEmailOTP);

// New signup with email verification routes
authRouter.post("/signupWithVerification", signupWithVerification);
authRouter.post("/verifySignupOTP", verifySignupOTP);
authRouter.post("/forgot-password", requestPasswordResetOTP);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.post("/changePassword", userMiddleware, changePassword);

// Dashboard endpoints
authRouter.get("/streaks", userMiddleware, dashboardController.getUserStreaks);
authRouter.get("/badges", userMiddleware, dashboardController.getUserBadges);
authRouter.get("/rank", userMiddleware, dashboardController.getUserRank);
authRouter.get("/submissions", userMiddleware, dashboardController.getAllUserSubmissions);
authRouter.get("/heatmap", userMiddleware, dashboardController.getHeatmapData);

// check auth for user enters the website for checking the user is registered or if register then redirect to home page not then login/signup page
//so here token checking
authRouter.get("/check", userMiddleware, (req, res) => {
    try {
        const reply = {
            firstName: req.result.firstName,
            emailId: req.result.emailId,
            _id: req.result._id,
            role: req.result.role,
            profileImage: req.result.profileImage || null
        };

        res.status(200).json({
            user: reply,
            message: "Valid User"
        });
    } catch (err) {
        res.status(500).send(" Error Occured " + err);
    }
});

module.exports = authRouter;
