const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update user details
          user = await User.findOneAndUpdate(
            { email: profile.emails[0].value },
            {
              first_name: profile.name.givenName,
              last_name: profile.name.familyName,
              avatar: profile.photos[0].value,
              googleId: profile.id,
            },
            { new: true } // return updated document
          );
        } else {
          // Create new user
          user = await User.create({
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            googleId: profile.id,
            email_verify_at: new Date(),
            authType: profile.provider,
          });
        }

        return done(null, user); // pass DB user to req.user
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

// Optional for JWT-only auth (no session)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;