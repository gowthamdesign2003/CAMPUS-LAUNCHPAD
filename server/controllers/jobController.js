import asyncHandler from 'express-async-handler';
import Job from '../models/Job.js';

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = asyncHandler(async (req, res) => {
  const { companyName, role, description, package: pkg, eligibilityCriteria, deadline, interviewRounds, location, openings } = req.body;

  const job = new Job({
    companyName,
    role,
    description,
    package: pkg,
    eligibilityCriteria,
    deadline,
    interviewRounds: interviewRounds || [],
    location,
    openings,
    postedBy: req.user._id,
  });

  const createdJob = await job.save();
  res.status(201).json(createdJob);
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.aggregate([
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: 'applications'
      }
    },
    {
      $addFields: {
        applicationCount: { $size: '$applications' }
      }
    },
    {
      $project: {
        applications: 0 // Remove the applications array to keep response light
      }
    }
  ]);
  res.json(jobs);
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = asyncHandler(async (req, res) => {
  const { companyName, role, description, package: pkg, eligibilityCriteria, deadline, status, interviewRounds, location, openings } = req.body;

  const job = await Job.findById(req.params.id);

  if (job) {
    job.companyName = companyName || job.companyName;
    job.role = role || job.role;
    job.description = description || job.description;
    job.package = pkg || job.package;
    job.eligibilityCriteria = eligibilityCriteria || job.eligibilityCriteria;
    job.deadline = deadline || job.deadline;
    job.status = status || job.status;
    job.interviewRounds = interviewRounds || job.interviewRounds;
    job.location = location || job.location;
    job.openings = openings || job.openings;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

export { createJob, getJobs, getJobById, updateJob, deleteJob };
