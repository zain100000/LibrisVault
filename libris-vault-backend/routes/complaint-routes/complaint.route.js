const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const complaintController = require("../../controllers/complaint-controllers/complaint.controller");

/**
 * @description Route to submit a new complaint.
 */
router.post(
  "/submit-complaint",
  authMiddleware,
  complaintController.submitComplaint
);

/**
 * @description Route to get all complaints (Super Admin only).
 */
router.get(
  "/get-all-complaint",
  authMiddleware,
  complaintController.getAllComplaints
);

/**
 * @description Route to get complaints raised by the logged-in user or seller.
 */
router.get(
  "/my-complaint",
  authMiddleware,
  complaintController.getMyComplaints
);

/**
 * @description Route for a Super Admin to update the status of a complaint.
 */
router.patch(
  "/update-complaint-status/:complaintId",
  authMiddleware,
  complaintController.updateComplaintStatus
);

/**
 * @description Route for a user or seller to edit their own complaint.
 */
router.patch(
  "/update-complaint/:complaintId",
  authMiddleware,
  complaintController.updateComplaint
);

module.exports = router;
