import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";

const validateQuestions = (questions, numQuestions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI returned no questions");
  }

  for (const q of questions) {
    if (
      !q.questionText ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !["A", "B", "C", "D"].includes(q.correctAnswer)
    ) {
      throw new Error("AI returned a malformed question");
    }
  }

  if (questions.length !== numQuestions) {
    return questions.slice(0, numQuestions);
  }

  return questions;
};

const callGemini = async ({ topic, numQuestions }) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an expert exam paper setter.

Generate EXACTLY ${numQuestions} MCQs on "${topic}".

Rules:
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return a preamble.
- Exactly 4 options.
- Exactly one correct answer.
- Include explanation.
- Difficulty must be Easy, Medium, or Hard.

Return ONLY this JSON array:

[
  {
    "questionText": "...",
    "options": [
      {"key": "A", "text": "..."},
      {"key": "B", "text": "..."},
      {"key": "C", "text": "..."},
      {"key": "D", "text": "..."}
    ],
    "correctAnswer": "A",
    "explanation": "...",
    "difficulty": "Easy"
  }
]
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text || "";

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  let questions;

  try {
    questions = JSON.parse(text);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON");
  }

  return validateQuestions(questions, numQuestions);
};

export const generateQuizQuestions = async ({ topic, numQuestions = 10 }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  try {
    return await callGemini({
      topic,
      numQuestions,
    });
  } catch (firstError) {
    console.error("Gemini first attempt failed:", firstError.message);

    try {
      return await callGemini({
        topic,
        numQuestions,
      });
    } catch (secondError) {
      console.error("Gemini retry failed:", secondError.message);

      throw new Error(
        `Quiz generation failed after retry: ${secondError.message}`,
      );
    }
  }
};
