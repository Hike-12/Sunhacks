const axios = require("axios");

// Lightweight slide generator (local/template). Replace with real Gemini calls later if you have an API.
module.exports = {
  generateSlidesForTopic: async (topic) => {
    // produce 4 slides: Intro, Key concepts, Examples, Summary
    const base = [
      {
        title: `Introduction to ${topic}`,
        content: `Welcome. In this video we will cover the basics of ${topic} and why it matters.`,
        duration: 7
      },
      {
        title: `Key Concepts of ${topic}`,
        content: `Here are the core ideas: explain 2-3 main concepts in clear, concise language for learners.`,
        duration: 8
      },
      {
        title: `Real-world Examples`,
        content: `Practical examples and applications of ${topic} in everyday life and industry.`,
        duration: 8
      },
      {
        title: `Summary & Next Steps`,
        content: `Quick summary and suggestions for further learning about ${topic}.`,
        duration: 6
      },
    ];

    // Optionally you can expand these with more dynamic content or call an LLM later.
    return base;
  },
};

