import paymentModel from "../models/payment.model";
import razorpay from "../services/razorpay.services";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;
    if (!amount || !credits) {
      return res.status(400).json({ message: "Invalid plan data" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await paymentModel.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to create razorpay Order ${error}` });
  }
};
