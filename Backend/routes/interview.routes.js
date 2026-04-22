import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { analyzeResume } from "../controllers/interview.controller.js";

const interViewRouter = express.Router();

interViewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);

export default interViewRouter;
