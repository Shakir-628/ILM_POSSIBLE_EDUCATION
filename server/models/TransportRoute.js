import mongoose from 'mongoose';

const transportRouteSchema = new mongoose.Schema({
  routeId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined before auto-generation
  },
  routeName: {
    type: String,
    required: true,
    trim: true,
  },
  startPoint: {
    type: String,
    required: true,
  },
  endPoint: {
    type: String,
    required: true,
  },
  stops: [{
    stopName: String,
    stopOrder: Number,
    arrivalTime: String,
    distance: Number, // in km from start
  }],
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  totalDistance: {
    type: Number, // in km
  },
  estimatedDuration: {
    type: Number, // in minutes
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
  },
  daysActive: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  }],
  monthlyFee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  capacity: {
    type: Number,
    default: 40,
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

// Auto-generate routeId
transportRouteSchema.pre('save', async function(next) {
  if (!this.routeId) {
    const count = await mongoose.model('TransportRoute').countDocuments();
    this.routeId = `RT${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model('TransportRoute', transportRouteSchema);

