const cron = require("node-cron");
const Promotion = require("../../models/promotion-models/promotion.model");
const Seller = require("../../models/seller.models/seller-model");
const Book = require("../../models/book-models/book.model");

exports.getActiveSystemWidePromotion = async () => {
  const now = new Date();
  return await Promotion.findOne({
    scope: "SYSTEM_WIDE",
    status: "ACTIVE",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });
};

exports.getActiveSellerPromotion = async () => {
  const now = new Date();
  return await Promotion.find({
    scope: "SELLER_SPECIFIC",
    status: "ACTIVE",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });
};

exports.cleanupPromotions = async () => {
  try {
    const now = new Date();
    const expiredPromotions = await Promotion.find({ endDate: { $lt: now } });

    for (let promo of expiredPromotions) {
      if (promo.scope === "SYSTEM_WIDE") {
        console.log(`⏰ Expiring system-wide promotion: ${promo.title}`);

        const books = await Book.find({});
        for (let book of books) {
          book.discountedPrice = undefined;
          book.activePromotion = undefined;
          await book.save();
        }
      } else if (promo.scope === "SELLER_SPECIFIC") {
        console.log(`⏰ Expiring seller promotion: ${promo.title}`);

        await Seller.findByIdAndUpdate(promo.sellerId, {
          $pull: { promotions: promo._id },
        });

        const books = await Book.find({ _id: { $in: promo.applicableBooks } });
        for (let book of books) {
          book.discountedPrice = undefined;
          book.activePromotion = undefined;
          await book.save();
        }
      }

      await Promotion.findByIdAndDelete(promo._id);
    }

    if (expiredPromotions.length > 0) {
      console.log(
        `✅ Cleaned up ${expiredPromotions.length} expired promotions`
      );
    }
  } catch (error) {
    console.error("❌ Error during promotion cleanup:", error);
  }
};

cron.schedule("0 * * * *", this.cleanupPromotions);
