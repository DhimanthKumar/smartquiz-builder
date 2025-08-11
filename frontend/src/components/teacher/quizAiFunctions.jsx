// quizAiFunctions.js

// Generate plausible MCQ options for a given question
export const generateOptionsUsingPuter = async (questionText) => {
  const prompt = `Generate 4 plausible multiple-choice options for the following quiz question.
Make sure one option is clearly correct and three are plausible but incorrect.
The order of options should be random.

Format your response as exactly 4 lines:
Option 1: [First option]
Option 2: [Second option]
Option 3: [Third option]
Option 4: [Fourth option]

Then on a new line, indicate the correct option number (1-4):
Correct: [number]

Question: "${questionText}"
`;

  try {
    const response = await puter.ai.chat(prompt);
    if (response?.message?.content) {
      const content = response.message.content;
      const optionMatches = content.match(/Option \d+:\s*(.+)/g);
      const correctMatch = content.match(/Correct:\s*(\d+)/i);

      if (optionMatches?.length >= 4 && correctMatch) {
        const options = optionMatches.slice(0, 4).map(match =>
          match.replace(/Option \d+:\s*/, "").trim()
        );
        const correctIndex = parseInt(correctMatch[1], 10) - 1;
        return { options, correctIndex: Math.max(0, Math.min(3, correctIndex)) };
      }

      // Fallback parsing if AI didn't follow format
      const lines = content.split("\n").filter(line => line.trim());
      if (lines.length >= 4) {
        return {
          options: lines.slice(0, 4).map(line => line.replace(/^[A-D]\)|\d+\.|\-|\*/, "").trim()),
          correctIndex: 0
        };
      }
      throw new Error("Could not parse AI response format");
    }
    throw new Error("No content in AI response");
  } catch (error) {
    console.error("Error generating options:", error);
    throw error;
  }
};

// Generate a full quiz as JSON
export const generateFullQuizUsingPuter = async (description, difficulty, numQuestions, courseName) => {
  const prompt = `
Generate ${numQuestions} multiple-choice quiz questions as a valid JSON array.
Each string must escape internal double quotes using \\".
Do not include any text outside the JSON.
Topic: "${description}"
Course Context: "${courseName}"
Difficulty Level: ${difficulty}

Each JSON object should have:
{
  "text": "string", // question text
  "options": ["string", "string", "string", "string"], // exactly 4 options
  "correct_option": 0 // index (0-3) of correct option
}

Rules:
- Return ONLY valid JSON, no extra text or markdown.
- Each question must have exactly 4 options.
- "correct_option" must be the index of the correct answer.
- Questions must match ${difficulty} difficulty and cover different aspects of the topic.
`;

  try {
    const temp = 1;
    const response = await puter.ai.chat(prompt, { temperature: temp, maxTokens: 1500 });
    if (response?.message?.content) {
        // console.log("AI response:", response.message.content);
      let questions;
      try {
        questions = JSON.parse(response.message.content);
      } catch (err) {
        console.error("Invalid JSON from AI:", response.message.content);
        throw new Error("AI did not return valid JSON.");
      }

      if (!Array.isArray(questions)) throw new Error("Response is not an array");

      const sanitized = questions.map(q => ({
        text: typeof q.text === "string" ? q.text.trim() : "",
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options.map(opt => String(opt).trim())
          : ["", "", "", ""],
        correct_option: Number.isInteger(q.correct_option) && q.correct_option >= 0 && q.correct_option < 4
          ? q.correct_option
          : 0
      }));

      while (sanitized.length < numQuestions) {
        sanitized.push({ text: "", options: ["", "", "", ""], correct_option: 0 });
      }

      return sanitized.slice(0, numQuestions);
    }
    throw new Error("No content in AI response");
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};
