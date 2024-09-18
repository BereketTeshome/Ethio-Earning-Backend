import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import speakeasy from 'speakeasy';
import User from '../models/user.model.js';
import transporter from '../config/nodemailer.js';

export const demoController = async (req,res) =>{
    res.send("demo");
}
// Register User
export const register = async (req, res) => {
  try {
    const { email, password, name,role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      role,
      name,
      email,
      password: hashedPassword,
      twoFactorSecret: secret.base32,
    });
    await newUser.save();

    await transporter.sendMail({
      from: `"ETHIO EARNING" <${process.env.EMAIL_SENDER_ADDRESS}>`,
      to: newUser.email,
      subject: 'Your 2FA Verification Code',
      text: `Your 2FA code is ${token}`,
    });

    res.status(201).json({ message: 'Verification code has been sent to your email address' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate User Account
export const activateTheUserAccount = async (req, res) => {
  try {
    const { userEmail, token } = req.body;
    const user = await User.findOne({ email: userEmail }); 

    if (!user) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 20,
    });

    if (isValid) {
      user.active = true;
      await user.save();
      res.json({ message: '2FA verified and account activated' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
export const login = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, async (err) => {
      if (err) return next(err);

      if (!user.active) {
        return res.status(400).json({ message: 'Please verify your account' });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Login successful',
        user: { email: user.email, role: user.role },
      });
    });
  })(req, res, next);
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'No user found with that email' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"ETHIO EARNING" <${process.env.EMAIL_SENDER_ADDRESS}>`,
      to: user.email,
      subject: 'Password Reset',
      text: `Please use the following link to reset your password: ${resetURL}`,
    });

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === 'object' && 'id' in decoded) {
      const userId = decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: 'Invalid token or user no longer exists' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password reset successful, you can now log in with your new password' });
    } else {
      res.status(400).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// Google Authentication
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleAuthHandler = async (req, res) => {
  try {
    const user = req.user; // Assuming req.user contains Google profile information
    const { email, name, googleId, profilePicture } = user;

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser._id, email: existingUser.email, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }  
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Login successful',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      });
    } else {
      const newUser = new User({
        name,
        email,
        googleId,
        profilePicture,
        role: 'user',
        active: true,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'User registered and login successful',
        user: {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    }
  } catch (error) {
    console.error('Error in Google authentication handler:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Enable 2FA
export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.is2FAEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    user.is2FAEnabled = true;
    await user.save();

    res.json({ message: '2FA successfully enabled by your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify 2FA
export const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (isValid) {
      res.json({ message: '2FA verified and login successful', user });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error: Unable to fetch users' });
  }
};
// Controller to get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error: Unable to fetch the user' });
  }
};

// Controller to update a user by ID
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) { 
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error: Unable to update user' });
  }
};

// Controller to delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: Unable to delete user' });
  } 
};
