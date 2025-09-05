const Order = require("../../models/order-models/order.model");
const Book = require("../../models/book-models/book.model");
const User = require("../../models/user-models/user.model");
const Store = require("../../models/store-models/store.model");
const Seller = require("../../models/seller-models/seller-model");
const {
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToSeller,
  sendOrderCancelledToUser,
  sendOrderCancelledToSeller,
  sendOrderStatusUpdateToUser,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Helper function to handle a "Buy Now" order.
 * @param {string} bookId - The ID of the book to be purchased.
 * @param {number} quantity - The quantity of the book.
 * @returns {Promise<Object>} Object with the items and total amount.
 */
const handleBuyNowOrder = async (bookId, quantity) => {
  const book = await Book.findById(bookId);
  if (!book) throw new Error("Book not found");

  const finalPrice =
    book.discountPrice && book.discountPrice < book.price
      ? book.discountPrice
      : book.price;

  const items = [
    {
      book: book._id,
      quantity,
      price: finalPrice,
    },
  ];

  const totalAmount = finalPrice * quantity;
  return { items, totalAmount };
};

/**
 * @description Helper function to handle a cart-based order.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} Object with the items and total amount.
 */
const handleCartOrder = async (userId) => {
  const user = await User.findById(userId).populate("cart.productId");
  if (!user || !user.cart || user.cart.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = user.cart.map((item) => {
    const book = item.productId;
    const finalPrice =
      book.discountPrice && book.discountPrice < book.price
        ? book.discountPrice
        : book.price;

    return {
      book: book._id,
      quantity: item.quantity,
      price: finalPrice,
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  user.cart = [];
  await user.save();

  return { items, totalAmount };
};

/**
 * @description Controller to place a new order (COD only).
 * @route POST /api/order/place-order
 * @access Private (User)
 */
exports.placeOrder = async (req, res) => {
  try {
    const { type, storeId, bookId, quantity, paymentMethod, shippingAddress } =
      req.body;
    const userId = req.user.id;

    let items = [];
    let totalAmount = 0;

    if (type === "BUY_NOW") {
      ({ items, totalAmount } = await handleBuyNowOrder(bookId, quantity));
    } else if (type === "CART") {
      ({ items, totalAmount } = await handleCartOrder(userId));
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order type" });
    }

    const paymentStatus = "PENDING";
    const orderStatus = "ORDER_RECEIVED";

    const order = await Order.create({
      user: userId,
      store: storeId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: orderStatus,
      shippingAddress,
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        orders: {
          orderId: order._id,
          status: order.status,
          placedAt: new Date(),
        },
      },
    });

    const store = await Store.findById(storeId).populate("seller");
    if (store && store.seller) {
      await Seller.findByIdAndUpdate(store.seller._id, {
        $push: {
          orders: {
            orderId: order._id,
            status: order.status,
            placedAt: new Date(),
          },
        },
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate({ path: "items.book", select: "title price" })
      .populate("user", "userName email");

    const orderForEmail = {
      ...populatedOrder._doc,
      items: populatedOrder.items.map((item) => ({
        ...item._doc,
        bookTitle: item.book.title,
      })),
    };

    const user = await User.findById(userId);

    await sendOrderConfirmationToUser(user.email, orderForEmail);

    if (store && store.seller) {
      await sendNewOrderNotificationToSeller(
        store.seller.email,
        orderForEmail,
        user
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (err) {
    console.error("Error placing order:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get all orders for a user.
 * @route GET /api/order/get-all-orders
 * @access Private (User)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate({ path: "items.book", select: "title price discountPrice" })
      .populate({ path: "store", select: "storeName storeLogo" })
      .populate({ path: "user", select: "userName email" })
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to cancel an order.
 * @route PATCH /api/order/cancel/:orderId
 * @access Private (User)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate([
      { path: "items.book", select: "title price" },
      { path: "user", select: "userName email" },
      { path: "store", populate: { path: "seller", select: "email" } },
    ]);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["CANCELLED", "REFUNDED", "COMPLETED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled.",
      });
    }

    if (["TO_SHIP", "TO_RECEIVE"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "This order has already been shipped and cannot be cancelled.",
      });
    }

    order.status = "CANCELLED";
    await order.save();

    await User.updateOne(
      { _id: userId, "orders.orderId": order._id },
      { $set: { "orders.$.status": "CANCELLED" } }
    );

    await Seller.updateOne(
      { _id: order.store.seller._id, "orders.orderId": order._id },
      { $set: { "orders.$.status": "CANCELLED" } }
    );

    const orderForEmail = {
      ...order._doc,
      items: order.items.map((item) => ({
        ...item._doc,
        bookTitle: item.book.title,
      })),
    };

    await sendOrderCancelledToUser(order.user.email, orderForEmail);
    if (order.store && order.store.seller) {
      await sendOrderCancelledToSeller(
        order.store.seller.email,
        orderForEmail,
        order.user
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error("Error cancelling order:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for a seller to update an order status.
 * @route PATCH /api/order/seller/update-order-status/:orderId
 * @access Private (Seller)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "TO_PAY",
      "TO_SHIP",
      "TO_RECEIVE",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const store = await Store.findOne({ seller: sellerId });
    if (!store) {
      return res
        .status(403)
        .json({ success: false, message: "No store found for this seller" });
    }

    const order = await Order.findOne({
      _id: orderId,
      store: store._id,
    }).populate("user", "email userName");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or unauthorized" });
    }

    order.status = status;
    await order.save();

    await User.updateOne(
      { _id: order.user._id, "orders.orderId": order._id },
      { $set: { "orders.$.status": status } }
    );

    await Seller.updateOne(
      { _id: sellerId, "orders.orderId": order._id },
      { $set: { "orders.$.status": status } }
    );

    await sendOrderStatusUpdateToUser(order.user.email, {
      orderId: order._id,
      status,
      totalAmount: order.totalAmount,
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
