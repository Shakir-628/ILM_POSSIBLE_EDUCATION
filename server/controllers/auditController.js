import AuditLog from "../models/AuditLog.js";

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const {
      entity,
      action,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (userId) query.user = userId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate("user", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      logs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs for specific entity
// @route   GET /api/audit/entity/:entity/:id
// @access  Private (Admin only)
export const getEntityAuditLogs = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const { limit = 20 } = req.query;

    const logs = await AuditLog.find({
      entity,
      entityId: id,
    })
      .populate("user", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs for specific user
// @route   GET /api/audit/user/:userId
// @access  Private (Admin only)
export const getUserAuditLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const total = await AuditLog.countDocuments({ user: userId });
    const logs = await AuditLog.find({ user: userId })
      .populate("user", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      logs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/audit/stats
// @access  Private (Admin only)
export const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [
      totalLogs,
      createActions,
      updateActions,
      deleteActions,
      loginActions,
      logoutActions,
      entityBreakdown,
    ] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.countDocuments({ ...query, action: "create" }),
      AuditLog.countDocuments({ ...query, action: "update" }),
      AuditLog.countDocuments({ ...query, action: "delete" }),
      AuditLog.countDocuments({ ...query, action: "login" }),
      AuditLog.countDocuments({ ...query, action: "logout" }),
      AuditLog.aggregate([
        { $match: query },
        { $group: { _id: "$entity", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalLogs,
      actionBreakdown: {
        create: createActions,
        update: updateActions,
        delete: deleteActions,
        login: loginActions,
        logout: logoutActions,
      },
      entityBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete old audit logs
// @route   DELETE /api/audit/cleanup
// @access  Private (Admin only)
export const cleanupOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query; // Default: keep 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.json({
      message: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent activity (last 24 hours)
// @route   GET /api/audit/recent
// @access  Private (Admin only)
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const logs = await AuditLog.find({
      timestamp: { $gte: last24Hours },
    })
      .populate("user", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
  getAuditStats,
  cleanupOldLogs,
  getRecentActivity,
};

