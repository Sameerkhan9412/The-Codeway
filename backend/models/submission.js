const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
        enum: ["cpp", "c++", "java", "javascript"],
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Wrong Answer", "Compiler Error"],
        default: "Pending",
    },
    runtime: {
        type: Number, // milliseconds
        default: 0,
    },
    memory: {
        type: Number, //kb
        default: 0,
    },
    errorMessage: {
        type: String,
        default: " ",
    },
    testCasesPassed: {
        type: Number,
        default: 0,
    },
    totalTestCases: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });


const Submission = mongoose.model("submission", submissionSchema);
module.exports = Submission;