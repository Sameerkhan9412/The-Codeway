// utils/geminiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const keys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
if (keys.length === 0) {
  throw new Error("❌ No Gemini API keys found in environment variables!");
}

let currentIndex = 0;

// Rotate keys in round-robin fashion
function getNextKey() {
  const key = keys[currentIndex];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

// Get Gemini client using the next key
function getGeminiClient() {
  const key = getNextKey();
  return new GoogleGenerativeAI(key);
}

module.exports = { getGeminiClient };
