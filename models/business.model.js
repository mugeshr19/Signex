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
        unique: true
    },
    api:{
        type: String,
        unique: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Business',businessSchema); 