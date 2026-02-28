import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'student',
    immutable: true, // Cannot change role
  },
  department: String,
  year: String,
  mobile: String,
  cgpa: Number,
  tenthPercentage: Number,
  twelfthPercentage: Number,
  diplomaPercentage: Number,
  resumeLink: String,
  skills: [String],
  isVerified: {
      type: Boolean,
      default: false // Admin needs to verify student
  }
}, {
  timestamps: true,
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Student = mongoose.model('Student', studentSchema);

export default Student;