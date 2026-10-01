const express = require('express');
const multer = require('multer');

const {
  registerDeliveryAgent,
} = require('../controllers/deliveryController');

const router = express.Router();

// Store uploaded image in memory.
// The controller will save req.file.buffer
// directly into MySQL LONGBLOB.
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only JPG, PNG and WEBP images are allowed.'
        )
      );
    }
  },
});

router.post(
  '/register',
  upload.single('profilePhoto'),
  registerDeliveryAgent
);

module.exports = router;