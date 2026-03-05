const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./libs/connectDB");
dotenv.config({})
require("dotenv").config();

const passport = require("passport");
const session = require("express-session");
const HOST = process.env.HOST;
const PORT = process.env.PORT;

connectDB();

//app
const app = express();
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  }));

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors())
app.use(passport.initialize());
app.use(passport.session());


//app routing
app.get("/",(req,res) => {
    res.send("Api working!")
})


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");


app.use("/auth", authRoutes)
app.use("/user", userRoutes)



//listen server
app.listen(PORT,HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});