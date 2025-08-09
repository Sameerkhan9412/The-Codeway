const redis = require("redis");

(async () => {
  try {
    const client = redis.createClient({
      username: "default",
      password: "SsHVerv8XJ35nBsEVaKw3DUzZgScLvRE",
      socket: {
        host: "redis-14343.c74.us-east-1-4.ec2.redns.redis-cloud.com",
        port: 14343
      }
    });

    client.on("error", (err) => console.error("❌ Redis Error:", err));
    client.on("connect", () => console.log("✅ Connected to Redis"));

    await client.connect();

    const pong = await client.ping();
    console.log("Redis PING response:", pong);

    await client.quit();
  } catch (err) {
    console.error("Connection failed:", err);
  }
})();
// node hello.js
