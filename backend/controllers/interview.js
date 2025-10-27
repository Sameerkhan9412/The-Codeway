const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Multiple API keys for fallback
const API_KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_KEY_4
].filter(Boolean);

let currentKeyIndex = 0;
const getNextAPIKey = () => {
  const key = API_KEYS[currentKeyIndex % API_KEYS.length];
  currentKeyIndex++;
  return key;
};

const initializeAI = () => {
  const apiKey = getNextAPIKey();
  if (!apiKey) throw new Error('No valid API keys configured');
  return new GoogleGenerativeAI(apiKey);
};

// In-memory storage
const interviewSessions = new Map();
if (!global.interviewFeedback) global.interviewFeedback = new Map();

// Cleanup every 5 minutes
setInterval(() => cleanupExpiredSessions(), 5 * 60 * 1000);

// Optimized skill extraction
const extractKeySkills = (resume) => {
  const skillKeywords = [
    'javascript','react','node.js','python','java','sql','mongodb','aws','docker',
    'kubernetes','git','agile','scrum','api','rest','graphql','typescript','express'
  ];
  
  const resumeLower = resume.toLowerCase();
  return skillKeywords
    .filter(skill => resumeLower.includes(skill))
    .slice(0, 5);
};

// Optimized prompt generation
const generateQuestionPrompt = (session, questionNumber) => {
  const { conversation, keySkills, resumeSnippet } = session;
  const recentContext = conversation.slice(-2); // Reduced from 4 to 2
  const difficulty = questionNumber <= 2 ? 'basic' : questionNumber <= 4 ? 'intermediate' : 'advanced';
  const focusSkill = keySkills[Math.min(questionNumber - 1, keySkills.length - 1)] || 'problem-solving';

  return `Technical interviewer. Resume: ${resumeSnippet?.substring(0, 200) || 'N/A'}. Skills: ${keySkills.join(', ')}. 
Previous: ${recentContext.map(msg => `${msg.role}: ${msg.content}`).join(' | ')}
Ask ${difficulty} question ${questionNumber}/5 focused on ${focusSkill}. Be concise.`;
};

const generateFeedbackPrompt = (session) => {
  const { keySkills, conversation, resumeSnippet, candidateInfo } = session;
  const userResponses = conversation.filter(msg => msg.role === 'user').map(msg => msg.content).join('\n');

  return `Evaluate interview. Resume: ${resumeSnippet?.substring(0, 150) || 'N/A'}. Skills: ${keySkills.join(', ')}.
Responses: ${userResponses.substring(0, 500)}
Provide JSON: {
  "overallScore": 0-100,
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "strengths": ["s1","s2"],
  "weaknesses": ["w1","w2"],
  "improvements": ["i1","i2"],
  "hiringRecommendation": "string"
}`;
};

// Optimized PDF extraction
const extractTextFromPDFBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data?.text?.substring(0, 1000) || "No text found"; // Limit output
  } catch (e) {
    console.error('PDF extraction failed');
    return "PDF extraction failed";
  }
};

// Upload resume - optimized
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No resume' });
    const parser = new PDFParse({ url: req.file.path });
    console.log("parse data",parser)

    const result = await parser.getText();
    console.log("file result",result.pages[0].text.toString())
    let extractedText = result.pages[0].text.toString();
    
    if (extractedText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Resume too short' });
    }

    res.json({
      success: true,
      data: {
        text: extractedText.substring(0, 800), // Limit output
        fileName: req.file.originalname,
        candidateName: req.body.candidateName || 'Anonymous'
      }
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

// Get feedback - optimized
const getFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Session required' });

    // Check persistent storage first
    if (global.interviewFeedback.has(sessionId)) {
      return res.json({
        success: true,
        data: global.interviewFeedback.get(sessionId)
      });
    }

    const session = interviewSessions.get(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });

    if (session.questionCount < 5) {
      return res.json({
        success: true,
        data: {
          status: 'in_progress',
          questionsAnswered: session.conversation.filter(msg => msg.role === 'user').length,
          totalQuestions: 5
        }
      });
    }

    const genAI = initializeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }); // Lighter model
    const prompt = generateFeedbackPrompt(session);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    let feedback;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      feedback = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      feedback = {
        overallScore: 65,
        technicalScore: 60,
        communicationScore: 70,
        strengths: ["Completed interview"],
        weaknesses: ["Need more detail"],
        improvements: ["Practice technical explanations"],
        hiringRecommendation: "Consider"
      };
    }

    const userResponseCount = session.conversation.filter(msg => msg.role === 'user').length;
    const interviewDuration = Math.floor((Date.now() - session.startTime) / 1000);

    const detailedFeedback = {
      feedback,
      sessionStats: {
        duration: interviewDuration,
        questionsAnswered: userResponseCount,
        completionRate: Math.round((userResponseCount / 5) * 100)
      }
    };

    global.interviewFeedback.set(sessionId, detailedFeedback);
    res.json({ success: true, data: detailedFeedback });

  } catch (error) {
    console.error('Feedback error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get feedback' });
  }
};

// Create session - optimized
const createSession = async (req, res) => {
  try {
    const resumeText = req.body.resumeText || '';
    const candidate = req.body.candidate || {};

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Resume too short' });
    }

    const genAI = initializeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;

    const keySkills = extractKeySkills(resumeText);
    const prompt = `Start technical interview. Resume: ${resumeText.substring(0, 300)}. Skills: ${keySkills.join(', ')}. Ask first question.`;

    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();

    interviewSessions.set(sessionId, {
      keySkills,
      conversation: [{ role: "ai", content: question, timestamp: Date.now() }],
      startTime: Date.now(),
      questionCount: 1,
      resumeSnippet: resumeText.substring(0, 200)
    });

    res.json({ 
      success: true, 
      data: { 
        sessionId, 
        question, 
        keySkills: keySkills.slice(0, 3), // Reduced output
        timeLimit: 120 
      } 
    });

  } catch (error) {
    console.error('Session error:', error.message);
    
    // Try with next API key
    if (error.message.includes('API') && API_KEYS.length > 1) {
      try {
        return await createSession(req, res);
      } catch (retryError) {
        // Fall through to final error
      }
    }
    
    res.status(500).json({ success: false, message: 'Session creation failed' });
  }
};

// Continue interview - optimized
const continueInterview = async (req, res) => {
  try {
    const { sessionId, userAnswer } = req.body;
    
    if (!sessionId || !userAnswer || userAnswer.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const session = interviewSessions.get(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Check expiration
    if ((Date.now() - session.startTime) / 1000 > 120) {
      interviewSessions.delete(sessionId);
      return res.status(408).json({ success: false, message: 'Session expired' });
    }

    if (session.questionCount >= 5) {
      return res.status(400).json({ success: false, message: 'Max questions reached' });
    }

    const genAI = initializeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    session.conversation.push({ 
      role: "user", 
      content: userAnswer.trim().substring(0, 500), // Limit input size
      timestamp: Date.now() 
    });
    
    const nextQuestionNumber = session.questionCount + 1;
    const prompt = generateQuestionPrompt(session, nextQuestionNumber);

    const result = await model.generateContent(prompt);
    const nextQuestion = result.response.text().trim();

    session.conversation.push({ role: "ai", content: nextQuestion, timestamp: Date.now() });
    session.questionCount = nextQuestionNumber;

    res.json({ 
      success: true, 
      data: { 
        question: nextQuestion, 
        questionNumber: nextQuestionNumber 
      } 
    });

  } catch (error) {
    console.error('Continue error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to continue' });
  }
};

// End interview - optimized
const endInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Session required' });

    const session = interviewSessions.get(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });

    const genAI = initializeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = generateFeedbackPrompt(session);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    let feedback;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      feedback = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      feedback = { overallScore: 65, hiringRecommendation: "Consider" };
    }

    const userResponseCount = session.conversation.filter(msg => msg.role === 'user').length;
    
    // Store minimal feedback
    global.interviewFeedback.set(sessionId, {
      feedback,
      questionsAnswered: userResponseCount
    });
    
    interviewSessions.delete(sessionId);

    res.json({
      success: true,
      data: { feedback }
    });

  } catch (error) {
    console.error('End interview error:', error.message);
    res.status(500).json({ success: false, message: 'Analysis failed' });
  }
};

// Optimized session status
const getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = interviewSessions.get(sessionId);
    
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });

    const sessionDuration = Math.floor((Date.now() - session.startTime) / 1000);
    if (sessionDuration > 120) {
      interviewSessions.delete(sessionId);
      return res.status(408).json({ success: false, message: 'Expired' });
    }

    res.json({
      success: true,
      data: {
        questionCount: session.questionCount,
        timeRemaining: Math.max(0, 120 - sessionDuration),
        isActive: true
      }
    });

  } catch (error) {
    console.error('Status error:', error.message);
    res.status(500).json({ success: false, message: 'Status check failed' });
  }
};

// Save recording - optimized
const saveRecording = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!req.file || !sessionId) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    // Simple validation
    const allowedTypes = ['.wav', '.mp3', '.m4a'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension) || req.file.size > 50 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid file' });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        fileName: req.file.originalname,
        status: 'saved'
      }
    });

  } catch (error) {
    console.error('Recording error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Save failed' });
  }
};

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [key, session] of interviewSessions.entries()) {
    if (now - session.startTime > 10 * 60 * 1000) {
      interviewSessions.delete(key);
    }
  }
}

module.exports = {
  createSession,
  continueInterview,
  endInterview,
  getSessionStatus,
  uploadResume,
  getFeedback,
  saveRecording,
  cleanupExpiredSessions
};