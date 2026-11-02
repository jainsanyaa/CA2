const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const feedbackSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: [true, "studentName is required"], trim: true },
    courseName: { type: String, required: [true, "courseName is required"], trim: true },
    message: { type: String, required: [true, "message is required"], trim: true },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "rating must be at least 1"],
      max: [5, "rating must be at most 5"],
    },
    status: { type: String, enum: ["Pending", "Reviewed"], default: "Pending" },
  },
  { timestamps: true }
);
const Feedback = mongoose.model("Feedback", feedbackSchema);
router.post("/", async (req, res) => {
  try {
    const { studentName, courseName, message, rating } = req.body;
    if (!studentName || !courseName || !message || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "studentName, courseName, message and rating are required",
      });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "rating must be a number between 1 and 5",
      });
    }
    const feedback = await Feedback.create({ studentName, courseName, message, rating });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "page and limit must be positive numbers",
      });
    }
    const skip = (page - 1) * limit;
    const [feedbacks, totalRecords] = await Promise.all([
      Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      currentPage: page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data: feedbacks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid feedback ID" });
    }
    if (!status || !["Pending", "Reviewed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be either 'Pending' or 'Reviewed'",
      });
    }
    const updated = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;