import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import * as dotenv from 'dotenv'

dotenv.config()
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.ClientID,  // Add your Google client ID
      clientSecret: process.env.ClientSecret, // Add your Google client secret
      callbackURL: process.env.CallBackURL  // Define your callback URL
    },
    async (accessToken, refreshToken, profile, done) => { 
      try {
        // Check if the user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new user
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            profilePicture: profile.photos[0].value
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize and deserialize user to maintain session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
