const Promotion = require("../../models/promotion-models/promotion.model");
const Seller = require("../../models/seller.models/seller-model");
const {
  sendPromotionEmail,
} = require("../../helpers/email-helper/email.helper");

// ------------------------------ SUPER ADMIN FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN FUNCTIONS  ----------------------------------
// ------------------------------ SUPER ADMIN FUNCTIONS  ----------------------------------

/**
 * @desc Super Admin creates a system-wide promotion
 * @route POST /api/promotion/super-admin/create-promotion
 * @access Super Admin
 */
exports.createPromotion = async (req, res) => {
  try {
    const { title, description, discountPercentage, startDate, endDate } =
      req.body;

    if (!title || !discountPercentage || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Title, discountPercentage, startDate and endDate are required",
      });
    }

    const promo = new Promotion({
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      scope: "SYSTEM_WIDE",
      status: "ACTIVE",
    });

    await promo.save();

    const users = await Seller.find({}, "email");
    for (const user of users) {
      await sendPromotionEmail(user.email, promo);
    }

    res.status(201).json({
      success: true,
      message: "Promotion created successfully!",
      superAdminPromotion: promo,
    });
  } catch (error) {
    console.error("❌ Error creating system-wide promotion:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Controller to get the active system-wide promotion.
 * @route GET /api/promotion/super-admin/active-system-wide
 * @access Public
 */
exports.getActiveSystemWidePromotion = async (req, res) => {
  try {
    const now = new Date();

    const promo = await Promotion.findOne({
      scope: "SYSTEM_WIDE",
      status: "ACTIVE",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    if (!promo) {
      return res
        .status(404)
        .json({ success: false, message: "No active system-wide promotion" });
    }

    const remainingMs = promo.endDate.getTime() - now.getTime();
    const remainingSeconds =
      remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;

    let samplePrice;
    if (req.query.price) {
      const p = parseFloat(req.query.price);
      if (!Number.isNaN(p)) {
        samplePrice = +(p - (p * promo.discountPercentage) / 100).toFixed(2);
      }
    }

    res.status(201).json({
      success: true,
      promotion: {
        id: promo._id,
        title: promo.title,
        description: promo.description,
        discountPercentage: promo.discountPercentage,
        startDate: promo.startDate,
        endDate: promo.endDate,
        scope: promo.scope,
        status: promo.status,
      },
      remainingSeconds,
      samplePrice: samplePrice ?? null,
    });
  } catch (error) {
    console.error("Error fetching active system-wide promotion:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Review and approve or reject a seller-specific promotion
 * @route PATCH /api/super-admin/review-seller-promotion/:id
 * @access Private (SuperAdmin)
 */
exports.reviewSellerPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // APPROVE or REJECT

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }

    if (promotion.scope !== "SELLER_SPECIFIC") {
      return res.status(400).json({
        success: false,
        message: "Only seller-specific promotions require approval",
      });
    }

    if (action === "APPROVE") {
      promotion.status = "ACTIVE"; // ✅ activate

      // Add to seller’s promotions array
      await Seller.findByIdAndUpdate(
        promotion.sellerId,
        { $addToSet: { promotions: promotion._id } },
        { new: true }
      );

      await promotion.save();

      // 📧 Notify all users about the approved promotion
      const users = await Seller.find({}, "email");
      for (const user of users) {
        await sendPromotionEmail(user.email, promotion);
      }

      return res.json({
        success: true,
        message: "Promotion has been approved and activated",
        promotion,
      });
    } else if (action === "REJECT") {
      promotion.status = "REJECTED"; // ✅ rejected if not approved
      await promotion.save();

      return res.json({
        success: true,
        message: "Promotion has been rejected",
        promotion,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }
  } catch (error) {
    console.error("❌ Error reviewing promotion:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------ SELLER FUNCTIONS  ----------------------------------
// ------------------------------ SELLER FUNCTIONS  ----------------------------------
// ------------------------------ SELLER FUNCTIONS  ----------------------------------
// ------------------------------ SELLER FUNCTIONS  ----------------------------------

exports.createSellerPromotion = async (req, res) => {
  try {
    const {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      applicableBooks,
    } = req.body;

    const promotion = new Promotion({
      sellerId: req.user.id,
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      applicableBooks,
      scope: "SELLER_SPECIFIC",
      status: "INACTIVE", // seller cannot activate directly
    });

    await promotion.save();

    res.status(201).json({
      success: true,
      message: "Promotion created. Awaiting super admin approval.",
      sellerPromotion: promotion,
    });
  } catch (error) {
    console.error("❌ Error creating seller promotion:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
