const mongoose = require("mongoose");

 const connectDB = async () => {
     try {
        if(!process.env.MONGO_URL){
          console.log("MONGO_URL not valid");
          return;
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB Connected");
     } catch (error) {
        console.error("DB Connection Error:", error);
     }
 }

 module.exports = connectDB;