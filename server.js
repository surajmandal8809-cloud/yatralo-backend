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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
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

// Test route
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

// API routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});