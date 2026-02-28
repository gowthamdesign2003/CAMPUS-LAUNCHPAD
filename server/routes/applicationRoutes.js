import express from 'express';
const router = express.Router();
import { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus } from '../controllers/applicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, applyForJob);

router.route('/my').get(protect, getMyApplications);

router.route('/job/:jobId').get(protect, admin, getJobApplications);

router.route('/:id').put(protect, admin, updateApplicationStatus);

export default router;
