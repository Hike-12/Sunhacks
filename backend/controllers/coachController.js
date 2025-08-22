const axios = require('axios');
const User = require('../models/User');

/**
 * Get doubt solving advice from AI (multiple personalities)
 * @route POST /api/coach
 * @access Private
 */
exports.getDoubtSolution = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, personality, subject } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Get user data
    const user = await User.findById(userId);

    // Personalities for doubt solving assistant
    const personalities = {
      supportive: "You are a supportive and encouraging AI doubt solver. Use positive reinforcement, empathy, and gentle guidance. Focus on building confidence and celebrating small wins.",
      strict: "You are a strict, no-nonsense AI doubt solver. Be direct, firm but fair. Hold the student accountable and don't accept excuses. Focus on discipline and clarity.",
      funny: "You are a witty, humorous AI doubt solver. Use humor, puns and lighthearted jokes while providing solid academic help. Keep things fun while being helpful.",
      analytical: "You are an analytical, data-driven AI doubt solver. Focus on logic, evidence-based explanations, and step-by-step solutions.",
      motivational: "You are an energetic, motivational AI doubt solver. Be inspiring and passionate, like a personal trainer or motivational speaker. Use powerful language to ignite understanding.",
    };

    // Select personality or default to supportive
    const systemPrompt = personalities[personality] || personalities.supportive;

    // Check if Groq API key exists
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Call Groq API
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `${systemPrompt} You are helping a student solve academic doubts. Your responses should be clear, concise (max 3-4 sentences), and focused on helping the student understand the concept.`
          },
          {
            role: "user",
            content: `Student name: ${user.name || 'Student'}
            Subject: ${subject || 'General'}
            Question: ${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 350
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const response = groqResponse.data.choices[0].message.content;

    res.json({
      answer: response,
      personality,
      subject
    });

  } catch (error) {
    console.error("Doubt Solver API Error:", error);
    res.status(500).json({ message: error.response?.data?.error || 'Failed to get solution' });
  }
};