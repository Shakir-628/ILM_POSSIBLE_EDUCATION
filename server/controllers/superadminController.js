import User from "../models/User.js";
import { createAuditLog } from "../middleware/auditMiddleware.js";

/**
 * SuperAdmin Management Controller
 * Handles all superadmin-specific operations with database-level authentication
 */

// @desc    Get all superadmins
// @route   GET /api/superadmins
// @access  Private (SuperAdmin only)
export const getAllSuperadmins = async (req, res) => {
  try {
    // Database-level verification
    const superadmins = await User.find({ role: "superadmin" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: superadmins.length,
      data: superadmins,
    });
  } catch (error) {
    console.error("Get superadmins error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get superadmin by ID
// @route   GET /api/superadmins/:id
// @access  Private (SuperAdmin only)
export const getSuperadminById = async (req, res) => {
  try {
    const { id } = req.params;

    const superadmin = await User.findById(id).select("-password");

    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin not found",
      });
    }

    // Verify role from database
    if (superadmin.role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "User is not a superadmin",
      });
    }

    res.status(200).json({
      success: true,
      data: superadmin,
    });
  } catch (error) {
    console.error("Get superadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Deactivate superadmin account
// @route   PUT /api/superadmins/:id/deactivate
// @access  Private (SuperAdmin only)
export const deactivateSuperadmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating self
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const superadmin = await User.findById(id);

    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin not found",
      });
    }

    // Verify role
    if (superadmin.role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "User is not a superadmin",
      });
    }

    superadmin.isActive = false;
    await superadmin.save();

    // Log action
    await createAuditLog({
      entity: "User",
      entityId: superadmin._id,
      action: "deactivate_superadmin",
      userId: req.user._id,
      details: { email: superadmin.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: "SuperAdmin deactivated successfully",
      data: {
        _id: superadmin._id,
        name: superadmin.name,
        email: superadmin.email,
        isActive: superadmin.isActive,
      },
    });
  } catch (error) {
    console.error("Deactivate superadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Activate superadmin account
// @route   PUT /api/superadmins/:id/activate
// @access  Private (SuperAdmin only)
export const activateSuperadmin = async (req, res) => {
  try {
    const { id } = req.params;

    const superadmin = await User.findById(id);

    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin not found",
      });
    }

    // Verify role
    if (superadmin.role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "User is not a superadmin",
      });
    }

    superadmin.isActive = true;
    await superadmin.save();

    // Log action
    await createAuditLog({
      entity: "User",
      entityId: superadmin._id,
      action: "activate_superadmin",
      userId: req.user._id,
      details: { email: superadmin.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: "SuperAdmin activated successfully",
      data: {
        _id: superadmin._id,
        name: superadmin.name,
        email: superadmin.email,
        isActive: superadmin.isActive,
      },
    });
  } catch (error) {
    console.error("Activate superadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update superadmin profile
// @route   PUT /api/superadmins/:id
// @access  Private (SuperAdmin only)
export const updateSuperadmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const superadmin = await User.findById(id);

    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin not found",
      });
    }

    // Verify role
    if (superadmin.role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "User is not a superadmin",
      });
    }

    // Check if new email is already taken (if changed)
    if (email && email !== superadmin.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Update fields
    if (name) superadmin.name = name;
    if (email) superadmin.email = email;
    if (phone) superadmin.phone = phone;
    if (address) superadmin.address = address;

    const updatedSuperadmin = await superadmin.save();

    // Log action
    await createAuditLog({
      entity: "User",
      entityId: superadmin._id,
      action: "update_superadmin",
      userId: req.user._id,
      details: { email: superadmin.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: "SuperAdmin updated successfully",
      data: {
        _id: updatedSuperadmin._id,
        name: updatedSuperadmin.name,
        email: updatedSuperadmin.email,
        phone: updatedSuperadmin.phone,
        address: updatedSuperadmin.address,
        isActive: updatedSuperadmin.isActive,
      },
    });
  } catch (error) {
    console.error("Update superadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete superadmin account (permanent)
// @route   DELETE /api/superadmins/:id
// @access  Private (SuperAdmin only)
export const deleteSuperadmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const superadmin = await User.findById(id);

    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin not found",
      });
    }

    // Verify role
    if (superadmin.role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "User is not a superadmin",
      });
    }

    const deletedEmail = superadmin.email;
    await User.findByIdAndDelete(id);

    // Log action
    await createAuditLog({
      entity: "User",
      entityId: id,
      action: "delete_superadmin",
      userId: req.user._id,
      details: { email: deletedEmail },
      req,
    });

    res.status(200).json({
      success: true,
      message: "SuperAdmin deleted successfully",
      data: {
        deletedId: id,
        email: deletedEmail,
      },
    });
  } catch (error) {
    console.error("Delete superadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify superadmin role (database-level check)
// @route   GET /api/superadmins/:id/verify
// @access  Private (SuperAdmin only)
export const verifySuperadminRole = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("role isActive");

    if (!user) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "User not found",
      });
    }

    const isSuperadmin = user.role === "superadmin" && user.isActive;

    res.status(200).json({
      success: true,
      verified: isSuperadmin,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Verify superadmin error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: error.message,
    });
  }
};
