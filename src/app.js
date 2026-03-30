const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const otpRoutes = require("./routes/otp.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Signex is running" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("database connection error :", err);
  });
