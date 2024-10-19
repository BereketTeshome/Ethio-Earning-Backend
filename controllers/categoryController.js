import Category from '../models/category.model.js'; // Assuming your model is in the models directory
import Redis from "ioredis";

// console.log(process.env.REDIS_URL)  

const redisClient = new Redis(process.env.REDIS_URL)
// Add a new category
export const addCategory = async (req, res) => {
    try {
        const { name, description, profilePictureUrl, active, createdBy } = req.body;
        const newCategory = new Category({ name, description, profilePictureUrl, active, createdBy });
        const savedCategory = await newCategory.save();
        redisClient.del(`category:${savedCategory._id}`);
        redisClient.del('categories');
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        // Check if data is available in the cache
        redisClient.get('categories', async (err, data) => {
            if (err) throw err;
            if (data) {
                // If cached data exists, return it
                res.status(200).json(JSON.parse(data));
            } else {
                // If no cache, fetch from the database
                const categories = await Category.find().populate('createdBy', 'name email');
                
                // Store data in the cache
                redisClient.setex('categories', 3600, JSON.stringify(categories)); // Cache for 1 hour
                
                res.status(200).json(categories);
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get a specific category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check the cache
        redisClient.get(`category:${id}`, async (err, data) => {
            if (err) throw err;
            if (data) {
                res.status(200).json(JSON.parse(data));
            } else {
                const category = await Category.findById(id).populate('createdBy', 'name email');
                if (!category) {
                    return res.status(404).json({ message: 'Category not found' });
                }
                // Cache the category
                redisClient.setex(`category:${id}`, 3600, JSON.stringify(category)); // Cache for 1 hour

                res.status(200).json(category);
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update a category by ID
export const updateCategory = async (req, res) => {
    try {
        const { name, description, profilePictureUrl, active } = req.body; // Include active in the destructuring
        const { id } = req.params; 
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description, profilePictureUrl, active }, // Update the active field here
            { new: true }
        ); 
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        redisClient.del(`category:${id}`);
        redisClient.del('categories');
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params; 
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        redisClient.del(`category:${id}`);
        redisClient.del('categories');
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
