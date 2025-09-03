// const Order = require("../../models/order.models/order.model");
// const Book = require("../../models/book-models/book.model");
// const User = require("../../models/user-models/user.model");
// const Store = require("../../models/store-models/store.model");
// const Seller = require("../../models/seller-models/seller-model");
// const {
//   sendOrderConfirmationToUser,
//   sendNewOrderNotificationToSeller,
//   sendOrderCancelledToUser,
//   sendOrderCancelledToSeller,
// } = require("../../helpers/email-helper/email.helper");

// /**
//  * Helper: Handle Buy Now Order
//  */
// const handleBuyNowOrder = async (bookId, quantity) => {
//   const book = await Book.findById(bookId);
//   if (!book) throw new Error("Book not found");

//   const finalPrice =
//     book.discountPrice && book.discountPrice < book.price
//       ? book.discountPrice
//       : book.price;

//   const items = [
//     {
//       book: book._id,
//       quantity,
//       price: finalPrice,
//     },
//   ];

//   const totalAmount = finalPrice * quantity;
//   return { items, totalAmount };
// };

// /**
//  * Helper: Handle Cart Order
//  */
// const handleCartOrder = async (userId) => {
//   const user = await User.findById(userId).populate("cart.productId");
//   if (!user || !user.cart || user.cart.length === 0) {
//     throw new Error("Cart is empty");
//   }

//   const items = user.cart.map((item) => {
//     const book = item.productId;
//     const finalPrice =
//       book.discountPrice && book.discountPrice < book.price
//         ? book.discountPrice
//         : book.price;

//     return {
//       book: book._id,
//       quantity: item.quantity,
//       price: finalPrice,
//     };
//   });

//   const totalAmount = items.reduce(
//     (sum, item) => sum + item.quantity * item.price,
//     0
//   );

//   // Clear cart after placing order
//   user.cart = [];
//   await user.save();

//   return { items, totalAmount };
// };

// /**
//  * @description Controller: Place Order
//  * @route POST/api/order/place-order
//  * @access Public
//  */
// exports.placeOrder = async (req, res) => {
//   try {
//     const { type, storeId, bookId, quantity, paymentMethod, shippingAddress } =
//       req.body;
//     const userId = req.user.id;

//     let items = [];
//     let totalAmount = 0;

//     // Determine order type
//     if (type === "BUY_NOW") {
//       ({ items, totalAmount } = await handleBuyNowOrder(bookId, quantity));
//     } else if (type === "CART") {
//       ({ items, totalAmount } = await handleCartOrder(userId));
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid order type" });
//     }

//     // Always start with ORDER_RECEIVED
//     let paymentStatus = "PENDING";
//     let orderStatus = "ORDER_RECEIVED";

//     // For Stripe, we will later update to TO_PAY once session is created
//     if (paymentMethod === "STRIPE") {
//       paymentStatus = "PENDING";
//     }

//     // Create Order
//     const order = await Order.create({
//       user: userId,
//       store: storeId,
//       items,
//       totalAmount,
//       paymentMethod,
//       paymentStatus,
//       status: orderStatus,
//       shippingAddress,
//     });

//     // Push order to user
//     await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

//     // Push order to seller
//     const store = await Store.findById(storeId).populate("seller");
//     if (store && store.seller) {
//       await Seller.findByIdAndUpdate(store.seller._id, {
//         $push: { orders: order._id },
//       });
//     }

//     // -------------------------
//     // Populate books for email
//     // -------------------------
//     const populatedOrder = await Order.findById(order._id)
//       .populate({ path: "items.book", select: "title price" })
//       .populate("user", "userName email");

//     const orderForEmail = {
//       ...populatedOrder._doc,
//       items: populatedOrder.items.map((item) => ({
//         ...item._doc,
//         bookTitle: item.book.title,
//       })),
//     };

//     const user = await User.findById(userId);

//     // Send Email Notifications
//     await sendOrderConfirmationToUser(user.email, orderForEmail);

//     if (store && store.seller) {
//       await sendNewOrderNotificationToSeller(
//         store.seller.email,
//         orderForEmail,
//         user
//       );
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Order placed successfully!",
//       order,
//     });
//   } catch (err) {
//     console.error("Error placing order:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// };

// /**
//  * @description Controller: Get All Orders for User
//  * @route GET /api/order/get-all-orders
//  * @access Public
//  */
// exports.getAllOrders = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const orders = await Order.find({ user: userId })
//       .populate({ path: "items.book", select: "title price discountPrice" })
//       .populate({ path: "store", select: "storeName storeLogo" })
//       .populate({ path: "user", select: "userName email" })
//       .sort({ createdAt: -1 }); // latest orders first

//     return res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully",
//       orders,
//     });
//   } catch (err) {
//     console.error("Error fetching orders:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// };

// /**
//  * @description Controller: Cancel Order
//  * @route PATCH /api/order/cancel-order/:id
//  * @access Private (User must be logged in)
//  */
// exports.cancelOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;

//     // Find order & populate necessary fields
//     const order = await Order.findOne({ _id: id, user: userId })
//       .populate("items.book", "title price") // so we get book title/price
//       .populate("store", "seller") // so we can fetch seller later
//       .populate("user", "userName email"); // so user details are available

//     if (!order) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });
//     }

//     // Check if order is already in a final state
//     if (["CANCELLED", "REFUNDED", "COMPLETED"].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: "This order cannot be cancelled.",
//       });
//     }

//     // Prevent cancellation if shipped or out for delivery
//     if (["TO_SHIP", "TO_RECEIVE"].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: "This order has already been shipped and cannot be cancelled.",
//       });
//     }

//     // Update order status
//     order.status = "CANCELLED";
//     await order.save();

//     // Prepare order for email with bookTitle
//     const orderForEmail = {
//       ...order._doc,
//       items: order.items.map((item) => ({
//         ...item._doc,
//         bookTitle: item.book?.title || "Unknown Book",
//       })),
//     };

//     // Send email to user
//     if (order.user?.email) {
//       await sendOrderCancelledToUser(order.user.email, orderForEmail);
//     }

//     // Send email to seller
//     if (order.store?.seller) {
//       const seller = await Seller.findById(order.store.seller).select(
//         "storeName email"
//       );
//       if (seller?.email) {
//         await sendOrderCancelledToSeller(
//           seller.email,
//           orderForEmail,
//           order.user
//         );
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Order cancelled successfully & notifications sent",
//       order,
//     });
//   } catch (err) {
//     console.error("Error cancelling order:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// };

const Order = require("../../models/order.models/order.model");
const Book = require("../../models/book-models/book.model");
const User = require("../../models/user-models/user.model");
const Store = require("../../models/store-models/store.model");
const Seller = require("../../models/seller-models/seller-model");
const {
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToSeller,
  sendOrderCancelledToUser,
  sendOrderCancelledToSeller,
} = require("../../helpers/email-helper/email.helper");

/**
 * Helper: Handle Buy Now Order
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
 * Helper: Handle Cart Order
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

  // Clear cart after placing order
  user.cart = [];
  await user.save();

  return { items, totalAmount };
};

/**
 * @description Controller: Place Order (COD only)
 * @route POST /api/order/place-order
 * @access Private (User must be logged in)
 */
exports.placeOrder = async (req, res) => {
  try {
    const { type, storeId, bookId, quantity, paymentMethod, shippingAddress } =
      req.body;
    const userId = req.user.id;

    let items = [];
    let totalAmount = 0;

    // Determine order type
    if (type === "BUY_NOW") {
      ({ items, totalAmount } = await handleBuyNowOrder(bookId, quantity));
    } else if (type === "CART") {
      ({ items, totalAmount } = await handleCartOrder(userId));
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order type" });
    }

    // COD only → always start with ORDER_RECEIVED
    const paymentStatus = "PENDING";
    const orderStatus = "ORDER_RECEIVED";

    // Create Order
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

    // Push order to user
    await User.findByIdAndUpdate(userId, {
      $push: {
        orders: {
          orderId: order._id,
          status: order.status,
          placedAt: new Date(),
        },
      },
    });

    // Push order to seller
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

    // Populate books for email
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

    // Send Email Notifications
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
      error: err.message,
    });
  }
};

/**
 * @description Controller: Get All Orders for User
 * @route GET /api/order/get-all-orders
 * @access Public
 */
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate({ path: "items.book", select: "title price discountPrice" })
      .populate({ path: "store", select: "storeName storeLogo" })
      .populate({ path: "user", select: "userName email" })
      .sort({ createdAt: -1 }); // latest orders firs
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
      error: err.message,
    });
  }
};

/**
 * @description Controller: Cancel Order
 * @route PATCH /api/order/:id/cancel
 * @access Private (User must be logged in)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find order
    const order = await Order.findOne({ _id: id, user: userId }).populate([
      { path: "items.book", select: "title price" },
      { path: "user", select: "userName email" },
      { path: "store", populate: { path: "seller", select: "email" } },
    ]);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if order can be cancelled
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

    // Update order status
    order.status = "CANCELLED";
    await order.save();

    await User.updateOne(
      { _id: userId, "orders.orderId": order._id },
      { $set: { "orders.$.status": "CANCELLED" } }
    );

    await Seller.updateOne(
      { _id: order.store.seller, "orders.orderId": order._id },
      { $set: { "orders.$.status": "CANCELLED" } }
    );

    // Prepare order object for email
    const orderForEmail = {
      ...order._doc,
      items: order.items.map((item) => ({
        ...item._doc,
        bookTitle: item.book.title,
      })),
    };

    // Send emails
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
      error: err.message,
    });
  }
};
