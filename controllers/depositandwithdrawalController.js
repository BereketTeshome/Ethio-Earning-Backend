import User from '../models/user.model.js'; // Import the User model
import Transaction from '../models/transaction.model.js';
import {initializeChapaPayment} from '../services/initializeChapaPayment.js';
import WithdrawalHistory from '../models/withdrawal.model.js';
export const depositMoneyETB = async (req, res) => {
    const { userId, amount, currency } = req.body;

    // Input validation
    if (!userId || !amount || !currency) {
        return res.status(400).json({ error: 'User ID, amount, and currency are required' });
    } 

    if (currency !== 'ETB') {
        return res.status(400).json({ error: 'Currency must be ETB for Chapa transactions' });
    }
  
    try { 
        // Fetch user details from the database
        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

    
        // Initialize payment with Chapa 

        const chapaResponse = await initializeChapaPayment(user,amount,'deposit',currency);
        // console.log(chapaResponse)
        if (chapaResponse.status !== 'success') {
            return res.status(500).json({ message: 'Chapa payment initialization failed' });
        }
        const transaction = new Transaction({
            user: user._id,
            amount,
            currency,
            paymentMethod:"Chapa",
            transactionType: 'deposit',
            paymentId: chapaResponse.tx_ref, // Chapa transaction reference
            status: 'pending', 
          });
      
          // Save the transaction to the database
           await transaction.save();  
        // Respond with the Chapa checkout URL
        return res.status(200).json({ checkout_url: chapaResponse.data.checkout_url });
        
    } catch (error) {
        console.error('Chapa API Error:', error);
        return res.status(500).json({ error: 'An error occurred while processing the deposit' });
    }
};
 
// Withdraw money function
export const withdrawMoneyETB = async (req, res) => {
    const { userId, amount, currency } = req.body;

    // Input validation
    if (!userId || !amount || !currency) {
        return res.status(400).json({ error: 'User ID, amount, and currency are required' });
    }

    if (currency !== 'ETB') {
        return res.status(400).json({ error: 'Currency must be ETB for Chapa transactions' });
    }

    try {
        // Fetch user details from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has sufficient balance
        if (user.balanceETB < amount) {
            return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
        }

        // Deduct the amount from user's balance
        user.balanceETB -= amount;
        await user.save(); // Update the user's balance

      
        const transaction = new Transaction({
            user: user._id,
            amount,
            currency,
            paymentMethod: "Chapa",
            transactionType: 'withdrawal',
            paymentId: "manual", // Chapa transaction reference
            status: 'pending',
        });

        // Save the transaction to the database
        await transaction.save();

        const withdrawlHistory = new WithdrawalHistory(
            {
                user: user._id, 
                amount, 
                currency, 
                method:"manual" , 
                transactionId:transaction._id,
                feeCharge:0 
            } 
          );
        await withdrawlHistory.save();  
        return res.status(200).json({ message: 'Withdrawal initiated successfully' });

    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while processing the withdrawal' });
    }
};