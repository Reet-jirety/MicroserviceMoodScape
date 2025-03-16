const express = require("express");
const { createServer } = require("http");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const { clerkMiddleware } = require("@clerk/express");

const authRoutes = require("./routes/user.route");

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

app.use(cors()); // Enable CORS
app.use(express.json()); // to parse req.body
app.use(clerkMiddleware()); // this will add auth to req obj => req.auth

app.get("/verify", (req, res) => {
  if (!req.auth || !req.auth.userId) {
    console.log("Unauthorized - you must be logged in");
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  res.status(200).json({ success: true });
});

app.use("/api/v1/auth", authRoutes);

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  
  res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : "Error: " + err.message });
});

httpServer.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
