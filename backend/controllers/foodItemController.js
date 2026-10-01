const FoodItem = require('../models/FoodItem');

// @desc    Create new food item
// @route   POST /api/food-items
// @access  Private / Admin
const createFoodItem = async (req, res) => {
  try {
    const { name, price, description, category, stockQuantity, isAvailable } = req.body;

    let image = '/uploads/default-food.jpg';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const foodItem = await FoodItem.create({
      name,
      price: Number(price),
      description,
      category: category || 'General',
      stockQuantity: stockQuantity ? Number(stockQuantity) : 20,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      image,
    });

    return res.status(201).json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    console.error('Create FoodItem error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all food items
// @route   GET /api/food-items
// @access  Public
const getAllFoodItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foodItems = await FoodItem.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: foodItems.length,
      data: foodItems,
    });
  } catch (error) {
    console.error('getAllFoodItems error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single food item
// @route   GET /api/food-items/:id
// @access  Public
const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    return res.status(200).json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/food-items/:id
// @access  Private / Admin
const updateFoodItem = async (req, res) => {
  try {
    let foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const updateFields = { ...req.body };

    if (req.file) {
      updateFields.image = `/uploads/${req.file.filename}`;
    }

    if (updateFields.price) updateFields.price = Number(updateFields.price);
    if (updateFields.stockQuantity) updateFields.stockQuantity = Number(updateFields.stockQuantity);

    foodItem = await FoodItem.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food-items/:id
// @access  Private / Admin
const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    await foodItem.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Food item removed successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
};
