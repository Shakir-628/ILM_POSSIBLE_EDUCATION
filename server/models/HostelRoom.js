import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Triple', 'Quad', 'Dormitory'],
  },
  floor: {
    type: String,
    required: true,
  },
  building: {
    type: String,
    default: 'Main Building',
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  currentOccupancy: {
    type: Number,
    default: 0,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Mixed'],
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 0,
  },
  facilities: [{
    type: String,
    enum: ['AC', 'Heater', 'Attached Bathroom', 'Balcony', 'Study Table', 'Wardrobe', 'WiFi', 'TV', 'Refrigerator'],
  }],
  status: {
    type: String,
    enum: ['Available', 'Full', 'Under Maintenance', 'Closed'],
    default: 'Available',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  warden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
  },
  lastMaintenanceDate: {
    type: Date,
  },
  nextMaintenanceDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Auto-update status based on occupancy
hostelRoomSchema.pre('save', function(next) {
  if (this.currentOccupancy >= this.capacity) {
    this.status = 'Full';
  } else if (this.currentOccupancy === 0 && this.status === 'Full') {
    this.status = 'Available';
  }
  next();
});

export default mongoose.model('HostelRoom', hostelRoomSchema);

