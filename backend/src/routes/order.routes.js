const router = require('express').Router();
const Order = require('../models/Order');


router.post('/', async (req, res) => {
  try {
    console.log("POST /api/orders received:", req.body);
    const { items, subtotal, deliveryFee, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Optional: Extract user from token
    let userId = null;
    let userName = null;
    let userEmail = null;

    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
        const user = await require("../models/User").findById(decoded.id);
        if (user) {
          userId = user._id;
          userName = user.name;
          userEmail = user.email;
        }
      } catch (e) {
        console.log("Order creation: Invalid token or user not found", e.message);
      }
    }

    const order = await Order.create({
      items,
      subtotal,
      deliveryFee,
      total,
      user: userId,
      userName,
      userEmail,
    });

    return res.json(order);
  } catch (err) {
    console.error("Order failed", err);
    return res.status(500).json({ message: "Order failed" });
  }
});

// GET /api/orders (User History)
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(401).json({ message: "Invalid token" });

    // Find orders by user ID
    // Note: In create order we stored 'user: userId'.
    const orders = await Order.find({ user: decoded.id }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("Get orders failed", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
