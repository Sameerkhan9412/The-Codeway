const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeaderboardSchema = new Schema({
    contestId: {
        type: Schema.Types.ObjectId,
        ref: "contest",
        required: true,
    },
    rankings: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "user",
                required: true,
            },
            rank: {
                type: Number,
                required: true,
            },
            score: {
                type: Number,
                default: 0,
            },
            problemsSolved: {
                type: Number,
                default: 0,
            },
            totalRuntime: {
                type: Number, // milliseconds
                default: 0,
            },
            submissions: [
                {
                    problemId: {
                        type: Schema.Types.ObjectId,
                        ref: "problem",
                    },
                    status: {
                        type: String,
                        enum: ["Accepted", "Wrong Answer", "Compiler Error", "Not Attempted","Processing"],
                        default: "Not Attempted",
                    },
                    score: {
                        type: Number,
                        default: 0,
                    },
                    attempts: {
                        type: Number,
                        default: 0,
                    },
                    bestRuntime: {
                        type: Number,
                        default: 0,
                    },
                    submissionTime: {
                        type: Date,
                    },
                }
            ],
        }
    ],
    isFinalized: {
        type: Boolean,
        default: false,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Create index for efficient queries
LeaderboardSchema.index({ contestId: 1 });

const Leaderboard = mongoose.model("leaderboard", LeaderboardSchema);
module.exports = Leaderboard;