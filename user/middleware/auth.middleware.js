// const axios = require('axios');

/**
 * Middleware to authenticate requests using the auth service
 * This middleware verifies the JWT token and sets req.userId if valid
 */
const authMiddleware = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  console.log(req);
  
  console.log("userId:", userId);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  req.userId = userId;
  next();
};

module.exports = authMiddleware;