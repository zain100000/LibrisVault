const User = require("../../models/user-models/user.model");
const Inventory = require("../../models/book-models/book.model");
const {
  getActiveSystemWidePromotion,
  getActiveSellerPromotion,
} = require("../../utilities/promotion/promotion.utility");

/**
 * @description Calculate discounted price for a product
 * @param {Object} product - Product object
 * @param {Object} systemWidePromo - Active system-wide promotion
 * @param {Array} sellerPromotions - Active seller promotions
 * @returns {Object} Object with finalPrice and appliedPromotion
 */
const calculateDiscountedPrice = (
  product,
  systemWidePromo,
  sellerPromotions
) => {
  let finalPrice = product.price;
  let appliedPromotion = null;

  const sellerPromo = sellerPromotions.find(
    (promo) =>
      promo.sellerId.toString() === product.seller.toString() &&
      (!promo.applicableBooks ||
        promo.applicableBooks.length === 0 ||
        promo.applicableBooks.includes(product._id.toString()))
  );

  if (sellerPromo) {
    finalPrice =
      product.price - (product.price * sellerPromo.discountPercentage) / 100;
    appliedPromotion = sellerPromo;
  } else if (systemWidePromo) {
    finalPrice =
      product.price -
      (product.price * systemWidePromo.discountPercentage) / 100;
    appliedPromotion = systemWidePromo;
  }

  return {
    finalPrice: Math.round(finalPrice * 100) / 100,
    appliedPromotion,
  };
};

/**
 * @description Controller to add product to cart (increases quantity by 1 each call)
 * @route /api/cart/add-to-cart
 * @access Public
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const product = await Inventory.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [systemWidePromo, sellerPromotions] = await Promise.all([
      getActiveSystemWidePromotion(),
      getActiveSellerPromotion(),
    ]);

    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + 1;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items left in stock. You already have ${user.cart[existingItemIndex].quantity} in cart.`,
        });
      }

      user.cart[existingItemIndex].quantity = newQuantity;

      const { finalPrice } = calculateDiscountedPrice(
        product,
        systemWidePromo,
        sellerPromotions
      );
      user.cart[existingItemIndex].unitPrice = finalPrice;
      user.cart[existingItemIndex].price = newQuantity * finalPrice;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }

      const { finalPrice } = calculateDiscountedPrice(
        product,
        systemWidePromo,
        sellerPromotions
      );

      user.cart.push({
        productId,
        quantity: 1,
        price: finalPrice,
        unitPrice: finalPrice,
      });
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate({
      path: "cart.productId",
      select: "title author price bookCover stock discountedPrice seller",
    });

    const { totalPrice, totalItems, totalDiscount, originalTotal } =
      await calculateCartTotals(updatedUser.cart);

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: updatedUser.cart,
      totalPrice,
      totalItems,
      totalDiscount,
      originalTotal,
      cartCount: updatedUser.cart.length,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Controller to remove product from cart (decreases quantity by 1)
 * @route /api/cart/remove-from-cart
 * @access Public
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const product = await Inventory.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const [systemWidePromo, sellerPromotions] = await Promise.all([
      getActiveSystemWidePromotion(),
      getActiveSellerPromotion(),
    ]);

    if (user.cart[existingItemIndex].quantity > 1) {
      user.cart[existingItemIndex].quantity -= 1;

      const { finalPrice } = calculateDiscountedPrice(
        product,
        systemWidePromo,
        sellerPromotions
      );
      user.cart[existingItemIndex].unitPrice = finalPrice;
      user.cart[existingItemIndex].price =
        user.cart[existingItemIndex].quantity * finalPrice;
    } else {
      user.cart.splice(existingItemIndex, 1);
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate({
      path: "cart.productId",
      select: "title author price bookCover stock discountedPrice seller",
    });

    const { totalPrice, totalItems, totalDiscount, originalTotal } =
      await calculateCartTotals(updatedUser.cart);

    res.status(200).json({
      success: true,
      message: "Product quantity updated in cart",
      cart: updatedUser.cart,
      totalPrice,
      totalItems,
      totalDiscount,
      originalTotal,
      cartCount: updatedUser.cart.length,
    });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Calculate cart totals with promotions
 * @param {Array} cart - Cart items array
 * @returns {Object} Total price, items, discount, and original total
 */
const calculateCartTotals = async (cart) => {
  const [systemWidePromo, sellerPromotions] = await Promise.all([
    getActiveSystemWidePromotion(),
    getActiveSellerPromotion(),
  ]);

  let totalPrice = 0;
  let originalTotal = 0;
  let totalItems = 0;

  for (const item of cart) {
    const product = item.productId;
    const { finalPrice } = calculateDiscountedPrice(
      product,
      systemWidePromo,
      sellerPromotions
    );

    totalPrice += item.quantity * finalPrice;
    originalTotal += item.quantity * product.price;
    totalItems += item.quantity;
  }

  const totalDiscount = originalTotal - totalPrice;

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalItems,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    originalTotal: Math.round(originalTotal * 100) / 100,
  };
};

/**
 * @description Controller to get all cart items
 * @route /api/cart/get-cart
 * @access Public
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "cart.productId",
      select: "title author price bookCover stock discountedPrice seller",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { totalPrice, totalItems, totalDiscount, originalTotal } =
      await calculateCartTotals(user.cart);

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      cart: user.cart,
      totalPrice,
      totalItems,
      totalDiscount,
      originalTotal,
      cartCount: user.cart.length,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/**
 * @description Controller to clear entire cart
 * @route /api/cart/clear-cart
 * @access Public
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
      totalPrice: 0,
      totalItems: 0,
      totalDiscount: 0,
      originalTotal: 0,
      cartCount: 0,
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
