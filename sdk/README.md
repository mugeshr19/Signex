# Signex

OTP as a Service — send and verify OTPs in minutes.

## Installation
npm install signex

## Get API Key
Register at signex.com to get your API key.

## Usage

const Signex = require("signex");
const client = new Signex(process.env.SIGNEX_API_KEY);

// Send OTP via email
await client.sendOtp("customer@gmail.com");

// Send OTP via SMS
await client.sendOtp("+919876543210", "sms");

// Verify OTP
await client.verifyOtp("customer@gmail.com", "482910");