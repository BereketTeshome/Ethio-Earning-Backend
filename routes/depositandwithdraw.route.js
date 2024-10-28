import {depositMoneyETB,depositMoneyUSD,withdrawMoneyETB,withdrawMoneyUSD} from '../controllers/depositandwithdrawalController.js'
import express from 'express';

const router = express.Router(); 

// Route for depositing money
router.post('/deposit-etb', depositMoneyETB);
router.post('/deposit-usd',depositMoneyUSD);
router.post('/withdrawal-etb', withdrawMoneyETB);
router.post('/withdrawal-usd',withdrawMoneyUSD);

export default router;