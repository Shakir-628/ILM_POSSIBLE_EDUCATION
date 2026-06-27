import mongoose from 'mongoose';

const modulePermissionSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  submodules: [{
    name: String,
    enabled: {
      type: Boolean,
      default: true,
    },
  }],
  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
});

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true, // This already creates an index
      enum: ['superadmin', 'admin', 'subadmin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'receptionist'],
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    modules: [modulePermissionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: Index already created by unique: true above
// rolePermissionSchema.index({ role: 1 }); // REMOVED - duplicate

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

export default RolePermission;

