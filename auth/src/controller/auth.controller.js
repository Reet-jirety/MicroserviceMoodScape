const User = require("../model/user.model.js");

const authCallback = async (req, res, next) => {
  try {
    const { id, firstName, lastName, imageUrl } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Received body:", req.body); // Log the body for debugging

    // Check if user already exists
    const user = await User.findOne({ where: { clerkId: id } });

    if (!user) {
      // Signup
      try {
        await User.create({
          clerkId: id,
          fullName: `${firstName || ""} ${lastName || ""}`.trim(),
          imageUrl,
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({ message: "Failed to create user" });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in auth callback:", error);
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({ message: "Database error" });
    } else if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Validation error", details: error.errors });
    } else {
      next(error); // Pass other errors to the next handler
    }
  }
};

const authVerify = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    console.log("Unauthorized - you must be logged in");
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  res.status(200).json({ success: true });
};

module.exports = { authCallback, authVerify };
