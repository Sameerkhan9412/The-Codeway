require("dotenv").config();
const express = require("express");
const DBConnect = require("./config/database");
const redisWrapper = require("./config/redis");

const app = express();
const PORT = process.env.PORT;

(async () => {
  try {
    await DBConnect();
    await redisWrapper.connect();
    console.log("🚀 All services connected");

    app.listen(PORT, () => {
      console.log(`✅ Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
})();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server is running .......... 🟢 🏃‍♀️‍➡️🏃‍➡️"
  });
});

app.use("/api/user", authRouter);
app.use("/api/problem", problemRouter);
app.use("/api/submission", submissionRouter)
app.use("/api/video", videoRouter)
app.use("/api/contest", contestRouter)
app.use('/api/playlists', playlistRouter);
