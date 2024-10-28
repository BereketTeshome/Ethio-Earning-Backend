import mongoose, { Schema } from 'mongoose';

const PackageSchema = new Schema({
  name: { type: String, required: true },  // e.g. "10,000 Subscribers"
  priceETB: { type: Number, required: true }, // Price of the package in ETB
  priceUSD: { type: Number, required: true }, // Price of the package in USD
  duration: { type: Number, required: true }, // Duration of the package (e.g., in months or days)
  rewardCoinETB: { type: Number, required: true }, // Reward coins based on ETB currency
  rewardCoinUSD: { type: Number, required: true }, // Reward coins based on USD currency
  maxSubscribers: { type: Number, required: true }, // Maximum number of people allowed to subscribe
  maxViewers: { type: Number, required: true }, // Maximum number of viewers for the package
  features: [{ 
    type: String,
    enum: ["youtube", "tiktok", "instagram", "facebook", "telegram", "twitter", "other social media link","your own website","Linkdin","your own video"], // Allowed values for the features field
  }],
  active: { type: Boolean, default: false },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to the category this package belongs to
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the admin who created this package
}, { timestamps: true });

const Package = mongoose.model('Package', PackageSchema);

export default Package;
