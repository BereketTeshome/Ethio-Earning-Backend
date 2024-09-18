import mongoose, { Schema } from "mongoose";

const DepositHistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user making the deposit
  amount: { type: Number, required: true }, // Amount of the deposit
  currency: { type: String, enum: ['ETB', 'USD'], required: true }, // Currency type (ETB or USD)
  method: { type: String }, // Optional: payment method used for the deposit (e.g., card, bank transfer)
  transactionId: { type: String }, // Optional: transaction identifier from the payment gateway
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the deposit was made
});

const DepositHistory = mongoose.model('DepositHistory', DepositHistorySchema);

export default DepositHistory;
