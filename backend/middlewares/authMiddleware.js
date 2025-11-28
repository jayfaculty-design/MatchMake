const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const tokenWithBearer = token.split(" ")[1];

  try {
    // console.log("Token received: ", token);
    jwt.verify(tokenWithBearer, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid or expired token",
        });
      }
      req.team = decoded;
      next();
    });
  } catch (error) {
    console.error("Token verification failed", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
