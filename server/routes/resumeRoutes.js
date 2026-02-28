import express from 'express';
const router = express.Router();
import { analyzeResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

router.post('/analyze', protect, upload.single('resume'), analyzeResume);

export default router;
