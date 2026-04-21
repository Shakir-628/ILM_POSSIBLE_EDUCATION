import mongoose from "mongoose";

const onlineClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 40,
  },
  meetingId: {
    type: String,
    required: true,
    unique: true,
  },
  meetingLink: {
    type: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  description: {
    type: String,
  },
  recordings: [{
    title: String,
    url: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

const OnlineClass = mongoose.model('OnlineClass', onlineClassSchema);

export default OnlineClass;
