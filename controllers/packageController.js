import Package from '../models/package.model.js'; // Import the Package model

// Add a new package
export const addPackage = async (req, res) => {
    try {
        const { 
            name, 
            priceETB, 
            priceUSD, 
            duration, 
            rewardCoinETB, 
            rewardCoinUSD, 
            maxSubscribers, 
            category, // the category id must be mentioned
            createdBy // the admon user id must be mentioned
        } = req.body;

        const newPackage = new Package({
            name,
            priceETB,
            priceUSD,
            duration,
            rewardCoinETB,
            rewardCoinUSD,
            maxSubscribers,
            category,
            createdBy
        });

        const savedPackage = await newPackage.save();
        res.status(201).json(savedPackage);
    } catch (error) {
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
            category, 
            createdBy 
        } = req.body;

        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                priceETB, 
                priceUSD, 
                duration, 
                rewardCoinETB, 
                rewardCoinUSD, 
                maxSubscribers, 
                category, 
                createdBy 
            },
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json(updatedPackage);
    } catch (error) {
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
