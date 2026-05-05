const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getSettings } = require('../services/settings');

const initializePassport = async () => {
  const settings = await getSettings();
  const googleConfig = settings?.googleClient;

  if (!googleConfig?.clientId || !googleConfig?.clientSecret) {
    console.warn("Google OAuth credentials missing in settings. Google login may not work.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleConfig.clientId.trim(),
        clientSecret: googleConfig.clientSecret.trim(),
        callbackURL: process.env.GOOGLE_CALLBACK_URL?.trim() || "http://localhost:5000/auth/google/callback",
        proxy: true,
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
        pkce: false,
        state: false,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("Google profile email:", profile.emails[0]?.value);

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
};

// Optional for JWT-only auth (no session)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = { passport, initializePassport };