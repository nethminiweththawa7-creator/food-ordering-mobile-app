const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all order routes

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById)
  .delete(cancelOrder);

router.patch('/:id/status', updateOrderStatus);

module.exports = router;
