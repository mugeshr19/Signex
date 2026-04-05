const Business = require("../models/business.model.js");
const generateApiKey = require("../utils/generateApiKey.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      {expiresIn:"7d"}
    );
    res.cookie("token",token,{
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
      return res.status(404).json({message: "Invalid credentials"} );
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
    res.cookie("token",token,{
      httpOnly:true,
      secure:false,
      sameSite:"strict",
      maxAge: 7*24*60*60*1000,
    });
    res.status(200).json({
      message: "Login successful",
      business: {
        id: business._id,
        name: business.name,
        email: business.email,apiKey: business.apiKey , createdAt: business.createdAt}});
  }catch(err){
    res.status(500).json({message: "Internal server error"});
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

exports.getme = async(req,res)=>{
  try{
    const business = await Business.findById(req.businessId).select("-password");
    if(!business){
      res.status(404).json({message:"Business not found"});
    }
    res.status(201).json({business});
  }
  catch(err){
    res.status(404).json({message:"Internal error"});
  }

};

exports.rotateapi = async(req,res)=>{
  try{
    const business = await Business.findById(req.businessId);
    if(!business){
      res.status(404).json({message:"Business not found"}); 
    }
    const newApiKey = generateApiKey();
    business.apiKey = newApiKey;
    await business.save();
    res.status(200).json({message:"API key rotated successfully",newApiKey});
  }
  catch(err){
    res.status(500).json({message:"Internal server error", error: err.message});
  }
};

exports.savewebhook = async(req,res)=>{
  try{
    const { webhook } = req.body; 
    if (!webhook) return res.status(400).json({ message: "Webhook URL is required" });
    await Business.findByIdAndUpdate(req.businessId, { webhook });
    res.status(200).json({ message: "Webhook saved successfully" });
  }
  catch(err){
    res.status(500).json({message:"Internal server error", error: err.message});
  }
};
