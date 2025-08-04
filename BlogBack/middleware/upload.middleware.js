// middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');

// IMPORTANT: For production, you should use a cloud storage provider like AWS S3 or Cloudinary.
// This local storage setup is for development only.

// Configure storage location and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // The folder where files will be stored
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File type not supported. Only images and videos are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
  fileFilter: fileFilter,
});

module.exports = upload;