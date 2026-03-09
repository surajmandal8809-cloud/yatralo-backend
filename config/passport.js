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
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        const photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        if (!email) {
          return done(new Error("No email found from Google profile"), null);
        }

        // Find user by email
        let user = await User.findOne({ email: email });

        if (user) {
          // Update user details
          const updateData = {
            first_name: profile.name.givenName || user.first_name,
            last_name: profile.name.familyName || user.last_name,
            avatar: photo || user.avatar,
            googleId: profile.id,
          };

          // If user hasn't verified email, mark as verified now since they're using Google
          if (!user.email_verify_at) {
            updateData.email_verify_at = new Date();
          }

          user = await User.findOneAndUpdate(
            { email: email },
            updateData,
            { new: true }
          );
        } else {
          // Create new user
          user = await User.create({
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            email: email,
            avatar: photo,
            googleId: profile.id,
            email_verify_at: new Date(),
            authType: 'google',
          });
        }

        return done(null, user);
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