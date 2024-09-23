import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user involved in the transaction
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' }, // For package purchases
  amount: { type: Number, required: true }, // Amount of the transaction
  currency: { type: String, enum: ['ETB', 'USD'], required: true }, // Currency type
  paymentMethod: { type: String, enum: ['Chapa', 'Stripe'], required: true }, // Payment processor
  paymentId: { type: String }, // Transaction reference or ID from Chapa/Stripe
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'purchase_package'],
    required: true, // Specifies the type of transaction
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  date: { type: Date, default: Date.now }, // Transaction date
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
