import express from 'express';
const router = express.Router();
import { getUserProfile, updateUserProfile, getUsers, getStudentPlacementStatus, getCareerRecommendations, getCareerRoadmap } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('resume'), updateUserProfile);

router.route('/recommendations').get(protect, getCareerRecommendations);
router.route('/roadmap/:roleId').get(protect, getCareerRoadmap);
router.route('/status').get(protect, admin, getStudentPlacementStatus);
router.route('/').get(protect, admin, getUsers);

export default router;
