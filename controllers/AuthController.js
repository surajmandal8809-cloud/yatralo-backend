const bcryptjs = require("bcryptjs")
const User = require("../models/User");
const { generateToken } = require("../services/jwt");
const { sendResetPasswordEmail, resetPasswordEmail } = require("../services/mail");
const { generateOTP, verifyOTP } = require("../utils/otpHandler");

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile, password } = req.body;
    if (!first_name || !last_name || !password) {
      throw Error("Please fill required input")
    }
    if (!email && !mobile) {
      throw Error("Email or Mobile is Required")
    }

    const query = email ? { email } : { mobile };
    const Exist = await User.findOne(query);

    if (Exist) {
        if (email && Exist.email_verify_at == null) {
            const otpData = await generateOTP("email", Exist._id);
            return res.status(200).json({ status: true, message: "OTP sent on email Successfully", data: otpData })
        }
        if (mobile && Exist.mobile_verify_at == null) {
            const otpData = await generateOTP("mobile", Exist._id);
            return res.status(200).json({ status: true, message: "OTP sent on mobile Successfully", data: otpData })
        }
        return res.status(404).json({ status: false, message: "User Already Exist" })
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      email,
      mobile,
      password: hashPassword
    })
    
    const type = email ? "email" : "mobile";
    const otpData = await generateOTP(type, user._id);
    return res.status(200).json({ status: true, message: `OTP sent on ${type} Successfully`, data: otpData })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      throw Error("Email or Mobile is Required")
    }

    if (!password) {
      throw Error("Please fill required input")
    }

    const query = email ? { email } : { mobile };
    const Exist = await User.findOne(query);

    if (!Exist) {
      return res.status(404).json({ status: false, message: "User Not Exist" })
    }

    if (email && Exist.email_verify_at == null) {
      return res.status(400).json({ status: false, message: "Please verify your email" })
    }
    if (mobile && Exist.mobile_verify_at == null) {
        return res.status(400).json({ status: false, message: "Please verify your mobile" })
    }

    const isMatch = await bcryptjs.compare(password, Exist.password)
    if (!isMatch) {
      return res.status(401).json({ status: false, message: "Invalid Credentials" })
    }

    // Determine type for OTP
    const type = email ? "email" : "mobile";
    const otpData = await generateOTP(type, Exist._id);
    
    return res.status(200).json({ 
      status: true, 
      message: `OTP sent on ${type} Successfully`, 
      data: otpData 
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ status: false, message: "Please provide email or mobile" });
    }

    const query = email ? { email } : { mobile };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (email) {
        if (user.email_verify_at == null) {
            return res.status(400).json({ status: false, message: "Please verify your email first" });
        }
        const resetToken = generateToken(user);
        const resetLink = `${process.env.FRONTEND_URL}/auth/resetpassword?token=${resetToken}`;
        await sendResetPasswordEmail(user.email, resetLink);
        return res.status(200).json({ status: true, message: "Password reset link sent successfully to your Gmail" });
    } else {
        // Mobile flow
        if (user.mobile_verify_at == null) {
            return res.status(400).json({ status: false, message: "Please verify your mobile first" });
        }
        const otpData = await generateOTP("mobile", user._id);
        return res.status(200).json({ 
            status: true, 
            message: "OTP sent to your mobile successfully",
            data: otpData
        });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    if (!password || !confirm_password) {
      return res.status(400).json({ status: false, message: "Please fill required input" });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ status: false, message: "Password and Confirm Password must be same" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User Not Exist" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    user.password = hashPassword;
    await user.save();

    if (user.email) {
      await resetPasswordEmail(user.email, user);
    }

    return res.status(200).json({ status: true, message: "Password Reset Successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const { userId, otp, type } = req.body;
    if (!userId || !otp || !type) {
      return res.status(400).json({ status: false, message: "Missing required fields (userId, otp, type)" });
    }

    const Exist = await User.findById(userId);
    if (!Exist) {
      return res.status(404).json({ status: false, message: "User Not Exist" })
    }

    const verifyOTPResult = await verifyOTP(userId, otp);
    if (!verifyOTPResult) {
      return res.status(400).json({ status: false, message: "Invalid OTP" })
    }

    if (type === "email") {
      Exist.email_verify_at = new Date();
    } else if (type === "mobile") {
        Exist.mobile_verify_at = new Date();
    }
    await Exist.save();

    const token = generateToken(Exist)
    return res.status(200).json({ status: true, message: "OTP Verified Successfully", data: { token } })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

module.exports = { register, login, forgotPassword, resetPassword, verify }
