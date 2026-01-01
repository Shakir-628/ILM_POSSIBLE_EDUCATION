import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    maintenanceId: {
      type: String,
      required: true,
      unique: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    maintenanceType: {
      type: String,
      required: true,
      enum: ['Preventive', 'Corrective', 'Inspection', 'Repair', 'Upgrade', 'Replacement'],
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Pending'],
      default: 'Scheduled',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    partsReplaced: [{
      partName: String,
      quantity: Number,
      cost: Number,
    }],
    serviceProvider: {
      name: String,
      contact: String,
      email: String,
    },
    beforeCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    },
    afterCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    },
    notes: {
      type: String,
    },
    attachments: [{
      type: String,
    }],
    nextMaintenanceDate: {
      type: Date,
    },
    warrantyUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
maintenanceSchema.index({ asset: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ scheduledDate: 1 });
maintenanceSchema.index({ priority: 1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;

