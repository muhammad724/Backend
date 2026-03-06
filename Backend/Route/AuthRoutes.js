import express from 'express';
import { register, login, getMe } from '../controllers/AuthControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', protect, getMe);

export default router;