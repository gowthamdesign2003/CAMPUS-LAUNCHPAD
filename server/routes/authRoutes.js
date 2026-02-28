import express from 'express';
const router = express.Router();
import { authUser, registerUser } from '../controllers/authController.js';

router.post('/register', registerUser);
router.post('/login', authUser);

export default router;
