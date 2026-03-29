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
    const token =jwt.sign(
      {id: business._id,email:business.email},
      process.env.JWT_SECRET,
      {expireIn:"7d"}
    );
    res.cookies("token",token,{
      httpOnly:true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "Business registered successfully",
      apiKey: apiKey,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async(req,res)=>{
  try{
    const {email,password} = req.body;
    const business = await Business.findOne({email});
    if(!business){
      return res.status(401).json({message: "Invalid credentials"} );
    }
    const isMatch = await bcrypt.compare(password,business.password);
    if(!isMatch){
      return res.status(401).json({message: "Invalid credentials"});
    }
    const token = jwt.sign(
      {id:business._id},
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );
    res.cookies("token",token,{
      httpOnly:true,
      secure:false,
      sameSite:"strict",
      maxAge: 7*24*60*60*1000,
    });
    res.status(201).json({message: "Login successful"});
  }catch(err){
    res.status(500).json({message: "Internal server error"});
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};