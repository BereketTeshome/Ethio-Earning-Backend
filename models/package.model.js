import mongoose, { Schema } from 'mongoose';

const PackageSchema = new Schema({
  name: { type: String, required: true }, // Name of the package
  priceETB: { type: Number, required: true }, // Price of the package in ETB
  priceUSD: { type: Number, required: true }, // Price of the package in USD
  duration: { type: Number, required: true }, // Duration of the package (e.g., in months or days)
  rewardCoinETB: { type: Number, required: true }, // Reward coins based on ETB currency
  rewardCoinUSD: { type: Number, required: true }, // Reward coins based on USD currency
  maxSubscribers: { type: Number, required: true }, // Maximum number of people allowed to subscribe
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to the category this package belongs to
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the admin who created this package
}, { timestamps: true });

const Package = mongoose.model('Package', PackageSchema);     

export default Package;
