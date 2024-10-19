import Package from '../models/package.model.js'; // Import the Package model
import User from '../models/user.model.js'; // Import the User model
import PurchasedPackage from '../models/purchasedPackage.model.js';
import Transaction from '../models/transaction.model.js';

import Chapa from 'chapa';
import Redis from "ioredis";
import axios from "axios"
import { createPayPalOrder} from '../services/paypal.js';
import {initializeChapaPayment} from '../services/initializeChapaPayment.js'
// console.log(process.env.REDIS_URL)  

const redisClient = new Redis(process.env.REDIS_URL)

const myChapa = new Chapa(process.env.Chapa_Secret_Key); 
// Add a new package
// Controller to add a new package
export const addPackage = async (req, res) => {
    try {
        // Destructure fields from the request body
        const { 
            name, 
            active,
            priceETB, 
            priceUSD, 
            duration, 
            rewardCoinETB, 
            rewardCoinUSD, 
            maxSubscribers, 
            maxViewers,
            features,  
            category,  // The category ID must be mentioned
            createdBy  // The admin user ID must be mentioned
        } = req.body;

        // Create a new Package instance using the Package model
        const newPackage = new Package({
            name,
            active,
            priceETB,
            priceUSD,
            duration,
            rewardCoinETB,
            rewardCoinUSD,
            maxViewers,
            maxSubscribers,
            features,  // Array of features
            category,  // Category ID reference
            createdBy  // User (Admin) ID reference
        });

        // Save the new package to the database
        const savedPackage = await newPackage.save();
         
         // Invalidate the cache for 'packages' so the new package will be included in the next get request
         await redisClient.del('packages');
         await redisClient.del(`package:${savedPackage._id}`);

        // Respond with the created package and status code 201 (Created)
        res.status(201).json(savedPackage);
    } catch (error) {
        // Handle errors and respond with status code 400 (Bad Request)
        res.status(400).json({ message: error.message });
    }
};

// Get all packages
export const getPackages = async (req, res) => {
    const cacheKey = 'packages';

    try {
        // Check if data exists in Redis cache
        const cachedPackages = await redisClient.get(cacheKey);
        
        // If data is found in cache, return the cached data     
        if (cachedPackages) {
            return res.status(200).json(JSON.parse(cachedPackages));
        }

        // Otherwise, fetch data from MongoDB
        const packages = await Package.find()
            .populate('category', 'name')
            .populate('createdBy', 'name email');

        // Store the fetched data in Redis cache for future requests
        await redisClient.set(cacheKey, JSON.stringify(packages), 'EX', 3600); // Cache for 1 hour
        
        // Send the response
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get a specific package by ID
// Get a specific package by ID with caching
export const getPackageById = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `package:${id}`; 

    try {
        // Check if data exists in Redis cache
        const cachedPackage = await redisClient.get(cacheKey);

        // If data is found in cache, return the cached data
        if (cachedPackage) {
            return res.status(200).json(JSON.parse(cachedPackage));
        }

        // Otherwise, fetch data from MongoDB
        const package1 = await Package.findById(id)
            .populate('category', 'name') // Populating the category field
            .populate('createdBy', 'name email'); // Populating the createdBy field

        // If no package is found, respond with 404
        if (!package1) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Store the fetched data in Redis cache for future requests
        await redisClient.set(cacheKey, JSON.stringify(package1), 'EX', 3600); // Cache for 1 hour

        // Send the response
        res.status(200).json(package1);
    } catch (error) {
        console.error('Error fetching package by ID:', error);
        res.status(500).json({ message: error.message });
    }
}; 


// Update a package by ID
export const updatePackage = async (req, res) => {
    try {
        const { 
            name, 
            priceETB, 
            priceUSD, 
            duration, 
            rewardCoinETB, 
            rewardCoinUSD, 
            maxViewers,
            maxSubscribers, 
            features, // Optional: list of features for the package
            category, 
            createdBy 
        } = req.body;  
       const {id} = req.params
        // Find the package by ID and update with new values
        const updatedPackage = await Package.findByIdAndUpdate(
            id, // The ID of the package to update, passed as a URL param
            { 
                name, 
                priceETB, 
                priceUSD, 
                duration, 
                rewardCoinETB,  
                rewardCoinUSD, 
                maxViewers,
                maxSubscribers, 
                features, // If included, update features
                category, 
                createdBy 
            },
            { new: true, runValidators: true } // Return the updated document & validate the data
        );

        // If no package is found with the given ID, respond with 404
        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
          // Invalidate the cache for 'packages' so the new package will be included in the next get request
        await redisClient.del('packages');
        await redisClient.del(`package:${id}`);

        // Respond with the updated package
        res.status(200).json(updatedPackage);
    } catch (error) {
        // Catch and respond with error message in case of an issue
        res.status(400).json({ message: error.message });
    }
};

// Delete a package by ID
export const deletePackage = async (req, res) => {
    try {
        const {id} = req.params
        const deletedPackage = await Package.findByIdAndDelete(id);
        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
         // Invalidate the cache for 'packages' so the new package will be included in the next get request
         await redisClient.del('packages');
         await redisClient.del(`package:${id}`);

        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const PurchasedPackage1 = async(req,res)=>{
    try {
        const { userId, packageId, paymentMethod, currency } = req.body;
            // Find the user and package from the database
        const user = await User.findById(userId);
        const selectedPackage = await Package.findById(packageId);

        if (!user || !selectedPackage) {
        return res.status(404).json({ message: 'User or Package not found' });
        }
      const chapaResponse = await initializeChapaPayment(user,selectedPackage.priceETB,'package',currency);
       // Initialize payment with Chapa
    
    if (chapaResponse.status !== 'success') {
      return res.status(500).json({ message: 'Chapa payment initialization failed' });
    }

    
    // Create a new Transaction entry with pending status
    const transaction = new Transaction({
        user: user._id,
        package: selectedPackage._id,
        amount:selectedPackage.priceETB,
        currency,
        paymentMethod:paymentMethod,
        transactionType: 'purchasing_a_package',
        paymentId: chapaResponse.tx_ref, // Chapa transaction reference
        status: 'pending',
    });
    // Save the transaction to the database
    const savedTransaction = await transaction.save();       // Link the transaction to the purchased package
    
    // Create a new PurchasedPackage entry with initial values for subscribers and viewers
    const purchasedPackage = new PurchasedPackage({
        investor: user._id,
        package: selectedPackage._id,
        currentSubscribers: 0, // Initial value for subscribers
        remainingSubscribers: selectedPackage.maxSubscribers, // Package's max subscribers
        currentViewers: 0, // Initial value for viewers
        remainingViewers: selectedPackage.maxViewers, // Package's max viewers
        transaction: transaction._id 
      });

        //   Save the purchased package to the database
    const savedPackage = await purchasedPackage.save();
    savedPackage.transaction = savedTransaction._id;
    await savedPackage.save();
 
      // Return the Chapa checkout URL for payment
    return res.status(201).json({
        message: 'Package purchase initiated, complete the payment', 
        checkoutUrl: chapaResponse.data.checkout_url, // Send the checkout link to the user
        // transaction: savedTransaction,
      });
    } catch (error) {
        console.error('Error purchasing package:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
} 

export const verify = async (req, res) => {
    try {
      const { tx_ref } = req.body;
  
      // Verify the transaction with Chapa
      const chapaResponse = await myChapa.verify(tx_ref);
  
      if (chapaResponse.status === 'success') {
        // Payment is successful, update the transaction status to 'completed'
        const transaction = await Transaction.findOneAndUpdate(
          { paymentId: tx_ref },
          { status: 'completed' },
          { new: true }
        );
  
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
  
        // You can also update the PurchasedPackage status if needed
        await PurchasedPackage.findOneAndUpdate(
          { transaction: transaction._id },
          { active: true }
        );
  
        return res.status(200).json({
          message: 'Payment verified successfully',
          transaction,
        });
      } else {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }}

    export const createOrder = async (req, res) => {
        const { userId, packageId, paymentMethod, currency } = req.body;
    
        try {
            // Find the user and package from the database
            const user = await User.findById(userId);
            const selectedPackage = await Package.findById(packageId);
    
            if (!user || !selectedPackage) {
                return res.status(404).json({ message: 'User or Package not found' });
            }

             // Return the approval link from the PayPal response
            const response = await createPayPalOrder(selectedPackage,currency);
            const approvalLink = response.data.links.find(link => link.rel === 'approve').href
                      // Create a new PurchasedPackage entry with initial values for subscribers and viewers
                      const purchasedPackage = new PurchasedPackage({
                        investor: user._id, 
                        package: selectedPackage._id,
                        currentSubscribers: 0, // Initial value for subscribers
                        remainingSubscribers: selectedPackage.maxSubscribers, // Package's max subscribers
                        currentViewers: 0, // Initial value for viewers
                        remainingViewers: selectedPackage.maxViewers, // Package's max viewers
                    });
            
                    // Save the purchased package to the database
                    const savedPackage = await purchasedPackage.save();
            // Create a new Transaction entry with pending status
            const transaction = new Transaction({
                user: user._id,
                package: selectedPackage._id,
                amount: selectedPackage.priceUSD,
                currency,
                paymentMethod,
                transactionType: 'purchasing_a_package',
                paymentId: response.data.id, // Use PayPal order ID for the transaction
                status: 'pending',
            });
    
            // Save the transaction to the database
            const savedTransaction = await transaction.save();
    
            // Link the transaction to the purchased package
            savedPackage.transaction = savedTransaction._id;
            await savedPackage.save();
    

            res.status(201).json({ approvalLink }); // Send back the approval link
    
        } catch (error) {
            // console.error(error);
            res.status(500).json({ message: error.message });
        }
    };
    export const verfiyDollarPayment = async (req, res) => {
        try {
            console.log("jhh")
            // await paypal.capturePayment(req.query.token)
            // const transaction = await Transaction.findOneAndUpdate(
            //     { paymentId: req.query.token},
            //     { status: 'completed' },
            //   );
        
            //   if (!transaction) {
            //     return res.status(404).json({ message: 'Transaction not found' });
            //   }
            res.send('Package purchased successfully')
        } catch (error) {
            res.send('Error: ' + error)
        }   
    }
