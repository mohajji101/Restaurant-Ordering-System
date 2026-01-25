const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

exports.getStats = async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const users = await User.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    console.log("Admin Stats - Products:", products, "Orders:", orders, "Users:", users, "RevenueAgg:", revenueAgg);

    let revenue = revenueAgg[0]?.total || 0;

    // Fallback: if aggregation didn't return a numeric total (e.g., stored as string), sum manually
    if (!revenue || typeof revenue !== 'number') {
      try {
        const allOrders = await Order.find().select('total');
        revenue = allOrders.reduce((acc, o) => {
          const t = Number(o.total) || 0;
          return acc + t;
        }, 0);
      } catch (e) {
        console.error('REVENUE FALLBACK ERROR:', e);
        revenue = 0;
      }
    }

    res.json({ products, orders, users, revenue });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (err) {
    console.error('LIST ORDERS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.renameCategory = async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) return res.status(400).json({ message: 'oldName and newName required' });

    const result = await require('../models/Product').updateMany({ category: oldName }, { $set: { category: newName } });

    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    console.error('RENAME CATEGORY ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });

    // set category to empty string for products with this category
    const result = await require('../models/Product').updateMany({ category: name }, { $set: { category: '' } });

    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    console.error('DELETE CATEGORY ERROR:', err);
    res.status(500).json({ message: 'Server error' });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('LIST USERS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ deliveryFee: 10, discountPercent: 0 });
    }
    res.json(settings);
  } catch (err) {
    console.error('GET SETTINGS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { deliveryFee, discountPercent, minOrderForDiscount } = req.body;
    const Settings = require('../models/Settings');
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ deliveryFee: 10, discountPercent: 0, minOrderForDiscount: 100 });
    }

    if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
    if (discountPercent !== undefined) settings.discountPercent = discountPercent;
    if (minOrderForDiscount !== undefined) settings.minOrderForDiscount = minOrderForDiscount;

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error('UPDATE SETTINGS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const Order = require('../models/Order');

    // Valid Statuses: 'Pending', 'Payment Completed', 'Processing', 'Delivered', 'Cancelled'
    const validStatuses = ['Pending', 'Payment Completed', 'Processing', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    console.error('UPDATE ORDER STATUS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('DELETE USER ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('UPDATE USER ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


