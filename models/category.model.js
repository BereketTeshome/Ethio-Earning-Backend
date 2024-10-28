import mongoose, { Schema } from 'mongoose';
import Package from './package.model.js';  

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true }, // Category name must be unique
  description: { type: String }, // Optional description field for the category
  profilePictureUrl: { type: String, default: null }, // Profile picture URL field
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the admin who created this category
  active: { type: Boolean, default: false }, // Active field, default is false
}, { timestamps: true }
); // Add createdAt and updatedAt fields

// Post hook to delete related packages when a category is deleted
CategorySchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await Package.deleteMany({ category: doc._id });
  }
});
const Category = mongoose.model('Category', CategorySchema);

export default Category;
