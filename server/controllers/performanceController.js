import PerformanceReview from "../models/PerformanceReview.js";
import Teacher from "../models/Teacher.js";

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Private (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { teacherId, academicYear, status } = req.query;
    const filter = {};

    if (teacherId) filter.teacher = teacherId;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    const reviews = await PerformanceReview.find(filter)
      .populate("teacher", "firstName lastName teacherId email")
      .populate("reviewedBy", "name email")
      .sort({ reviewDate: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single review
// @route   GET /api/performance/:id
// @access  Private
export const getReviewById = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate("teacher", "firstName lastName teacherId email phone")
      .populate("reviewedBy", "name email");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create performance review
// @route   POST /api/performance
// @access  Private (Admin)
export const createReview = async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      reviewedBy: req.user._id,
    };

    const review = await PerformanceReview.create(reviewData);

    await review.populate("teacher", "firstName lastName teacherId email");
    await review.populate("reviewedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Performance review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private (Admin)
export const updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const updatedReview = await PerformanceReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("teacher", "firstName lastName teacherId email")
      .populate("reviewedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete performance review
// @route   DELETE /api/performance/:id
// @access  Private (Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get teacher performance statistics
// @route   GET /api/performance/stats/:teacherId
// @access  Private
export const getTeacherStats = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find({ teacher: req.params.teacherId });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          averageScore: 0,
          latestReview: null,
        },
      });
    }

    const avgScore = reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length;

    res.status(200).json({
      success: true,
      data: {
        totalReviews: reviews.length,
        averageScore: avgScore.toFixed(2),
        latestReview: reviews[reviews.length - 1],
        reviewHistory: reviews.map((r) => ({
          date: r.reviewDate,
          score: r.overallScore,
          term: r.reviewPeriod.term,
        })),
      },
    });
  } catch (error) {
    console.error("Get teacher stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

