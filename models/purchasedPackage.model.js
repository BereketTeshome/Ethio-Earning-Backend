import mongoose, { Schema } from 'mongoose';

const PurchasedPackageSchema = new Schema({
  investor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the investor who bought the package
  package: { type: Schema.Types.ObjectId, ref: 'Package', required: true }, // Reference to the purchased package
  currentSubscribers: { type: Number, default: 0 }, // Number of people who have subscribed (default is 0)
  remainingSubscribers: {
    type: Number,
    default: function() {
      return this.package.maxSubscribers; // Default to package's maxSubscribers
    },
  },
  active: { type: Boolean, default: true }, // Active status (default is true)
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' }, // Reference to the linked transaction
}, { timestamps: true });

// Pre-save hook to update 'active' field based on currentSubscribers and remainingSubscribers
PurchasedPackageSchema.pre('save', function (next) {
  if (this.currentSubscribers >= this.remainingSubscribers) {
    this.active = false; // Set active to false when subscribers limit is reached
  } else {
    this.active = true; // Otherwise, keep it true
  }
  next();
});

const PurchasedPackage = mongoose.model('PurchasedPackage', PurchasedPackageSchema);

export default PurchasedPackage;
