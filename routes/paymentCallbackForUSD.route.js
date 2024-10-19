import Transaction from '../models/transaction.model.js';
import express from 'express';
import {capturePayment} from '../services/paypal.js'
const router = express.Router();

router.get('/complete-order-usd',async (req, res) => { 
    try {
        await capturePayment(req.query.token)
        const transaction = await Transaction.findOneAndUpdate(
            { paymentId: req.query.token},
            { status: 'completed' },
          );
    
          if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
          }
        res.send('Package purchased successfully')
    } catch (error) {
        res.send('Error: ' + error)
    }
})

export default router