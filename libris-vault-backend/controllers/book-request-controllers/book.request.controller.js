const BookRequest = require("../../models/book-request-models/book.request.model");
const Store = require("../../models/store-models/store.model");
const User = require("../../models/user-models/user.model");
const {
  sendBookRequestNotificationToSeller,
  sendBookRequestStatusToUser,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Controller to create a new book request
 * @route POST /api/request/create-request
 * @access Private (User)
 */
exports.requestBook = async (req, res) => {
  try {
    const { storeId, requestedTitle, requestedAuthor, message } = req.body;
    const userId = req.user.id;

    const store = await Store.findById(storeId).populate("seller", "email");
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    const user = await User.findById(userId).select("userName email");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const request = await BookRequest.create({
      user: userId,
      store: storeId,
      requestedTitle,
      requestedAuthor,
      message,
    });

    store.bookRequests.push(request._id);
    await store.save();

    if (store.seller?.email) {
      setImmediate(async () => {
        try {
          await sendBookRequestNotificationToSeller(store.seller.email, {
            userName: user.userName,
            storeName: store.storeName,
            requestedTitle,
            requestedAuthor,
            message,
            status: request.status,
          });
        } catch (err) {
          console.error("Failed to send seller notification:", err.message);
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Book request submitted successfully",
      bookRequests: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to get all book requests for a specific store
 * @route GET /api/request/get-book-requests/:storeId
 * @access Private (Seller)
 */
exports.getRequests = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const requests = await BookRequest.find({ store: storeId })
      .populate("user", "userName email")
      .populate("store", "storeName");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to update the status of a book request
 * @route PATCH /api/request/update-book-status/:requestId
 * @access Private (Seller)
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const request = await BookRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    )
      .populate("user", "userName email")
      .populate("store", "storeName");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Book request not found",
      });
    }

    if (request.user?.email) {
      await sendBookRequestStatusToUser(request.user.email, {
        requestedTitle: request.requestedTitle,
        requestedAuthor: request.requestedAuthor,
        status: request.status,
      });
    }

    res.status(201).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      requestStatus: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
