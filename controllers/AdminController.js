const Admin = require("../models/Admin");
const Setting = require("../models/Setting");

const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const Hotel = require("../models/Hotel");
const Bus = require("../models/Bus");
const Train = require("../models/Train");

const getUser = async (req, res) => {
  try {
    const Exist = await Admin.findById(req.user._id).select("-password");
    if (!Exist) {
      return res.status(404).json({ status: false, message: "Admin Not Exist" })
    }
    return res.status(200).json({ status: true, message: "Get Admin Successfully", data: Exist })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const adminId = req.user._id;
    const updateData = req.body;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true }).select("-password");
    
    if (!updatedAdmin) {
      return res.status(404).json({ status: false, message: "Admin Not Exist" });
    }
    
    return res.status(200).json({ status: true, message: "Admin Updated Successfully", data: updatedAdmin });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

const updateAvatar = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { avatar } = req.body;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, { avatar }, { new: true }).select("-password");
    
    if (!updatedAdmin) {
      return res.status(404).json({ status: false, message: "Admin Not Exist" });
    }
    
    return res.status(200).json({ status: true, message: "Admin Avatar Updated Successfully", data: updatedAdmin });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

// Booking Management
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Flight Management
const addFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    return res.status(201).json({ status: true, message: "Flight added successfully", data: flight });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: true, data: flights });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ status: true, message: "Flight updated successfully", data: flight });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: true, message: "Flight deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Hotel Management
const addHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    return res.status(201).json({ status: true, message: "Hotel added successfully", data: hotel });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: true, data: hotels });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ status: true, message: "Hotel updated successfully", data: hotel });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: true, message: "Hotel deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Bus Management
const addBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    return res.status(201).json({ status: true, message: "Bus added successfully", data: bus });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: true, data: buses });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ status: true, message: "Bus updated successfully", data: bus });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: true, message: "Bus deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Train Management
const addTrain = async (req, res) => {
  try {
    const train = await Train.create(req.body);
    return res.status(201).json({ status: true, message: "Train added successfully", data: train });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getTrains = async (req, res) => {
  try {
    const trains = await Train.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: true, data: trains });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ status: true, message: "Train updated successfully", data: train });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteTrain = async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: true, message: "Train deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const bookingsCount = await Booking.countDocuments();
    const usersCount = await require("../models/User").countDocuments();
    const flightsCount = await Flight.countDocuments();
    const hotelsCount = await Hotel.countDocuments();
    const busesCount = await Bus.countDocuments();
    const trainsCount = await Train.countDocuments();

    // Summing revenue from bookings
    const aggregateRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const revenue = aggregateRevenue[0]?.total || 0;

    return res.status(200).json({
      status: true,
      data: {
        bookings: bookingsCount,
        revenue: revenue,
        customers: usersCount,
        assets: flightsCount + hotelsCount + busesCount + trainsCount
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await getSettingsService();
    return res.status(200).json({ status: true, data: settings });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const { getSettings: getSettingsService, clearSettingsCache } = require("../services/settings");

const { initializePassport } = require("../config/passport");

const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      // Use $set to only update the fields provided in req.body
      // This helps with partial updates from different settings pages
      settings = await Setting.findOneAndUpdate({}, { $set: req.body }, { new: true });
    }
    
    clearSettingsCache();

    // If Google credentials were changed, re-initialize passport
    if (req.body.googleClient) {
      console.log("Re-initializing Passport with new Google credentials...");
      await initializePassport();
    }

    return res.status(200).json({ status: true, message: "Settings updated successfully", data: settings });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  getUser,
  updateUser,
  updateAvatar,
  getAllBookings,
  getStats,
  addFlight,
  getFlights,
  updateFlight,
  deleteFlight,
  addHotel,
  getHotels,
  updateHotel,
  deleteHotel,
  addBus,
  getBuses,
  updateBus,
  deleteBus,
  addTrain,
  getTrains,
  updateTrain,
  deleteTrain,
  getSettings,
  updateSettings
}

