const router = require("express").Router();
const validateApiKey = require("../middlewares/api.middleware");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");

router.post("/send", validateApiKey, sendOtp);
router.post("/verify", validateApiKey, verifyOtp);

module.exports = router;
