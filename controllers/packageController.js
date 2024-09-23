import Package from '../models/package.model.js'; // Import the Package model
import User from '../models/user.model.js'; // Import the User model
import PurchasedPackage from '../models/purchasedPackage.model.js';
import Transaction from '../models/transaction.model.js';

import Chapa from 'chapa';

console.log(process.env.Chapa_Secret_Key)

const myChapa = new Chapa(process.env.Chapa_Secret_Key);
// Add a new package
// Controller to add a new package
export const addPackage = async (req, res) => {
    try {
        // Destructure fields from the request body
        const { 
            name, 
            priceETB, 
            priceUSD, 
            duration, 
            rewardCoinETB, 
            rewardCoinUSD, 
            maxSubscribers, 
            features,  // Optional: list of features for the package
            category,  // The category ID must be mentioned
            createdBy  // The admin user ID must be mentioned
        } = req.body;

        // Create a new Package instance using the Package model
        const newPackage = new Package({
            name,
            priceETB,
            priceUSD,
            duration,
            rewardCoinETB,
            rewardCoinUSD,
            maxSubscribers,
            features,  // Array of features
            category,  // Category ID reference
            createdBy  // User (Admin) ID reference
        });

        // Save the new package to the database
        const savedPackage = await newPackage.save();

        // Respond with the created package and status code 201 (Created)
        res.status(201).json(savedPackage);
    } catch (error) {
        // Handle errors and respond with status code 400 (Bad Request)
        res.status(400).json({ message: error.message });
    }
};

// Get all packages
export const getPackages = async (req, res) => {
    try {
        const packages = await Package.find()
            .populate('category', 'name') // Populating the category field
            .populate('createdBy', 'name email'); // Populating the createdBy field
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific package by ID
export const getPackageById = async (req, res) => {
    try {
        const package1 = await Package.findById(req.params.id)
            .populate('category', 'name') // Populating the category field
            .populate('createdBy', 'name email'); // Populating the createdBy field
        if (!package1) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json(package1);
    } catch (error) {
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
            maxSubscribers, 
            features, // Optional: list of features for the package
            category, 
            createdBy 
        } = req.body;

        // Find the package by ID and update with new values
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id, // The ID of the package to update, passed as a URL param
            { 
                name, 
                priceETB, 
                priceUSD, 
                duration, 
                rewardCoinETB, 
                rewardCoinUSD, 
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
        const deletedPackage = await Package.findByIdAndDelete(req.params.id);
        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const PurchasedPackage1 = async(req,res)=>{
    try {
        const { userId, packageId, paymentMethod, amount, currency } = req.body;
            // Find the user and package from the database
        const user = await User.findById(userId);
        const selectedPackage = await Package.findById(packageId);

        if (!user || !selectedPackage) {
        return res.status(404).json({ message: 'User or Package not found' });
        }

        // Prepare customer info for Chapa
    const customerInfo = {
        amount: amount.toString(),
        currency: currency || 'ETB', // Assuming default currency is ETB
        email: user.email,
        first_name: user.name.split(" ")[0] || 'First Name',
        last_name: user.name.split(" ")[1] || 'Last Name',
        callback_url: 'https://chapa.co', // Chapa will call this URL to confirm payment
        customization: {
          title: 'Package Purchase',
          description: `Purchasing package ${selectedPackage.name}` 
        }
      };

       // Initialize payment with Chapa
    const chapaResponse = await myChapa.initialize(customerInfo, { autoRef: true });
    console.log(chapaResponse);
    if (chapaResponse.status !== 'success') {
      return res.status(500).json({ message: 'Chapa payment initialization failed' });
    }

    // Create a new PurchasedPackage entry
    const purchasedPackage = new PurchasedPackage({
        investor: user._id,
        package: selectedPackage._id,
        currentSubscribers: 0, // Initial value
        remainingSubscribers: selectedPackage.maxSubscribers, // Package's max subscribers
        active: true, // Package is initially active
      });

        //   Save the purchased package to the database
    const savedPackage = await purchasedPackage.save();

     // Create a new Transaction entry with pending status
     const transaction = new Transaction({
        user: user._id,
        package: selectedPackage._id,
        amount,
        currency,
        paymentMethod:paymentMethod,
        transactionType: 'purchase_package',
        paymentId: chapaResponse.tx_ref, // Chapa transaction reference
        status: 'pending',
      });
  
      // Save the transaction to the database
      const savedTransaction = await transaction.save();       // Link the transaction to the purchased package
      savedPackage.transaction = savedTransaction._id;
      await savedPackage.save();

      // Return the Chapa checkout URL for payment
    return res.status(201).json({
        message: 'Package purchase initiated, complete the payment', 
        checkoutUrl: chapaResponse.data.checkout_url, // Send the checkout link to the user
        transaction: savedTransaction,
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