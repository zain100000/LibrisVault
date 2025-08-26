const cron = require("node-cron");
const { cleanupPromotions } = require("../promotion/promotion.utility");

/**
 * @description Cron job to clean up expired promotions daily at midnight
 * @route N/A
 */
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running scheduled promotion cleanup...");
  await cleanupPromotions();
});

console.log("✅ Promotion cleanup cron job scheduled");
