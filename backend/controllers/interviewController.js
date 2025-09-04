const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama3-70b-8192"; // Use a normal Groq model

function extractJSONArray(str) {
  const match = str.match(/\[([\s\S]*?)\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function extractJSONObject(str) {
  const match = str.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Generate quiz questions (student view style)
exports.generateQuestions = async (req, res) => {
  try {
    const { topic, studentProfile } = req.body;
    const prompt = `
      You are a helpful tutor. Given the following topic and student profile, generate 5 quiz questions that test understanding and application.
      Respond ONLY with a JSON array of questions, no explanation, no intro, no markdown, no text before or after.
      Topic: ${JSON.stringify(topic)}
      Student Profile: ${JSON.stringify(studentProfile)}
    `;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a helpful tutor." },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Groq API error:", data);
      return res.status(500).json({ error: data.error?.message || "Failed to generate questions" });
    }
    let questions;
    try {
      questions = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      questions = extractJSONArray(data.choices[0].message.content);
    }
    if (!questions) {
      throw new Error("Could not extract questions JSON array from model response.");
    }
    res.json({ questions });
  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

// Submit quiz/interview and get feedback (student view style)
exports.submitInterview = async (req, res) => {
  try {
    let quizData;
    // Accept both quizData (JSON) and interviewData (FormData)
    if (req.body.quizData) {
      try {
        quizData = JSON.parse(req.body.quizData);
        console.log("Received quiz data:", quizData);
      } catch (e) {
        console.log(e);
        return res.status(400).json({ error: "Invalid quiz data format" });
      }
    } else if (req.body.interviewData) {
      try {
        quizData = JSON.parse(req.body.interviewData);
        console.log("Received interview data:", quizData);
      } catch (e) {
        console.log(e);
        return res.status(400).json({ error: "Invalid interview data format" });
      }
    } else {
      console.log("No quiz data provided");
      return res.status(400).json({ error: "Missing quiz data" });
    }

    const { topic, studentProfile, questions, answers, totalTime } = quizData;

    
    // Prepare feedback prompt for Groq
    const answersText = answers.map((answer, i) => {
      return `
Question ${i + 1}: ${questions[i]}
Student Answer: ${answer.textAnswer || "No answer"}
Time Taken: ${answer.timeTaken} seconds
      `.trim();
    }).join('\n\n');

    const feedbackPrompt = `
You are a helpful tutor reviewing a student's quiz performance. Analyze the following quiz data and provide feedback.

TOPIC: ${topic}
STUDENT PROFILE: ${JSON.stringify(studentProfile)}

QUIZ RESPONSES:
${answersText}

TOTAL QUIZ TIME: ${totalTime} seconds

Please provide a detailed review in the following JSON format (respond ONLY with valid JSON, no markdown, no explanations outside the JSON):

{
  "overallFeedback": {
    "strengths": "List the student's main strengths based on their responses",
    "weaknesses": "Areas where the student could improve",
    "tipsForImprovement": "Specific actionable advice for better learning"
  },
  "perQuestion": [
    {
      "question": "The quiz question",
      "feedback": {
        "strengths": "What the student did well for this specific question",
        "weaknesses": "What could be improved for this question",
        "tipsForImprovement": "Specific advice for this type of question"
      }
    }
  ],
  "score": {
    "overall": 85
  },
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ]
}
    `;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a helpful tutor providing feedback. Always respond with valid JSON only." },
          { role: "user", content: feedbackPrompt }
        ],
        temperature: 0.7
      })
    });

    const groqData = await groqRes.json();

    if (!groqData.choices || !groqData.choices[0]?.message?.content) {
      throw new Error("Invalid response from AI service");
    }

    let feedback;
    try {
      feedback = JSON.parse(groqData.choices[0].message.content);
    } catch (e) {
      feedback = extractJSONObject(groqData.choices[0].message.content);
      if (!feedback) {
        feedback = {
          overallFeedback: {
            strengths: "You completed the quiz and provided responses.",
            weaknesses: "Some answers could be more detailed.",
            tipsForImprovement: "Review the topic and try to elaborate more."
          },
          perQuestion: questions.map((question, i) => ({
            question: question,
            feedback: {
              strengths: answers[i]?.textAnswer ? "You answered this question." : "You attempted this question.",
              weaknesses: "Could benefit from more details.",
              tipsForImprovement: "Try to explain your reasoning."
            }
          })),
          score: { overall: 70 },
          recommendations: [
            "Review the topic material",
            "Practice similar questions"
          ]
        };
      }
    }

    res.json({ feedback });
  } catch (err) {
    console.log("Error submitting interview:", err);
    res.status(500).json({ 
      error: "Failed to analyze quiz",
      details: err.message 
    });
  }
};