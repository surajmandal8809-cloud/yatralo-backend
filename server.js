const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./libs/connectDB");
const passport = require("passport");
const session = require("express-session");
const path = require("path");

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("CRITICAL ERROR: Google Auth environment variables are missing!");
} else {
  console.log("Google Auth credentials loaded successfully.");
}

connectDB();


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
app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
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

// Server
try {
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || "0.0.0.0";

  app.listen(PORT, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  }).on('error', (err) => {
    console.error("Server listen error:", err);
  });
} catch (startError) {
  console.error("FATAL ERROR ON STARTUP:", startError);
  process.exit(1);
}