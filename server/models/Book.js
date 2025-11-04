import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined before auto-generation
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  publisher: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Geography', 'Literature', 'Reference', 'Textbook', 'Magazine', 'Other'],
  },
  subCategory: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    default: 'English',
  },
  edition: {
    type: String,
    trim: true,
  },
  publicationYear: {
    type: Number,
  },
  numberOfPages: {
    type: Number,
  },
  price: {
    type: Number,
    default: 0,
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 1,
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1,
  },
  issuedCopies: {
    type: Number,
    default: 0,
  },
  location: {
    shelf: String,
    rack: String,
    floor: String,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String, // URL or file path
  },
  status: {
    type: String,
    enum: ['Available', 'Issued', 'Lost', 'Damaged', 'Under Repair'],
    default: 'Available',
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'Good',
  },
  acquisitionDate: {
    type: Date,
    default: Date.now,
  },
  lastIssuedDate: {
    type: Date,
  },
  tags: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Auto-generate bookId before saving
bookSchema.pre('save', async function(next) {
  if (!this.bookId) {
    const count = await mongoose.model('Book').countDocuments();
    this.bookId = `BK${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Update availableCopies when issuedCopies changes
bookSchema.pre('save', function(next) {
  this.availableCopies = this.totalCopies - this.issuedCopies;
  
  // Update status based on availability
  if (this.availableCopies === 0) {
    this.status = 'Issued';
  } else if (this.availableCopies > 0 && this.status === 'Issued') {
    this.status = 'Available';
  }
  
  next();
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ bookId: 1 });

export default mongoose.model('Book', bookSchema);

