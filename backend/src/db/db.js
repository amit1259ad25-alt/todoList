const mongoose = require("mongoose")

async function connectDB(){

    await mongoose.connect("mongodb+srv://amit123:zpb4pnDdYMMhNYoC@cluster1.gnj99yz.mongodb.net/notes")
    console.log("Connected to the database successfully !");
    
}


module.exports = connectDB;