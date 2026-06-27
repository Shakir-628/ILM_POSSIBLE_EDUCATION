import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RolePermission from '../models/RolePermission.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const newModules = [
  {
    moduleName: 'Account Management',
    enabled: true,
    submodules: [
      { name: 'Income', enabled: true },
      { name: 'Expenses', enabled: true },
      { name: 'Payroll', enabled: true },
      { name: 'Fee Intelligence', enabled: true },
    ],
  },
  {
    moduleName: 'Learning Management (LMS)',
    enabled: true,
    submodules: [
      { name: 'Resource Library', enabled: true },
      { name: 'Online Assignments', enabled: true },
      { name: 'Online Classes', enabled: true },
      { name: 'E-Portfolio', enabled: true },
    ],
  },
  {
    moduleName: 'Library',
    enabled: true,
    submodules: [
      { name: 'Books Catalog', enabled: true },
      { name: 'Issue/Return', enabled: true },
      { name: 'Library Members', enabled: true },
    ],
  },
  {
    moduleName: 'Transport & Hostel',
    enabled: true,
    submodules: [
      { name: 'Transport Routes', enabled: true },
      { name: 'Vehicle Tracking', enabled: true },
      { name: 'Hostel Rooms', enabled: true },
      { name: 'Room Allocation', enabled: true },
    ],
  }
];

const initializePermissions = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    // 1. Update existing roles with new modules
    console.log('🔄 Updating existing roles with new LMS and Accounting modules...');
    for (const mod of newModules) {
      await RolePermission.updateMany(
        { role: { $in: ['superadmin', 'admin'] } },
        { $addToSet: { modules: mod } }
      );
    }

    // 2. Specialized module updates for specific roles
    await RolePermission.updateOne(
      { role: 'teacher' },
      { $addToSet: { modules: newModules[1] } } // LMS
    );

    await RolePermission.updateOne(
      { role: 'student' },
      { $addToSet: { modules: newModules[1] } } // LMS
    );

    // 3. Create missing roles
    const rolesToCreate = [
      {
        role: 'accountant',
        displayName: 'Accountant',
        description: 'Financial management and fee intelligence',
        modules: [
          { moduleName: 'Dashboard', enabled: true, submodules: [] },
          { moduleName: 'Fees', enabled: true, submodules: [] },
          { moduleName: 'Account Management', enabled: true, submodules: newModules[0].submodules },
          { moduleName: 'Reports', enabled: true, submodules: [{ name: 'Financial Reports', enabled: true }] },
        ],
        isActive: true,
      },
      {
        role: 'librarian',
        displayName: 'Librarian',
        description: 'Managing school library and resources',
        modules: [
          { moduleName: 'Dashboard', enabled: true, submodules: [] },
          { moduleName: 'Library', enabled: true, submodules: newModules[2].submodules },
          { moduleName: 'Students', enabled: true, submodules: [{ name: 'All Students', enabled: true }] },
        ],
        isActive: true,
      },
      {
        role: 'receptionist',
        displayName: 'Receptionist',
        description: 'Front desk and initial admissions handling',
        modules: [
          { moduleName: 'Dashboard', enabled: true, submodules: [] },
          { moduleName: 'Students', enabled: true, submodules: [{ name: 'Admissions', enabled: true }] },
          { moduleName: 'Communication', enabled: true, submodules: [{ name: 'Announcements', enabled: true }] },
          { moduleName: 'Events & Calendar', enabled: true, submodules: [] },
        ],
        isActive: true,
      },
      {
        role: 'subadmin',
        displayName: 'Sub Administrator',
        description: 'Limited administrative access',
        modules: [
          { moduleName: 'Dashboard', enabled: true, submodules: [] },
          { moduleName: 'Students', enabled: true, submodules: [{ name: 'All Students', enabled: true }] },
          { moduleName: 'Academic', enabled: true, submodules: [] },
          { moduleName: 'Attendance', enabled: true, submodules: [] },
        ],
        isActive: true,
      }
    ];

    for (const roleDef of rolesToCreate) {
      const exists = await RolePermission.findOne({ role: roleDef.role });
      if (!exists) {
        await RolePermission.create(roleDef);
        console.log(`✅ Created role: ${roleDef.displayName}`);
      } else {
        console.log(`ℹ️ Role ${roleDef.displayName} already exists.`);
      }
    }

    console.log('\n🎉 Role permissions updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing permissions:', error);
    process.exit(1);
  }
};

initializePermissions();
