import mongoose, { Schema } from "mongoose";

const DepositHistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user making the deposit
  amount: { type: Number, required: true }, // Amount of the deposit
  currency: { type: String, enum: ['ETB', 'USD'], required: true }, // Currency type (ETB or USD)
  method: { type: String }, // Optional: payment method used for the deposit (e.g., card, bank transfer)
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },

  feeCharge: { type: Number, default: 0 }, // Optional: fee charged for the deposit
},{ timestamps: true });

const DepositHistory = mongoose.model('DepositHistory', DepositHistorySchema);

export default DepositHistory;
