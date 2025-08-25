const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const path = require("path");
require("dotenv").config();

/**
 * @description Configure Cloudinary with credentials from environment variables
 * Keep credentials outside of code for security
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @description Multer in-memory storage (prevents temp file leaks on disk)
 */
const storage = multer.memoryStorage();

/**
 * @description Allowed file types
 */
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const allowedPdfTypes = ["application/pdf"];

/**
 * @description File filter to allow only specific file types (images + PDFs)
 */
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new Error("No file uploaded."), false);
  }

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedPdfTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "❌ Invalid file type. Only image (JPG, PNG, WEBP) and PDF files are allowed."
      ),
      false
    );
  }
};

/**
 * @description Multer middleware to handle file uploads securely
 * Limits file size to prevent DoS attacks
 */
exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "bookCover", maxCount: 1 },
  { name: "storeLogo", maxCount: 1 },
  { name: "documents", maxCount: 3 },
]);

/**
 * @description Middleware to check if files are uploaded
 */
exports.checkUploadedFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }
  next();
};

/**
 * @description Uploads a file buffer to Cloudinary
 */
exports.uploadToCloudinary = async (file, type, existingPublicId = null) => {
  const baseFolder = "LibrisVault";
  let folder = baseFolder;

  switch (type) {
    case "profilePicture":
      folder += "/profilePictures";
      break;
    case "bookCover":
      folder += "/bookCovers";
      break;
    case "storeLogo":
      folder += "/storeLogos";
      break;
    case "storeVerificationDocuments":
      folder += "/storeVerificationDocuments";
      break;
    default:
      throw new Error("Invalid file type");
  }

  try {
    let public_id;

    if (existingPublicId) {
      public_id = existingPublicId;
    } else {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      public_id = `${folder}/${timestamp}-${Math.round(Math.random() * 1e6)}${ext}`;
    }

    let resourceType = "image";
    if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    const fileBuffer = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(fileBuffer, {
      public_id: public_id,
      resource_type: resourceType,
      overwrite: true,
    });

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error("❌ Error Uploading to Cloudinary:", error);
    throw new Error("Error uploading to Cloudinary");
  }
};

/**
 * @description Deletes a file from Cloudinary using its URL or public_id
 */
exports.deleteFromCloudinary = async (fileUrlOrId) => {
  try {
    let publicId = fileUrlOrId;

    if (fileUrlOrId.startsWith("http")) {
      const matches = fileUrlOrId.match(
        /\/(?:image|raw)\/upload\/(?:v\d+\/)?([^?]+)/
      );
      if (!matches || matches.length < 2) {
        console.error(
          `❌ Failed to extract public ID from URL: ${fileUrlOrId}`
        );
        return;
      }
      publicId = matches[1].replace(/\.[^.]+$/, "");
    }

    const resourceType = fileUrlOrId.includes("/raw/") ? "raw" : "image";

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok") {
      console.error(`❌ Cloudinary Deletion Failed for: ${publicId}`);
    } else {
      console.log(`✅ Successfully deleted: ${publicId}`);
    }
  } catch (error) {
    console.error("❌ Error Deleting from Cloudinary:", error);
    throw new Error("Cloudinary Deletion Failed");
  }
};
