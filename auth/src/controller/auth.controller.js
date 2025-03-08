const { User } = require("../model/user.model.js");

const authCallback = async (req, res, next) => {
  try {
    const { id, firstName, lastName, imageUrl } = req.body;

    // Check if user already exists
    const user = await User.findOne({ where: { clerkId: id } }); // Sequelize uses "where" option

    if (!user) {
      // Signup
      await User.create({
        clerkId: id,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        imageUrl,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in auth callback", error);
    next(error);
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
