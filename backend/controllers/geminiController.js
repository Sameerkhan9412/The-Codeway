const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateCodeStream = async (req, res) => {
  try {
    const { dsaType, prompt, language = 'javascript' } = req.body; // Default to javascript
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const fullPrompt = `
      Generate a ${language} function that demonstrates ${dsaType} operations.
      ${prompt ? `Additional requirements: ${prompt}` : ''}
      
      Requirements:
      1. Use modern syntax for the chosen language (e.g., ES6 for JavaScript, modern C++).
      2. Include detailed comments to explain the code.
      3. Focus on creating operations that are easy to visualize (e.g., push, pop, step-by-step sorting).
      4. Return only the raw code, without any surrounding text or explanations.
    `;

    // Send stream in chunks
    const result = await model.generateContentStream(fullPrompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      // Send each chunk as an event
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Error generating code:', error.stack || error);
    // Send error event with actual error message
    const errorMessage = error.message || 'Failed to generate code';
    res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
};
