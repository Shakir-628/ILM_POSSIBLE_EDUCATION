import AuditLog from "../models/AuditLog.js";

// Log an action
export const logAction = async ({
  entity,
  action,
  entityId = null,
  userId,
  changes = null,
  req = null,
}) => {
  try {
    const logData = {
      entity,
      action,
      user: userId,
      changes,
    };

    if (entityId) {
      logData.entityId = entityId;
    }

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get("user-agent");
    }

    const auditLog = await AuditLog.create(logData);
    return auditLog;
  } catch (error) {
    console.error("Error logging action:", error);
    // Don't throw error to avoid breaking the main operation
    return null;
  }
};

// Get audit logs
export const getAuditLogs = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 50, sort = "-timestamp" } = options;
    
    const query = {};

    if (filters.entity) query.entity = filters.entity;
    if (filters.action) query.action = filters.action;
    if (filters.userId) query.user = filters.userId;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const logs = await AuditLog.find(query)
      .populate("user", "name email role")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await AuditLog.countDocuments(query);

    return {
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    };
  } catch (error) {
    throw error;
  }
};

// Get user activity
export const getUserActivity = async (userId, limit = 20) => {
  try {
    const logs = await AuditLog.find({ user: userId })
      .sort("-timestamp")
      .limit(limit)
      .exec();

    return logs;
  } catch (error) {
    throw error;
  }
};

// Get entity history
export const getEntityHistory = async (entity, entityId) => {
  try {
    const logs = await AuditLog.find({ entity, entityId })
      .populate("user", "name email")
      .sort("-timestamp")
      .exec();

    return logs;
  } catch (error) {
    throw error;
  }
};

// Middleware to log actions
export const auditMiddleware = (entity, action) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function
    res.send = function (data) {
      // Only log if successful (status < 400)
      if (res.statusCode < 400) {
        logAction({
          entity,
          action,
          entityId: req.params.id || null,
          userId: req.user?._id,
          changes: action === "update" ? req.body : null,
          req,
        });
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

export default {
  logAction,
  getAuditLogs,
  getUserActivity,
  getEntityHistory,
  auditMiddleware,
};

