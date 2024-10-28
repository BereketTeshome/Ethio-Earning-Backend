import express from 'express';
import PurchasedPackage from '../models/purchasedPackage.model.js';
import { getAllPurchasedPackages,getActiveOurchasedPackages,getAllPurchasedPackageById,updateAPurchasedPackage,updateOnlyActiveFieldOfAPurchasedPackage,deleteAPackage } from '../controllers/purchasedPackageController.js';
const router = express.Router();

// Get all purchased packages
router.get('/', getAllPurchasedPackages);

// Get a single purchased package by ID
router.get('/:id', getAllPurchasedPackageById);

// Get active purchased packages
router.get('/active', getActiveOurchasedPackages);

// Update a purchased package
router.put('/:id',updateAPurchasedPackage);

// Update only the active field of the purchased package
router.patch('/:id/active', updateOnlyActiveFieldOfAPurchasedPackage);

// Delete a purchased package
router.delete('/:id', deleteAPackage);

export default router;
