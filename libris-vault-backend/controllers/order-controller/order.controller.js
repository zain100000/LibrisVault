const Order = require("../../models/order.models/order.model");
const Book = require("../../models/book-models/book.model");
const User = require("../../models/user-models/user.model");
const Store = require("../../models/store-models/store.model");
const Seller = require("../../models/seller-models/seller-model");
const {
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToSeller,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Helper functions
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

  // clear cart after placing order
  user.cart = [];
  await user.save();

  return { items, totalAmount };
};

/**
 * @description Controller for placing the order (Direct + Indirect Order)
 * @route POST /api/order/place-order
 * @access Private (user must be logged in)
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

    let paymentStatus = "PENDING";
    let orderStatus = "ORDER_RECEIVED";

    if (paymentMethod === "CASH_ON_DELIVERY") {
      paymentStatus = "PENDING";
      orderStatus = "ORDER_RECEIVED";
    }

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
    await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

    // Push order to seller
    const store = await Store.findById(storeId).populate("seller");
    if (store) {
      await Seller.findByIdAndUpdate(store.seller._id, {
        $push: { orders: order._id },
      });
    }

    // -------------------------
    // 📧 Send Email Notifications
    // -------------------------
    const user = await User.findById(userId);
    await sendOrderConfirmationToUser(user.email, order);

    if (store && store.seller) {
      await sendNewOrderNotificationToSeller(store.seller.email, order, user);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully & email notifications sent",
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
