const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if(!process.env.MONGO_URL){
            console.log("MONGO_URL not valid");
            return;
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB Connected");

        // Attempt to drop the problematic indexes that lack sparse: true
        try {
            await mongoose.connection.collection('users').dropIndex('googleId_1');
        } catch (err) {}
        try {
            await mongoose.connection.collection('users').dropIndex('mobile_1');
        } catch (err) {}


        // Sync indexes to recreate them correctly based on the current schema (which has sparse: true)
        try {
            const User = require("../models/User");
            await User.syncIndexes();
        } catch (err) {
            console.error("User Index sync error:", err);
        }

    } catch (error) {
        console.error("DB Connection Error:", error);
    }
}

module.exports = connectDB;