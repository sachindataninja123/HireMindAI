import { genToken } from "../config/token.js";
import userModel from "../models/userModel.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Name and Email are required",
      });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      error: false,
      data: user,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      error: false,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout Auth Error:", error);

    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error",
    });
  }
};
