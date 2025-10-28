const express = require("express");
const {
  userMiddleware,
  checkPremiumAndTokens,
  optionalUserMiddleware
} = require("../middleware/userMiddleware");
const DoubtAi = require("../controllers/doubtAi");
const { handleAssistantQuery } = require("../controllers/aiAssistantController");
const adminMiddleware = require("../middleware/adminMiddleware");

const aiRouter = express.Router();

// Doubt AI endpoint (requires premium)
aiRouter.post("/chat", userMiddleware, checkPremiumAndTokens, DoubtAi);

// AI Assistant endpoint (available to all users, but user context is helpful)
// Using optionalUserMiddleware to get user info if available, but not require login
aiRouter.post("/assistant", userMiddleware, handleAssistantQuery);

// Health check endpoint for AI services
aiRouter.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    services: {
      assistant: "online",
      doubt_solver: "online"
    },
    timestamp: new Date().toISOString()
  });
});

// AI Assistant capabilities endpoint
aiRouter.get("/capabilities", (req, res) => {
  res.json({
    assistant: {
      name: "CodeWay AI Assistant",
      version: "2.0",
      capabilities: [
        "Platform navigation",
        "Feature explanations", 
        "Contest information",
        "Course recommendations",
        "General coding guidance"
      ],
      available_routes: [
        "/dashboard",
        "/contests", 
        "/premium",
        "/doubt",
        "/submissions",
        "/leaderboard",
        "/courses",
        "/explore"
      ]
    },
    doubt_solver: {
      name: "CodeWay Doubt AI",
      version: "1.0",
      requirements: ["premium_subscription", "sufficient_tokens"],
      capabilities: [
        "Code debugging",
        "Algorithm explanations",
        "Concept clarification",
        "Best practices guidance"
      ]
    }
  });
});

module.exports = aiRouter;
