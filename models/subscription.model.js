import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  earner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchasedPackage', required: true },
  screenshotUrl: { type: String, default: null }, // New field for screenshot URL for subscription confirmation
  viewConfirmation: { type: String, default: null }, // Field for user confirmation of video view (e.g., a code or answer)
  viewed: { type: Boolean, default: false }, // Whether the user confirmed watching the video
},{ timestamps: true });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
