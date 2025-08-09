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
}, { timestamps: true });

const User = mongoose.model("user", userScehma);
module.exports = User;
