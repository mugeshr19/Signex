const otp = require('../models/otp.model');
const generateOtp = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');

exports.sendOtp = async(req,res)=>{
    try{
        const {email,phone,channel} = req.body;
        const businessId = req.business._id;
        
        const code = generateOtp();
        const target = channel === "sms" ? phone : email;

        if (!target) {
        return res.status(400).json({ message: "Target (email/phone) is required" });
        }
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        if(channel=="sms"){
            await otp.deleteMany({ businessId, channel, target });
            await otp.create({ businessId, channel , target , code, expires, attempts: 0 });
            await sendSms(phone, code);
            res.status(200).json({ message: `OTP sent to ${phone}` });
        }
        else{
            await otp.deleteMany({ businessId, channel, target });
            await otp.create({businessId , channel , target , code , expires, attempts: 0}); 
            await sendEmail(email,code);
            res.status(200).json({message: `OTP sent to ${email}`});
        }
    }
    catch(err){
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};

exports.verifyOtp = async(req,res)=>{
    try{
        const {email,phone,code,channel} = req.body;
        const businessId = req.business._id;
        if (!channel || !["sms", "email"].includes(channel)) {
            return res.status(400).json({ message: "Invalid channel" });
        }
        const target = channel === "sms" ? phone : email;

        if (!target) {
        return res.status(400).json({ message: "Target (email/phone) is required" });
        }
        const record = await otp.findOne({businessId,channel,target});

        if(!record){
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (record.attempts >= 3) {
            await otp.deleteOne({ _id: record._id });
            return res.status(400).json({ message: 'Too many wrong attempts, please request a new OTP' });
        }
        if (record.expires < new Date()) {
            await otp.deleteOne({ _id: record._id });
            return res.status(400).json({ message: 'OTP expired' });
        }
        if (record.code !== code) {
            record.attempts += 1;
            await record.save();
 
            const remainingAttempts = 3 - record.attempts;
            return res.status(400).json({
                message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining`
            });
        }

        await otp.deleteOne({_id: record._id});
        if(req.business.webhook){
            try{
                await fetch(req.business.webhook,{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body: JSON.stringify({
                        event:"otp.verified",
                        target,
                        channel,
                        businessId: req.business._id,
                        verifiedAt: new Date()
                    })
                });
            }
            catch(webhookErr){  
                console.log("Webhook failed:",webhookErr.message);
            }
        }
        res.status(200).json({ message: 'OTP verified successfully' });
    }
    catch(err){
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};