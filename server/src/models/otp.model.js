const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    businessId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    channel: {
        type: String,
        enum: ['email', 'sms'],
        required: true
    },
    target: {
        type: String,
        required: true
    },
    code:{
        type: String,
        required: true,
    },
    expires:{
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,   
        max: 3        
    }
});

module.exports = mongoose.model('Otp',otpSchema);