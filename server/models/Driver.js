import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined before auto-generation
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  alternatePhone: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    street: String,
    area: String,
    city: String,
    province: String,
    postalCode: String,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  licenseExpiry: {
    type: Date,
    required: true,
  },
  licenseType: {
    type: String,
    enum: ['Light Vehicle', 'Heavy Vehicle', 'PSV', 'LTV'],
    required: true,
  },
  experience: {
    type: Number, // in years
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportRoute',
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Inactive'],
    default: 'Active',
  },
  photo: {
    type: String,
  },
  documents: [{
    documentType: {
      type: String,
      enum: ['License', 'CNIC', 'Experience Certificate', 'Police Verification', 'Medical Certificate', 'Other'],
    },
    documentPath: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  performanceRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
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

// Auto-generate driverId
driverSchema.pre('save', async function(next) {
  if (!this.driverId) {
    const count = await mongoose.model('Driver').countDocuments();
    this.driverId = `DR${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Virtual for full name
driverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
driverSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

export default mongoose.model('Driver', driverSchema);

