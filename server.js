const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");

const connectDB = require("./libs/connectDB");

// Load env variables
dotenv.config();

// Connect database
connectDB();

// Initialize app
const app = express();

// Port (Render will provide PORT automatically)
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// CORS configuration

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL
    ],
    credentials: true
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const flightRoutes = require("./routes/flightRoutes");
const hotelRoutes = require("./routes/hotelRoutes");

// Test route
app.get("/", (req, res) => {
  res.send("Yatralo Backend API Running 🚀");
});

// API routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/flights", flightRoutes);
app.use("/hotels", hotelRoutes);

// Start server

app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${HOST}:${PORT}`);
});
