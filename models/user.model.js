import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["admin", "investor", "earner"],
    required: true,
    default: "earner",
  }, 
  is2FAEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  profilePicture: { type: String, default: null }, // Optional profile picture field
  active: { type: Boolean, default: false }, // Active status field
  purchasedPackages: [{ type: Schema.Types.ObjectId, ref: 'UserPackage' }], // References to the bought packages
   // Separate balances for ETB and USD
   balanceETB: { type: Number, default: 0 }, // Balance in Ethiopian Birr
   balanceUSD: { type: Number, default: 0 }, // Balance in US Dollars

  // Reference to the deposit and withdrawal history collections
  depositHistory: [{ type: Schema.Types.ObjectId, ref: 'DepositHistory' }],
  withdrawalHistory: [{ type: Schema.Types.ObjectId, ref: 'WithdrawalHistory' }],

  youtubeUrl: [{ type: String }],
  videoUrl:[{ type: String }], // The URL of the YouTube account
  telegramUrls: [{ type: String }], // Array of Telegram URLs
  tiktokUrls: [{ type: String }],   // Array of TikTok URLs
  instagramUrls: [{ type: String }], // Array of Instagram URLs
  facebookUrls: [{ type: String }], // Array of Facebook URLs
  twitterUrls: [{ type: String }], // Array of Twitter URLs
  linkedinUrls: [{ type: String }], // Array of LinkedIn URLs
  otherSocialMedia: { type: String }, // Optional for other platforms
}, { timestamps: true }); // Enable automatic createdAt and updatedAt fields

const User = mongoose.model("User", UserSchema);
 
export default User;
