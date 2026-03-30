const jwt = require("jsonwebtoken");

const authenticatejwt = (req,res,next)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message:"Not logged in"});
        }   
        const decode = jwt.verify(token,process.env.JWT_SECRET);

        req.businessId = decode.id;
        req.businessEmail = decode.email;
        next();
    }
    catch(err){
        if(err.name == "TokenExpiredError"){
            return res.status(401).json({message:"Token expired,please login again"});
        }
        return res.status(401).json({message:"Invalid token"});
    }
};

module.exports = authenticatejwt;   