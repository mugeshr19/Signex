const Business = require("../models/business.model.js");
const generateApiKey = require("../utils/generateApiKey.js");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Business.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const apiKey = generateApiKey();
    const business = await Business.create({
      name,
      email,
      password: hashedPassword,
      apiKey
    });
    res.status(201).json({
      message: "Business registered successfully",
      apiKey: apiKey,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
