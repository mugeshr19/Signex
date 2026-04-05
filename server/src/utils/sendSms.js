const axios = require("axios");

const sendSms = async (phone, otp) => {
  try {
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        message: `Your Signex OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        language: "english",
        route: "q",
        numbers: phone
      }
    });

    return response.data;
  } catch (err) {
    throw new Error(`SMS failed: ${err.message}`);
  }
};

module.exports = sendSms;