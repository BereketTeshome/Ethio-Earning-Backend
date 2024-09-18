import mongoose, { Schema } from 'mongoose';

const UserPackageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who bought the package
  package: { type: Schema.Types.ObjectId, ref: 'Package', required: true }, // The purchased package
  purchasedAt: { type: Date, default: Date.now }, // When the package was purchased
  expiresAt: { type: Date }, // Expiry date of the package, if applicable
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

const UserPackage = mongoose.model('UserPackage', UserPackageSchema);

export default UserPackage;
