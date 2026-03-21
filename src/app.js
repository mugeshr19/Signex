const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req,res)=>{
    res.json({message:'Signex is running'});
})

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        });
        console.log('MongoDB connected successfully');
    })
    .catch((err)=>{
        console.log('database connection error :',err);
    });