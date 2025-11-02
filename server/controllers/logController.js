import Log from "../models/Log.js";

// @desc    Get all logs with filters
// @route   GET /api/logs
// @access  Private (Superadmin only)
export const getAllLogs = async (req, res) => {
  try {
    const {
      level,
      category,
      user,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (level) filter.level = level;
    if (category) filter.category = category;
    if (user) filter.user = user;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search in message
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await Log.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Log.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: logs,
    });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get log statistics
// @route   GET /api/logs/stats
// @access  Private (Superadmin only)
export const getLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get counts by level
    const levelStats = await Log.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]);

    // Get counts by category
    const categoryStats = await Log.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Get error rate
    const totalRequests = await Log.countDocuments(dateFilter);
    const errorRequests = await Log.countDocuments({
      ...dateFilter,
      level: { $in: ["error", "critical"] },
    });
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    // Get average response time
    const avgResponseTime = await Log.aggregate([
      { $match: { ...dateFilter, responseTime: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$responseTime" } } },
    ]);

    // Get most active users
    const topUsers = await Log.aggregate([
      { $match: { ...dateFilter, user: { $exists: true } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 1,
          count: 1,
          email: "$userInfo.email",
          name: "$userInfo.name",
          role: "$userInfo.role",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLogs: totalRequests,
        errorRate: errorRate.toFixed(2),
        averageResponseTime: avgResponseTime[0]?.avg?.toFixed(2) || 0,
        levelStats: levelStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        categoryStats: categoryStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topUsers,
      },
    });
  } catch (error) {
    console.error("Get log stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete old logs
// @route   DELETE /api/logs/cleanup
// @access  Private (Superadmin only)
export const cleanupLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Log.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} logs older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup logs error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete specific log
// @route   DELETE /api/logs/:id
// @access  Private (Superadmin only)
export const deleteLog = async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Log deleted successfully",
    });
  } catch (error) {
    console.error("Delete log error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

