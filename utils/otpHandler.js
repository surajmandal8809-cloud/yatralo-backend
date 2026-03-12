const mongoose = require("mongoose");
const OTPModel = require("../models/Otp");
const UserModel = require("../models/User");
const { sendOTPEmail } = require("../services/mail");
const { sendMessage } = require("../services/twilio");

const generateOTP = async (type,userId) => {
    console.log(type, userId);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const User = await UserModel.findById(userId);
   const Exist = await OTPModel.findOne({userId});
   if(Exist){
    await OTPModel.findByIdAndDelete(Exist._id)
   }
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await OTPModel.create({userId, otp, expiresAt});

    const message = `Your Verifcation OTP is : ${otp}`;

    if(type=="mobile"){
        await sendMessage(User.mobile,message);
    }

      if(type=="email"){
        await sendOTPEmail(User.email,message);
    }
  
     return {type, expiresAt, userId} 
}

const verifyOTP = async (userId, otp) => {
    console.log(`Checking OTP in DB for user ${userId}: ${otp}`);
    
    // For testing purposes, allow 000000
    if (otp === "000000") {
        console.log("Using test bypass OTP");
        return true;
    }

    const record = await OTPModel.findOne({ 
        userId: mongoose.Types.ObjectId.isValid(userId) ? userId : userId, 
        otp: String(otp).trim() 
    });
    
    if (!record) {
        console.log(`No record found for user ${userId} with OTP ${otp}. Searching for any OTP for this user...`);
        const userOTP = await OTPModel.findOne({ userId });
        if (userOTP) {
            console.log(`Found a different OTP for this user: ${userOTP.otp}`);
        }
        throw new Error("Invalid OTP");
    }
    
    const now = new Date();
    if (record.expiresAt < now) {
        console.log(`OTP expired for user ${userId}. Expired at: ${record.expiresAt}, Now: ${now}`);
        await OTPModel.findByIdAndDelete(record._id);
        throw new Error("OTP expired");
    }
    
    await OTPModel.findByIdAndDelete(record._id);
    console.log(`OTP verified successfully for user ${userId}`);
    return true;
}

module.exports = {generateOTP, verifyOTP}