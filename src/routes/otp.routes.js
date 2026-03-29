const router = require("express").Router();
const validateApiKey = require("../middlewares/api.middleware");
const {otpShortLimiter,otpDailyLimiter} = require("../middlewares/ratelimit.middleware");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");

router.post("/send", otpShortLimiter , otpDailyLimiter , validateApiKey, sendOtp);
router.post("/verify", otpShortLimiter , otpDailyLimiter , validateApiKey, verifyOtp);

module.exports = router;
