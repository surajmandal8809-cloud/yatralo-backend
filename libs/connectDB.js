const mongoose = require("mongoose");

 const connectDB = () => {
     try {
        if(!process.env.MONGO_URL){
          console.log("MONGO_URL not valid");
        }
        mongoose.connect(process.env.MONGO_URL);
      const db =   mongoose.connection;
      db.on("open", () => {
        console.log("DB Connected");
      })
        
     } catch (error) {
        console.log(error)
     }
 }

 module.exports = connectDB;