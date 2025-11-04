import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined before auto-generation
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Bus', 'Van', 'Mini Bus', 'Car'],
  },
  manufacturer: {
    type: String,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
  },
  color: {
    type: String,
    trim: true,
  },
  seatingCapacity: {
    type: Number,
    required: true,
    default: 40,
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  insuranceDetails: {
    company: String,
    policyNumber: String,
    expiryDate: Date,
    amount: Number,
  },
  fitnessDetails: {
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
  },
  purchaseDate: {
    type: Date,
  },
  purchasePrice: {
    type: Number,
  },
  currentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportRoute',
  },
  status: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Out of Service', 'Inactive'],
    default: 'Active',
  },
  lastServiceDate: {
    type: Date,
  },
  nextServiceDate: {
    type: Date,
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    default: 'Diesel',
  },
  averageMileage: {
    type: Number, // km per liter
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

// Auto-generate vehicleId
vehicleSchema.pre('save', async function(next) {
  if (!this.vehicleId) {
    const count = await mongoose.model('Vehicle').countDocuments();
    this.vehicleId = `VH${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model('Vehicle', vehicleSchema);

