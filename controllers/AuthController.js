const bcryptjs = require("bcryptjs")

const User = require("../models/User");
const { generateToken } = require("../services/jwt");
const { sendResetPasswordEmail, resetPasswordEmail } = require("../services/mail");
const { generateOTP, verifyOTP } = require("../utils/otpHandler");


const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, mobile } = req.body;
    if (!first_name || !last_name || !password) {
      throw Error("pls fill required input")
    }
    const type = email ? "email" : "mobile";

    if (type === "email" && !email) {
      throw Error("Email is Required")

    }
    if (type === "mobile" && !mobile) {
      throw Error("Mobile is Required")

    }



    if (mobile && mobile.length !== 10) {
      throw Error("Mobile number must be 10 digits")
    }
    const Exist = await User.findOne({ "$or": [{ email }, { mobile }] });


    if (Exist && type == "mobile" && Exist.mobile_verify_at == null) {
      const otp = await generateOTP(type, Exist._id);
      return res.status(200).json({ status: true, message: `OTP sent on ${type} Successfully`, data: otp })
    }

    if (Exist && type == "email" && Exist.email_verify_at == null) {
      const otp = await generateOTP(type, Exist._id);
      return res.status(200).json({ status: true, message: `OTP sent on ${type} Successfully`, data: otp })
    }

    if (Exist) {
      return res.status(404).json({ status: true, message: "User Exist" })
    }

    const hashPassword = await bcryptjs.hash(password, 16);

    const user = await User.create({
      first_name,
      last_name,
      email,
      mobile,
      password: hashPassword
    })
    const otp = await generateOTP(type, user._id);
    return res.status(200).json({ status: true, message: `OTP sent on ${type} Successfully`, data: otp })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}





// Login for both email and mobile users to send OTP for verification before login and generating token after successful OTP verification in verify controller
const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    const type = email ? "email" : "mobile";

    if (type === "email" && !email) {
      throw Error("Email is Required")

    }
    if (type === "mobile" && !mobile) {
      throw Error("Mobile is Required")

    }

    if (!password) {
      throw Error("pls fill required input")
    }

    const Exist = await User.findOne({ "$or": [{ email }, { mobile }] });

    if (!Exist) {
      return res.status(404).json({ status: true, message: "User Not Exist" })
    }

    if (type == "mobile" && Exist.mobile_verify_at == null) {
      return res.status(400).json({ status: true, message: "Please verify your mobile number" })
    }

    if (type == "email" && Exist.email_verify_at == null) {
      return res.status(400).json({ status: true, message: "Please verify your email" })
    }



    const user = await bcryptjs.compare(password, Exist.password)
    if (!user) {
      return res.status(404).json({ status: true, message: "Invalid Credentials" })
    }


    const otp = await generateOTP(type, Exist._id);
    return res.status(200).json({ status: true, message: `OTP sent on ${type} Successfully`, data: otp })

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}







// Forgot Password for both email and mobile users to send reset password link on email or OTP on mobile for verification before resetting password

const forgotPassword = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        status: false,
        message: "Please provide email or mobile number",
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email: email || null }, { mobile: mobile || null }],
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // ================= EMAIL FLOW =================
    if (email) {

      if (user.email_verify_at == null) {
        return res.status(400).json({
          status: false,
          message: "Please verify your email first",
        });
      }

      const resetToken = generateToken(user);
      const resetLink = `${process.env.FRONTEND_URL}/auth/resetpassword?token=${resetToken}`;

      await sendResetPasswordEmail(user.email, resetLink);

      return res.status(200).json({
        status: true,
        message: "Password reset link sent successfully",
      });
    }

    // ================= MOBILE FLOW =================
    if (mobile) {

      if (user.mobile_verify_at == null) {
        return res.status(400).json({
          status: false,
          message: "Please verify your mobile number first",
        });
      }

      const type = "mobile";

      const otp = await generateOTP(type, user._id);

      return res.status(200).json({
        status: true,
        message: `OTP sent on ${type} successfully`,
        data: {
          userId: user._id,
          type: "mobile"
        }
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};






// Reset Password for both email and mobile users after verifying OTP and getting token
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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User Not Exist",
      });
    }

    const hashPassword = await bcryptjs.hash(password, 16);
    user.password = hashPassword;
    await user.save();

    // ✅ Only send email if user has email
    if (user.email) {
      await resetPasswordEmail(user.email, user);
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





// OTP verification for both email and mobile
const verify = async (req, res) => {
  try {
    const { userId, otp, type } = req.body;
    if (!userId && !otp && !type) {
      throw Error("pls fill required input")
    }

    const Exist = await User.findById(userId);

    if (!Exist) {
      return res.status(404).json({ status: true, message: "User Not Exist" })
    }
    const verifyOTPResult = await verifyOTP(userId, otp);
    if (!verifyOTPResult) {
      return res.status(400).json({ status: true, message: "Invalid OTP" })
    }

    if (type == "mobile") {
      Exist.mobile_verify_at = new Date();
    }
    if (type == "email") {
      Exist.email_verify_at = new Date();
    }
    await Exist.save();

    const token = generateToken(Exist)

    return res.status(200).json({ status: true, message: "OTP Verified Successfully", data: { token } })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verify
}