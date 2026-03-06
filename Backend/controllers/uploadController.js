import cloudinary from '../config/cloudinary.js';
import Patient from '../Model/patientModel.js';
import User from '../Model/userModel.js';

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // File is already uploaded to Cloudinary via multer-storage-cloudinary
    const imageUrl = req.file.path;

    // Update user profile with new image
    if (req.user.role === 'patient') {
      await Patient.findOneAndUpdate(
        { email: req.user.email },
        { profileImage: imageUrl }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: imageUrl }
      );
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload document (reports, prescriptions, etc.)
// @route   POST /api/upload/document
// @access  Private (Admin, Doctor, Receptionist)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { patientId, documentType } = req.body;

    const documentUrl = req.file.path;
    const publicId = req.file.filename;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      documentUrl,
      publicId,
      documentType,
      patientId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload multiple documents
// @route   POST /api/upload/multiple
// @access  Private (Admin, Doctor, Receptionist)
export const uploadMultipleDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { patientId } = req.body;
    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      filename: file.originalname
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
      patientId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete file
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete file' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get file info
// @route   GET /api/upload/:publicId
// @access  Private
export const getFileInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      file: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};