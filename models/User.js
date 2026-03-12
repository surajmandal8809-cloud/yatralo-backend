const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    default: null
  },
  last_name: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: null
  },
  email: {
    type: String,
    sparse: true,
    unique: true
  },
  password: {
    type: String,
  },
  avatar: {
    type: String,
    default: null
  },
  mobile: {
    type: String,
    default: null
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
    enum: ['local', 'google', "facebook"],
    default: 'local'
  },
  location: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  }

}, { timestamps: true })

module.exports = UserModel = mongoose.model("User", UserSchema)