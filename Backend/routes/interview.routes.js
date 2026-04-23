import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  analyzeResume,
  finishInterview,
  generateQuestion,
  submitAnswer,
} from "../controllers/interview.controller.js";

const interViewRouter = express.Router();

interViewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);
interViewRouter.post("/generate-questions", isAuth, generateQuestion);
interViewRouter.post("/submit-answer", isAuth, submitAnswer);
interViewRouter.post("/finish", isAuth, finishInterview);

export default interViewRouter;
