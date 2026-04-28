import express from "express";
import authRouter from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "../routes/user.routes.js";
import interViewRouter from "../routes/interview.routes.js";
import paymentRouter from "../routes/payment.routes.js";

export const app = express();
app.use(
  cors({
    origin: "https://hiremindai1-client.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interViewRouter);
app.use("/api/payment", paymentRouter);
