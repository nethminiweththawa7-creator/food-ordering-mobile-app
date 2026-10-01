const express = require('express');
const router = express.Router();
const {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} = require('../controllers/foodItemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getAllFoodItems)
  .post(protect, upload.single('image'), createFoodItem);

router.route('/:id')
  .get(getFoodItemById)
  .put(protect, upload.single('image'), updateFoodItem)
  .delete(protect, deleteFoodItem);

module.exports = router;
