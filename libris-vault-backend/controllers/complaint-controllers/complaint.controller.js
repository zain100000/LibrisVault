const Complaint = require("../../models/complaint-models/complaint.model");
const {
  sendComplaintNotificationEmails,
} = require("../../helpers/email-helper/email.helper");

/**
 * @description Submit a complaint.
 * @route POST /api/complaint/submit-complaint
 * @access Private (User or Seller)
 */
exports.submitComplaint = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });
    }

    const role = req.user.role;
    const id = req.user.id;
    const email = req.user.email;
    const name = req.user.userName || req.user.userName;

    const complaint = await Complaint.create({
      raisedBy: { id, role },
      reason,
    });

    const emailResult = await sendComplaintNotificationEmails(
      {
        reason,
        complaintId: complaint._id,
        createdAt: complaint.createdAt,
      },
      email,
      role,
      name
    );

    console.log("Email notification result:", emailResult);

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
      emailSent: emailResult.userEmailSent,
    });
  } catch (err) {
    console.error("Error submitting complaint:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Get all complaints (Super Admin only).
 * @route GET /api/complaint/get-all-complaints
 * @access Private (Super Admin)
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("resolutionNotes.takenBy", "userName email");

    return res.status(200).json({
      success: true,
      message: "Complaints fetched successfully!",
      complaints,
    });
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Update a complaint's status by ID.
 * @route PATCH /api/complaint/update-complaint-status/:complaintId
 * @access Private (Super Admin)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can update complaint status.",
      });
    }

    const { complaintId } = req.params;
    const { status, note, action } = req.body;

    const allowedStatuses = ["OPENED", "IN_REVIEW", "RESOLVED", "CLOSED"];
    if (status && !allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    if (status) {
      complaint.status = status;
    }

    if (note || action) {
      complaint.resolutionNotes.push({
        action: action || "Updated",
        note: note || "",
        takenBy: req.user.id,
      });
    }

    await complaint.save();

    return res.status(201).json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (err) {
    console.error("Error updating complaint:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Update a complaint by ID.
 * @route PATCH /api/complaint/update-complaint/:complaintId
 * @access Private (User or Seller)
 */
exports.updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required to update" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    if (complaint.raisedBy.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this complaint",
      });
    }

    if (complaint.status === "IN_REVIEW") {
      return res.status(403).json({
        success: false,
        message: "Complaint cannot be updated while it is under review.",
      });
    }

    complaint.reason = reason;
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (err) {
    console.error("Error updating complaint:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Get complaints raised by the logged-in User or Seller.
 * @route GET /api/complaint/my-complaints
 * @access Private (User or Seller)
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      "raisedBy.id": req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "My complaints fetched successfully!",
      complaints,
    });
  } catch (err) {
    console.error("Error fetching user complaints:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
