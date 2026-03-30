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
  },
  saved_travellers: [
    {
      first_name: String,
      last_name: String,
      gender: { type: String, enum: ['MALE', 'FEMALE'] },
      type: { type: String, enum: ['ADULT', 'CHILD', 'INFANT'], default: 'ADULT' }
    }
  ]

}, { timestamps: true })

module.exports = UserModel = mongoose.model("User", UserSchema)