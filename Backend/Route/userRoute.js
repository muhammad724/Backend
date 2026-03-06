import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDoctors,
  updateSubscription,
  createUser
} from '../controllers/UserControllers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser); // new admin user creation

router.get('/doctors', getDoctors);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/subscription', authorize('admin'), updateSubscription);

export default router;