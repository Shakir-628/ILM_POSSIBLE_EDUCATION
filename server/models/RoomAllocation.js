import mongoose from 'mongoose';

const roomAllocationSchema = new mongoose.Schema({
  allocationId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined before auto-generation
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelRoom',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  allocationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  vacateDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Active', 'Vacated', 'Transferred'],
    default: 'Active',
  },
  bedNumber: {
    type: String,
  },
  monthlyFee: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
    default: 0,
  },
  depositPaid: {
    type: Boolean,
    default: false,
  },
  transferHistory: [{
    fromRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelRoom',
    },
    toRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelRoom',
    },
    transferDate: Date,
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  parentConsent: {
    type: Boolean,
    default: false,
  },
  medicalInfo: {
    bloodGroup: String,
    allergies: String,
    medications: String,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Auto-generate allocationId
roomAllocationSchema.pre('save', async function(next) {
  if (!this.allocationId) {
    const count = await mongoose.model('RoomAllocation').countDocuments();
    this.allocationId = `RA${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('RoomAllocation', roomAllocationSchema);

