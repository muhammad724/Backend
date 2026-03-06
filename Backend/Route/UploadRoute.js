import express from 'express';
import upload from '../middleware/upload.js';
import {
  uploadProfileImage,
  uploadDocument,
  deleteFile,
  getFileInfo
} from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile image upload
router.post('/profile-image', 
  upload.single('image'), 
  uploadProfileImage
);

// Document upload (reports, prescriptions, etc.)
router.post('/document', 
  authorize('admin', 'doctor', 'receptionist'),
  upload.single('document'), 
  uploadDocument
);

// File operations
router.delete('/:publicId', 
  authorize('admin'), 
  deleteFile
);

router.get('/:publicId', 
  getFileInfo
);

export default router;