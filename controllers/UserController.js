const User = require("../models/User");

const getUser = async (req, res) => {
  try {
    const Exist = await User.findById(req.user._id).select("-password");
    if (!Exist) {
      return res.status(404).json({ status: false, message: "User Not Exist" })
    }
    return res.status(200).json({ status: true, message: "get User Successfully", data: Exist })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, location, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User Not Found" });
    }

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.mobile = phone;   
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    return res.status(200).json({ status: true, message: "Profile Updated Successfully", data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ status: false, message: "Avatar URL is required" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User Not Found" });
    }
    user.avatar = avatar;
    await user.save();
    return res.status(200).json({ status: true, message: "Avatar Updated Successfully", data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const addSavedTraveller = async (req, res) => {
  try {
    const { first_name, last_name, gender, type } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ status: false, message: "User Not Found" });

    user.saved_travellers.push({ first_name, last_name, gender, type });
    await user.save();
    return res.status(200).json({ status: true, message: "Traveller Saved Successfully", data: user.saved_travellers });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteSavedTraveller = async (req, res) => {
  try {
    const { travellerId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ status: false, message: "User Not Found" });

    user.saved_travellers = user.saved_travellers.filter(t => t._id.toString() !== travellerId);
    await user.save();
    return res.status(200).json({ status: true, message: "Traveller Deleted Successfully", data: user.saved_travellers });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  getUser,
  updateUser,
  updateAvatar,
  addSavedTraveller,
  deleteSavedTraveller
};