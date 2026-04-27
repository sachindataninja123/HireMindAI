import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { isAuth } from "../middlewares/isAuth";

const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, createOrder);
paymentRouter.post("/verify" , isAuth , verifyPayment)


export default paymentRouter