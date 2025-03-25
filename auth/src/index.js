const express = require("express");
const { createServer } = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const { clerkMiddleware } = require("@clerk/express");
// For demonstration, we’ll assume you have additional auth routes.
const authRoutes = require("./routes/user.route");

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

// Allow clients to read our custom header
app.use(cors({
  exposedHeaders: ["X-User-Id"]
}));
app.use(express.json());
app.use(clerkMiddleware());

// Endpoint to verify the user.
// If valid, it returns the userId in both the response body and header.
app.get("/verify", (req, res) => {
  if (!req.auth?.userId) {
    console.log("Unauthorized - you must be logged in");
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }

  const userId = req.auth.userId;
  // Set the header and return it in the body for debugging
  res.setHeader("X-User-Id", userId);
  res.status(200).json({ success: true, userId });
});

// Additional auth routes if needed
app.use("/api/v1/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : "Error: " + err.message
  });
});

httpServer.listen(PORT, () => {
  console.log("Auth Service running on port " + PORT);
});
