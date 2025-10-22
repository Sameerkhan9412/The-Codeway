const { GoogleGenerativeAI } = require('@google/generative-ai');

const handleAssistantQuery = async (req, res) => {
  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const platformContext = `
      You are CodeXa, an AI assistant for a comprehensive coding platform designed to help developers improve their programming skills.

**About CodeXa:**
CodeXa is a one-stop coding platform that offers problem-solving practice, competitive programming, and technical interview preparation for developers of all skill levels.

**Platform Features:**
- Thousands of coding problems across various difficulty levels and topics
- Regular coding contests with real-time participation and leaderboards  
- AI-powered interview simulator for technical interview practice
- Personal dashboard for progress tracking and performance analytics
- Detailed submission history and solution reviews
- Premium features for enhanced learning experiences
- Community learning from other programmers' solutions

**What CodeXa Does:**
- Helps build strong algorithmic and problem-solving skills
- Prepares users for coding interviews at top tech companies
- Provides competitive programming experience
- Tracks learning progress and improvement over time
- Offers curated learning paths for different skill levels

**Available Platform Routes:**
- /dashboard: User's personal dashboard
- /contest: List of ongoing and upcoming contests  
- /premium: Information about premium features
- /interview: AI-powered interview practice
- /problems: Main problem listing page

**Instructions:**
Your primary task is to determine if the user's query is a navigation request.
- If the query is a navigation request (e.g., "take me to dashboard," "show me contests"), you MUST respond with ONLY the JSON object: {"route": "/path"}. Do NOT include any other text, explanation, or conversational filler.
- If the query is a general question or a request for information, provide a helpful, conversational response.
- Always be encouraging and supportive of the user's coding journey.
- Do not add any markdown like \`\`\`json.
The JSON output is parsed programmatically, so it is critical that for navigation requests, the response contains only the JSON object.

**Strict Navigation Response Example:**
User query: "go to my dashboard"
Your response: {"route": "/dashboard"}

**General Question Response Example:**
User query: "what is CodeXa?"
Your response: "CodeXa is a comprehensive coding platform designed to help you improve your programming skills..."
    `;

    const prompt = `${platformContext}\n\nUser query: "${query}"`;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const result = await model.generateContentStream(prompt);

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      // Send each chunk as it arrives
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Check if the full response is a navigation request (JSON object)
    try {
      const potentialJson = fullResponse.trim();
      if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
        const jsonResponse = JSON.parse(potentialJson);
        if (jsonResponse.route) {
          // If it's a valid navigation response, send it as a special event
          res.write(`event: navigation\ndata: ${potentialJson}\n\n`);
        }
      }
    } catch (e) {
      // Not a JSON response, continue with normal text
    }

    res.end();

  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to process your request.' })}\n\n`);
    res.end();
  }
};

module.exports = { handleAssistantQuery };