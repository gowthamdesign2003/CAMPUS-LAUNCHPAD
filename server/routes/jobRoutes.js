import express from 'express';
const router = express.Router();
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getJobs)
    .post(protect, admin, createJob);

router.route('/:id')
    .get(protect, getJobById)
    .put(protect, admin, updateJob)
    .delete(protect, admin, deleteJob);

export default router;
