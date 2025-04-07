const { Router } = require("express");
const { authCallback, authVerify, deleteUser } = require("../controller/auth.controller.js");

const router = Router();

router.post("/callback", authCallback);
router.get("/verify", authVerify);
router.delete("/delete", deleteUser);


module.exports = router;