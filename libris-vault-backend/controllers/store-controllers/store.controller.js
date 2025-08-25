const bcrypt = require("bcrypt");
const Seller = require("../../models/seller.models/seller-model");
const Store = require("../../models/store-models/store.model");
const {
  uploadToCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");

// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------
// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------
// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------
// ------------------------------ SELLER ACTION FUNCTIONS  ----------------------------------

/**
 * @description Create a new store for the authenticated seller
 * @route POST /api/store/sellerId/create-store
 * @access Private (Seller)
 */

exports.createStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeName, storeType, address, country, storeDescription } =
      req.body;

    console.log("📥 Incoming request to create store");
    console.log("➡️ Params (sellerId):", id);
    console.log("➡️ Body:", req.body);
    console.log("➡️ Files:", req.files);

    const seller = await Seller.findById(id);
    if (!seller) {
      console.log("❌ Seller not found");
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (!seller.isPhoneVerified) {
      console.log("⚠️ Seller phone not verified");
      return res.status(403).json({
        success: false,
        message: "Phone verification required before creating a store",
      });
    }

    if (seller.store) {
      console.log("⚠️ Seller already has a store:", seller.store);
      return res.status(400).json({
        success: false,
        message:
          "You already have a store. A seller can only create one store.",
      });
    }

    if (await Store.findOne({ storeName })) {
      console.log("⚠️ Store name already exists:", storeName);
      return res
        .status(400)
        .json({ success: false, message: "Store name already exists" });
    }

    let storeLogo = null;
    if (req.files?.storeLogo && req.files.storeLogo[0]) {
      console.log("📤 Uploading store logo to Cloudinary...");
      const logoUpload = await uploadToCloudinary(
        req.files.storeLogo[0],
        "storeLogo"
      );
      storeLogo = logoUpload.url;
      console.log("✅ Store logo uploaded:", storeLogo);
    }

    let uploadedDocs = [];
    if (req.files?.documents && req.files.documents.length > 0) {
      console.log(
        `📤 Uploading ${req.files.documents.length} document(s) to Cloudinary...`
      );
      for (const file of req.files.documents) {
        const result = await uploadToCloudinary(
          file,
          "storeVerificationDocuments"
        );
        uploadedDocs.push(result.url);
        console.log("✅ Document uploaded:", result.url);
      }
    }

    const store = await Store.create({
      seller: id,
      storeLogo,
      storeName,
      storeType,
      address,
      country,
      storeDescription,
      documents: uploadedDocs,
      status: "PENDING",
      isVerified: false,
    });

    seller.store = store._id;
    await seller.save();

    console.log("✅ Store created successfully:", store._id);

    res.status(200).json({
      success: true,
      message:
        "Store created successfully and is pending approval by Super Admin.",
      store,
    });
  } catch (error) {
    console.error("❌ Error creating store:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Login to store
 * @route POST /api/store/sellerId/login-store
 * @access Public
 */
exports.loginStore = async (req, res) => {
  try {
    const { storeId, password } = req.body;

    if (!storeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Store ID and password are required",
      });
    }

    const store = await Store.findById(storeId).populate("seller");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    if (store.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          store.status === "PENDING"
            ? "Store is pending approval by Super Admin."
            : "Store is suspended. Contact support.",
      });
    }

    const seller = store.seller;
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Associated seller not found",
      });
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    store.lastLogin = new Date();
    store.sessionId = seller.sessionId;
    await store.save();

    res.json({
      success: true,
      message: "Login SuccessFully",
      store: {
        id: store._id,
        storeLogo: store.storeLogo,
        name: store.storeName,
        status: store.status,
      },
    });
  } catch (err) {
    console.error("🔥 Store login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error logging into store",
    });
  }
};

/**
 * @description Get store details
 * @route GET /api/store/sellerId/get-store-by-id/:id
 * @access Private (Seller)
 */

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 Incoming request to get store details");
    console.log("➡️ Params (storeId):", id);

    const store = await Store.findById(id).populate("seller");
    if (!store) {
      console.log("❌ Store not found");
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    console.log("✅ Store details retrieved successfully:", store._id);

    res.status(200).json({
      success: true,
      message: "Store fetched successfully",
      store,
    });
  } catch (error) {
    console.error("❌ Error retrieving store details:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
