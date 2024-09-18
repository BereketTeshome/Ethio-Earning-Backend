import express from 'express';
import {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js'; // Adjust the path as needed

const router = express.Router();

// Route to create a new category - requires admin authentication
router.post('/', authenticateAdmin, addCategory);

// Route to get all categories - no authentication required (assuming this should be public)
router.get('/', getCategories);

// Route to get a single category by its ID - no authentication required (assuming this should be public)
router.get('/:id', getCategoryById);

// Route to update a category by its ID - requires admin authentication
router.put('/:id', authenticateAdmin, updateCategory);

// Route to delete a category by its ID - requires admin authentication
router.delete('/:id', authenticateAdmin, deleteCategory);

export default router;
