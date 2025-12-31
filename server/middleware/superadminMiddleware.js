import User from "../models/User.js";

/**
 * SuperAdmin-Only Middleware
 * Ensures only users with superadmin role can access the route
 * Includes database-level verification
 */
export const superadminOnly = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first.",
      });
    }

    // Verify user role from memory
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: `Access denied. SuperAdmin role required. Your role: ${req.user.role}`,
      });
    }

    // Database-level verification: Verify role in database
    const dbUser = await User.findById(req.user._id).select("role isActive");

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "User not found in database",
      });
    }

    // Check if user is active in database
    if (!dbUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Verify role from database matches
    if (dbUser.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin role not found in database. Access denied.",
      });
    }

    // Update req.user with fresh database data to ensure consistency
    req.user.role = dbUser.role;
    req.user.isActive = dbUser.isActive;

    next();
  } catch (error) {
    console.error("SuperAdmin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authorization",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Superadmin or Admin Middleware
 * Allows both superadmin and admin roles
 */
export const superadminOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!["superadmin", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. SuperAdmin or Admin role required. Your role: ${req.user.role}`,
      });
    }

    // Database-level verification
    const dbUser = await User.findById(req.user._id).select("role isActive");

    if (!dbUser || !dbUser.isActive || !["superadmin", "admin"].includes(dbUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Authorization failed: Role verification failed in database",
      });
    }

    req.user.role = dbUser.role;
    next();
  } catch (error) {
    console.error("SuperAdmin/Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authorization",
    });
  }
};
