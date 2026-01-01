import mongoose from 'mongoose';

const bookIssueSchema = new mongoose.Schema({
  issueId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined before auto-generation
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  actualReturnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Overdue', 'Lost', 'Damaged'],
    default: 'Issued',
  },
  fine: {
    amount: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      enum: ['Overdue', 'Damaged', 'Lost', 'Late Return', 'None'],
      default: 'None',
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paidDate: {
      type: Date,
    },
  },
  condition: {
    atIssue: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor'],
      default: 'Good',
    },
    atReturn: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
    },
  },
  notes: {
    type: String,
    trim: true,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  renewalCount: {
    type: Number,
    default: 0,
  },
  renewalHistory: [{
    date: Date,
    newDueDate: Date,
    renewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
}, {
  timestamps: true,
});

// Auto-generate issueId before saving
bookIssueSchema.pre('save', async function (next) {
  if (!this.issueId) {
    const count = await mongoose.model('BookIssue').countDocuments();
    this.issueId = `ISS${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate fine for overdue books
bookIssueSchema.methods.calculateFine = function () {
  if (this.status === 'Returned' && this.fine.paid) {
    return 0;
  }

  const today = new Date();
  const dueDate = new Date(this.dueDate);

  if (today > dueDate && this.status !== 'Returned') {
    const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
    const finePerDay = 5; // PKR 5 per day
    this.fine.amount = daysOverdue * finePerDay;
    this.fine.reason = 'Overdue';
    this.status = 'Overdue';
  }

  return this.fine.amount;
};

// Auto-update status based on dates
bookIssueSchema.pre('save', function (next) {
  const today = new Date();
  const dueDate = new Date(this.dueDate);

  if (this.actualReturnDate) {
    this.status = 'Returned';
  } else if (today > dueDate && this.status === 'Issued') {
    this.status = 'Overdue';
    this.calculateFine();
  }

  next();
});

// Indexes
bookIssueSchema.index({ book: 1, student: 1 });
bookIssueSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('BookIssue', bookIssueSchema);

