const business = require('../models/business.model');

const  validateApiKey = async(req,res,next)=>{
    try{
        const apiKey = req.headers['x-api-key'];
        if(!apiKey){
            return res.status(401).json({message: 'API key is required'})
        }
        const validBusiness = await business.findOne({apiKey});
        if(!validBusiness){
            return res.status(403).json({message: 'Invalid API key'});
        }
        req.business = business;
        next();
    }
    catch(err){
        res.status(500).json({message: 'apiKey validation'});
    }
};

module.exports = validateApiKey;