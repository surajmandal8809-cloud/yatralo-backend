const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./libs/connectDB");
const passport = require("passport");
const session = require("express-session");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

// CORS (simple and stable for development)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all local origins for development
      callback(null, true)
    },
    credentials: true,
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
const couponRoutes = require("./routes/couponRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/flights", flightRoutes);
app.use("/admin", adminRoutes);
app.use("/airports", airportRoutes);
app.use("/hotels", hotelRoutes);
app.use("/coupons", couponRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);

// Server
const PORT = process.env.PORT 
const HOST = process.env.HOST 

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});