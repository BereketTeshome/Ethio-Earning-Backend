import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["admin", "invester", "earner"],
    required: true,
    default: "earner",
  }, 
  is2FAEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  profilePicture: { type: String, default: null }, // Optional profile picture field
  active: { type: Boolean, default: false }, // Active status field
}, { timestamps: true }); // Enable automatic createdAt and updatedAt fields

const User = mongoose.model("User", UserSchema);
 
export default User;
