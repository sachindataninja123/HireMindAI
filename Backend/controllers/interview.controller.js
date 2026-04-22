import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { askAI } from "../services/openRouter.service.js";

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
