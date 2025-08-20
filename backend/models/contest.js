const mongoose = require("mongoose");
const { Schema } = mongoose;

const ContestSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    problems: [
        {
            type: Schema.Types.ObjectId,
            ref: "problem",
            required: true
        }
    ],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    date:String,
    isPublic: { type: Boolean, default: true }
}, { timestamps: true });

const Contest = mongoose.model("contest", ContestSchema);
module.exports = Contest;
