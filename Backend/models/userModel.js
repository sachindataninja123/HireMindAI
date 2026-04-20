import mongoose from "mongoose";

const userschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    credits: {
      type: Number,
      default: 100,
    },
  },
  { timeStamps: true },
);

const userModel = mongoose.model("user", userschema);

export default userModel;
