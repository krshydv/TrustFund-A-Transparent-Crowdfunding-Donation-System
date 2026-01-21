const { upload } = require('../config/cloudinary');

// Single image upload
exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'Error uploading file'
        });
      }
      next();
    });
  };
};

// Multiple images upload
exports.uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'Error uploading files'
        });
      }
      next();
    });
  };
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  const { cloudinary } = require('../config/cloudinary');
  
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};