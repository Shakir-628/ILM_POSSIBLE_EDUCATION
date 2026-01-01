import RolePermission from '../models/RolePermission.js';

// @desc    Get all role permissions
// @route   GET /api/role-permissions
// @access  Private (SuperAdmin, Admin)
export const getAllRolePermissions = async (req, res) => {
  try {
    const permissions = await RolePermission.find().sort({ role: 1 });
    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('Get all role permissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get role permissions by role
// @route   GET /api/role-permissions/:role
// @access  Private
export const getRolePermissionByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const permission = await RolePermission.findOne({ role });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Role permissions not found',
      });
    }

    res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    console.error('Get role permission error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create or update role permissions
// @route   POST /api/role-permissions
// @access  Private (SuperAdmin, Admin)
export const upsertRolePermission = async (req, res) => {
  try {
    const { role, displayName, description, modules, isActive } = req.body;

    if (!role || !displayName || !modules) {
      return res.status(400).json({
        success: false,
        message: 'Role, displayName, and modules are required',
      });
    }

    const permission = await RolePermission.findOneAndUpdate(
      { role },
      {
        role,
        displayName,
        description,
        modules,
        isActive,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Role permissions updated successfully',
      data: permission,
    });
  } catch (error) {
    console.error('Upsert role permission error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update module visibility for a role
// @route   PATCH /api/role-permissions/:role/modules
// @access  Private (SuperAdmin, Admin)
export const updateModuleVisibility = async (req, res) => {
  try {
    const { role } = req.params;
    const { moduleName, enabled, submoduleName, submoduleEnabled } = req.body;

    const permission = await RolePermission.findOne({ role });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Role permissions not found',
      });
    }

    // Find the module
    const moduleIndex = permission.modules.findIndex(m => m.moduleName === moduleName);
    
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Update module or submodule
    if (submoduleName) {
      // Update submodule
      const submoduleIndex = permission.modules[moduleIndex].submodules.findIndex(
        s => s.name === submoduleName
      );
      
      if (submoduleIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Submodule not found',
        });
      }
      
      permission.modules[moduleIndex].submodules[submoduleIndex].enabled = submoduleEnabled;
    } else {
      // Update module
      permission.modules[moduleIndex].enabled = enabled;
    }

    await permission.save();

    res.status(200).json({
      success: true,
      message: 'Module visibility updated successfully',
      data: permission,
    });
  } catch (error) {
    console.error('Update module visibility error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Initialize default role permissions
// @route   POST /api/role-permissions/initialize
// @access  Private (SuperAdmin)
export const initializeDefaultPermissions = async (req, res) => {
  try {
    // Check if permissions already exist
    const existingCount = await RolePermission.countDocuments();
    
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role permissions already initialized',
      });
    }

    // Default modules structure
    const defaultModules = [
      {
        moduleName: 'Dashboard',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'AI Exams',
        enabled: true,
        submodules: [
          { name: 'Create Exam', enabled: true },
          { name: 'Manage Exams', enabled: true },
          { name: 'View Results', enabled: true },
          { name: 'Generate Questions', enabled: true },
          { name: 'Take Exam', enabled: true }
        ],
      },
      {
        moduleName: 'Students',
        enabled: true,
        submodules: [
          { name: 'All Students', enabled: true },
          { name: 'Admissions', enabled: true },
          { name: 'Documents', enabled: true },
        ],
      },
      {
        moduleName: 'Teachers',
        enabled: true,
        submodules: [
          { name: 'All Teachers', enabled: true },
          { name: 'Performance Review', enabled: true },
          { name: 'Payroll', enabled: true },
        ],
      },
      {
        moduleName: 'Parents',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'Classes',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'Academic',
        enabled: true,
        submodules: [
          { name: 'Timetable', enabled: true },
          { name: 'Assignments', enabled: true },
          { name: 'Subjects', enabled: true },
        ],
      },
      {
        moduleName: 'Attendance',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'Examinations',
        enabled: true,
        submodules: [
          { name: 'Exam Schedule', enabled: true },
          { name: 'Grades & Marks', enabled: true },
          { name: 'Report Cards', enabled: true },
          { name: 'Exam Analytics', enabled: true },
        ],
      },
      {
        moduleName: 'Fees',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'Events & Calendar',
        enabled: true,
        submodules: [
          { name: 'School Events', enabled: true },
          { name: 'Academic Calendar', enabled: true },
        ],
      },
      {
        moduleName: 'Communication',
        enabled: true,
        submodules: [
          { name: 'Announcements', enabled: true },
          { name: 'Messages', enabled: true },
          { name: 'Notifications', enabled: true },
        ],
      },
      {
        moduleName: 'Analytics',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'Inventory',
        enabled: true,
        submodules: [
          { name: 'Assets', enabled: true },
          { name: 'Maintenance', enabled: true },
          { name: 'Inventory Reports', enabled: true },
        ],
      },
      {
        moduleName: 'Reports',
        enabled: true,
        submodules: [
          { name: 'Student Reports', enabled: true },
          { name: 'Attendance Reports', enabled: true },
          { name: 'Financial Reports', enabled: true },
          { name: 'Custom Reports', enabled: true },
        ],
      },
      {
        moduleName: 'Settings',
        enabled: true,
        submodules: [
          { name: 'School Profile', enabled: true },
          { name: 'User Roles', enabled: true },
          { name: 'Backup & Security', enabled: true },
          { name: 'System Settings', enabled: true },
        ],
      },
      {
        moduleName: 'System Logs',
        enabled: true,
        submodules: [],
      },
      {
        moduleName: 'Audit Logs',
        enabled: true,
        submodules: [],
      },
    ];

    // Create default permissions for each role
    const roleDefinitions = [
      {
        role: 'superadmin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        modules: defaultModules,
        isActive: true,
      },
      {
        role: 'admin',
        displayName: 'Administrator',
        description: 'School administration with most permissions',
        modules: defaultModules.map(m => ({
          ...m,
          enabled: m.moduleName !== 'System Logs', // Admins can't see system logs
        })),
        isActive: true,
      },
      {
        role: 'teacher',
        displayName: 'Teacher',
        description: 'Teaching staff with limited permissions',
        modules: defaultModules.map(m => ({
          ...m,
          enabled: ['Dashboard', 'Students', 'Classes', 'Academic', 'Attendance', 'Examinations', 'Communication', 'Inventory', 'Reports', 'Analytics'].includes(m.moduleName),
          submodules: m.submodules.filter(s => 
            !['Admissions', 'Payroll', 'Performance Review', 'User Roles', 'System Settings', 'Backup & Security', 'Financial Reports'].includes(s.name)
          ),
        })).filter(m => m.enabled),
        isActive: true,
      },
      {
        role: 'student',
        displayName: 'Student',
        description: 'Student access to view information',
        modules: [
          { moduleName: 'Dashboard', enabled: true, submodules: [] },
          { moduleName: 'Academic', enabled: true, submodules: [{ name: 'Timetable', enabled: true }, { name: 'Assignments', enabled: true }] },
          { moduleName: 'Attendance', enabled: true, submodules: [] },
          { moduleName: 'Examinations', enabled: true, submodules: [{ name: 'Grades & Marks', enabled: true }, { name: 'Report Cards', enabled: true }] },
          { moduleName: 'Fees', enabled: true, submodules: [] },
          { moduleName: 'Events & Calendar', enabled: true, submodules: [{ name: 'Academic Calendar', enabled: true }] },
          { moduleName: 'Communication', enabled: true, submodules: [{ name: 'Announcements', enabled: true }, { name: 'Messages', enabled: true }] },
        ],
        isActive: true,
      },
      {
        role: 'parent',
        displayName: 'Parent',
        description: 'Parent access to view child information',
        modules: [
          { moduleName: 'Dashboard', enabled: true, submodules: [] },
          { moduleName: 'Students', enabled: true, submodules: [] },
          { moduleName: 'Attendance', enabled: true, submodules: [] },
          { moduleName: 'Examinations', enabled: true, submodules: [{ name: 'Grades & Marks', enabled: true }, { name: 'Report Cards', enabled: true }] },
          { moduleName: 'Fees', enabled: true, submodules: [] },
          { moduleName: 'Events & Calendar', enabled: true, submodules: [{ name: 'Academic Calendar', enabled: true }] },
          { moduleName: 'Communication', enabled: true, submodules: [{ name: 'Announcements', enabled: true }, { name: 'Messages', enabled: true }] },
        ],
        isActive: true,
      },
    ];

    // Insert all role permissions
    const permissions = await RolePermission.insertMany(roleDefinitions);

    res.status(201).json({
      success: true,
      message: 'Default role permissions initialized successfully',
      data: permissions,
    });
  } catch (error) {
    console.error('Initialize default permissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete role permissions
// @route   DELETE /api/role-permissions/:role
// @access  Private (SuperAdmin)
export const deleteRolePermission = async (req, res) => {
  try {
    const { role } = req.params;

    // Prevent deletion of essential roles
    if (['superadmin', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete essential roles',
      });
    }

    const permission = await RolePermission.findOneAndDelete({ role });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Role permissions not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Role permissions deleted successfully',
    });
  } catch (error) {
    console.error('Delete role permission error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

