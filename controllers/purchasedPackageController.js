import PurchasedPackage from '../models/purchasedPackage.model.js';
import Redis from "ioredis"; 

const redisClient = new Redis(process.env.REDIS_URL)

export const getAllPurchasedPackages = async (req, res) => {
    try {
         // Check if the data is in the Redis cache
         const cachedPackages = await redisClient.get('allPurchasedPackages');
         if (cachedPackages) {
             return res.status(200).json(JSON.parse(cachedPackages)); // Return cached data
         }
        const packages = await PurchasedPackage.find().populate('investor package transaction');
        await redisClient.set('allPurchasedPackages', JSON.stringify(packages), 'EX', 3600); // Cache for 1 hour
        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving purchased packages', error });
    }
};

// Get a single purchased package by ID
export const getAllPurchasedPackageById = async (req, res) => {
    try {
         // Check if the data is in the Redis cache
         const cachedPackage = await redisClient.get(`purchasedPackage:${req.params.id}`);
         if (cachedPackage) {
             return res.status(200).json(JSON.parse(cachedPackage)); // Return cached data
         }
        const package1 = await PurchasedPackage.findById(req.params.id).populate('investor package transaction');
        if (!package1) {
            return res.status(404).json({ message: 'Purchased package not found' });
        }
        await redisClient.set(`purchasedPackage:${req.params.id}`, JSON.stringify(package1), 'EX', 3600); // Cache for 1 hour

        res.status(200).json(package1);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving purchased package', error });
    }
};

// Get active purchased packages
export const getActiveOurchasedPackages = async (req, res) => {
    try {
        const activePackages = await PurchasedPackage.find({ active: true }).populate('investor package transaction');
        res.status(200).json(activePackages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving active purchased packages', error });
    }
};

// Update a purchased packaexport const async (req, res) => {
export const updateAPurchasedPackage = async(req,res) =>{    
    const { currentSubscribers, currentViewers, transaction } = req.body;
    try {
        const updatedPackage = await PurchasedPackage.findByIdAndUpdate(
            req.params.id,
            { currentSubscribers, currentViewers, transaction },
            { new: true, runValidators: true }
        ).populate('investor package transaction');

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Purchased package not found' });
        }
         // Update the cache after an update
         await redisClient.set(`purchasedPackage:${req.params.id}`, JSON.stringify(updatedPackage), 'EX', 3600);
         await redisClient.del('allPurchasedPackages');
         
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating purchased package', error });
    }
};

// Update only the active field of the purchased package
export const updateOnlyActiveFieldOfAPurchasedPackage = async(req,res)=>
{
    const { active } = req.body;
    try {
        const updatedPackage = await PurchasedPackage.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Purchased package not found' });
        }
        // Update the cache after an update
        await redisClient.set(`purchasedPackage:${req.params.id}`, JSON.stringify(updatedPackage), 'EX', 3600);
        await redisClient.del('allPurchasedPackages');

        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating active status', error });
    }
};

// Delete a purchased package
export const deleteAPackage = async (req, res) => {
    try {
        const deletedPackage = await PurchasedPackage.findByIdAndDelete(req.params.id);

        if (!deletedPackage) {
            return res.status(404).json({ message: 'Purchased package not found' });
        }
         // Delete the cache entry for the deleted package
        await redisClient.del(`purchasedPackage:${req.params.id}`);

        // Also delete the cache entry for all purchased packages
        await redisClient.del('allPurchasedPackages');
        res.status(200).json({ message: 'Purchased package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting purchased package', error });
    }
};
