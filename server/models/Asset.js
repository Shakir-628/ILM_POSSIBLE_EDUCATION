import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
    },
    assetName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Furniture', 'Electronics', 'Laboratory Equipment', 'Sports Equipment', 'Vehicles', 'Books', 'Computers', 'Other'],
    },
    description: {
      type: String,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentValue: {
      type: Number,
      min: 0,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
    },
    location: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Under Maintenance', 'Retired', 'Lost', 'Damaged'],
      default: 'Active',
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Excellent',
    },
    warrantyExpiry: {
      type: Date,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    serialNumber: {
      type: String,
    },
    barcode: {
      type: String,
    },
    images: [{
      type: String,
    }],
    notes: {
      type: String,
    },
    depreciationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ location: 1 });

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

