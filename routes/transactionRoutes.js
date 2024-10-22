import express from 'express';
import { 
    getAllTransactions,
    getAllCompletedTransactions,
    getAllPendingTransactions,
    getAllFailedTransactions,
    getAllTransactionsByItsPaymentMethodAndCurrency,
    updateTransactionsById,
    deleteTransactionById 
} from "../controllers/transactionController.js"; 

const router = express.Router();

router.get('/',getAllTransactions);
router.get('/completed',getAllCompletedTransactions);
router.get('/pending',getAllPendingTransactions);
router.get('/failed',getAllFailedTransactions);
router.get('/filter',getAllTransactionsByItsPaymentMethodAndCurrency)
router.put('/:id',updateTransactionsById);
router.delete('/:id',deleteTransactionById);

export default router;
