const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load keys from .env
const keys = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
].filter(Boolean); // remove undefined

if (keys.length === 0) {
  console.error("❌ No Gemini API keys found in .env file");
  process.exit(1);
}

let currentKeyIndex = 0;

// Get current Gemini instance
function getGeminiInstance() {
  const key = keys[currentKeyIndex];
  const genAI = new GoogleGenerativeAI(key);
  console.log(`🔑 Using Gemini Key ${currentKeyIndex + 1}`);
  return genAI;
}

// Rotate to next key
function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  console.log(`🔁 Switched to next Gemini Key (index: ${currentKeyIndex + 1})`);
}

// Core safe call function
async function safeGenerate(prompt, modelName = "gemini-1.5-flash", retries = 3) {
  let genAI = getGeminiInstance();
  const model = genAI.getGenerativeModel({ model: modelName });

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🧠 Generating content (Attempt ${i + 1}) using ${modelName}`);
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      const status = err.status || 0;
      console.warn(`⚠️ Gemini Error [${status}]: ${err.statusText || err.message}`);

      // Rotate key on quota / rate / unavailable
      if ([429, 403, 503].includes(status)) {
        rotateKey();
        genAI = getGeminiInstance();
      }

      if (i < retries - 1) {
        console.log(`⏳ Retrying in 2s...`);
        await new Promise((res) => setTimeout(res, 2000));
      } else {
        throw err;
      }
    }
  }
}

module.exports = { safeGenerate };
