const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

// @desc    Create new order (with business logic: total recalculation, stock check, stock deduction)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    // Business Logic Validation & Calculation Loop
    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItemId);

      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: `Food item with ID ${item.foodItemId} not found`,
        });
      }

      if (!foodItem.isAvailable || foodItem.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Out of stock: '${foodItem.name}' only has ${foodItem.stockQuantity} items available.`,
        });
      }

      // Add to server-calculated total using database price (prevents price manipulation)
      const itemTotal = foodItem.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        foodItemId: foodItem._id,
        quantity: item.quantity,
        price: foodItem.price,
      });

      // Deduct stock quantity
      foodItem.stockQuantity -= item.quantity;
      if (foodItem.stockQuantity === 0) {
        foodItem.isAvailable = false;
      }
      await foodItem.save();
    }

    const order = await Order.create({
      userId: req.user._id,
      items: validatedItems,
      totalAmount: calculatedTotal,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      orderStatus: 'Pending',
    });

    // Populate food item details in response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.foodItemId', 'name price image category');

    return res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    console.error('Create Order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user orders or all orders if Admin
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let query = {};
    // If not admin, restrict to own orders
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.foodItemId', 'name price image')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.foodItemId', 'name price image description category');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership or admin role
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (State change with validation)
// @route   PATCH /api/orders/:id/status
// @access  Private (User/Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Business Logic Guard: Cannot transition from Delivered or Cancelled
    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of an order that is already ${order.orderStatus}`,
      });
    }

    // Business Logic: Restores stock if cancelling order
    if (orderStatus === 'Cancelled') {
      for (const item of order.items) {
        const foodItem = await FoodItem.findById(item.foodItemId);
        if (foodItem) {
          foodItem.stockQuantity += item.quantity;
          foodItem.isAvailable = true;
          await foodItem.save();
        }
      }
    }

    order.orderStatus = orderStatus;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.foodItemId', 'name price image');

    return res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (User cancellation - allowed only if Pending)
// @route   DELETE /api/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Business Logic: Order can only be cancelled by user if status is 'Pending'
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because its current status is '${order.orderStatus}'`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (foodItem) {
        foodItem.stockQuantity += item.quantity;
        foodItem.isAvailable = true;
        await foodItem.save();
      }
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
