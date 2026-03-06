import express from "express";
import { getAdminStats, toggleSubscription, getAllUsers } from '../controllers/AdminControllers.js';
import { createUser } from '../controllers/UserControllers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes below this line
router.use(protect);
// role check is now case-insensitive, 'admin' alone is sufficient
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
// user management
router.route('/users')
  .get(getAllUsers)
  .post(createUser); // create new staff or patient

router.patch('/upgrade-subscription/:id', toggleSubscription);

export default router;