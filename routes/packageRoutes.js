import express from 'express';
import {
    addPackage,
    getPackages,
    getPackageById,
    updatePackage,
    deletePackage,
} from '../controllers/packageController.js'; // Import the package controller functions

const router = express.Router();

// Route to create a new package
router.post('/', addPackage);

// Route to get all packages
router.get('/', getPackages);

// Route to get a single package by its ID
router.get('/:id', getPackageById);

// Route to update a package by its ID
router.put('/:id', updatePackage);

// Route to delete a package by its ID
router.delete('/:id', deletePackage);

export default router;
