import userModel from "../models/userModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not exists",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "User Fetched Successfully",
      data: user,
      success: true,
      error: false,
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
