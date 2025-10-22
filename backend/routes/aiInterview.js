const express = require("express");
const multer = require("multer");
const { 
  createSession, 
  continueInterview, 
  endInterview, 
  getSessionStatus,
  uploadResume,
  getFeedback,
  saveRecording
} = require("../controllers/interview");
const DoubtAi = require("../controllers/doubtAi");
const { handleAssistantQuery } = require("../controllers/aiAssistantController");
const { userMiddleware, checkPremiumAndTokens } = require("../middleware/userMiddleware");

const interviewRouter = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes with error handling
interviewRouter.post("/create-session", asyncHandler(createSession));
interviewRouter.post("/continue", asyncHandler(continueInterview));
interviewRouter.post("/end", asyncHandler(endInterview));
interviewRouter.get("/session/:sessionId", asyncHandler(getSessionStatus));
interviewRouter.post("/chat", userMiddleware, checkPremiumAndTokens, DoubtAi);
interviewRouter.get("/assistant", userMiddleware, handleAssistantQuery);

// File upload routes with error handling
interviewRouter.post("/upload-resume", upload.single('resume'), handleMulterError, asyncHandler(uploadResume));

// Feedback routes
interviewRouter.get("/feedback/:sessionId", asyncHandler(getFeedback));
// Route to manually generate feedback for a session (useful for testing or regenerating feedback)
interviewRouter.post("/generate-feedback/:sessionId", asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists in memory
    const session = interviewSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Generate feedback using the existing function
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = generateFeedbackPrompt(session);
    
    const result = await model.generateContent(prompt);
    let feedback;
    
    try {
      const responseText = result.response.text().trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      feedback = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error("Feedback parsing error:", parseError);
      feedback = {
        overallScore: 65,
        technicalScore: 60,
        communicationScore: 70,
        strengths: ["Completed the interview", "Showed engagement"],
        weaknesses: ["Could provide more detailed responses", "Technical depth needs improvement"],
        improvements: [
          "Practice explaining technical concepts with examples",
          "Prepare STAR method responses",
          "Study fundamental concepts more deeply"
        ],
        detailedAnalysis: "Good participation in the interview. Focus on providing more specific examples and deeper technical explanations."
      };
    }
    
    // Calculate additional metrics
    const userResponseCount = session.conversation.filter(msg => msg.role === 'user').length;
    const interviewDuration = Math.floor((Date.now() - session.startTime) / 1000);
    
    const detailedFeedback = {
      feedback,
      sessionStats: {
        duration: interviewDuration,
        questionsAnswered: userResponseCount,
        averageResponseTime: Math.round(interviewDuration / userResponseCount) || 0,
        completionRate: Math.round((userResponseCount / 5) * 100),
        keySkillsEvaluated: session.keySkills
      },
      interviewHistory: session.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      generatedAt: new Date().toISOString()
    };
    
    // Store the feedback for future retrieval
    if (!global.interviewFeedback) {
      global.interviewFeedback = new Map();
    }
    global.interviewFeedback.set(sessionId, detailedFeedback);
    
    res.json({
      success: true,
      data: detailedFeedback
    });
  } catch (error) {
    console.error('❌ Feedback generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback'
    });
  }
}));

interviewRouter.post("/interview/save-recording", upload.single('recording'), handleMulterError, asyncHandler(saveRecording));

// Global error handler for this router
interviewRouter.use((err, req, res, next) => {
  console.error('Interview router error:', err);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error'
  });
});

module.exports = interviewRouter;
