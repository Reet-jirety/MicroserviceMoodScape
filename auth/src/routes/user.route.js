const { Router } = require("express");
const { authCallback, authVerify } = require("../controller/auth.controller.js");

const router = Router();

router.post("/callback", authCallback);
router.get("/verify", authVerify);

module.exports = router;