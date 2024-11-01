import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import express from 'express';
import PurchasedPackage from '../models/purchasedPackage.model.js'; // Import the PurchasedPackage model
import {capturePayment} from '../services/paypal.js'
const router = express.Router();

router.get('/complete-order-usd',async (req, res) => { 
    try {
        await capturePayment(req.query.token)
        const transaction = await Transaction.findOneAndUpdate(
            { paymentId: req.query.token},
            { status: 'completed' },
            { new: true } // Return the updated transaction
          );
    
          if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
          }
         // Check the transaction type
    if (transaction.transactionType === 'purchasing_a_package') {

      const purchasedPackage = await PurchasedPackage.findOne({ transaction: transaction._id });
      if (purchasedPackage) {
          purchasedPackage.active = true;
          await purchasedPackage.save();
          console.log("Purchased package has been activated.");
      } else {
          console.error("Purchased package not found for this transaction.");
          return res.status(404).json({ error: 'Purchased package not found' });
      }

      console.log("Purchasing a package transaction processed successfully.");
      return res.sendStatus(200); // Return response and end request
      } else if (transaction.transactionType === 'deposit') {
        // If the transaction is a deposit, find the user and update their balance
        const user = await User.findById(transaction.user);  // Assuming transaction has userId field
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Update the user's balance by adding the transaction amount
        user.balanceUSD += transaction.amount;
        await user.save();  // Save the updated user document
  
        return res.send('Deposit completed successfully. User balance updated.');
      }
       // If none of the transaction types match, send a default message
    res.status(400).json({ message: 'Invalid transaction type' }); 
    } catch (error) {
        res.send('Error: ' + error)
    }
})

export default router