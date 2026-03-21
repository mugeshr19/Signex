const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    businessId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
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
    }
});

module.exports = mongoose.model('Otp',otpSchema);