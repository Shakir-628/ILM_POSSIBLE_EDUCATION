import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RolePermission from '../models/RolePermission.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const initializePermissions = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    // Check if permissions already exist
    const existingCount = await RolePermission.countDocuments();
    
    if (existingCount > 0) {
      console.log('⚠️  Permissions already exist. Updating with Inventory module...');
      
      const inventoryModule = {
        moduleName: 'Inventory',
        enabled: true,
        submodules: [
          { name: 'Assets', enabled: true },
          { name: 'Maintenance', enabled: true },
          { name: 'Inventory Reports', enabled: true },
        ],
      };

      // Update each role
      await RolePermission.updateMany(
        { role: { $in: ['superadmin', 'admin', 'teacher'] } },
        { $addToSet: { modules: inventoryModule } }
      );
      
      console.log('✅ Permissions updated with Inventory module!');
    } else {
      console.log('📝 Creating default permissions...');

      // Default modules structure (with Inventory included)
      const defaultModules = [
        {
          moduleName: 'Dashboard',
          enabled: true,
          submodules: [],
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

      // Create permissions for each role
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
            enabled: m.moduleName !== 'System Logs',
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
      await RolePermission.insertMany(roleDefinitions);
      console.log('✅ Default permissions created successfully!');
    }

    console.log('\n🎉 All done! Inventory module is now available.');
    console.log('Refresh your browser and try accessing the Inventory menu.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

initializePermissions();

