const Contest = require("../models/contest");
const ContestSubmission = require("../models/contestSubmission");
const Leaderboard = require("../models/leaderboard");
const { getIO } = require("../config/socket");
const User = require("../models/user");

// Helper function to generate rankings from submissions
const generateRankings = (submissions) => {
    const userSubmissions = {};

    // First, iterate through all submissions to find the best one for each problem for each user
    submissions.forEach(submission => {
        if (!submission.userId) return; // Skip if userId is null
        const userId = submission.userId._id.toString();
        if (!userSubmissions[userId]) {
            userSubmissions[userId] = {
                user: submission.userId,
                problems: {},
            };
        }

        const problemId = submission.problemId._id.toString();
        const existingSubmission = userSubmissions[userId].problems[problemId];

        // We only update if there's no existing submission,
        // or if the new submission is 'Accepted' and the old one wasn't,
        // or if both are 'Accepted' and the new one has a better runtime.
        if (!existingSubmission ||
            (submission.status === 'Accepted' &&
                (existingSubmission.status !== 'Accepted' ||
                    submission.runtime < existingSubmission.runtime))) {

            userSubmissions[userId].problems[problemId] = {
                problem: submission.problemId,
                status: submission.status,
                score: submission.score,
                runtime: submission.runtime,
                submissionTime: submission.submissionTime || submission.createdAt
            };
        }
    });

    // Now, calculate totals for each user based on their best submissions
    const rankedUsers = Object.values(userSubmissions).map(userData => {
        let totalScore = 0;
        let problemsSolved = 0;
        let totalRuntime = 0;

        Object.values(userData.problems).forEach(problem => {
            if (problem.status === 'Accepted') {
                problemsSolved++;
                totalScore += problem.score || 0;
                totalRuntime += problem.runtime || 0;
            }
        });

        return {
            userId: userData.user,
            score: totalScore,
            problemsSolved: problemsSolved,
            totalRuntime: totalRuntime,
            submissions: Object.values(userData.problems).map(p => ({
                problemId: p.problem._id,
                status: p.status,
                score: p.score,
                bestRuntime: p.runtime,
                submissionTime: p.submissionTime
            }))
        };
    });

    // Sort the users to determine rank
    return rankedUsers
        .sort((a, b) => {
            // Sort by score (descending)
            if (b.score !== a.score) return b.score - a.score;
            // Then by problems solved (descending)
            if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
            // Then by runtime (ascending)
            return a.totalRuntime - b.totalRuntime;
        })
        .map((user, index) => ({
            ...user,
            rank: index + 1
        }));
};

const updateUserContestStats = async (rankings, contestId) => {
    for (const rank of rankings) {
        const user = await User.findById(rank.userId);
        if (user) {
            const contestIndex = user.contestHistory.findIndex(
                (history) => history.contestId.toString() === contestId.toString()
            );

            if (contestIndex > -1) {
                // Update existing entry
                user.contestHistory[contestIndex] = {
                    contestId,
                    rank: rank.rank,
                    score: rank.score,
                    problemsSolved: rank.problemsSolved,
                    totalRuntime: rank.totalRuntime
                };
            } else {
                // Add new entry
                user.contestHistory.push({
                    contestId,
                    rank: rank.rank,
                    score: rank.score,
                    problemsSolved: rank.problemsSolved,
                    totalRuntime: rank.totalRuntime
                });
            }
            
            // Update streak
            const today = new Date().setHours(0, 0, 0, 0);
            const lastCompletion = user.lastContestCompletion ? new Date(user.lastContestCompletion).setHours(0, 0, 0, 0) : null;

            if (lastCompletion !== today) {
                user.streak = (lastCompletion === today - 86400000) ? user.streak + 1 : 1;
                user.lastContestCompletion = new Date();
            }

            if (!user.contestsCompleted.some(c => c.toString() === contestId.toString())) {
                user.contestsCompleted.push(contestId);
            }
            
            await user.save();

            // Emit stats update to the specific user
            const io = getIO();
            if (io) {
                io.to(user._id.toString()).emit('userStatsUpdate', {
                    points: user.points,
                    streak: user.streak
                });
            }
        }
    }
};

// Finalize contest rankings automatically after contest ends
exports.autoFinalizeContestRankings = async () => {
    try {
        const now = new Date();

        // Find contests that have ended but not finalized
        const contestsToFinalize = await Contest.find({
            endTime: { $lte: now }
        });

        for (const contest of contestsToFinalize) {
            const existingLeaderboard = await Leaderboard.findOne({ contestId: contest._id, isFinalized: true });
            if (existingLeaderboard) {
                continue; // Already finalized
            }

            // Get all submissions for this contest
            const submissions = await ContestSubmission.find({ contestId: contest._id })
                .populate('userId', 'name email profileImage')
                .populate('problemId', 'title difficulty');

            // Generate rankings
            const rankings = generateRankings(submissions);

            // Create and save finalized leaderboard
            const leaderboard = new Leaderboard({
                contestId: contest._id,
                rankings,
                isFinalized: true,
                lastUpdated: new Date()
            });

            await leaderboard.save();
            await updateUserContestStats(rankings, contest._id);
                console.log(`Auto-finalized leaderboard for contest ${contest._id}`);
                
                // Emit leaderboard update via Socket.IO
                try {
                    const io = getIO();
                    
                    // Create a leaderboard update object with the finalized data
                    const leaderboardUpdate = {
                        contestId: contest._id,
                        leaderboard: leaderboard
                    };
                    
                    // Emit the update to all connected clients
                    io.emit('leaderboardUpdate', leaderboardUpdate);
                    console.log(`Emitted auto-finalized leaderboardUpdate for contest ${contest._id}`);
                } catch (socketError) {
                    console.error("Socket.IO emission error:", socketError);
                    // Continue even if socket emission fails
                }
        }
    } catch (error) {
        console.error("❌ Error auto-finalizing contest rankings:", error);
    }
};

const getRealtimeLeaderboard = async (contestId) => {
    const submissions = await ContestSubmission.find({ contestId })
        .populate('userId', 'name email profileImage')
        .populate('problemId', 'title difficulty');
    
    const rankings = generateRankings(submissions);

    return {
        contestId,
        rankings,
        isFinalized: false,
        lastUpdated: new Date()
    };
};

exports.updateAndEmitLeaderboard = async (contestId) => {
    try {
        const io = getIO();
        if (io) {
            const leaderboard = await getRealtimeLeaderboard(contestId);
            io.emit('leaderboardUpdate', { contestId, leaderboard });
            console.log(`Emitted leaderboardUpdate for contest ${contestId}`);
        }
    } catch (error) {
        console.error(`Error updating and emitting leaderboard for contest ${contestId}:`, error);
    }
};

exports.getContestLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        const existingLeaderboard = await Leaderboard.findOne({ contestId, isFinalized: true })
            .populate({
                path: 'rankings.userId',
                select: 'name email profileImage'
            });

        if (existingLeaderboard) {
            return res.status(200).json({
                success: true,
                leaderboard: existingLeaderboard,
                contest: {
                    name: contest.name,
                    startTime: contest.startTime,
                    endTime: contest.endTime,
                    isActive: new Date() >= new Date(contest.startTime) && new Date() <= new Date(contest.endTime)
                }
            });
        }

        const leaderboard = await getRealtimeLeaderboard(contestId);

        const isActive = new Date() >= new Date(contest.startTime) && new Date() <= new Date(contest.endTime);
        if (isActive) {
            exports.updateAndEmitLeaderboard(contestId);
        }

        return res.status(200).json({
            success: true,
            leaderboard,
            contest: {
                name: contest.name,
                startTime: contest.startTime,
                endTime: contest.endTime,
                isActive
            }
        });

    } catch (error) {
        console.error("❌ Error getting contest leaderboard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Finalize contest rankings (admin only)
exports.finalizeContestRankings = async (req, res) => {
    try {
        const { contestId } = req.params;

        // Check if contest exists
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        // Check if contest has ended
        if (new Date() < new Date(contest.endTime)) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot finalize leaderboard before contest ends" 
            });
        }

        // Check if leaderboard is already finalized
        const existingLeaderboard = await Leaderboard.findOne({ contestId, isFinalized: true });
        if (existingLeaderboard) {
            return res.status(400).json({ 
                success: false, 
                message: "Leaderboard is already finalized" 
            });
        }

        // Get all submissions for this contest
        const submissions = await ContestSubmission.find({ contestId })
            .populate('userId', 'name email profileImage')
            .populate('problemId', 'title difficulty');

        // Group submissions by user
        const userSubmissions = {};
        submissions.forEach(submission => {
            const userId = submission.userId._id.toString();
            if (!userSubmissions[userId]) {
                userSubmissions[userId] = {
                    user: submission.userId,
                    problems: {},
                    totalScore: 0,
                    problemsSolved: 0,
                    totalRuntime: 0
                };
            }

            const problemId = submission.problemId._id.toString();
            if (!userSubmissions[userId].problems[problemId] || 
                (submission.status === 'Accepted' && 
                 (userSubmissions[userId].problems[problemId].status !== 'Accepted' || 
                  submission.runtime < userSubmissions[userId].problems[problemId].runtime))) {
                
                // Update problem data with this submission
                userSubmissions[userId].problems[problemId] = {
                    problem: submission.problemId,
                    status: submission.status,
                    score: submission.score,
                    runtime: submission.runtime,
                    attempts: (userSubmissions[userId].problems[problemId]?.attempts || 0) + 1,
                    submissionTime: submission.submissionTime || submission.createdAt
                };

                // Update user totals
                if (submission.status === 'Accepted') {
                    // If this is a new accepted solution or better runtime
                    if (!userSubmissions[userId].problems[problemId].counted) {
                        userSubmissions[userId].problemsSolved++;
                        userSubmissions[userId].problems[problemId].counted = true;
                    }
                }

                userSubmissions[userId].totalScore = Object.values(userSubmissions[userId].problems)
                    .reduce((sum, p) => sum + (p.score || 0), 0);
                
                userSubmissions[userId].totalRuntime = Object.values(userSubmissions[userId].problems)
                    .filter(p => p.status === 'Accepted')
                    .reduce((sum, p) => sum + (p.runtime || 0), 0);
            } else {
                // Increment attempts counter even if not the best submission
                userSubmissions[userId].problems[problemId].attempts = 
                    (userSubmissions[userId].problems[problemId].attempts || 0) + 1;
            }
        });

        // Convert to array and sort
        const rankings = Object.values(userSubmissions)
            .map(data => ({
                userId: data.user._id,
                score: data.totalScore,
                problemsSolved: data.problemsSolved,
                totalRuntime: data.totalRuntime,
                submissions: Object.values(data.problems).map(p => ({
                    problemId: p.problem._id,
                    status: p.status,
                    score: p.score,
                    attempts: p.attempts || 1,
                    bestRuntime: p.runtime,
                    submissionTime: p.submissionTime
                }))
            }))
            .sort((a, b) => {
                // Sort by score (descending)
                if (b.score !== a.score) return b.score - a.score;
                // Then by problems solved (descending)
                if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
                // Then by runtime (ascending)
                return a.totalRuntime - b.totalRuntime;
            })
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));

        // Create and save finalized leaderboard
        const leaderboard = new Leaderboard({
            contestId,
            rankings,
            isFinalized: true,
            lastUpdated: new Date()
        });

        await leaderboard.save();
        await updateUserContestStats(rankings, contestId);

        // Emit leaderboard update via Socket.IO
        try {
            const io = getIO();
            
            // Create a leaderboard update object with the finalized data
            const leaderboardUpdate = {
                contestId,
                leaderboard: leaderboard
            };
            
            // Emit the update to all connected clients
            io.emit('leaderboardUpdate', leaderboardUpdate);
            console.log(`Emitted finalized leaderboardUpdate for contest ${contestId}`);
        } catch (socketError) {
            console.error("Socket.IO emission error:", socketError);
            // Continue with response even if socket emission fails
        }

        return res.status(200).json({
            success: true,
            message: "Contest leaderboard finalized successfully",
            leaderboard
        });

    } catch (error) {
        console.error("❌ Error finalizing contest rankings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's contest history and performance
exports.getUserContestHistory = async (req, res) => {
    try {
        const userId = req.result._id; // From auth middleware

        const user = await User.findById(userId).populate({
            path: 'contestHistory.contestId',
            select: 'name startTime'
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const contestHistory = user.contestHistory
            .filter(history => history.contestId) // Filter out null contestIds
            .map(history => ({
                contestId: history.contestId._id,
                name: history.contestId.name,
                date: history.contestId.startTime,
                rank: history.rank,
                score: history.score,
                problemsSolved: history.problemsSolved,
            })).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.status(200).json({
            success: true,
            contestHistory
        });
        
    } catch (error) {
        console.error("❌ Error getting user contest history:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
