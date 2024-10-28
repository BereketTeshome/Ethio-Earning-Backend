// routes/paymentCallback.route.js
import User from '../models/user.model.js'; // Import the User model
import Transaction from '../models/transaction.model.js';
import DepositHistory from '../models/depositeHistory.model.js'
import PurchasedPackage from '../models/purchasedPackage.model.js'; // Import the PurchasedPackage model
import express from 'express';
import crypto from 'crypto'; 
const router = express.Router();

const secret = process.env.SECRET_CHAPA_WEBHOOK_HASH; 
// console.log(secret)
router.post('/callback', async (req, res) => {
    console.log("calback"); 
    const { tx_ref, status, amount, currency, charge, payment_method, reference } = req.body;
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');

       // Compare the generated hash with the one in the headers
       if (hash === req.headers['x-chapa-signature'] && status === 'success') {
        // The hashes match, so the request is valid  
        try {
             // 1. Search for the transaction by `paymentId` (which equals `tx_ref`)
             const transaction = await Transaction.findOne({ paymentId: tx_ref });
             if (!transaction) {
                 return res.status(404).json({ error: 'Transaction not found' });
             } 
             if (transaction.status === 'completed') {
                return res.status(200).json({ message: 'Transaction already processed' });
            } 
             // 2. Update the transaction status to 'completed'
             // 3. Find the user based on the transaction's `user` field
             const foundUser = await User.findById(transaction.user);
             if (!foundUser) {
                 return res.status(404).json({ error: 'User not found' });
                }
                transaction.status = 'completed';
                transaction.transactionReference = reference;
                await transaction.save();  
             // 4. Update user's `balanceETB` based on the transaction type
             if (transaction.transactionType === 'deposit') {
                // Add the deposit amount to the user's balance
                foundUser.balanceETB += transaction.amount;
            } else if (transaction.transactionType === 'withdrawal') {
                // Deduct the withdrawal amount from the user's balance
                foundUser.balanceETB -= transaction.amount;
            }
            else if(transaction.transactionType === 'purchasing_a_package')
            {
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

            }
            // Save the updated user
            await foundUser.save();
             // 5. Save the deposit/withdrawal history
             const depositHistory = new DepositHistory({
                user: foundUser._id,
                amount: amount,
                currency: currency,
                method: payment_method,
                transactionId: transaction._id,     
                feeCharge: charge
            });
            await depositHistory.save();

            console.log("Depoist money Transaction processed successfully.");
            res.sendStatus(200); // Send success response
        } catch (error) {
            res.sendStatus(401); // Send success response
        }
    } else {
        // The hashes don't match, so the request is not valid
        console.error("Webhook validation failed. Potential unauthorized request.");
        res.sendStatus(403); // Send forbidden response   
    }
});

export default router; 
