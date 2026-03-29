const otp = require('../models/otp.model');
const generateOtp = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');

exports.sendOtp = async(req,res)=>{
    try{
        const {email} = req.body;
        const businessId = req.business._id;

        const code = generateOtp();

        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await otp.deleteMany({businessId,email});
        await otp.create({businessId , email, code , expires}); 

        await sendEmail(email,code);
        res.status(200).json({message: `OTP sent to ${email}`});
    }
    catch(err){
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};

exports.verifyOtp = async(req,res)=>{
    try{
        const {email,code} = req.body;
        const businessId = req.business._id;

        const record = await otp.findOne({businessId,email,code});

        if(!record){
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (record.attempts >= 3) {
            await Otp.deleteOne({ _id: record._id });
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
        res.status(200).json({ message: 'OTP verified successfully' });
    }
    catch(err){
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};