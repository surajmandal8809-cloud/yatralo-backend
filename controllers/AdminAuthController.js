const bcryptjs = require("bcryptjs");

const AdminModel = require("../models/Admin");
const { generateToken } = require("../services/jwt");
const { sendResetPasswordEmail, resetPasswordEmail } = require("../services/mail");
const { generateOTP, verifyOTP } = require("../utils/otpHandler");



// Login for email Admins - Direct login without OTP
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Email and Password are required" });
    }

    // Standard login check
    let admin = await AdminModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    // 💡 Auto-create admin from .env if it matches and doesn't exist
    // This is a common requirement when "mongo db gmail password" is provided in .env
    const envAdminEmail = process.env.Admin_Email;
    const envAdminPassword = process.env.Admin_Password;

    if (!admin && email.toLowerCase() === envAdminEmail?.toLowerCase()) {
      const hashPassword = await bcryptjs.hash(envAdminPassword, 10);
      admin = await AdminModel.create({
        email: envAdminEmail,
        password: hashPassword,
        first_name: "System",
        last_name: "Admin",
        email_verify_at: new Date()
      });
      console.log("Default Admin created from .env");
    }

    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin Account Not Found" });
    }

    // Check password (checking against hashed password)
    const passwordMatches = await bcryptjs.compare(password, admin.password);
    
    // Also allow direct match for .env password if provided as plain text (fallback for dev)
    const isEnvMatch = (email.toLowerCase() === envAdminEmail?.toLowerCase() && password === envAdminPassword);
    
    if (!passwordMatches && !isEnvMatch) {
      return res.status(401).json({ status: false, message: "Invalid Credentials" });
    }

    // Generate Token directly
    const token = generateToken(admin, "admin");
    
    // Remove sensitive data
    const adminData = admin.toObject();
    delete adminData.password;

    return res.status(200).json({ 
      status: true, 
      message: "Authentication successful", 
      data: { 
        token, 
        admin: adminData
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};







// Forgot Password for email Admins to send reset password link on email for verification before resetting password

// Forgot Password for Admins - Sends reset password link via email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: false, message: "Email is required" });
    }

    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin Not Found" });
    }

    // Generate token and reset link
    const resetToken = generateToken(admin, "admin");
    const frontendUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/auth/resetpassword?token=${resetToken}`;

    await sendResetPasswordEmail(admin.email, resetLink);

    return res.status(200).json({
      status: true,
      message: "Password reset link sent to your email successfully",
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};






// Reset Password for both email and mobile Admins after verifying OTP and getting token
const resetPassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;

    if (!password || !confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Please fill required input",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Password and Confirm Password must be same",
      });
    }

    const admin = await AdminModel.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin Not Exist",
      });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    admin.password = hashPassword;
    await admin.save();

    // ✅ Only send email if Admin has email
    if (admin.email) {
      await resetPasswordEmail(admin.email, admin);
    }

    return res.status(200).json({
      status: true,
      message: "Password Reset Successfully",
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};





// OTP verification for email
const verify = async (req, res) => {
  try {
    const { adminId, otp, type } = req.body;
    
    if (!adminId || !otp || !type) {
      return res.status(400).json({ status: false, message: "Missing required fields (adminId, otp, type)" });
    }

    const Exist = await AdminModel.findById(adminId);

    if (!Exist) {
      return res.status(404).json({ status: false, message: "Admin Not Exist" })
    }

    const verifyOTPResult = await verifyOTP(adminId, otp, "admin");
    if (!verifyOTPResult) {
      return res.status(400).json({ status: false, message: "Invalid OTP" })
    }

    if (type === "email") {
      Exist.email_verify_at = new Date();
    } else if (type === "mobile") {
      Exist.mobile_verify_at = new Date();
    }
    
    await Exist.save();

    const token = generateToken(Exist, "admin")
    
    // Remove password from response
    const adminData = Exist.toObject();
    delete adminData.password;

    return res.status(200).json({ status: true, message: "OTP Verified Successfully", data: { token, admin: adminData } })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}


module.exports = {
  login,
  forgotPassword,
  resetPassword,
  verify
}
