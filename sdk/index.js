const fetch = require("node-fetch");

class Signex {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://signex.com/api"; 
  }

  // Send OTP
  async sendOtp(target, channel = "email") {
    try {
      const body = channel === "sms"
        ? { phone: target, channel }
        : { email: target, channel };

      const res = await fetch(`${this.baseUrl}/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      return data;
    } catch (err) {
      throw new Error(`sendOtp failed: ${err.message}`);
    }
  }

  // Verify OTP
  async verifyOtp(target, code, channel = "email") {
    try {
      const body = channel === "sms"
        ? { phone: target, code, channel }
        : { email: target, code, channel };

      const res = await fetch(`${this.baseUrl}/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      return data;
    } catch (err) {
      throw new Error(`verifyOtp failed: ${err.message}`);
    }
  }
}

module.exports = Signex;