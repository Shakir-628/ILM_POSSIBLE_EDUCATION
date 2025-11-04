import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RolePermission from '../models/RolePermission.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const updateInventoryPermissions = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('📝 Updating role permissions to include Inventory module...');

    const inventoryModule = {
      moduleName: 'Inventory',
      enabled: true,
      submodules: [
        { name: 'Assets', enabled: true },
        { name: 'Maintenance', enabled: true },
        { name: 'Inventory Reports', enabled: true },
      ],
    };

    // Update SuperAdmin
    await RolePermission.findOneAndUpdate(
      { role: 'superadmin' },
      { 
        $addToSet: { 
          modules: inventoryModule 
        }
      }
    );
    console.log('✅ SuperAdmin permissions updated');

    // Update Admin
    await RolePermission.findOneAndUpdate(
      { role: 'admin' },
      { 
        $addToSet: { 
          modules: inventoryModule 
        }
      }
    );
    console.log('✅ Admin permissions updated');

    // Update Teacher (with Inventory access)
    await RolePermission.findOneAndUpdate(
      { role: 'teacher' },
      { 
        $addToSet: { 
          modules: inventoryModule 
        }
      }
    );
    console.log('✅ Teacher permissions updated');

    console.log('\n🎉 All role permissions updated successfully!');
    console.log('You can now access the Inventory module.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    process.exit(1);
  }
};

updateInventoryPermissions();

