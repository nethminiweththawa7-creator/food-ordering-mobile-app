const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a food item name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be a positive number'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    image: {
      type: String,
      default: '/uploads/default-food.jpg',
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 20,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      default: 'General',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);
