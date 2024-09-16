import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';


// Register the Local Strategy with Passport
passport.use(new LocalStrategy({
  usernameField: 'email',  // Use 'email' field instead of 'username'
  passwordField: 'password',  // Specify the password field
}, async (email, password, done) => {
  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Invalid email' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return done(null, false, { message: 'Invalid password' });
    }

    // If everything is correct, return the user
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Serialize the user ID to save in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize the user by ID to retrieve user details
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
