const Submission = require("../models/submission");
const User = require("../models/user");

// 1. User Streaks
const getUserStreaks = async (req, res) => {
    try {
        const userId = req.result._id;
        const submissions = await Submission.find({ userId, verdict: 'ACCEPTED' }).sort({ createdAt: 1 });
        const days = new Set(submissions.map(s => new Date(s.createdAt).toISOString().slice(0, 10)));
        if (days.size === 0) return res.json({ currentStreak: 0, maxStreak: 0 });
        const sortedDays = Array.from(days).sort();
        let maxStreak = 1, currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
            const prev = new Date(sortedDays[i - 1]);
            const curr = new Date(sortedDays[i]);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        const today = new Date().toISOString().slice(0, 10);
        if (sortedDays[sortedDays.length - 1] !== today) currentStreak = 0;
        res.json({ currentStreak, maxStreak });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. User Badges
const getUserBadges = async (req, res) => {
    try {
        const userId = req.result._id;
        const submissions = await Submission.find({ userId, verdict: 'ACCEPTED' });
        const badges = [];
        if (submissions.length > 0) badges.push("First Problem Solved");
        if (submissions.length >= 7) badges.push("Weekly Streak");
        // Add more badge logic as needed
        res.json({ badges });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. User Rank
const getUserRank = async (req, res) => {
    try {
        const userId = req.result._id;
        const users = await User.find().select("problemSolved");
        const userSolved = users.find(u => u._id.equals(userId))?.problemSolved.length || 0;
        const rank = 1 + users.filter(u => (u.problemSolved?.length || 0) > userSolved).length;
        res.json({ rank, totalUsers: users.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Full Submission History
const getAllUserSubmissions = async (req, res) => {
    try {
        const userId = req.result._id;
        const submissions = await Submission.find({ userId })
            .populate('problemId', 'title difficulty')
            .sort({ createdAt: -1 });
        
        const formattedSubmissions = submissions.map(sub => ({
            ...sub.toObject(),
            title: sub.problemId ? sub.problemId.title : 'Unknown Problem',
            difficulty: sub.problemId ? sub.problemId.difficulty : 'Unknown',
        }));

        res.json({ submissions: formattedSubmissions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Heatmap Data
const getHeatmapData = async (req, res) => {
    try {
        const userId = req.result._id;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissions = await Submission.aggregate([
            {
                $match: {
                    userId: userId,
                    createdAt: { $gte: oneYearAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        res.json({ submissions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUserStreaks,
    getUserBadges,
    getUserRank,
    getAllUserSubmissions,
    getHeatmapData,
};
