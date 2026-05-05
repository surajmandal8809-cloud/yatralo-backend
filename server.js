require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { passport, initializePassport } = require("./config/passport");
const session = require("express-session");
const path = require("path");
const connectDB = require("./libs/connectDB");

const app = express();
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true)
    },
    credentials: true,
  })
);

// Session
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Requires HTTPS in production
      sameSite: isProduction ? "none" : "lax", // 'none' is required for cross-site OAuth redirects
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Test Route
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const flightRoutes = require("./routes/flightRoutes");
const adminRoutes = require("./routes/adminRoutes");
const airportRoutes = require("./routes/airportRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const busRoutes = require("./routes/busRoutes");
const trainRoutes = require("./routes/trainRoutes");
const couponRoutes = require("./routes/couponRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/flights", flightRoutes);
app.use("/admin", adminRoutes);
app.use("/airports", airportRoutes);
app.use("/hotels", hotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/coupons", couponRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/buses", busRoutes);
app.use("/trains", trainRoutes);
app.post("/api/chat", require("./controllers/ChatController").chatWithAI);

// Server Startup
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || "0.0.0.0";

    // 1. Connect to Database
    await connectDB();
    
    // 2. Initialize passport (requires DB settings)
    await initializePassport();

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the process or use a different port.`);
      } else {
        console.error("Server listen error:", err);
      }
    });
  } catch (error) {
    console.error("FATAL ERROR ON STARTUP:", error);
    process.exit(1);
  }
};

startServer();