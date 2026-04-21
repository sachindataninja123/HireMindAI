import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  try {
    let { token } = req.cookies;
    if (!token) {
      return res.status(400).json({
        message: "User does not have a token",
        error: true,
        success: false,
      });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = verifyToken.userId;

    next();
  } catch (error) {
    console.error("Logout Auth Error:", error);

    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error",
    });
  }
};
