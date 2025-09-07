const mongoose = require("mongoose");
const axios = require("axios");
const Inventory = require("../../models/inventory-models/inventory.model");
const Seller = require("../../models/seller-models/seller-model");
const cloudinaryUpload = require("../../utilities/cloudinary/cloudinary.utility");
const {
  getActiveSystemWidePromotion,
  getActiveSellerPromotion,
} = require("../../utilities/promotion/promotion.utility");

/**
 * @description Controller to add a new inventory item
 * @route POST /api/inventory/upload-inventory
 * @access Private (Seller)
 */
exports.uploadInventory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user || req.user.role !== "SELLER") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Unauthorized! only seller can update inventory.",
      });
    }

    const {
      title,
      author,
      price,
      stock,
      isbn,
      language,
      description,
      genre,
      publicationYear,
      publisher,
      pages,
    } = req.body;

    if (!req.files?.bookCover) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Inventory book cover image is required",
      });
    }

    const bookCoverUploadResult = await cloudinaryUpload.uploadToCloudinary(
      req.files.bookCover[0],
      "bookCover"
    );

    const inventory = new Inventory({
      bookCover: bookCoverUploadResult.url,
      title,
      author,
      price,
      stock,
      isbn,
      language,
      description,
      genre: genre ? genre.split(",") : [],
      publicationYear,
      publisher,
      pages,
      seller: req.user.id,
    });

    await inventory.save({ session });

    await Seller.findByIdAndUpdate(
      req.user.id,
      { $push: { inventory: inventory._id } },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    if (inventory.stock === 0) {
      console.error(`🚨 Inventory "${inventory.title}" is OUT OF STOCK!`);
    } else if (inventory.stock <= (inventory.lowStockThreshold || 5)) {
      console.error(
        `⚠️ Inventory "${inventory.title}" is LOW ON STOCK: ${inventory.stock}`
      );
    }

    res.status(201).json({
      success: true,
      message: "Item added successfully",
      inventory,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error adding inventory:", error);

    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(409).json({
        success: false,
        message: "Inventory with this ISBN already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get all inventory
 * @route GET api/inventory/get-all-inventory
 * @access Public
 */
exports.getAllInventory = async (req, res) => {
  try {
    let inventory = await Inventory.find().populate("seller");

    const activeSystemPromo = await getActiveSystemWidePromotion();
    const activeSellerPromos = await getActiveSellerPromotion();

    if (activeSystemPromo) {
      const discount = activeSystemPromo.discountPercentage;

      inventory = await Promise.all(
        inventory.map(async (item) => {
          const discountedPrice = (
            item.price -
            (item.price * discount) / 100
          ).toFixed(2);

          item.discountedPrice = parseFloat(discountedPrice);
          item.activePromotion = activeSystemPromo.title;
          await item.save();

          return item;
        })
      );
    } else if (activeSellerPromos && activeSellerPromos.length > 0) {
      inventory = await Promise.all(
        inventory.map(async (item) => {
          const promo = activeSellerPromos.find(
            (p) =>
              String(p.sellerId) === String(item.seller._id) &&
              p.applicableBooks.includes(item._id)
          );

          if (promo) {
            const discountedPrice = (
              item.price -
              (item.price * promo.discountPercentage) / 100
            ).toFixed(2);

            item.discountedPrice = parseFloat(discountedPrice);
            item.activePromotion = promo.title;
          } else {
            item.discountedPrice = null;
            item.activePromotion = null;
          }

          await item.save();
          return item;
        })
      );
    } else {
      inventory = await Promise.all(
        inventory.map(async (item) => {
          item.discountedPrice = null;
          item.activePromotion = null;
          await item.save();
          return item;
        })
      );
    }

    res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      inventory,
    });
  } catch (error) {
    console.error("❌ Error fetching inventory with promo:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Controller to get a single inventory item by ID
 * @route GET api/inventory/get-inventory-by-id/:inventoryId
 * @access Public
 */
exports.getInventoryById = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const inventory = await Inventory.findById(inventoryId).select("-title");
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory Not Found!",
      });
    }

    res.json({
      success: true,
      message: "Inventory Fetched Successfully",
      inventory,
    });
  } catch (err) {
    console.error("❌ Error Getting Inventory:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting Inventory!",
    });
  }
};

/**
 * @description Controller to update an inventory item by ID
 * @route PATCH api/inventory/update-inventory/:inventoryId
 * @access Private (Seller)
 */
exports.updateInventory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Seller can update inventory.",
      });
    }

    const { inventoryId } = req.params;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found!",
      });
    }

    const allowedFields = [
      "title",
      "author",
      "price",
      "stock",
      "isbn",
      "language",
      "description",
      "genre",
      "publicationYear",
      "publisher",
      "pages",
    ];

    let updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] =
          field === "genre"
            ? req.body[field]
                .split(",")
                .map((g) => g.trim())
                .filter((g) => g)
            : req.body[field];
      }
    }

    if (req.files?.bookCover) {
      const bookCoverUploadResult = await cloudinaryUpload.uploadToCloudinary(
        req.files.bookCover[0],
        "bookCover"
      );
      updates.bookCover = bookCoverUploadResult.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (updates.stock !== undefined) {
      if (updatedInventory.stock === 0) {
        console.error(
          `🚨 Inventory "${updatedInventory.title}" is OUT OF STOCK!`
        );
      } else if (
        updatedInventory.stock <= (updatedInventory.lowStockThreshold || 5)
      ) {
        console.error(
          `⚠️ Inventory "${updatedInventory.title}" is LOW ON STOCK: ${updatedInventory.stock}`
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Inventory updated successfully",
      inventory: updatedInventory,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(409).json({
        success: false,
        message: "Inventory with this ISBN already exists",
      });
    }

    console.error("❌ Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to delete an inventory item by ID
 * @route DELETE api/inventory/delete-inventory/:inventoryId
 * @access Private (Super Admin, Seller)
 */
exports.deleteInventory = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN" && req.user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized! Only Super Admins and Sellers can delete inventory.",
      });
    }

    const { inventoryId } = req.params;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory not found!" });
    }

    if (inventory.bookCover) {
      await cloudinaryUpload.deleteFromCloudinary(
        inventory.bookCover,
        "LibrisVault/bookCover"
      );
    }

    await Inventory.findByIdAndDelete(inventoryId);

    res.status(201).json({
      success: true,
      message: "Inventory deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error Deleting Inventory:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Controller to add a new inventory item using ISBN
 * @route POST api/inventory/upload-by-isbn
 * @access Private (Seller)
 */
exports.uploadInventoryByISBN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { isbn, price, stock, genre, language } = req.body;
    if (!isbn) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "ISBN number is required" });
    }

    const existingInventory = await Inventory.findOne({ isbn }).session(
      session
    );
    if (existingInventory) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: "Inventory with this ISBN already exists",
      });
    }

    let itemData = {};
    let sourceUsed = "none";

    const openLibrary = axios
      .get(`https://openlibrary.org/isbn/${isbn}.json`)
      .catch(() => null);
    const googleBooks = axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      .catch(() => null);
    const olSearch = axios
      .get(`https://openlibrary.org/search.json?q=isbn:${isbn}`)
      .catch(() => null);

    const [olRes, googleRes, olSearchRes] = await Promise.all([
      openLibrary,
      googleBooks,
      olSearch,
    ]);

    if (olRes && olRes.data && olRes.data.title) {
      itemData = olRes.data;
      sourceUsed = "Open Library";
    }
    if (
      (!itemData.title || !itemData.authors) &&
      googleRes &&
      googleRes.data.items &&
      googleRes.data.items.length > 0
    ) {
      const info = googleRes.data.items[0].volumeInfo;
      itemData = {
        ...itemData,
        title: itemData.title || info.title,
        description: itemData.description || info.description,
        publish_date: itemData.publish_date || info.publishedDate,
        publishers:
          itemData.publishers || (info.publisher ? [info.publisher] : []),
        number_of_pages: itemData.number_of_pages || info.pageCount,
        authors: itemData.authors || info.authors,
        language: itemData.language || info.language,
        categories: itemData.categories || info.categories,
      };
      sourceUsed =
        sourceUsed === "none" ? "Google Books" : sourceUsed + "+Google";
    }
    if (
      (!itemData.title || !itemData.authors) &&
      olSearchRes && // Changed from olSearch to olSearchRes
      olSearchRes.data && // Added check for data
      olSearchRes.data.docs && // Added check for docs
      olSearchRes.data.docs.length > 0
    ) {
      const doc = olSearchRes.data.docs[0];
      itemData = {
        ...itemData,
        title: itemData.title || doc.title,
        publish_date:
          itemData.publish_date ||
          (doc.first_publish_year ? doc.first_publish_year.toString() : ""),
        publishers:
          itemData.publishers || (doc.publisher ? [doc.publisher[0]] : []),
        number_of_pages: itemData.number_of_pages || doc.number_of_pages,
        authors: itemData.authors || doc.author_name,
        language: itemData.language || doc.language,
        subjects: itemData.subjects || doc.subject,
      };
      sourceUsed =
        sourceUsed === "none"
          ? "Open Library Search"
          : sourceUsed + "+OpenSearch";
    }

    const title = itemData.title || "Unknown Title";

    let author = "Unknown Author";
    if (itemData.authors && itemData.authors.length > 0) {
      const firstAuthor = itemData.authors[0];
      if (typeof firstAuthor === "object") {
        if (firstAuthor.name) {
          author = firstAuthor.name;
        } else if (firstAuthor.key) {
          try {
            const authorResponse = await axios.get(
              `https://openlibrary.org${firstAuthor.key}.json`
            );
            author = authorResponse.data.name || "Unknown Author";
          } catch {
            author = "Unknown Author";
          }
        }
      } else if (typeof firstAuthor === "string") {
        author = cleanAuthorName(firstAuthor);
      }
    } else if (itemData.by_statement) {
      author = cleanAuthorName(itemData.by_statement);
    } else if (itemData.author_name && itemData.author_name.length > 0) {
      author = cleanAuthorName(itemData.author_name[0]);
    } else if (itemData.contributors && itemData.contributors.length > 0) {
      const firstContributor = itemData.contributors[0];
      author = cleanAuthorName(
        typeof firstContributor === "object"
          ? firstContributor.name
          : firstContributor
      );
    } else if (itemData.creator) {
      if (Array.isArray(itemData.creator)) {
        author = cleanAuthorName(
          typeof itemData.creator[0] === "object"
            ? itemData.creator[0].name
            : itemData.creator[0]
        );
      } else if (typeof itemData.creator === "object") {
        author = cleanAuthorName(itemData.creator.name || "Unknown Author");
      } else {
        author = cleanAuthorName(itemData.creator);
      }
    }
    if (typeof author !== "string") {
      try {
        author = JSON.stringify(author);
      } catch {
        author = "Unknown Author";
      }
    }
    if (author === "Unknown Author" && title !== "Unknown Title") {
      const byIndex = title.toLowerCase().lastIndexOf(" by ");
      if (byIndex !== -1) {
        author = cleanAuthorName(title.substring(byIndex + 4).trim());
      } else {
        author = "Various Authors";
      }
    }

    let description = "No description available";
    if (itemData.description) {
      if (
        typeof itemData.description === "object" &&
        itemData.description.value
      ) {
        description = itemData.description.value;
      } else if (typeof itemData.description === "string") {
        description = itemData.description;
      }
    }

    const publicationYear =
      itemData.publish_date ||
      itemData.publishedDate ||
      itemData.first_publish_year ||
      "Unknown";
    const publisher =
      (itemData.publishers && itemData.publishers[0]) ||
      itemData.publisher ||
      "Unknown Publisher";
    const pages = itemData.number_of_pages || itemData.pages || 0;
    const itemLanguage =
      itemData.language ||
      language ||
      (itemData.language && itemData.language[0]) ||
      "ENGLISH";

    let genres = ["General"];
    if (genre) {
      genres = genre.split(",").map((g) => g.trim());
    } else if (itemData.genres && itemData.genres.length > 0) {
      genres = itemData.genres;
    } else if (itemData.categories && itemData.categories.length > 0) {
      genres = itemData.categories;
    } else if (itemData.subjects && itemData.subjects.length > 0) {
      genres = itemData.subjects.slice(0, 3);
    }

    if (!req.files || !req.files.bookCover) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Inventory cover image is required" });
    }

    const bookCoverFile = req.files.bookCover[0];
    const cloudinaryResult = await cloudinaryUpload.uploadToCloudinary(
      bookCoverFile,
      "bookCover"
    );

    const languageMap = {
      en: "ENGLISH",
    };

    function normalizeLanguage(lang) {
      if (!lang) return "ENGLISH";
      const lower = lang.toString().toLowerCase();
      return languageMap[lower] || "ENGLISH";
    }

    const inventory = new Inventory({
      bookCover: cloudinaryResult.url,
      title,
      author: author.substring(0, 255),
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      isbn,
      language: normalizeLanguage(itemLanguage),
      description,
      genre: genres,
      publicationYear: publicationYear.toString(),
      publisher,
      pages,
      seller: req.user.id,
      dataSource: sourceUsed,
    });

    await inventory.save({ session });
    await Seller.updateOne(
      { _id: req.user.id, inventory: null },
      { $set: { inventory: [] } },
      { session }
    );
    await Seller.findByIdAndUpdate(
      req.user.id,
      { $push: { inventory: inventory._id } },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Inventory uploaded successfully",
      inventory,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error uploading inventory by ISBN:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @description Cleans and formats author names by removing dates and reformatting "Last, First" to "First Last".
 * @param {string} author - The raw author name string.
 */
function cleanAuthorName(author) {
  if (typeof author !== "string") return author;
  author = author.replace(/,\s*\d{4}[-–]\d{4}\.?/g, "");
  author = author.replace(/,\s*\d{4}[-–]?\s*(?:present|current)?\.?/g, "");
  author = author.replace(/,\s*b\.\s*\d{4}\.?/g, "");
  author = author.replace(/[,.\s]+$/, "");
  author = author.replace(/\s+/g, " ").trim();
  const commaIndex = author.indexOf(",");
  if (commaIndex > -1) {
    const lastName = author.substring(0, commaIndex).trim();
    const firstName = author.substring(commaIndex + 1).trim();
    if (firstName && lastName) {
      author = `${firstName} ${lastName}`;
    }
  }
  return author;
}
