const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // First try to find a user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If no user found by Google ID, try to find by email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists with this email, update their Google ID
            user.googleId = profile.id;
            await user.save();
          } else {
            // If no user exists at all, create a new one
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            });
          }
        }

        // Attach photo to user object without saving to DB
        const userObj = user.toObject ? user.toObject() : { ...user };
        userObj.photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
        return done(null, userObj);
      } catch (err) {
        console.error("Google Auth Error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
