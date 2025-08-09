const redis = require("redis");

const client = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_STRING,
    port: process.env.REDIS_PORT_NO
  }
});

client.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

client.on("connect", () => {
  console.log("✅ Redis Connected");
});

client.on("end", () => {
  console.log("⚠️ Redis Connection Closed");
});

const redisWrapper = {
  connect: async () => {
    if (!client.isOpen) {
      await client.connect();
    }
  },
  set: (key, value) => client.set(key, value),
  get: (key) => client.get(key),
  del: (key) => client.del(key),
  exists: (key) => client.exists(key),
  expire: (key, seconds) => client.expire(key, seconds),
  expireAt: (key, timestamp) => client.expireAt(key, timestamp),
  zAdd: (key, members) => client.zAdd(key, members),
  zCard: (key) => client.zCard(key),
  zRemRangeByScore: (key, min, max) => client.zRemRangeByScore(key, min, max)
};

module.exports = redisWrapper;
