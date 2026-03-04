import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  resumeLink: {
      type: String,
      required: false // Changed to false as it was causing issues during updates if missing
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied',
  },
  interviewDate: {
      type: Date
  },
  interviewSlots: {
      type: [{
          roundName: { type: String, required: true },
          date: { type: Date },
          time: { type: String },
          link: { type: String }
      }],
      default: []
  }
}, {
  timestamps: true,
  strict: true
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
