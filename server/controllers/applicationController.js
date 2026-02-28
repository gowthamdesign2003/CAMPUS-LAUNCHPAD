import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Student
const applyForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
      res.status(404);
      throw new Error('Job not found');
  }

  // Check if already applied
  const alreadyApplied = await Application.findOne({
      student: req.user._id,
      job: jobId
  });

  if (alreadyApplied) {
      res.status(400);
      throw new Error('You have already applied for this job');
  }

  // Strict Eligibility Check (CGPA & Department)
  const user = req.user;
  const criteria = job.eligibilityCriteria;

  // 1. Department Check
  if (criteria.department && criteria.department.length > 0) {
      if (!user.department) {
          res.status(400);
          throw new Error('Please update your profile with department details first.');
      }
      // Case-insensitive check
      const userDept = user.department.toLowerCase();
      const allowedDepts = criteria.department.map(d => d.toLowerCase());
      
      if (!allowedDepts.includes(userDept)) {
          res.status(400);
          throw new Error(`You are not eligible. This job is open for: ${criteria.department.join(', ')}`);
      }
  }

  // 2. CGPA Check
  if (criteria.cgpa) {
      if (!user.cgpa) {
           res.status(400);
           throw new Error('Please update your profile with your CGPA.');
      }
      if (Number(user.cgpa) < Number(criteria.cgpa)) {
          res.status(400);
          throw new Error(`You are not eligible. Minimum CGPA required is ${criteria.cgpa}. Your CGPA is ${user.cgpa}.`);
      }
  }

  const application = new Application({
      student: req.user._id,
      job: jobId,
      resumeLink: req.user.resumeLink || 'No Resume Link', // Fallback
      status: 'Applied'
  });

  const createdApplication = await application.save();
  res.status(201).json(createdApplication);
});

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private/Student
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id }).populate('job');
  res.json(applications);
});

// @desc    Get applications for a job (Admin)
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
const getJobApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ job: req.params.jobId }).populate('student', 'name email department cgpa resumeLink');
  res.json(applications);
});

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
  console.log('Update Application Status Request:', req.params.id, req.body);
  const application = await Application.findById(req.params.id);

  if (application) {
      application.status = req.body.status || application.status;
      if (req.body.interviewDate) {
          application.interviewDate = req.body.interviewDate;
      }

      const updatedApplication = await application.save();
      res.json(updatedApplication);
  } else {
      res.status(404);
      throw new Error('Application not found');
  }
});

export { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus };
