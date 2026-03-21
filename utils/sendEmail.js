const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    }
});
    
const sendEmail = async(to,otp)=>{
    await transporter.sendMail({
        from: `"Signex" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Your OTP Code',
        html: `
            <h2>Your OTP is: <strong>${otp}</strong></h2>
            <p>Valid for 10 minutes. Do not share this with anyone.</p>
        `
    });
};

module.exports = sendEmail;