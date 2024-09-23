import express from 'express';
import {
    addPackage,
    getPackages,
    getPackageById,
    updatePackage,
    deletePackage,
    PurchasedPackage1,
    verify
} from '../controllers/packageController.js'; // Import the package controller functions
import { authenticateAdmin } from '../middleware/authMiddleware.js'; // Adjust the path as needed

const router = express.Router();

// Route to create a new package - requires admin authentication
router.post('/', authenticateAdmin, addPackage);

// Route to get all packages - no authentication required (assuming this should be public)
router.get('/', getPackages);

// Route to get a single package by its ID - no authentication required (assuming this should be public)
router.get('/:id', getPackageById);

// Route to update a package by its ID - requires admin authentication
router.put('/:id', authenticateAdmin, updatePackage);

// Route to delete a package by its ID - requires admin authentication
router.delete('/:id', authenticateAdmin, deletePackage);

router.post('/purchase-package',PurchasedPackage1);

router.post('/verify-payment',verify)

export default router;
