import Log from "../models/Log.js";

// Logging middleware to track all requests
export const requestLogger = async (req, res, next) => {
  const startTime = Date.now();

  // Capture original send function
  const originalSend = res.send;

  // Override send function to log response
  res.send = function (data) {
    res.send = originalSend; // Restore original send
    const responseTime = Date.now() - startTime;

    // Log the request
    logRequest(req, res, responseTime, data);

    return res.send(data);
  };

  next();
};

// Function to log request details
const logRequest = async (req, res, responseTime, responseData) => {
  try {
    // Parse response data if it's JSON
    let parsedData;
    try {
      parsedData = typeof responseData === "string" ? JSON.parse(responseData) : responseData;
    } catch (e) {
      parsedData = {};
    }

    const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    const success = res.statusCode < 400;

    // Determine category based on URL
    let category = "api";
    if (req.path.includes("/auth")) category = "auth";
    else if (req.path.includes("/students") || req.path.includes("/teachers")) category = "user-action";
    else if (req.path.includes("/grades") || req.path.includes("/attendance")) category = "user-action";

    // Extract action from method and path
    const action = `${req.method} ${req.path}`;

    const logData = {
      level: logLevel,
      message: `${req.method} ${req.path} - ${res.statusCode} (${responseTime}ms)`,
      category,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      user: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("user-agent"),
      action,
      success,
      metadata: {
        query: req.query,
        params: req.params,
        // Don't log sensitive data like passwords
        body: sanitizeBody(req.body),
      },
    };

    // If error, capture error details
    if (!success && parsedData.message) {
      logData.errorCode = parsedData.code || "UNKNOWN";
      logData.errorStack = parsedData.stack;
    }

    await Log.create(logData);
  } catch (error) {
    // Silently fail logging to not affect the request
    console.error("Logging error:", error.message);
  }
};

// Sanitize request body to remove sensitive data
const sanitizeBody = (body) => {
  if (!body) return {};

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "secret", "apiKey", "creditCard"];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "***REDACTED***";
    }
  });

  return sanitized;
};

// Function to manually log events
export const logEvent = async (data) => {
  try {
    await Log.create(data);
  } catch (error) {
    console.error("Manual logging error:", error.message);
  }
};

// Log error with details
export const logError = async (error, req, metadata = {}) => {
  try {
    await Log.create({
      level: "error",
      message: error.message || "Unknown error",
      category: "error",
      errorStack: error.stack,
      errorCode: error.code || "UNKNOWN",
      user: req?.user?._id,
      userEmail: req?.user?.email,
      userRole: req?.user?.role,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get("user-agent"),
      url: req?.originalUrl,
      method: req?.method,
      success: false,
      metadata,
    });
  } catch (logError) {
    console.error("Error logging error:", logError.message);
  }
};

export default requestLogger;

