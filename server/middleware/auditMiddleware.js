import AuditLog from "../models/AuditLog.js";

/**
 * Audit middleware to log all requests
 */
export const auditLog = (entity) => {
  return async (req, res, next) => {
    // Store original res.json and res.send
    const originalJson = res.json;
    const originalSend = res.send;

    // Track response
    let responseData = null;

    // Override res.json
    res.json = function (data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    // Override res.send
    res.send = function (data) {
      responseData = data;
      return originalSend.call(this, data);
    };

    // After response is sent
    res.on("finish", async () => {
      try {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const action = getActionFromMethod(req.method);
          
          // Skip GET requests for audit logging (too verbose)
          if (action === "read") return;

          // Extract entityId from various response structures
          const entityId = req.params.id || 
                          responseData?._id || 
                          responseData?.data?._id || 
                          null;

          // Only log if we have user, action, entity, and entityId
          if (req.user && action && entity && entityId) {
            await AuditLog.create({
              entity,
              entityId,
              action,
              user: req.user._id,
              changes: sanitizeChanges(req.body),
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get("user-agent") || "Unknown",
            });
          }
        }
      } catch (error) {
        console.error("Audit logging error:", error);
        // Don't fail the request if audit logging fails
      }
    });

    next();
  };
};

/**
 * Map HTTP methods to audit actions
 */
const getActionFromMethod = (method) => {
  const methodMap = {
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
    GET: "read",
  };
  return methodMap[method] || "unknown";
};

/**
 * Sanitize changes to remove sensitive data
 */
const sanitizeChanges = (data) => {
  if (!data) return null;

  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.resetPasswordToken;

  return sanitized;
};

/**
 * Manual audit log creation
 */
export const createAuditLog = async ({
  entity,
  entityId,
  action,
  userId,
  changes = null,
  req = null,
}) => {
  try {
    await AuditLog.create({
      entity,
      entityId,
      action,
      user: userId,
      changes: sanitizeChanges(changes),
      ipAddress: req ? req.ip || req.connection.remoteAddress : null,
      userAgent: req ? req.get("user-agent") : null,
    });
  } catch (error) {
    console.error("Manual audit log error:", error);
  }
};

export default {
  auditLog,
  createAuditLog,
};

