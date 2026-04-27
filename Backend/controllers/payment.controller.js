import paymentModel from "../models/payment.model.js";
import userModel from "../models/userModel.js";
import razorpay from "../services/razorpay.services.js";
import crypto from "crypto"

const plans = {
  free: { amount: 0, credits: 100 },
  basic: { amount: 99, credits: 200 },
  pro: { amount: 499, credits: 800 },
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const selectedPlan = plans[planId];

    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const options = {
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await paymentModel.create({
      userId: req.userId,
      planId,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: `failed to create razorpay Order ${error}`,
    });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid Payment Signature",
      });
    }

    const payment = await paymentModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        message: "Payment already processed",
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    const updatedUser = await userModel.findByIdAndUpdate(
      payment.userId,
      {
        $inc: { credits: payment.credits },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified and credits added",
      credits: updatedUser.credits,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to verify razorpay Payment ${error}`,
    });
  }
};
