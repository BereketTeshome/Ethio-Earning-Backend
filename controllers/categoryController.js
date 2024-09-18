import Category from '../models/category.model.js'; // Assuming your model is in the models directory

// Add a new category
export const addCategory = async (req, res) => {
    try {
        const { name, description, profilePictureUrl, createdBy } = req.body;
        const newCategory = new Category({ name, description, profilePictureUrl, createdBy });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('createdBy', 'name email');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('createdBy', 'name email');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a category by ID
export const updateCategory = async (req, res) => {
    try {
        const { name, description, profilePictureUrl } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, profilePictureUrl },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
