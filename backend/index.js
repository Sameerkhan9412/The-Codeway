require("dotenv").config();
const express = require("express");//
const app = express();//
const http = require("http");
const server = http.createServer(app);
const database = require("./config/database");//
const cookieParser = require("cookie-parser");
const redisWrapper = require("./config/redis");
const { initializeSocket } = require("./config/socket");
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemRoutes");
const rateLimiter = require("./middleware/rateLimiter");
const submissionRouter = require("./routes/submit")
const cors = require("cors");
const aiRouter = require("./routes/AiChat");
const payRoute = require("./routes/payment");
const interviewRouter = require("./routes/aiInterview");
const contestRouter = require("./routes/contestRoute");
const playlistRouter = require("./routes/playlistRoute");
const discussionRouter = require("./routes/discussionRoute");
const dsaRouter = require("./routes/dsa");

const { autoFinalizeContestRankings } = require("./controllers/leaderboardController");
const cron = require("node-cron");
const videoRouter = require("./routes/video");


const PORT_NO = process.env.PORT_NO;

app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(cookieParser());
// app.use(rateLimiter)

// routing.
app.get("/",(req,res)=>{//
    return res.status(200).json({
        success:true,
        message:"server is running .......... 🟢 🏃‍♀️‍➡️🏃‍➡️"
    })
})
app.use("/api/user", authRouter);
app.use("/api/problem", problemRouter);
app.use("/api/submission", submissionRouter)
app.use("/api/ai", aiRouter)
app.use("/api/video", videoRouter);
app.use("/api/payments", payRoute);
app.use("/api/ai", interviewRouter);
app.use("/api/contest", contestRouter)
app.use('/api/playlists', playlistRouter);
app.use('/api/discussions', discussionRouter);
app.use("/api/dsa", dsaRouter);

const initialConnection = async () => {
    try {
        // Connect to MongoDB
        await database();

        // Initialize Socket.IO
        const io = initializeSocket(server);

        // Schedule leaderboard auto-finalization every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            autoFinalizeContestRankings();
        });

        // Start the server regardless of Redis connection status
        server.listen(PORT_NO, () => {
            console.log(`Server is running on port ${PORT_NO}`);
        });

        // Try to connect to Redis, but don't block server startup
        try {
            await redisWrapper.connect();
            // Redis connection success is logged by the event handler in redis.js
        } catch (redisErr) {
            // The application will continue running, and Redis will attempt to reconnect
        }
    } catch (err) {
        process.exit(1); // Exit if MongoDB connection fails
    }
}


initialConnection();
