import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

// @desc    Get school profile
// @route   GET /api/settings/school-profile
// @access  Private
export const getSchoolProfile = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();

    // If no profile exists, create default one
    if (!profile) {
      profile = await SchoolProfile.create({
        schoolName: "ILM Possible Education",
        email: "contact@ilmpossible.edu",
        phone: "0300-1234567",
        academicYear: {
          current: new Date().getFullYear().toString(),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get school profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update school profile
// @route   PUT /api/settings/school-profile
// @access  Private (Admin)
export const updateSchoolProfile = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();

    if (!profile) {
      profile = await SchoolProfile.create(req.body);
    } else {
      profile = await SchoolProfile.findByIdAndUpdate(profile._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      message: "School profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update school profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all user roles
// @route   GET /api/settings/user-roles
// @access  Private (Admin)
export const getUserRoles = async (req, res) => {
  try {
    const roles = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              isActive: "$isActive",
            },
          },
        },
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          users: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Get user roles error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/settings/user-roles/:userId
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new user
// @route   POST /api/settings/user-roles
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Authorization check
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only SuperAdmins can create other SuperAdmin accounts",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Toggle user active status
// @route   PUT /api/settings/user-roles/:userId/toggle-active
// @access  Private (Admin)
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Toggle user active error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get system statistics
// @route   GET /api/settings/system-stats
// @access  Private (Admin)
export const getSystemStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      usersByRole: await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      databaseSize: "N/A", // Would need additional setup
      lastBackup: "Never", // Would be updated when backup runs
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Trigger database backup
// @route   POST /api/settings/backup
// @access  Private (Admin)
export const triggerBackup = async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), "backups");

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupPath = path.join(backupDir, `backup_${timestamp}`);

    // MongoDB backup command (requires mongodump in PATH)
    const mongoUri = process.env.MONGO_URI;
    const dbName = mongoUri.split('/').pop().split('?')[0];

    const command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error("Backup error:", error);
        return res.status(500).json({
          success: false,
          message: "Backup failed. Make sure mongodump is installed.",
          error: error.message,
        });
      }

      // Update last backup time in school profile
      const profile = await SchoolProfile.findOne();
      if (profile) {
        profile.settings.lastBackup = new Date();
        await profile.save();
      }

      res.status(200).json({
        success: true,
        message: "Backup created successfully",
        data: {
          path: backupPath,
          timestamp,
        },
      });
    });
  } catch (error) {
    console.error("Trigger backup error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get backup list
// @route   GET /api/settings/backups
// @access  Private (Admin)
export const getBackups = async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), "backups");

    if (!fs.existsSync(backupDir)) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const backups = fs.readdirSync(backupDir).map((folder) => {
      const stats = fs.statSync(path.join(backupDir, folder));
      return {
        name: folder,
        createdAt: stats.birthtime,
        size: stats.size,
      };
    });

    res.status(200).json({
      success: true,
      data: backups.sort((a, b) => b.createdAt - a.createdAt),
    });
  } catch (error) {
    console.error("Get backups error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get system settings
// @route   GET /api/settings/system
// @access  Private (Admin)
export const getSystemSettings = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();

    if (!profile) {
      profile = await SchoolProfile.create({
        schoolName: "ILM Possible Education",
        email: "contact@ilmpossible.edu",
        phone: "0300-1234567",
        academicYear: {
          current: new Date().getFullYear().toString(),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: profile.settings || {},
    });
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings/system
// @access  Private (Admin)
export const updateSystemSettings = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "School profile not found. Please create school profile first.",
      });
    }

    // Update settings object
    profile.settings = {
      ...profile.settings,
      ...req.body,
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      data: profile.settings,
    });
  } catch (error) {
    console.error("Update system settings error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

