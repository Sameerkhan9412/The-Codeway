const mongoose = require("mongoose");
const { Schema } = mongoose;

const userScehma = Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
    },
    lastName: { 
        type: String,
        minLength: 3,
        maxLength: 20,
        required:false,
    },
    emailId: { 
        type: String,
        required: true,
        unique: true,
        immutable: true,
        trim: true,
        lowercase: true,
    },
    password: { 
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 6,
        max: 80,
    },
    role: {
        type: String,
        enum: ["user", "admin"], //user admin/user.
        default: "user",
    },
    problemSolved: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "problem",
                solvedAt: { type: Date, default: Date.now }
            },
        ]
    },
    contestsCompleted: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "contest",
                completedAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    tokensLeft:
    {
        type: Number,
        default: 10
    },
    premiumExpiry: { 
        type: Date,
        default: null
    },
    profileImage: {
        type: String,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    points: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    lastContestCompletion: {
        type: Date,
        default: null
    },
    contestHistory: {
        type: [
            {
                contestId: {
                    type: Schema.Types.ObjectId,
                    ref: "contest"
                },
                rank: Number,
                score: Number,
                problemsSolved: Number,
                totalRuntime: Number
            }
        ],
        default: []
    },
    paymentHistory: [
        {
            orderId: { type: String },
            paymentId: { type: String },
            amount: { type: Number },
            plan: { type: String },
            date: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });//

userScehma.post("findOneAndDelete", async (userInfo) => {
    if (userInfo)
        await mongoose.model("submission").deleteMany({ userId: userInfo._id });
})

// No need for a compound index since we're using $addToSet in the controller
// which already ensures uniqueness of problemIds within the problemSolved array

const User = mongoose.model("user", userScehma);//
module.exports = User;
