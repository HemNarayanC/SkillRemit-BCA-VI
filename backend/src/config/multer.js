import cloudinary from './cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

const userProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'remittance/user-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const uploadGoogleProfileImage = async (googleImageUrl, email) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(googleImageUrl, {
      folder: "remittance/user-profiles",
      public_id: `user_${email.split("@")[0]}`,
      overwrite: true,
    });
    return uploadResult.secure_url; // Cloudinary URL
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return null;
  }
};

// JobSeeker Documents (optional work verification)
const jobSeekerDocumentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'remittance/jobseeker-documents',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
  },
});

const employerDocumentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'remittance/employer-documents', // separate folder for employer
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'], // PDF and image files
  },
});

const jobImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'remittance/job-images', // separate folder for employer
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'], // PDF and image files
  },
});

// Image file filter
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(file.originalname.toLowerCase());

  if (mimeType && extName) return cb(null, true);
  cb(new Error('Only JPEG, JPG, PNG, WEBP images are allowed.'));
};

// Document file filter
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpeg|jpg|png|webp/; // allow PDF and image docs
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(file.originalname.toLowerCase());

  if (mimeType && extName) return cb(null, true);
  cb(new Error('Only PDF, JPG, JPEG, PNG, WEBP files are allowed for documents.'));
};

// For User profile image (single)
const uploadUserProfile = multer({
  storage: userProfileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: imageFileFilter,
});

// For JobSeeker documents (multiple)
const uploadJobSeekerDocuments = multer({
  storage: jobSeekerDocumentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: documentFileFilter,
});

const uploadEmployerDocuments = multer({
  storage: employerDocumentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: documentFileFilter,
});

const uploadJobImage = multer({
  storage: jobImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: imageFileFilter,
});


export {
  cloudinary,
  uploadUserProfile,
  uploadJobSeekerDocuments,
  uploadEmployerDocuments,
  uploadJobImage,
  uploadGoogleProfileImage,
};
