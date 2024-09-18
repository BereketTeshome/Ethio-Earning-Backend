import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  earner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  screenshotUrl: { type: String, default: null }, // New field for screenshot URL
  createdAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
