import mongoose, { Schema } from "mongoose";

const WithdrawalHistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user making the withdrawal
  amount: { type: Number, required: true }, // Amount of the withdrawal
  currency: { type: String, enum: ['ETB', 'USD'], required: true }, // Currency type (ETB or USD)
  method: { type: String }, // Optional: method used for withdrawal (e.g., bank transfer, mobile money)
  transactionId: { type: String }, // Optional: transaction identifier from the payment gateway
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the withdrawal was made
});

const WithdrawalHistory = mongoose.model('WithdrawalHistory', WithdrawalHistorySchema);

export default WithdrawalHistory;
