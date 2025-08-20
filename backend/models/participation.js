const mongoose = require("mongoose");
const { Schema } = mongoose;

const participationSchema = new mongoose.Schema({
    contest:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "contest"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("participation" , participationSchema);