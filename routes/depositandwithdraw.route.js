import {depositMoneyETB,withdrawMoneyETB} from '../controllers/depositandwithdrawalController.js'
import express from 'express';

const router = express.Router(); 

// Route for depositing money
router.post('/deposit-etb', depositMoneyETB);
router.post('/withdrawl-etb', withdrawMoneyETB);

export default router;