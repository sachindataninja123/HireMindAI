import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { askAI } from "../services/openRouter.service.js";
import userModel from "../models/userModel.js";
import InterviewModel from "../models/interView.model.js";

export const analyzeResume = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        message: "Resume Required!",
      });
    }

    const filePath = req.file.path;

    // Read PDF
    const fileBuffer = await fs.promises.readFile(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    // Clean text
    resumeText = resumeText.replace(/\s+/g, " ").trim();

    // Prevent huge input (token safety)
    const MAX_LENGTH = 12000;
    const trimmedText = resumeText.slice(0, MAX_LENGTH);

    // AI prompt
    const messages = [
      {
        role: "system",
        content: `
Extract structured data from the resume.

Return ONLY valid JSON. No explanation, no text, no markdown.

Format:
{
  "role": "string",
  "experience": "string",
  "projects": ["string"],
  "skills": ["string"]
}
        `,
      },
      {
        role: "user",
        content: trimmedText,
      },
    ];

    // Call AI
    const aiResponse = await askAI(messages);

    if (!aiResponse) {
      throw new Error("Empty AI response");
    }

    // Safe JSON parsing
    let parsed;
    try {
      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.log("JSON Parse Error:", aiResponse);
      parsed = {};
    }

    // Delete file (non-blocking)
    await fs.promises.unlink(filePath);

    // Send response
    return res.status(200).json({
      message: "Resume analyzed successfully",
      role: parsed.role || "",
      experience: parsed.experience || "",
      skills: parsed.skills || [],
      projects: parsed.projects || [],
      text: resumeText,
    });
  } catch (error) {
    console.log("Error analyzing resume:", error);

    // cleanup if error
    if (req.file && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path);
    }

    return res.status(500).json({
      message: "Error analyzing resume",
    });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    // Trim
    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode are required.",
      });
    }

    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    if (user.credits < 30) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 30 required.",
      });
    }

    const projectText =
      Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skillsText =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

    const messages = [
      {
        role: "system",
        content: `
You are a professional interviewer.

Generate exactly 10 interview questions.

Rules:
- 15–25 words each
- One question per line
- No numbering
- No extra text
- Simple conversational English
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAI(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    // Clean parsing
    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter((q) => q.length > 10)
      .slice(0, 10);

    if (questionsArray.length < 5) {
      return res.status(500).json({
        message: "AI failed to generate enough questions.",
      });
    }

    // Difficulty + time mapping
    const difficultyMap = [
      "easy",
      "easy",
      "easy",
      "medium",
      "medium",
      "medium",
      "medium",
      "hard",
      "hard",
      "hard",
    ];

    const timeMap = [60, 60, 60, 90, 90, 90, 90, 120, 120, 120];

    //  Deduct credits
    user.credits -= 30;
    await user.save();

    const interview = await InterviewModel.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, idx) => ({
        question: q,
        difficulty: difficultyMap[idx] || "medium",
        timeLimit: timeMap[idx] || 90,
      })),
    });

    return res.json({
      InterviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    console.log("Generate Question Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    let { interviewId, questionIndex, answer, timeTaken } = req.body;

    // Basic validation
    if (!interviewId || questionIndex === undefined) {
      return res.status(400).json({
        message: "Invalid request data",
      });
    }

    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const question = interview.questions[questionIndex];

    if (!question) {
      return res.status(400).json({
        message: "Invalid question index",
      });
    }

    // if no answer

    answer = answer?.trim();

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit a answer.";
      question.answer = " ";

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    // if time limit exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time linmit exceeded. Answer not evaluated";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    // AI evaluation
    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`,
      },
    ];

    const aiResponse = await askAI(messages);

    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({
        message: "AI response parsing failed",
        raw: aiResponse,
      });
    }

    question.answer = answer;
    question.confidence = parsed.confidence ?? 0;
    question.communication = parsed.communication ?? 0;
    question.correctness = parsed.correctness ?? 0;
    question.score = parsed.finalScore ?? 0;
    question.feedback = parsed.feedback || "Evaluation unavailable";

    await interview.save();

    return res.status(200).json({
      feedback: parsed.feedback,
      score: question.score,
    });
  } catch (error) {
    console.log("Submit Answer Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        message: "Interview ID is required",
      });
    }

    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const totalQuestions = interview.questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        message: "No questions found in interview",
      });
    }

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalScore / totalQuestions;
    const avgConfidence = totalConfidence / totalQuestions;
    const avgCommunication = totalCommunication / totalQuestions;
    const avgCorrectness = totalCorrectness / totalQuestions;

    // save rounded score (optional)
    interview.finalScore = Number(finalScore.toFixed(1));
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    console.log("Finish Interview Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await InterviewModel.findOne({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    console.log("Failded to Get current Interview :", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await InterviewModel.findById(req.params.id);

    if (!interview) {
      return res.status(400).json({
        message: "Interview not found!",
      });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalConfidence / totalQuestions;
    const avgCommunication = totalCommunication / totalQuestions;
    const avgCorrectness = totalCorrectness / totalQuestions;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    console.log("Failed to get interview Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
