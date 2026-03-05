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

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://yatralo-frontend.vercel.app",
      "https://yatralo-frontend-surajmandal8809-9288s-projects.vercel.app",
      "https://www.yatralo.online",
      "https://surajmandal8809-cloud.github.io"
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

// Test route
app.get("/", (req, res) => {
  res.send("Yatralo Backend API Running 🚀");
});

// API routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Start server

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});