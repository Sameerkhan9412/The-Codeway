const express = require("express");
const contestController = require("../controllers/contestController");
const leaderboardController = require("../controllers/leaderboardController");
const contestSubmissionController = require("../controllers/contestSubmissionController");
const adminMiddleware = require("../middleware/adminMiddleware");
const { userMiddleware } = require("../middleware/userMiddleware");
const contestRouter = express.Router();

// Today's contest
// Temporarily replace handler with inline function for debugging
contestRouter.get("/today", contestController.getTodayContest);

contestRouter.post("/create", adminMiddleware, contestController.createContest);
contestRouter.get("/problems", adminMiddleware, contestController.getAllProblems);
contestRouter.get("/", contestController.getAllContests);
contestRouter.get("/:id", contestController.getContestById);
contestRouter.put("/update/:id", adminMiddleware, contestController.updateContest);
contestRouter.delete("/delete/:id", adminMiddleware, contestController.deleteContest);

// Problem selection
contestRouter.get("/:contestId/problems", contestController.getContestProblems);
contestRouter.get("/:contestId/problem/:problemId", contestController.getContestProblem);

// New route for contest registration
contestRouter.post("/:contestId/register", userMiddleware, contestController.registerForContest);

// New route for getting contest status
contestRouter.get("/:contestId/status", userMiddleware, contestController.getContestStatus);

// Leaderboard routes
contestRouter.get("/:contestId/leaderboard", leaderboardController.getContestLeaderboard);
contestRouter.post("/:contestId/finalize", adminMiddleware, leaderboardController.finalizeContestRankings);
contestRouter.get("/user/history", userMiddleware, leaderboardController.getUserContestHistory);

// Contest submission routes
contestRouter.post("/:contestId/problem/:problemId/submit", userMiddleware, contestSubmissionController.submitContestCode);
contestRouter.post("/:contestId/problem/:problemId/run", userMiddleware, contestSubmissionController.runContestCode);
contestRouter.get("/:contestId/problem/:problemId/submissions", userMiddleware, contestSubmissionController.getUserContestSubmissions);

module.exports = contestRouter;
