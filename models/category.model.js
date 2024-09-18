import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true }, // Category name must be unique
  description: { type: String }, // Optional description field for the category
  profilePictureUrl: { type: String, default: null }, // Profile picture URL field
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the admin who created this category
}, { timestamps: true }); // Add createdAt and updatedAt fields

const Category = mongoose.model('Category', CategorySchema);

export default Category;
      