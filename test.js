require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URI).then(async () =>{
    const drivers = await User.find({role:'driver', isOnline:true});
    console.log(drivers);
    process.exit();
})