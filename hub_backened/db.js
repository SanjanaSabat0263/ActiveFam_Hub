const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL,{
    
}).then(
    () =>{
        console.log('connected to databse');
        
    }

).catch((err) =>{
    console.log('error connecting to database' +err);
    
})