import mongoose from 'mongoose';

const jobSchema = mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  description: {
      type: String,
      required: true
  },
  package: {
    type: String,
    required: true,
  },
  eligibilityCriteria: {
    cgpa: {
        type: Number,
        required: true
    },
    department: [String], // Allowed departments
    skills: [String], // Required skills
  },
  interviewRounds: [{
      roundName: { type: String, required: true },
      date: { type: Date },
      time: { type: String },
      link: { type: String }
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  deadline: {
      type: Date,
      required: true
  },
  status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
  }
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
