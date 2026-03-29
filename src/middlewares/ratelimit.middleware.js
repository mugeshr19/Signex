const rateLimit = require("express-rate-limit");

const otpShortLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Slow down! Max 3 OTPs per 10 minutes" },
});

const otpDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Daily OTP limit reached, please try again tomorrow" },
});

module.exports = { otpShortLimiter, otpDailyLimiter};