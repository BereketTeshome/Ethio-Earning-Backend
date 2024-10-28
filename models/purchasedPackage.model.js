import mongoose, { Schema } from 'mongoose';

const PurchasedPackageSchema = new Schema({
  investor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the investor who bought the package
  package: { type: Schema.Types.ObjectId, ref: 'Package', required: true }, // Reference to the purchased package
  currentSubscribers: { type: Number, default: 0 }, // Number of people who have subscribed (default is 0)
  remainingSubscribers: {
    type: Number,
    default: function () {
      return this.package.maxSubscribers; // Default to package's maxSubscribers
    },
  },
  currentViewers: { type: Number, default: 0 }, // Number of people who have viewed the content (default is 0)
  remainingViewers: {
    type: Number,
    default: function () {
      return this.package.maxViewers; // Default to package's maxViewers
    },
  },
  active: { type: Boolean, default: true }, // Active status (default is true)
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' }, // Reference to the linked transaction
}, { timestamps: true });

// Pre-save hook to update 'active' field based on currentSubscribers, remainingSubscribers, and transaction status
PurchasedPackageSchema.pre('save', async function (next) {
  if (this.transaction) {
    // Populate the transaction to check its status
    const Transaction = mongoose.model('Transaction');
    const transaction = await Transaction.findById(this.transaction).exec();

    if (transaction) {
      // Set active to false if the transaction is pending or failed
      if (transaction.status === 'pending' || transaction.status === 'failed') {
        this.active = false;
      } else {
        // Set active to false only when both subscriber and viewer limits are reached
        this.active = !(this.currentSubscribers >= this.remainingSubscribers && this.currentViewers >= this.remainingViewers);
      }
    } else {
      this.active = false; // If no transaction found, set active to false
    }
  } else {
    // If there is no transaction, set active to false without checking subscriber/viewer limits
    this.active = false;
  }
  next();
});

const PurchasedPackage = mongoose.model('PurchasedPackage', PurchasedPackageSchema);

export default PurchasedPackage;
