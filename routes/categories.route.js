import express from 'express';
import {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// Route to create a new category
router.post('/', addCategory);

// Route to get all categories
router.get('/', getCategories);

// Route to get a single category by its ID
router.get('/:id', getCategoryById);

// Route to update a category by its ID
router.put('/:id', updateCategory);

// Route to delete a category by its ID
router.delete('/:id', deleteCategory);

export default router;
