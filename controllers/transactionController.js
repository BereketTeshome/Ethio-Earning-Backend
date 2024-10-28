import Transaction from '../models/transaction.model.js';
import Redis from "ioredis"; 

const redisClient = new Redis(process.env.REDIS_URL);

// Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        // Check if the data is in the Redis cache
        const cachedTransactions = await redisClient.get('allTransactions');
        if (cachedTransactions) {
            return res.status(200).json(JSON.parse(cachedTransactions)); // Return cached data
        }
        const transactions = await Transaction.find().populate('user package');
        await redisClient.set('allTransactions', JSON.stringify(transactions), 'EX', 3600); // Cache for 1 hour
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions', error });
    }
};

// Get completed transactions
export const getAllCompletedTransactions = async (req, res) => {
    try {
         // Check if the data is in the Redis cache
         const cachedCompletedTransactions = await redisClient.get('completedTransactions');
         if (cachedCompletedTransactions) {
             return res.status(200).json(JSON.parse(cachedCompletedTransactions)); // Return cached data
         }
        const completedTransactions = await Transaction.find({ status: 'completed' }).populate('user package');
        await redisClient.set('completedTransactions', JSON.stringify(completedTransactions), 'EX', 3600); // Cache for 1 hour
        res.status(200).json(completedTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving completed transactions', error });
    }
};

// Get pending transactions
export const getAllPendingTransactions =  async (req, res) => {
    try {
        const cachedPendingTransactions = await redisClient.get('pendingTransactions');
        if (cachedPendingTransactions) {
            return res.status(200).json(JSON.parse(cachedPendingTransactions)); // Return cached data
        }
        const pendingTransactions = await Transaction.find({ status: 'pending' }).populate('user package');
        await redisClient.set('pendingTransactions', JSON.stringify(pendingTransactions), 'EX', 3600); // Cache for 1 hour
        res.status(200).json(pendingTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving pending transactions', error });
    }
};

// Get failed transactions
export const getAllFailedTransactions = async (req, res) => {
    try {
        const cachedFailedTransactions = await redisClient.get('failedTransactions');
        if (cachedFailedTransactions) {
            return res.status(200).json(JSON.parse(cachedFailedTransactions)); // Return cached data
        }
        const failedTransactions = await Transaction.find({ status: 'failed' }).populate('user package');
        await redisClient.set('failedTransactions', JSON.stringify(failedTransactions), 'EX', 3600); // Cache for 1 hour
        res.status(200).json(failedTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving failed transactions', error });
    }
};

// Get transactions by payment method and currency
export const getAllTransactionsByItsPaymentMethodAndCurrency = async (req, res) => {
    const { paymentMethod, currency } = req.query;
    try {
        const cacheKey = `transactions:${paymentMethod}:${currency}`;
        // Check if the data is in the Redis cache
        const cachedFilteredTransactions = await redisClient.get(cacheKey);
        if (cachedFilteredTransactions) {
            return res.status(200).json(JSON.parse(cachedFilteredTransactions)); // Return cached data
        }

        const filteredTransactions = await Transaction.find({ paymentMethod, currency }).populate('user package');
        await redisClient.set(cacheKey, JSON.stringify(filteredTransactions), 'EX', 3600); // Cache for 1 hour
        res.status(200).json(filteredTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving filtered transactions', error });
    }
};

// Update a transaction
export const updateTransactionsById = async (req, res) => {
    const { amount, currency, paymentMethod, paymentId, transactionType, status, transactionReference } = req.body;
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { amount, currency, paymentMethod, paymentId, transactionType, status, transactionReference },
            { new: true, runValidators: true }
        ).populate('user package');

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
         // Update the cache after an update
         await redisClient.set(`transaction:${req.params.id}`, JSON.stringify(updatedTransaction), 'EX', 3600);
         // Also clear related cache entries
         await redisClient.del('allTransactions');
         await redisClient.del('completedTransactions');
         await redisClient.del('pendingTransactions');
         await redisClient.del('failedTransactions');
        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error });
    }
};

// Delete a transaction
export const deleteTransactionById = async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        await redisClient.del(`transaction:${req.params.id}`);
        // Also clear related cache entries
        await redisClient.del('allTransactions');
        await redisClient.del('completedTransactions');
        await redisClient.del('pendingTransactions');
        await redisClient.del('failedTransactions');
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};


