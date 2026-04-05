const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    apiKey:{
        type: String,
        unique: true
    },
    webhook:{
        type: String,
        default: null
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Business',businessSchema); 