const BookRequest = require("../../models/book-request-models/book.request.model");
const Store = require("../../models/store-models/store.model");
const {
  sendBookRequestNotificationToSeller,
  sendBookRequestStatusToUser,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Controller to create request
 * @route POST /api/request/create-request
 * @access Public(User)
 */
exports.requestBook = async (req, res) => {
  try {
    const { storeId, requestedTitle, requestedAuthor, message } = req.body;
    const userId = req.user.id;

    const store = await Store.findById(storeId);
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
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

    // 🔔 Send email notification to seller
    if (store.email) {
      await sendBookRequestNotificationToSeller(store.email, {
        requestedTitle,
        requestedAuthor,
        message,
        status: request.status,
      });
    }

    res.status(201).json({
      success: true,
      message: "Book request submitted successfully",
      bookRequests: request,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @description Controller to get requests
 * @route GET /api/request/get-book-requests/:id
 * @access Private(Seller)
 */
exports.getRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const requests = await BookRequest.find({ store: id })
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
      error: err.message,
    });
  }
};

/**
 * @description Controller to update request status
 * @route PATCH /api/request/update-book-status/:id
 * @access Private(Seller)
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const request = await BookRequest.findByIdAndUpdate(
      id,
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

    // 🔔 Send email notification to user
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
      error: err.message,
    });
  }
};
