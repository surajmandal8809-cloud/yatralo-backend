const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
      default: null
    },
    last_name: {
      type: String,
      trim: true,
      default: null
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },
    password: {
      type: String
    },
    avatar: {
      type: String,
      default: null
    },

    // ✅ FIXED MOBILE FIELD
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // 🔥 IMPORTANT FIX
    },

    email_verify_at: {
      type: Date,
      default: null
    },
    mobile_verify_at: {
      type: Date,
      default: null
    },

    googleId: {
      type: String,
      default: null
    },

    authType: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    },

    location: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      default: null
    },

    saved_travellers: [
      {
        first_name: { type: String, trim: true },
        last_name: { type: String, trim: true },
        gender: { type: String, enum: ["MALE", "FEMALE"] },
        type: {
          type: String,
          enum: ["ADULT", "CHILD", "INFANT"],
          default: "ADULT"
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);